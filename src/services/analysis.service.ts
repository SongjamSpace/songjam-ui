import { User } from './db/spaces.service';
import {
  SpaceAnalysis,
  SpeakerInteraction,
  SpeakerTimeline,
  TopicSegment,
} from '../types/analysis.types';
import { generateContent } from './ai.service';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase.service';

// Cache for analyses to avoid regenerating
const analysisCache = new Map<string, SpaceAnalysis>();

interface AnalysisConfig {
  interactionTypes: {
    directMentions: boolean;
    sequentialResponses: boolean;
    topicBased: boolean;
    timeProximity: boolean;
  };
  strengthMetrics: {
    frequency: boolean;
    duration: boolean;
    topicOverlap: boolean;
    sentiment: boolean;
    responseTime: boolean;
  };
  timeWindow: number;
  topicOverlapThreshold: number;
}

/**
 * Generates a comprehensive analysis of a space from its transcript
 */
export const analyzeTranscript = async (
  spaceId: string,
  transcript: string,
  speakers: User[],
  config?: AnalysisConfig
): Promise<SpaceAnalysis> => {
  // If no config provided, use default settings (direct mentions only)
  const analysisConfig = config || {
    interactionTypes: {
      directMentions: true,
      sequentialResponses: false,
      topicBased: false,
      timeProximity: false,
    },
    strengthMetrics: {
      frequency: true,
      duration: false,
      topicOverlap: false,
      sentiment: true,
      responseTime: false,
    },
    timeWindow: 30,
    topicOverlapThreshold: 0.5,
  };

  // Only use cache if using default config (direct mentions only)
  const isDefaultConfig =
    !config ||
    (config.interactionTypes.directMentions &&
      !config.interactionTypes.sequentialResponses &&
      !config.interactionTypes.topicBased &&
      !config.interactionTypes.timeProximity &&
      config.strengthMetrics.frequency &&
      !config.strengthMetrics.duration &&
      !config.strengthMetrics.topicOverlap &&
      config.strengthMetrics.sentiment &&
      !config.strengthMetrics.responseTime &&
      config.timeWindow === 30 &&
      config.topicOverlapThreshold === 0.5);

  if (isDefaultConfig && analysisCache.has(spaceId)) {
    return analysisCache.get(spaceId)!;
  }

  // Check if analysis exists in Firestore (only for default config)
  if (isDefaultConfig) {
    try {
      const analysisDoc = await getDoc(
        doc(db, 'spaces', spaceId, 'analysis', 'v1')
      );
      if (analysisDoc.exists()) {
        const analysis = analysisDoc.data() as SpaceAnalysis;
        analysisCache.set(spaceId, analysis);
        return analysis;
      }
    } catch (error) {
      console.error('Error fetching analysis from Firestore:', error);
    }
  }

  // Generate analysis with Claude
  console.log('Generating space analysis with Claude...', {
    config: analysisConfig,
  });

  const speakerInfo = speakers
    .map(
      (s) =>
        `${s.display_name} (ID: ${s.user_id}, Twitter: @${s.twitter_screen_name})`
    )
    .join('\n');

  const configInstructions = `
Analysis Configuration:
1. Interaction Types to detect:
   ${analysisConfig.interactionTypes.directMentions ? '- Direct mentions and explicit responses' : ''}
   ${analysisConfig.interactionTypes.sequentialResponses ? '- Sequential responses within ${analysisConfig.timeWindow} seconds' : ''}
   ${analysisConfig.interactionTypes.topicBased ? '- Speakers discussing the same topics' : ''}
   ${analysisConfig.interactionTypes.timeProximity ? '- Speakers talking in close time proximity' : ''}

2. Interaction Strength Metrics to include:
   ${analysisConfig.strengthMetrics.frequency ? '- Frequency of interaction' : ''}
   ${analysisConfig.strengthMetrics.duration ? '- Duration of interaction' : ''}
   ${analysisConfig.strengthMetrics.topicOverlap ? '- Topic overlap (threshold: ${analysisConfig.topicOverlapThreshold})' : ''}
   ${analysisConfig.strengthMetrics.sentiment ? '- Sentiment analysis' : ''}
   ${analysisConfig.strengthMetrics.responseTime ? '- Response time between speakers' : ''}
`;

  const prompt = `
I need to generate a comprehensive analysis of this Twitter Space conversation.
The conversation transcript is enclosed between triple backticks.
The speakers in this conversation are:

${speakerInfo}

${configInstructions}

\`\`\`
${transcript}
\`\`\`

Please analyze this conversation according to the configuration above and return the results as a JSON object with the following structure:

{
  "interactions": [
    {
      "fromSpeakerId": "user_id of speaker",
      "toSpeakerId": "user_id of speaker being addressed",
      "count": Number of times this interaction occurred,
      "sentiment": "positive", "neutral", or "negative",
      "topics": ["topic1", "topic2"],
      "duration": total duration of interactions in seconds (if enabled),
      "responseTime": average response time in seconds (if enabled),
      "topicOverlapScore": 0-1 score of topic similarity (if enabled)
    }
  ],
  "timeline": [
    {
      "speakerId": "user_id",
      "segments": [
        {
          "startTime": approximate time in seconds from start,
          "endTime": approximate end time in seconds,
          "text": "what they said",
          "sentiment": "positive", "neutral", or "negative",
          "topics": ["topic1", "topic2"]
        }
      ]
    }
  ],
  "topics": [
    {
      "topic": "Name of topic",
      "startTime": approximate start time in seconds,
      "endTime": approximate end time in seconds,
      "speakers": ["user_id1", "user_id2"],
      "summary": "Brief summary of discussion on this topic"
    }
  ],
  "summary": "Overall summary of the conversation"
}

Make sure to:
1. Base timeline start/end times on relative positioning in the transcript
2. Only include interactions based on the configured interaction types
3. Calculate interaction strengths using the configured metrics
4. Identify the main topics discussed
5. Return ONLY the JSON object, no additional text
`;

  try {
    let analysisText = '';
    let jsonContent = '';
    let parsingStarted = false;

    // Generate with streaming
    await generateContent('claude', prompt, '', (chunk: string) => {
      // Only start accumulating once we see the start of JSON
      if (chunk.includes('{')) {
        parsingStarted = true;
      }

      if (parsingStarted) {
        jsonContent += chunk;
      }

      analysisText += chunk;
    });

    // Try to parse the accumulated JSON content first
    try {
      const analysis = JSON.parse(jsonContent) as SpaceAnalysis;

      // Only cache and store in Firestore if using default config
      if (isDefaultConfig) {
        await setDoc(doc(db, 'spaces', spaceId, 'analysis', 'v1'), analysis);
        analysisCache.set(spaceId, analysis);
      }

      return analysis;
    } catch (parseError) {
      // If that fails, try to find a JSON object in the full response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Unable to parse analysis response');
      }

      const analysis = JSON.parse(jsonMatch[0]) as SpaceAnalysis;

      // Only cache and store in Firestore if using default config
      if (isDefaultConfig) {
        await setDoc(doc(db, 'spaces', spaceId, 'analysis', 'v1'), analysis);
        analysisCache.set(spaceId, analysis);
      }

      return analysis;
    }
  } catch (error) {
    console.error('Error generating space analysis:', error);

    // Return empty analysis as fallback
    return {
      interactions: [],
      timeline: [],
      topics: [],
      summary: 'Failed to generate analysis.',
    };
  }
};

/**
 * Returns the sentiment color for visualization
 */
export const getSentimentColor = (
  sentiment: 'positive' | 'neutral' | 'negative'
): string => {
  switch (sentiment) {
    case 'positive':
      return '#4ade80'; // green
    case 'neutral':
      return '#60a5fa'; // blue
    case 'negative':
      return '#f87171'; // red
    default:
      return '#60a5fa'; // blue
  }
};

/**
 * Formats seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

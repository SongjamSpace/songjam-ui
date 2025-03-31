export interface SpeakerInteraction {
  fromSpeakerId: string;
  toSpeakerId: string;
  count: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  // Optional metrics based on analysis configuration
  duration?: number;  // Total duration of interactions in seconds
  responseTime?: number;  // Average response time in seconds
  topicOverlapScore?: number;  // 0-1 score of topic similarity
}

export interface SpeakerTimeline {
  speakerId: string;
  segments: {
    startTime: number;
    endTime: number;
    text: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
  }[];
}

export interface TopicSegment {
  topic: string;
  startTime: number;
  endTime: number;
  speakers: string[];
  summary: string;
}

export interface SpaceAnalysis {
  interactions: SpeakerInteraction[];
  timeline: SpeakerTimeline[];
  topics: TopicSegment[];
  summary: string;
}

export interface AnalysisConfig {
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
  timeWindow: number;  // seconds
  topicOverlapThreshold: number;  // 0-1
} 
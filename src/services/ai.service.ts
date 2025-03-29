import axios from 'axios';

export interface AIModel {
  id: string;
  name: string;
  capabilities: string[];
  contextWindow: number;
  specialFeatures: string[];
}

export interface AIResponse {
  text: string;
  error?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gemini',
    name: 'Gemini Pro',
    capabilities: ['Advanced reasoning', 'Multimodal understanding', 'Code generation'],
    contextWindow: 32768,
    specialFeatures: ['Image analysis', 'Code completion'],
  },
  {
    id: 'grok',
    name: 'Grok',
    capabilities: ['Real-time data', 'Technical analysis', 'Interactive learning'],
    contextWindow: 50000,
    specialFeatures: ['Web browsing', 'Data visualization'],
  },
  {
    id: 'claude',
    name: 'Claude',
    capabilities: ['Long context', 'Creative writing', 'Detailed analysis'],
    contextWindow: 200000,
    specialFeatures: ['Code generation', 'Document analysis'],
  },
];

export const generateContent = async (
  modelId: string,
  prompt: string,
  context?: string
): Promise<AIResponse> => {
  try {
    switch (modelId) {
      case 'gemini':
        return await generateWithGemini(prompt, context);
      case 'grok':
        return await generateWithGrok(prompt, context);
      case 'claude':
        return await generateWithClaude(prompt, context);
      default:
        throw new Error(`Unsupported model: ${modelId}`);
    }
  } catch (error: any) {
    return {
      text: '',
      error: error.message || 'Failed to generate content'
    };
  }
};

const generateWithGemini = async (prompt: string, context?: string): Promise<AIResponse> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY.trim();
  const baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:generateContent';
  const url = `${baseUrl}?key=${apiKey}`;

  console.log('Making request to Gemini API:', {
    url,
    prompt,
    context,
    apiKeyLength: apiKey.length
  });

  try {
    const response = await axios.post(
      url,
      {
        contents: [{
          parts: [{
            text: context ? `${context}\n\n${prompt}` : prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Gemini API response:', response.data);
    return {
      text: response.data.candidates[0].content.parts[0].text
    };
  } catch (error: any) {
    console.error('Gemini API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      error: error.message
    });
    throw error;
  }
};

const generateWithGrok = async (prompt: string, context?: string): Promise<AIResponse> => {
  if (!import.meta.env.VITE_GROK_API_KEY) {
    throw new Error('Grok API key is missing');
  }

  console.log('Making request to Grok API:', {
    prompt,
    context,
    apiKeyLength: import.meta.env.VITE_GROK_API_KEY.length
  });

  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt }
        ],
        model: 'grok-2-latest',
        stream: false,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROK_API_KEY}`,
        },
      }
    );

    console.log('Grok API response:', response.data);
    return {
      text: response.data.choices[0].message.content
    };
  } catch (error: any) {
    console.error('Grok API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.message
    });
    throw error;
  }
};

const generateWithClaude = async (prompt: string, context?: string): Promise<AIResponse> => {
  if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key is missing');
  }

  console.log('Making request to Claude API:', {
    prompt,
    context,
    apiKeyLength: import.meta.env.VITE_ANTHROPIC_API_KEY.length
  });

  try {
    const response = await axios.post(
      'http://localhost:3001/api/claude',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: context || 'You are a helpful AI assistant.',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }
    );

    console.log('Claude API response:', response.data);
    return {
      text: response.data.content[0].text
    };
  } catch (error: any) {
    console.error('Claude API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.message
    });
    throw error;
  }
}; 
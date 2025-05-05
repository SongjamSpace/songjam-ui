import { getDynamicToken } from '../utils';

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
  isStreaming?: boolean;
}

export interface AIStreamCallback {
  (chunk: string): void;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gemini',
    name: 'Gemini Pro',
    capabilities: [
      'Advanced reasoning',
      'Multimodal understanding',
      'Code generation',
    ],
    contextWindow: 32768,
    specialFeatures: ['Image analysis', 'Code completion'],
  },
  {
    id: 'grok',
    name: 'Grok',
    capabilities: [
      'Real-time data',
      'Technical analysis',
      'Interactive learning',
    ],
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
  context?: string,
  onStream?: AIStreamCallback
): Promise<AIResponse> => {
  try {
    switch (modelId) {
      case 'gemini':
        return await generateWithGemini(prompt, context, onStream);
      case 'grok':
        return await generateWithGrok(prompt, context, onStream);
      case 'claude':
        return await generateWithClaude(prompt, context, onStream);
      default:
        throw new Error(`Unsupported model: ${modelId}`);
    }
  } catch (error: any) {
    return {
      text: '',
      error: error.message || 'Failed to generate content',
    };
  }
};

const generateWithGemini = async (
  prompt: string,
  context?: string,
  onStream?: AIStreamCallback,
  retryCount = 0
): Promise<AIResponse> => {
  try {
    const token = getDynamicToken();
    if (!token) {
      throw new Error('No token found');
    }
    const response = await fetch(
      `${import.meta.env.VITE_JAM_SERVER_URL}/api/gemini/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: context ? `${context}\n\n${prompt}` : prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let fullText = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices?.[0]?.delta?.content) {
              const content = parsed.choices[0].delta.content;
              fullText += content;
              onStream?.(content);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }

    return {
      text: fullText,
      isStreaming: false,
    };
  } catch (error: any) {
    console.error('Gemini API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.message,
    });
    throw error;
  }
};

const generateWithGrok = async (
  prompt: string,
  context?: string,
  onStream?: AIStreamCallback
): Promise<AIResponse> => {
  try {
    const token = getDynamicToken();
    if (!token) {
      throw new Error('No token found');
    }
    const response = await fetch(
      `${import.meta.env.VITE_JAM_SERVER_URL}/api/grok/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            ...(context ? [{ role: 'system', content: context }] : []),
            { role: 'user', content: prompt },
          ],
          model: 'grok-2-latest',
          stream: true,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let fullText = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices?.[0]?.delta?.content) {
              const content = parsed.choices[0].delta.content;
              fullText += content;
              onStream?.(content);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }

    return {
      text: fullText,
      isStreaming: false,
    };
  } catch (error: any) {
    console.error('Grok API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.message,
    });
    throw error;
  }
};

const generateWithClaude = async (
  prompt: string,
  context?: string,
  onStream?: AIStreamCallback
): Promise<AIResponse> => {
  try {
    const token = getDynamicToken();
    if (!token) {
      throw new Error('No token found');
    }
    console.log('Sending request to streaming endpoint');
    const response = await fetch(
      `${import.meta.env.VITE_JAM_SERVER_URL}/api/claude/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: context || 'You are a helpful AI assistant.',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      console.error('Stream response not OK:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Got response from streaming endpoint');
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let fullText = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('Stream reading complete');
        break;
      }

      const chunk = decoder.decode(value);
      console.log('Received chunk:', chunk);
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          console.log('Processing data line:', data);
          if (data === '[DONE]') {
            console.log('Received [DONE] signal');
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            console.log('Parsed JSON:', parsed);

            // Handle different event types
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              const content = parsed.delta.text;
              console.log('Extracted content:', content);
              fullText += content;
              onStream?.(content);
            } else if (parsed.type === 'message_delta' && parsed.delta?.text) {
              const content = parsed.delta.text;
              console.log('Extracted message content:', content);
              fullText += content;
              onStream?.(content);
            }
          } catch (e) {
            console.error('Error parsing Claude chunk:', {
              error: e,
              data,
            });
          }
        }
      }
    }

    console.log('Stream processing complete, full text:', fullText);
    return {
      text: fullText,
      isStreaming: false,
    };
  } catch (error: any) {
    console.error('Claude API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

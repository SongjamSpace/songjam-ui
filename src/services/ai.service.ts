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
  isStreaming?: boolean;
}

export interface AIStreamCallback {
  (chunk: string): void;
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
      error: error.message || 'Failed to generate content'
    };
  }
};

const RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithGemini = async (
  prompt: string, 
  context?: string,
  onStream?: AIStreamCallback,
  retryCount = 0
): Promise<AIResponse> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY.trim();
  const baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:streamGenerateContent';
  const url = `${baseUrl}?key=${apiKey}`;

  console.log('Making request to Gemini API:', {
    url,
    prompt,
    context,
    apiKeyLength: apiKey.length,
    retryCount
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: context ? `${context}\n\n${prompt}` : prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Gemini API error response:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });

      // Handle rate limiting
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        const retryAfter = response.headers.get('Retry-After') || RETRY_DELAY;
        console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
        await sleep(Number(retryAfter));
        return generateWithGemini(prompt, context, onStream, retryCount + 1);
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let fullText = '';
    const decoder = new TextDecoder();
    let buffer = '';
    let currentObject = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      buffer += chunk;

      // Process complete JSON objects
      let startIndex = 0;
      let bracketCount = 0;
      let inString = false;
      let escapeNext = false;

      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') {
            if (bracketCount === 0) {
              startIndex = i;
            }
            bracketCount++;
          } else if (char === '}') {
            bracketCount--;
            if (bracketCount === 0) {
              const jsonStr = buffer.slice(startIndex, i + 1);
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed?.candidates?.[0]?.content?.parts?.[0]?.text) {
                  const content = parsed.candidates[0].content.parts[0].text;
                  fullText += content;
                  onStream?.(content);
                }
              } catch (e) {
                console.error('Error parsing JSON object:', {
                  error: e,
                  jsonStr
                });
              }
              buffer = buffer.slice(i + 1);
              i = -1;
            }
          }
        }
      }
    }

    return {
      text: fullText,
      isStreaming: false
    };
  } catch (error: any) {
    console.error('Gemini API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      error: error.message
    });

    // Handle rate limiting in catch block as well
    if (error.message.includes('429') && retryCount < MAX_RETRIES) {
      console.log(`Rate limited. Retrying after ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return generateWithGemini(prompt, context, onStream, retryCount + 1);
    }

    throw error;
  }
};

const generateWithGrok = async (
  prompt: string, 
  context?: string,
  onStream?: AIStreamCallback
): Promise<AIResponse> => {
  if (!import.meta.env.VITE_GROK_API_KEY) {
    throw new Error('Grok API key is missing');
  }

  console.log('Making request to Grok API:', {
    prompt,
    context,
  });

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROK_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          ...(context ? [{ role: 'system', content: context }] : []),
          { role: 'user', content: prompt }
        ],
        model: 'grok-2-latest',
        stream: true,
        temperature: 0.7,
      }),
    });

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
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

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
      isStreaming: false
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

const generateWithClaude = async (
  prompt: string, 
  context?: string,
  onStream?: AIStreamCallback
): Promise<AIResponse> => {
  if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key is missing');
  }

  console.log('Making request to Claude API:', {
    prompt,
    context,
    apiKeyLength: import.meta.env.VITE_ANTHROPIC_API_KEY.length
  });

  try {
    console.log('Sending request to streaming endpoint');
    const response = await fetch('http://localhost:3001/api/claude/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: context || 'You are a helpful AI assistant.',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        stream: true
      }),
    });

    if (!response.ok) {
      console.error('Stream response not OK:', {
        status: response.status,
        statusText: response.statusText
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
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

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
            }
          } catch (e) {
            console.error('Error parsing Claude chunk:', {
              error: e,
              data
            });
          }
        }
      }
    }

    console.log('Stream processing complete, full text:', fullText);
    return {
      text: fullText,
      isStreaming: false
    };
  } catch (error: any) {
    console.error('Claude API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}; 
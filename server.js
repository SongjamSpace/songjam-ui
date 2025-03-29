import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/claude', async (req, res) => {
  try {
    console.log('Received request to proxy server:', {
      body: req.body,
      headers: req.headers
    });

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      req.body,
      {
        headers: {
          'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    console.log('Claude API response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Claude API error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

app.post('/api/claude/stream', async (req, res) => {
  try {
    console.log('Received streaming request to proxy server:', {
      body: req.body,
      headers: req.headers
    });

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log('Making request to Claude API with streaming enabled');
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        ...req.body,
        stream: true
      },
      {
        headers: {
          'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        responseType: 'stream'
      }
    );

    console.log('Received response from Claude API');

    // Pipe the stream to the client
    response.data.on('data', chunk => {
      console.log('Received chunk from Claude:', chunk.toString());
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          console.log('Sending to client:', line);
          res.write(line + '\n\n');
        }
      }
    });

    response.data.on('end', () => {
      console.log('Stream ended from Claude');
      res.write('data: [DONE]\n\n');
      res.end();
    });

    response.data.on('error', error => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Claude API error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
    res.write(`data: ${JSON.stringify({ error: error.response?.data || error.message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 
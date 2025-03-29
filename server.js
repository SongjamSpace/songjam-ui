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

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 
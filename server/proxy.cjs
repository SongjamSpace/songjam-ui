const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for X user profile
app.get('/api/x/user/:username', async (req, res) => {
  // Dynamically import node-fetch
  const { default: fetch } = await import('node-fetch');
  try {
    const { username } = req.params;
    console.log('Fetching X profile for username:', username);

    if (!process.env.VITE_X_BEARER_TOKEN) {
      console.error('X Bearer Token is not set in environment variables');
      return res.status(500).json({ error: 'X API configuration is missing' });
    }

    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}?user.fields=description,profile_image_url,public_metrics,created_at,verified`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_X_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error('X API error:', response.status, response.statusText);
      const errorText = await response.text(); // Read response as text to handle potential non-JSON errors
      console.error('Error details:', errorText);
      // Try to parse as JSON, but handle cases where it's not
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = {
          error: 'Failed to parse error response from X API',
          details: errorText,
        };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    console.log('Successfully fetched X profile:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching X user profile:', error);
    res
      .status(500)
      .json({
        error: 'Failed to fetch X user profile',
        details: error.message,
      });
  }
});

// Proxy endpoint for X user tweets
app.get('/api/x/user/:userId/tweets', async (req, res) => {
  // Dynamically import node-fetch
  const { default: fetch } = await import('node-fetch');
  try {
    const { userId } = req.params;
    console.log('Fetching X tweets for user ID:', userId);

    if (!process.env.VITE_X_BEARER_TOKEN) {
      console.error('X Bearer Token is not set in environment variables');
      return res.status(500).json({ error: 'X API configuration is missing' });
    }

    const response = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=public_metrics,created_at`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_X_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error('X API error:', response.status, response.statusText);
      const errorText = await response.text(); // Read response as text
      console.error('Error details:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = {
          error: 'Failed to parse error response from X API',
          details: errorText,
        };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    console.log('Successfully fetched X tweets:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching X user tweets:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch X user tweets', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
  console.log('Environment variables loaded:', {
    hasBearerToken: !!process.env.VITE_X_BEARER_TOKEN,
    bearerTokenLength: process.env.VITE_X_BEARER_TOKEN?.length,
  });
});

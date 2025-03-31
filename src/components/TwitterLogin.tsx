import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import { getXApiStatus, XApiStatus, refreshXApiToken } from '../services/db/spaces.service';

const TwitterLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState(XApiStatus.READY);

  useEffect(() => {
    // Listen for API unauthorized events
    const handleUnauthorized = () => {
      handleLogin(); // Attempt to refresh token and re-authenticate
    };
    window.addEventListener('x-api-unauthorized', handleUnauthorized);

    // Monitor API status
    const checkApiStatus = () => {
      const status = getXApiStatus();
      setApiStatus(status.status);
      if (status.lastError) {
        setError(status.lastError.message);
      }
    };
    const statusInterval = setInterval(checkApiStatus, 5000);

    return () => {
      window.removeEventListener('x-api-unauthorized', handleUnauthorized);
      clearInterval(statusInterval);
    };
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to refresh the token
      await refreshXApiToken();
      
      // If refresh fails, initiate new OAuth flow
      const authUrl = `https://twitter.com/i/oauth2/authorize?${new URLSearchParams({
        response_type: 'code',
        client_id: import.meta.env.VITE_TWITTER_CLIENT_ID || '',
        redirect_uri: window.location.origin + '/auth/callback',
        scope: 'tweet.read users.read space.read',
        state: crypto.randomUUID(),
        code_challenge_method: 'S256',
        code_challenge: await generateCodeChallenge()
      })}`;

      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Twitter');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PKCE code challenge
  const generateCodeChallenge = async () => {
    const codeVerifier = crypto.randomUUID();
    sessionStorage.setItem('code_verifier', codeVerifier);
    
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={isLoading ? <CircularProgress size={20} /> : <TwitterIcon />}
        onClick={handleLogin}
        disabled={isLoading || apiStatus === XApiStatus.RATE_LIMITED}
        sx={{
          background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
          '&:hover': {
            background: 'linear-gradient(90deg, #3b82f6, #7c3aed)',
          }
        }}
      >
        {isLoading ? 'Connecting...' : 'Connect Twitter'}
      </Button>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {apiStatus === XApiStatus.RATE_LIMITED && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Twitter API rate limit reached. Please try again later.
        </Alert>
      )}
    </>
  );
};

export default TwitterLogin;

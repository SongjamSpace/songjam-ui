import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  IconButton,
  Paper,
  Fade,
  useTheme,
  Link,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import { useTranslation } from 'react-i18next';

const demoMessages = [
  {
    role: 'assistant',
    content: 'Hey! I\'m Songjam your X Spaces assistant. I can help you analyze Twitter Spaces, generate and send engaging DMs, plus much more. What would you like to know?',
  },
  {
    role: 'user',
    content: 'Can you help me analyze a recent Twitter Space?',
  },
  {
    role: 'assistant',
    content: 'Of course! I can help you analyze any Twitter Space. Just share the Space URL, and I\'ll provide insights about:\n\n• Key discussion topics\n• Speaker engagement patterns\n• Sentiment analysis\n• Actionable recommendations\n\nWould you like to try it out?',
  },
];

const AIDemoPreview = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<typeof demoMessages>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < demoMessages.length) {
        setMessages(prev => [...prev, demoMessages[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I can help you with that! Just paste your Space URL and I\'ll analyze it for you.',
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <Card
        sx={{
          p: 3,
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          mb: 2,
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/logos/songjam.jpeg"
            alt="Songjam"
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <Typography variant="h6">Songjam</Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((message, index) => (
            <Fade in key={index} timeout={500}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {message.role === 'assistant' && (
                  <Box
                    component="img"
                    src="/logos/songjam.jpeg"
                    alt="Songjam"
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      mt: 0.5,
                    }}
                  />
                )}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    background: message.role === 'user'
                      ? 'linear-gradient(135deg, #60a5fa, #8b5cf6)'
                      : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-line',
                      color: message.role === 'user' ? 'white' : 'inherit',
                    }}
                  >
                    {message.content}
                  </Typography>
                </Paper>
                {message.role === 'user' && (
                  <PersonIcon
                    sx={{
                      color: theme.palette.secondary.main,
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
            </Fade>
          ))}
          {isTyping && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                alignSelf: 'flex-start',
              }}
            >
              <Box
                component="img"
                src="/logos/songjam.jpeg"
                alt="Songjam"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  mt: 0.5,
                }}
              />
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: theme.palette.primary.main,
                      animation: 'bounce 1s infinite',
                    }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: theme.palette.primary.main,
                      animation: 'bounce 1s infinite 0.2s',
                    }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: theme.palette.primary.main,
                      animation: 'bounce 1s infinite 0.4s',
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            variant="outlined"
            size="small"
          />
          <IconButton
            onClick={handleSend}
            sx={{
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Card>
      
      <Box
        sx={{
          p: 2,
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <ShieldIcon
          sx={{
            fontSize: 40,
            background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 12px rgba(96, 165, 250, 0.5))',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                filter: 'drop-shadow(0 0 12px rgba(96, 165, 250, 0.5))',
              },
              '50%': {
                filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.7))',
              },
              '100%': {
                filter: 'drop-shadow(0 0 12px rgba(96, 165, 250, 0.5))',
              },
            },
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t('voiceBiometricsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('voiceBiometricsText')}{' '}
            <Link
              href="https://www.papermark.com/view/cmbjtiei10001jr04kfyoo91q"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('learnMore')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default AIDemoPreview; 
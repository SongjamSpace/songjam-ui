import { useState, useEffect } from 'react';
import './App.css';
import Background from './components/Background';
import Logo from './components/Logo';
import { Button, TextField, Box, Stack, Grid, Container, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { submitToAirtable } from './services/airtable.service';
import { toast, Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { extractSpaceId } from './utils';
import PricingBanner from './components/PricingBanner';
import LoginDialog from './components/LoginDialog';
import { createCheckoutSession } from './services/db/stripe';
import { useAuthContext } from './contexts/AuthContext';
import AIDemoPreview from './components/AIDemoPreview';

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuthContext();
  const theme = useTheme();
  const [spaceUrl, setSpaceUrl] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleAnalyze = async (url: string, boostFollowers: boolean = false) => {
    if (!url || !url.trim()) return toast.error('Please enter a space URL');
    const spaceId = extractSpaceId(url);
    if (!spaceId) {
      toast.error('Invalid space URL');
      return;
    }
    const isBroadcast = url.includes('broadcasts');
    const navigateUrl = isBroadcast
      ? `/dashboard?broadcastId=${spaceId}`
      : `/dashboard?spaceId=${spaceId}&boostFollowers=${boostFollowers}`;
    navigate(navigateUrl);
  };

  const handleLanguageChange = async () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    try {
      await i18n.changeLanguage(newLang);
      window.location.reload();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  useEffect(() => {
    document.body.className = 'dark';
  }, []);

  return (
    <main className="landing">
      <Background />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />

      <nav>
        <div className="logo">
          <Logo />
          <span>Songjam</span>
        </div>
        <Box display="flex" gap={2}>
          <Button
            onClick={handleLanguageChange}
            variant="outlined"
            size="small"
            sx={{
              color: 'var(--text-secondary)',
              borderColor: 'var(--text-secondary)',
              '&:hover': {
                borderColor: 'white',
                color: 'white',
              },
            }}
          >
            {t('switchLanguage')}
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="contained"
            size="small"
            className="primary"
          >
            {t('Dashboard')}
          </Button>
        </Box>
      </nav>

      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  textShadow: '0 0 30px rgba(96, 165, 250, 0.3)',
                  animation: 'gradient 8s ease infinite',
                  backgroundSize: '200% 200%',
                  '@keyframes gradient': {
                    '0%': {
                      backgroundPosition: '0% 50%',
                    },
                    '50%': {
                      backgroundPosition: '100% 50%',
                    },
                    '100%': {
                      backgroundPosition: '0% 50%',
                    },
                  },
                }}
              >
                {t('heroTitle1')}
                <br />
                {t('heroTitle2')}
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  maxWidth: '600px',
                  mx: 'auto',
                  opacity: 0.9,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  animation: 'fadeIn 1s ease-out',
                  '@keyframes fadeIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(10px)',
                    },
                    to: {
                      opacity: 0.9,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                {t('heroSubtitle1')}
                <br />
                {t('heroSubtitle2')}
              </Typography>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  placeholder={t('spaceInputPlaceholder')}
                  onChange={(e) => setSpaceUrl(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(8px)',
                    },
                  }}
                />

                <Box display="flex" gap={2}>
                  <LoadingButton
                    loading={isLoading}
                    variant="contained"
                    className="primary"
                    onClick={() => handleAnalyze(spaceUrl)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      fontSize: '1.1rem',
                    }}
                  >
                    {t('analyzeButton')}
                  </LoadingButton>
                  <LoadingButton
                    loading={isLoading}
                    variant="outlined"
                    className="info"
                    onClick={() => handleAnalyze(spaceUrl)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      fontSize: '1.1rem',
                    }}
                  >
                    {t('inviteToFollow', 'Boost Followers')}
                  </LoadingButton>
                </Box>
              </Stack>

              <Box
                sx={{
                  mt: 6,
                  display: 'flex',
                  gap: 4,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 8px 32px rgba(96, 165, 250, 0.2)',
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    DMs
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                      opacity: 0.9,
                      maxWidth: '200px',
                    }}
                  >
                    {t('automated')}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 8px 32px rgba(96, 165, 250, 0.2)',
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    X
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                      opacity: 0.9,
                      maxWidth: '200px',
                    }}
                  >
                    {t('spacesNative')}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 8px 32px rgba(96, 165, 250, 0.2)',
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    10X
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                      opacity: 0.9,
                      maxWidth: '200px',
                    }}
                  >
                    {t('engagement')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <AIDemoPreview />
          </Grid>
        </Grid>

        <Box sx={{ mt: 12 }}>
          <PricingBanner
            user={user}
            onSubscribe={async (plan) => {
              if (user?.uid) {
                if (user.currentPlan === 'business' && plan === 'pro') {
                  toast.error('You already have a business plan');
                  return;
                }
                if (plan !== 'free') {
                  await createCheckoutSession(user.uid, plan);
                }
              } else {
                setShowAuthDialog(true);
              }
            }}
          />
        </Box>
      </Container>

      <LoginDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </main>
  );
}

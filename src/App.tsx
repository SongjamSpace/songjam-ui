import { useState, useEffect } from 'react';
import './App.css';
import Background from './components/Background';
import Logo from './components/Logo';
import {
  Button,
  TextField,
  Box,
  Stack,
  Grid,
  Container,
  Typography,
  useTheme,
  TextareaAutosize,
} from '@mui/material';
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

  const handleAnalyze = async (
    url: string,
    boostFollowers: boolean = false
  ) => {
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

      <Container className="hero" maxWidth="lg" sx={{ mt: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  background:
                    'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
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
                    onClick={() => handleAnalyze(spaceUrl, true)}
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
              <div className="trust-badges">
                <span>{t('poweredBy')}</span>
                <div className="badge">Chrome</div>
                <div className="badge">ElizaOS</div>
                <div className="badge">Grok</div>
              </div>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <AIDemoPreview />
          </Grid>
        </Grid>
      </Container>
      <section className="features" style={{ marginTop: '100px' }}>
        <div className="feature">
          <div className="feature-icon">✍️</div>
          <h3>{t('transcribeFeatureTitle')}</h3>
          <p>{t('transcribeFeatureText')}</p>
          <div className="feature-detail">{t('transcribeFeatureDetail')}</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🤖</div>
          <h3>{t('analyzeFeatureTitle')}</h3>
          <p>{t('analyzeFeatureText')}</p>
          <div className="feature-detail">{t('analyzeFeatureDetail')}</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📈</div>
          <h3>{t('shareFeatureTitle')}</h3>
          <p>{t('shareFeatureText')}</p>
          <div className="feature-detail">{t('shareFeatureDetail')}</div>
        </div>
      </section>
      <section className="how-it-works">
        <h2>{t('howItWorksTitle')}</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>{t('step1Title')}</h4>
            <p>{t('step1Text')}</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>{t('step2Title')}</h4>
            <p>{t('step2Text')}</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>{t('step3Title')}</h4>
            <p>{t('step3Text')}</p>
          </div>
        </div>
      </section>
      <section
        className="extension-install"
        style={{
          marginBottom: '100px',
          textAlign: 'center',
          padding: '4rem 2rem',
          background:
            'linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(139, 92, 246, 0.1))',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <h2
          style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}
        >
          {t('extensionTitle')}
        </h2>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: '1.6',
          }}
        >
          {t('extensionText')}
        </p>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            className="primary"
            href="https://chromewebstore.google.com/detail/ikhimgpbclohoohnahnejbicegbkaole"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '1.2rem',
              padding: '1rem 2.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              boxShadow: '0 4px 14px rgba(96, 165, 250, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 20px rgba(96, 165, 250, 0.5)',
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              },
              '&:active': {
                transform: 'translateY(-1px)',
              },
            }}
          >
            {t('installExtensionButton')}
          </Button>
        </Box>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '3rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span>Instant Setup</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <span>Secure & Private</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
            <span>Free to Use</span>
          </div>
        </div>
      </section>

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
      <section className="honors" style={{ marginTop: '100px' }}>
        <h2>{t('honorsTitle')}</h2>
        <p>{t('honorsText')}</p>
        <div className="honors-grid">
          <div className="honor-item">
            <img
              src="/logos/chainlink.png"
              alt="Chainlink"
              className="honor-logo"
            />
            <span>Chainlink</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/coinbase.png"
              alt="Coinbase"
              className="honor-logo"
            />
            <span>Coinbase</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/coindesk.png"
              alt="Coindesk"
              className="honor-logo"
            />
            <span>Coindesk</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/filecoin.png"
              alt="Filecoin"
              className="honor-logo"
            />
            <span>Filecoin</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/moonbeam.png"
              alt="Moonbeam"
              className="honor-logo"
            />
            <span>Moonbeam</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/nethermind.png"
              alt="Nethermind"
              className="honor-logo"
            />
            <span>Nethermind</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/oniforce.png"
              alt="ONI Force"
              className="honor-logo"
            />
            <span>ONI Force</span>
          </div>
          <div className="honor-item">
            <img
              src="/logos/polkadot.png"
              alt="Polkadot"
              className="honor-logo"
            />
            <span>Polkadot</span>
          </div>
        </div>
      </section>
      <section className="contact">
        <h2>{t('contactTitle')}</h2>
        <p>{t('contactText')}</p>
        <form className="contact-form">
          <div className="form-group">
            <TextField
              fullWidth
              placeholder={t('namePlaceholder')}
              variant="outlined"
              name="name"
              required
              inputProps={{ minLength: 2 }}
            />
          </div>
          <div className="form-group">
            <TextField
              fullWidth
              placeholder={t('telegramPlaceholder')}
              variant="outlined"
              name="telegram"
              required
              inputProps={{ pattern: '@.*' }}
              helperText={t('telegramHelp')}
            />
          </div>
          <div className="form-group">
            <TextField
              fullWidth
              type="email"
              placeholder={t('emailPlaceholder')}
              variant="outlined"
              name="email"
              required
            />
          </div>
          <div className="form-group">
            <TextareaAutosize
              placeholder={t('messagePlaceholder')}
              name="message"
              required
              minLength={10}
              style={{ width: '100%', minHeight: '100px' }}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            className="primary"
            onClick={async (e) => {
              e.preventDefault();
              const form = e.currentTarget.closest('form');
              if (!form) return;

              if (!form.checkValidity()) {
                form.reportValidity();
                return;
              }

              const formData = new FormData(form);
              try {
                if (
                  !import.meta.env.VITE_AIRTABLE_API_KEY ||
                  !import.meta.env.VITE_AIRTABLE_BASE_ID ||
                  !import.meta.env.VITE_AIRTABLE_TABLE_NAME
                ) {
                  alert(
                    'Missing Airtable configuration. Please check your environment variables.'
                  );
                  return;
                }

                const result = await submitToAirtable({
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  telegram: formData.get('telegram') as string,
                  message: formData.get('message') as string,
                });

                if (result) {
                  alert('Form submitted successfully!');
                  form.reset();
                }
              } catch (error: any) {
                console.error('Submission error:', error);
                alert(
                  error?.message || 'Error submitting form. Please try again.'
                );
              }
            }}
          >
            {t('submitButton')}
          </Button>
        </form>
      </section>
      <section className="social-media">
        <h2>{t('connectWithUsTitle')}</h2>
        <Box display="flex" flexWrap="wrap" gap={6} justifyContent="center">
          <a
            href="https://www.producthunt.com/posts/songjam-otter-ai-for-x-spaces"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src="/logos/product-hunt.png" alt="Product Hunt" />
            <span>{t('productHunt')}</span>
          </a>
          <a
            href="https://github.com/songjamspace"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src="/logos/github.png" alt="GitHub" />
            <span>{t('github')}</span>
          </a>
          <a
            href="https://x.com/intent/follow?screen_name=SongjamSpace"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src="/logos/twitter.png" alt="Twitter" />
            <span>{t('twitter')}</span>
          </a>
          <a
            href="https://www.linkedin.com/company/songjam/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            <img src="/logos/linkedin.png" alt="LinkedIn" />
            <span>{t('linkedin')}</span>
          </a>
        </Box>
      </section>
      <footer className="footer">
        <p>{t('footerText')}</p>
      </footer>
      <Toaster position="bottom-right" />
      <LoginDialog
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </main>
  );
}

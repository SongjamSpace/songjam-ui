import { useState, useEffect } from 'react';
import './App.css';
import Background from './components/Background';
import Logo from './components/Logo';
import {
  Button,
  TextField,
  TextareaAutosize,
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { submitToAirtable } from './services/airtable.service';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit } from 'firebase/firestore';
import { db } from './services/firebase.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { extractSpaceId } from './utils';
import PricingBanner from './components/PricingBanner';
import LoginDialog from './components/LoginDialog';
import { createCheckoutSession } from './services/db/stripe';
import { useAuthContext } from './contexts/AuthContext';

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuthContext();
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [spaceUrl, setSpaceUrl] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [spaces, loading, error] = useCollectionData(
    query(
      collection(db, 'spaces'),
      where('transcriptionProgress', '==', 6),
      limit(3)
    )
  );
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const handleAnalyze = async (url: string) => {
    if (isLoading || !url.trim()) return;
    // Regex to get spaces/id or broadcasts/id
    // example urls: ['https://x.com/i/spaces/1OdKrDYpvzwJX', 'https://x.com/i/broadcasts/1vAGRDzePAPxl']
    // extract the id from the url
    const spaceId = extractSpaceId(url);
    if (!spaceId) {
      toast.error('Invalid space URL', {
        duration: 3000,
        position: 'bottom-right',
      });
      return;
    }
    const isBroadcast = url.includes('broadcasts');
    const navigateUrl = isBroadcast
      ? `/dashboard?broadcastId=${spaceId}`
      : `/dashboard?spaceId=${spaceId}`;
    navigate(navigateUrl);
    // setIsLoading(true);
    // const res = await axios.get(
    //   `${import.meta.env.VITE_JAM_SERVER_URL}/get-space/${spaceId}`
    // );
    // if (res.data.result) {
    //   const state = res.data.result.metadata.state;
    //   if (state === 'Ended') {
    //     const path = await transcribeSpace(url);
    //     navigate(path);
    //   } else if (state === 'Running') {
    //     const res = await axios.post(
    //       `${import.meta.env.VITE_JAM_SERVER_URL}/listen-live-space`,
    //       { spaceId }
    //     );
    //     navigate(`/live/${spaceId}`);
    //   }
    // } else {
    //   toast.error('Error analyzing space, please try again', {
    //     duration: 3000,
    //     position: 'bottom-right',
    //     style: {
    //       background: '#333',
    //       color: '#fff',
    //     },
    //   });
    // }

    // setIsLoading(false);
  };

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.body.className = 'dark';
  }, []);

  return (
    <main className="landing">
      <Background />
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

      <section className="hero">
        <div className="stats-banner">
          <div className="stat">
            <span className="stat-number">99%</span>
            <span className="stat-label">{t('accuracy')}</span>
          </div>
          <div className="stat">
            <span className="stat-number">X</span>
            <span className="stat-label">{t('spacesNative')}</span>
          </div>
          <div className="stat">
            <span className="stat-number">USDT</span>
            <span className="stat-label">{t('settlement')}</span>
          </div>
        </div>
        <div className="animated-title">
          <h1>
            {t('heroTitle1')}
            <br></br>
            {t('heroTitle2')}
          </h1>
          <div className="subtitle-wrapper">
            <p>
              {t('heroSubtitle1')}
              <br></br>
              {t('heroSubtitle2')}
            </p>
            <Box className="space-input" display="flex" gap={2}>
              <TextField
                fullWidth
                placeholder={t('spaceInputPlaceholder')}
                onChange={(e) => setSpaceUrl(e.target.value)}
                variant="outlined"
              />
              <LoadingButton
                loading={isLoading}
                variant="contained"
                className="primary"
                onClick={() => handleAnalyze(spaceUrl)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {t('analyzeButton')}
              </LoadingButton>
            </Box>
          </div>
        </div>
        <div className="cta-buttons">
          <Button
            variant="contained"
            className="primary"
            onClick={() => setIsPreviewDialogOpen(true)}
          >
            {t('tryPreviewButton')}
          </Button>
          {/* <Button
            variant="outlined"
            className="secondary"
            onClick={() => navigate('/pricing')}
          >
            {t('viewPricingButton')}
          </Button> */}

          <Dialog
            open={isPreviewDialogOpen}
            onClose={() => setIsPreviewDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { bgcolor: 'rgba(15, 23, 42, 0.95)' } }}
          >
            <DialogContent sx={{ p: 0, border: 'none' }}>
              <IconButton
                aria-label="close"
                onClick={() => setIsPreviewDialogOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'var(--text-secondary)',
                  zIndex: 1,
                }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    background:
                      'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  🔭 Preview Analyzed Spaces 🔭
                </Typography>
                <Typography sx={{ mb: 3, color: 'var(--text-secondary)' }}>
                  Click on any space below to see an example of the analysis
                  output. Paste your own space URL on the homepage to try it!
                </Typography>
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: 'rgba(96, 165, 250, 0.1)',
                    borderRadius: 2,
                    textAlign: 'left',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: '#60a5fa' }}
                  >
                    🚀 Available Previews:
                  </Typography>

                  {loading && (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', my: 3 }}
                    >
                      <CircularProgress color="inherit" />
                    </Box>
                  )}
                  {error && (
                    <Typography color="error" sx={{ my: 3 }}>
                      {t('errorLoadingSpaces', { error: error.message })}
                    </Typography>
                  )}
                  {!loading && !error && spaces && spaces.length > 0 && (
                    <List sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
                      {spaces.map((space: any) => (
                        <ListItemButton
                          key={space.spaceId}
                          onClick={() => {
                            setIsPreviewDialogOpen(false);
                            navigate(`/crm/${space.spaceId}`);
                          }}
                          sx={{
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          <ListItemText
                            primary={space.title || `Space ${space.spaceId}`}
                            secondary={`${t('analyzedOn')}: ${
                              space.docCreatedAt
                                ? new Date(space.docCreatedAt).toLocaleString(
                                    [],
                                    {
                                      year: 'numeric',
                                      month: 'numeric',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )
                                : 'N/A'
                            }`}
                            primaryTypographyProps={{
                              color: 'var(--text-primary)',
                            }}
                            secondaryTypographyProps={{
                              color: 'var(--text-secondary)',
                              fontSize: '0.8rem',
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                  {!loading && !error && (!spaces || spaces.length === 0) && (
                    <Typography
                      sx={{
                        my: 3,
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {t('noPreviews')}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                  }}
                >
                  This is just a preview. Analyze your own space for full
                  insights!
                </Typography>
              </Box>
            </DialogContent>
          </Dialog>
        </div>
        <div className="trust-badges">
          <span>{t('poweredBy')}</span>
          <div className="badge">ElizaOS</div>
          <div className="badge">Ethereum</div>
          <div className="badge">Grok</div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">✍️</div>
          <h3>{t('transcribeFeatureTitle')}</h3>
          <p>{t('transcribeFeatureText')}</p>
          <div className="feature-detail">{t('transcribeFeatureDetail')}</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📋</div>
          <h3>{t('analyzeFeatureTitle')}</h3>
          <p>{t('analyzeFeatureText')}</p>
          <div className="feature-detail">{t('analyzeFeatureDetail')}</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📣</div>
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
      <PricingBanner
        user={user}
        onSubscribe={async (plan) => {
          if (user?.uid) {
            // if user.currentPlan is business, don't allow them to subscribe to business
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
        <Box display="flex" flexWrap="wrap" gap={8} justifyContent="center">
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
            href="https://x.com/SongjamSpace"
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
      <LoginDialog open={showAuthDialog && !authLoading} />
    </main>
  );
}

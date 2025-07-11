import { useState, useEffect } from 'react';
import './App.css';
import Background from './components/Background';
import Logo from './components/Logo';
import songjamImage from './songjam.png';
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
  Paper,
  Link,
  Chip,
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
import { keyframes } from '@mui/system';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text,
} from 'recharts';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createSpaceSubmission } from './services/db/spaceSubmissions.service';
import SignPointsLeaderboard from './components/SignPointsLeaderboard';

const electrifyPulse = keyframes`
  0% { text-shadow: 0 0 1px #60a5fa, 0 0 2px #60a5fa, 0 0 3px rgba(236, 72, 153, 0.5); }
  50% { text-shadow: 0 0 2px #60a5fa, 0 0 4px #60a5fa, 0 0 6px rgba(236, 72, 153, 0.8), 0 0 10px rgba(236, 72, 153, 0.4); }
  100% { text-shadow: 0 0 1px #60a5fa, 0 0 2px #60a5fa, 0 0 3px rgba(236, 72, 153, 0.5); }
`;

const chartGlowPulse = keyframes`
  0% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.7); }
  50% { box-shadow: 0 0 80px rgba(139, 92, 246, 1); }
  100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.7); }
`;

const panelBorderGlow = keyframes`
  0% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.5); }
  50% { box-shadow: 0 0 40px rgba(96, 165, 250, 0.9); }
  100% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.5); }
`;

const neonPulse = keyframes`
  0% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
  50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
  100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
`;

const textPulse = keyframes`
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
`;

export default function App() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuthContext();
  const theme = useTheme();
  const [spaceUrl, setSpaceUrl] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [spaceUrlForPoints, setSpaceUrlForPoints] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [xUser, setXUser] = useState<{
    screenName: string;
    avatarUrl: string;
  } | null>(null);

  const { user: dynamicUser } = useDynamicContext();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const launchDate = new Date('2025-09-17T12:00:00Z'); // September 17, 2025 @ 12 PM UTC
      const difference = launchDate.getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  // const tokenomicsData = [
  //   {
  //     name: 'Public Sale',
  //     value: 37.5,
  //     color: '#FFA726',
  //     description: 'Fixed Supply',
  //   },
  //   {
  //     name: 'Liquidity Pool',
  //     value: 12.5,
  //     color: '#BD85FF',
  //     description: 'Fixed Supply',
  //   },
  //   {
  //     name: 'Ecosystem Fund',
  //     value: 10,
  //     color: '#FF5E8E',
  //     description:
  //       'Hackathons, Grants, Bounties. Tokens immediately released at 17 Sep 2025',
  //   },
  //   {
  //     name: 'Early Backers',
  //     value: 5,
  //     color: '#4FC3F7',
  //     description:
  //       'Mentors, Supporters, Investors. Tokens released over 1 year from 17 Sep 2025',
  //   },
  //   {
  //     name: 'Team',
  //     value: 15,
  //     color: '#FFD700',
  //     description:
  //       'Founders, Builders, Creators. Tokens released over 1 year from 17 Sep 2025',
  //   },
  //   {
  //     name: 'Community',
  //     value: 20,
  //     color: '#00E676',
  //     description:
  //       'Yappers, Stakers, Contributors. 5% released from 19 Jul, 5% from 17 Aug, 90% released from 17 Sep 2025',
  //   },
  // ];

  // const renderCustomizedLabel = ({
  //   cx,
  //   cy,
  //   midAngle,
  //   outerRadius,
  //   percent,
  // }: any) => {
  //   const RADIAN = Math.PI / 180;
  //   const radius = outerRadius + 30; // Position text 30px outside the outer radius
  //   const x = cx + radius * Math.cos(-midAngle * RADIAN);
  //   const y = cy + radius * Math.sin(-midAngle * RADIAN);

  //   return (
  //     <Text
  //       x={x}
  //       y={y}
  //       fill="white"
  //       textAnchor={x > cx ? 'start' : 'end'}
  //       dominantBaseline="central"
  //       style={{
  //         fontSize: '0.9rem',
  //         fontWeight: 'bold',
  //         textShadow: '0 0 3px rgba(0,0,0,0.7)',
  //       }}
  //     >
  //       {`${(percent * 100).toFixed(1)}%`}
  //     </Text>
  //   );
  // };

  const handleAnalyze = async (
    url: string,
    boostSpace: boolean = false,
    boostFollowers: boolean = false
  ) => {
    if (!url || !url.trim()) return toast.error('Please enter a space URL');
    const spaceId = extractSpaceId(url);
    if (!spaceId) {
      toast.error('Invalid space URL');
      return;
    }
    const isBroadcast = url.includes('broadcasts');
    let navigateUrl = isBroadcast
      ? `/dashboard?broadcastId=${spaceId}`
      : `/dashboard?spaceId=${spaceId}`;
    if (boostSpace) {
      navigateUrl += '&boostSpace=true';
    }
    // &boostFollowers=${boostFollowers}
    navigate(navigateUrl);
  };

  // const handleLanguageChange = async () => {
  //   const newLang = i18n.language === 'en' ? 'zh' : 'en';
  //   try {
  //     await i18n.changeLanguage(newLang);
  //     window.location.reload();
  //   } catch (error) {
  //     console.error('Failed to change language:', error);
  //   }
  // };

  useEffect(() => {
    document.body.className = 'dark';
  }, []);

  // Auto-scroll to sections based on URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#tokenomics') {
      const element = document.getElementById('tokenomics-section');
      if (element) {
        // Small delay to ensure the component is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const handleClaimSpacePoints = async () => {
    if (!spaceUrlForPoints.trim()) {
      return toast.error('Please enter a valid Twitter Space URL.');
    }
    if (!dynamicUser) {
      setShowAuthDialog(true);
      return;
    }
    const twitterCredentials = dynamicUser.verifiedCredentials.find(
      (cred) => cred.format === 'oauth'
    );
    if (!twitterCredentials) {
      toast.error('Please connect your Twitter account.');
      return setShowAuthDialog(true);
    }
    const spaceId = extractSpaceId(spaceUrlForPoints);
    if (!spaceId) {
      toast.error('Please enter a valid Twitter Space URL.');
      return;
    }
    setIsClaiming(true);
    try {
      await createSpaceSubmission(spaceId, {
        spaceUrl: spaceUrlForPoints,
        userId: twitterCredentials.id,
        twitterId: twitterCredentials.oauthAccountId,
        username: twitterCredentials.oauthUsername,
        name: twitterCredentials.publicIdentifier,
        createdAt: new Date(),
        spacePoints: 0,
      });
      toast.success('Space URL submitted for verification!');
      setSpaceUrlForPoints('');
    } catch (error) {
      toast.error('Failed to submit space URL. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
          }}
        >
          <div className="logo">
            <Logo />
            <span>Songjam</span>
          </div>
          <Box display="flex" gap={2} alignItems="center">
            <Button
              variant="text"
              color="inherit"
              onClick={() => {
                const element = document.getElementById(
                  'agentic-story-section'
                );
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              About
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById('tokenomics-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Tokenomics
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById('leaderboard-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Leaderboard
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById('extension-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Extension
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById('pricing-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Pricing
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById('honors-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Honors
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById('contact-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Contact
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outlined"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
                animation: `${textPulse} 2s infinite ease-in-out`,
              }}
            >
              {user ? 'Dashboard' : 'CRM Login'}
            </Button>
            <Button
              href="/leaderboard"
              variant="contained"
              size="small"
              sx={{
                background: 'linear-gradient(90deg, #00BCD4 0%, #3F51B5 100%)',
                color: 'white',
                '&:hover': {
                  background:
                    'linear-gradient(90deg, #3F51B5 0%, #00BCD4 100%)',
                  boxShadow: '0 0 20px rgba(0, 188, 212, 0.8)',
                },
              }}
            >
              Launch a Leaderboard
            </Button>
          </Box>
        </Box>
      </nav>

      <Container className="hero" sx={{ mt: 0.5 }}>
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
                    onClick={() => handleAnalyze(spaceUrl, true)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      fontSize: '1.1rem',
                    }}
                  >
                    {t('inviteToFollow', 'Boost Space')}
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
                    {t('analyzeButton')}
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
                <div className="badge">Grok</div>
                <div className="badge">Virtuals</div>
              </div>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <AIDemoPreview
              onSpaceUrl={(spaceUrl) => handleAnalyze(spaceUrl, true)}
            />
          </Grid>
        </Grid>
      </Container>

      <section
        className="extension-install"
        id="extension-section"
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

      <Box sx={{ mt: 12 }} id="pricing-section">
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
      <section
        className="honors"
        id="honors-section"
        style={{ marginTop: '100px' }}
      >
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
      <section className="contact" id="contact-section">
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
        open={showAuthDialog && !authLoading}
        onClose={() => setShowAuthDialog(false)}
      />
    </main>
  );
}

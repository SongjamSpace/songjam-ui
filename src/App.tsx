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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  IconButton,
  Link,
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
import { keyframes, width } from '@mui/system';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text,
} from 'recharts';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import CloseIcon from '@mui/icons-material/Close';
import {
  getTwitterMentionsLeaderboard,
  UserLeaderboardEntry,
} from './services/db/twitterMentions.service';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createSpaceSubmission } from './services/db/spaceSubmissions.service';

const electrifyPulse = keyframes`
  0% { text-shadow: 0 0 1px #60a5fa, 0 0 2px #60a5fa, 0 0 3px rgba(236, 72, 153, 0.5); }
  50% { text-shadow: 0 0 2px #60a5fa, 0 0 4px #60a5fa, 0 0 6px rgba(236, 72, 153, 0.8), 0 0 10px rgba(236, 72, 153, 0.4); }
  100% { text-shadow: 0 0 1px #60a5fa, 0 0 2px #60a5fa, 0 0 3px rgba(236, 72, 153, 0.5); }
`;

const innerTextPulse = keyframes`
  0% { text-shadow: 0 0 12px #fff; opacity: 0.98; }
  50% { text-shadow: 0 0 24px #fff; opacity: 1; }
  100% { text-shadow: 0 0 12px #fff; opacity: 0.98; }
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
  const [leaderboard, setLeaderboard] = useState<UserLeaderboardEntry[]>([]);
  const { user: dynamicUser } = useDynamicContext();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const leaderboard = await getTwitterMentionsLeaderboard();
      setLeaderboard(leaderboard);
    };
    fetchLeaderboard();
  }, []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const launchDate = new Date('2025-06-18T12:00:00Z'); // June 18, 2025 @ 12 PM UTC
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

  const tokenomicsData = [
    {
      name: 'Public Sale',
      value: 37.5,
      color: '#FFA726',
      description: 'Fixed Supply',
    },
    {
      name: 'Liquidity Pool',
      value: 12.5,
      color: '#BD85FF',
      description: 'Fixed Supply',
    },
    {
      name: 'Ecosystem Fund',
      value: 10,
      color: '#FF5E8E',
      description:
        'Hackathons, Grants, Bounties. Tokens immediately released at 17 Sep 2025',
    },
    {
      name: 'Early Backers',
      value: 5,
      color: '#4FC3F7',
      description:
        'Mentors, Supporters, Investors. Tokens released over 1 year from 17 Sep 2025',
    },
    {
      name: 'Team',
      value: 15,
      color: '#FFD700',
      description:
        'Founders, Builders, Creators. Tokens released over 1 year from 17 Sep 2025',
    },
    {
      name: 'Community',
      value: 20,
      color: '#00E676',
      description:
        'Yappers, Stakers, Contributors. 25% released at 17 Sep 2025, 75% over 1 year from 17 Sep 2025',
    },
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30; // Position text 30px outside the outer radius
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <Text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{
          fontSize: '0.9rem',
          fontWeight: 'bold',
          textShadow: '0 0 3px rgba(0,0,0,0.7)',
        }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </Text>
    );
  };

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
              {user ? 'Dashboard' : 'Login'}
            </Button>
            <Button
              href="https://app.virtuals.io/geneses/4157"
              target="_blank"
              rel="noopener noreferrer"
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
              Virtuals Genesis Launch
            </Button>
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
          </Box>
        </Box>
      </nav>

      <Container className="hero" maxWidth="lg" sx={{ mt: 0.5 }}>
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
      <Paper
        className="agentic-story"
        id="agentic-story-section"
        sx={{
          marginTop: '100px',
          textAlign: 'center',
          padding: '4rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          border: '1px solid rgba(96, 165, 250, 0.1)',
          boxShadow:
            '0 3px 15px rgba(139, 92, 246, 0.1), 0 0 10px rgba(236, 72, 153, 0.08)',
          transition: 'all 0.3s ease',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            textShadow:
              '0 0 15px rgba(236, 72, 153, 0.2), 0 0 8px rgba(139, 92, 246, 0.15)',
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
          {t('agenticStoryTitle', 'The Future of Engagement')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', md: '1.25rem' },
            color: '#F0F8FF',
            maxWidth: '900px',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
            opacity: 0.9,
            textShadow: '0 0 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          {t(
            'agenticStoryIntroPart1',
            `Transform your X Spaces experience with AI-powered, verifiable interactions.`
          )}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', md: '1.25rem' },
            color: '#F0F8FF',
            maxWidth: '900px',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
            opacity: 0.9,
            textShadow: '0 0 3px rgba(0, 0, 0, 0.1)',
            marginTop: '-1.5rem',
          }}
        >
          {t(
            'agenticStoryIntroPart2',
            `An Agentic CRM which redefines authenticity and personalization.`
          )}
        </Typography>

        <Grid container spacing={6} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                margin: '0 auto',
              }}
            >
              <img
                src={songjamImage}
                alt="Agentic CRM Flow"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box textAlign="left">
              <Typography
                variant="h4"
                sx={{
                  background:
                    'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  textShadow:
                    '0 0 12px rgba(236, 72, 153, 0.15), 0 0 6px rgba(139, 92, 246, 0.1)',
                }}
              >
                {t('pillar1Title', 'Supercharge your Growth')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  opacity: 0.9,
                  marginBottom: '2rem',
                  color: '#F0F8FF',
                }}
              >
                {t(
                  'pillar1Text',
                  `Participating in X Spaces is the most relatable way to grow on X. But it's not easy. You need to engage with your audience synchronously and asynchronously.`
                )}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  background:
                    'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  textShadow:
                    '0 0 12px rgba(236, 72, 153, 0.15), 0 0 6px rgba(139, 92, 246, 0.1)',
                }}
              >
                {t('pillar2Title', 'AI-Powered Personalization')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.7,
                  opacity: 0.9,
                  marginBottom: '2rem',
                  color: '#F0F8FF',
                }}
              >
                {t(
                  'pillar2Text',
                  `Leverage AI to automate your outreach, and to engage in a way that is truly personal and authentic. Save time, and grow your audience while you sleep.`
                )}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  background:
                    'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  textShadow:
                    '0 0 12px rgba(236, 72, 153, 0.15), 0 0 6px rgba(139, 92, 246, 0.1)',
                }}
              >
                {t('pillar3Title', 'Verifiable Authenticity')}
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.7, opacity: 0.9, color: '#F0F8FF' }}
              >
                {t(
                  'pillar3Text',
                  `Secure your interactions with cryptographic voice verification. Ensure every connection is genuine, secure, and truly human.`
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <section
        className="tokenomics"
        id="tokenomics-section"
        style={{
          marginTop: '100px',
          textAlign: 'center',
          padding: '4rem 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <h2
          style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}
        >
          Tokenomics
        </h2>
        <Typography
          variant="body1"
          sx={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '800px',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
          }}
        >
          Understanding the framework behind the $SANG token, designed for
          sustainable growth and community engagement.
        </Typography>

        <Paper
          sx={{
            p: 3,
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 2,
            border: '1px solid rgba(96, 165, 250, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            animation: `${panelBorderGlow} 4s infinite ease-in-out`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: 550,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {tokenomicsData.map((entry, index) => (
                        <linearGradient
                          id={`gradient-${index}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                          key={index}
                        >
                          <stop
                            offset="0%"
                            stopColor={entry.color}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor={entry.color}
                            stopOpacity={0.5}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={tokenomicsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={150}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive={false}
                      labelLine={{ stroke: 'rgba(255, 255, 255, 0.4)' }}
                      label={renderCustomizedLabel}
                    >
                      {tokenomicsData.map((entry, index) => {
                        const angle = index * (360 / tokenomicsData.length);
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#gradient-${index})`}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth={1}
                            style={{
                              transition: 'all 0.3s ease-out',
                              cursor: 'pointer',
                              transformOrigin: 'center',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = `rotate(${angle}deg) scale(1.05) rotate(-${angle}deg)`;
                              e.currentTarget.style.filter = 'brightness(1.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform =
                                'rotate(0deg) scale(1)';
                              e.currentTarget.style.filter = 'brightness(1)';
                            }}
                          />
                        );
                      })}
                    </Pie>
                    <Text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fill: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px rgba(255,255,255,0.8)',
                      }}
                    >
                      Tokenomics
                    </Text>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        boxShadow: '0 0 15px rgba(96, 165, 250, 0.3)',
                      }}
                      itemStyle={{ color: 'white' }}
                      formatter={(value: any, name: any) => [name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                  iconSize={14}
                  iconType="circle"
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 320,
                    height: 320,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    animation: `${chartGlowPulse} 4s infinite ease-in-out`,
                    zIndex: -1,
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={3} sx={{ textAlign: 'left' }}>
                {tokenomicsData.map((data, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: data.color,
                          fontWeight: 'bold',
                          textShadow: '0 0 8px rgba(0,0,0,0.4)',
                        }}
                      >
                        {data.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          marginRight: '66px',
                        }}
                      >
                        {data.value}%
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.5 }}
                    >
                      {data.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </section>

      {/* Leaderboard Section */}
      <Paper
        className="leaderboard"
        id="leaderboard-section"
        sx={{
          marginTop: '100px',
          padding: '40px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow:
            '0 3px 15px rgba(139, 92, 246, 0.1), 0 0 10px rgba(236, 72, 153, 0.08)',
        }}
      >
        <Grid container spacing={4}>
          {/* Left Column - Explanation */}
          <Grid item xs={12} md={4} sx={{ minHeight: '600px' }}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  background:
                    'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow:
                    '0 0 15px rgba(236, 72, 153, 0.2), 0 0 8px rgba(139, 92, 246, 0.15)',
                  mb: 2,
                  fontWeight: 'bold',
                }}
              >
                How Sing Points Work
              </Typography>
              <Typography
                variant="body1"
                color="#F0F8FF"
                sx={{
                  mb: 3,
                  opacity: 0.9,
                  lineHeight: 1.6,
                  textShadow: '0 0 3px rgba(0,0,0,0.1)',
                }}
              >
                Sing points are calculated based on your engagement metrics and
                when you participate. The earlier you engage, the more Sing
                points you get! Each interaction tagging{' '}
                <Link
                  href="https://x.com/songjamspace"
                  target="_blank"
                  rel="noopener"
                  sx={{
                    color: '#60a5fa',
                    fontWeight: 'bold',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  @SongjamSpace
                </Link>{' '}
                or mentioning{' '}
                <Link
                  href="https://x.com/search?q=%24SANG&src=cashtag_click"
                  target="_blank"
                  rel="noopener"
                  sx={{
                    color: '#60a5fa',
                    fontWeight: 'bold',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  $SANG
                </Link>{' '}
                contributes to your score, with a special multiplier for early
                participation.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  background: 'linear-gradient(45deg, #60A5FA, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 8px rgba(96, 165, 250, 0.1)',
                  mb: 2,
                  fontWeight: 'bold',
                }}
              >
                Base Sing Points Formula
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(96, 165, 250, 0.08)',
                  border: '1px solid rgba(96, 165, 250, 0.25)',
                  borderRadius: '12px',
                  boxShadow: '0 0 15px rgba(96, 165, 250, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 0 25px rgba(96, 165, 250, 0.4)',
                  },
                  '& .katex-display': {
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': {
                      height: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(96, 165, 250, 0.5)',
                      borderRadius: '2px',
                    },
                    '& .katex': {
                      fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                    },
                  },
                }}
              >
                <BlockMath>
                  {`S_{\\text{base}} = \\begin{gathered} \\underbrace{((L \\cdot 0.2) + (R \\cdot 0.4) + (RT \\cdot 0.6) + (QT \\cdot 1.0) + (B \\cdot 10))}_{\\text{Engagement Points}} \\\\[1em] + \\underbrace{((SY \\cdot 5 + DJ \\cdot 10) \\cdot N_{\\text{listeners}})}_{\\text{Space Points}} \\end{gathered}`}
                </BlockMath>
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{
                    mt: 2,
                    fontSize: '0.9em',
                    opacity: 0.8,
                    textShadow: '0 0 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Your base score is a sum of <strong>Engagement Points</strong>{' '}
                  from interactions (Likes, Replies, etc.) and{' '}
                  <strong>Space Points</strong>, which are awarded for speaking
                  (SY) or DJing and are multiplied by the number of listeners (N
                  <sub>listeners</sub>).
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 8px rgba(236, 72, 153, 0.1)',
                  mb: 2,
                  fontWeight: 'bold',
                }}
              >
                Early Multiplier
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(236, 72, 153, 0.08)',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                  borderRadius: '12px',
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)',
                  },
                  '& .katex-display': {
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': {
                      height: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(236, 72, 153, 0.5)',
                      borderRadius: '2px',
                    },
                    '& .katex': {
                      fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                    },
                  },
                }}
              >
                <BlockMath>
                  {`\\text{earlyMultiplier} = 1 + 99 \\times \\frac{\\max(0, T_{launch} - T_{post})}{604800}`}
                </BlockMath>
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{
                    mt: 2,
                    fontSize: '0.9em',
                    opacity: 0.8,
                    textShadow: '0 0 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Applies to posts up to 1 week before launch. Maximum
                  multiplier is 100x.
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  background: 'linear-gradient(45deg, #EC4899, #F472B6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 8px rgba(236, 72, 153, 0.1)',
                  mb: 2,
                  fontWeight: 'bold',
                }}
              >
                Final Score Multipliers
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(236, 72, 153, 0.08)',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                  borderRadius: '12px',
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)',
                  },
                  '& .katex-display': {
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': {
                      height: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(236, 72, 153, 0.5)',
                      borderRadius: '2px',
                    },
                    '& .katex': {
                      fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                    },
                  },
                }}
              >
                <BlockMath>
                  {`S_{\\text{final}} = S_{\\text{base}} \\times \\text{earlyMultiplier} \\times Q_{\\text{filter}}`}
                </BlockMath>
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{
                    mt: 2,
                    fontSize: '0.9em',
                    opacity: 0.8,
                    textShadow: '0 0 2px rgba(0,0,0,0.3)',
                  }}
                >
                  The base score is adjusted by multipliers for early
                  participation and a semantic quality filter.
                </Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Leaderboard */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
                }}
              >
                Leaderboard
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  animation: `${innerTextPulse} 2.5s infinite ease-in-out`,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                2% of $SANG Supply Reserved for Sing Points earned before
                Genesis Launch
              </Typography>
              {/* <Box sx={{ width: 100 }}></Box> */}
              {/* {isXConnected && xUser ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Avatar
                    src={xUser.avatarUrl}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    @{xUser.screenName}
                  </Typography>
                  <IconButton
                    onClick={handleDisconnectX}
                    size="small"
                    sx={{ color: 'white' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleConnectX}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Connect X
                </Button>
              )} */}
            </Box>

            <TableContainer
              component={Paper}
              sx={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                maxHeight: 860,
              }}
            >
              <Table
                stickyHeader
                sx={{ minWidth: 650 }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow sx={{ background: 'rgba(96, 165, 250, 0.1)' }}>
                    <TableCell
                      sx={{
                        color: '#F0F8FF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      Rank
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#F0F8FF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: '#F0F8FF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      Sing Points
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((user, index) => (
                    <TableRow
                      key={user.userId}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': {
                          background: 'rgba(96, 165, 250, 0.05)',
                          boxShadow: '0 0 15px rgba(96, 165, 250, 0.2)',
                        },
                        transition:
                          'background 0.3s ease, box-shadow 0.3s ease',
                      }}
                    >
                      <TableCell
                        sx={{
                          color: '#F0F8FF',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            textShadow: '0 0 5px rgba(255,255,255,0.2)',
                          }}
                        >
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#F0F8FF',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              border: '2px solid #8B5CF6',
                              boxShadow: '0 0 10px #8B5CF6',
                            }}
                            src={`https://unavatar.io/twitter/${user.username}`}
                          />
                          <Typography
                            variant="body1"
                            sx={{
                              textShadow: '0 0 5px rgba(255,255,255,0.1)',
                            }}
                          >
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: '#F0F8FF',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            color: '#EC4899',
                            textShadow: '0 0 8px #EC4899',
                          }}
                        >
                          {user.totalPoints.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        <Grid container spacing={4} sx={{ mt: 4, alignItems: 'center' }}>
          {/* Left side - Claim Space Points */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                height: '100%',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  mb: 2,
                }}
              >
                Claim Space Points
              </Typography>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.7)"
                sx={{ mb: 3 }}
              >
                Submit the URL of a recorded Twitter Space where you were a
                speaker or the DJ to claim your points.
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                label="Twitter Space URL"
                value={spaceUrlForPoints}
                onChange={(e) => setSpaceUrlForPoints(e.target.value)}
                sx={{ mb: 2 }}
              />
              <LoadingButton
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleClaimSpacePoints}
                loading={isClaiming}
              >
                Claim Points
              </LoadingButton>
            </Paper>
          </Grid>

          {/* Right side - Countdown */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  background:
                    'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow:
                    '0 0 15px rgba(236, 72, 153, 0.2), 0 0 8px rgba(139, 92, 246, 0.15)',
                  mb: 3,
                  fontWeight: 'bold',
                }}
              >
                Launch Countdown
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <Grid item key={unit}>
                    <Paper
                      sx={{
                        p: 2,
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        width: '100px',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 'bold',
                          color: '#EC4899',
                          textShadow: '0 0 8px #EC4899',
                        }}
                      >
                        {String(value).padStart(2, '0')}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {unit}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 6, px: 4, textAlign: 'center' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: 'italic', opacity: 0.8 }}
          >
            Disclaimer: Songjam is constantly monitoring the timeline and spaces
            for spammy behaviour and may adjust the base points formula or the
            quality algorithm without notice if it appears the system is being
            nefariously farmed.
          </Typography>
        </Box>
      </Paper>

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

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  TextareaAutosize,
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents,
  Star,
  CheckCircle,
  ArrowForward,
  People,
  Analytics,
  AutoAwesome,
  Speed,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import Logo from '../components/Logo';
import LeaderboardDemo from '../components/LeaderboardDemo';
import { keyframes } from '@mui/system';
import { useAuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text as RechartsText,
} from 'recharts';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import SignPointsLeaderboard from '../components/SignPointsLeaderboard';

const electrifyPulse = keyframes`
  0% { text-shadow: 0 0 1px #60a5fa, 0 0 2px #60a5fa, 0 0 3px rgba(236, 72, 153, 0.5); }
  50% { text-shadow: 0 0 2px #60a5fa, 0 0 4px #60a5fa, 0 0 6px rgba(236, 72, 153, 0.8), 0 0 10px rgba(236, 72, 153, 0.4); }
  100% { text-shadow: 0 0 1px #60a5fa, 0 0 2px #60a5fa, 0 0 3px rgba(236, 72, 153, 0.5); }
`;

const panelBorderGlow = keyframes`
  0% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.5); }
  50% { box-shadow: 0 0 40px rgba(96, 165, 250, 0.9); }
  100% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.5); }
`;

const textPulse = keyframes`
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
`;

const testimonialGlow = keyframes`
  0% { filter: blur(8px) brightness(1.1); opacity: 0.85; }
  50% { filter: blur(16px) brightness(1.4); opacity: 1; }
  100% { filter: blur(8px) brightness(1.1); opacity: 0.85; }
`;

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
      'Yappers, Stakers, Contributors. 5% released from 19 Jul, 5% from 17 Aug, 90% released from 17 Sep 2025',
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
    <RechartsText
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
    </RechartsText>
  );
};

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialFade, setTestimonialFade] = useState(true);
  const [spaceUrlForPoints, setSpaceUrlForPoints] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calculateTimeLeft = () => {
      const launchDate = new Date('2025-09-17T12:00:00Z');
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

  const handleLanguageChange = async () => {
    // Language change logic if needed
  };

  const features = [
    {
      icon: <TrendingUp color="primary" />,
      title: 'Real-time Analytics',
      description: 'Track engagement, growth, and performance metrics in real-time',
    },
    {
      icon: <EmojiEvents color="primary" />,
      title: 'Competition Management',
      description: 'Create and manage leaderboards with custom scoring systems',
    },
    {
      icon: <People color="primary" />,
      title: 'Community Engagement',
      description: 'Foster community participation with gamified experiences',
    },
    {
      icon: <Analytics color="primary" />,
      title: 'Advanced Insights',
      description: 'Deep analytics and reporting for data-driven decisions',
    },
    {
      icon: <AutoAwesome color="primary" />,
      title: 'Custom Branding',
      description: 'White-label solutions with your brand identity',
    },
    {
      icon: <Speed color="primary" />,
      title: 'Lightning Fast',
      description: 'Optimized performance for seamless user experience',
    },
  ];

  const plans = [
    {
      name: 'Pre-TGE',
      price: '$SANG 100K',
      period: 'Deposit',
      features: [
        'Up to 1,000 participants',
        'Basic analytics dashboard',
        'Standard leaderboard templates',
        'Email support',
        'API access',
      ],
      popular: false,
    },
    {
      name: 'Post-TGE',
      price: '$SANG 1M',
      period: 'Deposit',
      features: [
        'Up to 10,000 participants',
        'Advanced analytics & insights',
        'Custom leaderboard designs',
        'Priority support',
        'Advanced API features',
        'Custom integrations',
        'White-label options',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Unlimited participants',
        'Custom development',
        'Dedicated support team',
        'SLA guarantees',
        'On-premise deployment',
        'Custom integrations',
        'Advanced security features',
      ],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Starlordy',
      role: 'CEO',
      company: 'ONI Force',
      content: 'Songam, was the main partner on our $EVA launch, they did not only provide the leaderboard, but were extremely available and on it all day, every day',
      avatar: '/logos/starlordy.png',
      tweetUrl: 'https://x.com/i/spaces/1kvJpyepDPbxE',
    },
    {
      name: 'Big.Wil',
      role: 'Host',
      company: 'Virtuals Weekly!',
      content: 'The Songjam team have quickly shipped an Ethos style slashing method where you flag for low effort content. I LOVE THIS.',
      avatar: '/logos/bigwil.png',
      tweetUrl: 'https://x.com/bigwil2k3/status/1941633549096059164',
    },
    {
      name: 'Crypto Von Doom',
      role: 'Co-Host',
      company: 'FYI',
      content: 'Design is flawless and they even break down the points equation on the left side of the page. Smart and leaves no ambiguity.',
      avatar: '/logos/vondoom.png',
      tweetUrl: 'https://x.com/CryptoVonDoom/status/1940927605013668295',
    },
  ];

  const handlePrevTestimonial = () => {
    setTestimonialFade(false);
    setTimeout(() => {
      setTestimonialIndex((testimonialIndex + testimonials.length - 1) % testimonials.length);
      setTestimonialFade(true);
    }, 250);
  };
  const handleNextTestimonial = () => {
    setTestimonialFade(false);
    setTimeout(() => {
      setTestimonialIndex((testimonialIndex + 1) % testimonials.length);
      setTestimonialFade(true);
    }, 250);
  };

  // Auto-cycle testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialFade(false);
      setTimeout(() => {
        setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
        setTestimonialFade(true);
      }, 250);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <main className="landing" style={{ paddingBottom: 0, marginBottom: 0 }}>
      <Background />
      
      {/* Header */}
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
              onClick={() => navigate('/spaces-crm')}
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
              Boost & Analyze X Spaces
            </Button>
          </Box>
        </Box>
      </nav>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: 'relative', zIndex: 1, pb: 0 }}>
        {/* Mind-blowing Hero Section with Demo */}
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 320, sm: 380, md: 420 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: { xs: 6, md: 10 },
            pt: { xs: 0, md: 0 },
            pb: { xs: 1, md: 4 },
            overflow: 'visible',
          }}
        >
          <Grid container spacing={{ xs: 4, md: 2 }} alignItems="flex-start" justifyContent="center">
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', height: '100%' }}>
              {/* Massive Animated Headline */}
              <Typography
                variant="h1"
                sx={{
                  mb: 2,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  background: 'linear-gradient(120deg, #60a5fa, #8b5cf6 40%, #ec4899 80%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow:
                    '0 2px 20px #60a5fa99, 0 4px 40px #8b5cf699, 0 8px 80px #ec489999, 0 1px 0 #fff',
                  animation: 'gradient 8s ease-in-out infinite, titleFloat 3s ease-in-out infinite',
                  backgroundSize: '200% 200%',
                  zIndex: 2,
                  position: 'relative',
                  filter: 'drop-shadow(0 0 32px #60a5fa88)',
                }}
              >
                Who $SANG?
              </Typography>
              {/* Subtitle with shimmer */}
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  color: 'var(--text-secondary)',
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem', lg: '1.6rem' },
                  maxWidth: '700px',
                  mx: 'auto',
                  position: 'relative',
                  zIndex: 2,
                  background: 'linear-gradient(90deg, #fff, #60a5fa, #fff)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s linear infinite',
                  fontWeight: 500,
                  textShadow: '0 2px 8px #0008',
                  textAlign: 'center',
                }}
              >
                Reward the top voices in your community through the fairest and most transparent leaderboards in Web3.
              </Typography>
              {/* Neon-glow CTA Button */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ zIndex: 2, mt: 1 }}>
                <a
                  href="https://docs.google.com/forms/d/1j3-2ZTkio3KvnK5bv6ac6ZcaJXXUKyguof4uIxXbQHE"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                <Button
                  variant="contained"
                  size="large"
                  className="primary"
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.3rem',
                    background: 'linear-gradient(90deg, #60a5fa, #8b5cf6, #ec4899)',
                    color: 'white',
                    borderRadius: '40px',
                    boxShadow: '0 0 32px #60a5fa88, 0 0 64px #ec489988',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    animation: 'pulseGlow 2s infinite',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #60a5fa)',
                      transform: 'scale(1.06) rotate(-1deg)',
                      boxShadow: '0 0 64px #ec4899cc, 0 0 128px #60a5facc',
                    },
                  }}
                >
                  Launch Now
                </Button>
                </a>
                <a
                  href="https://t.me/adamsongjam"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--text-secondary)',
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: '40px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    background: 'rgba(255,255,255,0.03)',
                    '&:hover': {
                      borderColor: 'white',
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Contact Us
                </Button>
                </a>
              </Stack>
              {/* Testimonial Carousel */}
              <Box sx={{ mt: { xs: 2, md: 4 }, mb: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card
                  sx={{
                    maxWidth: { xs: 350, sm: 420 },
                    minHeight: { xs: 200, sm: 240 },
                    p: { xs: 2, sm: 4 },
                    background: 'rgba(30,41,59,0.92)',
                    border: '1.5px solid rgba(96,165,250,0.25)',
                    boxShadow: '0 4px 32px #60a5fa33',
                    borderRadius: 5,
                    textAlign: 'center',
                    position: 'relative',
                    opacity: testimonialFade ? 1 : 0,
                    transition: 'opacity 0.4s cubic-bezier(.4,0,.2,1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    {/* Glowing animated ring */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        zIndex: 1,
                        background: 'conic-gradient(from 0deg, #60a5fa, #8b5cf6, #ec4899, #60a5fa)',
                        filter: 'blur(8px)',
                        animation: 'testimonialGlow 3s linear infinite',
                      }}
                    />
                    {/* White border ring */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 104,
                        height: 104,
                        borderRadius: '50%',
                        border: '4px solid #fff',
                        zIndex: 2,
                      }}
                    />
                    <Avatar
                      sx={{
                        bgcolor: 'var(--accent)',
                        width: 96,
                        height: 96,
                        fontSize: 44,
                        zIndex: 3,
                        boxShadow: '0 0 0 8px #60a5fa33, 0 0 48px #8b5cf6aa',
                        position: 'relative',
                      }}
                      src={testimonials[testimonialIndex].avatar}
                    >
                      {!testimonials[testimonialIndex].avatar && testimonials[testimonialIndex].name[0]}
                    </Avatar>
                  </Box>
                  <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, mt: 1, mb: 0.5 }}>
                    {testimonials[testimonialIndex].name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                    {testimonials[testimonialIndex].role} at {testimonials[testimonialIndex].company}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontStyle: 'italic', mb: 2, fontSize: '1.15rem', lineHeight: 1.5 }}>
                    {testimonials[testimonialIndex].tweetUrl ? (
                      <a
                        href={testimonials[testimonialIndex].tweetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                      >
                    "{testimonials[testimonialIndex].content}"
                      </a>
                    ) : (
                      `"${testimonials[testimonialIndex].content}"`
                    )}
                  </Typography>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', height: '100%' }}>
              <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', mt: { xs: 4, md: 0 } }}>
                <LeaderboardDemo />
              </Box>
            </Grid>
          </Grid>
          {/* Scroll Down Indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: 0.7,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '2px solid #60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                animation: 'bounce 2s infinite',
              }}
            >
              <ArrowForward sx={{ transform: 'rotate(90deg)', color: '#60a5fa', fontSize: 24 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700 }}>
              Scroll
            </Typography>
          </Box>
        </Box>

        {/* Tokenomics Section (full content from App.tsx) */}
        <Box
          className="tokenomics"
          id="tokenomics-section"
          sx={{
            mt: { xs: 6, md: 10 },
            textAlign: 'center',
            py: { xs: 4, md: 8 },
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '1400px',
            mx: 'auto',
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
              maxWidth: '900px',
              margin: '0 auto 3rem',
              lineHeight: '1.6',
            }}
          >
            Understanding the framework behind the $SANG token, designed for sustainable growth and community engagement.
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
              maxWidth: '1300px',
              margin: '0 auto',
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
              <Grid item xs={12} md={6} lg={7}>
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
                                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                                e.currentTarget.style.filter = 'brightness(1)';
                              }}
                            />
                          );
                        })}
                      </Pie>
                      <RechartsText
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
                      </RechartsText>
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
                      animation: `${panelBorderGlow} 4s infinite ease-in-out`,
                      zIndex: -1,
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6} lg={5}>
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
        </Box>

        {/* Leaderboard Section (full content from App.tsx) */}
        <Box
          className="leaderboard"
          id="leaderboard-section"
          sx={{
            mt: { xs: 6, md: 10 },
            p: { xs: 2, sm: 3, md: 4 },
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow:
              '0 3px 15px rgba(139, 92, 246, 0.1), 0 0 10px rgba(236, 72, 153, 0.08)',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
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
                  Sing points are calculated based on your engagement metrics and when you participate. The earlier you engage, the more Sing points you get! Each interaction tagging{' '}
                  <a
                    href="https://x.com/songjamspace"
                    target="_blank"
                    rel="noopener"
                    style={{ color: '#60a5fa', fontWeight: 'bold', textDecoration: 'none' }}
                  >
                    @SongjamSpace
                  </a>{' '}
                  or mentioning{' '}
                  <a
                    href="https://x.com/search?q=%24SANG&src=cashtag_click"
                    target="_blank"
                    rel="noopener"
                    style={{ color: '#60a5fa', fontWeight: 'bold', textDecoration: 'none' }}
                  >
                    $SANG
                  </a>{' '}
                  contributes to your score, with a special multiplier for early participation.
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
                    {`S_{\\text{base}} = \\begin{gathered} \\underbrace{((L \\cdot 0.2) + (R \\cdot 0.4) + (B \\cdot 0.4) + (RT \\cdot 0.6) + (QT \\cdot 1.0))}_{\\text{Engagement Points}} \\\\[1em] + \\underbrace{((SY \\cdot 5 + DJ \\cdot 10) \\cdot N_{\\text{listeners}} \\div S)}_{\\text{Space Points}} \\end{gathered}`}
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
                    Your base score is a sum of <strong>Engagement Points</strong> from interactions (Likes, Replies, Bookmarks, Retweets, Quote Tweets) and <strong>Space Points</strong>, which are awarded for speaking (SY) or DJing (DJ) and are multiplied by the number of listeners (N <sub>listeners</sub>), divided by the number of speakers (S).
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
                  Engagement Boosters
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
                    {`\\text{Booster} = \\begin{cases} 2.0 & \\text{if } \\text{engagement} \\geq \\text{high threshold} \\\\ 1.5 & \\text{if } \\text{engagement} \\geq \\text{low threshold} \\\\ 1.0 & \\text{otherwise} \\end{cases}`}
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
                    Your engagement score gets boosted based on the performance of your tweets. Here are the thresholds:
                  </Typography>
                        <Box
                          sx={{
                      mt: 2,
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="#F0F8FF"
                      sx={{ opacity: 0.8, whiteSpace: 'nowrap' }}
                    >
                      • Likes: 2.0x (100+), 1.5x (50+)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#F0F8FF"
                      sx={{ opacity: 0.8 }}
                    >
                      • Replies: 2.0x (20+), 1.5x (10+)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#F0F8FF"
                      sx={{ opacity: 0.8 }}
                    >
                      • Retweets: 2.0x (30+), 1.5x (15+)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#F0F8FF"
                      sx={{ opacity: 0.8 }}
                    >
                      • Quote Tweets: 2.0x (15+), 1.5x (8+)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#F0F8FF"
                      sx={{ opacity: 0.8 }}
                    >
                      • Bookmarks: 2.0x (25+), 1.5x (12+)
                    </Typography>
                  </Box>
                </Paper>
              </Box>
              <Box sx={{ mb: 4 }}>
                        <Box
                          sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    gap: 2,
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="h5"
                          sx={{
                      background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 8px rgba(236, 72, 153, 0.1)',
                      fontWeight: 'bold',
                    }}
                  >
                    Early Multiplier
                        </Typography>
                  <Chip
                    label="Expired"
                    color="error"
                    variant="outlined"
                    size="small"
                  />
                      </Box>
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
                    {`\\text{earlyMultiplier} = 1 + 99 \\times \\frac{\\max(0, T_{genesis} - T_{post})}{604800}`}
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
                    Applies to posts up to 1 week before genesis. Maximum multiplier is 100x.
                    </Typography>
                </Paper>
              </Box>
              </Grid>
            {/* Right Column - Leaderboard */}
            <Grid item xs={12} md={8}>
              <SignPointsLeaderboard />
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
                  Submit the URL of a recorded Twitter Space where you were a speaker or the DJ to claim your points.
          </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Twitter Space URL"
                  value={spaceUrlForPoints}
                  onChange={(e) => setSpaceUrlForPoints(e.target.value)}
                  sx={{ mb: 2 }}
                />
            <Button
                  fullWidth
              variant="contained"
                  color="primary"
                  // Replace with your claim handler if needed
                >
                  Claim Points
                </Button>
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
                  Genesis Release
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
              Disclaimer: Songjam is constantly monitoring the timeline and spaces for spammy behaviour and may adjust the base points formula or the quality algorithm without notice if it appears the system is being nefariously farmed.
            </Typography>
          </Box>
        </Box>

        {/* Honors Section (copy from App.tsx) */}
        <Box
          className="honors"
          id="honors-section"
          sx={{ 
            mt: { xs: 4, md: 6 },
            textAlign: 'center'
          }}
        >
          <Box sx={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '40px 20px',
            maxWidth: '800px',
            margin: '0 auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ marginBottom: '10px' }}>Honors</h2>
            <p style={{ marginBottom: '30px', fontSize: '0.9rem', color: '#ffffff !important', fontWeight: 'normal' }}>Recognized by leading organizations in the Web3 space.</p>
            <div className="honors-grid" style={{ 
              gap: '15px', 
              maxWidth: '700px', 
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <div className="honor-item" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              padding: '15px 10px'
            }}>
              <img src="/logos/chainlink.png" alt="Chainlink" className="honor-logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Chainlink</span>
            </div>
            <div className="honor-item" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              padding: '15px 10px'
            }}>
              <img src="/logos/coinbase.png" alt="Coinbase" className="honor-logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Coinbase</span>
            </div>
            <div className="honor-item" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              padding: '15px 10px'
            }}>
              <img src="/logos/coindesk.png" alt="Coindesk" className="honor-logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Coindesk</span>
            </div>
            <div className="honor-item" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              padding: '15px 10px'
            }}>
              <img src="/logos/filecoin.png" alt="Filecoin" className="honor-logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Filecoin</span>
            </div>
            <div className="honor-item" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              padding: '15px 10px'
            }}>
              <img src="/logos/moonbeam.png" alt="Moonbeam" className="honor-logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Moonbeam</span>
            </div>
            <div className="honor-item" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              padding: '15px 10px'
            }}>
              <img src="/logos/nethermind.png" alt="Nethermind" className="honor-logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Nethermind</span>
            </div>
            <div className="honor-item" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              padding: '15px 10px'
            }}>
              <img src="/logos/oniforce.png" alt="ONI Force" className="honor-logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>ONI Force</span>
            </div>
            <div className="honor-item" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px',
              padding: '15px 10px'
            }}>
              <img src="/logos/polkadot.png" alt="Polkadot" className="honor-logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Polkadot</span>
            </div>
          </div>
          </Box>
        </Box>

        {/* Contact Section (copy from App.tsx) */}
        <section className="contact" id="contact-section">
          <h2>Contact</h2>
          <p>Get in touch with us for more information or support.</p>
          <form className="contact-form">
            <div className="form-group">
              <TextField fullWidth placeholder="Name" variant="outlined" name="name" required inputProps={{ minLength: 2 }} />
            </div>
            <div className="form-group">
              <TextField fullWidth placeholder="Telegram" variant="outlined" name="telegram" required inputProps={{ pattern: '@.*' }} helperText="Start with @" />
            </div>
            <div className="form-group">
              <TextField fullWidth type="email" placeholder="Email" variant="outlined" name="email" required />
            </div>
            <div className="form-group">
              <TextareaAutosize placeholder="Message" name="message" required minLength={10} style={{ width: '100%', minHeight: '100px' }} />
            </div>
            <Button type="submit" variant="contained" className="primary">
              Submit
            </Button>
          </form>
        </section>
                <Box
          className="social-media"
          sx={{
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            padding: '40px 20px',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 0,
          }}
        >
          <h2>Connect With Us</h2>
          <Box display="flex" flexWrap="wrap" gap={6} justifyContent="center">
            <a
              href="https://www.producthunt.com/posts/songjam-otter-ai-for-x-spaces"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <img src="/logos/product-hunt.png" alt="Product Hunt" />
              <span>Product Hunt</span>
            </a>
            <a
              href="https://github.com/songjamspace"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <img src="/logos/github.png" alt="GitHub" />
              <span>GitHub</span>
            </a>
            <a
              href="https://x.com/intent/follow?screen_name=SongjamSpace"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <img src="/logos/twitter.png" alt="Twitter" />
              <span>Twitter</span>
            </a>
            <a
              href="https://www.linkedin.com/company/songjam/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <img src="/logos/linkedin.png" alt="LinkedIn" />
              <span>LinkedIn</span>
            </a>
          </Box>
        </Box>
        <Box
          className="footer"
          sx={{
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            marginTop: 0,
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <p>© 2025 Songjam. All rights reserved.</p>
        </Box>
      </Container>
    </main>
  );
};

export default Leaderboard; 
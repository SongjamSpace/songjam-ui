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

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialFade, setTestimonialFade] = useState(true);

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
      content: 'The Songjam leaderboard was a hit during our $EVA campaign, helping us open at a $2.2M Market Cap completely organically.',
      avatar: 'SC',
    },
    {
      name: 'Mike Rodriguez',
      role: 'Product Manager',
      company: 'GameStudio',
      content: 'The Songjam team have quickly shipped an Ethos style slashing method where you flag for low effort content. I LOVE THIS.',
      avatar: 'MR',
    },
    {
      name: 'Emily Watson',
      role: 'Marketing Director',
      company: 'StartupXYZ',
      content: 'Perfect for our gamification strategy. The real-time updates keep users engaged and coming back.',
      avatar: 'EW',
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
    <main className="landing">
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
              X Spaces CRM
            </Button>
          </Box>
        </Box>
      </nav>

      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Mind-blowing Hero Section with Demo */}
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 420, md: 480 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 10,
            pt: { xs: 2, md: 4 },
            pb: { xs: 2, md: 4 },
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
                  fontSize: { xs: '3rem', md: '5.5rem' },
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
                  fontSize: { xs: '1.2rem', md: '1.6rem' },
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
                The fairest and most transparent leaderboards in Web3. Powered by AI, public weights and community driven reputation systems.
              </Typography>
              {/* Neon-glow CTA Button */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ zIndex: 2, mt: 1 }}>
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
                  onClick={() => navigate('/spaces-crm')}
                >
                  Launch Now
                </Button>
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
              </Stack>
              {/* Testimonial Carousel */}
              <Box sx={{ mt: 4, mb: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card
                  sx={{
                    maxWidth: 420,
                    minHeight: 240,
                    p: 4,
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
                    >
                      {testimonials[testimonialIndex].avatar}
                    </Avatar>
                  </Box>
                  <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, mt: 1, mb: 0.5 }}>
                    {testimonials[testimonialIndex].name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                    {testimonials[testimonialIndex].role} at {testimonials[testimonialIndex].company}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontStyle: 'italic', mb: 2, fontSize: '1.15rem', lineHeight: 1.5 }}>
                    "{testimonials[testimonialIndex].content}"
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

        {/* Features Section */}
        <Box mb={8}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 6,
              color: 'var(--text-primary)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Powerful Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      border: '1px solid rgba(96, 165, 250, 0.5)',
                      boxShadow: '0 8px 32px rgba(96, 165, 250, 0.2)',
                      animation: `${panelBorderGlow} 2s infinite`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Pricing Section */}
        <Box mb={8}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 6,
              color: 'var(--text-primary)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Choose Your Plan
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: plan.popular 
                      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(139, 92, 246, 0.1))'
                      : 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: plan.popular 
                      ? '2px solid rgba(96, 165, 250, 0.5)'
                      : '1px solid rgba(96, 165, 250, 0.2)',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 32px rgba(96, 165, 250, 0.2)',
                    },
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1,
                        background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: 'var(--text-primary)', mb: 1, fontWeight: 700 }}>
                      {plan.name}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h3" sx={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                        {plan.price}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
                        {plan.period}
                      </Typography>
                    </Box>
                    <List sx={{ textAlign: 'left', mb: 3 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle sx={{ color: 'var(--accent)', fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            sx={{
                              '& .MuiListItemText-primary': {
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem',
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={plan.popular ? 'contained' : 'outlined'}
                      size="large"
                      className={plan.popular ? 'primary' : ''}
                      sx={{
                        background: plan.popular 
                          ? 'linear-gradient(135deg, #60a5fa, #8b5cf6)'
                          : 'transparent',
                        color: 'white',
                        borderColor: 'rgba(96, 165, 250, 0.5)',
                        '&:hover': {
                          background: plan.popular 
                            ? 'linear-gradient(135deg, #8b5cf6, #60a5fa)'
                            : 'rgba(96, 165, 250, 0.1)',
                          borderColor: 'var(--accent)',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Box mb={8}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 6,
              color: 'var(--text-primary)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            What Our Customers Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      border: '1px solid rgba(96, 165, 250, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 2 }}>
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
                        >
                          {testimonial.avatar}
                        </Avatar>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            p: 6,
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            border: '1px solid rgba(96, 165, 250, 0.3)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(139, 92, 246, 0.1))',
              zIndex: -1,
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              color: 'var(--text-primary)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ready to Launch Your Leaderboard?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Join thousands of communities already using our leaderboard platform to drive engagement and growth.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              className="primary"
              sx={{
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8b5cf6, #60a5fa)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(96, 165, 250, 0.4)',
                },
              }}
            >
              Start Your Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--text-secondary)',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                '&:hover': {
                  borderColor: 'white',
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Schedule Demo
            </Button>
          </Stack>
        </Box>
      </Container>
    </main>
  );
};

export default Leaderboard; 
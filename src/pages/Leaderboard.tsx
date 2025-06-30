import React, { useState } from 'react';
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

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');

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
      name: 'Sarah Chen',
      role: 'Community Manager',
      company: 'TechCorp',
      content: 'The leaderboard feature has increased our community engagement by 300%. Our users love the competitive aspect!',
      avatar: 'SC',
    },
    {
      name: 'Mike Rodriguez',
      role: 'Product Manager',
      company: 'GameStudio',
      content: 'Easy to implement and highly customizable. The analytics help us understand user behavior better.',
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
              variant="outlined"
              size="small"
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
        </Box>
      </nav>

      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
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
            Launch a Leaderboard
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              maxWidth: '800px',
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
            Transform your community engagement with powerful, customizable leaderboards. 
            Drive participation, foster competition, and reward your most active members.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              className="primary"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8b5cf6, #60a5fa)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(96, 165, 250, 0.4)',
                },
              }}
            >
              Start Building
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--text-secondary)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              View Demo
            </Button>
          </Stack>
        </Box>

        {/* Live Demo Section */}
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
            See It In Action
          </Typography>
          <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            <LeaderboardDemo />
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
                      <Avatar
                        sx={{
                          bgcolor: 'var(--accent)',
                          mr: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
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
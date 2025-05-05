import { CheckIcon } from '@dynamic-labs/sdk-react-core';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
} from '@mui/material';
import { t } from 'i18next';
import { SongjamUser } from '../services/db/user.service';
import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';

type Props = {
  onSubscribe: (plan: 'free' | 'pro' | 'business') => void;
  user: SongjamUser | null;
};

const PricingBanner = ({ onSubscribe, user }: Props) => {
  const [loadingBtnId, setLoadingBtnId] = useState<string | null>(null);
  return (
    <section className="pricing">
      <Typography
        variant="h2"
        sx={{
          textAlign: 'center',
          mb: 6,
          fontSize: '2rem',
          fontWeight: 700,
          // background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
          // WebkitBackgroundClip: 'text',
          // WebkitTextFillColor: 'transparent',
        }}
      >
        {t('pricingTitle', 'Pricing')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          justifyContent: 'center',
          alignItems: 'stretch',
          maxWidth: '1200px',
          mx: 'auto',
          px: 3,
        }}
      >
        {/* Free Plan */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            flex: 1,
            maxWidth: { xs: '100%', md: '300px' },
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: 3,
            border: '1px solid rgba(96, 165, 250, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-8px)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: 'var(--text-primary)' }}>
            Free
          </Typography>
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            $0
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: 'var(--text-secondary)' }}
          >
            Perfect for trying out Songjam
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <List sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="3 Spaces" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Upto 3 Hours of Transcription" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="50 AI Assistant Requests" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Community support" />
              </ListItem>
            </List>
          </Box>
          {user?.currentPlan === 'free' ? (
            <Chip label="Current Plan" />
          ) : (
            <LoadingButton
              loading={loadingBtnId === 'free'}
              disabled={!!loadingBtnId}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: 'var(--text-secondary)',
                color: 'var(--text-secondary)',
                '&:hover': {
                  borderColor: 'white',
                  color: 'white',
                },
              }}
              onClick={() => {
                setLoadingBtnId('free');
                onSubscribe('free');
              }}
            >
              Get Started
            </LoadingButton>
          )}
        </Paper>

        {/* Pro Plan */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
            flex: 1,
            maxWidth: { xs: '100%', md: '300px' },
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: 3,
            border: '2px solid #60a5fa',
            display: 'flex',
            flexDirection: 'column',
            transform: 'scale(1.05)',
            '&:hover': {
              transform: 'scale(1.05) translateY(-8px)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: '#60a5fa',
              color: 'white',
              px: 2,
              py: 0.5,
              borderBottomLeftRadius: 3,
              fontSize: '0.875rem',
            }}
          >
            Popular
          </Box>
          <Typography variant="h5" sx={{ mb: 2, color: 'var(--text-primary)' }}>
            Pro
          </Typography>
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            $25 <span style={{ fontSize: '0.8rem' }}> /month</span>
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: 'var(--text-secondary)' }}
          >
            For power users & content creators
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <List sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Unlimited Spaces" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Upto 20 Hours of Transcription" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="200 AI Assistant Requests" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Priority support" />
              </ListItem>
            </List>
          </Box>
          {user?.currentPlan === 'pro' ? (
            <Chip label="Current Plan" />
          ) : (
            <LoadingButton
              loading={loadingBtnId === 'pro'}
              disabled={!!loadingBtnId}
              variant="contained"
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                },
              }}
              onClick={() => {
                setLoadingBtnId('pro');
                onSubscribe('pro');
              }}
            >
              Get Started
            </LoadingButton>
          )}
        </Paper>

        {/* Business Plan */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            flex: 1,
            maxWidth: { xs: '100%', md: '300px' },
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: 3,
            border: '1px solid rgba(96, 165, 250, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-8px)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: 'var(--text-primary)' }}>
            Business
          </Typography>
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            $100
            <span style={{ fontSize: '0.8rem' }}>/user/month</span>
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: 'var(--text-secondary)' }}
          >
            For teams and enterprises
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <List sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Unlimited Spaces" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Unlimited Hours of Transcription" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Unlimited AI Assistant Requests" />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary="Dedicated support" />
              </ListItem>
            </List>
          </Box>
          {user?.currentPlan === 'business' ? (
            <Chip label="Current Plan" />
          ) : (
            <LoadingButton
              loading={loadingBtnId === 'business'}
              disabled={!!loadingBtnId}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: 'var(--text-secondary)',
                color: 'var(--text-secondary)',
                '&:hover': {
                  borderColor: 'white',
                  color: 'white',
                },
              }}
              onClick={() => {
                setLoadingBtnId('business');
                onSubscribe('business');
              }}
            >
              Get Started
            </LoadingButton>
          )}
        </Paper>
      </Box>
    </section>
  );
};

export default PricingBanner;

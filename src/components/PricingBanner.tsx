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
  onSubscribe: (plan: 'free' | 'starter' | 'pro' | 'business') => void;
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
            {t('freePlanTitle')}
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
            {t('freePlanSubtitle')}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <List sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('freePlanFeatures.spaces')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('freePlanFeatures.autoDMs')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('freePlanFeatures.aiRequests')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('freePlanFeatures.support')} />
              </ListItem>
            </List>
          </Box>
          {user?.currentPlan === 'free' ? (
            <Chip label={t('currentPlanChip')} />
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
              {t('getStartedButton')}
            </LoadingButton>
          )}
        </Paper>

        {/* Starter Pack */}
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
            {t('starterPackTitle')}
          </Typography>
          <Box sx={{ mb: 2, position: 'relative', pt: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--text-secondary)',
                textDecoration: 'line-through',
                position: 'absolute',
                top: 0,
                left: 0,
                opacity: 0.7,
                fontSize: '1.1rem',
              }}
            >
              $20
            </Typography>
            <Typography
              variant="h3"
              sx={{
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
              }}
            >
              $10
              <Typography
                component="span"
                sx={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                {t('perPack')}
              </Typography>
            </Typography>
            <Chip
              label={t('discountChip')}
              size="small"
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bgcolor: '#10b981',
                color: 'white',
                fontSize: '0.75rem',
                height: '20px',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: '#10b981',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              animation: 'glow 2s infinite',
              '@keyframes glow': {
                '0%': {
                  textShadow: '0 0 5px rgba(16, 185, 129, 0.4)',
                },
                '50%': {
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
                },
                '100%': {
                  textShadow: '0 0 5px rgba(16, 185, 129, 0.4)',
                },
              },
            }}
          >
            {t('limitedOfferText')}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: 'var(--text-secondary)' }}
          >
            {t('starterPackSubtitle')}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <List sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('starterPackFeatures.spaces')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('starterPackFeatures.autoDMs')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('starterPackFeatures.aiRequests')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('starterPackFeatures.support')} />
              </ListItem>
            </List>
          </Box>
          {user?.currentPlan === 'starter' ? (
            <Chip label={t('currentPlanChip')} />
          ) : (
            <LoadingButton
              loading={loadingBtnId === 'starter'}
              disabled={!!loadingBtnId}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: '#60a5fa',
                color: '#60a5fa',
                '&:hover': {
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  bgcolor: 'rgba(96, 165, 250, 0.1)',
                },
              }}
              onClick={() => {
                setLoadingBtnId('starter');
                onSubscribe('starter');
              }}
            >
              {t('buyNowButton')}
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
              borderTopRightRadius: 8,
              fontSize: '0.875rem',
            }}
          >
            {t('popularChip')}
          </Box>
          <Typography variant="h5" sx={{ mb: 2, color: 'var(--text-primary)' }}>
            {t('proPlanTitle')}
          </Typography>
          <Box sx={{ mb: 2, position: 'relative', pt: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--text-secondary)',
                textDecoration: 'line-through',
                position: 'absolute',
                top: 0,
                left: 0,
                opacity: 0.7,
                fontSize: '1.1rem',
              }}
            >
              $50
            </Typography>
            <Typography
              variant="h3"
              sx={{
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
              }}
            >
              $25
              <Typography
                component="span"
                sx={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                {t('perMonth')}
              </Typography>
            </Typography>
            <Chip
              label={t('discountChip')}
              size="small"
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bgcolor: '#10b981',
                color: 'white',
                fontSize: '0.75rem',
                height: '20px',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: '#10b981',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              animation: 'glow 2s infinite',
              '@keyframes glow': {
                '0%': {
                  textShadow: '0 0 5px rgba(16, 185, 129, 0.4)',
                },
                '50%': {
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
                },
                '100%': {
                  textShadow: '0 0 5px rgba(16, 185, 129, 0.4)',
                },
              },
            }}
          >
            {t('limitedOfferText')}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: 'var(--text-secondary)' }}
          >
            {t('proPlanSubtitle')}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <List sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('proPlanFeatures.spaces')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('proPlanFeatures.autoDMs')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('proPlanFeatures.aiRequests')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('proPlanFeatures.support')} />
              </ListItem>
            </List>
          </Box>
          {user?.currentPlan === 'pro' ? (
            <Chip label={t('currentPlanChip')} />
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
              {t('getStartedButton')}
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
            {t('businessPlanTitle')}
          </Typography>
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                textAlign: 'center',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
              }}
            >
              Growth Kit
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: 'var(--text-secondary)' }}
          >
            {t('businessPlanSubtitle')}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <List sx={{ mb: 3 }}>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('businessPlanFeatures.unlimited')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('businessPlanFeatures.support')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('businessPlanFeatures.privacy')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('businessPlanFeatures.encryption')} />
              </ListItem>
              <ListItem sx={{ px: 0, color: 'var(--text-secondary)' }}>
                <ListItemIcon sx={{ minWidth: 40, color: '#60a5fa' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={t('businessPlanFeatures.tls')} />
              </ListItem>
            </List>
          </Box>
          {user?.currentPlan === 'business' ? (
            <Chip label={t('currentPlanChip')} />
          ) : (
            <LoadingButton
              loading={loadingBtnId === 'business'}
              disabled={!!loadingBtnId}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: '#60a5fa',
                color: '#60a5fa',
                '&:hover': {
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  bgcolor: 'rgba(96, 165, 250, 0.1)',
                },
              }}
              onClick={() => {
                window.open('https://calendly.com/songjam', '_blank');
              }}
            >
              Schedule a Call
            </LoadingButton>
          )}
        </Paper>
      </Box>
    </section>
  );
};

export default PricingBanner;

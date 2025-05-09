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
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            $25 <span style={{ fontSize: '0.8rem' }}>{t('perMonth')}</span>
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
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            $200
            <span style={{ fontSize: '0.8rem' }}>{t('perUserPerMonth')}</span>
          </Typography>
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
              {t('getStartedButton')}
            </LoadingButton>
          )}
        </Paper>
      </Box>
    </section>
  );
};

export default PricingBanner;

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Grid,
  Avatar,
  Button,
  Chip,
  Switch,
  Tooltip,
  LinearProgress,
  Stack,
  IconButton,
  Skeleton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAuthContext } from '../contexts/AuthContext';
import ProjectList from '../components/ProjectList';
import { getPlanLimits } from '../utils';
import Close from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import LoginDialog from '../components/LoginDialog';
import Background from '../components/Background';
import { createCheckoutSession } from '../services/db/stripe';
import { LoadingButton } from '@mui/lab';

const Settings = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState('');

  const planLimits = getPlanLimits(user?.currentPlan || 'free');

  useEffect(() => {
    if (!user) {
      setShowAuthDialog(true);
    } else if (user) {
      setShowAuthDialog(false);
    }
  }, [user]);

  const renderSkeleton = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Skeleton variant="circular" width={56} height={56} />
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    </Box>
  );

  const renderUsageSkeleton = () => (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Box sx={{ flexGrow: 1 }} />
          <Skeleton variant="text" width="20%" height={20} />
        </Box>
        <Skeleton
          variant="rectangular"
          height={8}
          sx={{ borderRadius: 4, mb: 1 }}
        />
        <Skeleton variant="text" width="80%" height={16} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Box sx={{ flexGrow: 1 }} />
          <Skeleton variant="text" width="20%" height={20} />
        </Box>
        <Skeleton
          variant="rectangular"
          height={8}
          sx={{ borderRadius: 4, mb: 1 }}
        />
        <Skeleton variant="text" width="80%" height={16} />
      </Grid>
    </Grid>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        pb: 8,
      }}
    >
      <Background />
      <Container
        maxWidth="lg"
        sx={{ pt: 3, pb: 4, position: 'relative', zIndex: 1, flexGrow: 1 }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, fontSize: { xs: 36, md: 48 }, mb: 1 }}
          >
            Settings
          </Typography>
          <IconButton onClick={() => navigate(-1)}>
            <Close />
          </IconButton>
        </Stack>
        <Typography
          variant="subtitle1"
          sx={{ color: 'rgba(255,255,255,0.6)', mb: 5, fontSize: 20 }}
        >
          You can manage your account, billing, and team settings here.
        </Typography>
        <Grid container spacing={4} alignItems="flex-start">
          {/* Left Column */}
          <Grid item xs={12} md={5}>
            {/* Basic Info */}
            <Paper
              sx={{
                bgcolor: '#181a20',
                borderRadius: 4,
                p: 4,
                mb: 4,
                boxShadow: '0 2px 16px 0 #0002',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Basic Information
              </Typography>
              <Divider sx={{ borderColor: '#222', mb: 2 }} />
              {loading || !user ? (
                renderSkeleton()
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    mb: 2,
                    // justifyContent: 'space-between',
                  }}
                >
                  <Typography fontWeight={'bolder'}>Email</Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              )}
            </Paper>
            {/* Account Card */}
            <Paper
              sx={{
                bgcolor: '#181a20',
                borderRadius: 4,
                p: 4,
                mb: 4,
                boxShadow: '0 2px 16px 0 #0002',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Account
                </Typography>
                {loading || !user ? (
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={24}
                    sx={{ borderRadius: 1 }}
                  />
                ) : (
                  <Chip
                    label={user?.currentPlan?.toUpperCase() || 'FREE'}
                    size="small"
                    variant="outlined"
                    sx={{
                      ml: 1,
                      bgcolor: '#23262f',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  />
                )}
                {user?.currentPlan === 'free' && (
                  <LoadingButton
                    loading={loadingBtn === 'pro'}
                    variant="contained"
                    sx={{
                      ml: 2,
                      bgcolor: '#23262f',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 2,
                      '&:hover': { bgcolor: '#2d313c' },
                    }}
                    size="small"
                    onClick={async () => {
                      if (!user) return;
                      setLoadingBtn('pro');
                      await createCheckoutSession(user?.uid || '', 'pro');
                    }}
                  >
                    UPGRADE TO PRO
                  </LoadingButton>
                )}
                {user?.currentPlan === 'pro' && (
                  <LoadingButton
                    loading={loadingBtn === 'business'}
                    variant="contained"
                    sx={{
                      ml: 2,
                      bgcolor: '#23262f',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 2,
                      '&:hover': { bgcolor: '#2d313c' },
                    }}
                    size="small"
                    onClick={async () => {
                      if (!user) return;
                      setLoadingBtn('business');
                      await createCheckoutSession(user?.uid || '', 'business');
                    }}
                  >
                    UPGRADE TO BUSINESS
                  </LoadingButton>
                )}
              </Box>
              <Button
                variant="outlined"
                sx={{
                  mt: 2,
                }}
              >
                Manage Subscription
              </Button>
            </Paper>
          </Grid>
          {/* Right Column */}
          <Grid item xs={12} md={7}>
            {/* Usage Card */}
            <Paper
              sx={{
                bgcolor: '#181a20',
                borderRadius: 4,
                p: 4,
                mb: 4,
                boxShadow: '0 2px 16px 0 #0002',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Usage
              </Typography>
              <Box
                sx={{
                  bgcolor: '#15161c',
                  borderRadius: 3,
                  p: 3,
                  mb: 3,
                  border: '1px solid #23262f',
                }}
              >
                {loading || !user ? (
                  renderUsageSkeleton()
                ) : (
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Spaces
                        </Typography>
                        <InfoOutlinedIcon
                          sx={{
                            fontSize: 18,
                            ml: 1,
                            color: 'rgba(255,255,255,0.5)',
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {user?.usage.spaces} / {planLimits.spaces}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (user?.usage.spaces || 0 / planLimits.spaces) * 100
                        }
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#23262f',
                          '& .MuiLinearProgress-bar': { bgcolor: '#7ee787' },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        You've used {user?.usage.spaces} spaces out of your{' '}
                        {planLimits.spaces} spaces quota.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Chat Assistant
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {user?.usage.aiAssistantRequests} /{' '}
                          {planLimits.aiAssistantRequests}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (user?.usage.aiAssistantRequests ||
                            0 / planLimits.aiAssistantRequests) * 100
                        }
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#23262f',
                          '& .MuiLinearProgress-bar': { bgcolor: '#7ee787' },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        You've used {user?.usage.aiAssistantRequests} requests
                        out of your {planLimits.aiAssistantRequests} AI
                        Assistant requests quota.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={12}>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Auto DMs
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {user?.usage.autoDms} / {planLimits.autoDms}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (user?.usage.autoDms || 0 / planLimits.autoDms) * 100
                        }
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#23262f',
                          '& .MuiLinearProgress-bar': { bgcolor: '#7ee787' },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        You've used {user?.usage.aiAssistantRequests} requests
                        out of your {planLimits.aiAssistantRequests} AI
                        Assistant requests quota.
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Box>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Projects
                </Typography>
                {loading || !user ? (
                  <Box sx={{ width: '100%' }}>
                    <Skeleton
                      variant="rectangular"
                      height={100}
                      sx={{ borderRadius: 2, mb: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      height={100}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                ) : (
                  <ProjectList />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <LoginDialog open={showAuthDialog && !loading} />
    </Box>
  );
};

export default Settings;

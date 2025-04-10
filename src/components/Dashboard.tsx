import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Container,
  TextField,
  Button,
  Paper,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  AppBar,
  Toolbar,
  Skeleton,
  Chip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Background from './Background';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import Logo from './Logo';
import { useAuthContext } from '../contexts/AuthContext';
import LoginDialog from './LoginDialog';
import {
  AgentOrg,
  createAgentOrg,
  getAgentsByUserId,
  updateSpaceToAgent,
  AgentOrgDoc,
} from '../services/db/agent.service';
import AgentSettingsDialog from './AgentSettingsDialog';
import { updateAgentOrg } from '../services/db/agent.service';
import { getRawSpaceFromX, getSpace } from '../services/db/spaces.service';
import { Space } from '../types/space.types';
import { transcribeSpace } from '../services/transcription.service';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { query, collection, where } from 'firebase/firestore';
import { db } from '../services/firebase.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [spaceUrl, setSpaceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [agentOrg, setAgentOrg] = useState<AgentOrgDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  // const [scheduledSpaces, loadingScheduled, errorScheduled] = useCollectionData(query(collection(db, 'spaces'), where('state', '==', 'Scheduled')))
  // const [liveSpaces, loadingLive, errorLive] = useCollectionData(query(collection(db, 'spaces'), where('state', '==', 'Running')))
  const [agentSpaces, loadingAgentSpaces, errorAgentSpaces] = useCollectionData(
    query(
      collection(db, 'spaces'),
      where('agentIds', 'array-contains', agentOrg?.id || '')
    )
  );
  const scheduledSpaces =
    agentSpaces?.filter((space) => space.state === 'Scheduled') ||
    ([] as Space[]);
  const liveSpaces =
    agentSpaces?.filter((space) => space.state === 'Running') ||
    ([] as Space[]);
  const completedSpaces =
    agentSpaces?.filter((space) => space.state === 'Ended') || ([] as Space[]);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    }
  }, [user, authLoading]);

  const analyzeSpace = async (spaceId: string) => {
    setIsLoading(true);
    if (agentOrg) {
      await updateSpaceToAgent(spaceId, agentOrg.id);
    }
    const spaceDoc = await getSpace(spaceId);
    if (spaceDoc) {
      if (spaceDoc.state === 'Ended') {
        navigate(`/crm/${spaceId}`);
      } else if (spaceDoc.state === 'Running') {
        navigate(`/live/${spaceId}`);
      }
      toast.success('Space already Exists', {
        duration: 3000,
      });
      return;
    }
    const space = await getRawSpaceFromX(spaceId);
    if (space) {
      const state = space.metadata.state;
      if (state === 'Ended') {
        const path = await transcribeSpace(spaceId);
        navigate(path); // Navigates to /crm/:spaceId
      } else if (state === 'Running') {
        await axios.post(
          `${import.meta.env.VITE_JAM_SERVER_URL}/listen-live-space`,
          { spaceId }
        );
        navigate(`/live/${spaceId}`);
      } // TODO: Add handling for 'Scheduled' state if needed later
    } else {
      toast.error('Error analyzing space, please try again', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  useEffect(() => {
    if (user) {
      setShowAuthDialog(false);
      // TODO: Fetch actual spaces data from your backend
      const fetchAgentOrg = async () => {
        if (user && user.uid) {
          const agentOrgs = await getAgentsByUserId(user.uid);
          if (agentOrgs.length > 0) {
            setAgentOrg(agentOrgs[0]);
          } else {
            setShowAgentSettings(true);
          }
        }
      };
      fetchAgentOrg();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const spaceId = searchParams.get('spaceId');
    if (agentOrg && spaceId) {
      analyzeSpace(spaceId);
    }
  }, [agentOrg]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleAddSpace = async () => {
    const spaceId = spaceUrl.split('/').pop()?.trim();
    if (isLoading || !spaceId) return;
    setIsLoading(true);

    // TODO: Implement logic similar to App.tsx handleAnalyze,
    // but potentially just add to a list or trigger analysis without navigating immediately.
    // For now, just log and show a message.
    console.log('Adding space:', spaceId);
    toast.success(`Processing space: ${spaceId}`, {
      position: 'bottom-right',
    });
    await analyzeSpace(spaceId);

    setSpaceUrl(''); // Clear input after submission
    setIsLoading(false);
  };

  const handleSaveAgentSettings = async (
    agentId?: string,
    updatedAgentOrg?: Partial<AgentOrg>
  ) => {
    if (!user?.uid) {
      toast.error(t('agentSettingsError', 'Error saving agent settings'));
      return;
    }
    try {
      if (agentId && updatedAgentOrg) {
        await updateAgentOrg(agentId, updatedAgentOrg);
      } else if (updatedAgentOrg) {
        await createAgentOrg({
          name: updatedAgentOrg.name || '',
          createdAt: Date.now(),
          createdUserId: user.uid,
          authorizedUsers: [user.uid],
        });
      }
      if (agentOrg) {
        setAgentOrg({ ...agentOrg, ...updatedAgentOrg });
      }
      toast.success(
        t('agentSettingsSaved', 'Agent settings saved successfully')
      );
    } catch (error) {
      console.error('Error saving agent settings:', error);
      toast.error(t('agentSettingsError', 'Error saving agent settings'));
    }
  };

  // Skeleton loading component for space list items
  const renderSpaceListSkeleton = (count: number = 3) => (
    <List sx={{ p: 1 }}>
      {Array.from({ length: count }).map((_, index) => (
        <ListItemButton
          key={index}
          sx={{
            mb: 1,
            borderRadius: 1,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            p: 2,
          }}
        >
          <ListItemText
            primary={<Skeleton variant="text" width="60%" />}
            secondary={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="30%" />
              </Box>
            }
          />
        </ListItemButton>
      ))}
    </List>
  );

  // Render function for Live and Completed lists
  const renderSpaceList = (
    spaces: Space[],
    loading: boolean,
    error: Error | null,
    listType: 'Live' | 'Completed'
  ) => {
    if (loading || !user) {
      return renderSpaceListSkeleton();
    }
    if (error) {
      return (
        <Typography color="error" sx={{ p: 3, color: '#f44336' }}>
          Error loading {listType} spaces: {error.message || 'Unknown error'}
        </Typography>
      );
    }
    if (!spaces || spaces.length === 0) {
      return (
        <Typography sx={{ p: 3, color: 'var(--text-secondary)' }}>
          No {listType} spaces found.
        </Typography>
      );
    }

    // Actual list rendering
    return (
      <List sx={{ p: 1 }}>
        {/* Add some padding around the list */}
        {spaces.map((space) => (
          <ListItemButton
            key={space.spaceId}
            sx={{
              mb: 1,
              borderRadius: 1,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              p: 2,
              alignItems: 'flex-start',
            }}
            onClick={() => {
              if (space.state === 'Running') {
                navigate(`/live/${space.spaceId}`);
              } else if (space.state === 'Ended') {
                navigate(`/crm/${space.spaceId}`);
              }
              // Add navigation for scheduled if needed, or maybe a modal?
            }}
          >
            <ListItemText
              primary={space.title || `Space ${space.spaceId}`}
              primaryTypographyProps={{
                color: 'var(--text-primary)',
                fontWeight: '500',
                mb: 1,
              }}
              secondaryTypographyProps={{
                component: 'div',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
              }}
              secondary={
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                >
                  {/* Speakers/Host Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    Speakers:
                    {space.speakers
                      ?.map((speaker) => speaker.displayName)
                      .join(', ') || 'N/A'}
                  </Box>

                  {/* Live Specific Info */}
                  {space.state === 'Running' && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: '#ff6b6b',
                      }}
                    >
                      {' '}
                      {/* Use a distinct color for live info */}
                      <WhatshotIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                      {space.liveListenersCount || 0} Listeners Live Now!
                    </Box>
                  )}

                  {/* Completed Specific Info */}
                  {/* {space.state === 'Ended' &&
                    space.topics &&
                    space.topics.length > 0 && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <LocalOfferIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                        Topics: {space.topics.join(', ')}
                      </Box>
                    )} */}

                  {/* Fallback/General Info (Date) */}
                  {space.state === 'Ended' && space.createdAt && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'var(--text-secondary)',
                        opacity: 0.8,
                        mt: 0.5,
                      }}
                    >
                      Analyzed:{' '}
                      {new Date(space.createdAt || 0).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              }
            />
            {/* Optional: Add a Live indicator visually */}
            {space.state === 'Running' && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#ff6b6b',
                  ml: 2,
                  mt: 1,
                  alignSelf: 'flex-start',
                }}
              />
            )}
          </ListItemButton>
        ))}
      </List>
    );
  };

  // Render function for Scheduled spaces (Grouped by Date)
  const renderScheduledList = (
    spaces: Space[],
    loading: boolean,
    error: Error | null
  ) => {
    if (loading || !user) {
      return renderSpaceListSkeleton(5);
    }
    if (error) {
      return (
        <Typography color="error" sx={{ p: 3, color: '#f44336' }}>
          Error loading Scheduled spaces: {error.message || 'Unknown error'}
        </Typography>
      );
    }
    if (!spaces || spaces.length === 0) {
      return (
        <Typography sx={{ p: 3, color: 'var(--text-secondary)' }}>
          No Scheduled spaces found.
        </Typography>
      );
    }

    return (
      <Box sx={{ p: 2 }}>
        {spaces.map((space) => (
          <Box key={space.spaceId} sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--primary-color)',
                mb: 1.5,
                pl: 1,
                borderLeft: `3px solid var(--primary-color)`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <EventIcon fontSize="small" /> {space.scheduledStart}
            </Typography>
            <List sx={{ p: 0 }}>
              {spaces.map((space) => (
                <ListItemButton
                  key={space.spaceId}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                    p: 2,
                    alignItems: 'flex-start',
                  }}
                  // Add onClick for scheduled items if needed (e.g., show details modal)
                >
                  <ListItemText
                    primary={space.title || `Space ${space.spaceId}`}
                    primaryTypographyProps={{
                      color: 'var(--text-primary)',
                      fontWeight: '500',
                      mb: 1,
                    }}
                    secondaryTypographyProps={{
                      component: 'div',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                    }}
                    secondary={
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <EventIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                          Scheduled:{' '}
                          {new Date(
                            space.scheduledStart || 0
                          ).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <GroupIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                          Speakers: {space.speakers?.join(', ') || 'N/A'}
                        </Box>
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<NotificationsActiveIcon />}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent ListItemButton click
                      toast.success(
                        'Notification preference saved (placeholder)!'
                      );
                      // TODO: Implement actual notification logic
                    }}
                    sx={{
                      ml: 2,
                      alignSelf: 'center', // Center button vertically
                      color: 'var(--text-secondary)',
                      borderColor: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      '&:hover': {
                        borderColor: 'white',
                        color: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Notify Me
                  </Button>
                </ListItemButton>
              ))}
            </List>
            {/* Add divider between dates, except for the last one */}
            {/* {index < sortedDates.length - 1 && <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />} */}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Background />

      {/* Header AppBar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'transparent',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Logo />
            <Typography
              variant="h6"
              sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
            >
              Songjam
            </Typography>
          </Box>

          {/* Agent Name and Settings */}
          {!agentOrg ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton
                variant="rounded"
                width={100}
                height={32}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                }}
              />
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={agentOrg.name}
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              />
              <IconButton
                onClick={() => setShowAgentSettings(true)}
                sx={{ color: 'var(--text-secondary)' }}
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content Container - Adjust pt to account for AppBar height */}
      <Container
        maxWidth="lg"
        sx={{ pt: 3, pb: 4, position: 'relative', zIndex: 1, flexGrow: 1 }}
      >
        {/* Title below AppBar */}
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: 'var(--text-primary)', textAlign: 'center', mb: 4 }}
        >
          {t('dashboardTitle', 'My Spaces Dashboard')}
        </Typography>

        {/* Add Space Section */}
        <Paper
          sx={{
            mb: 4,
            p: 3,
            bgcolor: 'rgba(15, 23, 42, 0.9)',
            borderRadius: 2,
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: 'var(--text-primary)', mb: 2 }}
          >
            {t('addSpaceTitle', 'Analyze a New Space')}
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              placeholder={t(
                'spaceInputPlaceholderDashboard',
                'Paste X Space URL (Live, Scheduled, or Recorded)'
              )}
              value={spaceUrl}
              onChange={(e) => setSpaceUrl(e.target.value)}
              variant="outlined"
              size="small"
              disabled={!user || isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--primary-color)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary)',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'var(--text-secondary)',
                  opacity: 0.7,
                },
              }}
              InputProps={{
                endAdornment: spaceUrl ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear input"
                      onClick={() => setSpaceUrl('')}
                      edge="end"
                      size="small"
                      sx={{ color: 'var(--text-secondary)' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <LoadingButton
              loading={isLoading}
              variant="contained"
              onClick={handleAddSpace}
              disabled={!user || isLoading}
              sx={{
                whiteSpace: 'nowrap',
                bgcolor: 'var(--primary-color)',
                color: 'white',
                padding: '8px 20px',
                '&:hover': {
                  bgcolor: 'var(--primary-color-dark)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 10px rgba(96, 165, 250, 0.3)',
                },
                '&.MuiLoadingButton-loading': {
                  bgcolor: 'rgba(96, 165, 250, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            >
              {t('addSpaceButton', 'Add Space')}
            </LoadingButton>
          </Box>
        </Paper>

        {/* Tabs Section */}
        <Paper
          sx={{
            width: '100%',
            bgcolor: 'rgba(15, 23, 42, 0.9)',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Box
            sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }}
          >
            <Tabs
              value={value}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              variant="fullWidth"
              indicatorColor="primary"
              textColor="inherit"
              sx={{
                '& .MuiTab-root': {
                  color: 'var(--text-secondary)',
                  textTransform: 'none',
                  fontSize: '1rem',
                  padding: '12px 16px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                },
                '& .Mui-selected': {
                  color: 'var(--primary-color)',
                  fontWeight: 'bold',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'var(--primary-color)',
                },
              }}
            >
              <Tab
                label={t('scheduledSpacesTab', 'Scheduled')}
                {...a11yProps(0)}
              />
              <Tab label={t('liveSpacesTab', 'Live Now')} {...a11yProps(1)} />
              <Tab
                label={t('completedSpacesTab', 'Completed')}
                {...a11yProps(2)}
              />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            {renderScheduledList(
              scheduledSpaces as Space[],
              loadingAgentSpaces,
              errorAgentSpaces as Error | null
            )}
          </TabPanel>
          <TabPanel value={value} index={1}>
            {renderSpaceList(
              liveSpaces as Space[],
              loadingAgentSpaces,
              errorAgentSpaces as Error | null,
              'Live'
            )}
          </TabPanel>
          <TabPanel value={value} index={2}>
            {renderSpaceList(
              completedSpaces as Space[],
              loadingAgentSpaces,
              errorAgentSpaces as Error | null,
              'Completed'
            )}
          </TabPanel>
        </Paper>

        {/* Authentication Dialog */}
        <LoginDialog open={showAuthDialog} />

        {/* Agent Settings Dialog */}
        <AgentSettingsDialog
          open={showAgentSettings}
          onClose={() => setShowAgentSettings(false)}
          agentOrg={agentOrg}
          onSave={handleSaveAgentSettings}
        />
      </Container>
    </Box>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Container,
  TextField,
  Paper,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
  IconButton,
  AppBar,
  Toolbar,
  Skeleton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  ListItem,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Background from './Background';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EventIcon from '@mui/icons-material/Event';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Logo from './Logo';
import { useAuthContext } from '../contexts/AuthContext';
import LoginDialog from './LoginDialog';
import AgentSettingsDialog from './AgentSettingsDialog';
import {
  AudioSpace,
  getBroadcastFromX,
  getRawSpaceFromX,
  getSpace,
  getSpacesByProjectId,
  Space,
} from '../services/db/spaces.service';
import { transcribeSpace } from '../services/transcription.service';
import {
  getProjectById,
  Project,
  ProjectDoc,
  updateProject,
  updateSpaceToProject,
} from '../services/db/projects.service';
import { canRequestSpace, extractSpaceId } from '../utils';
// import AddCampaignDialog from './NewCampaign/AddCampaignDialog';
import {
  Campaign,
  campaignsByProjectSpaceId,
  createCampaign,
  deleteCampaign,
  getNewCampaignsByProjectId,
} from '../services/db/campaign.service';
import SyncIcon from '@mui/icons-material/Sync';
import { updateSpaceRequests } from '../services/db/user.service';
import { logFirebaseEvent } from '../services/firebase.service';

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

const ProcessingDialog = ({
  open,
  onClose,
  space,
}: {
  open: boolean;
  onClose: () => void;
  space: AudioSpace | null;
}) => {
  const { t } = useTranslation();

  const getTitleAndMessage = () => {
    if (!space) return { title: '', message: '' };

    switch (space.metadata.state) {
      case 'Running':
        return {
          title: t('liveSpaceTitle', 'Live Space'),
          message: t(
            'liveSpaceMessage',
            'Setting up the live Twitter agent and redirecting you shortly.'
          ),
        };
      case 'Ended':
        return {
          title: t('recordedSpaceTitle', 'Recorded Space'),
          message: t(
            'recordedSpaceMessage',
            'Retrieving space data and redirecting you shortly.'
          ),
        };
      case 'NotStarted':
        return {
          title: t('scheduledSpaceTitle', 'Schedule Space'),
          message: t(
            'scheduledSpaceMessage',
            'We are scheduling the space, please wait.'
          ),
        };
      default:
        return {
          title: t('processingSpaceTitle', 'Processing Space'),
          message: t(
            'processingSpaceMessage',
            'We are processing the space and will redirect you shortly.'
          ),
        };
    }
  };

  const { title, message } = getTitleAndMessage();

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      PaperProps={{
        sx: {
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          minWidth: { xs: '90%', sm: 400 },
          maxWidth: 400,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 2,
          }}
        >
          <CircularProgress size={40} sx={{ color: '#60a5fa' }} />
          <DialogContentText
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
            }}
          >
            {message}
          </DialogContentText>
          {space && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'var(--text-secondary)', mb: 1 }}
              >
                {t('spaceDetails', 'Space Details')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-primary)' }}>
                {space.metadata.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'var(--text-secondary)' }}
              >
                {new Date(space.metadata.created_at).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [spaceUrl, setSpaceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [defaultProject, setDefaultProject] = useState<ProjectDoc | null>(null);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [processingSpace, setProcessingSpace] = useState<AudioSpace | null>(
    null
  );
  // const [isShowNewCampaign, setIsShowNewCampaign] = useState(false);
  // const [campaignSpaceDetails, setCampaignSpaceDetails] = useState<{
  //   title: string;
  //   scheduledStart: number;
  //   topics: string[];
  //   hostHandle: string;
  //   id: string;
  // } | null>(null);
  // const [scheduledSpaces, loadingScheduled, errorScheduled] = useCollectionData(query(collection(db, 'spaces'), where('state', '==', 'Scheduled')))
  // const [liveSpaces, loadingLive, errorLive] = useCollectionData(query(collection(db, 'spaces'), where('state', '==', 'Running')))
  // const [projectSpaces, setProjectSpaces] = useState<Space[]>([]);
  const [loadingProjectSpaces, setLoadingProjectSpaces] = useState(false);
  const [newCampaigns, setNewCampaigns] = useState<Campaign[]>([]);
  const [scheduledSpaces, setScheduledSpaces] = useState<Space[]>([]);
  const [liveSpaces, setLiveSpaces] = useState<Space[]>([]);
  const [completedSpaces, setCompletedSpaces] = useState<Space[]>([]);
  const [isSpaceSyncing, setIsSpaceSyncing] = useState(false);
  const hasUpdatedSpaceStatus = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    }
  }, [user, authLoading]);

  const analyzeSpace = async (
    spaceId: string,
    projectId: string,
    isBroadcast: boolean,
    boostFollowers: boolean
  ) => {
    if (!user) return toast.error('Please login to continue');
    setIsLoading(true);
    const spaceDoc = await getSpace(spaceId);
    if (spaceDoc) {
      if (projectId && !spaceDoc.projectIds?.includes(projectId)) {
        await updateSpaceToProject(spaceId, projectId);
      }
      if (spaceDoc.state === 'Running' || spaceDoc.state === 'NotStarted') {
        const campaigns = await campaignsByProjectSpaceId(spaceId, projectId);
        if (campaigns.length > 0) {
          navigate(`/campaigns/${campaigns[0].id}`);
        } else {
          const campaign = await createCampaign({
            addedType: 'NEW',
            campaignType: 'listeners',
            ctaType: boostFollowers ? 'follow' : 'space',
            ctaTarget: boostFollowers ? '' : spaceDoc.title,
            spaceId: spaceId,
            projectId: projectId,
            userId: user?.uid || '',
            spaceTitle: spaceDoc.title,
            status: 'DRAFT',
            createdAt: Date.now(),
            description: '',
            topics: spaceDoc.topics || [],
            scheduledStart: spaceDoc.scheduledStart || spaceDoc.startedAt || 0,
            hostHandle: spaceDoc.admins[0].twitterScreenName || '',
          });
          navigate(`/campaigns/${campaign.id}`);
        }
        // else {
        //   navigate(`/live/${spaceId}`);
        // }
      } else if (spaceDoc.state === 'Ended') {
        navigate(`/crm/${spaceId}`);
      }
      // Check if scheduled space is started on time
      setIsLoading(false);
      // toast.success('Space already exists', {
      //   duration: 3000,
      // });
      return;
    }
    if (!canRequestSpace(user)) {
      logFirebaseEvent('space_limit_reached', {
        uid: user?.uid || '',
        username: user?.username || '',
        plan: user?.currentPlan || '',
      });
      toast.error('You have reached the limit of spaces for your plan');
      navigate('/settings');
      setIsLoading(false);
      return;
    }
    toast.success(`Processing ${isBroadcast ? 'live' : 'space'}: ${spaceId}`);
    try {
      if (isBroadcast) {
        if (boostFollowers) {
          toast.error('Boost Followers is not available for Live Broadcasts');
          return;
        }
        logFirebaseEvent('analyze_broadcast', {
          uid: user?.uid || '',
          username: user?.username || '',
          plan: user?.currentPlan || '',
          spaceId,
          projectId,
        });
        const space = await getBroadcastFromX(spaceId);
        if (space && space.state === 'Ended') {
          const path = await transcribeSpace(spaceId, projectId, true);
          navigate(path);
        } else if (space) {
          const campaign = await createCampaign({
            addedType: 'NEW',
            campaignType: 'listeners',
            ctaType: 'live',
            ctaTarget: '',
            spaceId: spaceId,
            projectId: projectId,
            userId: user?.uid || '',
            spaceTitle: space.title,
            status: 'DRAFT',
            createdAt: Date.now(),
            description: '',
            topics: [],
            scheduledStart: space.scheduledStart || 0,
            hostHandle: space.broadcastInfo?.twitterUsername || '',
            isBroadcast: true,
          });
          navigate(`/campaigns/${campaign.id}`);

          // toast.error('Broadcast is not finished');
        } else {
          toast.error('Invalid Broadcast');
        }
        setIsLoading(false);
        return;
      }
      logFirebaseEvent('analyze_space', {
        uid: user?.uid || '',
        username: user?.username || '',
        plan: user?.currentPlan || '',
        spaceId,
        projectId,
      });
      const space = await getRawSpaceFromX(spaceId);
      if (
        space &&
        ['Ended', 'Running', 'NotStarted'].includes(space.metadata.state)
      ) {
        setProcessingSpace(space);
        const state = space.metadata.state;
        if (state === 'Ended') {
          const path = await transcribeSpace(spaceId, projectId);
          await updateSpaceRequests(user?.uid || '');
          navigate(path); // Navigates to /crm/:spaceId
        } else if (state === 'Running') {
          try {
            await axios.post(
              `${import.meta.env.VITE_JAM_SERVER_URL}/listen-live-space`,
              { spaceId, projectId }
            );
          } catch (error) {
            console.warn('Error listening to live space:', error);
          }
          await updateSpaceRequests(user?.uid || '');
          const campaign = await createCampaign({
            addedType: 'NEW',
            campaignType: 'listeners',
            ctaType: boostFollowers ? 'follow' : 'space',
            ctaTarget: boostFollowers ? '' : space.metadata.title,
            spaceId: spaceId,
            projectId: projectId,
            userId: user?.uid || '',
            spaceTitle: space.metadata.title,
            status: 'DRAFT',
            createdAt: Date.now(),
            description: '',
            topics:
              (space.metadata as any).topics?.map(
                (t: any) => t?.topic?.name || ''
              ) || [],
            scheduledStart:
              space.metadata.scheduled_start || space.metadata.started_at || 0,
            hostHandle: space.participants.admins[0].twitter_screen_name,
          });
          navigate(`/campaigns/${campaign.id}`);
        } else if (state === 'NotStarted') {
          if (boostFollowers) {
            toast.error(
              'Boost Followers is not available for Scheduled Spaces'
            );
            return;
          }
          await axios.post(
            `${import.meta.env.VITE_JAM_SERVER_URL}/schedule-space`,
            { spaceId, projectId }
          );
          await updateSpaceRequests(user?.uid || '');
          const campaign = await createCampaign({
            addedType: 'NEW',
            campaignType: 'listeners',
            ctaType: 'space',
            ctaTarget: space.metadata.title,
            spaceId: spaceId,
            projectId: projectId,
            userId: user?.uid || '',
            spaceTitle: space.metadata.title,
            status: 'DRAFT',
            createdAt: Date.now(),
            description: '',
            topics:
              (space.metadata as any).topics?.map(
                (t: any) => t?.topic?.name || ''
              ) || [],
            scheduledStart:
              space.metadata.scheduled_start || space.metadata.started_at || 0,
            hostHandle: space.participants.admins[0].twitter_screen_name,
          });
          navigate(`/campaigns/${campaign.id}`);
          // setIsShowNewCampaign(true);
          // setCampaignSpaceDetails({
          //   title: space.metadata.title,
          //   scheduledStart: space.metadata.started_at,
          //   topics: (space.metadata as any).topics.map((t: any) => t.topic.name),
          //   hostHandle: space.participants.admins[0].twitter_screen_name,
          //   id: spaceId,
          // });
          toast.success('Space is scheduled successfully');

          setProcessingSpace(null);
        }
      } else {
        const msg = space
          ? `Space is not in a valid state: ${space.metadata.state}`
          : 'Space not found';
        toast.error(msg);
      }
    } catch (error) {
      const campaign = await createCampaign({
        addedType: 'NEW',
        campaignType: 'listeners',
        ctaType: 'space',
        ctaTarget: '',
        spaceId: spaceId,
        projectId: projectId,
        userId: user?.uid || '',
        spaceTitle: '',
        status: 'DRAFT',
        createdAt: Date.now(),
        description: '',
        topics: [],
        scheduledStart: 0,
        hostHandle: '',
        isBroadcast,
      });
      navigate(`/campaigns/${campaign.id}`);
    }
    setIsLoading(false);
  };

  // TODO: Fetch actual spaces data from your backend
  const fetchAgentOrg = async () => {
    if (user && (user.projectIds.length > 0 || user.defaultProjectId)) {
      const projectId = user.defaultProjectId || user.projectIds[0];
      const project = await getProjectById(projectId);
      setDefaultProject(project);
      setLoadingProjectSpaces(true);
      await Promise.all([
        getSpacesByProjectId(projectId, (spaces) => {
          if (spaces.length > 0) {
            const orderedSpaces = spaces.sort(
              (a, b) => (b.docCreatedAt || 0) - (a.docCreatedAt || 0)
            );
            const _scheduledSpaces = orderedSpaces.filter(
              (space) => space.state === 'NotStarted'
            );
            const _liveSpaces = orderedSpaces.filter(
              (space) => space.state === 'Running'
            );
            const _completedSpaces = orderedSpaces.filter(
              (space) => space.state === 'Ended'
            );
            setScheduledSpaces(_scheduledSpaces);
            setLiveSpaces(_liveSpaces);
            setCompletedSpaces(_completedSpaces);
          }
        }),
        getNewCampaignsByProjectId(projectId, (campaigns) => {
          setNewCampaigns(campaigns);
        }),
      ]);
      setLoadingProjectSpaces(false);
      setIsLoading(false);
    } else if (user) {
      setShowAuthDialog(false);
      setShowAgentSettings(true);
    }
  };
  useEffect(() => {
    if (user) {
      setShowAuthDialog(false);
      fetchAgentOrg();
    }
  }, [user]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const spaceId = searchParams.get('spaceId');
    const broadcastId = searchParams.get('broadcastId');
    const boostFollowers = searchParams.get('boostFollowers') === 'true';
    if (defaultProject && (spaceId || broadcastId)) {
      // if (spaceId === 'new') {
      //   setIsShowNewCampaign(true);
      // } else {
      analyzeSpace(
        spaceId || broadcastId || '',
        defaultProject.id || '',
        broadcastId ? true : false,
        boostFollowers
      );
      // }
    }
  }, [defaultProject]);

  const updateSpaceStatus = async () => {
    if (isSpaceSyncing || hasUpdatedSpaceStatus.current) return;
    if (scheduledSpaces.length > 0 || liveSpaces.length > 0) {
      setIsSpaceSyncing(true);
      try {
        hasUpdatedSpaceStatus.current = true;
        await axios.post(
          `${import.meta.env.VITE_JAM_SERVER_URL}/update-space-status`,
          {
            spaceIds: [
              ...scheduledSpaces.map((space) => space.spaceId),
              ...liveSpaces.map((space) => space.spaceId),
            ],
          }
        );
      } catch (error) {
        console.error('Error updating space status:', error);
      } finally {
        setIsSpaceSyncing(false);
      }
    }
  };

  useEffect(() => {
    updateSpaceStatus();
  }, [scheduledSpaces, liveSpaces]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleAddSpace = async (boostFollowers: boolean = false) => {
    const spaceId = extractSpaceId(spaceUrl);
    if (isLoading || !spaceId || !defaultProject) return;
    setIsLoading(true);
    const isBroadcast = spaceUrl.includes('broadcasts');

    // TODO: Implement logic similar to App.tsx handleAnalyze,
    // but potentially just add to a list or trigger analysis without navigating immediately.
    // For now, just log and show a message.
    console.log('Adding space:', spaceId);
    await analyzeSpace(spaceId, defaultProject.id, isBroadcast, boostFollowers);

    setSpaceUrl(''); // Clear input after submission
    setIsLoading(false);
  };

  const handleSaveAgentSettings = async (updatedProject?: Partial<Project>) => {
    if (!user?.uid) {
      toast.error(t('projectSettingsError', 'Error saving project settings'));
      return;
    }
    try {
      if (updatedProject && defaultProject) {
        await updateProject(defaultProject.id, updatedProject);
      }
      if (defaultProject) {
        setDefaultProject({ ...defaultProject, ...updatedProject });
      }
      toast.success(t('projectSettingsSaved', 'Project settings updated'));
    } catch (error) {
      console.error('Error saving project settings:', error);
      toast.error(t('projectSettingsError', 'Error saving project settings'));
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
                    Speakers:{' '}
                    {[...space.admins, ...space.speakers]
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
      <Box sx={{ p: 2 }} width={'100%'}>
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
              onClick={() => {
                navigate(`/live/${space.spaceId}`);
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
                      Scheduled Start:{' '}
                      {new Date(space.scheduledStart || 0).toLocaleTimeString(
                        [],
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <GroupIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                      Speakers:{' '}
                      {[...space.admins, ...space.speakers]
                        .map((speaker) => speaker.displayName)
                        .join(', ') || 'N/A'}
                    </Box>
                  </Box>
                }
              />
              {/* <Button
                variant="outlined"
                size="small"
                startIcon={<NotificationsActiveIcon />}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent ListItemButton click
                  toast.success('Notification preference saved (placeholder)!');
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
              </Button> */}
            </ListItemButton>
          ))}
        </List>
      </Box>
    );
  };

  const renderNewCampaignsList = (
    campaigns: Campaign[],
    loading: boolean,
    error: Error | null
  ) => {
    if (loading || !user) {
      return renderSpaceListSkeleton(5);
    }
    if (error) {
      return (
        <Typography color="error" sx={{ p: 3, color: '#f44336' }}>
          Error loading campaigns: {error.message || 'Unknown error'}
        </Typography>
      );
    }
    if (!campaigns || campaigns.length === 0) {
      return (
        <Typography sx={{ p: 3, color: 'var(--text-secondary)' }}>
          No new campaigns found.
        </Typography>
      );
    }

    return (
      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          {campaigns.map((campaign) => (
            <ListItemButton
              key={campaign.id}
              onClick={() => {
                navigate(`/campaigns/${campaign.id}`);
              }}
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
                primary={campaign.ctaTarget}
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
                    {campaign.ctaType === 'follow'
                      ? `Boost Followers | ${campaign.spaceTitle}`
                      : `Boost Space`}
                  </Box>
                }
              />
              <Box display={'flex'} gap={2} alignItems={'center'}>
                <Chip
                  label={campaign.status}
                  size="small"
                  variant="outlined"
                  color={campaign.status === 'READY' ? 'success' : 'info'}
                />
                <Button
                  onClick={(e) => {
                    if (!campaign.id) {
                      return;
                    }
                    e.stopPropagation();
                    if (
                      confirm('Are you sure you want to delete this campaign?')
                    ) {
                      deleteCampaign(campaign.id);
                    }
                  }}
                  variant="outlined"
                  size="small"
                >
                  Delete
                </Button>
              </Box>
              {/* <Button
                variant="outlined"
                size="small"
                startIcon={<NotificationsActiveIcon />}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent ListItemButton click
                  toast.success('Notification preference saved (placeholder)!');
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
              </Button> */}
            </ListItemButton>
          ))}
        </List>
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
              sx={{
                background:
                  'linear-gradient(135deg, var(--gradient-start) 30%, var(--gradient-middle) 60%, var(--gradient-end) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
              }}
            >
              Songjam
            </Typography>
          </Box>
          {/* Project Name and Settings */}
          {!defaultProject ? (
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
                label={defaultProject.name}
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                deleteIcon={<ExpandMoreRoundedIcon />}
                onDelete={() => setShowAgentSettings(true)}
              />
            </Box>
          )}

          {/* <LoginDisplayBtn setShowAuthDialog={setShowAuthDialog} /> */}
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
          {/* <Typography
            variant="h6"
            gutterBottom
            sx={{ color: 'var(--text-primary)', mb: 2 }}
          >
            {t('addSpaceTitle', 'Analyze a New Space')}
          </Typography> */}
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            flexDirection={'column'}
            // justifyContent={'space-between'}
            width={'100%'}
          >
            <TextField
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
                width: '70%',
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
            <Box display={'flex'} gap={2} alignItems={'center'}>
              <LoadingButton
                loading={isLoading && !!user}
                variant="contained"
                onClick={() => handleAddSpace(false)}
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
                  textTransform: 'uppercase',
                }}
              >
                {t('addSpaceButton', 'Boost Space')}
              </LoadingButton>
              <LoadingButton
                loading={isLoading && !!user}
                disabled={!user || isLoading}
                variant="outlined"
                className="info"
                onClick={() => handleAddSpace(true)}
                sx={{
                  padding: '8px 20px',
                  // whiteSpace: 'nowrap',
                  // px: 3,
                  textTransform: 'uppercase',
                }}
              >
                {t('inviteToFollow', 'Boost Followers')}
              </LoadingButton>

              {/* <Button
                onClick={() => setIsShowNewCampaign(true)}
                sx={{ mx: 'auto', width: '160px', padding: '8px 20px' }}
                variant="outlined"
              >
                Create Campaign
              </Button> */}
            </Box>
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
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t('newCampaignsTab', 'Campaigns')}
                    {newCampaigns.length > 0 && (
                      <Box
                        component="span"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.75rem',
                        }}
                      >
                        {newCampaigns.length}
                      </Box>
                    )}
                  </Box>
                }
                {...a11yProps(0)}
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t('scheduledSpacesTab', 'Scheduled')}
                    {scheduledSpaces.length > 0 && (
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.75rem',
                        }}
                      >
                        {scheduledSpaces.length}
                        {isSpaceSyncing && (
                          <SyncIcon
                            fontSize="small"
                            sx={{ animation: 'spin 4s linear infinite' }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                }
                {...a11yProps(1)}
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t('liveSpacesTab', 'Live Now')}
                    {liveSpaces.length > 0 && (
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.75rem',
                        }}
                      >
                        {liveSpaces.length}
                        {isSpaceSyncing && (
                          <SyncIcon
                            fontSize="small"
                            sx={{ animation: 'spin 4s linear infinite' }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                }
                {...a11yProps(2)}
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t('completedSpacesTab', 'Completed')}
                    {completedSpaces.length > 0 && (
                      <Box
                        component="span"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          px: 1,
                          py: 0.25,
                          fontSize: '0.75rem',
                        }}
                      >
                        {completedSpaces.length}
                      </Box>
                    )}
                  </Box>
                }
                {...a11yProps(3)}
              />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            {renderNewCampaignsList(
              newCampaigns as Campaign[],
              loadingProjectSpaces || isLoading,
              null
            )}
          </TabPanel>
          <TabPanel value={value} index={1}>
            {renderScheduledList(
              scheduledSpaces as Space[],
              loadingProjectSpaces || isLoading,
              null
            )}
          </TabPanel>
          <TabPanel value={value} index={2}>
            {renderSpaceList(
              liveSpaces as Space[],
              loadingProjectSpaces || isLoading,
              null,
              'Live'
            )}
          </TabPanel>
          <TabPanel value={value} index={3}>
            {renderSpaceList(
              completedSpaces as Space[],
              loadingProjectSpaces || isLoading,
              null,
              'Completed'
            )}
          </TabPanel>
        </Paper>

        {/* Authentication Dialog */}
        <LoginDialog open={showAuthDialog && !authLoading} />

        {/* Agent Settings Dialog */}

        {defaultProject && (
          <AgentSettingsDialog
            open={showAgentSettings}
            onClose={() => setShowAgentSettings(false)}
            project={defaultProject}
            onSave={handleSaveAgentSettings}
            onSwitchProject={(project: ProjectDoc) =>
              setDefaultProject(project)
            }
          />
        )}

        {/* Processing Dialog */}
        <ProcessingDialog
          open={!!processingSpace}
          onClose={() => setProcessingSpace(null)}
          space={processingSpace}
        />
      </Container>
      <Toaster position="bottom-right" reverseOrder={false} />
      {/* {isShowNewCampaign && (
        <AddCampaignDialog
          onClose={() => setIsShowNewCampaign(false)}
          space={campaignSpaceDetails}
        />
      )} */}
    </Box>
  );
}

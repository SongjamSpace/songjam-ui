import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Background from './Background';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EventIcon from '@mui/icons-material/Event';
// TODO: Import services and types needed for fetching/displaying spaces

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
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

// Dummy Data Structures and Generation
interface Space {
  id: string;
  title: string;
  state: 'Running' | 'Ended' | 'Scheduled';
  createdAt?: Date;
  scheduledAt?: Date; // Optional: Only for scheduled spaces
  hostName?: string; // Optional extra info
  speakers?: string[]; // Added speakers
  topics?: string[];   // Added topics
  listenerCount?: number; // Added listener count (for live)
}

const generateDummySpaces = (state: Space['state'], count: number): Space[] => {
  const spaces: Space[] = [];
  const now = new Date();
  const dummyTopics = ['AI', 'Web3', 'Crypto', 'DeFi', 'NFTs', 'Future Tech', 'Startups', 'VC', 'Community'];
  const dummySpeakers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];

  for (let i = 1; i <= count; i++) {
    const host = `Host ${String.fromCharCode(65 + i)}`;
    let speakers = [host, ...dummySpeakers.slice(i % dummySpeakers.length, (i % dummySpeakers.length) + 2)];
    speakers = [...new Set(speakers)]; // Ensure unique speakers

    const space: Space = {
      id: `${state.toLowerCase()}-${i}`,
      title: `Discussing ${state === 'Running' ? 'Current Events' : state === 'Ended' ? 'Past Glories' : 'Future Plans'}`,
      state: state,
      hostName: host,
      speakers: speakers,
      topics: dummyTopics.slice(i % 3, (i % 3) + (state === 'Ended' ? 3 : 2)), // More topics for completed
    };

    if (state === 'Scheduled') {
      const scheduledDate = new Date(now);
      scheduledDate.setDate(now.getDate() + i); // Schedule for upcoming days
      scheduledDate.setHours(10 + i, 0, 0, 0); // Vary the time slightly
      space.scheduledAt = scheduledDate;
    } else {
       const createdDate = new Date(now);
       createdDate.setHours(now.getHours() - i); // Set creation time in the past
      space.createdAt = createdDate;
      if (state === 'Running') {
         space.listenerCount = Math.floor(Math.random() * 500) + 50; // Random listener count for live
      }
    }
    spaces.push(space);
  }
  return spaces;
};

const dummyLiveSpaces = generateDummySpaces('Running', 3);
const dummyCompletedSpaces = generateDummySpaces('Ended', 5);
const dummyScheduledSpaces = generateDummySpaces('Scheduled', 7);

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [spaceUrl, setSpaceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // TODO: Add state for live, completed, scheduled spaces and loading/error states for each

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleAddSpace = async () => {
    if (isLoading || !spaceUrl.trim()) return;
    setIsLoading(true);
    const spaceId = spaceUrl.split('/').pop();

    // TODO: Implement logic similar to App.tsx handleAnalyze,
    // but potentially just add to a list or trigger analysis without navigating immediately.
    // For now, just log and show a message.
    console.log('Adding space:', spaceId);
    toast.success(`Processing space: ${spaceId}`, {
      position: 'bottom-right',
    });

    // Example: Fetch space details
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_JAM_SERVER_URL}/get-space/${spaceId}`
      );
      if (res.data.result) {
        const state = res.data.result.metadata.state;
        toast(`Space state: ${state}`, { position: 'bottom-right' });
        // TODO: Add the space to the correct list based on its state (Running, Ended, Scheduled)
      } else {
        toast.error('Could not fetch space details.');
      }
    } catch (error) {
      console.error('Error fetching space details:', error);
      toast.error('Error fetching space details.');
    }

    setSpaceUrl(''); // Clear input after submission
    setIsLoading(false);
  };

  // Render function for Live and Completed lists
  const renderSpaceList = (
      spaces: Space[],
      loading: boolean,
      error: Error | null,
      listType: 'Live' | 'Completed'
    ) => {

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: 'var(--primary-color)'}} />
        </Box>
      );
    }
    if (error) {
      return <Typography color="error" sx={{ p: 3, color: '#f44336' }}>Error loading {listType} spaces: {error.message || 'Unknown error'}</Typography>;
    }
    if (!spaces || spaces.length === 0) {
      return <Typography sx={{ p: 3, color: 'var(--text-secondary)' }}>No {listType} spaces found.</Typography>;
    }

    // Actual list rendering
    return (
      <List sx={{ p: 1 }}> {/* Add some padding around the list */}
        {spaces.map((space) => (
          <ListItemButton
            key={space.id}
            sx={{
              mb: 1,
              borderRadius: 1,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              p: 2,
              alignItems: 'flex-start'
            }}
            onClick={() => {
              if (space.state === 'Running') {
                navigate(`/live/${space.id}`);
              } else if (space.state === 'Ended') {
                navigate(`/crm/${space.id}`);
              }
              // Add navigation for scheduled if needed, or maybe a modal?
            }}
          >
            <ListItemText
              primary={space.title || `Space ${space.id}`}
              primaryTypographyProps={{ color: 'var(--text-primary)', fontWeight: '500', mb: 1 }}
              secondaryTypographyProps={{ component: 'div', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
              secondary={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {/* Speakers/Host Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                     <GroupIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                     Speakers: {space.speakers?.join(', ') || 'N/A'}
                   </Box>

                  {/* Live Specific Info */}
                  {space.state === 'Running' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ff6b6b' }}> {/* Use a distinct color for live info */}
                      <WhatshotIcon fontSize="inherit" sx={{ mr: 0.5 }}/>
                      {space.listenerCount || 0} Listeners Live Now!
                    </Box>
                  )}

                   {/* Completed Specific Info */}
                   {space.state === 'Ended' && space.topics && space.topics.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalOfferIcon fontSize="inherit" sx={{ mr: 0.5 }}/>
                      Topics: {space.topics.join(', ')}
                    </Box>
                  )}

                  {/* Fallback/General Info (Date) */}
                   {space.state === 'Ended' && space.createdAt && (
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', opacity: 0.8, mt: 0.5 }}>
                       Analyzed: {space.createdAt.toLocaleDateString()}
                     </Typography>
                   )}
                 </Box>
               }
             />
             {/* Optional: Add a Live indicator visually */}
             {space.state === 'Running' && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff6b6b', ml: 2, mt: 1, alignSelf: 'flex-start' }} />
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

    if (loading) {
      // Same loading state as renderSpaceList
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: 'var(--primary-color)'}} />
        </Box>
      );
    }
    if (error) {
       // Same error state as renderSpaceList
      return <Typography color="error" sx={{ p: 3, color: '#f44336' }}>Error loading Scheduled spaces: {error.message || 'Unknown error'}</Typography>;
    }
    if (!spaces || spaces.length === 0) {
      // Same empty state as renderSpaceList
      return <Typography sx={{ p: 3, color: 'var(--text-secondary)' }}>No Scheduled spaces found.</Typography>;
    }

    // Group spaces by date
    const groupedSpaces: { [date: string]: Space[] } = {};
    spaces.forEach(space => {
      if (space.scheduledAt) {
        const dateString = space.scheduledAt.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!groupedSpaces[dateString]) {
          groupedSpaces[dateString] = [];
        }
        groupedSpaces[dateString].push(space);
      }
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(groupedSpaces).sort((a, b) => {
      // Ensure dates are parsed correctly for comparison
      return new Date(spaces.find(s => s.scheduledAt?.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) === a)?.scheduledAt || 0).getTime() -
             new Date(spaces.find(s => s.scheduledAt?.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) === b)?.scheduledAt || 0).getTime();
    });


    return (
      <Box sx={{ p: 2 }}>
        {sortedDates.map((dateString, index) => (
          <Box key={dateString} sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ color: 'var(--primary-color)', mb: 1.5, pl: 1, borderLeft: `3px solid var(--primary-color)`, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <EventIcon fontSize="small" /> {dateString}
            </Typography>
            <List sx={{ p: 0 }}>
              {groupedSpaces[dateString].map(space => (
                <ListItemButton
                  key={space.id}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                     '&:hover': {
                       bgcolor: 'rgba(255, 255, 255, 0.1)',
                     },
                    p: 2,
                    alignItems: 'flex-start'
                  }}
                  // Add onClick for scheduled items if needed (e.g., show details modal)
                >
                  <ListItemText
                    primary={space.title || `Space ${space.id}`}
                     primaryTypographyProps={{ color: 'var(--text-primary)', fontWeight: '500', mb: 1 }}
                     secondaryTypographyProps={{ component: 'div', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                     secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EventIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                           Scheduled: {space.scheduledAt?.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                         bgcolor: 'rgba(255, 255, 255, 0.1)'
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
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <Background />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 4, position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'var(--text-primary)', textAlign: 'center', mb: 4 }}>
          {t('dashboardTitle', 'My Spaces Dashboard')}
        </Typography>

        <Paper sx={{ mb: 4, p: 3, bgcolor: 'rgba(15, 23, 42, 0.9)', borderRadius: 2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'var(--text-primary)', mb: 2 }}>
            {t('addSpaceTitle', 'Analyze a New Space')}
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              placeholder={t('spaceInputPlaceholderDashboard', 'Paste X Space URL (Live, Scheduled, or Recorded)')}
              value={spaceUrl}
              onChange={(e) => setSpaceUrl(e.target.value)}
              variant="outlined"
              size="small"
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
                       <CloseIcon fontSize="small"/>
                     </IconButton>
                   </InputAdornment>
                 ) : undefined,
              }}
            />
            <LoadingButton
              loading={isLoading}
              variant="contained"
              onClick={handleAddSpace}
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
                  }
              }}
            >
              {t('addSpaceButton', 'Add Space')}
            </LoadingButton>
          </Box>
        </Paper>

        <Paper sx={{ width: '100%', bgcolor: 'rgba(15, 23, 42, 0.9)', borderRadius: 2, overflow: 'hidden', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }}>
            <Tabs
              value={value}
              onChange={handleChange}
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
                 }
               }}
            >
              <Tab label={t('scheduledSpacesTab', 'Scheduled')} {...a11yProps(0)} />
              <Tab label={t('liveSpacesTab', 'Live Now')} {...a11yProps(1)} />
              <Tab label={t('completedSpacesTab', 'Completed')} {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            {renderScheduledList(dummyScheduledSpaces, false, null)}
          </TabPanel>
          <TabPanel value={value} index={1}>
            {renderSpaceList(dummyLiveSpaces, false, null, 'Live')}
          </TabPanel>
          <TabPanel value={value} index={2}>
            {renderSpaceList(dummyCompletedSpaces, false, null, 'Completed')}
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Badge,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  Grid,
  Button,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkIcon from '@mui/icons-material/Bookmark';
// import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
// import GroupAddIcon from '@mui/icons-material/GroupAdd';
// import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';
import {
  getSpaceListeners,
  Space,
  TwitterUser,
} from '../../services/db/spaces.service';
import {
  enrichSpeakerData,
  XUserProfile,
  XTweet,
} from '../../services/x.service';
import UserProfileDrawer from './UserProfileDrawer';
import { useTranslation } from 'react-i18next';

// All possible interests for filtering
const ALL_INTERESTS = [
  'AI',
  'Web3',
  'Marketing',
  'Technology',
  'Design',
  'Business',
  'Finance',
  'Crypto',
];

// All possible locations for filtering
const ALL_LOCATIONS = [
  'New York',
  'San Francisco',
  'London',
  'Berlin',
  'Tokyo',
  'Remote',
];

// Define the mock attendee type
type MockAttendee = {
  id: string;
  username: string;
  displayName: string;
  profileImage: string;
  bio: string;
  followersCount: number;
  engagement: {
    inSpaceComments: number;
    likedPosts: number;
    recentInteractions: number;
  };
  interests: string[];
  recentPosts: {
    content: string;
    engagement: number;
    timestamp: string;
  }[];
  location: string;
  joinedDate: string;
};

// Define the EnrichedUser type
type EnrichedUser = TwitterUser & {
  xProfile?: XUserProfile;
  xTweets?: XTweet[];
};

interface AudiencePanelProps {
  onSelectAttendees?: (listeners: string[]) => void;
  space?: Space | null;
}

/**
 * AudiencePanel Component
 *
 * This component provides a comprehensive view of space listeners
 * with filtering, segmentation, and engagement capabilities.
 */
const AudiencePanel: React.FC<AudiencePanelProps> = ({
  onSelectAttendees,
  space,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [userDetailDrawer, setUserDetailDrawer] = useState<TwitterUser | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'speakers' | 'listeners'>(
    'speakers'
  );

  // Filter states
  const [filterEngagement, setFilterEngagement] = useState<string>('all');
  const [filterInterests, setFilterInterests] = useState<string[]>([]);
  const [filterFollowers, setFilterFollowers] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [spaceListeners, setSpaceListeners] = useState<TwitterUser[]>([]);

  // Detail drawer tab state
  const [detailTab, setDetailTab] = useState<string>('profile');

  const [enrichedSpeakers, setEnrichedSpeakers] = useState<
    (TwitterUser & { xProfile?: XUserProfile; recentTweets?: XTweet[] })[]
  >([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // const fetchEnrichedSpeakers = async (speakersToEnrich: User[]) => {
  //   setIsLoadingProfiles(true);
  //   // Use a temporary array to build results before setting state
  //   const newlyEnrichedData: EnrichedUser[] = [];
  //   for (const speaker of speakersToEnrich) {
  //     try {
  //       console.log(
  //         `Attempting to enrich speaker: ${speaker.twitter_screen_name}`
  //       );
  //       const enriched = await enrichSpeakerData(speaker);
  //       if (enriched) {
  //         console.log(
  //           `Successfully enriched speaker: ${speaker.twitter_screen_name}`
  //         );
  //         newlyEnrichedData.push(enriched);
  //       } else {
  //         console.log(
  //           `Failed to enrich speaker (enrichSpeakerData returned null): ${speaker.twitter_screen_name}`
  //         );
  //         // Push original speaker data if enrichment fails but we still want to show the user
  //         newlyEnrichedData.push({
  //           ...speaker,
  //           xProfile: undefined,
  //           xTweets: [],
  //         });
  //       }
  //       // Add a longer delay to avoid hitting rate limits too quickly
  //       await new Promise((resolve) => setTimeout(resolve, 1000)); // 1000ms (1 second) delay
  //     } catch (error) {
  //       console.error(
  //         `Error enriching speaker ${speaker.twitter_screen_name}:`,
  //         error
  //       );
  //       // Push original speaker data if an error occurs during enrichment
  //       newlyEnrichedData.push({
  //         ...speaker,
  //         xProfile: undefined,
  //         xTweets: [],
  //       });
  //     }
  //   }
  //   // Set state once after the loop completes for the fetched speaker(s)
  //   setEnrichedSpeakers((prev) => [...prev, ...newlyEnrichedData]);
  //   setIsLoadingProfiles(false);
  //   console.log('Finished enriching speaker(s).');
  // };

  useEffect(() => {
    // Only fetch if space has speakers and we haven't already fetched enriched data for this space
    if (
      space?.speakers &&
      space.speakers.length > 0 &&
      enrichedSpeakers.length === 0
    ) {
      console.log(
        `Space data updated, fetching enriched speaker data for the FIRST speaker only...`
      );
      setEnrichedSpeakers([]); // Clear previous before fetching
      // fetchEnrichedSpeakers(space.speakers.slice(0, 1));
    } else if (!space?.speakers || space.speakers.length === 0) {
      console.log(
        'No speakers in space data or space cleared, clearing enriched speakers.'
      );
      setEnrichedSpeakers([]);
      setIsLoadingProfiles(false);
    }
    // Intentionally excluding fetchEnrichedSpeakers and enrichedSpeakers from deps
    // to control exactly when fetching occurs (only when space object changes and enrichedSpeakers is empty)
  }, [space]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleUserClick = (user: TwitterUser) => {
    setUserDetailDrawer(user);
  };

  const handleClearFilters = () => {
    setFilterEngagement('all');
    setFilterInterests([]);
    setFilterFollowers('all');
    setFilterLocation('all');
  };

  const handleToggleInterest = (interest: string) => {
    setFilterInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Filter speakers based on search term
  const filteredSpeakers =
    space?.speakers
      .map((speaker) => ({
        ...speaker,
        xProfile: enrichedSpeakers.find((es) => es.userId === speaker.userId)
          ?.xProfile,
      }))
      .filter((speaker) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          speaker.displayName.toLowerCase().includes(searchLower) ||
          speaker.twitterScreenName.toLowerCase().includes(searchLower)
        );
      }) || [];
  const filteredListeners =
    spaceListeners.filter((listener) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        listener.displayName.toLowerCase().includes(searchLower) ||
        listener.twitterScreenName.toLowerCase().includes(searchLower)
      );
    }) || [];

  useEffect(() => {
    if (space?.spaceId) {
      const fetchListeners = async () => {
        const listeners = await getSpaceListeners(space.spaceId);
        console.log(listeners);
        setSpaceListeners(listeners);
      };
      fetchListeners();
    }
  }, [space]);

  return (
    <Box>
      <Paper
        sx={{
          p: 2,
          height: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Prevent container from scrolling
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">{t('audienceMgmtTitle')}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <IconButton disabled> <FilterListIcon /> </IconButton>
            <FormControl size="small" sx={{ minWidth: 120 }} disabled>
              <InputLabel>{t('engagementLabel')}</InputLabel>
              <Select
                value={filterEngagement}
                label={t('engagementLabel')}
                onChange={(e) => setFilterEngagement(e.target.value)}
              >
                <MenuItem value="all">{t('allLevels')}</MenuItem>
                <MenuItem value="high">{t('highEngagement')}</MenuItem>
                <MenuItem value="medium">{t('mediumEngagement')}</MenuItem>
                <MenuItem value="low">{t('lowEngagement')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label={t('speakersTab')} value="speakers" />
          <Tab label={t('listenersTab')} value="listeners" />
        </Tabs>

        <TextField
          fullWidth
          size="small"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon /> </InputAdornment> ) }}
          sx={{ mb: 2 }}
        />

        {/* Display Active Filters */}
        {(filterEngagement !== 'all' || filterInterests.length > 0 || filterFollowers !== 'all' || filterLocation !== 'all') && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {filterEngagement !== 'all' && ( <Chip label={`${t('engagementLabel')}: ${t(filterEngagement + 'Engagement')}`} onDelete={() => setFilterEngagement('all')} size="small" /> )}
            {filterFollowers !== 'all' && ( <Chip label={`${t('followerCountLabel')}: ${filterFollowers}`} onDelete={() => setFilterFollowers('all')} size="small" /> )}
            {filterLocation !== 'all' && ( <Chip label={`${t('locationLabel')}: ${filterLocation}`} onDelete={() => setFilterLocation('all')} size="small" /> )}
            {filterInterests.map((interest) => ( <Chip key={interest} label={`${t('interestsLabel')}: ${interest}`} onDelete={() => handleToggleInterest(interest)} size="small" /> ))}
            <Button size="small" onClick={handleClearFilters} sx={{ ml: 1, textTransform: 'none', fontSize: '0.75rem' }} >
              {t('clearAllButton')}
            </Button>
          </Box>
        )}

        <Typography variant="body2" sx={{ mb: 2 }}>
          {activeTab === 'speakers'
            ? t('speakersFound', { count: filteredSpeakers.length })
            : t('listenersFound', { count: filteredListeners.length })}
        </Typography>

        {/* List Area */} 
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, /* ... scrollbar styles ... */ }} >
          {/* Render Speaker or Listener List based on activeTab */} 
          {/* ... (List mapping logic - text inside ListItemText remains mostly dynamic) ... */}
          {activeTab === 'speakers' && (
              <List>
                {isLoadingProfiles && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
                {filteredSpeakers.map((speaker) => (
                   <ListItem key={speaker.userId} /* ... other props ... */ onClick={() => handleUserClick(speaker)}>
                      {/* ... ListItemAvatar ... */}
                      <ListItemText
                         primary={speaker.displayName} // Keep dynamic data
                         secondary={`@${speaker.twitterScreenName}`} // Keep dynamic data
                         // ... (props)
                      />
                   </ListItem>
                ))}
              </List>
           )}
           {activeTab === 'listeners' && (
              <List>
                {filteredListeners.map((listener) => (
                   <ListItem key={listener.userId} /* ... other props ... */ onClick={() => handleUserClick(listener)}>
                      {/* ... ListItemAvatar ... */}
                      <ListItemText
                         primary={listener.displayName} // Keep dynamic data
                         secondary={`@${listener.twitterScreenName}`} // Keep dynamic data
                         // ... (props)
                      />
                   </ListItem>
                ))}
              </List>
           )}
        </Box>

        {/* User Detail Drawer (Re-added) */}
        <UserProfileDrawer
          userDetailDrawer={userDetailDrawer} // Pass the state variable
          setUserDetailDrawer={setUserDetailDrawer} // Pass the state setter
          activeTab={activeTab} // Pass the active tab state
        />

      </Paper>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        PaperProps={{ sx: { width: 320, background: '#1e293b', color: 'white' } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} >
            <Typography variant="h6">
              {t('filtersTitle', { tabName: activeTab === 'speakers' ? t('speakersTab') : t('listenersTab') })}
            </Typography>
            <IconButton onClick={() => setIsFilterDrawerOpen(false)}> <CloseIcon /> </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {activeTab === 'listeners' && (
            <>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t('engagementLevelLabel')}</InputLabel>
                <Select value={filterEngagement} label={t('engagementLevelLabel')} onChange={(e) => setFilterEngagement(e.target.value)} >
                  <MenuItem value="all">{t('allLevels')}</MenuItem>
                  <MenuItem value="high">{t('highEngagement')}</MenuItem>
                  <MenuItem value="medium">{t('mediumEngagement')}</MenuItem>
                  <MenuItem value="low">{t('lowEngagement')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t('followerCountLabel')}</InputLabel>
                <Select value={filterFollowers} label={t('followerCountLabel')} onChange={(e) => setFilterFollowers(e.target.value)} >
                  <MenuItem value="all">{t('allSizes')}</MenuItem>
                  <MenuItem value="large">{t('largeFollowers')}</MenuItem>
                  <MenuItem value="medium">{t('mediumFollowers')}</MenuItem>
                  <MenuItem value="small">{t('smallFollowers')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t('locationLabel')}</InputLabel>
                <Select value={filterLocation} label={t('locationLabel')} onChange={(e) => setFilterLocation(e.target.value)} >
                  <MenuItem value="all">{t('allLocations')}</MenuItem>
                  {ALL_LOCATIONS.map((location) => ( <MenuItem key={location} value={location}> {location} </MenuItem> ))} 
                </Select>
              </FormControl>

              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                {t('interestsLabel')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {ALL_INTERESTS.map((interest) => ( <Chip key={interest} label={interest} onClick={() => handleToggleInterest(interest)} sx={{ /* ... styles ... */ }} /> ))}
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button onClick={handleClearFilters}>{t('clearAllButton')}</Button>
            <Button variant="contained" onClick={() => setIsFilterDrawerOpen(false)} sx={{ /* ... styles ... */ }} >
              {t('applyFiltersButton')}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default AudiencePanel;

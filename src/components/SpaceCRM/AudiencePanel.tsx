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
          <Typography variant="h6">Audience Management</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <IconButton disabled>
              <FilterListIcon />
            </IconButton>
            <FormControl size="small" sx={{ minWidth: 120 }} disabled>
              <InputLabel>Engagement</InputLabel>
              <Select
                value={filterEngagement}
                label="Engagement"
                onChange={(e) => setFilterEngagement(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Speakers" value="speakers" />
          <Tab label="Listeners" value="listeners" />
        </Tabs>

        <List
          sx={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0, // This is crucial for proper scrolling
            '&::-webkit-scrollbar': {
              width: '0.4em',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '4px',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <TextField
              placeholder={`Search ${
                activeTab === 'speakers' ? 'speakers' : 'listeners'
              }...`}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: '70%' }}
              value={searchTerm}
              onChange={handleSearchChange}
            />

            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setIsFilterDrawerOpen(true)}
              sx={{ px: 2 }}
              disabled
            >
              Filter
            </Button>
          </Box>

          {/* Active filters display */}
          {(filterEngagement !== 'all' ||
            filterInterests.length > 0 ||
            filterFollowers !== 'all' ||
            filterLocation !== 'all') && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {filterEngagement !== 'all' && (
                <Chip
                  label={`Engagement: ${filterEngagement}`}
                  onDelete={() => setFilterEngagement('all')}
                  size="small"
                />
              )}

              {filterFollowers !== 'all' && (
                <Chip
                  label={`Followers: ${filterFollowers}`}
                  onDelete={() => setFilterFollowers('all')}
                  size="small"
                />
              )}

              {filterLocation !== 'all' && (
                <Chip
                  label={`Location: ${filterLocation}`}
                  onDelete={() => setFilterLocation('all')}
                  size="small"
                />
              )}

              {filterInterests.map((interest) => (
                <Chip
                  key={interest}
                  label={`Interest: ${interest}`}
                  onDelete={() => handleToggleInterest(interest)}
                  size="small"
                />
              ))}

              <Button
                size="small"
                onClick={handleClearFilters}
                sx={{ ml: 1, textTransform: 'none', fontSize: '0.75rem' }}
              >
                Clear All
              </Button>
            </Box>
          )}

          <Typography variant="body2" sx={{ mb: 2 }}>
            {activeTab === 'speakers'
              ? `${filteredSpeakers.length} ${
                  filteredSpeakers.length === 1 ? 'speaker' : 'speakers'
                } found`
              : `${filteredListeners.length} ${
                  filteredListeners.length === 1 ? 'listener' : 'listeners'
                } found`}
          </Typography>

          {activeTab === 'speakers' ? (
            isLoadingProfiles ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Speakers
                </Typography>
                <Box
                  sx={{
                    maxHeight: 'calc(100vh - 500px)', // Adjust this value based on your layout
                    overflowY: 'auto',
                    pb: 4, // Add bottom padding
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                  }}
                >
                  <List>
                    {filteredSpeakers.map((speaker) => (
                      <ListItem
                        key={speaker.userId}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleUserClick(speaker)}
                            color={
                              selectedAttendees.includes(speaker.userId)
                                ? 'primary'
                                : 'default'
                            }
                          >
                            <BookmarkIcon />
                          </IconButton>
                        }
                        onClick={() => handleUserClick(speaker)}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: selectedAttendees.includes(speaker.userId)
                            ? 'rgba(96, 165, 250, 0.1)'
                            : 'transparent',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            cursor: 'pointer',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            badgeContent={
                              speaker.xProfile?.isVerified ? '✓' : undefined
                            }
                            color="primary"
                          >
                            <Avatar
                              src={
                                speaker.xProfile?.profile_image_url ||
                                speaker.avatarUrl
                              }
                              alt={speaker.displayName}
                            />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={speaker.displayName}
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                @{speaker.twitterScreenName}
                              </Typography>
                              {speaker.xProfile && (
                                <>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {speaker.xProfile.biography}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip
                                      size="small"
                                      label={`${
                                        speaker.xProfile.followersCount || 0
                                      } followers`}
                                    />
                                    <Chip
                                      size="small"
                                      label={`${
                                        speaker.xProfile.followingCount || 0
                                      } following`}
                                    />
                                    <Chip
                                      size="small"
                                      label={`${
                                        speaker.xProfile.tweetsCount || 0
                                      } tweets`}
                                    />
                                  </Box>
                                </>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            )
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Listeners
              </Typography>
              <Box
                sx={{
                  maxHeight: 'calc(100vh - 500px)', // Adjust this value based on your layout
                  overflowY: 'auto',
                  pb: 4, // Add bottom padding
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                }}
              >
                <List>
                  {filteredListeners.map((listener) => (
                    <ListItem
                      key={listener.userId}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleUserClick(listener)}
                        >
                          {selectedAttendees.includes(listener.userId) ? (
                            <BookmarkIcon color="primary" />
                          ) : (
                            <BookmarkIcon />
                          )}
                        </IconButton>
                      }
                      onClick={() => handleUserClick(listener)}
                      sx={{
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: selectedAttendees.includes(listener.userId)
                          ? 'rgba(96, 165, 250, 0.1)'
                          : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          // badgeContent={attendee.engagement.recentInteractions}
                          // color={
                          //   attendee.engagement.recentInteractions > 3
                          //     ? 'success'
                          //     : attendee.engagement.recentInteractions > 0
                          //     ? 'primary'
                          //     : 'default'
                          // }
                        >
                          <Avatar src={listener.avatarUrl} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {listener.displayName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ ml: 1, color: 'gray' }}
                            >
                              @{listener.twitterScreenName}
                            </Typography>
                          </Box>
                        }
                        // secondary={
                        //   <>
                        //     <Typography variant="body2" sx={{ color: 'gray' }}>
                        //       {attendee.bio}
                        //     </Typography>
                        //     <Box
                        //       sx={{
                        //         mt: 1,
                        //         display: 'flex',
                        //         flexWrap: 'wrap',
                        //         gap: 0.5,
                        //       }}
                        //     >
                        //       {attendee.interests.map((interest: string) => (
                        //         <Chip
                        //           key={interest}
                        //           label={interest}
                        //           size="small"
                        //           sx={{
                        //             bgcolor: 'rgba(96, 165, 250, 0.1)',
                        //             color: '#60a5fa',
                        //             fontSize: '0.7rem',
                        //           }}
                        //         />
                        //       ))}
                        //     </Box>
                        //   </>
                        // }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}

          {((activeTab === 'speakers' && enrichedSpeakers.length === 0) ||
            (activeTab === 'listeners' && filteredListeners.length === 0)) && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No {activeTab === 'speakers' ? 'speakers' : 'listeners'} match
                your filters
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            padding: 3,
            background: '#1e293b',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6">
              Filter {activeTab === 'speakers' ? 'Speakers' : 'Listeners'}
            </Typography>
            <IconButton onClick={() => setIsFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {activeTab === 'listeners' && (
            <>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Engagement Level</InputLabel>
                <Select
                  value={filterEngagement}
                  label="Engagement Level"
                  onChange={(e) => setFilterEngagement(e.target.value)}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Follower Count</InputLabel>
                <Select
                  value={filterFollowers}
                  label="Follower Count"
                  onChange={(e) => setFilterFollowers(e.target.value)}
                >
                  <MenuItem value="all">All Sizes</MenuItem>
                  <MenuItem value="large">Large (5000+)</MenuItem>
                  <MenuItem value="medium">Medium (1000-5000)</MenuItem>
                  <MenuItem value="small">Small (&lt;1000)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Location</InputLabel>
                <Select
                  value={filterLocation}
                  label="Location"
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  {ALL_LOCATIONS.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Interests
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {ALL_INTERESTS.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    onClick={() => handleToggleInterest(interest)}
                    sx={{
                      bgcolor: filterInterests.includes(interest)
                        ? 'rgba(96, 165, 250, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                    }}
                  />
                ))}
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button onClick={handleClearFilters}>Clear All</Button>
            <Button
              variant="contained"
              onClick={() => setIsFilterDrawerOpen(false)}
              sx={{
                background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Listener Detail Drawer */}
      <UserProfileDrawer
        userDetailDrawer={userDetailDrawer}
        setUserDetailDrawer={setUserDetailDrawer}
        activeTab={activeTab}
      />
    </Box>
  );
};

export default AudiencePanel;

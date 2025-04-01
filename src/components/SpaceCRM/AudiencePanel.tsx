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
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';
import TwitterIcon from '@mui/icons-material/Twitter';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { Space, User } from '../../services/db/spaces.service';
import {
  enrichSpeakerData,
  XUserProfile,
  XTweet,
} from '../../services/x.service';

// Mock data for attendees
const MOCK_ATTENDEES = Array(20)
  .fill(null)
  .map((_, i) => ({
    id: `user${i}`,
    username: `user${i}`,
    displayName: `User ${i}`,
    profileImage: `https://i.pravatar.cc/150?u=${i}`,
    bio: `Professional in the field of ${['AI', 'Marketing', 'Design', 'Development', 'Business'][i % 5]}`,
    followersCount: Math.floor(Math.random() * 10000),
    engagement: {
      inSpaceComments: Math.floor(Math.random() * 10),
      likedPosts: Math.floor(Math.random() * 50),
      recentInteractions: Math.floor(Math.random() * 5),
    },
    interests: ['AI', 'Web3', 'Marketing', 'Technology'].slice(
      0,
      Math.floor(Math.random() * 4) + 1
    ),
    recentPosts: Array(3)
      .fill(null)
      .map((_, j) => ({
        content: `This is post ${j} about ${['AI', 'Marketing', 'Technology'][j % 3]}`,
        engagement: Math.floor(Math.random() * 100),
        timestamp: new Date(Date.now() - j * 86400000).toISOString(),
      })),
    location: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'][i % 5],
    joinedDate: new Date(
      Date.now() - Math.floor(Math.random() * 1000 * 86400000)
    ).toISOString(),
  }));

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
type EnrichedUser = User & {
  xProfile?: XUserProfile;
  xTweets?: XTweet[];
};

interface AudiencePanelProps {
  onSelectAttendees?: (attendees: string[]) => void;
  space?: Space | null;
}

/**
 * AudiencePanel Component
 *
 * This component provides a comprehensive view of space attendees
 * with filtering, segmentation, and engagement capabilities.
 */
const AudiencePanel: React.FC<AudiencePanelProps> = ({
  onSelectAttendees,
  space,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [attendeeDetailDrawer, setAttendeeDetailDrawer] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<'speakers' | 'attendees'>(
    'speakers'
  );

  // Filter states
  const [filterEngagement, setFilterEngagement] = useState<string>('all');
  const [filterInterests, setFilterInterests] = useState<string[]>([]);
  const [filterFollowers, setFilterFollowers] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Detail drawer tab state
  const [detailTab, setDetailTab] = useState<string>('profile');

  const [enrichedSpeakers, setEnrichedSpeakers] = useState<
    (User & { xProfile?: XUserProfile; recentTweets?: XTweet[] })[]
  >([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const fetchEnrichedSpeakers = async (speakersToEnrich: User[]) => {
    setIsLoadingProfiles(true);
    // Use a temporary array to build results before setting state
    const newlyEnrichedData: EnrichedUser[] = [];
    for (const speaker of speakersToEnrich) {
      try {
        console.log(
          `Attempting to enrich speaker: ${speaker.twitter_screen_name}`
        );
        const enriched = await enrichSpeakerData(speaker);
        if (enriched) {
          console.log(
            `Successfully enriched speaker: ${speaker.twitter_screen_name}`
          );
          newlyEnrichedData.push(enriched);
        } else {
          console.log(
            `Failed to enrich speaker (enrichSpeakerData returned null): ${speaker.twitter_screen_name}`
          );
          // Push original speaker data if enrichment fails but we still want to show the user
          newlyEnrichedData.push({
            ...speaker,
            xProfile: undefined,
            xTweets: [],
          });
        }
        // Add a longer delay to avoid hitting rate limits too quickly
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1000ms (1 second) delay
      } catch (error) {
        console.error(
          `Error enriching speaker ${speaker.twitter_screen_name}:`,
          error
        );
        // Push original speaker data if an error occurs during enrichment
        newlyEnrichedData.push({
          ...speaker,
          xProfile: undefined,
          xTweets: [],
        });
      }
    }
    // Set state once after the loop completes for the fetched speaker(s)
    setEnrichedSpeakers((prev) => [...prev, ...newlyEnrichedData]);
    setIsLoadingProfiles(false);
    console.log('Finished enriching speaker(s).');
  };

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
      fetchEnrichedSpeakers(space.speakers.slice(0, 1));
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

  const handleAttendeeSelect = (attendeeId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(attendeeId)
        ? prev.filter((id) => id !== attendeeId)
        : [...prev, attendeeId]
    );

    // Notify parent component if callback is provided
    if (onSelectAttendees) {
      const newSelected = selectedAttendees.includes(attendeeId)
        ? selectedAttendees.filter((id) => id !== attendeeId)
        : [...selectedAttendees, attendeeId];
      onSelectAttendees(newSelected);
    }
  };

  const handleAttendeeClick = (attendeeId: string) => {
    setAttendeeDetailDrawer(attendeeId);
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
        xProfile: enrichedSpeakers.find((es) => es.user_id === speaker.user_id)
          ?.xProfile,
      }))
      .filter((speaker) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          speaker.display_name.toLowerCase().includes(searchLower) ||
          speaker.twitter_screen_name.toLowerCase().includes(searchLower)
        );
      }) || [];

  // Filter attendees based on search term and other filters
  const filteredAttendees = MOCK_ATTENDEES.filter((attendee) => {
    // Search term filter
    if (
      searchTerm &&
      !attendee.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !attendee.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !attendee.bio.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Engagement filter
    if (
      filterEngagement === 'high' &&
      attendee.engagement.recentInteractions < 3
    )
      return false;
    if (
      filterEngagement === 'medium' &&
      (attendee.engagement.recentInteractions < 1 ||
        attendee.engagement.recentInteractions > 3)
    )
      return false;
    if (
      filterEngagement === 'low' &&
      attendee.engagement.recentInteractions > 1
    )
      return false;

    // Interests filter
    if (
      filterInterests.length > 0 &&
      !filterInterests.some((interest) => attendee.interests.includes(interest))
    )
      return false;

    // Followers filter
    if (filterFollowers === 'large' && attendee.followersCount < 5000)
      return false;
    if (
      filterFollowers === 'medium' &&
      (attendee.followersCount < 1000 || attendee.followersCount >= 5000)
    )
      return false;
    if (filterFollowers === 'small' && attendee.followersCount >= 1000)
      return false;

    // Location filter
    if (filterLocation !== 'all' && attendee.location !== filterLocation)
      return false;

    return true;
  });

  // Find the selected attendee for the detail drawer
  const selectedAttendee = attendeeDetailDrawer
    ? activeTab === 'speakers'
      ? filteredSpeakers.find((s) => s.user_id === attendeeDetailDrawer)
      : MOCK_ATTENDEES.find((a) => a.id === attendeeDetailDrawer)
    : null;

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
            <IconButton>
              <FilterListIcon />
            </IconButton>
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
          <Tab label="Attendees" value="attendees" />
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
              placeholder={`Search ${activeTab === 'speakers' ? 'speakers' : 'attendees'}...`}
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
              ? `${filteredSpeakers.length} ${filteredSpeakers.length === 1 ? 'speaker' : 'speakers'} found`
              : `${filteredAttendees.length} ${filteredAttendees.length === 1 ? 'attendee' : 'attendees'} found`}
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
                        key={speaker.user_id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() =>
                              handleAttendeeSelect(speaker.user_id)
                            }
                            color={
                              selectedAttendees.includes(speaker.user_id)
                                ? 'primary'
                                : 'default'
                            }
                          >
                            <BookmarkIcon />
                          </IconButton>
                        }
                        onClick={() => handleAttendeeClick(speaker.user_id)}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: selectedAttendees.includes(speaker.user_id)
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
                              speaker.xProfile?.verified ? '✓' : undefined
                            }
                            color="primary"
                          >
                            <Avatar
                              src={
                                speaker.xProfile?.profile_image_url ||
                                speaker.avatar_url
                              }
                              alt={speaker.display_name}
                            />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={speaker.display_name}
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                @{speaker.twitter_screen_name}
                              </Typography>
                              {speaker.xProfile && (
                                <>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {speaker.xProfile.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip
                                      size="small"
                                      label={`${speaker.xProfile.public_metrics?.followers_count || 0} followers`}
                                    />
                                    <Chip
                                      size="small"
                                      label={`${speaker.xProfile.public_metrics?.following_count || 0} following`}
                                    />
                                    <Chip
                                      size="small"
                                      label={`${speaker.xProfile.public_metrics?.tweet_count || 0} tweets`}
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
                  {filteredAttendees.map((attendee: MockAttendee) => (
                    <ListItem
                      key={attendee.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleAttendeeSelect(attendee.id)}
                        >
                          {selectedAttendees.includes(attendee.id) ? (
                            <BookmarkIcon color="primary" />
                          ) : (
                            <BookmarkIcon />
                          )}
                        </IconButton>
                      }
                      onClick={() => handleAttendeeClick(attendee.id)}
                      sx={{
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: selectedAttendees.includes(attendee.id)
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
                          badgeContent={attendee.engagement.recentInteractions}
                          color={
                            attendee.engagement.recentInteractions > 3
                              ? 'success'
                              : attendee.engagement.recentInteractions > 0
                                ? 'primary'
                                : 'default'
                          }
                        >
                          <Avatar src={attendee.profileImage} />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {attendee.displayName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ ml: 1, color: 'gray' }}
                            >
                              @{attendee.username}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ color: 'gray' }}>
                              {attendee.bio}
                            </Typography>
                            <Box
                              sx={{
                                mt: 1,
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.5,
                              }}
                            >
                              {attendee.interests.map((interest: string) => (
                                <Chip
                                  key={interest}
                                  label={interest}
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(96, 165, 250, 0.1)',
                                    color: '#60a5fa',
                                    fontSize: '0.7rem',
                                  }}
                                />
                              ))}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}

          {((activeTab === 'speakers' && enrichedSpeakers.length === 0) ||
            (activeTab === 'attendees' && filteredAttendees.length === 0)) && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No {activeTab === 'speakers' ? 'speakers' : 'attendees'} match
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
              Filter {activeTab === 'speakers' ? 'Speakers' : 'Attendees'}
            </Typography>
            <IconButton onClick={() => setIsFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {activeTab === 'attendees' && (
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

      {/* Attendee Detail Drawer */}
      <Drawer
        anchor="right"
        open={!!attendeeDetailDrawer}
        onClose={() => setAttendeeDetailDrawer(null)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            padding: 3,
            background: '#1e293b',
            color: 'white',
          },
        }}
      >
        {selectedAttendee && (
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
                {activeTab === 'speakers' ? 'Speaker' : 'Attendee'} Profile
              </Typography>
              <IconButton onClick={() => setAttendeeDetailDrawer(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={
                  activeTab === 'speakers'
                    ? (selectedAttendee as User).avatar_url
                    : (selectedAttendee as any).profileImage
                }
                sx={{ width: 64, height: 64, mr: 2 }}
              />
              <Box>
                <Typography variant="h6">
                  {activeTab === 'speakers'
                    ? (selectedAttendee as User).display_name
                    : (selectedAttendee as any).displayName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  @
                  {activeTab === 'speakers'
                    ? (selectedAttendee as User).twitter_screen_name
                    : (selectedAttendee as any).username}
                </Typography>
                {activeTab === 'attendees' && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {(selectedAttendee as any).followersCount.toLocaleString()}{' '}
                    followers
                  </Typography>
                )}
              </Box>
            </Box>

            <Tabs
              value={detailTab}
              onChange={(_, newValue) => setDetailTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab icon={<PersonIcon />} value="profile" />
              <Tab icon={<TwitterIcon />} value="activity" />
              <Tab icon={<MessageIcon />} value="engagement" />
              <Tab icon={<BarChartIcon />} value="insights" />
            </Tabs>

            {detailTab === 'profile' && (
              <>
                {activeTab === 'speakers' ? (
                  <>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Bio
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      {(selectedAttendee as User & { xProfile?: XUserProfile })
                        .xProfile?.description || 'No bio available'}
                    </Typography>

                    {(selectedAttendee as User & { xProfile?: XUserProfile })
                      .xProfile?.public_metrics && (
                      <>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          X Stats
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            mb: 3,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: 'text.secondary' }}
                            >
                              Followers
                            </Typography>
                            <Typography variant="body1">
                              {(
                                selectedAttendee as User & {
                                  xProfile?: XUserProfile;
                                }
                              ).xProfile?.public_metrics.followers_count.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: 'text.secondary' }}
                            >
                              Following
                            </Typography>
                            <Typography variant="body1">
                              {(
                                selectedAttendee as User & {
                                  xProfile?: XUserProfile;
                                }
                              ).xProfile?.public_metrics.following_count.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: 'text.secondary' }}
                            >
                              Tweets
                            </Typography>
                            <Typography variant="body1">
                              {(
                                selectedAttendee as User & {
                                  xProfile?: XUserProfile;
                                }
                              ).xProfile?.public_metrics.tweet_count.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: 'text.secondary' }}
                            >
                              Lists
                            </Typography>
                            <Typography variant="body1">
                              {(
                                selectedAttendee as User & {
                                  xProfile?: XUserProfile;
                                }
                              ).xProfile?.public_metrics.listed_count.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Bio
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      {(selectedAttendee as any).bio}
                    </Typography>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      {(selectedAttendee as any).location}
                    </Typography>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Joined X
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      {new Date(
                        (selectedAttendee as any).joinedDate
                      ).toLocaleDateString()}
                    </Typography>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Interests
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}
                    >
                      {Array.isArray((selectedAttendee as any).interests) &&
                        (selectedAttendee as any).interests.map(
                          (interest: string) => (
                            <Chip
                              key={interest}
                              label={interest}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(96, 165, 250, 0.1)',
                                color: '#60a5fa',
                              }}
                            />
                          )
                        )}
                    </Box>
                  </>
                )}
              </>
            )}

            {detailTab === 'activity' && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Recent Posts
                </Typography>
                {activeTab === 'speakers'
                  ? (
                      selectedAttendee as User & { recentTweets?: XTweet[] }
                    ).recentTweets?.map((tweet, index) => (
                      <Paper
                        key={tweet.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {tweet.text}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {new Date(tweet.created_at).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {tweet.public_metrics.like_count} likes
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {tweet.public_metrics.retweet_count} retweets
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {tweet.public_metrics.reply_count} replies
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    )) || (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                      >
                        No recent tweets available
                      </Typography>
                    )
                  : (selectedAttendee as any).recentPosts.map(
                      (post: any, index: number) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {post.content}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {new Date(post.timestamp).toLocaleDateString()}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {post.engagement} engagements
                            </Typography>
                          </Box>
                        </Paper>
                      )
                    )}
              </>
            )}

            {detailTab === 'engagement' && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Engagement History
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Engagement in this Space
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Comments:</Typography>
                    <Typography variant="body2">
                      {(selectedAttendee as any).engagement.inSpaceComments}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Liked Posts:</Typography>
                    <Typography variant="body2">
                      {(selectedAttendee as any).engagement.likedPosts}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body2">
                      Recent Interactions:
                    </Typography>
                    <Typography variant="body2">
                      {(selectedAttendee as any).engagement.recentInteractions}
                    </Typography>
                  </Box>
                </Paper>

                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Message History
                </Typography>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 2 }}
                  >
                    No previous messages with this{' '}
                    {activeTab === 'speakers' ? 'speaker' : 'attendee'}
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<MessageIcon />}
                    sx={{
                      background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                    }}
                  >
                    Start Conversation
                  </Button>
                </Box>
              </>
            )}

            {detailTab === 'insights' && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  AI Insights
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, fontStyle: 'italic' }}
                  >
                    Based on this{' '}
                    {activeTab === 'speakers' ? 'speaker' : 'attendee'}'s
                    profile and activity, here are some insights:
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    •{' '}
                    {activeTab === 'speakers'
                      ? 'Key speaker in the space'
                      : 'Highly engaged in AI-related topics'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    •{' '}
                    {activeTab === 'speakers'
                      ? 'Influential voice in the community'
                      : 'Frequently interacts with content about Web3'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    •{' '}
                    {activeTab === 'speakers'
                      ? 'Active in multiple spaces'
                      : 'Active during morning hours (EST)'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    •{' '}
                    {activeTab === 'speakers'
                      ? 'Strong engagement with audience'
                      : 'Responds well to technical deep dives'}
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AutoFixHighIcon />}
                    size="small"
                  >
                    Generate Deeper Insights
                  </Button>
                </Paper>

                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Engagement Opportunities
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, fontStyle: 'italic' }}
                  >
                    Recommended ways to engage with this{' '}
                    {activeTab === 'speakers' ? 'speaker' : 'attendee'}:
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    •{' '}
                    {activeTab === 'speakers'
                      ? 'Invite to future spaces'
                      : 'Share technical resources about Web3 development'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    •{' '}
                    {activeTab === 'speakers'
                      ? 'Collaborate on content'
                      : 'Invite to upcoming AI Twitter spaces'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    •{' '}
                    {activeTab === 'speakers'
                      ? 'Feature in promotional materials'
                      : 'Mention in a thread about emerging tech trends'}
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<MessageIcon />}
                    size="small"
                  >
                    Create Custom Message
                  </Button>
                </Paper>
              </>
            )}

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}
            >
              <Button
                variant="outlined"
                startIcon={<BookmarkIcon />}
                onClick={() => {
                  const id =
                    activeTab === 'speakers'
                      ? (selectedAttendee as User).user_id
                      : (selectedAttendee as any).id;
                  handleAttendeeSelect(id);
                }}
              >
                {selectedAttendees.includes(
                  activeTab === 'speakers'
                    ? (selectedAttendee as User).user_id
                    : (selectedAttendee as any).id
                )
                  ? 'Unmark'
                  : 'Bookmark'}
              </Button>

              <Button
                variant="contained"
                startIcon={<MessageIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                }}
              >
                Message
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default AudiencePanel;

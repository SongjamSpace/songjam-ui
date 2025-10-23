import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Search, Storage } from '@mui/icons-material';
import axios from 'axios';
import { db } from '../services/firebase.service';
import { doc, onSnapshot } from 'firebase/firestore';
import { MongoTweet, Profile } from '../types/backend.types';
import TwitterCard from '../components/TwitterCard';
import ProfileCard from '../components/ProfileCard';

// SnapJob interface
export interface SnapJob {
  searchQuery: string;
  status: 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: number;
  updatedAt: number;
  tweetsCount: number;
  profilesCount: number;
  error?: string;
  lastCursor?: string;
}

export default function CreateDb() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchResults, setSearchResults] = useState<(MongoTweet | Profile)[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);

  // Job monitoring state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<SnapJob | null>(null);
  const [maxCount, setMaxCount] = useState(100);
  const [isFetchingTweets, setIsFetchingTweets] = useState(false);
  const [searchType, setSearchType] = useState<'PROFILES' | 'TWEETS'>(
    'PROFILES'
  );

  // Job monitoring with Firebase real-time listener
  useEffect(() => {
    if (!currentJobId) return;

    const jobRef = doc(db, 'snapJobs', currentJobId);

    const unsubscribe = onSnapshot(
      jobRef,
      (doc) => {
        if (doc.exists()) {
          const job = doc.data() as SnapJob;
          setCurrentJob(job);

          // Load search query from job when job exists
          if (job.searchQuery) {
            setSearchQuery(job.searchQuery);
          }

          // Update progress and message based on job status
          if (job.status === 'PROCESSING') {
            setSearchMessage(
              `Processing... Found ${job.tweetsCount} tweets and ${job.profilesCount} profiles`
            );
            setSearchProgress(Math.min((job.tweetsCount / maxCount) * 100, 90));
          } else if (job.status === 'COMPLETED') {
            setSearchProgress(100);
            setSearchMessage(
              `Completed! Found ${job.tweetsCount} tweets and ${job.profilesCount} profiles`
            );
            setIsSearching(false);
            setShowResults(true);

            // Fetch the actual tweets
            fetchSampleTweets(currentJobId);
          } else if (job.status === 'FAILED') {
            setSearchMessage(`Failed: ${job.error || 'Unknown error'}`);
            setIsSearching(false);
          }
        } else {
          console.error('Job document not found');
          setSearchMessage('Job not found');
          setIsSearching(false);
        }
      },
      (error) => {
        console.error('Error listening to job status:', error);
        setSearchMessage('Error monitoring job status');
        setIsSearching(false);
      }
    );

    return () => unsubscribe();
  }, [currentJobId, maxCount]);

  const fetchSampleTweets = async (jobId: string) => {
    const token = localStorage.getItem('dynamic_authentication_token');
    if (!token) {
      alert('No token found');
      return;
    }
    setIsFetchingTweets(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_JAM_SERVER_URL
        }/snaps/samples/${jobId}?searchType=${searchType}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );
      if (response.data.samples) {
        setSearchResults(response.data.samples);
      }
    } catch (error) {
      console.error('Error fetching sample tweets:', error);
    } finally {
      setIsFetchingTweets(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    const token = localStorage.getItem('dynamic_authentication_token');
    if (!token) {
      alert('No token found');
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    setSearchMessage('Initializing search...');
    setShowResults(false);
    setCurrentJobId(null);
    setCurrentJob(null);

    try {
      // Start the scraping process
      const response = await axios.post(
        `${import.meta.env.VITE_JAM_SERVER_URL}/snaps/process`,
        {
          searchQuery,
          searchType,
          maxCount,
        },
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );

      if (response.data.success) {
        const { jobId } = response.data;
        setCurrentJobId(jobId);
        setSearchMessage('Process started...');
        // setSearchProgress(10);
      } else {
        throw new Error(
          response.data.message || 'Failed to start scraping process'
        );
      }
    } catch (error) {
      console.error('Search error:', error);
      setIsSearching(false);
      setSearchMessage('Search failed. Please try again.');
      setSearchProgress(0);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              mb: 2,
            }}
          >
            Create Database
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              mb: 4,
            }}
          >
            Search and store profiles based on keywords, tags, and mentions
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 1,
          }}
        >
          {/* Search Query Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
              Search Query
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter keywords, $tags, @mentions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              InputProps={{
                readOnly: !!currentJobId,
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: currentJobId
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: currentJobId
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: currentJobId
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: currentJobId
                      ? 'rgba(255, 255, 255, 0.1)'
                      : '#60a5fa',
                  },
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: 'text.secondary',
                fontSize: '0.875rem',
                opacity: 0.8,
              }}
            >
              💡 Tip: You can copy the search query from{' '}
              <a
                href="http://x.com/search-advanced"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#60a5fa',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Twitter's Advanced Search
              </a>{' '}
              and paste it here for more precise results
            </Typography>
          </Box>

          {/* Search Type and Max Tweets Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: 'text.secondary' }}
                >
                  Search Type
                </Typography>
                <Select
                  size="small"
                  value={searchType}
                  onChange={(e) =>
                    setSearchType(e.target.value as 'PROFILES' | 'TWEETS')
                  }
                  disabled={!!currentJobId}
                  sx={{
                    color: 'text.primary',
                    minWidth: 150,
                    '& .MuiOutlinedInput-root': {
                      background: currentJobId
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : '#60a5fa',
                      },
                    },
                  }}
                >
                  <MenuItem value="TWEETS">Tweets</MenuItem>
                  <MenuItem value="PROFILES">Profiles</MenuItem>
                </Select>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: 'text.secondary' }}
                >
                  Max {searchType === 'PROFILES' ? 'Profiles' : 'Tweets'}
                </Typography>
                <TextField
                  type="number"
                  placeholder="100"
                  value={maxCount}
                  onChange={(e) => setMaxCount(parseInt(e.target.value) || 100)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: !!currentJobId,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: currentJobId
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : '#60a5fa',
                      },
                    },
                  }}
                />
              </Box>
              {/* <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: 'text.secondary' }}
                >
                  Max Profiles
                </Typography>
                <TextField
                  type="number"
                  placeholder="50"
                  value={maxProfiles}
                  onChange={(e) =>
                    setMaxProfiles(parseInt(e.target.value) || 50)
                  }
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: !!currentJobId,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: currentJobId
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: currentJobId
                          ? 'rgba(255, 255, 255, 0.1)'
                          : '#60a5fa',
                      },
                    },
                  }}
                />
              </Box> */}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Create DB Button */}
          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            <LoadingButton
              variant="contained"
              size="large"
              loading={isSearching}
              onClick={handleSearch}
              disabled={!searchQuery.trim() || !!currentJob}
              startIcon={<Storage />}
              sx={{
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                  boxShadow: '0 8px 20px rgba(96, 165, 250, 0.4)',
                },
              }}
            >
              Create DB
            </LoadingButton>
            <Button variant="outlined" size="small" href="/auto-dms">
              Go to AutoDms
            </Button>
          </Box>

          {/* Progress Section */}
          {isSearching && (
            <Box sx={{ mt: 4 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                {searchMessage}
              </Alert>
              <LinearProgress
                variant="determinate"
                value={searchProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                    borderRadius: 4,
                  },
                }}
              />
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {Math.round(searchProgress)}% Complete
                </Typography>
                {currentJob && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      label={`${currentJob.tweetsCount} tweets`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${currentJob.profilesCount} profiles`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Paper>
        <Paper
          elevation={3}
          sx={{
            mt: 2,
            p: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 1,
          }}
        >
          {/* Search Results */}
          {showResults && currentJob?.status === 'COMPLETED' && (
            <Box sx={{ mt: 4 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Database creation completed successfully!
                {currentJob && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Found{' '}
                    {searchType === 'TWEETS'
                      ? `${currentJob.tweetsCount} tweets and ${currentJob.profilesCount} profiles`
                      : `${currentJob.profilesCount} profiles`}
                    .
                  </Typography>
                )}
              </Alert>

              {/* Sample Results Display */}
              {isFetchingTweets && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 2 }}
                  >
                    Loading sample{' '}
                    {searchType === 'TWEETS' ? 'tweets' : 'profiles'}...
                  </Typography>
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              )}
            </Box>
          )}
          {searchResults.length > 0 && !isFetchingTweets && (
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: 'text.primary', textAlign: 'center' }}
              >
                Sample {searchType === 'TWEETS' ? 'Tweets' : 'Profiles'} (
                {searchResults.length} shown)
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  //   alignItems: 'flex-start',
                  overflowX: 'auto',
                  gap: 2,
                  px: 1,
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 4,
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                }}
              >
                {searchResults.map((item, index) => {
                  if (searchType === 'TWEETS' && 'text' in item) {
                    // This is a tweet
                    const tweet = item as MongoTweet;
                    return (
                      <TwitterCard
                        key={tweet.id || index}
                        tweet={tweet}
                        onLike={(tweetId) => {
                          console.log('Liked tweet:', tweetId);
                        }}
                        onRetweet={(tweetId) => {
                          console.log('Retweeted tweet:', tweetId);
                        }}
                        onReply={(tweetId) => {
                          console.log('Replied to tweet:', tweetId);
                        }}
                        onShare={(tweetId) => {
                          console.log('Shared tweet:', tweetId);
                          // You can implement actual sharing functionality here
                        }}
                      />
                    );
                  } else if (searchType === 'PROFILES' && 'username' in item) {
                    // This is a profile
                    const profile = item as Profile;
                    return (
                      <ProfileCard
                        key={profile.userId || profile.username || index}
                        profile={profile}
                        onFollow={(userId) => {
                          console.log('Followed user:', userId);
                        }}
                        onMessage={(userId) => {
                          console.log('Messaged user:', userId);
                        }}
                        onViewProfile={(userId) => {
                          console.log('Viewed profile:', userId);
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

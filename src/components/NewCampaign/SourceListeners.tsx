import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import {
  getListenersAcrossSpaces,
  getTestListeners,
  SpaceDoc,
  SpaceListener,
} from '../../services/db/spaces.service';
import { SongjamUser } from '../../services/db/user.service';

type SourceListenersProps = {
  selectedSpaces: SpaceDoc[];
  setSelectedSpaces: Dispatch<SetStateAction<SpaceDoc[]>>;
  currentPlan: string;
  upgradePlan: () => void;
  user: SongjamUser;
  selectedTopics: string[];
  setSelectedTopics: Dispatch<SetStateAction<string[]>>;
};

const SourceListeners: React.FC<SourceListenersProps> = ({
  currentPlan,
  upgradePlan,
  user,
  selectedTopics,
  setSelectedTopics,
}) => {
  const [listeners, setListeners] = useState<SpaceListener[]>([]);

  // Fetch spaces on component mount
  useEffect(() => {
    fetchListeners();
  }, []);

  const fetchListeners = async () => {
    try {
      // TODO: Replace with actual API call
      const listeners = await getListenersAcrossSpaces();
      console.log('listeners', listeners);
      setListeners(listeners);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Source Listeners</Typography>
        <Box display={'flex'} gap={1} flexWrap={'wrap'}>
          {[
            'Business and Finance',
            'Music',
            'Sports',
            'Technology',
            'Gaming',
            'World News',
            'Entertainment',
            'Arts and Culture',
            'Home and Family',
            'Careers',
          ].map((topic) => (
            <Chip
              key={topic}
              label={topic}
              variant={selectedTopics.includes(topic) ? 'filled' : 'outlined'}
              onClick={async () => {
                setSelectedTopics([...selectedTopics, topic]);
                const listeners = await getTestListeners();
                setListeners(listeners);
              }}
            />
          ))}
        </Box>

        {/* Selected Spaces Summary */}
        {user.currentPlan === 'free' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box display={'flex'} alignItems={'center'} gap={1} flexGrow={1}>
              <Chip size="small" label={currentPlan.toUpperCase()} />
              <Typography variant="body1">
                {currentPlan === 'free'
                  ? `Listeners: ${listeners.length}/100`
                  : `Unlimited Spaces`}
              </Typography>
              {true && (
                <Typography variant="body2" sx={{ ml: 'auto' }}>
                  <span
                    style={{
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'underline',
                    }}
                  >
                    Upgrade to PRO
                  </span>{' '}
                  for unlimited spaces
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Space Cards Grid */}
        <Grid
          container
          spacing={2}
          sx={{ overflowY: 'auto', maxHeight: '80vh' }}
        >
          {listeners.map((listener) => (
            <Grid item xs={12} md={6} key={listener.userId}>
              <ListenerCard listener={listener} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};

const ListenerCard: React.FC<{ listener: SpaceListener }> = ({ listener }) => {
  return (
    <Card
      sx={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={listener.avatarUrl}
            alt={listener.displayName}
            sx={{
              width: 56,
              height: 56,
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {listener.displayName}
              </Typography>
              {listener.isVerified && (
                <VerifiedIcon sx={{ color: '#1DA1F2', fontSize: 20 }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              @{listener.twitterScreenName}
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1}>
          {listener.biography && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {listener.biography}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {listener.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {listener.location}
                </Typography>
              </Box>
            )}

            {listener.followersCount && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {listener.followersCount} followers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {listener.followingCount} following
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SourceListeners;

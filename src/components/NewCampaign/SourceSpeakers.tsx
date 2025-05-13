import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { getSpaces, SpaceDoc } from '../../services/db/spaces.service';
import SpaceSpeakerInfo from '../SpaceSpeakerInfo';
import { SongjamUser } from '../../services/db/user.service';

type SourceSpeakersProps = {
  selectedSpaces: SpaceDoc[];
  setSelectedSpaces: Dispatch<SetStateAction<SpaceDoc[]>>;
  currentPlan: string;
  upgradePlan: () => void;
  user: SongjamUser;
};

const SourceSpeakers: React.FC<SourceSpeakersProps> = ({
  selectedSpaces,
  setSelectedSpaces,
  currentPlan,
  upgradePlan,
  user,
}) => {
  const [spaces, setSpaces] = useState<SpaceDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  //   const [loading, setLoading] = useState(false);

  // Fetch spaces on component mount
  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      // TODO: Replace with actual API call
      const _spaces = await getSpaces();
      setSpaces(_spaces);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  const filteredSpaces = spaces.filter((space) =>
    space.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSpaceSelect = (space: SpaceDoc) => {
    if (
      selectedSpaces.length >= 8 &&
      !selectedSpaces.find((s) => s.id === space.id)
    ) {
      return; // Maximum 8 spaces reached
    }

    setSelectedSpaces((prev) => {
      const isSelected = prev.find((s) => s.id === space.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== space.id);
      }
      return [...prev, space];
    });
  };

  return (
    <Box sx={{ px: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h6">Source Speakers</Typography>
        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search spaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
        />

        {/* Selected Spaces Summary */}
        {user.currentPlan === 'free' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box display={'flex'} alignItems={'center'} gap={1} flexGrow={1}>
              <Chip size="small" label={currentPlan.toUpperCase()} />
              <Typography variant="body1">
                {currentPlan === 'free'
                  ? `Spaces: ${selectedSpaces.length}/8`
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
        <Stack spacing={2} sx={{ overflowY: 'auto', maxHeight: '650px' }}>
          {filteredSpaces.map((space) => {
            const isSelected = selectedSpaces.find((s) => s.id === space.id);
            return (
              <Box
                key={space.id}
                sx={{
                  cursor: 'pointer',
                  p: 2,
                  borderRadius: 1,
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  color: isSelected ? 'white' : 'inherit',
                  transition: 'all 0.3s ease',
                  borderLeft: isSelected ? '4px solid #3b82f6' : 'none',
                  boxShadow: isSelected
                    ? '0 4px 12px rgba(59, 130, 246, 0.25)'
                    : 'none',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: isSelected
                      ? '0 6px 16px rgba(59, 130, 246, 0.3)'
                      : 3,
                  },
                }}
                onClick={() => handleSpaceSelect(space)}
              >
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack spacing={1}>
                      <Typography variant="h6">{space.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label={`${
                            Array.isArray(space.speakers)
                              ? space.speakers.length
                              : 0
                          } Speakers`}
                          color={isSelected ? 'default' : 'primary'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{
                            bgcolor: isSelected
                              ? 'rgba(255,255,255,0.2)'
                              : 'transparent',
                            color: isSelected ? 'white' : 'inherit',
                          }}
                        />
                        <Chip
                          size="small"
                          label={`${space.totalLiveListeners || 0} Listeners`}
                          color={isSelected ? 'default' : 'secondary'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{
                            bgcolor: isSelected
                              ? 'rgba(255,255,255,0.2)'
                              : 'transparent',
                            color: isSelected ? 'white' : 'inherit',
                          }}
                        />
                      </Box>
                    </Stack>
                    <IconButton
                      size="small"
                      sx={{
                        color: isSelected ? 'white' : 'inherit',
                        '&:hover': {
                          bgcolor: isSelected
                            ? 'rgba(255,255,255,0.2)'
                            : 'rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      {isSelected ? <RemoveIcon /> : <AddIcon />}
                    </IconButton>
                  </Stack>

                  <Box
                    sx={{
                      overflowX: 'auto',
                      display: 'flex',
                      gap: 1,
                      width: '100%',
                    }}
                  >
                    {space.speakers.map((speaker) => (
                      <Grid item xs={12} sm={6} lg={4} key={speaker.userId}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 1,
                            overflow: 'hidden',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://x.com/${speaker.twitterScreenName}`,
                              '_blank'
                            );
                          }}
                        >
                          <SpaceSpeakerInfo speaker={speaker} />
                        </Box>
                      </Grid>
                    ))}
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
};

export default SourceSpeakers;

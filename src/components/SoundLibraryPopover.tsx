import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  PlayArrow,
  MusicNote,
  CheckCircle,
  VolumeUp,
} from '@mui/icons-material';
import {
  getDefaultSoundFiles,
  getMusicUploadsByUserId,
} from '../services/storage/musicAgent.storage';

interface SoundLibraryPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSelectSound: (
    sound: { name: string; audioUrl: string },
    slotIndex: number
  ) => void;
  availableSlots: Array<{ index: number; name: string; isLoaded: boolean }>;
}

interface DefaultSound {
  name: string;
  audioUrl: string;
  category?: string;
}

const SoundLibraryPopover: React.FC<SoundLibraryPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  onSelectSound,
  availableSlots,
}) => {
  const [defaultSounds, setDefaultSounds] = useState<DefaultSound[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSound, setSelectedSound] = useState<DefaultSound | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(
    null
  );

  // Fetch default sounds when popover opens
  useEffect(() => {
    if (open) {
      fetchDefaultSounds();
    }
  }, [open]);

  // Cleanup preview audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
      }
    };
  }, [previewAudio]);

  const fetchDefaultSounds = async () => {
    setIsLoading(true);
    try {
      // Get default sounds from Firebase
      const defaultFiles = await getDefaultSoundFiles();

      // Map to DefaultSound format
      const sounds: DefaultSound[] = defaultFiles.map((file) => ({
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        audioUrl: file.audioUrl,
        category: getSoundCategory(file.name),
      }));

      setDefaultSounds(sounds);
    } catch (error) {
      console.error('Error fetching default sounds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSoundCategory = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    if (
      lowerName.includes('laugh') ||
      lowerName.includes('bomboclat') ||
      lowerName.includes('applause') ||
      lowerName.includes('booing') ||
      lowerName.includes('build-a-wall') ||
      lowerName.includes('here-we-go-again') ||
      lowerName.includes('get-out') ||
      lowerName.includes('fbi-open-up') ||
      lowerName.includes('china') ||
      lowerName.includes('bruh')
    ) {
      return 'Reactions';
    } else if (lowerName.includes('sad')) {
      return 'Music';
    } else if (
      lowerName.includes('ding') ||
      lowerName.includes('bell') ||
      lowerName.includes('android notification')
    ) {
      return 'Notification';
    } else {
      return 'Effects';
    }
  };

  const handleSoundSelect = (sound: DefaultSound) => {
    setSelectedSound(sound);
  };

  const handleSlotSelect = (slotIndex: number) => {
    if (selectedSound) {
      onSelectSound(selectedSound, slotIndex);
      //   onClose();
      setSelectedSound(null);
    }
  };

  const handlePreviewSound = (audioUrl: string) => {
    // Stop any currently playing preview
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.src = '';
    }

    // Create new audio element for preview
    const audio = new Audio(audioUrl);
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch((error) => {
      console.error('Error playing preview:', error);
    });
    setPreviewAudio(audio);
  };

  const handleClose = () => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.src = '';
      setPreviewAudio(null);
    }
    setSelectedSound(null);
    onClose();
  };

  // Group sounds by category
  const groupedSounds = defaultSounds.reduce((acc, sound) => {
    const category = sound.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(sound);
    return acc;
  }, {} as Record<string, DefaultSound[]>);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 600,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#60a5fa',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <MusicNote /> Sound Library
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress sx={{ color: '#60a5fa' }} />
          </Box>
        ) : defaultSounds.length === 0 ? (
          <Typography
            sx={{ color: 'text.secondary', textAlign: 'center', p: 2 }}
          >
            No default sounds available
          </Typography>
        ) : (
          <>
            {/* Available Slots */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#60a5fa', mb: 1 }}>
                Available Slots:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableSlots.map((slot) => (
                  <Chip
                    key={slot.index}
                    label={`Slot ${slot.index + 1}: ${slot.name}`}
                    variant={slot.isLoaded ? 'filled' : 'outlined'}
                    color={slot.isLoaded ? 'primary' : 'default'}
                    size="small"
                    onClick={() =>
                      selectedSound && handleSlotSelect(slot.index)
                    }
                    disabled={!selectedSound}
                    sx={{
                      cursor: selectedSound ? 'pointer' : 'default',
                      '&:hover': selectedSound
                        ? {
                            backgroundColor: 'rgba(96, 165, 250, 0.1)',
                          }
                        : {},
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(96, 165, 250, 0.2)' }} />

            {/* Sound Selection */}
            {selectedSound && (
              <Alert severity="warning" sx={{ width: '100%', mb: 2, p: 2 }}>
                Click a slot above to assign this sound
              </Alert>
            )}

            {/* Sound Categories */}
            <Typography variant="subtitle2" sx={{ color: '#60a5fa', mb: 1 }}>
              Select a Sound:
            </Typography>

            {Object.entries(groupedSounds).map(([category, sounds]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                >
                  {category}
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {sounds.map((sound, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      sx={{
                        mb: 0.5,
                        borderRadius: 1,
                        bgcolor:
                          selectedSound?.name === sound.name
                            ? 'rgba(96, 165, 250, 0.2)'
                            : 'transparent',
                        border:
                          selectedSound?.name === sound.name
                            ? '1px solid rgba(96, 165, 250, 0.5)'
                            : '1px solid transparent',
                      }}
                    >
                      <ListItemButton
                        onClick={() => handleSoundSelect(sound)}
                        sx={{
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'rgba(96, 165, 250, 0.1)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {selectedSound?.name === sound.name ? (
                            <CheckCircle sx={{ color: '#60a5fa' }} />
                          ) : (
                            <MusicNote sx={{ color: 'text.secondary' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={sound.name}
                          primaryTypographyProps={{
                            sx: {
                              color:
                                selectedSound?.name === sound.name
                                  ? '#60a5fa'
                                  : 'text.primary',
                              fontWeight:
                                selectedSound?.name === sound.name ? 600 : 400,
                            },
                          }}
                        />
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewSound(sound.audioUrl);
                            }}
                            sx={{ color: 'text.secondary' }}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </>
        )}
      </Box>
    </Popover>
  );
};

export default SoundLibraryPopover;

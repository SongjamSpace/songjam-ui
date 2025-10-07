import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  IconButton,
  Tooltip,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from '@mui/material';
import { PlayArrow, MusicNote } from '@mui/icons-material';
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
  soundSlots: Array<{
    name: string;
    audioUrl: string;
    isLoaded: boolean;
  }>;
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
  soundSlots,
}) => {
  const [defaultSounds, setDefaultSounds] = useState<DefaultSound[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(
    null
  );

  // Derive selectedSounds from soundSlots
  const selectedSounds = React.useMemo(() => {
    const map = new Map<string, number>();
    soundSlots.forEach((slot, index) => {
      if (slot.isLoaded && slot.audioUrl && slot.name !== 'Empty') {
        map.set(slot.name, index);
      }
    });
    return map;
  }, [soundSlots]);

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

  const handleCheckboxChange = (sound: DefaultSound, checked: boolean) => {
    if (checked) {
      // Find next available slot
      const nextSlot = getNextAvailableSlot();
      if (nextSlot !== null) {
        onSelectSound(sound, nextSlot);
      }
    } else {
      // To uncheck, we need to clear that slot by sending an empty sound
      const slotIndex = selectedSounds.get(sound.name);
      if (slotIndex !== undefined) {
        onSelectSound({ name: 'Empty', audioUrl: '' }, slotIndex);
      }
    }
  };

  const handleSlotChange = (sound: DefaultSound, slotIndex: number) => {
    onSelectSound(sound, slotIndex);
  };

  const getNextAvailableSlot = (): number | null => {
    const usedSlots = new Set(selectedSounds.values());
    for (let i = 0; i < availableSlots.length; i++) {
      if (!usedSlots.has(i)) {
        return i;
      }
    }
    return availableSlots.length > 0 ? 0 : null;
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
            {Object.entries(groupedSounds).map(([category, sounds]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                >
                  {category}
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {sounds.map((sound, index) => {
                    const isSelected = selectedSounds.has(sound.name);
                    const selectedSlot = selectedSounds.get(sound.name) ?? 0;

                    return (
                      <ListItem
                        key={index}
                        disablePadding
                        sx={{
                          mb: 0.5,
                          borderRadius: 1,
                          bgcolor: isSelected
                            ? 'rgba(96, 165, 250, 0.1)'
                            : 'transparent',
                          border: '1px solid transparent',
                          '&:hover': {
                            bgcolor: 'rgba(96, 165, 250, 0.05)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          {/* Checkbox */}
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) =>
                              handleCheckboxChange(sound, e.target.checked)
                            }
                            sx={{
                              color: 'text.secondary',
                              '&.Mui-checked': {
                                color: '#60a5fa',
                              },
                            }}
                          />

                          {/* Sound Name */}
                          <ListItemText
                            primary={sound.name}
                            primaryTypographyProps={{
                              sx: {
                                color: isSelected ? '#60a5fa' : 'text.primary',
                                fontWeight: isSelected ? 600 : 400,
                                fontSize: '0.875rem',
                              },
                            }}
                            sx={{ flex: 1, mr: 1 }}
                          />

                          {/* Slot Dropdown */}
                          {isSelected && (
                            <Chip
                              label={`Slot: ${selectedSlot}`}
                              variant="outlined"
                            />
                          )}

                          {/* Preview Button */}
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
                        </Box>
                      </ListItem>
                    );
                  })}
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

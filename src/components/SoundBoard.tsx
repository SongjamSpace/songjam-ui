import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Tooltip,
  Fade,
  Zoom,
  keyframes,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  PlayArrow,
  LibraryMusic,
  Refresh,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Socket } from 'socket.io-client';
import {
  uploadMusic,
  getMusicUploadsByUserId,
} from '../services/storage/musicAgent.storage';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(96, 165, 250, 0.5); }
  50% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.8); }
  100% { box-shadow: 0 0 5px rgba(96, 165, 250, 0.5); }
`;

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

interface SoundSlot {
  name: string;
  audioUrl: string;
  isPlaying: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  error?: string;
}

interface SoundBoardProps {
  onSoundPlay?: (audioUrl: string) => void;
  onSoundStop?: () => void;
  socket?: Socket | null;
  isConnected?: boolean;
  isInSpace?: boolean;
  userId?: string;
  onLog?: (message: string, type: 'info' | 'success' | 'error') => void;
  soundboardFiles?: { name: string; audioUrl: string }[];
  onFilesUpdated?: () => void;
}

const defaultSoundNames = [
  'Laugh Track',
  'Drum Roll',
  'Applause',
  'Boo',
  'Whistle',
  'Ding',
];

const SoundBoard: React.FC<SoundBoardProps> = ({
  onSoundPlay,
  onSoundStop,
  socket,
  isConnected = false,
  isInSpace = false,
  userId,
  onLog,
  soundboardFiles = [],
  onFilesUpdated,
}) => {
  const { t } = useTranslation();
  const [soundSlots, setSoundSlots] = useState<SoundSlot[]>(
    Array.from({ length: 6 }, (_, index) => ({
      name: defaultSoundNames[index] || `Sound ${index + 1}`,
      audioUrl: '',
      isPlaying: false,
      isLoading: false,
      isLoaded: false,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userSoundboardFiles, setUserSoundboardFiles] = useState<
    { name: string; audioUrl: string }[]
  >([]);

  const [selectedSlotForUpload, setSelectedSlotForUpload] = useState<
    number | null
  >(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localAudioRefs = useRef<{ [key: number]: HTMLAudioElement }>({});

  // Load user soundboard configuration and files
  useEffect(() => {
    if (userId) {
      loadUserSoundboardFiles();
    }
  }, [userId]);

  // Populate slots with available files
  useEffect(() => {
    const populateSlots = async () => {
      if (!userId) return;

      try {
        // Get default slot files
        const defaultSlotFiles = await loadDefaultSlotFiles();

        // Create a map of slot files (user files + default files)
        const slotFileMap = new Map<
          string,
          { name: string; audioUrl: string }
        >();

        // Add user's slot files first (they take priority)
        soundboardFiles.forEach((file) => {
          const slotMatch = file.name.match(/^slot_(\d+)_(.+)$/);
          if (slotMatch) {
            const slotIndex = slotMatch[1];
            const originalName = slotMatch[2].replace(/\.[^/.]+$/, ''); // Remove extension
            slotFileMap.set(slotIndex, {
              name: originalName,
              audioUrl: file.audioUrl,
            });
          }
        });

        // Fill remaining slots with default files
        defaultSlotFiles.forEach((file) => {
          const slotMatch = file.name.match(/^slot_(\d+)_(.+)$/);
          if (slotMatch && !slotFileMap.has(slotMatch[1])) {
            const slotIndex = slotMatch[1];
            const originalName = slotMatch[2].replace(/\.[^/.]+$/, ''); // Remove extension
            slotFileMap.set(slotIndex, {
              name: originalName,
              audioUrl: file.audioUrl,
            });
          }
        });

        // Update slots with available files
        setSoundSlots((prev) =>
          prev.map((slot, index) => {
            const slotFile = slotFileMap.get(index.toString());
            if (slotFile && !slot.audioUrl) {
              return {
                ...slot,
                name: slotFile.name,
                audioUrl: slotFile.audioUrl,
                isLoaded: true,
              };
            }
            return slot;
          })
        );
      } catch (error) {
        console.error('Error populating slots:', error);
      }
    };

    populateSlots();
  }, [userId, soundboardFiles]);

  //   // Load sounds when connected and in space
  //   useEffect(() => {
  //     if (socket && isConnected && isInSpace) {
  //       loadSoundboard();
  //     }
  //   }, [socket, isConnected, isInSpace]);

  // Cleanup local audio on unmount
  useEffect(() => {
    return () => {
      Object.values(localAudioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // Handle local audio ended events
  useEffect(() => {
    const handleAudioEnded = (slotIndex: number) => {
      setSoundSlots((prev) =>
        prev.map((slot, index) =>
          index === slotIndex ? { ...slot, isPlaying: false } : slot
        )
      );
      onSoundStop?.();
    };

    // Add ended event listeners to all local audio elements
    Object.keys(localAudioRefs.current).forEach((slotIndexStr) => {
      const slotIndex = parseInt(slotIndexStr);
      const audio = localAudioRefs.current[slotIndex];
      if (audio) {
        audio.addEventListener('ended', () => handleAudioEnded(slotIndex));
      }
    });

    return () => {
      Object.keys(localAudioRefs.current).forEach((slotIndexStr) => {
        const slotIndex = parseInt(slotIndexStr);
        const audio = localAudioRefs.current[slotIndex];
        if (audio) {
          audio.removeEventListener('ended', () => handleAudioEnded(slotIndex));
        }
      });
    };
  }, [onSoundStop]);

  // Set up WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleSoundboardLoaded = (data: {
      success: boolean;
      message?: string;
    }) => {
      setIsLoading(false);
      if (data.success) {
        setSuccessMessage('Soundboard loaded successfully');
        // Request current status
        socket.emit('get-soundboard-status');
      } else {
        setError(data.message || 'Failed to load soundboard');
      }
    };

    const handleSoundPlayed = (data: {
      success: boolean;
      slotIndex: number;
      message?: string;
    }) => {
      if (data.success) {
        setSoundSlots((prev) =>
          prev.map((slot, index) =>
            index === data.slotIndex
              ? { ...slot, isPlaying: true }
              : { ...slot, isPlaying: false }
          )
        );
        onSoundPlay?.(soundSlots[data.slotIndex]?.audioUrl || '');
      } else {
        setError(
          data.message || `Failed to play sound at slot ${data.slotIndex + 1}`
        );
      }
    };

    const handleSoundboardStatus = (data: {
      slots: Array<{
        index: number;
        name: string;
        audioUrl: string;
        isLoaded: boolean;
        isLoading: boolean;
        error?: string;
      }>;
    }) => {
      setSoundSlots((prev) =>
        prev.map((slot, index) => {
          const statusSlot = data.slots.find((s) => s.index === index);
          if (statusSlot) {
            return {
              ...slot,
              name: statusSlot.name,
              audioUrl: statusSlot.audioUrl,
              isLoaded: statusSlot.isLoaded,
              isLoading: statusSlot.isLoading,
              error: statusSlot.error,
            };
          }
          return slot;
        })
      );
    };

    const handleError = (data: { message: string }) => {
      setError(data.message);
      setIsLoading(false);
    };

    // Add event listeners
    socket.on('soundboard-loaded', handleSoundboardLoaded);
    socket.on('sound-played', handleSoundPlayed);
    socket.on('soundboard-status', handleSoundboardStatus);
    socket.on('error', handleError);

    // Cleanup
    return () => {
      socket.off('soundboard-loaded', handleSoundboardLoaded);
      socket.off('sound-played', handleSoundPlayed);
      socket.off('soundboard-status', handleSoundboardStatus);
      socket.off('error', handleError);
    };
  }, [socket, soundSlots, onSoundPlay]);

  const loadSoundboard = () => {
    if (!socket || !isConnected || !isInSpace) {
      setError('Not connected to space');
      return;
    }

    setIsLoading(true);
    setError(null);
    socket.emit('load-soundboard');
  };

  const handleRefreshSoundboard = () => {
    loadSoundboard();
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  //   const loadUserSoundboardConfig = async () => {
  //     if (!userId) return;
  //     try {
  //       const config = await getSoundboardConfig(userId);
  //       if (config?.slots) {
  //         setSoundSlots((prev) =>
  //           prev.map((slot, index) => {
  //             const configSlot = config.slots.find((s) => s.id === index);
  //             if (configSlot) {
  //               return {
  //                 ...slot,
  //                 name: configSlot.name,
  //                 audioUrl: configSlot.audioUrl,
  //                 isLoaded: !!configSlot.audioUrl,
  //               };
  //             }
  //             return slot;
  //           })
  //         );
  //       }
  //     } catch (error) {
  //       console.error('Error loading soundboard config:', error);
  //     }
  //   };

  const loadUserSoundboardFiles = async () => {
    if (!userId) return;
    try {
      const files = await getMusicUploadsByUserId(userId);
      setUserSoundboardFiles(files);
    } catch (error) {
      console.error('Error loading soundboard files:', error);
    }
  };

  const loadDefaultSlotFiles = async () => {
    try {
      // Get default slot files from Firebase (slot_0, slot_1, etc.)
      const defaultFiles = await getMusicUploadsByUserId('default');
      const slotFiles = defaultFiles.filter((file) =>
        /^slot_\d+/.test(file.name)
      );
      return slotFiles;
    } catch (error) {
      console.error('Error loading default slot files:', error);
      return [];
    }
  };

  const saveSoundboardConfig = async () => {
    if (!userId) return;
    try {
      const config = {
        slots: soundSlots.map((slot, index) => ({
          id: index,
          name: slot.name,
          audioUrl: slot.audioUrl,
        })),
      };
      //   await updateSoundboardConfig(userId, config);
      onLog?.('Soundboard configuration saved', 'success');
    } catch (error) {
      console.error('Error saving soundboard config:', error);
      onLog?.('Failed to save soundboard configuration', 'error');
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !userId || selectedSlotForUpload === null) return;

    // Check file size (max 50MB for sound effects)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file');
      return;
    }

    setUploadingFile(true);
    try {
      // Create a new file with slot_{index} prefix
      const slotPrefix = `slot_${selectedSlotForUpload}_`;
      const originalName = file.name;
      const newFileName = slotPrefix + originalName;

      // Create a new File object with the modified name
      const renamedFile = new File([file], newFileName, { type: file.type });

      const audioUrl = await uploadMusic(renamedFile, userId);

      // Update the selected slot
      setSoundSlots((prev) =>
        prev.map((slot, index) =>
          index === selectedSlotForUpload
            ? {
                ...slot,
                name: originalName.replace(/\.[^/.]+$/, ''), // Remove file extension, keep original name
                audioUrl,
                isLoaded: true,
              }
            : slot
        )
      );

      // Save configuration
      await saveSoundboardConfig();

      setSuccessMessage(`Sound uploaded to slot ${selectedSlotForUpload + 1}`);
      onLog?.(`Sound uploaded: ${file.name}`, 'success');

      // Trigger parent to refresh files
      onFilesUpdated?.();

      setSelectedSlotForUpload(null);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
      onLog?.('Failed to upload sound file', 'error');
      // Clear the file input and reset selected slot on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedSlotForUpload(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePlaySound = (slotIndex: number) => {
    const slot = soundSlots[slotIndex];
    if (!slot.isLoaded) {
      setError(`Sound at slot ${slotIndex + 1} is not loaded`);
      return;
    }
    // Play the sound
    if (isConnected && isInSpace && socket) {
      // Play via socket
      socket.emit('play-sound', { index: slotIndex });
    } else {
      // Play locally
      if (!localAudioRefs.current[slotIndex]) {
        localAudioRefs.current[slotIndex] = new Audio(slot.audioUrl);
      }

      localAudioRefs.current[slotIndex].play().catch((error) => {
        console.error('Error playing audio:', error);
        setError('Failed to play sound');
      });
    }

    setSoundSlots((prev) =>
      prev.map((s, index) =>
        index === slotIndex ? { ...s, isPlaying: true } : s
      )
    );
    onSoundPlay?.(slot.audioUrl);
  };

  const handleSlotUpload = (slotIndex: number) => {
    setSelectedSlotForUpload(slotIndex);
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
          }}
        >
          <LibraryMusic /> Sound Board
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Connection Status */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isConnected && isInSpace ? '#4caf50' : '#f44336',
              animation:
                isConnected && isInSpace ? `${pulse} 2s infinite` : 'none',
            }}
          />

          {/* Refresh Button */}
          <Tooltip title="Refresh soundboard">
            <IconButton
              onClick={handleRefreshSoundboard}
              disabled={!isConnected || !isInSpace || isLoading}
              sx={{
                color: '#60a5fa',
                '&:hover': { transform: 'scale(1.1)' },
                transition: 'transform 0.2s',
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper
        sx={{
          p: 3,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 2,
          border: '1px solid rgba(96, 165, 250, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            mb: 2,
          }}
        >
          {soundSlots.map((slot, index) => (
            <Zoom in key={index}>
              <Paper
                elevation={slot.isPlaying ? 8 : 4}
                sx={{
                  aspectRatio: '1',
                  position: 'relative',
                  background: slot.isPlaying
                    ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(139, 92, 246, 0.3))'
                    : slot.isLoaded
                    ? 'rgba(15, 23, 42, 0.8)'
                    : 'rgba(15, 23, 42, 0.4)',
                  border: slot.isPlaying
                    ? '2px solid #60a5fa'
                    : slot.isLoaded
                    ? '1px solid rgba(96, 165, 250, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  cursor: slot.isLoaded ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  animation: slot.isPlaying ? `${glow} 1s infinite` : 'none',
                  '&:hover': slot.isLoaded
                    ? {
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 25px rgba(96, 165, 250, 0.3)',
                        borderColor: '#60a5fa',
                      }
                    : {},
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: slot.isPlaying
                      ? 'radial-gradient(circle at center, rgba(96, 165, 250, 0.2) 0%, transparent 70%)'
                      : 'none',
                    pointerEvents: 'none',
                  },
                }}
              >
                {/* Sound Slot Content */}
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    position: 'relative',
                  }}
                >
                  {/* Loading State */}
                  {slot.isLoading && (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: '#60a5fa',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}

                  {/* Error State */}
                  {slot.error && (
                    <Tooltip title={slot.error}>
                      <Error
                        sx={{
                          color: '#f44336',
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontSize: '1rem',
                        }}
                      />
                    </Tooltip>
                  )}

                  {/* Loaded State */}
                  {slot.isLoaded && !slot.isLoading && (
                    <CheckCircle
                      sx={{
                        color: '#4caf50',
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontSize: '1rem',
                      }}
                    />
                  )}

                  {/* Play/Stop Button */}
                  <IconButton
                    onClick={() => handlePlaySound(index)}
                    disabled={!slot.isLoaded || slot.isLoading}
                    sx={{
                      color: slot.isPlaying
                        ? '#4caf50'
                        : slot.isLoaded
                        ? '#60a5fa'
                        : 'rgba(255, 255, 255, 0.3)',
                      fontSize: '2rem',
                      mb: 1,
                      '&:hover': slot.isLoaded
                        ? {
                            transform: 'scale(1.1)',
                            color: slot.isPlaying ? '#45a049' : '#3b82f6',
                          }
                        : {},
                      transition: 'all 0.2s',
                      animation: slot.isPlaying
                        ? `${pulse} 1s infinite`
                        : 'none',
                    }}
                  >
                    <PlayArrow />
                  </IconButton>

                  {/* Upload Button */}
                  {userId && (
                    <Tooltip title="Upload sound file">
                      <IconButton
                        onClick={() => handleSlotUpload(index)}
                        disabled={isConnected || isInSpace}
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '1rem',
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          '&:hover': {
                            color: '#60a5fa',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <CloudUpload />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Sound Name */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: slot.isLoaded
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.5)',
                      textAlign: 'center',
                      fontWeight: 'medium',
                      textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {slot.name}
                  </Typography>
                </Box>
              </Paper>
            </Zoom>
          ))}
        </Box>

        {/* Instructions */}
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            fontStyle: 'italic',
            fontSize: '0.8rem',
          }}
        >
          {userId
            ? 'Click to play • Upload custom sounds • Works locally or in spaces'
            : isConnected && isInSpace
            ? 'Click to play • Use for live reactions'
            : 'Connect to a space to use the soundboard'}
        </Typography>
      </Paper>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: 2,
          }}
        >
          <CircularProgress sx={{ color: '#60a5fa' }} />
        </Box>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Hidden file input */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="audio/*"
        onChange={handleFileUpload}
      />
    </Box>
  );
};

export default SoundBoard;

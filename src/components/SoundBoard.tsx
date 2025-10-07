import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Zoom,
  keyframes,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  Grid,
} from '@mui/material';
import {
  CloudUpload,
  PlayArrow,
  LibraryMusic,
  Error,
  Delete,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Socket } from 'socket.io-client';
import {
  uploadMusic,
  getMusicUploadsByUserId,
  deleteMusicUpload,
} from '../services/storage/musicAgent.storage';
import SoundLibraryPopover from './SoundLibraryPopover';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';

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

export interface SoundSlot {
  name: string;
  audioUrl: string;
  isPlaying: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  error?: string;
  fullName: string;
}

interface SoundBoardProps {
  onSoundPlay: (slotIndex: number) => void;
  socket?: Socket | null;
  canPlay: boolean;
  userId?: string;
  onLog?: (message: string, type: 'info' | 'success' | 'error') => void;
  onFilesUpdated?: () => void;
  soundSlots: SoundSlot[];
  setSoundSlots: React.Dispatch<React.SetStateAction<SoundSlot[]>>;
}

const SoundBoard: React.FC<SoundBoardProps> = ({
  onSoundPlay,
  socket,
  canPlay,
  userId,
  onLog,
  onFilesUpdated,
  soundSlots,
  setSoundSlots,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlotForUpload, setSelectedSlotForUpload] = useState<
    number | null
  >(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localAudioRefs = useRef<{ [key: number]: HTMLAudioElement }>({});

  // Library popover state
  const [libraryAnchorEl, setLibraryAnchorEl] = useState<HTMLElement | null>(
    null
  );

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

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {};

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

    // Check file size (max 500KB for sound effects)
    if (file.size > 500 * 1024) {
      setError('File size must be less than 500KB');
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
                fullName: originalName,
              }
            : slot
        )
      );

      // Save configuration
      await saveSoundboardConfig();

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
    if (canPlay) {
      onSoundPlay?.(slotIndex);
    }
  };

  const handleSlotUpload = (slotIndex: number) => {
    setSelectedSlotForUpload(slotIndex);
    fileInputRef.current?.click();
  };

  const handleDeleteSlot = async (slotIndex: number) => {
    if (!userId) return;

    try {
      // // Update the slot to be empty
      // setSoundSlots((prev) =>
      //   prev.map((slot, index) =>
      //     index === slotIndex
      //       ? {
      //           ...slot,
      //           name: 'Empty',
      //           audioUrl: '',
      //           isLoaded: false,
      //           isPlaying: false,
      //         }
      //       : slot
      //   )
      // );

      // // Save configuration
      // await saveSoundboardConfig();

      // setSuccessMessage(`Sound removed from slot ${slotIndex + 1}`);
      // onLog?.(`Sound removed from slot ${slotIndex + 1}`, 'success');
      if (soundSlots[slotIndex].fullName) {
        deleteMusicUpload(soundSlots[slotIndex].fullName, userId);
        //  remove slot from soundSlots
        setSoundSlots((prev) =>
          prev.map((slot, index) =>
            index === slotIndex
              ? { ...slot, name: 'Empty', audioUrl: '', isLoaded: false }
              : slot
          )
        );
      }

      // Trigger parent to refresh files
      onFilesUpdated?.();
    } catch (error) {
      console.error('Error deleting slot:', error);
      setError('Failed to remove sound from slot');
      onLog?.('Failed to remove sound from slot', 'error');
    }
  };

  // Library popover handlers
  const handleLibraryClick = (event: React.MouseEvent<HTMLElement>) => {
    setLibraryAnchorEl(event.currentTarget);
  };

  const handleLibraryClose = () => {
    setLibraryAnchorEl(null);
  };

  const handleLibrarySoundSelect = async (
    sound: { name: string; audioUrl: string },
    slotIndex: number
  ) => {
    if (!userId) return;

    try {
      // Create a new file with slot_{index} prefix
      const slotPrefix = `slot_${slotIndex}_`;
      const originalName = sound.name;
      // const newFileName = slotPrefix + originalName + '.mp3'; // Add extension

      // Update the selected slot
      setSoundSlots((prev) =>
        prev.map((slot, index) =>
          index === slotIndex
            ? {
                ...slot,
                name: originalName,
                audioUrl: sound.audioUrl,
                isLoaded: true,
                fullName: originalName,
              }
            : slot
        )
      );

      // Save configuration
      await saveSoundboardConfig();

      onLog?.(
        `Sound assigned: ${originalName} to slot ${slotIndex + 1}`,
        'success'
      );

      // // Trigger parent to refresh files
      // onFilesUpdated?.();
    } catch (error) {
      console.error('Error assigning sound:', error);
      setError('Failed to assign sound to slot');
      onLog?.('Failed to assign sound to slot', 'error');
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'row' },
          gap: { xs: 1, sm: 0 },
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
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          <LibraryMusic /> Sound Board
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            alignSelf: { xs: 'center', sm: 'flex-end' },
          }}
        >
          <Button
            onClick={handleLibraryClick}
            disabled={canPlay}
            startIcon={<QueueMusicRoundedIcon fontSize="small" />}
            size={isMobile ? 'small' : 'medium'}
          >
            Library
          </Button>
          {/* Refresh Button */}
          {/* <Tooltip title="Refresh soundboard">
            <IconButton
              onClick={handleRefreshSoundboard}
              disabled={isLoading}
              sx={{
                color: '#60a5fa',
                '&:hover': { transform: 'scale(1.1)' },
                transition: 'transform 0.2s',
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip> */}
        </Box>
      </Box>

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
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
            gridTemplateColumns: {
              xs: 'repeat(5, 1fr)',
            },
            gap: { xs: 1, sm: 1.5, md: 2 },
            mb: { xs: 1.5, sm: 2 },
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {soundSlots.map((slot, index) => (
            <Zoom in key={index}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Paper
                  elevation={slot.isPlaying ? 8 : 4}
                  sx={{
                    aspectRatio: '1',
                    position: 'relative',
                    width: '100%',
                    background: slot.isPlaying
                      ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(139, 92, 246, 0.3))'
                      : slot.isLoaded
                      ? 'rgba(15, 23, 42, 0.8)'
                      : 'rgba(15, 23, 42, 0.4)',
                    border: slot.isPlaying
                      ? '2px solid #60a5fa'
                      : slot.isLoaded
                      ? '2px solid #4caf50'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
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
                      p: { xs: 0.5, sm: 1 },
                      position: 'relative',
                    }}
                  >
                    {/* Loading State */}
                    {(slot.isLoading ||
                      (uploadingFile && selectedSlotForUpload === index)) && (
                      <CircularProgress
                        size={isMobile ? 16 : 20}
                        sx={{
                          color: '#60a5fa',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 2,
                        }}
                      />
                    )}

                    {/* Status Icons - Top Right */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: { xs: 2, sm: 4 },
                        right: { xs: 2, sm: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        zIndex: 3,
                      }}
                    >
                      {/* Error State */}
                      {slot.error && (
                        <Tooltip title={slot.error}>
                          <Error
                            sx={{
                              color: '#f44336',
                              fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>

                    {/* Action Buttons - Side by Side */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.5, sm: 1 },
                        justifyContent: 'center',
                        mb: { xs: 0.25, sm: 0.5 },
                      }}
                    >
                      {/* Upload/Delete Button */}
                      {userId && (
                        <Tooltip
                          title={
                            slot.isLoaded ? 'Remove sound' : 'Upload sound file'
                          }
                        >
                          <IconButton
                            onClick={() =>
                              slot.isLoaded
                                ? handleDeleteSlot(index)
                                : handleSlotUpload(index)
                            }
                            disabled={
                              !slot.isLoaded &&
                              (canPlay ||
                                uploadingFile ||
                                index !==
                                  soundSlots.findIndex((s) => !s.isLoaded))
                            }
                            size={isMobile ? 'small' : 'small'}
                            sx={{
                              color: slot.isLoaded
                                ? 'rgba(255, 107, 107, 0.8)'
                                : 'rgba(255, 255, 255, 0.6)',
                              fontSize: { xs: '0.6rem', sm: '0.75rem' },
                              padding: { xs: 0.25, sm: 0.5 },
                              minWidth: 'auto',
                              '&:hover': {
                                color: slot.isLoaded ? '#ff6b6b' : '#60a5fa',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s',
                            }}
                          >
                            {slot.isLoaded ? (
                              <Delete fontSize={isMobile ? 'small' : 'small'} />
                            ) : (
                              <CloudUpload
                                fontSize={isMobile ? 'small' : 'small'}
                              />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Play/Stop Button */}
                      <IconButton
                        onClick={() => handlePlaySound(index)}
                        disabled={
                          !slot.isLoaded ||
                          slot.isLoading ||
                          !canPlay ||
                          (uploadingFile && selectedSlotForUpload === index)
                        }
                        sx={{
                          color: slot.isPlaying
                            ? '#4caf50'
                            : slot.isLoaded
                            ? '#60a5fa'
                            : 'rgba(255, 255, 255, 0.3)',
                          fontSize: { xs: '1.2rem', sm: '1.5rem' },
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
                        <PlayArrow fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>

                {/* Sound Name Below Slot */}
                <Typography
                  variant="body2"
                  sx={{
                    color: slot.isLoaded ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    textAlign: 'center',
                    fontWeight: 'medium',
                    textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
                    fontSize: { xs: '0.6rem', sm: '0.75rem' },
                    lineHeight: 1.2,
                    mt: { xs: 0.5, sm: 1 },
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
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
          }}
        >
          {userId
            ? 'Click to play • Upload custom sounds'
            : 'Click to play • Use for live reactions'}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
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

      {/* Sound Library Popover */}
      <SoundLibraryPopover
        open={Boolean(libraryAnchorEl)}
        anchorEl={libraryAnchorEl}
        onClose={handleLibraryClose}
        onSelectSound={handleLibrarySoundSelect}
        availableSlots={soundSlots.map((slot, index) => ({
          index,
          name: slot.name,
          isLoaded: slot.isLoaded,
        }))}
        soundSlots={soundSlots.map((slot) => ({
          name: slot.name,
          audioUrl: slot.audioUrl,
          isLoaded: slot.isLoaded,
        }))}
      />
    </Box>
  );
};

export default SoundBoard;

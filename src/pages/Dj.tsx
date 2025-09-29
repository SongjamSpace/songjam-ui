import React, { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  // ListItemButton,
  // Radio,
  IconButton,
  Tooltip,
  Fade,
  // Zoom,
  // useTheme,
  keyframes,
  Slider,
  // Skeleton,
  // Alert,
  // Dialog,
  useMediaQuery,
  useTheme,
  Grid,
  Dialog,
  Alert,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  MusicNote,
  VolumeUp,
  GraphicEq,
  FiberManualRecord,
  LogoutRounded,
} from '@mui/icons-material';
import EmojiReactions from '../components/EmojiReactions';
import SoundBoard, { SoundSlot } from '../components/SoundBoard';
import MusicLibrary from '../components/MusicLibrary';
import {
  deleteMusicUpload,
  getUploadedAudioPaths,
  uploadMusic,
} from '../services/storage/musicAgent.storage';
// import { uploadAndNormalizeMusic } from '../services/musicAgentUpload.service';
import { useAuthContext } from '../contexts/AuthContext';
import {
  DynamicEmbeddedWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import {
  DjLurkySpace,
  djLurkyDocSnapshot,
  sendDjRequest,
} from '../services/db/djLurkySpaces';
import { RequestType } from '../services/db/djLurkySpaces';
import { LoadingButton } from '@mui/lab';
// import {
//   DynamicEmbeddedWidget,
//   useDynamicContext,
// } from '@dynamic-labs/sdk-react-core';
// import {
//   getSangStakingStatus,
//   StakingInfo,
// } from '../services/blockchain.service';

// Advanced animations
// const pulse = keyframes`
//   0% { transform: scale(1); opacity: 1; }
//   50% { transform: scale(1.05); opacity: 0.8; }
//   100% { transform: scale(1); opacity: 1; }
// `;

const wave = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(96, 165, 250, 0.5); }
  50% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.8); }
  100% { box-shadow: 0 0 5px rgba(96, 165, 250, 0.5); }
`;

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const Dj = () => {
  // const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, loading: authLoading } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [spaceId, setSpaceId] = useState('');
  const [musicStarted, setMusicStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<
    Array<{
      timestamp: string;
      message: string;
      type: 'info' | 'success' | 'error';
    }>
  >([]);
  const [audioUploads, setAudioUploads] = useState<
    {
      name: string;
      audioFullPath: string;
    }[]
  >([]);
  const [soundboardFiles, setSoundboardFiles] = useState<
    {
      name: string;
      audioUrl: string;
      audioFullPath: string;
    }[]
  >([]);
  const [audioFullPath, setAudioFullPath] = useState('');
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState('🎧');
  const [volume, setVolume] = useState(1);
  const [soundSlots, setSoundSlots] = useState<SoundSlot[]>(
    Array.from({ length: 10 }, (_, index) => ({
      name: 'Empty',
      audioUrl: '',
      isPlaying: false,
      isLoading: false,
      isLoaded: false,
      fullName: '',
    }))
  );
  const { handleLogOut } = useDynamicContext();
  const [spaceDoc, setSpaceDoc] = useState<DjLurkySpace | null>(null);

  // Check if current user is an admin
  const isCurrentUserAdmin = () => {
    if (!user || !spaceDoc?.admins) return false;
    return spaceDoc.admins.some((admin) => admin.userId === user.uid);
  };

  // Show login dialog if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else {
      setShowAuthDialog(false);
    }
  }, [user, authLoading]);

  // Fetch user uploads on mount or when user changes
  useEffect(() => {
    if (user) {
      // connectSocket();
      fetchUserUploads();
    }
    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.disconnect();
    //   }
    // };
  }, [user]);

  const fetchUserUploads = async () => {
    if (!user) return;
    setIsLibraryLoading(true);
    const uploads = await getUploadedAudioPaths(user.uid);

    // Filter out slot files for soundboard
    const slotFiles = uploads.filter((file) => file.name.startsWith('slot_'));
    const musicFiles = uploads.filter((file) => !file.name.startsWith('slot_'));

    setAudioUploads(musicFiles);
    setAudioFullPath(musicFiles[0]?.audioFullPath);
    setSoundboardFiles(
      slotFiles.map((file) => ({
        name: file.name,
        audioFullPath: file.audioFullPath,
        audioUrl: `https://firebasestorage.googleapis.com/v0/b/lustrous-stack-453106-f6.firebasestorage.app/o/${encodeURIComponent(
          file.audioFullPath
        )}?alt=media`,
      }))
    );
    setIsLibraryLoading(false);
  };

  const addLog = (
    message: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handlePlayMusic = async () => {
    if (!audioFullPath) return;

    setIsLoading(true);
    addLog('Requesting to play music...', 'info');

    await sendDjRequest(spaceId, RequestType.PLAY_MUSIC, {
      audioFullPath,
    });
    setIsLoading(false);
  };

  // Upload handler
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Accept only less than 20mb files
    const file = event.target.files?.[0];
    if (file && file.size > 150 * 1024 * 1024) {
      addLog('File size must be less than 150mb', 'error');
      alert('File size must be less than 150mb');
      return;
    }
    if (file && file.type === 'audio/mpeg' && user) {
      setIsLoading(true);
      await uploadMusic(file, user.uid);
      // setAudioFullPath(audioUrl);
      // addLog(`Uploaded music to ${_uploadedAudioFullPath}`, 'success');
      // Refresh uploads list
      await fetchUserUploads();
      setIsLoading(false);
    }
    // if (file && user) {
    //   setIsLoading(true);
    //   try {
    //     await uploadAndNormalizeMusic(file, user.uid);
    //     await fetchUserUploads();
    //     addLog(`Uploaded music`, 'success');
    //   } catch (e: any) {
    //     addLog(`Upload failed: ${e?.message || 'Unknown error'}`, 'error');
    //     alert(e?.message || 'Upload failed');
    //   }
    //   // Refresh uploads list
    //   await fetchUserUploads();
    //   setIsLoading(false);
    // }
  };

  // Select existing upload
  const handleSelectUpload = (_audioFullPath: string) => {
    setAudioFullPath(_audioFullPath);
    const fileName = _audioFullPath?.split('%2F')?.pop()?.split('?')[0] ?? '';
    addLog(`Selected music: ${fileName}`, 'info');
  };

  // Emoji reactions

  const handleEmojiReact = async (emoji: string) => {
    if (user) {
      await sendDjRequest(spaceId, RequestType.REACT_EMOJI, {
        emoji,
      });
      setCurrentEmoji(emoji);
      addLog(`Reacted with ${emoji}`, 'success');
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    // TODO:
  };

  const handleDeleteUpload = async (fileName: string) => {
    if (user) {
      await deleteMusicUpload(fileName, user.uid);
      await fetchUserUploads();
      addLog(`Deleted music: ${fileName}`, 'success');
    }
  };

  useEffect(() => {
    if (spaceId) {
      djLurkyDocSnapshot(spaceId, (doc) => {
        setSpaceDoc(doc);
      });
    }
  }, [spaceId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const _spaceId = urlParams.get('spaceId');
    if (_spaceId) setSpaceId(_spaceId);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        pt: { xs: 2, sm: 3, md: 4 },
        // pb: { xs: 4, sm: 6, md: 8 },
        // px: { xs: 1, sm: 2 },
        color: 'white',
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
            'radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)',
          // animation: `${pulse} 4s infinite ease-in-out`,
        },
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {[...Array(isMobile ? 3 : 5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '2px',
              height: '100%',
              background:
                'linear-gradient(to bottom, transparent, rgba(96, 165, 250, 0.2), transparent)',
              left: `${(i + 1) * (isMobile ? 33 : 20)}%`,
              animation: `${wave} ${3 + i}s infinite ease-in-out`,
            }}
          />
        ))}
      </Box>

      {/* Floating particles */}
      {[...Array(isMobile ? 10 : 20)].map((_, i) => (
        <Box
          key={`particle-${i}`}
          sx={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: 'rgba(96, 165, 250, 0.5)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `${float} ${
              5 + Math.random() * 5
            }s infinite ease-in-out`,
            filter: 'blur(1px)',
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        {/* <Box
          sx={{
            display: 'flex',
            justifyContent:  'space-between',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            mb: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <div className="logo">
            <Logo />
            <span>Songjam</span>
          </div>
        </Box> */}
        <Fade in timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: { xs: 2, sm: 3, md: 4 },
              border: '1px solid rgba(96, 165, 250, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background:
                  'linear-gradient(90deg, transparent, #60a5fa, transparent)',
                animation: `${glow} 2s infinite`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)',
                pointerEvents: 'none',
              },
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: { xs: 3, sm: 4, md: 6 },
                position: 'relative',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, sm: 0 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 2 },
                  flexDirection: { xs: 'row' },
                  textAlign: { xs: 'center', sm: 'left' },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    // animation: `${pulse} 2s infinite ease-in-out`,
                  }}
                >
                  <MusicNote
                    sx={{
                      fontSize: { xs: 32, sm: 36, md: 40 },
                      color: '#60a5fa',
                      filter: 'drop-shadow(0 0 10px rgba(96, 165, 250, 0.5))',
                    }}
                  />
                  {musicStarted && (
                    <GraphicEq
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        fontSize: { xs: 16, sm: 18, md: 20 },
                        color: '#4caf50',
                        animation: `${wave} 1s infinite ease-in-out`,
                        filter: 'drop-shadow(0 0 5px rgba(76, 175, 80, 0.5))',
                      }}
                    />
                  )}
                </Box>
                <Box>
                  <Typography
                    variant={isMobile ? 'h4' : 'h3'}
                    sx={{
                      background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px',
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.3)',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                    }}
                  >
                    Songjam DJ
                  </Typography>
                </Box>
              </Box>
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 2 }}
                sx={{
                  alignSelf: { xs: 'center', sm: 'flex-end' },
                  mt: { xs: 1, sm: 0 },
                }}
              >
                {user && user.username && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      ml: 'auto',
                      p: 1,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#60a5fa',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        textShadow: '0 0 5px rgba(96, 165, 250, 0.5)',
                      }}
                    >
                      @{user.username}
                    </Typography>
                    <Tooltip title="Logout">
                      <IconButton
                        size="small"
                        onClick={async () => {
                          await handleLogOut();
                          setShowAuthDialog(true);
                        }}
                        sx={{
                          color: '#ff6b6b',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <LogoutRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Stack>
            </Box>

            {!!spaceDoc && (
              <Stack
                sx={{
                  mb: { xs: 3, sm: 4 },
                  p: { xs: 2, sm: 3 },
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  border: '1px solid rgba(96, 165, 250, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  <FiberManualRecord sx={{ fontSize: 12, color: '#4caf50' }} />
                  {spaceDoc?.title && (
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
                      {spaceDoc.title}
                    </Typography>
                  )}
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 'medium',
                      mb: 1.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Space Hosts & Co-Hosts
                  </Typography>
                  <List
                    sx={{
                      '& .MuiListItem-root': {
                        px: 0,
                        py: 0.75,
                        mb: 0.5,
                      },
                    }}
                  >
                    {spaceDoc?.admins?.map((admin, index) => {
                      const isCurrentUser = user?.uid === admin.userId;
                      return (
                        <ListItem
                          key={admin.userId}
                          sx={{
                            p: 0,
                            mb: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              py: 1.5,
                              px: 4,
                              borderRadius: 2,
                              background: isCurrentUser
                                ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(96, 165, 250, 0.05) 100%)'
                                : 'rgba(255, 255, 255, 0.03)',
                              border: isCurrentUser
                                ? '1px solid rgba(96, 165, 250, 0.3)'
                                : '1px solid rgba(255, 255, 255, 0.08)',
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                background: isCurrentUser
                                  ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(96, 165, 250, 0.1) 100%)'
                                  : 'rgba(255, 255, 255, 0.06)',
                                transform: 'translateY(-1px)',
                                boxShadow: isCurrentUser
                                  ? '0 4px 12px rgba(96, 165, 250, 0.2)'
                                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
                              },
                            }}
                          >
                            {isCurrentUser && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  background:
                                    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                                  boxShadow:
                                    '0 2px 8px rgba(96, 165, 250, 0.4)',
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: 'white',
                                    fontSize: '0.6rem',
                                    fontWeight: 'bold',
                                    lineHeight: 1,
                                  }}
                                >
                                  YOU
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: isCurrentUser ? '#60a5fa' : 'white',
                                  fontWeight: '600',
                                  fontSize: '0.95rem',
                                  mb: 0.25,
                                  textShadow: isCurrentUser
                                    ? '0 0 8px rgba(96, 165, 250, 0.3)'
                                    : 'none',
                                }}
                              >
                                {admin.displayName}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#94a3b8',
                                  fontSize: '0.8rem',
                                  fontWeight: '400',
                                }}
                              >
                                @{admin.twitterScreenName}
                              </Typography>
                            </Box>
                            {isCurrentUser && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  background: 'rgba(96, 165, 250, 0.1)',
                                  border: '1px solid rgba(96, 165, 250, 0.2)',
                                }}
                              >
                                <FiberManualRecord
                                  sx={{ fontSize: 8, color: '#60a5fa' }}
                                />
                                <Typography
                                  sx={{
                                    color: '#60a5fa',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                  }}
                                >
                                  Host
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>

                {/* Admin Restriction Warning */}
                {spaceDoc && !isCurrentUserAdmin() && (
                  <Alert
                    severity="warning"
                    sx={{
                      color: '#ffc107',
                      opacity: 0.9,
                      background: 'rgba(255, 193, 7, 0.1)',
                    }}
                  >
                    Only space Hosts & Co-Hosts can use the DJ controls
                  </Alert>
                )}
              </Stack>
            )}

            {/* Main Content Grid */}
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                {/* Sound Board */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <SoundBoard
                    onSoundPlay={(audioUrl) => {
                      addLog(`Playing sound effect`, 'info');
                    }}
                    onSoundStop={() => {
                      addLog(`Stopped sound effect`, 'info');
                    }}
                    isConnected={isCurrentUserAdmin()}
                    isInSpace={isCurrentUserAdmin()}
                    userId={user?.uid}
                    onLog={addLog}
                    soundboardFiles={soundboardFiles}
                    onFilesUpdated={fetchUserUploads}
                    soundSlots={soundSlots}
                    setSoundSlots={setSoundSlots}
                  />
                  <Box display={'flex'} justifyContent={'center'}>
                    <LoadingButton
                      disabled={
                        spaceDoc?.soundboardStatus === 'LOADED' || isLoading
                      }
                      loading={spaceDoc?.soundboardStatus === 'LOADING'}
                      sx={{ mt: 2 }}
                      variant="contained"
                      onClick={async () => {
                        setIsLoading(true);
                        await sendDjRequest(
                          spaceId,
                          RequestType.LOAD_SOUNDBOARD,
                          {
                            mp3AudioPaths: soundboardFiles.map(
                              (file) => file.audioFullPath
                            ),
                          }
                        );
                        setIsLoading(false);
                      }}
                    >
                      {spaceDoc?.soundboardStatus === 'LOADED'
                        ? 'Soundboard Loaded'
                        : 'Submit Soundboard'}
                    </LoadingButton>
                  </Box>
                </Box>

                {/* Music Uploads */}
                <MusicLibrary
                  audioUploads={audioUploads}
                  selectedAudioFullPath={audioFullPath}
                  isLibraryLoading={isLibraryLoading}
                  isLoading={isLoading}
                  onSelectUpload={handleSelectUpload}
                  onDeleteUpload={handleDeleteUpload}
                  onFileChange={handleFileChange}
                />
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                {/* Control Buttons */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  {/* Connection Warning */}
                  {/* {wsStatus !== 'connected' && !isInSpace && (
                    <Alert
                      severity="warning"
                      sx={{
                        mb: 2,
                        background: 'rgba(255, 193, 7, 0.1)',
                        border: '1px solid rgba(255, 193, 7, 0.3)',
                        color: '#ffc107',
                      }}
                    >
                      Join a space to use the soundboard
                    </Alert>
                  )} */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handlePlayMusic}
                    disabled={
                      !audioFullPath
                      // ||
                      // !isCurrentUserAdmin()
                    }
                    size={isMobile ? 'large' : 'large'}
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        transform: 'scale(1.02)',
                      },
                      height: { xs: 48, sm: 56 },
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.5s',
                      },
                      '&:hover::after': {
                        transform: 'translateX(100%)',
                      },
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : musicStarted ? (
                      <Stop />
                    ) : (
                      <>
                        Play Music <PlayArrow />
                      </>
                    )}
                  </Button>
                </Box>

                {/* Emoji Reactions */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <EmojiReactions
                    onEmojiReact={handleEmojiReact}
                    currentEmoji={currentEmoji}
                    isConnected={isCurrentUserAdmin()}
                    isInSpace={isCurrentUserAdmin()}
                  />
                </Box>

                {/* Volume Slider */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    <VolumeUp /> Volume
                  </Typography>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
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
                    <Slider
                      value={volume}
                      onChange={handleVolumeChange}
                      min={0}
                      max={1}
                      step={0.1}
                      disabled={!isCurrentUserAdmin()}
                    />
                  </Paper>

                  {/* <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                    <IconButton
                      onClick={() => {
                        handleSwitchMute(!isMuted);
                      }}
                      sx={{
                        color: isMuted ? '#f44336' : '#60a5fa',
                        '&:hover': { transform: 'scale(1.1)' },
                        transition: 'transform 0.2s',
                        filter: 'drop-shadow(0 0 5px rgba(96, 165, 250, 0.5))',
                      }}
                    >
                      {isMuted ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>
                  </Tooltip> */}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
        {/* <LoginDialog open={showAuthDialog && !authLoading} /> */}
        <Dialog open={!user} onClose={() => {}} maxWidth="sm">
          <DynamicEmbeddedWidget background="default" style={{ width: 350 }} />
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dj;

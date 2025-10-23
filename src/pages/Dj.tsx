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
  Chip,
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
import LoginDialog from '../components/LoginDialog';
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
  const [speakText, setSpeakText] = useState('');
  // const [spaceUrl, setSpaceUrl] = useState('');

  // Check if current user is an admin
  const isCurrentUserAdmin = () => {
    if (!user || !spaceDoc?.admins) return false;
    if (user.accountId === '1380387373217771523') return true;
    return spaceDoc.admins.some((admin) => admin.userId === user.accountId);
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
    setSoundSlots((prevSlots) =>
      prevSlots.map((slot, index) => {
        const slotFile = slotFiles[index];
        if (slotFile) {
          return {
            ...slot,
            name: slotFile.name,
            fullName: slotFile.name,
            audioUrl: `https://firebasestorage.googleapis.com/v0/b/lustrous-stack-453106-f6.firebasestorage.app/o/${encodeURIComponent(
              slotFile.audioFullPath
            )}?alt=media`,
            audioFullPath: slotFile.audioFullPath,
          } as SoundSlot & { audioFullPath: string };
        }
        return slot;
      })
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

    await sendDjRequest(
      spaceId,
      RequestType.PLAY_MUSIC,
      {
        audioFullPath,
      },
      () => {
        console.log('Play music request completed');
      }
    );
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
      addLog(`Uploaded music`, 'success');
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
    setVolume(newValue as number);
    sendDjRequest(spaceId, RequestType.VOLUME_CHANGE, {
      volume: newValue as number,
    });
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

  const handleSpeakText = async () => {
    if (isCurrentUserAdmin() && user && speakText.trim()) {
      await sendDjRequest(spaceId, RequestType.SPEAK_TEXT, {
        text: speakText.trim(),
        voiceId: '',
      });
      addLog(`Speaking text: ${speakText.trim()}`, 'info');
      setSpeakText(''); // Clear the input after sending
    }
  };

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
              borderRadius: 2,
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
                  gap: { xs: 1 },
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
                  <img
                    src="/songjam-latest.png"
                    style={{
                      width: 32,
                      height: 32,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant={isMobile ? 'h4' : 'h3'}
                    sx={{
                      fontFamily: 'Audiowide',
                      // background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                      // WebkitBackgroundClip: 'text',
                      // WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                      // letterSpacing: '0.5px',
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.3)',
                      // fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                    }}
                  >
                    SONGJAM DJ
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
                {user && (user.username || user.email) && (
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
                      }}
                    >
                      {user.username ? `@${user.username}` : user.email}
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

            {spaceDoc ? (
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
                    {spaceDoc.title || '--No Space Title--'}
                  </Typography>

                  <Chip
                    label={spaceDoc?.status}
                    size="medium"
                    sx={{
                      ml: 'auto',
                      bgcolor:
                        spaceDoc?.status === 'LIVE'
                          ? 'rgba(76, 175, 80, 0.2)'
                          : spaceDoc?.status === 'STARTING' ||
                            spaceDoc?.status === 'SPEAKER_REQUESTED'
                          ? 'rgba(255, 152, 0, 0.2)'
                          : spaceDoc?.status === 'LEFT' ||
                            spaceDoc?.status === 'FAILED'
                          ? 'rgba(244, 67, 54, 0.2)'
                          : 'rgba(184, 148, 150, 0.2)',
                      color:
                        spaceDoc?.status === 'LIVE'
                          ? '#4caf50'
                          : spaceDoc?.status === 'STARTING' ||
                            spaceDoc?.status === 'SPEAKER_REQUESTED'
                          ? '#ff9800'
                          : spaceDoc?.status === 'LEFT' ||
                            spaceDoc?.status === 'FAILED'
                          ? '#f44336'
                          : '#94a3b8',
                      border: '1px solid',
                      borderColor: 'currentColor',
                    }}
                  />
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
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      overflowX: 'auto',
                      pb: 1,
                      '&::-webkit-scrollbar': {
                        height: 8,
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 4,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 4,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        },
                      },
                    }}
                  >
                    {spaceDoc?.admins?.map((admin, index) => {
                      const isCurrentUser = user?.uid === admin.userId;
                      return (
                        <Box
                          key={admin.userId}
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
                            minWidth: 'fit-content',
                            flexShrink: 0,
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
                                boxShadow: '0 2px 8px rgba(96, 165, 250, 0.4)',
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
                                whiteSpace: 'nowrap',
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
                                whiteSpace: 'nowrap',
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
                      );
                    })}
                  </Box>
                </Box>

                {/* Admin Restriction Warning */}
                {spaceDoc && !isCurrentUserAdmin() && (
                  <Alert
                    severity="warning"
                    sx={{
                      mt: 2,
                      color: '#ffc107',
                      opacity: 0.9,
                      background: 'rgba(255, 193, 7, 0.1)',
                    }}
                  >
                    Only space Hosts & Co-Hosts can use the DJ controls
                  </Alert>
                )}
              </Stack>
            ) : (
              <Alert
                severity="error"
                sx={{
                  mb: 4,
                  // background: 'rgba(96, 165, 250, 0.1)',
                  // border: '1px solid rgba(96, 165, 250, 0.3)',
                  // color: '#60a5fa',
                  // '& .MuiAlert-icon': {
                  //   color: '#60a5fa',
                  // },
                }}
              >
                <Typography variant="body2">
                  The DJ hasn't been requested to join this space yet.
                </Typography>
              </Alert>
            )}

            {/* Main Content Grid */}
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {/* {!spaceDoc && <>
                <Grid item xs={12} md={6}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    <Link /> Space URL
                  </Typography>
                  <TextField
                    fullWidth
                    value={spaceUrl}
                    onChange={(e) => setSpaceUrl(e.target.value)}
                    placeholder="Enter space URL"
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(96, 165, 250, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#60a5fa',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#60a5fa',
                          boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
                sx={{ display: 'flex', alignItems: 'flex-end' }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  onClick={async () => {
                    // TODO
                    await axios.post(``, {spaceId: ''})
                  }}
                  disabled={!spaceUrl}
                  size={isMobile ? 'large' : 'large'}
                  sx={{
                    background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
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
                    boxShadow: '0 0 20px rgba(96, 165, 250, 0.3)',
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Join Space'
                  )}
                </Button>
              </Grid></>} */}
              {/* Bottom Row: Sound Board - Centered with max width */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    mb: { xs: 3, sm: 4 },
                    maxWidth: { xs: '100%', md: '600px' },
                    mx: 'auto',
                  }}
                >
                  <SoundBoard
                    onSoundPlay={(slotIndex) => {
                      addLog(`Playing sound effect`, 'info');
                      sendDjRequest(spaceId, RequestType.PLAY_SOUND, {
                        slotIndex: slotIndex,
                      });
                    }}
                    canPlay={spaceDoc?.soundboardStatus === 'LOADED'}
                    userId={user?.uid}
                    onLog={addLog}
                    onFilesUpdated={fetchUserUploads}
                    soundSlots={soundSlots}
                    setSoundSlots={setSoundSlots}
                  />
                  <Box display={'flex'} justifyContent={'center'}>
                    <LoadingButton
                      disabled={
                        spaceDoc?.soundboardStatus === 'LOADED' ||
                        isLoading ||
                        !isCurrentUserAdmin()
                      }
                      loading={spaceDoc?.soundboardStatus === 'LOADING'}
                      sx={{ mt: 2 }}
                      variant="contained"
                      onClick={async () => {
                        await sendDjRequest(
                          spaceId,
                          RequestType.LOAD_SOUNDBOARD,
                          {
                            mp3AudioUrls: soundSlots
                              .filter((slot) => slot.audioUrl)
                              .map((slot) => slot.audioUrl),
                          }
                        );
                      }}
                    >
                      {spaceDoc?.soundboardStatus === 'LOADED'
                        ? 'Soundboard Loaded'
                        : 'Submit Soundboard'}
                    </LoadingButton>
                  </Box>
                </Box>
              </Grid>
              {/* Left Column - Music Library */}
              <Grid item xs={12} md={6}>
                <MusicLibrary
                  audioUploads={audioUploads}
                  selectedAudioFullPath={audioFullPath}
                  isLibraryLoading={isLibraryLoading}
                  isLoading={isLoading}
                  onSelectUpload={handleSelectUpload}
                  onDeleteUpload={handleDeleteUpload}
                  onFileChange={handleFileChange}
                  playButton={
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handlePlayMusic}
                      disabled={
                        !audioFullPath ||
                        !isCurrentUserAdmin() ||
                        spaceDoc?.status !== 'LIVE'
                      }
                      size={isMobile ? 'large' : 'large'}
                      sx={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #7c3aed, #6d28d9)',
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
                      ) : (
                        <>
                          Play Music <PlayArrow />
                        </>
                      )}
                    </Button>
                  }
                  stopButton={
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={
                        !isCurrentUserAdmin() ||
                        !spaceDoc ||
                        spaceDoc?.playStatus !== 'PLAYING'
                      }
                      size={isMobile ? 'large' : 'large'}
                      sx={{
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
                          transform: 'translateX(-100%)',
                          transition: 'transform 0.5s',
                        },
                        '&:hover::after': {
                          transform: 'translateX(100%)',
                        },
                      }}
                      onClick={async () => {
                        setIsLoading(true);
                        await sendDjRequest(
                          spaceId,
                          RequestType.STOP_MUSIC,
                          {}
                        );
                        setIsLoading(false);
                      }}
                    >
                      Stop Music <Stop />
                    </Button>
                  }
                />
                <Box sx={{ mt: 2 }}>
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
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: { xs: 3, md: 0 } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    <VolumeUp /> Speak Text
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
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        value={speakText}
                        onChange={(e) => setSpeakText(e.target.value)}
                        placeholder="Enter text"
                        variant="outlined"
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(96, 165, 250, 0.5)',
                            },
                            '&:hover fieldset': {
                              borderColor: '#60a5fa',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#60a5fa',
                              boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                            },
                          },
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSpeakText();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSpeakText}
                        disabled={!speakText.trim() || !isCurrentUserAdmin()}
                        fullWidth
                        sx={{
                          background:
                            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          '&:hover': {
                            background:
                              'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            transform: 'scale(1.02)',
                          },
                          height: { xs: 40, sm: 48 },
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
                        Speak Now
                      </Button>
                    </Stack>
                  </Paper>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    <GraphicEq /> Activity Log
                  </Typography>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: 2,
                      height: { xs: '250px', sm: '300px', md: '365px' },
                      overflow: 'auto',
                      border: '1px solid rgba(96, 165, 250, 0.1)',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(96, 165, 250, 0.3)',
                        borderRadius: '4px',
                        '&:hover': {
                          background: 'rgba(96, 165, 250, 0.5)',
                        },
                      },
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'linear-gradient(to bottom, rgba(96, 165, 250, 0.1) 0%, transparent 100%)',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <List dense>
                      {[...logs].reverse().map((log, index) => (
                        <React.Fragment key={index}>
                          <ListItem sx={{ px: { xs: 1, sm: 2 } }}>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color:
                                      log.type === 'success'
                                        ? '#4caf50'
                                        : log.type === 'error'
                                        ? '#f44336'
                                        : '#60a5fa',
                                    fontFamily: 'monospace',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  <FiberManualRecord
                                    sx={{
                                      fontSize: 8,
                                      color:
                                        log.type === 'success'
                                          ? '#4caf50'
                                          : log.type === 'error'
                                          ? '#f44336'
                                          : '#60a5fa',
                                      flexShrink: 0,
                                    }}
                                  />
                                  [{log.timestamp}] {log.message}
                                </Typography>
                              }
                            />
                          </ListItem>
                          {index < logs.length - 1 && (
                            <Divider
                              sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
        <LoginDialog open={showAuthDialog && !authLoading} showOnlyTwitter />

        {/* How It Works Section */}
        <Paper
          sx={{
            mt: { xs: 3, sm: 4 },
            p: { xs: 2, sm: 3 },
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 2,
            border: '1px solid rgba(96, 165, 250, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
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
              fontWeight: 'bold',
            }}
          >
            How It Works
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                1. For Soundboard
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}
              >
                Load short audio clips under 500KB or select from the Library.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 193, 7, 0.95)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                }}
              >
                Note: Submit Soundboard at the start before the music played for
                smoother experience.
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                2. Access Control
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Only Hosts and Co-Hosts can access the live-dj controls.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dj;

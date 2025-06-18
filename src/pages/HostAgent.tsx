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
  ListItemButton,
  Radio,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  useTheme,
  keyframes,
  Slider,
  Skeleton,
  Checkbox,
} from '@mui/material';
import {
  CloudUpload,
  PlayArrow,
  Stop,
  MusicNote,
  Link,
  EmojiEmotions,
  VolumeUp,
  VolumeOff,
  Refresh,
  Equalizer,
  GraphicEq,
  RadioButtonChecked,
  FiberManualRecord,
  SkipNext,
  SkipPrevious,
  CheckBox,
  QueueMusic,
  RefreshRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  getMusicUploadsByUserId,
  uploadMusic,
} from '../services/storage/musicAgent.storage';
import { useAuthContext } from '../contexts/AuthContext';
import LoginDialog from '../components/LoginDialog';
import {
  MusicAgentRequest,
  createMusicAgentRequest,
} from '../services/db/musicAgentRequets.service';

// Advanced animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

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

const neonPulse = keyframes`
  0% { text-shadow: 0 0 2px #60a5fa, 0 0 4px #60a5fa; }
  50% { text-shadow: 0 0 4px #60a5fa, 0 0 8px #60a5fa; }
  100% { text-shadow: 0 0 2px #60a5fa, 0 0 4px #60a5fa; }
`;

const MusicAgent = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, loading: authLoading } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [spaceTitle, setSpaceTitle] = useState('');
  const [musicStarted, setMusicStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wsStatus, setWsStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');
  const [isInSpace, setIsInSpace] = useState(false);
  const [logs, setLogs] = useState<
    Array<{
      timestamp: string;
      message: string;
      type: 'info' | 'success' | 'error';
    }>
  >([]);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [audioUploads, setAudioUploads] = useState<
    {
      name: string;
      audioUrl: string;
    }[]
  >([]);
  //   const [audioUrl, setAudioUrl] = useState('');
  //   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  //   const [currentTime, setCurrentTime] = useState(0);
  //   const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const activityLogRef = useRef<HTMLDivElement>(null);
  const [currentEmoji, setCurrentEmoji] = useState('🎧');
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState<
    Array<{ name: string; audioUrl: string }>
  >([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number>(-1);

  // Add effect to scroll to top when new logs are added
  useEffect(() => {
    if (activityLogRef.current) {
      activityLogRef.current.scrollTop = 0;
    }
  }, [logs]);

  // Mock waveform data (in a real app, this would come from audio analysis)
  const waveformData = Array.from(
    { length: 50 },
    () => Math.random() * 0.5 + 0.1
  );

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
      connectSocket();
      fetchUserUploads();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const fetchUserUploads = async () => {
    if (!user) return;
    setIsLibraryLoading(true);
    const uploads = await getMusicUploadsByUserId(user.uid);
    setAudioUploads(uploads);
    setIsLibraryLoading(false);
    // setUserUploads(uploads);
  };

  const addLog = (
    message: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  // Define handlers outside connectSocket
  const handleConnect = () => {
    setWsStatus('connected');
    addLog('Connected to server successfully', 'success');
  };
  const handleDisconnect = () => {
    setWsStatus('disconnected');
    addLog('Disconnected from server', 'error');
  };
  const handleConnectError = () => {
    setWsStatus('disconnected');
    addLog('Failed to connect to server', 'error');
  };

  const connectSocket = (forceDisconnect: boolean = false) => {
    if (socketRef.current?.connected && !forceDisconnect) {
      return;
    }
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
      setWsStatus('disconnected');
      addLog('Disconnected from server', 'info');
      return;
    }

    setWsStatus('connecting');
    addLog('Connecting to server...', 'info');
    const socket = io(import.meta.env.VITE_JAM_MUSIC_AGENT_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Remove previous listeners before adding new ones
    socket.off('connect', handleConnect);
    socket.off('disconnect', handleDisconnect);
    socket.off('connect_error', handleConnectError);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    socketRef.current = socket;
  };

  const handleJoinSpace = async () => {
    if (!spaceTitle || !socketRef.current?.connected || !user) return;
    if (isInSpace) {
      const confirm = window.confirm(
        'You are already in a space. Do you want to join again?'
      );
      if (!confirm) return;
      setIsInSpace(false);
      setMusicStarted(false);
      // setIsMuted(false);
      handleJoinSpace();
    }

    setIsLoading(true);
    addLog('Requesting to join space...', 'info');

    socketRef.current.once(
      'space-hosted',
      (response: { status: string; spaceUrl: string }) => {
        const spaceId = response.spaceUrl.split('/').pop();
        setIsLoading(false);
        if (response.status === 'success') {
          window.open(response.spaceUrl, '_blank');
          setIsInSpace(true);
          addLog(`Successfully joined space: ${spaceId}`, 'success');
        }
      }
    );

    socketRef.current.once('error', (error: { message: string }) => {
      setIsLoading(false);
      addLog(`Failed to join space: ${error.message}`, 'error');
    });
    // TODO
    // const requestId = await createMusicAgentRequest({
    //   userId: user.uid,
    //   email: user.email,
    //   audioUrl,
    //   spaceTitle,
    //   startedAt: Date.now(),
    // });
    // addLog(`Request ID: ${requestId}`, 'info');

    socketRef.current.emit('host-space', {
      title: spaceTitle,
      playlist,
      //   requestId,
    });
  };

  const handlePlayMusic = () => {
    if (!socketRef.current?.connected) return;

    setIsLoading(true);
    addLog('Requesting to play music...', 'info');

    socketRef.current.once(
      'music-started',
      (response: { success: boolean; message?: string }) => {
        setIsLoading(false);
        if (response.success) {
          setMusicStarted(true);
          setIsPlaying(true);
          addLog('Music started playing successfully', 'success');
        } else {
          addLog(
            `Failed to play music: ${response.message || 'Unknown error'}`,
            'error'
          );
        }
      }
    );

    socketRef.current.emit('play-music');
  };

  // Upload handler
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Accept only less than 20mb files
    const file = event.target.files?.[0];
    if (file && file.size > 100 * 1024 * 1024) {
      addLog('File size must be less than 100mb', 'error');
      alert('File size must be less than 100mb');
      return;
    }
    if (file && file.type === 'audio/mpeg' && user) {
      setIsLoading(true);
      const audioUrl = await uploadMusic(file, user.uid);
      //   setAudioUrl(audioUrl);
      addLog(`Uploaded music`, 'success');
      // Refresh uploads list
      const uploads = await getMusicUploadsByUserId(user.uid);
      setAudioUploads(uploads);
      setIsLoading(false);
    }
  };

  // Emoji reactions
  const emojis = ['🎉', '🔥', '😂', '🥁', '👏', '🎧', '🎵', '🎸', '🎹', '🎺'];
  const handleEmojiReact = (emoji: string) => {
    if (socketRef.current && socketRef.current.connected && user) {
      socketRef.current.emit('react-emoji', {
        emoji,
        userId: user.uid,
        displayName: user.displayName,
      });
      setCurrentEmoji(emoji);
      addLog(`Reacted with ${emoji}`, 'success');
    }
  };
  const handleSwitchMute = (mute: boolean) => {
    if (socketRef.current && socketRef.current.connected && user) {
      socketRef.current.once(
        'switched-mute',
        (response: { isMuted: boolean }) => {
          setIsMuted(response.isMuted);
        }
      );
      socketRef.current.emit('switch-mute', { isMute: mute });
    }
  };
  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (socketRef.current && socketRef.current.connected && user) {
      setVolume(newValue as number);
      socketRef.current.emit('change-volume', { volume: newValue as number });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'audio/mpeg' && user) {
      if (file.size > 100 * 1024 * 1024) {
        addLog('File size must be less than 100mb', 'error');
        alert('File size must be less than 100mb');
        return;
      }
      setIsLoading(true);
      const audioUrl = await uploadMusic(file, user.uid);
      //   setAudioUrl(audioUrl);
      addLog(`Uploaded music to ${audioUrl}`, 'success');
      // Refresh uploads list
      const uploads = await getMusicUploadsByUserId(user.uid);
      setAudioUploads(uploads);
      setIsLoading(false);
    }
  };

  // Add socket event listeners for playlist
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(
        'playlist-updated',
        (response: {
          status: string;
          playlist: Array<{ name: string; audioUrl: string }>;
        }) => {
          //   console.log({ status });
          setPlaylist(response.playlist);
          addLog('Playlist updated', 'info');
        }
      );

      socketRef.current.on(
        'playlist-index',
        (response: { status: string; currentPlaylistIndex: number }) => {
          setCurrentPlaylistIndex(response.currentPlaylistIndex);
          addLog(
            `Now playing track ${response.currentPlaylistIndex + 1}`,
            'info'
          );
        }
      );

      return () => {
        if (socketRef.current) {
          socketRef.current.off('playlist-updated');
          socketRef.current.off('playlist-index');
        }
      };
    }
  }, [socketRef.current]);

  const handleAddToPlaylist = (audioUpload: {
    name: string;
    audioUrl: string;
  }) => {
    if (socketRef.current && socketRef.current.connected && isInSpace) {
      socketRef.current.emit('add-to-playlist', { audioUpload });
      addLog(`Adding "${audioUpload.name}" to playlist`, 'info');
    } else {
      setPlaylist((prev) => [...prev, audioUpload]);
      addLog('Failed to add to playlist', 'error');
    }
  };
  const handleRemoveFromPlaylist = (audioUpload: {
    name: string;
    audioUrl: string;
  }) => {
    if (socketRef.current && socketRef.current.connected && isInSpace) {
      socketRef.current.emit('remove-from-playlist', { audioUpload });
      addLog(`Adding "${audioUpload.name}" to playlist`, 'info');
    } else {
      setPlaylist((prev) =>
        prev.filter((item) => item.audioUrl !== audioUpload.audioUrl)
      );
      addLog('Failed to add to playlist', 'error');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        pt: 4,
        pb: 8,
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
          animation: `${pulse} 4s infinite ease-in-out`,
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
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '2px',
              height: '100%',
              background:
                'linear-gradient(to bottom, transparent, rgba(96, 165, 250, 0.2), transparent)',
              left: `${(i + 1) * 20}%`,
              animation: `${wave} ${3 + i}s infinite ease-in-out`,
            }}
          />
        ))}
      </Box>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
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

      <Container maxWidth="lg">
        <Fade in timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              p: 4,
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: 4,
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
                mb: 6,
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    position: 'relative',
                    animation: `${pulse} 2s infinite ease-in-out`,
                  }}
                >
                  <MusicNote
                    sx={{
                      fontSize: 40,
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
                        fontSize: 20,
                        color: '#4caf50',
                        animation: `${wave} 1s infinite ease-in-out`,
                        filter: 'drop-shadow(0 0 5px rgba(76, 175, 80, 0.5))',
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    textShadow: '0 0 10px rgba(96, 165, 250, 0.3)',
                    animation: `${neonPulse} 3s infinite`,
                  }}
                >
                  Live Space DJ - Host Agent
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Tooltip
                  title={wsStatus === 'connected' ? 'Disconnect' : 'Connect'}
                >
                  <IconButton
                    onClick={() => connectSocket(wsStatus === 'connected')}
                    sx={{
                      color: wsStatus === 'connected' ? '#4caf50' : '#f44336',
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                      animation:
                        wsStatus === 'connected'
                          ? `${pulse} 2s infinite`
                          : 'none',
                      position: 'relative',
                      '&::after':
                        wsStatus === 'connected'
                          ? {
                              content: '""',
                              position: 'absolute',
                              top: -2,
                              left: -2,
                              right: -2,
                              bottom: -2,
                              borderRadius: '50%',
                              border: '2px solid #4caf50',
                              animation: `${pulse} 2s infinite`,
                            }
                          : {},
                    }}
                  >
                    <RadioButtonChecked />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
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
                </Tooltip>
              </Stack>
            </Box>

            {/* Main Content Grid */}
            <Box
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}
            >
              {/* Left Column */}
              <Box>
                {/* Space URL Input */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                    }}
                  >
                    <Link /> Space Title
                  </Typography>
                  <TextField
                    fullWidth
                    value={spaceTitle}
                    onChange={(e) => setSpaceTitle(e.target.value)}
                    placeholder="Enter space title"
                    variant="outlined"
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

                {/* Playlist Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                    }}
                  >
                    <QueueMusic /> Current Playlist
                    <IconButton
                      sx={{ ml: 'auto' }}
                      onClick={() => {
                        if (socketRef.current && socketRef.current.connected) {
                          socketRef.current.emit('get-playlist-index');
                        }
                      }}
                    >
                      <RefreshRounded />{' '}
                    </IconButton>
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: 2,
                      maxHeight: '300px',
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
                    }}
                  >
                    {playlist.length === 0 ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          textAlign: 'center',
                          py: 2,
                        }}
                      >
                        No tracks in playlist
                      </Typography>
                    ) : (
                      <List>
                        {playlist.map((track, index) => (
                          <ListItemButton
                            key={`${track.audioUrl}-${index}`}
                            selected={index === currentPlaylistIndex}
                            sx={{
                              borderRadius: 1,
                              mb: 1,
                              transition: 'all 0.2s',
                              '&[selected]': {
                                background: 'rgba(96, 165, 250, 0.3)',
                                transform: 'scale(1.03)',
                                boxShadow: '0 0 15px rgba(96, 165, 250, 0.4)',
                              },
                            }}
                          >
                            <ListItemText
                              primary={`${index + 1}. ${track.name}`}
                              sx={{ color: 'white' }}
                            />
                            {index === currentPlaylistIndex && (
                              <Typography
                                sx={{ ml: 'auto' }}
                                variant="caption"
                                color="success"
                              >
                                Playing...
                              </Typography>
                            )}
                          </ListItemButton>
                        ))}
                      </List>
                    )}
                  </Paper>
                </Box>

                {/* Music Uploads */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                    }}
                  >
                    <CloudUpload /> Your Music Library
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: 2,
                      maxHeight: '300px',
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
                    }}
                  >
                    {isLibraryLoading ? (
                      <List>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <ListItemButton
                            key={i}
                            sx={{
                              borderRadius: 1,
                              mb: 1,
                              transition: 'all 0.2s',
                              background: 'rgba(255,255,255,0.05)',
                            }}
                            disabled
                          >
                            <Checkbox disabled sx={{ color: '#60a5fa' }} />
                            <ListItemText
                              primary={
                                <Skeleton
                                  variant="text"
                                  width={120}
                                  sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)' }}
                                />
                              }
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    ) : audioUploads.length === 0 ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          textAlign: 'center',
                          py: 2,
                        }}
                      >
                        No uploads yet
                      </Typography>
                    ) : (
                      <List>
                        {audioUploads.map((audioUpload) => (
                          <ListItemButton
                            key={audioUpload.audioUrl}
                            // onClick={() =>
                            //   handleSelectUpload(audioUpload.audioUrl)
                            // }
                            sx={{
                              borderRadius: 1,
                              mb: 1,
                              transition: 'all 0.2s',
                              '&:hover': {
                                background: 'rgba(96, 165, 250, 0.1)',
                                transform: 'scale(1.01)',
                              },
                            }}
                          >
                            <Checkbox
                              checked={playlist.some(
                                (item) => item.audioUrl === audioUpload.audioUrl
                              )}
                              onChange={(e, checked) => {
                                if (checked) {
                                  handleAddToPlaylist(audioUpload);
                                } else {
                                  handleRemoveFromPlaylist(audioUpload);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              sx={{ color: '#60a5fa' }}
                            />
                            <ListItemText
                              primary={audioUpload.name}
                              sx={{ color: 'white' }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    )}
                  </Paper>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      mt: 2,
                      borderColor: '#60a5fa',
                      color: '#60a5fa',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(96, 165, 250, 0.1)',
                        transform: 'scale(1.02)',
                      },
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
                    }}
                    disabled={isLoading}
                  >
                    Upload New Track
                  </Button>
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="audio/mpeg"
                    onChange={handleFileChange}
                  />
                </Box>
              </Box>

              {/* Right Column */}
              <Box>
                {/* Control Buttons */}
                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleJoinSpace}
                      disabled={!socketRef.current?.connected || !spaceTitle}
                      sx={{
                        background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #3b82f6, #2563eb)',
                          transform: 'scale(1.02)',
                        },
                        height: 56,
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
                      ) : isInSpace ? (
                        'In Space'
                      ) : (
                        'Host Space'
                      )}
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handlePlayMusic}
                      disabled={!socketRef.current?.connected || !isInSpace}
                      sx={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          transform: 'scale(1.02)',
                        },
                        height: 56,
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
                        <PlayArrow />
                      )}
                    </Button>
                  </Stack>
                </Box>

                {/* Emoji Reactions */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                    }}
                  >
                    <EmojiEmotions /> Reactions
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: 'center',
                      }}
                    >
                      {emojis.map((emoji) => (
                        <Zoom key={emoji} in>
                          <Button
                            onClick={() => handleEmojiReact(emoji)}
                            sx={{
                              fontSize: 24,
                              width: 68,
                              height: 48,
                              background: 'rgba(96, 165, 250, 0.1)',
                              '&:hover': {
                                background: 'rgba(96, 165, 250, 0.2)',
                                transform: 'scale(1.1) rotate(5deg)',
                              },
                              border:
                                currentEmoji === emoji
                                  ? '2px solid #60a5fa'
                                  : 'none',
                              transition: 'all 0.2s',
                              animation: `${pulse} 2s infinite ease-in-out`,
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
                                  'radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
                                opacity: 0,
                                transition: 'opacity 0.2s',
                              },
                              '&:hover::after': {
                                opacity: 1,
                              },
                            }}
                            disabled={
                              !socketRef.current?.connected || !isInSpace
                            }
                          >
                            {emoji}
                          </Button>
                        </Zoom>
                      ))}
                    </Stack>
                  </Paper>
                </Box>
                {/* Volumn Slider */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                    }}
                  >
                    <VolumeUp /> Volume
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
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
                      // disabled={!socketRef.current?.connected || !isInSpace}
                    />
                  </Paper>
                </Box>

                {/* Activity Log */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#60a5fa',
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                    }}
                  >
                    Activity Log
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: 2,
                      // maxHeight: '200px',
                      height: '365px',
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
                          <ListItem>
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
                                    textShadow:
                                      '0 0 5px rgba(96, 165, 250, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
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
                                      animation: `${pulse} 2s infinite`,
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
              </Box>
            </Box>
          </Paper>
        </Fade>
        <LoginDialog open={showAuthDialog && !authLoading} />
      </Container>
    </Box>
  );
};

export default MusicAgent;

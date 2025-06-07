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
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
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

const MusicAgent = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [spaceUrl, setSpaceUrl] = useState('');
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
  const [audioUrl, setAudioUrl] = useState('');

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
  }, [user]);

  const fetchUserUploads = async () => {
    if (!user) return;
    const uploads = await getMusicUploadsByUserId(user.uid);
    setAudioUploads(uploads);
    // setUserUploads(uploads);
  };

  const addLog = (
    message: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const connectSocket = () => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
      setWsStatus('disconnected');
      addLog('Disconnected from server', 'info');
      return;
    }

    setWsStatus('connecting');
    addLog('Connecting to server...', 'info');
    const socket = io('http://localhost:8080', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setWsStatus('connected');
      addLog('Connected to server successfully', 'success');
    });

    socket.on('disconnect', () => {
      setWsStatus('disconnected');
      addLog('Disconnected from server', 'error');
    });

    socket.on('connect_error', () => {
      setWsStatus('disconnected');
      addLog('Failed to connect to server', 'error');
    });

    socketRef.current = socket;
  };

  const handleJoinSpace = async () => {
    if (!spaceUrl || !socketRef.current?.connected || !audioUrl || !user)
      return;
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
      'space-joined',
      (response: { status: string; spaceId: string }) => {
        setIsLoading(false);
        if (response.status === 'success') {
          setIsInSpace(true);
          addLog(`Successfully joined space: ${response.spaceId}`, 'success');
        }
      }
    );

    socketRef.current.once('error', (error: { message: string }) => {
      setIsLoading(false);
      addLog(`Failed to join space: ${error.message}`, 'error');
    });

    socketRef.current.emit('join-space', {
      spaceId: spaceUrl.split('/').pop(),
    });
    await createMusicAgentRequest({
      userId: user.uid,
      twitterScreenName: user.username,
      displayName: user.displayName,
      audioUrl,
      spaceUrl,
      createdAt: new Date(),
    });
  };

  const handlePlayMusic = () => {
    if (!socketRef.current?.connected || !audioUrl) return;

    setIsLoading(true);
    addLog('Requesting to play music...', 'info');

    socketRef.current.once(
      'music-started',
      (response: { success: boolean; message?: string }) => {
        setIsLoading(false);
        if (response.success) {
          setMusicStarted(true);
          addLog('Music started playing successfully', 'success');
        } else {
          addLog(
            `Failed to play music: ${response.message || 'Unknown error'}`,
            'error'
          );
        }
      }
    );

    socketRef.current.emit('play-music', {
      mp3Url: audioUrl,
    });
  };

  // Upload handler
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Accept only less than 20mb files
    const file = event.target.files?.[0];
    if (file && file.size > 20 * 1024 * 1024) {
      addLog('File size must be less than 20mb', 'error');
      alert('File size must be less than 20mb');
      return;
    }
    if (file && file.type === 'audio/mpeg' && user) {
      setIsLoading(true);
      const audioUrl = await uploadMusic(file, user.uid);
      setAudioUrl(audioUrl);
      addLog(`Uploaded music to ${audioUrl}`, 'success');
      // Refresh uploads list
      const uploads = await getMusicUploadsByUserId(user.uid);
      setAudioUploads(uploads);
      setIsLoading(false);
    }
  };

  // Select existing upload
  const handleSelectUpload = (url: string) => {
    setAudioUrl(url);
    addLog(`Selected music: ${url}`, 'info');
  };

  // Emoji reactions
  const emojis = ['🎉', '🔥', '😂', '🥁', '👏', '🎧'];
  const handleEmojiReact = (emoji: string) => {
    if (socketRef.current && socketRef.current.connected && user) {
      socketRef.current.emit('react-emoji', {
        emoji,
        userId: user.uid,
        displayName: user.displayName,
      });
      addLog(`Reacted with ${emoji}`, 'success');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: 3,
            border: '1px solid rgba(96, 165, 250, 0.2)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
              }}
            >
              🎧 Live Space DJ Console
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={connectSocket}
                sx={{
                  borderColor: 'rgba(96, 165, 250, 0.5)',
                  color: '#60a5fa',
                  '&:hover': {
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  },
                }}
              >
                {wsStatus === 'connected' ? 'Disconnect' : 'Connect'}
              </Button>
            </Box>
          </Box>

          {/* Space URL Input for joining */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, color: 'var(--text-primary)' }}
            >
              Space URL
            </Typography>
            <TextField
              fullWidth
              value={spaceUrl}
              onChange={(e) => setSpaceUrl(e.target.value)}
              placeholder={'Enter space URL'}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
              }}
            />
          </Box>

          {/* Uploads List and Upload Button */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, color: 'var(--text-primary)' }}
            >
              Your Uploaded Music
            </Typography>
            {audioUploads.length === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)' }}
                >
                  No uploads found
                </Typography>
              </Box>
            )}
            <List>
              {audioUploads.map((audioUpload) => (
                <ListItemButton
                  key={audioUpload.audioUrl}
                  onClick={() => handleSelectUpload(audioUpload.audioUrl)}
                  selected={audioUpload.audioUrl === audioUrl}
                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Radio
                    checked={audioUpload.audioUrl === audioUrl}
                    value={audioUpload.audioUrl}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-label': audioUpload.name }}
                    sx={{ mr: 2 }}
                  />
                  {audioUpload.name}
                </ListItemButton>
              ))}
            </List>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              Upload New MP3
            </Button>
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="audio/mpeg"
              onChange={handleFileChange}
            />
          </Box>

          {/* Play Music Button */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleJoinSpace}
              disabled={!socketRef.current?.connected || !spaceUrl || !audioUrl}
              color="primary"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isInSpace ? (
                'In Space'
              ) : (
                'Join Space'
              )}
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handlePlayMusic}
              disabled={
                !socketRef.current?.connected || !isInSpace || !audioUrl
              }
              sx={{
                background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Play Music'
              )}
            </Button>
          </Stack>

          {/* Emoji Reactions */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, color: 'var(--text-primary)' }}
            >
              React with
            </Typography>
            <Stack direction="row" spacing={2}>
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  onClick={() => handleEmojiReact(emoji)}
                  size="small"
                  sx={{
                    fontSize: 32,
                    minWidth: 48,
                    background: 'rgba(96, 165, 250, 0.08)',
                  }}
                  disabled={!socketRef.current?.connected || !isInSpace}
                >
                  {emoji}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Activity Logs */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, color: 'var(--text-primary)' }}
            >
              Activity Logs
            </Typography>
            <Paper
              sx={{
                p: 2,
                maxHeight: '200px',
                overflow: 'auto',
                background: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              <List dense>
                {logs.map((log, index) => (
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
                            }}
                          >
                            [{log.timestamp}] {log.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < logs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Paper>
        {/* Login Dialog */}
        <LoginDialog open={showAuthDialog && !authLoading} />
      </Container>
    </Box>
  );
};

export default MusicAgent;

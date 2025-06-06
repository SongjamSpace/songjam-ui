import React, { useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  IconButton,
  Grid,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  MusicNote,
  Upload,
  CloudUpload,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { uploadMusic } from '../services/storage/djConsole';

const Dj = () => {
  const { t } = useTranslation();
  const [role, setRole] = useState<'host' | 'speaker'>('speaker');
  const [spaceTitle, setSpaceTitle] = useState('');
  const [spaceUrl, setSpaceUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const [isDragging, setIsDragging] = useState(false);
  const [musicUrl, setMusicUrl] = useState('');

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'audio/mpeg') {
      setSelectedFile(file);
    }
  };

  const handleRoleChange = (
    event: React.SyntheticEvent,
    newValue: 'host' | 'speaker'
  ) => {
    setRole(newValue);
    setSpaceUrl('');
    setSpaceTitle('');
    setIsInSpace(false);
  };

  const handleHostSpace = () => {
    if (!spaceTitle || !socketRef.current?.connected) return;

    setIsLoading(true);
    addLog('Requesting to host space...', 'info');

    socketRef.current.once(
      'space-hosted',
      (response: { status: string; spaceId: string; spaceUrl: string }) => {
        setIsLoading(false);
        if (response.status === 'success') {
          setIsInSpace(true);
          setSpaceUrl(response.spaceUrl);
          addLog(`Successfully hosted space: ${response.spaceId}`, 'success');
          // Open the space in a new tab
          window.open(response.spaceUrl, '_blank');
        }
      }
    );

    socketRef.current.once('error', (error: { message: string }) => {
      setIsLoading(false);
      addLog(`Failed to host space: ${error.message}`, 'error');
    });

    socketRef.current.emit('host-space', {
      title: spaceTitle,
    });
  };

  const handleJoinSpace = () => {
    if (!spaceUrl || !socketRef.current?.connected) return;

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
      mp3Url:
        musicUrl ||
        'https://firebasestorage.googleapis.com/v0/b/lustrous-stack-453106-f6.firebasestorage.app/o/pointofnoreturn.mp3?alt=media',
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    debugger;
    if (file && file.type === 'audio/mpeg') {
      setSelectedFile(file);
      const url = await uploadMusic(file, 'pointofnoreturn');
      addLog(`Uploaded music to ${url}`, 'success');
      setMusicUrl(url);
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
              {/* <Chip
                label={wsStatus}
                color={
                  wsStatus === 'connected'
                    ? 'success'
                    : wsStatus === 'connecting'
                    ? 'warning'
                    : 'error'
                }
                size="small"
              /> */}
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

          <Tabs
            value={role}
            onChange={handleRoleChange}
            sx={{
              mb: 4,
              '& .MuiTab-root': {
                color: 'var(--text-secondary)',
                '&.Mui-selected': {
                  color: '#60a5fa',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#60a5fa',
              },
            }}
          >
            <Tab label="Host" value="host" />
            <Tab label="Speaker" value="speaker" />
          </Tabs>

          <Stack spacing={4}>
            {/* Space Title/URL Input */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: 'var(--text-primary)' }}
              >
                {role === 'host' ? 'Space Title' : 'Space URL'}
              </Typography>
              <TextField
                fullWidth
                value={role === 'host' ? spaceTitle : spaceUrl}
                onChange={(e) =>
                  role === 'host'
                    ? setSpaceTitle(e.target.value)
                    : setSpaceUrl(e.target.value)
                }
                placeholder={
                  role === 'host' ? 'Enter space title' : 'Enter space URL'
                }
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

            {/* Music Upload */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: 'var(--text-primary)' }}
              >
                Upload Music
              </Typography>
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging
                    ? '#60a5fa'
                    : 'rgba(255, 255, 255, 0.23)',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: isDragging
                    ? 'rgba(96, 165, 250, 0.1)'
                    : 'transparent',
                  '&:hover': {
                    borderColor: '#60a5fa',
                    bgcolor: 'rgba(96, 165, 250, 0.05)',
                  },
                }}
              >
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="audio/mpeg"
                  onChange={handleFileChange}
                />
                <CloudUpload sx={{ fontSize: 48, color: '#60a5fa', mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{ color: 'var(--text-primary)', mb: 1 }}
                >
                  {selectedFile ? 'File Selected' : 'Drag & Drop MP3 File'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'var(--text-secondary)' }}
                >
                  {selectedFile ? selectedFile.name : 'or click to browse'}
                </Typography>
              </Box>
            </Box>

            {/* Audio Controls */}
            {/* <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: 'var(--text-primary)' }}
              >
                Audio Controls
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <IconButton
                    onClick={handlePlayPause}
                    sx={{
                      bgcolor: 'rgba(96, 165, 250, 0.1)',
                      '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.2)' },
                    }}
                  >
                    {isPlaying ? <Pause /> : <PlayArrow />}
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={handleMute}
                    sx={{
                      bgcolor: 'rgba(96, 165, 250, 0.1)',
                      '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.2)' },
                    }}
                  >
                    {isMuted ? <VolumeOff /> : <VolumeUp />}
                  </IconButton>
                </Grid>
              </Grid>
            </Box> */}

            {/* DJ Effects */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: 'var(--text-primary)' }}
              >
                DJ Effects
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<MusicNote />}
                    sx={{
                      borderColor: 'rgba(96, 165, 250, 0.5)',
                      color: '#60a5fa',
                      '&:hover': {
                        borderColor: '#60a5fa',
                        backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      },
                    }}
                  >
                    Drumroll
                  </Button>
                </Grid>
              </Grid>
            </Box>
            {/* Replace Start DJing Button with Join/Host Space and Play music buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={role === 'host' ? handleHostSpace : handleJoinSpace}
                disabled={
                  !socketRef.current?.connected ||
                  (role === 'host' ? !spaceTitle : !spaceUrl)
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
                ) : isInSpace ? (
                  'In Space'
                ) : role === 'host' ? (
                  'Host Space'
                ) : (
                  'Join Space'
                )}
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handlePlayMusic}
                disabled={!socketRef.current?.connected || !isInSpace}
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

            {/* Activity Logs */}
            <Box>
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
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dj;

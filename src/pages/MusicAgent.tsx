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
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  MusicNote,
  Link,
  VolumeUp,
  VolumeOff,
  GraphicEq,
  RadioButtonChecked,
  FiberManualRecord,
  LogoutRounded,
} from '@mui/icons-material';
import EmojiReactions from '../components/EmojiReactions';
import SoundBoard, { SoundSlot } from '../components/SoundBoard';
import MusicLibrary from '../components/MusicLibrary';
import {
  deleteMusicUpload,
  getMusicUploadsByUserId,
  getUploadedAudioPaths,
  uploadMusic,
} from '../services/storage/musicAgent.storage';
// import { uploadAndNormalizeMusic } from '../services/musicAgentUpload.service';
import { useAuthContext } from '../contexts/AuthContext';
import LoginDialog from '../components/LoginDialog';
import { updateUserReferredBy } from '../services/db/user.service';
import { createDjSpacesDoc } from '../services/db/djSpaces.service';
import { extractSpaceId } from '../utils';
import {
  getOrCreateReferral,
  incrementPlayCount,
  incrementReferralCount,
  getReferralById,
  Referral,
  getReferralByTwitterId,
} from '../services/db/referral.service';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
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

const neonPulse = keyframes`
  0% { text-shadow: 0 0 2px #60a5fa, 0 0 4px #60a5fa; }
  50% { text-shadow: 0 0 4px #60a5fa, 0 0 8px #60a5fa; }
  100% { text-shadow: 0 0 2px #60a5fa, 0 0 4px #60a5fa; }
`;

const MusicAgent = () => {
  // const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, loading: authLoading } = useAuthContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [spaceUrl, setSpaceUrl] = useState('');
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
  const [audioUploads, setAudioUploads] = useState<
    {
      name: string;
      audioUrl: string;
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
  const activityLogRef = useRef<HTMLDivElement>(null);
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
  const [referral, setReferral] = useState<Referral | null>(null);
  const [isLoadingReferral, setIsLoadingReferral] = useState(false);
  const [speakText, setSpeakText] = useState('');
  const { handleLogOut } = useDynamicContext();
  // const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null);
  // const [isCheckingStake, setIsCheckingStake] = useState(false);
  // const { primaryWallet } = useDynamicContext();

  // useEffect(() => {
  //   if (primaryWallet?.address) {
  //     checkStaking();
  //   }
  // }, [primaryWallet]);

  // const checkStaking = async () => {
  //   if (primaryWallet?.address && !stakingInfo && !isCheckingStake) {
  //     setIsCheckingStake(true);
  //     try {
  //       const info = await getSangStakingStatus(primaryWallet.address); // Base chainId
  //       setStakingInfo(info);
  //       setIsCheckingStake(false);

  //       if (info.hasMinimumStake && !user) {
  //         // Auto-start X login if they have sufficient tokens
  //         try {
  //           // await signInWithSocialAccount(ProviderEnum.Twitter, {
  //           //   redirectUrl: window.location.href,
  //           // });
  //         } catch (error) {
  //           console.error('Error signing in with Twitter:', error);
  //           // toast.error('Failed to connect X account');
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error checking staking status:', error);
  //       // toast.error('Failed to check ELYTRA staking status');
  //     }
  //   }
  // };

  // Add effect to scroll to top when new logs are added
  useEffect(() => {
    if (activityLogRef.current) {
      activityLogRef.current.scrollTop = 0;
    }
  }, [logs]);

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
      fetchOrCreateReferral(false);
    }
    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.disconnect();
    //   }
    // };
  }, [user]);

  // Handle referral tracking when user signs up
  useEffect(() => {
    if (user?.isSignUp) {
      handleReferralTracking();
    }
  }, [user?.isSignUp]);

  const fetchUserUploads = async () => {
    if (!user) return;
    setIsLibraryLoading(true);
    const uploads = await getUploadedAudioPaths(user.uid);

    // Filter out slot files for soundboard
    const slotFiles = uploads.filter((file) => file.name.startsWith('slot_'));
    const musicFiles = uploads.filter((file) => !file.name.startsWith('slot_'));

    setAudioUploads(
      musicFiles.map((file) => ({
        name: file.name,
        audioFullPath: file.audioFullPath,
        audioUrl: `https://firebasestorage.googleapis.com/v0/b/lustrous-stack-453106-f6.firebasestorage.app/o/${encodeURIComponent(
          file.audioFullPath
        )}?alt=media`,
      }))
    );
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

  const fetchOrCreateReferral = async (isCreate: boolean = false) => {
    if (!user || !user.accountId) {
      if (isCreate) {
        alert('Please sign in with X (twitter) to create a referral code');
        if (user && !user?.accountId) {
          await handleLogOut();
          setShowAuthDialog(true);
        }
      }
      return;
    }
    setIsLoadingReferral(true);
    try {
      if (isCreate) {
        const referralData = await getOrCreateReferral(user.accountId, {
          accountId: user.accountId,
          email: user.email,
          username: user.displayName,
          uid: user.uid,
        });
        setReferral(referralData);
        addLog(
          `Referral code created: ${referralData.referralCode}`,
          'success'
        );
      } else {
        const referralData = await getReferralByTwitterId(user.accountId);
        setReferral(referralData);
      }
    } catch (error) {
      console.error('Error fetching/creating referral:', error);
      addLog('Failed to create referral code', 'error');
    } finally {
      setIsLoadingReferral(false);
    }
  };

  const addLog = (
    message: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  // Define handlers outside connectSocket
  const handleConnect = async () => {
    setWsStatus('connected');
    addLog('Connected to server successfully', 'success');
    await handleJoinSpace();
  };
  const handleDisconnect = () => {
    setWsStatus('disconnected');
    addLog('Disconnected from server', 'error');
    setIsInSpace(false);
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
    setIsLoading(true);
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
    if (!spaceUrl || !socketRef.current?.connected || !audioFullPath || !user)
      return;
    if (isInSpace) {
      const confirm = window.confirm(
        'You are already in a space. Do you want to join again?'
      );
      if (!confirm) return;
      setIsInSpace(false);
      // setIsMuted(false);
      handleJoinSpace();
    }

    addLog('Requesting to join space...', 'info');

    socketRef.current.once(
      'space-joined',
      (response: { status: string; spaceId: string }) => {
        setIsLoading(false);
        if (response.status === 'success') {
          setIsInSpace(true);
          addLog(`Successfully joined space: ${response.spaceId}`, 'success');
          if (user.uid) {
            createDjSpacesDoc({
              spaceId: extractSpaceId(spaceUrl) ?? '',
              userId: user.uid ?? '',
              username: user?.username ?? user?.displayName ?? '',
              twitterId: user.accountId ?? '',
              socketId: socketRef.current?.id ?? '',
              email: user?.email,
              referredById: user?.referredById ?? '',
              referredByUid: user?.referredByUid ?? '',
              referredByTwitterId: user.referredByTwitterId ?? '',
            });
          }

          // Increment play count for referring user if this user was referred
          if (user?.referredById) {
            incrementPlayCount(user?.referredById);
          }
        }
      }
    );

    socketRef.current.once('error', (error: { message: string }) => {
      setIsLoading(false);
      addLog(`Failed to join space: ${error.message}`, 'error');
    });

    socketRef.current.emit('join-space', {
      spaceId: spaceUrl.split('/').pop(),
      soundboardUrls: soundSlots.map((s) => s.audioUrl),
    });
  };

  const handlePlayMusic = () => {
    if (!socketRef.current?.connected || !audioFullPath) return;

    setIsLoading(true);
    addLog('Requesting to play music...', 'info');

    socketRef.current.once(
      'music-played',
      async (response: { success: boolean; message?: string }) => {
        setIsLoading(false);
        if (response.success) {
          addLog('Music completed playing', 'success');

          // Increment play count for referral
          if (referral) {
            try {
              await incrementPlayCount(referral.id);
              addLog('Play count updated', 'info');
            } catch (error) {
              console.error('Failed to increment play count:', error);
            }
          }
        } else {
          addLog(
            `Failed to play music: ${response.message || 'Unknown error'}`,
            'error'
          );
        }
      }
    );

    socketRef.current.emit('play-music', {
      mp3Url: `https://firebasestorage.googleapis.com/v0/b/lustrous-stack-453106-f6.firebasestorage.app/o/${encodeURIComponent(
        audioFullPath
      )}?alt=media`,
    });
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
      const audioUrl = await uploadMusic(file, user.uid);
      addLog(`Uploaded music to ${audioUrl}`, 'success');
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
  const handleSelectUpload = (audioPath: string) => {
    setAudioFullPath(audioPath);
    addLog(`Music file selected`, 'info');
  };

  // Emoji reactions

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

  const handleSpeakText = () => {
    if (
      socketRef.current &&
      socketRef.current.connected &&
      user &&
      speakText.trim()
    ) {
      socketRef.current.emit('speak-text', { text: speakText.trim() });
      addLog(`Speaking text: ${speakText.trim()}`, 'info');
      setSpeakText(''); // Clear the input after sending
    }
  };

  const handleDeleteUpload = async (fileName: string) => {
    if (user) {
      await deleteMusicUpload(fileName, user.uid);
      await fetchUserUploads();
      addLog(`Deleted music: ${fileName}`, 'success');
    }
  };

  const copyReferralUrl = async () => {
    if (referral) {
      const referralUrl = `${location.origin}/dj?ref=${referral.id}`;
      try {
        await navigator.clipboard.writeText(referralUrl);
        addLog('Referral URL copied to clipboard!', 'success');
      } catch (error) {
        console.error('Failed to copy referral URL:', error);
        addLog('Failed to copy referral URL', 'error');
      }
    }
  };

  // Get referral ID from URL parameters
  const getReferralIdFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  };

  // Handle referral tracking when user signs up
  const handleReferralTracking = async () => {
    const referralId = getReferralIdFromUrl();
    if (!referralId || !user?.isSignUp) return;

    try {
      // Get the referral document by ID
      const referralDoc = await getReferralById(referralId);
      if (!referralDoc || !referralDoc.accountId) {
        addLog('Invalid referral ID or twitterId', 'error');
        return;
      }

      // Increment referral count
      await incrementReferralCount(referralDoc.id);

      // Update user document with referredById
      await updateUserReferredBy(
        user.uid,
        referralDoc.id,
        referralDoc.uid,
        referralDoc.accountId
      );

      addLog(
        `Successfully tracked referral from ${
          referralDoc.username || referralDoc.email
        }`,
        'success'
      );

      // Clear the ref parameter from URL to prevent duplicate tracking
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Error tracking referral:', error);
      addLog('Failed to track referral', 'error');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 1, sm: 2 },
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
                </Box>
                <Typography
                  variant={isMobile ? 'h4' : 'h3'}
                  sx={{
                    background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    textShadow: '0 0 10px rgba(96, 165, 250, 0.3)',
                    animation: `${neonPulse} 3s infinite`,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                  }}
                >
                  Live Space DJ
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 2 }}
                sx={{
                  alignSelf: { xs: 'center', sm: 'flex-end' },
                  mt: { xs: 1, sm: 0 },
                }}
              >
                {wsStatus === 'connected' && (
                  <Tooltip title={'Disconnect'}>
                    <IconButton
                      onClick={() => connectSocket(wsStatus === 'connected')}
                      sx={{
                        color: wsStatus === 'connected' ? '#4caf50' : '#f44336',
                        '&:hover': { transform: 'scale(1.1)' },
                        transition: 'transform 0.2s',
                        // animation:
                        //   wsStatus === 'connected'
                        //     ? `${pulse} 2s infinite`
                        //     : 'none',
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
                                // animation: `${pulse} 2s infinite`,
                              }
                            : {},
                      }}
                    >
                      <RadioButtonChecked />
                    </IconButton>
                  </Tooltip>
                )}
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

            {/* Main Content Grid */}
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                {/* Space URL Input */}
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

                {/* Sound Board */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <SoundBoard
                    onSoundPlay={(audioUrl) => {
                      addLog(`Playing sound effect`, 'info');
                    }}
                    onSoundStop={() => {
                      addLog(`Stopped sound effect`, 'info');
                    }}
                    socket={socketRef.current}
                    isConnected={wsStatus === 'connected'}
                    isInSpace={isInSpace}
                    userId={user?.uid}
                    onLog={addLog}
                    soundboardFiles={soundboardFiles}
                    onFilesUpdated={fetchUserUploads}
                    soundSlots={soundSlots}
                    setSoundSlots={setSoundSlots}
                  />
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
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1, sm: 2 }}
                    sx={{ width: '100%' }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => connectSocket()}
                      disabled={!spaceUrl || !audioFullPath}
                      size={isMobile ? 'large' : 'large'}
                      sx={{
                        background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #3b82f6, #2563eb)',
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
                        !socketRef.current?.connected ||
                        !isInSpace ||
                        !audioFullPath
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
                  </Stack>
                </Box>

                {/* Emoji Reactions */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <EmojiReactions
                    onEmojiReact={handleEmojiReact}
                    currentEmoji={currentEmoji}
                    isConnected={true}
                    isInSpace={true}
                  />
                </Box>

                {/* Speak Text Section */}
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
                        disabled={
                          !speakText.trim() || !socketRef.current?.connected
                          // !isInSpace
                        }
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
                      // disabled={!socketRef.current?.connected || !isInSpace}
                    />
                  </Paper>
                </Box>

                {/* Referral Section */}
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
                    <Link /> Referral Code
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
                    {isLoadingReferral ? (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="white">
                          Creating referral code...
                        </Typography>
                      </Box>
                    ) : referral ? (
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#60a5fa',
                              mb: 1,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            Your Referral Code:
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'white',
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              letterSpacing: '2px',
                              textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
                            }}
                          >
                            {referral.referralCode}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#60a5fa',
                              mb: 1,
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            Referral URL:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'white',
                              fontFamily: 'monospace',
                              wordBreak: 'break-all',
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              mb: 2,
                            }}
                          >
                            {location.origin}/dj?ref={referral.id}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={copyReferralUrl}
                          size="small"
                          sx={{
                            // background:
                            //   'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            // '&:hover': {
                            //   background:
                            //     'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            // },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          Copy Referral URL
                        </Button>

                        {/* Analytics Row */}
                        {/* <Box
                          sx={{
                            display: 'flex',
                            width: '100%',
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              textAlign: 'center',
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(76, 175, 80, 0.1)',
                              border: '1px solid rgba(76, 175, 80, 0.3)',
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{
                                color: '#4caf50',
                                fontWeight: 'bold',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                mb: 0.5,
                              }}
                            >
                              {referral.referralCount}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#60a5fa',
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                fontWeight: 500,
                              }}
                            >
                              Referrals
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              textAlign: 'center',
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(255, 152, 0, 0.1)',
                              border: '1px solid rgba(255, 152, 0, 0.3)',
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{
                                color: '#ff9800',
                                fontWeight: 'bold',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                mb: 0.5,
                              }}
                            >
                              {referral.playCount}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#60a5fa',
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                fontWeight: 500,
                              }}
                            >
                              Plays
                            </Typography>
                          </Box>
                        </Box> */}
                      </Stack>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="body2"
                          color="white"
                          sx={{ mb: 2 }}
                        >
                          Create your referral code to start inviting others!
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => fetchOrCreateReferral(true)}
                          disabled={!user || isLoadingReferral}
                          sx={{
                            background:
                              'linear-gradient(135deg, #60a5fa, #3b82f6)',
                            '&:hover': {
                              background:
                                'linear-gradient(135deg, #3b82f6, #2563eb)',
                            },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          {isLoadingReferral ? (
                            <>
                              <CircularProgress size={16} sx={{ mr: 1 }} />
                              Creating...
                            </>
                          ) : (
                            'Create Referral Code'
                          )}
                        </Button>
                      </Box>
                    )}
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
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    Activity Log
                  </Typography>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: 2,
                      // maxHeight: '200px',
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
                                    textShadow:
                                      '0 0 5px rgba(96, 165, 250, 0.3)',
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
                                      // animation: `${pulse} 2s infinite`,
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
        {/* <Dialog
          open={!!user && !primaryWallet}
          onClose={() => {}}
          maxWidth="sm"
        >
          <DynamicEmbeddedWidget background="default" style={{ width: 350 }} />
        </Dialog> */}
      </Container>
    </Box>
  );
};

export default MusicAgent;

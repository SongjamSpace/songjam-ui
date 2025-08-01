import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Drawer,
  Avatar,
  Chip,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import ForumIcon from '@mui/icons-material/Forum';
import MessageIcon from '@mui/icons-material/Message';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import DescriptionIcon from '@mui/icons-material/Description';
import CampaignIcon from '@mui/icons-material/Campaign';
import { format } from 'date-fns';
import { LoadingButton } from '@mui/lab';
import DownloadIcon from '@mui/icons-material/Download';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';

import AudiencePanel from './components/SpaceCRM/AudiencePanel';
import ContentStudio from './components/SpaceCRM/ContentStudio';
import {
  subscribeToSpace,
  Segment,
  Space,
  TranscriptionProgress,
} from './services/db/spaces.service';
import { useAuthContext } from './contexts/AuthContext';
import Logo from './components/Logo';
import { AI_MODELS, generateContent } from './services/ai.service';
import { getFullTranscription } from './services/db/spaces.service';
import SegmentsTimeline from './components/SegmentsTimeline';
import AlgoliaSearchTranscription from './components/AlgoliaSearchTranscription';
import { getSpaceAudioDownloadUrl } from './services/db/spaces.service';
import ListenerRetentionChart from './components/SpaceCRM/ListenerRetentionChart';
import type { RetentionContext } from './components/SpaceCRM/ListenerRetentionChart';
import LoginDialog from './components/LoginDialog';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import LoginDisplayBtn from './components/LoginDisplayBtn';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import CampaignList from './components/SpaceCRM/CampaignList';
import ViewersChart from './components/LiveDashboard/ViewersChart';
import { transcribePy } from './services/transcription.service';
import axios from 'axios';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type CRMTab =
  | 'dashboard'
  | 'audience'
  | 'content'
  | 'timeline'
  | 'transcription'
  | 'listenerRetention'
  | 'campaigns';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * SpaceCRM Component
 *
 * This is the main CRM view that extends the existing SpaceDetails component.
 */
const SpaceCRM: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaceId } = useParams<{ spaceId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [space, setSpace] = useState<Space | null>(null);
  const [activeTab, setActiveTab] = useState<CRMTab>('audience');
  const [selectedModel, setSelectedModel] = useState('grok');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const { user, loading } = useAuthContext();
  const { handleLogOut } = useDynamicContext();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [retentionContext, setRetentionContext] =
    useState<RetentionContext | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  // const [isSpaceOwner, setIsSpaceOwner] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const hasUpdatedSpaceStatus = useRef(false);

  // useEffect(() => {
  //   if (user && space) {
  //     setIsSpaceOwner(
  //       [...space.admins, ...space.speakers].some(
  //         (admin) => admin.twitterScreenName === user?.username
  //       ) ||
  //         [
  //           'LHrZ0zGfQ2UnAjkRC8nt36EMmA23',
  //           'M4dxYt7PjCNRcl0erxcpexCtisk2',
  //         ].includes(user.uid || '')
  //     );
  //   }
  // }, [user, space]);

  // Fetch space data on mount
  useEffect(() => {
    if (!spaceId) return;

    const unsubscribe = subscribeToSpace(spaceId, (space) => {
      if (space) {
        const defaultTab = space.isBroadcast ? 'listenerRetention' : 'audience';
        // Only update URL if no tab parameter is already set
        if (!searchParams.get('tab')) {
          setActiveTab(defaultTab);
          setSearchParams({ tab: defaultTab });
        }
        setSpace(space);
        if (space.state !== 'Ended' && !hasUpdatedSpaceStatus.current) {
          hasUpdatedSpaceStatus.current = true;
          try {
            axios.post(
              `${import.meta.env.VITE_JAM_SERVER_URL}/update-space-status`,
              {
                spaceIds: [spaceId],
              }
            );
          } catch (error) {
            console.error('Error updating space status:', error);
          }
        }
      } else {
        toast.error('Space not found');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    });

    return () => unsubscribe();
  }, [spaceId]);

  // Update the useEffect for auto-scrolling
  useEffect(() => {
    if (chatContainerRef.current && chatMessages.length > 0) {
      const container = chatContainerRef.current;

      // Get the last user message
      const userMessages = container.querySelectorAll(
        '.chat-message [data-role="user"]'
      );
      const lastUserMessage =
        userMessages.length > 0
          ? (userMessages[userMessages.length - 1].closest(
              '.chat-message'
            ) as HTMLElement)
          : null;

      if (lastUserMessage) {
        const containerRect = container.getBoundingClientRect();
        const userMessageRect = lastUserMessage.getBoundingClientRect();
        const userMessageTop = userMessageRect.top - containerRect.top;

        // If the user message hasn't reached the top yet (with 20px padding)
        if (userMessageTop > 20) {
          // Calculate exact scroll position needed to show new content
          const scrollAmount = userMessageTop - 20;
          container.scrollBy({
            top: scrollAmount,
            behavior: 'smooth',
          });
        }
        // Once userMessageTop <= 20, we do nothing, letting the message stay at the top
      }
    }
  }, [chatMessages]); // This will trigger on every new chunk of the AI response

  // // Update useEffect to handle dialog visibility when user auth state changes
  useEffect(() => {
    if (user) {
      setShowAuthDialog(false);
    }
  }, [user]);

  // Handle URL search params for activeTab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      [
        'dashboard',
        'audience',
        'content',
        'timeline',
        'transcription',
        'listenerRetention',
        'campaigns',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam as CRMTab);
    }
  }, [searchParams]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: CRMTab) => {
    // const isPro = user?.currentPlan === 'pro';
    // if (
    //   (newValue === 'listenerRetention' || newValue === 'campaigns') &&
    //   !isPro
    // ) {
    //   toast.error('Please upgrade to PRO to access this feature');
    //   return;
    // }
    setActiveTab(newValue);
    setSearchParams({ tab: newValue });
  };

  const handleRetentionContextUpdate = useCallback(
    (context: RetentionContext | null) => {
      setRetentionContext(context);
      console.log('SpaceCRM received retention context:', context);
    },
    []
  );

  const handlePromptSubmit = async () => {
    if (!aiPrompt.trim()) return;
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setIsAiThinking(true);
    setAiError(null);

    const userMessage: ChatMessage = {
      role: 'user',
      content: aiPrompt,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentPrompt = aiPrompt;
    setAiPrompt('');

    try {
      const currentLang = i18n.language;
      let contextString = `You are an AI assistant helping with a Twitter Space.
      Please respond in ${currentLang === 'zh' ? 'Chinese' : 'English'}. 
      User query: ${currentPrompt}
      `;

      if (spaceId) {
        const transcription = await getFullTranscription(spaceId);
        if (transcription) {
          contextString += `\n\n--- Full Space Transcription ---\n${transcription}\n`;
        }
      }

      if (activeTab === 'listenerRetention' && retentionContext) {
        const { averageListenTimeSeconds, chartData } = retentionContext;
        let retentionSummary =
          '\n\n--- Current Listener Retention Analysis ---';
        if (averageListenTimeSeconds !== null) {
          const avgMinutes = Math.floor(averageListenTimeSeconds / 60);
          const avgSeconds = averageListenTimeSeconds % 60;
          retentionSummary += `\nAverage Listener Time: ${avgMinutes} minutes, ${avgSeconds} seconds.`;
        }
        if (chartData && chartData.length > 0) {
          const startCount = chartData[0]?.count ?? 'N/A';
          const endCount = chartData[chartData.length - 1]?.count ?? 'N/A';
          const peakCount = Math.max(...chartData.map((d) => d.count));
          const peakTimeIndex = chartData.findIndex(
            (d) => d.count === peakCount
          );
          const peakTimeLabel = chartData[peakTimeIndex]?.timeLabel ?? 'N/A';

          retentionSummary += `\nListener Count: Started at ${startCount}, peaked at ${peakCount} (around ${peakTimeLabel}), ended at ${endCount}.`;
          const peakJoinCount = Math.max(...chartData.map((d) => d.joinCount));
          const peakLeaveCount = Math.max(
            ...chartData.map((d) => d.leaveCount)
          );
          retentionSummary += `\nPeak activity: Max joins/interval: ${peakJoinCount}, Max leaves/interval: ${peakLeaveCount}.`;
        }
        retentionSummary += `\n\n**Task:** Use this retention data, alongside the full transcript, to answer the user's query about audience engagement over time. Correlate listener count changes (peaks, drops) with events or topics in the transcript.`;
        contextString += retentionSummary;
      }

      let currentResponse = '';
      const response = await generateContent(
        selectedModel,
        currentPrompt,
        contextString,
        (chunk) => {
          currentResponse += chunk;
          setChatMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = currentResponse;
            } else {
              newMessages.push({
                role: 'assistant',
                content: currentResponse,
                timestamp: new Date(),
              });
            }
            return newMessages;
          });
        }
      );

      if (response.error) {
        setAiError(response.error);
      }
    } catch (error: any) {
      setAiError(error.message || 'Failed to generate response');
    } finally {
      setIsAiThinking(false);
    }
  };

  const onDownloadRecording = async () => {
    if (!spaceId) return;
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setIsDownloading(true);
    try {
      const audioUrl = await getSpaceAudioDownloadUrl(spaceId);
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${space?.title || spaceId}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading recording:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        minHeight: '100vh',
        color: 'white',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background:
            'radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.15), rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.1))',
          opacity: 0.7,
          pointerEvents: 'none',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)',
        },
      }}
    >
      {/* Navigation Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            sx={{
              mr: 1,
              display: { xs: 'flex', md: 'none' },
              background: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
            onClick={() => navigate('/')}
          >
            <Logo />
            <Typography
              variant="h6"
              sx={{
                ml: 1,
                display: { xs: 'none', sm: 'block' },
                background:
                  'linear-gradient(135deg, var(--gradient-start) 30%, var(--gradient-middle) 60%, var(--gradient-end) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
              }}
            >
              Songjam
            </Typography>
          </Box>
        </Box>

        <LoginDisplayBtn setShowAuthDialog={setShowAuthDialog} />
      </Box>

      {/* Content wrapper with blur effect for non-authenticated users */}
      <Box>
        {/* Back Button and Space Info Bar */}
        <Box
          sx={{
            p: 2,
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(5px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 64,
            zIndex: 99,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{
                mr: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            {space ? (
              <>
                <Typography variant="h6" sx={{ mr: 2 }}>
                  {space.title}
                </Typography>

                <Chip
                  icon={<HeadphonesIcon />}
                  label={`${space.totalLiveListeners} ${t('listenersLabel')}`}
                  size="small"
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: { xs: 'none', sm: 'flex' },
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                />
                {space.state === 'Ended' &&
                (!space.transcriptionStatus ||
                  space.transcriptionStatus === 'NOT_STARTED' ||
                  space.transcriptionStatus === 'FAILED') ? (
                  <LoadingButton
                    loading={isTranscribing}
                    variant="contained"
                    size="small"
                    startIcon={<AutorenewIcon />}
                    onClick={async () => {
                      if (isTranscribing) return;
                      setIsTranscribing(true);
                      if (!user) {
                        setShowAuthDialog(true);
                        setIsTranscribing(false);
                        return;
                      }
                      if (space.state !== 'Ended') {
                        toast.error(
                          "Space hasn't ended yet, please come back later for Analysis"
                        );
                        setIsTranscribing(false);
                        return;
                      }
                      const projectId =
                        user.defaultProjectId || user.projectIds[0] || '';
                      if (spaceId && projectId) {
                        await transcribePy(space.hlsUrl, spaceId);
                      }
                    }}
                    sx={{
                      ml: 2,
                      background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #3b82f6, #7c3aed)',
                      },
                    }}
                  >
                    Transcribe {space.isBroadcast ? 'Live' : 'Space'}
                  </LoadingButton>
                ) : (
                  space.transcriptionProgress !==
                    TranscriptionProgress.ENDED && (
                    <Chip
                      icon={<CircularProgress size={18} />}
                      label={space.userHelperMessage}
                      variant="filled"
                      sx={{
                        ml: 2,
                      }}
                      deleteIcon={
                        space.state !== 'Ended' ? (
                          <OpenInNewIcon sx={{ mx: 2, width: 16 }} />
                        ) : undefined
                      }
                      onDelete={
                        space.state !== 'Ended'
                          ? () =>
                              window.open(
                                `${window.location.origin}/live/${spaceId}`
                              )
                          : undefined
                      }
                    />
                  )
                )}
              </>
            ) : (
              <CircularProgress size={24} sx={{ mr: 2 }} />
            )}
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: { xs: 'none', md: 'block' },
              background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
            }}
          >
            {t('agenticCRM')}
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            px: 2,
            maxWidth: '1600px',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            filter: showAuthDialog ? 'blur(8px)' : 'none',
            pointerEvents: showAuthDialog ? 'none' : 'auto',
            userSelect: showAuthDialog ? 'none' : 'auto',
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* LEFT PANEL - Navigation (hidden on mobile) */}
            <Grid item md={2} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    borderRight: 1,
                    borderColor: 'divider',
                    mb: 3,
                    '& .MuiTab-root': {
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      pl: 0,
                      minHeight: '48px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)',
                      },
                      '&.Mui-selected': {
                        background:
                          'linear-gradient(90deg, rgba(96, 165, 250, 0.1), rgba(139, 92, 246, 0.1))',
                        color: '#60a5fa',
                      },
                    },
                  }}
                >
                  {/* <Tab
                    icon={<DashboardIcon />}
                    label="Dashboard"
                    value="dashboard"
                  /> */}
                  {space && space.isBroadcast ? (
                    <Tab
                      icon={<PeopleIcon />}
                      label={t('listenerRetentionTab')}
                      value="listenerRetention"
                    />
                  ) : (
                    <Tab
                      icon={<PeopleIcon />}
                      label={t('audienceTab')}
                      value="audience"
                    />
                  )}
                  <Tab
                    disabled={
                      (space?.transcriptionProgress || 0) !==
                      TranscriptionProgress.ENDED
                    }
                    icon={<MessageIcon />}
                    label={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {t('contentTab')}
                        {!space?.transcriptionProgress ? (
                          <Chip
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              background:
                                'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                            }}
                            label={t('Pending', 'Pending')}
                          />
                        ) : (
                          space.transcriptionProgress !==
                            TranscriptionProgress.ENDED && (
                            <Chip
                              size="small"
                              label={
                                space.transcriptionProgress <=
                                TranscriptionProgress.SUMMARIZING
                                  ? t('queuedChip')
                                  : t('analyzingChip')
                              }
                              sx={{
                                height: 16,
                                fontSize: '0.6rem',
                                background:
                                  'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                              }}
                            />
                          )
                        )}
                      </Box>
                    }
                    value="content"
                  />
                  <Tab
                    disabled={
                      (space?.transcriptionProgress || 0) <=
                      TranscriptionProgress.TRANSCRIBING
                    }
                    icon={<ForumIcon />}
                    label={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {t('timelineTab')}
                        {!space?.transcriptionProgress ? (
                          <Chip
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              background:
                                'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                            }}
                            label={t('Pending', 'Pending')}
                          />
                        ) : (
                          space.transcriptionProgress <=
                            TranscriptionProgress.TRANSCRIBING && (
                            <Chip
                              size="small"
                              label={
                                space.transcriptionProgress <=
                                TranscriptionProgress.DOWNLOADING_AUDIO
                                  ? t('queuedChip')
                                  : t('analyzingChip')
                              }
                              sx={{
                                height: 16,
                                fontSize: '0.6rem',
                                background:
                                  'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                              }}
                            />
                          )
                        )}
                      </Box>
                    }
                    value="timeline"
                  />
                  <Tab
                    disabled={
                      (space?.transcriptionProgress || 0) <=
                      TranscriptionProgress.TRANSCRIBING
                    }
                    icon={<DescriptionIcon />}
                    label={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {t('transcriptionTab')}
                        {!space?.transcriptionProgress ? (
                          <Chip
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              background:
                                'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                            }}
                            label={t('Pending', 'Pending')}
                          />
                        ) : (
                          space.transcriptionProgress <=
                            TranscriptionProgress.TRANSCRIBING && (
                            <Chip
                              size="small"
                              label={
                                space.transcriptionProgress <=
                                TranscriptionProgress.DOWNLOADING_AUDIO
                                  ? t('queuedChip')
                                  : t('analyzingChip')
                              }
                              sx={{
                                height: 16,
                                fontSize: '0.6rem',
                                background:
                                  'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                              }}
                            />
                          )
                        )}
                      </Box>
                    }
                    value="transcription"
                  />
                  {space && !space.isBroadcast && (
                    <Tab
                      icon={<InsightsIcon />}
                      label={
                        <Box
                          component="span"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          {t('listenerRetentionTab')}
                          <Chip
                            size="small"
                            label={t('pro')}
                            sx={{
                              ml: 1,
                              height: 16,
                              fontSize: '0.6rem',
                              background:
                                'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                            }}
                          />
                        </Box>
                      }
                      value="listenerRetention"
                    />
                  )}
                  {/* {space?.hasCampaign && ( */}
                  {space && !space.isBroadcast && (
                    <Tab
                      icon={<CampaignIcon />}
                      label={
                        <Box
                          component="span"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          {t('campaignsTab')}
                          <Chip
                            size="small"
                            label={t('pro')}
                            sx={{
                              ml: 1,
                              height: 16,
                              fontSize: '0.6rem',
                              background:
                                'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                            }}
                          />
                        </Box>
                      }
                      value="campaigns"
                    />
                  )}
                  {/* )} */}
                </Tabs>

                {/* TODO: Add campaign creation */}
                {/* {!space?.hasCampaign && (
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mb: 2,
                      background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)',
                      },
                    }}
                    onClick={() => {
                      // TODO: Add campaign creation
                      if (space) {
                        setSpace({
                          ...space,
                          hasCampaign: true,
                        });
                      }
                    }}
                  >
                    {t('createCampaignButton')}
                  </Button>
                )} */}

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <InsightsIcon fontSize="small" />
                  {t('quickStatsTitle')}
                </Typography>
                {space ? (
                  <Box
                    sx={{
                      mb: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      '& .stat-item': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                        },
                      },
                    }}
                  >
                    <Box className="stat-item">
                      <PeopleIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {t('attendeesStat')}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {space.totalLiveListeners}
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="stat-item">
                      <AutorenewIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {t('durationStat')}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {Math.round(
                            (space.endedAt
                              ? new Date(space.endedAt).getTime() -
                                new Date(space.startedAt).getTime()
                              : 0) / 60000
                          )}{' '}
                          {t('minStat')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="stat-item">
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {t('startedAtStat', 'Started at')}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {format(new Date(space.startedAt), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block' }}
                        >
                          {format(new Date(space.startedAt), 'h:mm a')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <CircularProgress
                    size={20}
                    sx={{ my: 2, display: 'block' }}
                  />
                )}
              </Paper>
            </Grid>

            {/* CENTER PANEL - Main Content */}
            <Grid item xs={12} md={7}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {/* Tabs for Mobile */}
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    mb: 3,
                    display: { xs: 'flex', md: 'none' },
                    '& .MuiTab-root': {
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)',
                      },
                      '&.Mui-selected': {
                        background:
                          'linear-gradient(90deg, rgba(96, 165, 250, 0.1), rgba(139, 92, 246, 0.1))',
                        color: '#60a5fa',
                      },
                    },
                  }}
                >
                  {/* <Tab
                    icon={<DashboardIcon />}
                    label="Dashboard"
                    value="dashboard"
                  /> */}
                  {space && !space.isBroadcast && (
                    <Tab icon={<PeopleIcon />} value="audience" />
                  )}
                  {space && space.isBroadcast && (
                    <Tab icon={<InsightsIcon />} value="listenerRetention" />
                  )}
                  <Tab icon={<MessageIcon />} value="content" />
                  <Tab icon={<ForumIcon />} value="timeline" />
                  <Tab icon={<DescriptionIcon />} value="transcription" />
                  {space && !space.isBroadcast && (
                    <Tab
                      icon={<InsightsIcon />}
                      label={t('listenerRetentionTab')}
                      value="listenerRetention"
                    />
                  )}
                  {space && !space.isBroadcast && (
                    <Tab
                      icon={<CampaignIcon />}
                      label={t('campaignsTab')}
                      value="campaigns"
                    />
                  )}
                </Tabs>

                {/* Content based on active tab */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                  }}
                >
                  {/* {activeTab === 'dashboard' && spaceId && (
                    <DashboardPanel space={space} spaceId={spaceId} />
                  )} */}
                  {activeTab === 'audience' && (
                    <AudiencePanel
                      onSelectAttendees={setSelectedAttendees}
                      space={space}
                      isSpaceOwner
                    />
                  )}

                  {activeTab === 'content' && (
                    <ContentStudio
                      onBeforeAction={() => {
                        if (!user) {
                          setShowAuthDialog(true);
                          return false;
                        }
                        return true;
                      }}
                    />
                  )}
                  {activeTab === 'timeline' && spaceId && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('transcriptTimelineTitle')}
                      </Typography>
                      <SegmentsTimeline
                        spaceId={spaceId}
                        hasAccess={true}
                        isProcessingPayment={false}
                        handlePayment={() => {}}
                        processEnded={true}
                        refresh={space?.transcriptionStatus === 'SHORT_ENDED'}
                        lastVisible={lastVisible}
                        setLastVisible={setLastVisible}
                        segments={segments}
                        setSegments={setSegments}
                      />
                    </Box>
                  )}

                  {activeTab === 'transcription' && spaceId && (
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6">
                          {t('fullTranscriptionTitle')}
                        </Typography>
                        <LoadingButton
                          loading={isDownloading}
                          disabled={!space || space.transcriptionProgress !== 6}
                          startIcon={<DownloadIcon />}
                          onClick={onDownloadRecording}
                          sx={{
                            color: '#60a5fa',
                            background: 'rgba(96, 165, 250, 0.1)',
                            '&:hover': {
                              background: 'rgba(96, 165, 250, 0.2)',
                            },
                            textTransform: 'none',
                          }}
                        >
                          {isDownloading
                            ? t('downloadingButton')
                            : t('downloadRecordingButton')}
                        </LoadingButton>
                      </Box>
                      <AlgoliaSearchTranscription
                        spaceId={spaceId}
                        title={space?.title || t('transcriptionTab')}
                        onBeforeAction={() => {
                          if (!user) {
                            setShowAuthDialog(true);
                            return false;
                          }
                          return true;
                        }}
                      />
                    </Box>
                  )}

                  {activeTab === 'listenerRetention' &&
                    space &&
                    !space.isBroadcast && (
                      <ListenerRetentionChart
                        spaceId={spaceId}
                        startedAt={space?.startedAt}
                        endedAt={space?.endedAt}
                        onContextUpdate={handleRetentionContextUpdate}
                      />
                    )}
                  {activeTab === 'listenerRetention' &&
                    space &&
                    space.isBroadcast && <ViewersChart broadcast={space} />}

                  {activeTab === 'campaigns' && spaceId && (
                    <CampaignList spaceId={spaceId} space={space} />
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* RIGHT PANEL - AI Assistant */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  maxHeight: 'calc(100vh - 180px)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                  }}
                >
                  {t('aiAssistantTitle')}
                </Typography>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>{t('selectModelLabel')}</InputLabel>
                  <Select
                    value={selectedModel}
                    label={t('selectModelLabel')}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#60a5fa',
                      },
                    }}
                  >
                    {AI_MODELS.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box
                  sx={{
                    flex: 1,
                    mb: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 1,
                    p: 2,
                    overflowY: 'auto',
                    minHeight: 0,
                    maxHeight: 'calc(100vh - 400px)',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                  }}
                  ref={chatContainerRef}
                >
                  {aiError ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {aiError}
                    </Alert>
                  ) : chatMessages.length > 0 ? (
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      {chatMessages.map((message, index) => (
                        <Box
                          key={index}
                          className="chat-message"
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            alignItems:
                              message.role === 'user'
                                ? 'flex-end'
                                : 'flex-start',
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '85%',
                              p: 1.5,
                              borderRadius: 2,
                              background:
                                message.role === 'user'
                                  ? 'rgba(96, 165, 250, 0.1)'
                                  : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${
                                message.role === 'user'
                                  ? 'rgba(96, 165, 250, 0.2)'
                                  : 'rgba(255, 255, 255, 0.1)'
                              }`,
                            }}
                            data-role={message.role}
                          >
                            {message.role === 'user' ? (
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: 'pre-wrap' }}
                              >
                                {message.content}
                              </Typography>
                            ) : (
                              <Box
                                sx={{
                                  '& .markdown-body': {
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.6,
                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                      color: '#60a5fa',
                                      marginTop: '1.5em',
                                      marginBottom: '0.5em',
                                      fontWeight: 600,
                                    },
                                    '& h1': { fontSize: '1.5em' },
                                    '& h2': { fontSize: '1.3em' },
                                    '& h3': { fontSize: '1.2em' },
                                    '& p': {
                                      marginBottom: '1em',
                                    },
                                    '& ul, & ol': {
                                      paddingLeft: '1.5em',
                                      marginBottom: '1em',
                                    },
                                    '& li': {
                                      marginBottom: '0.5em',
                                    },
                                    '& code': {
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      padding: '0.2em 0.4em',
                                      borderRadius: '0.25em',
                                      fontFamily: 'monospace',
                                    },
                                    '& pre': {
                                      background: 'rgba(0, 0, 0, 0.2)',
                                      padding: '1em',
                                      borderRadius: '0.5em',
                                      overflowX: 'auto',
                                      marginBottom: '1em',
                                      '& code': {
                                        background: 'none',
                                        padding: 0,
                                      },
                                    },
                                    '& blockquote': {
                                      borderLeft: '3px solid #60a5fa',
                                      margin: '1em 0',
                                      paddingLeft: '1em',
                                      color: 'rgba(255, 255, 255, 0.7)',
                                    },
                                    '& a': {
                                      color: '#60a5fa',
                                      textDecoration: 'none',
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
                                    },
                                    '& table': {
                                      borderCollapse: 'collapse',
                                      width: '100%',
                                      marginBottom: '1em',
                                    },
                                    '& th, & td': {
                                      border:
                                        '1px solid rgba(255, 255, 255, 0.1)',
                                      padding: '0.5em',
                                      textAlign: 'left',
                                    },
                                    '& th': {
                                      background: 'rgba(255, 255, 255, 0.05)',
                                    },
                                  },
                                }}
                              >
                                <div className="markdown-body">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              </Box>
                            )}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              px: 1,
                            }}
                          >
                            {format(message.timestamp, 'h:mm a')}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : isAiThinking ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        {t('thinkingAI')}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                    >
                      {t('askAnythingAI')}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    mt: 'auto',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                    p: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t('aiPlaceholder')}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={
                      isAiThinking ||
                      (space?.transcriptionProgress || 0) !==
                        TranscriptionProgress.ENDED
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        aiPrompt.trim() &&
                        !isAiThinking
                      ) {
                        e.preventDefault();
                        handlePromptSubmit();
                      }
                    }}
                    sx={{
                      mr: 1,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#60a5fa',
                        },
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handlePromptSubmit}
                    disabled={isAiThinking || !aiPrompt.trim()}
                    sx={{
                      bgcolor: 'rgba(96, 165, 250, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(96, 165, 250, 0.3)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {t('quickActionsTitle')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      disabled={
                        (space?.transcriptionProgress || 0) !==
                        TranscriptionProgress.ENDED
                      }
                      label={t('summarizeSpaceChip')}
                      size="small"
                      onClick={() => {
                        setAiPrompt(t('summarizeSpaceChip'));
                        handlePromptSubmit();
                      }}
                      icon={<AutorenewIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    />
                    <Chip
                      disabled={
                        (space?.transcriptionProgress || 0) !==
                        TranscriptionProgress.ENDED
                      }
                      label={t('createThreadChip')}
                      size="small"
                      onClick={() => {
                        setAiPrompt(t('createThreadChip'));
                        handlePromptSubmit();
                      }}
                      icon={<ForumIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    />
                    <Chip
                      disabled={
                        (space?.transcriptionProgress || 0) !==
                        TranscriptionProgress.ENDED
                      }
                      label={t('engagementIdeasChip')}
                      size="small"
                      onClick={() => {
                        setAiPrompt(t('engagementIdeasChip'));
                        handlePromptSubmit();
                      }}
                      icon={<MessageIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          PaperProps={{
            sx: {
              width: '75%',
              maxWidth: 280,
              background: '#1e293b',
              color: 'white',
              borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                {t('mobileSidebarTitle')}
              </Typography>
              <IconButton onClick={() => setIsMobileSidebarOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(e, val) => {
                handleTabChange(e, val);
                setIsMobileSidebarOpen(false);
              }}
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                mb: 3,
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  pl: 0,
                  minHeight: '48px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                  '&.Mui-selected': {
                    background:
                      'linear-gradient(90deg, rgba(96, 165, 250, 0.1), rgba(139, 92, 246, 0.1))',
                    color: '#60a5fa',
                  },
                },
              }}
            >
              {space && !space.isBroadcast && (
                <Tab
                  icon={<PeopleIcon />}
                  label={t('audienceTab')}
                  value="audience"
                />
              )}
              {space && space.isBroadcast && (
                <Tab icon={<InsightsIcon />} value="listenerRetention" />
              )}
              <Tab
                icon={<MessageIcon />}
                label={t('contentTab')}
                value="content"
              />
              <Tab
                icon={<ForumIcon />}
                label={t('timelineTab')}
                value="timeline"
              />
              <Tab
                icon={<DescriptionIcon />}
                label={t('transcriptionTab')}
                value="transcription"
              />
              {space && !space.isBroadcast && (
                <Tab
                  icon={<InsightsIcon />}
                  label={t('listenerRetentionTab')}
                  value="listenerRetention"
                />
              )}
              {space && !space.isBroadcast && (
                <Tab
                  icon={<CampaignIcon />}
                  label={t('campaignsTab')}
                  value="campaigns"
                />
              )}
            </Tabs>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('aiAssistantTitle')}
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>{t('selectModelLabel')}</InputLabel>
              <Select
                value={selectedModel}
                label={t('selectModelLabel')}
                onChange={(e) => setSelectedModel(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#60a5fa',
                  },
                }}
              >
                {AI_MODELS.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              placeholder={t('aiPlaceholder')}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  aiPrompt.trim() &&
                  !isAiThinking
                ) {
                  e.preventDefault();
                  handlePromptSubmit();
                }
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#60a5fa',
                  },
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handlePromptSubmit}
              disabled={isAiThinking || !aiPrompt.trim()}
              sx={{
                mb: 2,
                background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)',
                },
              }}
            >
              {isAiThinking ? t('thinkingAI') : t('askAIButton')}
            </Button>
          </Box>
        </Drawer>

        {/* Authentication Dialog */}
        <LoginDialog
          open={showAuthDialog && !loading}
          onClose={() => setShowAuthDialog(false)}
        />
      </Box>
      <Toaster position="bottom-right" />
    </Box>
  );
};

export default SpaceCRM;

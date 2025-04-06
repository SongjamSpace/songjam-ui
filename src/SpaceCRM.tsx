import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
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
import { format } from 'date-fns';
import { LoadingButton } from '@mui/lab';
import DownloadIcon from '@mui/icons-material/Download';
import i18n from './i18n';
import { useTranslation } from 'react-i18next';

import AudiencePanel from './components/SpaceCRM/AudiencePanel';
import ContentStudio from './components/SpaceCRM/ContentStudio';
import { getSpace, Space, TranscriptionProgress } from './services/db/spaces.service';
import { useAuthContext } from './contexts/AuthContext';
import Logo from './components/Logo';
import TwitterLogin from './components/TwitterLogin';
import { AI_MODELS, generateContent } from './services/ai.service';
import { getFullTranscription } from './services/db/spaces.service';
import SpaceAnalysis from './components/SpaceCRM/SpaceAnalysis';
import SegmentsTimeline from './components/SegmentsTimeline';
import AlgoliaSearchTranscription from './components/AlgoliaSearchTranscription';
import { getSpaceAudioDownloadUrl } from './services/db/spaces.service';

type CRMTab =
  | 'dashboard'
  | 'audience'
  | 'content'
  | 'timeline'
  | 'transcription'
  | 'analysis';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VisualizationContext {
  type: 'space_analysis_context';
  space: {
    id: string;
    title: string;
    speakers: { id: string; name: string; handle: string }[];
  };
  analysis: {
    interactions: any[];
    topics: any[];
    currentConfig: any;
    visualMetrics: {
      totalNodes: number;
      totalEdges: number;
      mostActiveNode?: [string, number];
      averageInteractions: number;
      topicCount: number;
    };
  };
  suggestions: string[];
  visualState: {
    nodes: any[];
    edges: any[];
  };
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
  const [space, setSpace] = useState<Space | null>(null);
  const [activeTab, setActiveTab] = useState<CRMTab>('audience');
  const [selectedModel, setSelectedModel] = useState('grok');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [analysisContext, setAnalysisContext] =
    useState<VisualizationContext | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(!user);

  // Fetch space data on mount
  useEffect(() => {
    if (!spaceId) return;

    const fetchSpace = async () => {
      const space = await getSpace(spaceId, (space) => {
        setSpace(space);
      });
      setSpace(space);
    };

    fetchSpace();
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

  // Update useEffect to handle dialog visibility when user auth state changes
  useEffect(() => {
    setShowAuthDialog(!user);
  }, [user]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: CRMTab) => {
    setActiveTab(newValue);
  };

  const handleModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedModel(event.target.value as string);
  };

  const handleContextUpdate = useCallback((context: VisualizationContext) => {
    setAnalysisContext(context);
    console.log('SpaceCRM received analysis context:', context);
  }, []);

  const handlePromptSubmit = async () => {
    if (!aiPrompt.trim()) return;

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

      if (activeTab === 'analysis' && analysisContext) {
        contextString += `\n\n--- Current Space Analysis Visualization Context ---
This section provides structured data about the speaker interaction analysis currently displayed:
${JSON.stringify(analysisContext, null, 2)}

**Task:** When answering the user's query about the analysis, please **cross-reference** the information above with the provided **Full Space Transcription**. For example, if discussing an interaction metric (like count or sentiment) from the context, try to find and mention specific exchanges or moments in the transcription that support that data point. Correlate visual patterns (like active speakers or strong connections) with actual dialogue.
`;
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
      console.error("Error downloading recording:", error);
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
                background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
              }}
            >
              Songjam
            </Typography>
          </Box>
        </Box>

          <TwitterLogin />
      </Box>

      {/* Content wrapper with blur effect for non-authenticated users */}
      <Box
      >
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
              onClick={() => navigate('/')}
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
                {space.transcriptionProgress !== TranscriptionProgress.ENDED && 
                <Chip
                  icon={<CircularProgress size={14} />}
                  label={space.userHelperMessage}
                  variant="filled"
                  size="small"
                  sx={{
                    ml: 2,
                  }}
                />}
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
          filter: !user ? 'blur(8px)' : 'none',
          pointerEvents: !user ? 'none' : 'auto',
          userSelect: !user ? 'none' : 'auto',
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
                  <Tab icon={<PeopleIcon />} label={t('audienceTab')} value="audience" />
                  <Tab 
                    disabled={(space?.transcriptionProgress || 0) !== TranscriptionProgress.ENDED}
                    icon={<MessageIcon />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {t('contentTab')}
                        {(space?.transcriptionProgress || 0) !== TranscriptionProgress.ENDED && (
                          <Chip
                            size="small"
                            label={(space?.transcriptionProgress || 0) <= TranscriptionProgress.SUMMARIZING ? t('queuedChip') : t('analyzingChip')}
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                            }}
                          />
                        )}
                      </Box>
                    }
                    value="content"
                  />
                  <Tab
                    disabled={(space?.transcriptionProgress || 0) <= TranscriptionProgress.TRANSCRIBING}
                    icon={<ForumIcon />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {t('timelineTab')}
                        {(space?.transcriptionProgress || 0) <= TranscriptionProgress.TRANSCRIBING && (
                          <Chip
                            size="small"
                            label={(space?.transcriptionProgress || 0) <= TranscriptionProgress.DOWNLOADING_AUDIO ? t('queuedChip') : t('analyzingChip')}
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                            }}
                          />
                        )}
                      </Box>
                    }
                    value="timeline"
                  />
                  <Tab
                    disabled={(space?.transcriptionProgress || 0) <= TranscriptionProgress.TRANSCRIBING}
                    icon={<DescriptionIcon />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {t('transcriptionTab')}
                        {(space?.transcriptionProgress || 0) <= TranscriptionProgress.TRANSCRIBING && (
                          <Chip
                            size="small"
                            label={(space?.transcriptionProgress || 0) <= TranscriptionProgress.DOWNLOADING_AUDIO ? t('queuedChip') : t('analyzingChip')}
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                            }}  
                          />
                        )}
                      </Box>
                    }
                    value="transcription"
                  />
                  <Tab
                    disabled={(space?.transcriptionProgress || 0) !== TranscriptionProgress.ENDED}
                    icon={<InsightsIcon />}
                    label={
                      <Box
                        component="span"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        {t('analysisTab')}
                        <Chip
                          size="small"
                          label={t('betaChip')}
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
                    value="analysis"
                  />
                </Tabs>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('quickStatsTitle')}
                </Typography>
                {space ? (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      {t('attendeesStat')}: {space.totalLiveListeners}
                    </Typography>
                    <Typography variant="body2">
                      {t('durationStat')}:{' '}
                      {Math.round(
                        (space.endedAt
                          ? new Date(space.endedAt).getTime() -
                            new Date(space.startedAt).getTime()
                          : 0) / 60000
                      )}{' '}
                      {t('minStat')}
                    </Typography>
                    {/* <Typography variant="body2">
                      Selected: {selectedAttendees.length}
                    </Typography> */}
                  </Box>
                ) : (
                  <CircularProgress size={20} sx={{ my: 2, display: 'block' }} />
                )}

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
                >
                  {t('createCampaignButton')}
                </Button>
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
                  <Tab icon={<PeopleIcon />} value="audience" />
                  <Tab icon={<MessageIcon />} value="content" />
                  <Tab icon={<ForumIcon />} value="timeline" />
                  <Tab icon={<DescriptionIcon />} value="transcription" />
                  <Tab icon={<InsightsIcon />} value="analysis" />
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
                    />
                  )}

                  {activeTab === 'content' && <ContentStudio />}

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
                         processEnded={space?.transcriptionStatus === 'ENDED'}
                         refresh={space?.transcriptionStatus === 'SHORT_ENDED'}
                      />
                    </Box>
                  )}

                  {activeTab === 'transcription' && spaceId && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          {t('fullTranscriptionTitle')}
                        </Typography>
                        <LoadingButton
                          loading={isDownloading}
                          disabled={!space || space.transcriptionStatus !== 'ENDED'}
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
                          {isDownloading ? t('downloadingButton') : t('downloadRecordingButton')}
                        </LoadingButton>
                      </Box>
                      <AlgoliaSearchTranscription 
                        spaceId={spaceId} 
                        title={space?.title || t('transcriptionTab')} 
                      />
                    </Box>
                  )}

                  {activeTab === 'analysis' && (
                    <SpaceAnalysis
                      space={space}
                      onContextUpdate={handleContextUpdate}
                    />
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* RIGHT PANEL - AI Assistant */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ display: { xs: 'none', md: 'block'} }}
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
                              message.role === 'user' ? 'flex-end' : 'flex-start',
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
                    disabled={isAiThinking || (space?.transcriptionProgress || 0) !== TranscriptionProgress.ENDED}
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
                      disabled={(space?.transcriptionProgress || 0) !== TranscriptionProgress.ENDED}
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
                      disabled={(space?.transcriptionProgress || 0) !== TranscriptionProgress.ENDED}
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
                      disabled={(space?.transcriptionProgress || 0) !== TranscriptionProgress.ENDED}
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
              {/* <Tab icon={<DashboardIcon />} label="Dashboard" value="dashboard" /> */}
              <Tab icon={<PeopleIcon />} label={t('audienceTab')} value="audience" />
              <Tab icon={<MessageIcon />} label={t('contentTab')} value="content" />
              <Tab icon={<ForumIcon />} label={t('timelineTab')} value="timeline" />
              <Tab icon={<DescriptionIcon />} label={t('transcriptionTab')} value="transcription" />
              <Tab icon={<InsightsIcon />} label={t('analysisTab')} value="analysis" />
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
        <Dialog
          open={showAuthDialog}
          PaperProps={{
            sx: {
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              minWidth: { xs: '90%', sm: 400 },
              maxWidth: 400,
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: 'center',
              background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
            }}
          >
            {t('authDialogTitle')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                mb: 3,
              }}
            >
              {t('authDialogText')}
            </DialogContentText>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <TwitterLogin />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SpaceCRM;

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  getSpaceListeners,
  SpaceListener,
} from '../../services/db/spaces.service';
import { AI_MODELS, generateContent } from '../../services/ai.service';

interface Listener {
  id: string;
  username: string;
  name: string;
  joinedAt: Date;
  leftAt: Date;
  bio?: string;
  topTweets?: any[];
}

interface Campaign {
  id: string;
  ctaType: 'follow' | 'space';
  ctaTarget: string;
  status: 'draft' | 'generating' | 'ready' | 'sending' | 'completed';
  messages: {
    [userId: string]: {
      content: string;
      status: 'pending' | 'generating' | 'ready' | 'sent' | 'failed';
    };
  };
}

const CampaignManager: React.FC<{
  spaceId: string;
  space: any;
}> = ({ spaceId, space }) => {
  const { t } = useTranslation();
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoadingListeners, setIsLoadingListeners] = useState(false);
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  const [error, setError] = useState<string | null>(null);
  const [selectedListeners, setSelectedListeners] = useState<string[]>([]);
  const [ctaType, setCtaType] = useState<'follow' | 'space'>('follow');
  const [ctaTarget, setCtaTarget] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (spaceId) {
      fetchListenersAndProfiles();
    }
  }, [spaceId]);

  const fetchUserProfile = async (username: string) => {
    try {
      const response = await axios.post(
        'https://api.songjam.space/get-user-profile',
        { userName: username }
      );
      if (response.data?.profile?.biography) {
        return response.data.profile.biography;
      } else {
        console.warn(`Bio not found for user ${username} in API response.`);
        return null;
      }
    } catch (err: any) {
      let errorMessage = `Failed to fetch profile for ${username}.`;
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMessage += ` Status: ${err.response.status}. Data: ${JSON.stringify(err.response.data)}`;
          if (err.response.status === 429) {
            errorMessage += ` (Rate limit likely exceeded)`;
          }
        } else if (err.request) {
          errorMessage += ` No response received from server.`;
        } else {
          errorMessage += ` Error setting up request: ${err.message}`;
        }
      } else {
        errorMessage += ` Error: ${err.message}`;
      }
      console.error(errorMessage);
      return null;
    }
  };

  const fetchListenersAndProfiles = async () => {
    setIsLoadingListeners(true);
    setError(null);
    try {
      const rawListeners = await getSpaceListeners(spaceId);
      const listenersWithProfiles = await Promise.all(
        rawListeners.map(async (listener: SpaceListener) => {
          const bio = await fetchUserProfile(listener.twitterScreenName);
          const joinedAtDate = new Date(listener.joinedAt); // Convert Firestore timestamp
          
          // Determine the correct leave time:
          // 1. Use listener.leftAt if available
          // 2. Fallback to space.endedAt if available
          // 3. Fallback to joinedAt if neither is available (results in 0 duration)
          const leftAtTimestampSeconds = listener.leftAt ?? space?.endedAt;
          const leftAtDate = leftAtTimestampSeconds 
                               ? new Date(leftAtTimestampSeconds) 
                               : joinedAtDate; // Fallback to joinedAtDate

          return {
            id: listener.userId,
            username: listener.twitterScreenName,
            name: listener.displayName,
            joinedAt: joinedAtDate, 
            leftAt: leftAtDate,
            bio: bio || undefined, // Use fetched bio or undefined
          };
        })
      );
      setListeners(listenersWithProfiles);
    } catch (err: any) {
      console.error('Error fetching listeners or profiles:', err);
      setError(t('errorFetchingListeners')); // Use translation key
    } finally {
      setIsLoadingListeners(false);
    }
  };

  const handleCreateCampaign = () => {
    if (!ctaTarget.trim()) {
      setError('Please provide a CTA target');
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      ctaType,
      ctaTarget,
      status: 'draft',
      messages: {},
    };

    setCampaign(newCampaign);
  };

  const handleGenerateMessages = async () => {
    if (!campaign || !listeners.length) return;

    setCampaign({ ...campaign, status: 'generating', messages: {} });
    setIsGeneratingMessages(true);
    setIsPaused(false);
    setError(null);

    try {
      for (const listener of listeners) {
        while (isPausedRef.current) {
          setCampaign((prevCampaign) => prevCampaign ? { ...prevCampaign, status: 'generating' } : null);
          console.log('Generation paused...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        setCampaign((prevCampaign) => {
          if (!prevCampaign) return prevCampaign;
          return {
            ...prevCampaign,
            messages: {
              ...prevCampaign.messages,
              [listener.id]: { content: '', status: 'pending' },
            },
          };
        });

        const currentLang = t('currentLangCode');
        const joinTime = format(listener.joinedAt, 'h:mm a');
        const leaveTime = format(listener.leftAt, 'h:mm a');
        debugger
        const duration = Math.round((listener.leftAt.getTime() - listener.joinedAt.getTime()) / 60000);

        let ctaInstruction = '';
        if (campaign.ctaType === 'follow') {
          ctaInstruction = `The goal is to encourage them to follow this account: ${campaign.ctaTarget}.`;
        } else {
          ctaInstruction = `The goal is to inform them about a future space: ${campaign.ctaTarget}.`;
        }

        const prompt = `Generate a short, snappy, personalized Twitter DM for ${listener.name} (@${listener.username}).

Context:
- They listened to our Twitter Space from ${joinTime} to ${leaveTime} (duration: ${duration} minutes).
- Their Twitter bio: "${listener.bio || 'Not available'}"
- The Space Title: ${space?.title || 'Our recent discussion'}
- Language: Respond in ${currentLang === 'zh' ? 'Chinese' : 'English'}.

Instructions:
- Keep it brief and engaging (1-2 sentences).
- Reference their listening time OR something specific from their bio to personalize it.
- ${ctaInstruction}
- End with a friendly closing like "Let's connect!" or "Hope to see you there!" or similar.
- Output only the DM text, nothing else.`;

        try {
          let generatedDm = '';
          await generateContent(selectedModel, prompt, '', (chunk) => {
            generatedDm += chunk;
            setCampaign((prevCampaign) => {
                if (!prevCampaign || !prevCampaign.messages[listener.id]) return prevCampaign;
                return {
                    ...prevCampaign,
                    messages: {
                        ...prevCampaign.messages,
                        [listener.id]: { ...prevCampaign.messages[listener.id], content: generatedDm },
                    },
                };
            });
          });

          setCampaign((prevCampaign) => {
            if (!prevCampaign || !prevCampaign.messages[listener.id]) return prevCampaign;
            return {
                ...prevCampaign,
                messages: {
                    ...prevCampaign.messages,
                    [listener.id]: { content: generatedDm.trim(), status: 'ready' },
                },
            };
           });

        } catch (genError: any) {
          console.error(`Error generating DM for ${listener.username}:`, genError);
          setCampaign((prevCampaign) => {
            if (!prevCampaign) return prevCampaign;
            return {
              ...prevCampaign,
              messages: {
                ...prevCampaign.messages,
                [listener.id]: {
                  content: t('errorGeneratingDm'),
                  status: 'failed',
                },
              },
            };
          });
        }
      }
      setCampaign((prevCampaign) => {
            if (!prevCampaign) return prevCampaign;
            const allProcessed = Object.values(prevCampaign.messages).every(m => m.status === 'ready' || m.status === 'failed');
            return {
                ...prevCampaign,
                status: allProcessed ? 'ready' : 'generating',
            };
       });

    } catch (loopError) {
        console.error("Error in message generation loop:", loopError);
        setError(t('errorGeneratingDmsGeneral'));
        setCampaign((prevCampaign) => prevCampaign ? { ...prevCampaign, status: 'draft' } : null);
    } finally {
      setIsGeneratingMessages(false);
      setIsPaused(false);
    }
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleSendMessages = async () => {
    if (!campaign || campaign.status !== 'ready') return;

    setCampaign({ ...campaign, status: 'sending' });

    const messageEntries = Object.entries(campaign.messages).filter(([, msg]) => msg.status === 'ready');

    for (const [listenerId, message] of messageEntries) {
       console.log(`Simulating sending DM to ${listenerId}: ${message.content}`);
       await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        setCampaign(prev => {
            if (!prev || !prev.messages[listenerId]) return prev;
            return {
                ...prev,
                messages: {
                    ...prev.messages,
                    [listenerId]: {
                        ...prev.messages[listenerId],
                        status: 'sent',
                    },
                },
            };
        });
    }

    setCampaign(prev => {
        if (!prev) return prev;
         const allSent = Object.values(prev.messages).every(m => m.status === 'sent' || m.status === 'failed');
        return { ...prev, status: allSent ? 'completed' : 'sending' };
    });
  };

  const handleEditMessage = (listenerId: string) => {
    if (!campaign || !campaign.messages[listenerId]) return;
    setEditingMessageId(listenerId);
    setEditedContent(campaign.messages[listenerId].content);
  };

  const handleSaveEdit = () => {
    if (!campaign || editingMessageId === null) return;

    setCampaign((prev) => {
      if (!prev || !prev.messages[editingMessageId]) return prev;
      return {
        ...prev,
        messages: {
          ...prev.messages,
          [editingMessageId]: {
            ...prev.messages[editingMessageId],
            content: editedContent,
          },
        },
      };
    });
    setEditingMessageId(null);
    setEditedContent('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {isLoadingListeners && <CircularProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClick={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!campaign ? (
        <Paper sx={{ p: 3, mb: 3, background: 'rgba(255, 255, 255, 0.03)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('createCampaignTitle')}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('ctaTypeLabel')}</InputLabel>
                <Select
                  value={ctaType}
                  label={t('ctaTypeLabel')}
                  onChange={(e) => setCtaType(e.target.value as 'follow' | 'space')}
                >
                  <MenuItem value="follow">{t('followAccount')}</MenuItem>
                  <MenuItem value="space">{t('futureSpace')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={ctaType === 'follow' ? t('accountToFollow') : t('spaceDetails')}
                value={ctaTarget}
                onChange={(e) => setCtaTarget(e.target.value)}
                placeholder={ctaType === 'follow' ? '@username' : t('spaceDetailsPlaceholder')}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={handleCreateCampaign}
            sx={{ mt: 3 }}
            disabled={!ctaTarget.trim() || isLoadingListeners}
          >
            {t('setupCampaignButton')}
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3, background: 'rgba(255, 255, 255, 0.03)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {t('campaignDetails')}
              </Typography>
              <Chip
                label={t(campaign.status)}
                color={
                  campaign.status === 'completed' ? 'success' :
                  campaign.status === 'sending' ? 'warning' :
                  campaign.status === 'ready' ? 'primary' :
                  'default'
                }
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('ctaType')}
                </Typography>
                <Typography variant="body1">
                  {ctaType === 'follow' ? t('followAccount') : t('futureSpace')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('target')}
                </Typography>
                <Typography variant="body1">
                  {ctaTarget}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>{t('selectAiModelLabel')}</InputLabel>
                  <Select
                    value={selectedModel}
                    label={t('selectAiModelLabel')}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={campaign.status === 'generating' || campaign.status === 'sending' || campaign.status === 'completed'}
                  >
                    {AI_MODELS.map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {(campaign.status === 'draft' || campaign.status === 'ready') && listeners.length > 0 && (
                <Button
                  variant="contained"
                  onClick={handleGenerateMessages}
                  startIcon={isGeneratingMessages ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  disabled={isGeneratingMessages || campaign.status === 'sending' || campaign.status === 'completed'}
                  sx={{
                    background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)',
                    },
                  }}
                >
                  {isGeneratingMessages ? t('generatingMessages') : t('generateMessages')}
                </Button>
              )}
              {isGeneratingMessages && (
                  <Button
                     variant="outlined"
                     onClick={handleTogglePause}
                     sx={{ 
                         borderColor: isPaused ? '#facc15' : '#f87171', 
                         color: isPaused ? '#facc15' : '#f87171',
                         '&:hover': {
                             background: isPaused ? 'rgba(250, 204, 21, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                             borderColor: isPaused ? '#facc15' : '#f87171',
                         },
                     }}
                  >
                     {isPaused ? t('resumeButton') : t('pauseButton')}
                  </Button>
              )}
              {campaign.status === 'ready' && Object.values(campaign.messages).some(m => m.status === 'ready') && (
                <Button
                  variant="outlined"
                  onClick={handleSendMessages}
                  startIcon={campaign.status === 'sending' ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  disabled={isGeneratingMessages || campaign.status !== 'ready'}
                   sx={{
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    '&:hover': {
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderColor: '#8b5cf6',
                    },
                  }}
                >
                  {campaign.status === 'sending' ? t('sendingMessages') : t('sendMessages')}
                </Button>
              )}
            </Box>
          </Paper>

          {isGeneratingMessages && (
              <Typography sx={{mb: 2, textAlign: 'center', fontStyle: 'italic'}}>
                  {isPaused ? t('generationPaused') : t('generatingInProgress')}
              </Typography>
          )}

          <Grid container spacing={3}>
            {listeners.map((listener) => {
              const message = campaign.messages[listener.id];
              const isEditing = editingMessageId === listener.id;

              return (
              <Grid item xs={12} md={6} key={listener.id}>
                 <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{listener.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{listener.username}
                        </Typography>
                      </Box>
                    </Box>

                    {listener.bio && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {listener.bio}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<TimerIcon />}
                        label={`Joined: ${format(listener.joinedAt, 'h:mm a')}`}
                        size="small"
                      />
                      <Chip
                        icon={<TimerIcon />}
                        label={`Left: ${format(listener.leftAt, 'h:mm a')}`}
                        size="small"
                      />
                    </Box>

                    {message && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('generatedDmLabel')}
                        </Typography>
                        {isEditing ? (
                           <Box>
                             <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                sx={{ mb: 1 }}
                              />
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button size="small" variant="contained" onClick={handleSaveEdit} startIcon={<CheckIcon />}>{t('saveButton')}</Button>
                                  <Button size="small" variant="outlined" onClick={handleCancelEdit} startIcon={<CloseIcon />}>{t('cancelButton')}</Button>
                              </Box>
                            </Box>
                        ) : (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              bgcolor: message.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.2)',
                              borderColor: message.status === 'failed' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                              position: 'relative',
                              transition: 'background-color 0.3s ease',
                              minHeight: '80px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                             <Typography variant="body1" sx={{ flexGrow: 1, whiteSpace: 'pre-wrap' }}>
                               {message.status === 'pending' && !message.content ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CircularProgress size={16} sx={{ mr: 1 }} /> {t('generatingDmPlaceholder')}
                                </Box>
                               ) : (
                                 message.content
                               )}
                             </Typography>
                             <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                               {message.status === 'ready' && (
                                 <Tooltip title={t('editMessageTooltip')}>
                                     <IconButton size="small" onClick={() => handleEditMessage(listener.id)} disabled={campaign.status === 'generating' || campaign.status === 'sending' || campaign.status === 'completed'}>
                                        <EditIcon fontSize="inherit" />
                                     </IconButton>
                                 </Tooltip>
                               )}
                               {message.status === 'sent' && (
                                <Tooltip title={t('messageSent')}>
                                   <CheckIcon color="success" fontSize="small" />
                                 </Tooltip>
                               )}
                               {message.status === 'pending' && message.content && (
                                 <CircularProgress size={16} />
                               )}
                                {message.status === 'failed' && (
                                 <Tooltip title={message.content}> 
                                   <ErrorIcon color="error" fontSize="small" />
                                 </Tooltip>
                               )}
                             </Box>
                          </Paper>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default CampaignManager; 
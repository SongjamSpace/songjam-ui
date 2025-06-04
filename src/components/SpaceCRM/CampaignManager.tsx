import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Avatar,
  LinearProgress,
  IconButton,
  TextField,
  Stack,
  Button,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBack from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  getSpaceListenersForDm,
  SpaceListener,
} from '../../services/db/spaces.service';
import { AI_MODELS } from '../../services/ai.service';
import { LoadingButton } from '@mui/lab';
import LocationOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import EditIcon from '@mui/icons-material/Edit';
import {
  Campaign,
  CampaignListener,
  updateCampaignListenerMessage,
  subscribeToCampaignMessages,
  deleteCampaignMessageDoc,
} from '../../services/db/campaign.service';
import { TFunction } from 'i18next';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { toast } from 'react-hot-toast';

const CampaignManager: React.FC<{
  spaceId: string;
  campaign: Campaign;
  handleGenerateMessages: (noOfListeners: number) => void;
  handleBack: () => void;
}> = ({ spaceId, campaign, handleGenerateMessages, handleBack }) => {
  const { t } = useTranslation();
  const [listeners, setListeners] = useState<SpaceListener[]>([]);
  const [isLoadingListeners, setIsLoadingListeners] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[1].id);
  // const [activeFilters, setActiveFilters] = useState<{
  //   timeSpent: string | null;
  //   followers: string | null;
  //   verified: boolean | null;
  //   private: boolean | null;
  //   location: string | null;
  // }>({
  //   timeSpent: null,
  //   followers: null,
  //   verified: null,
  //   private: null,
  //   location: null,
  // });
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchListenersAndProfiles = async () => {
    setIsLoadingListeners(true);
    setError(null);
    try {
      const rawListeners = await getSpaceListenersForDm(spaceId);
      setListeners(rawListeners);
    } catch (err: any) {
      console.error('Error fetching listeners or profiles:', err);
      setError(t('errorFetchingListeners')); // Use translation key
    } finally {
      setIsLoadingListeners(false);
    }
  };
  const deleteMessage = async (listenerId: string) => {
    if (campaign.id) {
      await deleteCampaignMessageDoc(campaign.id, listenerId);
    } else {
      toast.error('Campaign ID not found');
    }
  };

  // const handleFilterChange = (
  //   filterType: keyof typeof activeFilters,
  //   value: any
  // ) => {
  //   setActiveFilters((prev) => ({
  //     ...prev,
  //     [filterType]: value,
  //   }));
  // };

  // const filteredListeners = listeners.filter((listener) => {
  //   if (activeFilters.timeSpent) {
  //     const timeSpentMinutes = (listener.timeSpentInMs || 0) / 60000;
  //     if (activeFilters.timeSpent === 'short' && timeSpentMinutes >= 5)
  //       return false;
  //     if (
  //       activeFilters.timeSpent === 'medium' &&
  //       (timeSpentMinutes < 5 || timeSpentMinutes >= 15)
  //     )
  //       return false;
  //     if (activeFilters.timeSpent === 'long' && timeSpentMinutes < 15)
  //       return false;
  //   }

  //   if (activeFilters.followers) {
  //     const followers = listener.followersCount || 0;
  //     if (activeFilters.followers === 'small' && followers >= 1000)
  //       return false;
  //     if (
  //       activeFilters.followers === 'medium' &&
  //       (followers < 1000 || followers >= 10000)
  //     )
  //       return false;
  //     if (activeFilters.followers === 'large' && followers < 10000)
  //       return false;
  //   }

  //   if (
  //     activeFilters.verified !== null &&
  //     listener.isBlueVerified !== activeFilters.verified
  //   )
  //     return false;
  //   if (
  //     activeFilters.private !== null &&
  //     listener.isPrivate !== activeFilters.private
  //   )
  //     return false;
  //   if (activeFilters.location && listener.location !== activeFilters.location)
  //     return false;

  //   return true;
  // });

  useEffect(() => {
    if (spaceId) {
      if (campaign.status === 'DRAFT') {
        fetchListenersAndProfiles();
      }
    }
  }, [spaceId]);

  return (
    <Box sx={{ p: 3 }}>
      {isLoadingListeners && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClick={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 3, mb: 3, background: 'rgba(255, 255, 255, 0.03)' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{t('campaignDetails')}</Typography>
            <Chip
              size="small"
              label={t(campaign.status.toUpperCase())}
              color={
                campaign.status === 'COMPLETED'
                  ? 'success'
                  : campaign.status === 'READY'
                  ? 'primary'
                  : 'default'
              }
            />
          </Box>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              {t('ctaTypeLabel')}
            </Typography>
            <Typography variant="body1">
              {campaign.ctaType === 'follow'
                ? t('followAccount')
                : t('futureSpace')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              {t('target')}
            </Typography>
            <Typography variant="body1">{campaign.ctaTarget}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>{t('selectAiModelLabel')}</InputLabel>
              <Select
                value={selectedModel}
                label={t('selectAiModelLabel')}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled
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
          {campaign.status === 'DRAFT' && (
            <LoadingButton
              variant="contained"
              loading={isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                await handleGenerateMessages(listeners.length);
                setIsGenerating(false);
              }}
              startIcon={<SendIcon />}
              sx={{
                background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)',
                },
              }}
              disabled={listeners.length === 0}
            >
              {t('generateMessagesButton')}
            </LoadingButton>
          )}
        </Box>
      </Paper>

      <Grid container>
        {/* <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={t('allListeners')}
              onClick={() =>
                setActiveFilters({
                  timeSpent: null,
                  followers: null,
                  verified: null,
                  private: null,
                  location: null,
                })
              }
              color={
                Object.values(activeFilters).every((v) => v === null)
                  ? 'primary'
                  : 'default'
              }
              sx={{ mr: 1 }}
            />
            <Chip
              label={t('verified')}
              onClick={() =>
                handleFilterChange('verified', !activeFilters.verified)
              }
              color={activeFilters.verified ? 'primary' : 'default'}
            />
            <Chip
              label={t('private')}
              onClick={() =>
                handleFilterChange('private', !activeFilters.private)
              }
              color={activeFilters.private ? 'primary' : 'default'}
            />
            <Chip
              onClick={() =>
                handleFilterChange(
                  'timeSpent',
                  activeFilters.timeSpent === 'short'
                    ? 'medium'
                    : activeFilters.timeSpent === 'medium'
                    ? 'long'
                    : 'short'
                )
              }
              color={activeFilters.timeSpent ? 'primary' : 'default'}
              label={`${t('timeSpent')}: ${
                activeFilters.timeSpent ? t(activeFilters.timeSpent) : t('all')
              }`}
            />
            <Chip
              onClick={() =>
                handleFilterChange(
                  'followers',
                  activeFilters.followers === 'small'
                    ? 'medium'
                    : activeFilters.followers === 'medium'
                    ? 'large'
                    : 'small'
                )
              }
              color={activeFilters.followers ? 'primary' : 'default'}
              label={`${t('followers')}: ${
                activeFilters.followers ? t(activeFilters.followers) : t('all')
              }`}
            />
            {listeners.some((l) => l.location) && (
              <Chip
                onClick={() =>
                  handleFilterChange(
                    'location',
                    activeFilters.location
                      ? null
                      : listeners.find((l) => l.location)?.location || null
                  )
                }
                color={activeFilters.location ? 'primary' : 'default'}
                label={`${t('location')}: ${
                  activeFilters.location || t('all')
                }`}
              />
            )}
          </Box>
        </Grid> */}
        {campaign.status === 'DRAFT' &&
          listeners.map((listener) => {
            return (
              <Grid item xs={12} md={6} key={listener.userId}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <ListenerCardContent
                      listener={listener}
                      deleteMessage={deleteMessage}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        {listeners.length === 0 && (
          <Stack gap={2}>
            <Typography variant="body2" color="text.secondary">
              No listeners found
            </Typography>
            <Button
              variant="contained"
              onClick={() => fetchListenersAndProfiles()}
            >
              Fetch Listeners
            </Button>
          </Stack>
        )}
        <Box width={'100%'}>
          {campaign.status !== 'DRAFT' && campaign.id && (
            <CampaignListeners
              campaignId={campaign.id}
              campaign={campaign}
              t={t}
              // totalListeners={listeners.length}
            />
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default CampaignManager;

const ListenerCardContent = ({
  listener,
  deleteMessage,
}: {
  listener: SpaceListener;
  deleteMessage: (listenerId: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ mr: 2 }} src={listener.avatarUrl} />
        <Box>
          <Typography variant="body1">{listener.displayName}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              @{listener.twitterScreenName}
            </Typography>
            {listener.isBlueVerified && (
              <VerifiedRoundedIcon
                sx={{ color: '#1c9bef', fontSize: '20px' }}
              />
            )}
            {listener.location && (
              <Box display="flex" alignItems="center" sx={{ ml: 'auto' }}>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <LocationOutlinedIcon
                  sx={{ ml: 1, color: 'text.secondary' }}
                  fontSize="small"
                />
                <Typography variant="body2" color={'text.secondary'}>
                  {listener.location}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <IconButton
          sx={{ ml: 'auto' }}
          size="small"
          onClick={async () => {
            setIsDeleting(true);
            await deleteMessage(listener.userId);
            setIsDeleting(false);
          }}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <CircularProgress size={20} />
          ) : (
            <DeleteIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      {/* {listener.biography && ( */}
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
        title={listener.biography}
      >
        {listener.biography || '-'}
      </Typography>
      {/* )} */}

      {(!!listener.joinedAt || !!listener.leftAt) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {listener.joinedAt && (
            <Chip
              icon={<AccessTimeIcon />}
              label={`Joined: ${format(listener.joinedAt, 'h:mm a')}`}
              size="small"
            />
          )}
          {listener.leftAt && (
            <Chip
              icon={<AccessTimeIcon />}
              label={`Left: ${format(listener.leftAt || new Date(), 'h:mm a')}`}
              size="small"
            />
          )}
        </Box>
      )}
    </>
  );
};
export const CampaignListeners = ({
  campaignId,
  campaign,
  t,
}: {
  campaignId: string;
  campaign: Campaign;
  t: TFunction<'translation', undefined>;
}) => {
  const [messages, setMessages] = useState<CampaignListener[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<CampaignListener[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [editMessage, setEditMessage] = useState<CampaignListener | null>(null);
  const [page, setPage] = useState(1);
  const messagesPerPage = 50;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const deleteMessage = async (listenerId: string) => {
    await deleteCampaignMessageDoc(campaignId, listenerId);
  };

  useEffect(() => {
    const unsubscribe = subscribeToCampaignMessages(
      campaignId,
      (newMessages, lastMessage) => {
        setMessages(newMessages);
        setVisibleMessages(newMessages.slice(0, messagesPerPage));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [campaignId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom && visibleMessages.length < messages.length) {
        const nextPage = page + 1;
        const nextMessages = messages.slice(0, nextPage * messagesPerPage);
        setVisibleMessages(nextMessages);
        setPage(nextPage);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messages, visibleMessages.length, page]);

  if (loading) {
    return (
      <Box my={2}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton
                      variant="circular"
                      width={40}
                      height={40}
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ width: '100%' }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Box>
                  <Skeleton
                    variant="text"
                    width="100%"
                    height={60}
                    sx={{ mb: 2 }}
                  />
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Skeleton variant="text" width="30%" height={20} />
                      <Skeleton variant="rectangular" width={80} height={24} />
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error: {error.message}</Alert>;
  }

  return (
    <Box>
      {(!messages || messages.length === 0) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('noDmsGenerated', 'No messages to show')}
          </Typography>
        </Box>
      )}
      {campaign?.status !== 'DRAFT' &&
        !!campaign.totalDms &&
        messages.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {campaign.status}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(messages.length / campaign.totalDms) * 100}
              sx={{ flexGrow: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {`${messages.length} / ${campaign.totalDms}`}
            </Typography>
          </Box>
        )}
      <Box
        ref={containerRef}
        sx={{
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
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
        <Grid container spacing={2}>
          {visibleMessages.map((listener, index) => {
            const isLastMessage = index === 0;

            return (
              <Grid item xs={12} md={6} key={listener.userId} gap={1}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <ListenerCardContent
                      listener={listener}
                      deleteMessage={deleteMessage}
                    />
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {t('generatedDmLabel', 'Generated DM')}
                        </Typography>
                        {listener.messageStatus === 'READY' ? (
                          <Box display={'flex'} gap={1}>
                            {editMessage?.userId === listener.userId && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditMessage(null);
                                }}
                              >
                                <CloseIcon fontSize="inherit" />
                              </IconButton>
                            )}
                            {editMessage?.userId === listener.userId ? (
                              <IconButton
                                size="small"
                                onClick={async () => {
                                  setEditMessage(null);
                                  await updateCampaignListenerMessage(
                                    campaignId,
                                    listener.userId,
                                    editMessage.messageContent
                                  );
                                }}
                              >
                                <CheckIcon fontSize="inherit" />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditMessage(listener);
                                }}
                              >
                                <EditIcon fontSize="inherit" />
                              </IconButton>
                            )}
                          </Box>
                        ) : (
                          <Chip
                            label={listener.messageStatus}
                            size="small"
                            color={
                              listener.messageStatus === 'FAILED'
                                ? 'error'
                                : 'default'
                            }
                          />
                        )}
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          position: 'relative',
                          minHeight: '80px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {editMessage?.userId === listener.userId ? (
                          <TextField
                            fullWidth
                            multiline
                            value={editMessage.messageContent}
                            onChange={(e) =>
                              setEditMessage({
                                ...editMessage,
                                messageContent: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            sx={{
                              flexGrow: 1,
                              whiteSpace: 'pre-wrap',
                              backgroundColor: 'rgba(29, 155, 240, 0.1)',
                              color: 'white',
                              padding: '12px 16px',
                              borderRadius: '20px',
                              borderTopLeftRadius: '4px',
                              maxWidth: '100%',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                              fontSize: '0.95rem',
                              lineHeight: 1.4,
                              wordBreak: 'break-word',
                            }}
                          >
                            {listener.messageContent}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

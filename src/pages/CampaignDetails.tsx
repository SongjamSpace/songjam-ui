import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Campaign as CampaignType,
  getCampaign,
  updateCampaign,
} from '../services/db/campaign.service';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Skeleton,
  Button,
  TextField,
} from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';

import axios from 'axios';
import { getDynamicToken } from '../utils';
import { CampaignListeners } from '../components/SpaceCRM/CampaignManager';
import { useTranslation } from 'react-i18next';
import LoginDialog from '../components/LoginDialog';
import { LoadingButton } from '@mui/lab';
import SourceListeners from '../components/NewCampaign/SourceListeners';
import CampaignPromptCustomizer, {
  PromptSettings,
} from '../components/NewCampaign/PromptCustomizer';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import EventIcon from '@mui/icons-material/Event';
import { createCheckoutSession } from '../services/db/stripe';

type Props = {};

const CampaignDetails = (props: Props) => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [campaign, setCampaign] = useState<CampaignType | null>(null);
  // const [selectedSpaces, setSelectedSpaces] = useState<SpaceDoc[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const { user, loading: authLoading } = useAuthContext();
  // const [selectedSpeakers, setSelectedSpeakers] = useState<TwitterUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [promptSettings, setPromptSettings] = useState<PromptSettings>({
    tone: 'professional',
    length: 'moderate',
    enthusiasm: 50,
    personalization: 75,
    formality: 50,
    customInstructions: '',
    keyPoints: [],
    callToAction: 'soft',
  });
  // const [listeners, setListeners] = useState<Listener[]>([]);
  const [description, setDescription] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [savingField, setSavingField] = useState('');

  const fetchCampaign = async () => {
    if (id) {
      const campaign = await getCampaign(id, (campaign) => {
        setCampaign(campaign);
      });
      if (campaign) {
        setCampaign(campaign);
      } else {
        navigate('/dashboard');
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  useEffect(() => {
    if (user && campaign) {
      if (user.projectIds.includes(campaign.projectId)) {
        setIsOwner(true);
        setIsLoading(false);
      } else {
        setIsOwner(false);
        setIsLoading(false);
        toast.error('Access denied for this email', {
          duration: 5000,
          position: 'bottom-right',
        });
        navigate('/dashboard');
      }
    }
  }, [user, campaign, id]);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else if (user) {
      setShowAuthDialog(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (campaign) {
      setDescription(campaign.description || '');
      setSelectedTopics(campaign.topics || []);
    }
  }, [campaign]);

  const handleGenerateDMs = async (noOfDms: number) => {
    if (!id) {
      return;
    }
    const token = await getDynamicToken();
    if (!token) {
      return alert('No token found, please login again');
    }
    // setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_JAM_SERVER_URL}/api/generate-listeners-dms`,
        {
          campaignId: id,
          noOfDms,
          promptSettings,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`${noOfDms} DMs generated successfully`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate DMs');
    }
    // setActionLoading(false);
  };
  // const handleGenerateDMs = async () => {
  //   if (!id) {
  //     return;
  //   }
  //   const token = await getDynamicToken();
  //   if (!token) {
  //     return alert('No token found, please login again');
  //   }
  //   console.log('Generate DMs for selected spaces:', selectedSpaces);
  //   setActionLoading(true);
  //   if (campaign?.campaignType === 'speakers') {
  //     await updateCampaign(id, {
  //       spaceSpeakerUsernames: selectedSpeakers.map((s) => s.twitterScreenName),
  //       selectedSpaceIds: selectedSpaces.map((s) => s.id),
  //       totalDms: selectedSpeakers.length,
  //     });
  //     // contruct an object with the speaker id as the key and the space title as the value
  //     const profilesWithSpaceTitlesObj: Record<string, string> = {};
  //     selectedSpeakers.forEach((s) => {
  //       const space = selectedSpaces.find((space) =>
  //         space.speakers.some((sp) => sp.userId === s.userId)
  //       );
  //       if (space) {
  //         profilesWithSpaceTitlesObj[s.userId] = space.title;
  //       }
  //     });
  //     await axios.post(
  //       `${import.meta.env.VITE_JAM_SERVER_URL}/api/generate-new-campaign-dms`,
  //       {
  //         campaignId: id,
  //         campaignTitle: campaign?.spaceTitle,
  //         campaignDescription: campaign?.description,
  //         profiles: selectedSpeakers,
  //         profilesWithSpaceTitlesObj,
  //         campaignType: campaign?.campaignType,
  //         promptSettings,
  //         spaceId: campaign?.spaceId,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //   } else if (campaign?.campaignType === 'listeners') {
  //     // TODO: Implement listener DM generation logic
  //     console.log('Generate DMs for selected listeners:', selectedSpaces);
  //     if (!listeners.length) {
  //       // setListeners(getTestListeners());
  //       toast.error('No listeners found');
  //       return;
  //     }
  //     // const listeners = getTestListeners();
  //     await updateCampaign(id, {
  //       spaceSpeakerUsernames: listeners.map((l) => l.twitterScreenName),
  //       selectedSpaceIds: selectedSpaces.map((s) => s.id),
  //       totalDms: listeners.length,
  //     });
  //     // contruct an object with the speaker id as the key and the space title as the value
  //     const listenersWithTopicsObj: Record<string, string> = {};
  //     listeners.forEach((l) => {
  //       listenersWithTopicsObj[l.userId] = selectedTopics.join(', ');
  //     });
  //     await axios.post(
  //       `${import.meta.env.VITE_JAM_SERVER_URL}/api/generate-new-campaign-dms`,
  //       {
  //         campaignId: id,
  //         campaignTitle: campaign?.spaceTitle,
  //         campaignDescription: campaign?.description,
  //         profiles: listeners,
  //         profilesWithSpaceTitlesObj: listenersWithTopicsObj,
  //         campaignType: campaign?.campaignType,
  //         spaceId: campaign?.spaceId,
  //         promptSettings,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //   }
  //   setActionLoading(false);
  // };

  // useEffect(() => {
  //   if (selectedSpaces.length > 0 || selectedSpeakers.length) {
  //     setSelectedSpeakers(selectedSpaces.flatMap((space) => space.speakers));
  //   }
  // }, [selectedSpaces]);

  const handleSaveDescription = async () => {
    if (!id || !campaign) return;
    setSavingField('description');
    try {
      await updateCampaign(id, {
        description,
      });
      toast.success('Description updated successfully');
    } catch (error) {
      toast.error('Failed to update description');
    }
    setSavingField('');
  };

  const handleAddTopic = async () => {
    if (!id || !campaign || !newTopic.trim()) return;
    if ((campaign.topics?.length ?? 0) >= 3) {
      toast.error('Maximum 3 topics allowed');
      return;
    }
    setSavingField('topics');
    try {
      const updatedTopics = [...(campaign.topics || []), newTopic.trim()];
      await updateCampaign(id, {
        topics: updatedTopics,
      });
      setNewTopic('');
      toast.success('Topic added successfully');
    } catch (error) {
      toast.error('Failed to add topic');
    }
    setSavingField('');
  };

  const handleRemoveTopic = async (topicToRemove: string) => {
    if (!id || !campaign) return;
    setSavingField('topics');
    try {
      const updatedTopics =
        campaign.topics?.filter((t) => t !== topicToRemove) || [];
      await updateCampaign(id, {
        topics: updatedTopics,
      });
      toast.success('Topic removed successfully');
    } catch (error) {
      toast.error('Failed to remove topic');
    }
    setSavingField('');
  };

  // if (isOwner) {
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
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          // justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            background: 'linear-gradient(90deg, #60A5FA, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% auto',
            cursor: 'pointer',
          }}
          onClick={() => {
            navigate('/dashboard');
          }}
        >
          Campaign Details
        </Typography>
        {campaign && (
          <Chip
            label={campaign.status}
            sx={{
              bgcolor:
                campaign.status === 'DRAFT'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(34, 197, 94, 0.2)',
              color: campaign.status === 'DRAFT' ? 'white' : '#22c55e',
              textTransform: 'capitalize',
            }}
          />
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
          sx={{ ml: 'auto' }}
        >
          Dashboard
        </Button>
      </Box>
      {isLoading && (
        <Grid container justifyContent={'center'}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={100} />
          </Grid>
        </Grid>
      )}
      {/* <Background /> */}
      {isOwner && campaign && (
        <Grid container spacing={3} sx={{ position: 'relative', p: 3 }}>
          {/* Left Column - Campaign Details */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'white',
                  background:
                    'linear-gradient(90deg, #60A5FA, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                }}
              >
                {campaign.spaceTitle}
              </Typography>

              <Box display={'flex'} alignItems={'center'}>
                <EventIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {campaign.scheduledStart
                    ? new Date(campaign.scheduledStart).toLocaleString()
                    : 'Not yet scheduled'}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <LoadingButton
                  loading={savingField === 'description'}
                  variant="outlined"
                  color="primary"
                  onClick={handleSaveDescription}
                  disabled={description === campaign?.description}
                  size="small"
                >
                  Save Description
                </LoadingButton>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  Topics ({campaign?.topics?.length || 0}/3)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add a topic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    disabled={(campaign?.topics?.length ?? 0) >= 3}
                    sx={{ flex: 1 }}
                  />
                  <LoadingButton
                    loading={savingField === 'topics'}
                    variant="outlined"
                    color="primary"
                    onClick={handleAddTopic}
                    disabled={
                      !newTopic.trim() || (campaign?.topics?.length ?? 0) >= 3
                    }
                    size="small"
                  >
                    Add
                  </LoadingButton>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {campaign?.topics?.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      onDelete={() => handleRemoveTopic(item)}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Hosted by
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {campaign.hostHandle}
                </Typography>
              </Box>
              {/* {selectedSpeakers.length > 0 &&
                campaign?.status === 'DRAFT' &&
                campaign.campaignType === 'speakers' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      Speaker Invites ({selectedSpeakers.length})
                    </Typography>
                    <Box
                      display="flex"
                      gap={2}
                      flexWrap="wrap"
                      // flexDirection={'column'}
                      mt={1}
                      justifyContent={'center'}
                      alignItems={'center'}
                      sx={{ overflow: 'auto', maxHeight: '420px' }}
                    >
                      {selectedSpeakers.map((speaker) => (
                        <Box
                          key={speaker.userId}
                          display="flex"
                          alignItems="center"
                          width={'100%'}
                          gap={2}
                          flex={1}
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            p: 1.5,
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          <Avatar src={speaker.avatarUrl} />
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: 'white',
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {speaker.displayName}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  maxWidth: '120px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                component={'a'}
                                href={`https://x.com/${speaker.twitterScreenName}`}
                                target="_blank"
                              >
                                @{speaker.twitterScreenName}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  maxWidth: '320px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {selectedSpaces.find((space) =>
                                  space.speakers.some(
                                    (sp) => sp.userId === speaker.userId
                                  )
                                )?.title || 'No space'}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => {
                              setSelectedSpeakers(
                                selectedSpeakers.filter(
                                  (s) => s.userId !== speaker.userId
                                )
                              );
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )} */}
              <Box sx={{ mt: 2 }}>
                {campaign?.status === 'DRAFT' && (
                  <CampaignPromptCustomizer
                    settings={promptSettings}
                    onChange={setPromptSettings}
                  />
                )}
              </Box>
              {campaign?.status === 'DRAFT' && (
                <LoadingButton
                  loading={actionLoading}
                  variant="contained"
                  size="small"
                  color="info"
                  fullWidth
                  onClick={() => {}}
                  // disabled={
                  //   campaign.campaignType === 'speakers' &&
                  //   selectedSpaces.length === 0
                  // }
                  sx={{ mt: 2 }}
                >
                  Generate Sample DM
                </LoadingButton>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Selected Spaces & Speakers */}

          {campaign && id && user && (
            <Grid item xs={12} md={8}>
              <Paper sx={{ height: '100%', p: 2 }}>
                {campaign.status === 'DRAFT' ? (
                  // campaign.campaignType === 'speakers' ? (
                  //   <SourceSpeakers
                  //     selectedSpaces={selectedSpaces}
                  //     setSelectedSpaces={setSelectedSpaces}
                  //     currentPlan={user?.currentPlan}
                  //     upgradePlan={async () => {
                  //       createCheckoutSession(user.uid, 'pro');
                  //     }}
                  //     user={user}
                  //   />
                  // ) : (
                  <SourceListeners
                    currentPlan={user?.currentPlan}
                    upgradePlan={async () => {
                      createCheckoutSession(user.uid, 'pro');
                    }}
                    user={user}
                    handleGenerateDMs={handleGenerateDMs}
                    // listeners={listeners}
                    // setListeners={setListeners}
                  />
                ) : (
                  // )
                  <CampaignListeners
                    campaignId={id}
                    campaign={campaign}
                    t={t}
                  />
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      <LoginDialog open={showAuthDialog && !authLoading} />
      <Toaster />
    </Box>
  );
  // } else {
  //   return (
  //     <Box
  //       sx={{
  //         background: 'linear-gradient(135deg, #0f172a, #1e293b)',
  //         minHeight: '100vh',
  //         color: 'white',
  //         position: 'relative',
  //         '&::before': {
  //           content: '""',
  //           position: 'absolute',
  //           top: 0,
  //           left: 0,
  //           right: 0,
  //           height: '100%',
  //           background:
  //             'radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.15), rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.1))',
  //           opacity: 0.7,
  //           pointerEvents: 'none',
  //           maskImage:
  //             'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)',
  //           WebkitMaskImage:
  //             'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)',
  //         },
  //       }}
  //     >
  //       <Grid container justifyContent="center" sx={{ p: 3 }}>
  //         <Grid item xs={12} md={8}>
  //           <Paper
  //             sx={{
  //               p: 4,
  //               bgcolor: 'rgba(255, 255, 255, 0.05)',
  //               backdropFilter: 'blur(10px)',
  //               borderRadius: 2,
  //               boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  //               border: '1px solid rgba(255, 255, 255, 0.1)',
  //             }}
  //           >
  //             <Typography
  //               variant="h4"
  //               gutterBottom
  //               sx={{
  //                 color: 'white',
  //                 mb: 3,
  //                 background:
  //                   'linear-gradient(90deg, #60A5FA, #8B5CF6, #EC4899)',
  //                 WebkitBackgroundClip: 'text',
  //                 WebkitTextFillColor: 'transparent',
  //                 backgroundSize: '200% auto',
  //               }}
  //             >
  //               {campaign.spaceTitle}
  //             </Typography>

  //             <Box sx={{ mt: 2 }}>
  //               <Typography
  //                 variant="subtitle1"
  //                 sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
  //               >
  //                 {campaign.scheduledStart
  //                   ? new Date(campaign.scheduledStart).toLocaleString()
  //                   : 'Not yet scheduled'}
  //               </Typography>
  //             </Box>

  //             {campaign.topics && campaign.topics.length > 0 && (
  //               <Box sx={{ mt: 3 }}>
  //                 <Box
  //                   sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}
  //                 >
  //                   {campaign.topics.map((topic, index) => (
  //                     <Chip
  //                       key={index}
  //                       label={topic}
  //                       sx={{
  //                         bgcolor: 'rgba(255, 255, 255, 0.1)',
  //                         color: 'white',
  //                         '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
  //                       }}
  //                     />
  //                   ))}
  //                 </Box>
  //               </Box>
  //             )}

  //             <Box sx={{ mt: 3 }}>
  //               <Typography
  //                 variant="subtitle1"
  //                 sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
  //               >
  //                 Hosted by
  //               </Typography>
  //               <Typography variant="body1" sx={{ color: 'white' }}>
  //                 {campaign.hostHandle}
  //               </Typography>
  //             </Box>

  //             {campaign.description && (
  //               <Box sx={{ mt: 3 }}>
  //                 <Typography
  //                   variant="subtitle1"
  //                   sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
  //                 >
  //                   Description
  //                 </Typography>
  //                 <Typography variant="body1" sx={{ color: 'white' }}>
  //                   {campaign.description}
  //                 </Typography>
  //               </Box>
  //             )}
  //             <Box display={'flex'} justifyContent={'center'} my={2}>
  //               <Button variant="contained" color="primary">
  //                 Join as Speaker
  //               </Button>
  //             </Box>
  //           </Paper>
  //         </Grid>
  //       </Grid>
  //     </Box>
  //   );
  // }
};

export default CampaignDetails;

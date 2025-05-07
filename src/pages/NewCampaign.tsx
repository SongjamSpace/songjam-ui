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
  Avatar,
  Skeleton,
} from '@mui/material';
import SourceSpeakers from '../components/SourceSpeakers';
import { useAuthContext } from '../contexts/AuthContext';
import { SpaceDoc, TwitterUser } from '../services/db/spaces.service';
import axios from 'axios';
import { getDynamicToken } from '../utils';
import { CampaignListeners } from '../components/SpaceCRM/CampaignManager';
import { useTranslation } from 'react-i18next';
import LoginDialog from '../components/LoginDialog';
import { LoadingButton } from '@mui/lab';

type Props = {};

const Campaign = (props: Props) => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [campaign, setCampaign] = useState<CampaignType | null>(null);
  const [selectedSpaces, setSelectedSpaces] = useState<SpaceDoc[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const { user, loading: authLoading } = useAuthContext();
  const [selectedSpeakers, setSelectedSpeakers] = useState<TwitterUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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

  const handleGenerateDMs = async () => {
    if (!id) {
      return;
    }
    const token = await getDynamicToken();
    if (!token) {
      return alert('No token found, please login again');
    }
    // TODO: Implement DM generation logic
    console.log('Generate DMs for selected spaces:', selectedSpaces);
    await updateCampaign(id, {
      spaceSpeakerUsernames: selectedSpeakers.map((s) => s.twitterScreenName),
      selectedSpaceIds: selectedSpaces.map((s) => s.id),
      totalDms: selectedSpeakers.length,
    });
    // contruct an object with the speaker id as the key and the space title as the value
    const speakersWithSpaceTitlesObj: Record<string, string> = {};
    selectedSpeakers.forEach((s) => {
      const space = selectedSpaces.find((space) =>
        space.speakers.some((sp) => sp.userId === s.userId)
      );
      if (space) {
        speakersWithSpaceTitlesObj[s.userId] = space.title;
      }
    });
    await axios.post(
      `${import.meta.env.VITE_JAM_SERVER_URL}/api/generate-new-campaign-dms`,
      {
        campaignId: id,
        campaignTitle: campaign?.spaceTitle,
        campaignDescription: campaign?.description,
        speakers: selectedSpeakers,
        speakersWithSpaceTitlesObj,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  useEffect(() => {
    if (selectedSpaces.length > 0 || selectedSpeakers.length) {
      setSelectedSpeakers(selectedSpaces.flatMap((space) => space.speakers));
    }
  }, [selectedSpaces]);

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
                variant="h5"
                gutterBottom
                sx={{
                  color: 'white',
                  mb: 3,
                  background:
                    'linear-gradient(90deg, #60A5FA, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                }}
              >
                {campaign.spaceTitle}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {campaign.scheduledStart
                    ? new Date(campaign.scheduledStart).toLocaleString()
                    : 'Not yet scheduled'}
                </Typography>
              </Box>

              {campaign.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {campaign.description}
                  </Typography>
                </Box>
              )}

              {campaign.topics && campaign.topics.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {campaign.topics.map((item, index) => (
                      <Chip
                        key={index}
                        label={item}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
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
              {selectedSpeakers.length > 0 && campaign?.status === 'DRAFT' && (
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
                              sx={{ color: 'white' }}
                            >
                              {speaker.displayName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                            >
                              @{speaker.twitterScreenName}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                            >
                              {20} followers
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                            >
                              •
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                maxWidth: '200px',
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
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {selectedSpaces.length > 0 && campaign?.status === 'DRAFT' && (
                <LoadingButton
                  loading={actionLoading}
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    setActionLoading(true);
                    handleGenerateDMs();
                  }}
                  disabled={selectedSpaces.length === 0}
                  sx={{ mt: 2 }}
                >
                  Generate DMs
                </LoadingButton>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Selected Spaces & Speakers */}

          {campaign && id && user && (
            <Grid item xs={12} md={8}>
              <Paper sx={{ height: '100%', p: 2 }}>
                {campaign.status === 'DRAFT' ? (
                  <SourceSpeakers
                    handleGenerateDMs={handleGenerateDMs}
                    selectedSpaces={selectedSpaces}
                    setSelectedSpaces={setSelectedSpaces}
                    currentPlan={user?.currentPlan}
                    upgradePlan={() => {}}
                  />
                ) : (
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

export default Campaign;

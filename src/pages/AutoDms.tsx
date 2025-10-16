import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Chip,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
  Menu,
  IconButton,
} from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { getDynamicToken, getPlanLimits } from '../utils';
import { useTranslation } from 'react-i18next';
import LoginDialog from '../components/LoginDialog';
import { LoadingButton } from '@mui/lab';
import CampaignPromptCustomizer, {
  PromptSettings,
} from '../components/NewCampaign/PromptCustomizer';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import TuneIcon from '@mui/icons-material/Tune';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Campaign,
  getCampaign,
  createCampaign,
  updateCampaign,
} from '../services/db/campaign.service';
import { CampaignMessages } from '../components/SpaceCRM/CampaignManager';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

type Props = {};

const AutoDms = (props: Props) => {
  const { campaignId } = useParams<{ campaignId?: string }>();
  const { user, loading: authLoading } = useAuthContext();
  const { handleLogOut } = useDynamicContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [promptSettings, setPromptSettings] = useState<PromptSettings>({
    tone: 'professional',
    length: 'moderate',
    enthusiasm: 50,
    personalization: 75,
    customInstructions: '',
    keyPoints: [],
    callToAction: 'soft',
  });
  const [isSampleDMsGenerating, setIsSampleDMsGenerating] = useState(false);
  const [isGeneratingDMs, setIsGeneratingDMs] = useState(false);
  const [sampleDm, setSampleDm] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [numListeners, setNumListeners] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const planLimits = getPlanLimits(user?.currentPlan || 'free');
  const maxDms = planLimits.autoDms;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDashboardClick = () => {
    handleMenuClose();
    navigate('/dashboard');
  };

  const getUserDisplayText = () => {
    if (user?.username) return `@${user.username}`;
    if (user?.email) return user.email;
    return 'Account';
  };

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
    } else if (user) {
      setShowAuthDialog(false);
    }
  }, [user, authLoading]);

  // Fetch campaign if campaignId is present in URL
  useEffect(() => {
    const fetchCampaign = async () => {
      if (campaignId && user) {
        await getCampaign(campaignId, (campaignData) => {
          if (campaignData) {
            if (campaignData.userId !== user.uid) {
              toast.error('You are not authorized to access this campaign');
              navigate('/auto-dms');
              return;
            }
            setCampaign(campaignData);
            setCampaignTitle(campaignData.spaceTitle || '');
            setCampaignDescription(campaignData.description || '');
          } else {
            toast.error('Campaign not found');
            navigate('/auto-dms');
          }
        });
      }
    };

    fetchCampaign();
  }, [campaignId, user]);

  const handleGenerateSampleDM = async () => {
    if (!campaignTitle.trim()) {
      toast.error('Please add a campaign title');
      return;
    }
    setIsSampleDMsGenerating(true);
    try {
      const token = await getDynamicToken();
      if (!token) {
        return alert('No token found, please login again');
      }
      const response = await axios.post(
        `${import.meta.env.VITE_JAM_SERVER_URL}/api/generate-sample-dm`,
        {
          campaignTitle,
          campaignDescription,
          promptSettings,
          ctaType: 'auto',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSampleDm(response.data.result);
      toast.success('Sample DM generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate sample DM');
    } finally {
      setIsSampleDMsGenerating(false);
    }
  };

  const handleGenerateDMs = async () => {
    if (!campaignTitle.trim()) {
      toast.error('Please add a campaign title');
      return;
    }

    if (!user || !user.uid) {
      toast.error('Please login to generate DMs');
      return;
    }

    if ((user?.usage.autoDms || 0) + numListeners > maxDms) {
      toast.error(
        `You've reached your plan limit. Please upgrade to generate more DMs`
      );
      return;
    }

    const token = await getDynamicToken();
    if (!token) {
      return alert('No token found, please login again');
    }

    setIsGeneratingDMs(true);
    try {
      let activeCampaignId = campaignId;

      // If no campaignId in URL, create a new campaign
      if (!activeCampaignId && !campaign) {
        const newCampaign: Campaign = {
          ctaType: 'auto-dms',
          ctaTarget: campaignTitle,
          status: 'DRAFT',
          spaceId: '', // No specific space for broadcast campaigns
          spaceTitle: campaignTitle,
          projectId: user.defaultProjectId || '',
          userId: user.uid,
          createdAt: Date.now(),
          description: campaignDescription,
          isBroadcast: false,
        };

        const createdCampaign = await createCampaign(newCampaign);
        activeCampaignId = createdCampaign.id;
        setCampaign(createdCampaign);
      } else if (activeCampaignId && campaign) {
        await updateCampaign(activeCampaignId, {
          status: 'DRAFT',
          ctaTarget: campaignTitle,
          description: campaignDescription,
          isBroadcast: false,
        });
      }

      if (!activeCampaignId) {
        toast.error('Failed to create campaign');
        return;
      }

      // Call the generate-listeners-dms API
      await axios.post(
        `${import.meta.env.VITE_JAM_SERVER_URL}/api/generate-auto-dms`,
        {
          campaignId: activeCampaignId,
          noOfDms: numListeners,
          promptSettings,
          lang: 'en',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        `Generating ${numListeners} DMs... This may take a few minutes.`
      );

      // Update URL to trigger campaign refresh via useEffect
      if (activeCampaignId && !campaignId) {
        navigate(`/auto-dms/${activeCampaignId}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to generate DMs');
    } finally {
      setIsGeneratingDMs(false);
    }
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        minHeight: '100vh',
        color: 'white',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(90deg, #60A5FA, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
            onClick={() => {
              navigate('/dashboard');
            }}
          >
            <AutoAwesomeIcon /> Auto DMs Studio
          </Typography>
          {user && (
            <Chip
              label={`Plan: ${user.currentPlan?.toUpperCase() || 'FREE'}`}
              sx={{
                bgcolor: 'rgba(96, 165, 250, 0.2)',
                color: '#60A5FA',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        {user ? (
          <>
            <Button
              variant="text"
              color="primary"
              onClick={handleMenuOpen}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                borderColor: 'rgba(96, 165, 250, 0.4)',
                color: '#60A5FA',
                '&:hover': {
                  borderColor: 'rgba(96, 165, 250, 0.6)',
                  bgcolor: 'rgba(96, 165, 250, 0.1)',
                },
              }}
            >
              {getUserDisplayText()}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={handleDashboardClick}
                sx={{
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(96, 165, 250, 0.2)',
                  },
                  display: 'flex',
                  gap: 1,
                  px: 2,
                }}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  await handleLogOut();
                  window.location.reload();
                }}
                sx={{
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(96, 165, 250, 0.2)',
                  },
                  display: 'flex',
                  gap: 1,
                  px: 2,
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          !authLoading && (
            <Button
              variant="contained"
              onClick={() => setShowAuthDialog(true)}
              startIcon={<AccountCircleIcon />}
              sx={{
                background: 'linear-gradient(90deg, #60A5FA, #8B5CF6)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(90deg, #3b82f6, #7c3aed)',
                },
              }}
            >
              Login
            </Button>
          )
        )}
      </Box>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ position: 'relative', p: 3 }}>
        {/* Left Column - Campaign Setup */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <TuneIcon sx={{ color: '#8B5CF6' }} />
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                Campaign Details
              </Typography>
            </Box>

            <Stack spacing={3}>
              {/* Campaign Title Input */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  Campaign Title *
                </Typography>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g., Twitter Space on AI & Web3"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </Box>

              {/* Campaign Description Input */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  AI Context
                </Typography>
                <textarea
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  placeholder="Add details about your campaign..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </Box>

              {/* Prompt Customizer */}
              <Box sx={{ mt: 2 }}>
                <CampaignPromptCustomizer
                  settings={promptSettings}
                  onChange={setPromptSettings}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column - Preview & Actions */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                DMs Preview
              </Typography>
            </Box>

            {/* Generate DMs Input & Usage Stats */}
            <Grid container spacing={4} mb={3}>
              <Grid item xs={2}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#22C55E',
                    fontWeight: 600,
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  DMs to Generate
                </Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Enter #"
                    type="number"
                    value={numListeners}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        setNumListeners(Math.min(Math.max(value, 1), 1000));
                      } else if (e.target.value === '') {
                        setNumListeners(0);
                      }
                    }}
                    inputProps={{
                      max: 1000,
                      min: 1,
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(34, 197, 94, 0.05)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        '& input': {
                          color: '#22C55E',
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}></Grid>
              <Grid item xs={4}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          display: 'block',
                        }}
                      >
                        Used
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 0.5 }}
                      >
                        {user?.usage.autoDms || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          display: 'block',
                        }}
                      >
                        Remaining
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 0.5 }}
                      >
                        {maxDms === Infinity
                          ? 'Unlimited'
                          : Math.max(0, maxDms - (user?.usage.autoDms || 0))}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {(user?.usage.autoDms || 0) + numListeners > maxDms && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'white',
                  '& .MuiAlert-icon': {
                    color: '#EF4444',
                  },
                }}
              >
                This exceeds your plan limit. Please reduce the number or
                upgrade your plan.
              </Alert>
            )}

            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Campaign Messages Display */}
            {campaign && campaignId && campaign.status !== 'DRAFT' ? (
              <CampaignMessages
                campaignId={campaignId}
                campaign={campaign}
                t={t}
              />
            ) : (
              <>
                {/* Sample DM Display */}
                {sampleDm && (
                  <Box mb={3}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}
                    >
                      Generated Sample
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: '#15202b',
                        borderRadius: '16px',
                        p: 3,
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        boxShadow: '0 4px 12px rgba(96, 165, 250, 0.1)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '15px',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {sampleDm}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Empty State */}
                {!sampleDm && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '300px',
                      border: '2px dashed rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                      mb: 3,
                    }}
                  >
                    <AutoAwesomeIcon
                      sx={{
                        fontSize: 64,
                        color: 'rgba(255, 255, 255, 0.2)',
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ color: 'rgba(255, 255, 255, 0.4)', mb: 1 }}
                    >
                      No Preview Yet
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      Generate a sample DM to see how it looks
                    </Typography>
                  </Box>
                )}
              </>
            )}

            {/* Action Buttons */}
            <Stack spacing={2}>
              <LoadingButton
                loading={isGeneratingDMs}
                variant="contained"
                size="large"
                color="primary"
                fullWidth
                onClick={handleGenerateDMs}
                startIcon={<RocketLaunchIcon />}
                disabled={
                  !campaignTitle.trim() ||
                  (user?.usage.autoDms || 0) + numListeners > maxDms
                }
                sx={{
                  background: 'linear-gradient(90deg, #EC4899, #8B5CF6)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #db2777, #7c3aed)',
                  },
                  py: 1.5,
                }}
              >
                Generate {numListeners} DMs
              </LoadingButton>

              <LoadingButton
                loading={isSampleDMsGenerating}
                variant="outlined"
                size="medium"
                fullWidth
                onClick={handleGenerateSampleDM}
                startIcon={<AutoAwesomeIcon />}
                disabled={!campaignTitle.trim()}
                sx={{
                  borderColor: 'rgba(96, 165, 250, 0.4)',
                  color: '#60A5FA',
                  '&:hover': {
                    borderColor: 'rgba(96, 165, 250, 0.6)',
                    bgcolor: 'rgba(96, 165, 250, 0.1)',
                  },
                }}
              >
                Preview Sample DM
              </LoadingButton>
            </Stack>

            {/* Tips Section */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: '#EC4899', mb: 1, fontWeight: 600 }}
              >
                💡 Pro Tips
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}
              >
                • Use personalization for better engagement
                <br />
                • Add key points to highlight specific topics
                <br />• Experiment with different tones for your audience
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <LoginDialog open={showAuthDialog && !authLoading} />
      <Toaster position="bottom-right" />
    </Box>
  );
};

export default AutoDms;

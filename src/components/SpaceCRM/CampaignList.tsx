import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  Campaign,
  createCampaign,
  getCampaigns,
  updateCampaign,
} from '../../services/db/campaign.service';
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Box,
  Chip,
} from '@mui/material';
import { t } from 'i18next';
import CampaignIcon from '@mui/icons-material/Campaign';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';
import CampaignManager from './CampaignManager';
import { Space } from '../../services/db/spaces.service';
import toast from 'react-hot-toast';
import axios from 'axios';

type Props = {
  spaceId: string;
  space: Space | null;
};

const CampaignList = ({ spaceId, space }: Props) => {
  const { user } = useAuthContext();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [ctaType, setCtaType] = useState<'follow' | 'space'>('follow');
  const [ctaTarget, setCtaTarget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const handleGenerateMessages = async (noOfListeners: number) => {
    if (!selectedCampaign || !selectedCampaign.id) {
      setError('Campaign ID is required');
      return;
    }
    try {
      const token = localStorage.getItem('dynamic_authentication_token');
      if (!token) {
        setError('No token found');
        return;
      }
      try {
        await axios.post(
          `${import.meta.env.VITE_JAM_SERVER_URL}/api/generate-dms`,
          {
            spaceId,
            spaceTitle: space?.title,
            campaignId: selectedCampaign.id,
            ctaType: selectedCampaign.ctaType,
            ctaTarget: selectedCampaign.ctaTarget,
          },
          {
            headers: {
              Authorization: `Bearer ${JSON.parse(token)}`,
            },
          }
        );
        // Update the campaign status to GENERATING
        await updateCampaign(selectedCampaign.id, {
          status: 'GENERATING',
          totalDms: noOfListeners,
        });
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === selectedCampaign.id
              ? { ...campaign, status: 'GENERATING', totalDms: noOfListeners }
              : campaign
          )
        );
        setSelectedCampaign({
          ...selectedCampaign,
          status: 'GENERATING',
          totalDms: noOfListeners,
        });
      } catch (err) {
        setError('Failed to generate messages');
        toast.error('Failed to generate messages');
      }
    } catch (err) {
      setError('Failed to generate messages');
    }
  };

  const fetchCampaigns = async () => {
    if (!user || !user.defaultProjectId) return;
    setIsLoadingCampaigns(true);
    try {
      const campaignsSnapshot = await getCampaigns(
        spaceId,
        user.defaultProjectId
      );
      const campaignsWithIds = campaignsSnapshot.docs.map((doc) => ({
        ...(doc.data() as Campaign),
        id: doc.id,
      }));
      setCampaigns(campaignsWithIds);
    } catch (err) {
      setError('Failed to fetch campaigns');
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    if (spaceId) {
      fetchCampaigns();
    }
  }, [spaceId]);

  const handleCreateCampaign = async () => {
    if (!user || !user.uid) {
      setError('Please login to create a campaign');
      return;
    }
    if (!ctaTarget.trim()) {
      setError('Please provide a CTA target');
      return;
    }
    if (!space) {
      setError('Please provide a space title');
      return;
    }

    const newCampaign: Campaign = {
      ctaType,
      ctaTarget,
      status: 'DRAFT',
      spaceId,
      spaceTitle: space.title,
      userId: user.uid,
      projectId: user.defaultProjectId || '',
      createdAt: Date.now(),
    };

    try {
      const campaign = await createCampaign(newCampaign);
      toast.success('Campaign created successfully');
      setSelectedCampaign(campaign);
      // await fetchCampaigns();
      setCtaTarget('');
      setError(null);
    } catch (err) {
      setError('Failed to create campaign');
      toast.error('Failed to create campaign');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'sending':
        return 'warning';
      case 'ready':
        return 'primary';
      default:
        return 'default';
    }
  };

  const renderCampaignRow = (campaign: Campaign) => (
    <TableRow
      hover
      onClick={() => setSelectedCampaign(campaign)}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
        },
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CampaignIcon />
          <Typography>
            {campaign.ctaType === 'follow'
              ? t('followAccount')
              : t('futureSpace')}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>{campaign.ctaTarget}</TableCell>
      <TableCell>
        <Chip
          label={t(campaign.status.toUpperCase())}
          color={getStatusColor(campaign.status)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon fontSize="small" />
          <Typography variant="body2">
            {format(new Date(campaign.createdAt), 'MMM d, yyyy hh:mm a')}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderSkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={120} height={24} />
        </Box>
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={150} height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={80} height={24} />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={120} height={24} />
        </Box>
      </TableCell>
    </TableRow>
  );

  if (selectedCampaign) {
    return (
      <CampaignManager
        spaceId={spaceId}
        campaign={selectedCampaign}
        handleGenerateMessages={handleGenerateMessages}
        handleBack={() => setSelectedCampaign(null)}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.03)' }}>
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
                onChange={(e) =>
                  setCtaType(e.target.value as 'follow' | 'space')
                }
              >
                <MenuItem value="follow">{t('followAccount')}</MenuItem>
                <MenuItem value="space">{t('futureSpace')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={
                ctaType === 'follow'
                  ? t('accountToFollow', 'Account to follow')
                  : t('spaceDetails', 'Space details')
              }
              value={ctaTarget}
              onChange={(e) => setCtaTarget(e.target.value)}
              placeholder={
                ctaType === 'follow'
                  ? '@username'
                  : t('spaceDetailsPlaceholder', 'Enter space details')
              }
            />
          </Grid>
        </Grid>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleCreateCampaign}
          sx={{ mt: 3 }}
          disabled={!ctaTarget.trim()}
          startIcon={<SendIcon />}
        >
          {t('setupCampaignButton')}
        </Button>
      </Paper>

      <Typography variant="h6" p={2}>
        {t('campaigns', 'My Campaigns')}
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ background: 'rgba(255, 255, 255, 0.02)' }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('campaignType', 'Campaign Type')}</TableCell>
              <TableCell>{t('target')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell>{t('createdAt', 'Created')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingCampaigns ? (
              Array.from({ length: 4 }).map((_, index) => (
                <React.Fragment key={index}>
                  {renderSkeletonRow()}
                </React.Fragment>
              ))
            ) : campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <React.Fragment key={campaign.id}>
                  {renderCampaignRow(campaign)}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">
                    {t('noCampaigns', 'No Campaigns found')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default CampaignList;

import { LoadingButton } from '@mui/lab';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Fade,
} from '@mui/material';
import { Campaign, updateCampaign } from '../../services/db/campaign.service';
import { useState } from 'react';

type Props = {
  campaign: Campaign;
  id: string;
  actionLoading: boolean;
  handleGenerateDMs: (targetAccount: string) => void;
  numListeners: number;
  isUpgrading: boolean;
};

const CTACampaignSection = ({
  campaign,
  id,
  actionLoading,
  handleGenerateDMs,
  numListeners,
  isUpgrading,
}: Props) => {
  const [followAccountEmail, setFollowAccountEmail] = useState('');
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{ py: 4 }}
        >
          <Fade in={true} timeout={1000}>
            <Box sx={{ maxWidth: '400px', width: '100%' }}>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{
                  mb: 1,
                  fontWeight: 500,
                  //   background:
                  //     'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  //   backgroundClip: 'text',
                  //   textFillColor: 'transparent',
                  //   WebkitBackgroundClip: 'text',
                  //   WebkitTextFillColor: 'transparent',
                }}
              >
                Invite to Follow
              </Typography>

              <TextField
                fullWidth
                size="medium"
                placeholder="Enter Twitter username (e.g., elonmusk)"
                value={followAccountEmail}
                onChange={(e) => {
                  if (id) {
                    // Remove @ from the beginning of the string
                    setFollowAccountEmail(e.target.value.replace('@', ''));
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                  },
                }}
              />

              <Box sx={{ mt: 4 }}>
                <LoadingButton
                  loading={actionLoading}
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={async () => {
                    await updateCampaign(id, {
                      ctaTarget: followAccountEmail,
                    });
                    await handleGenerateDMs(followAccountEmail);
                  }}
                  disabled={isUpgrading || !followAccountEmail}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  Generate DMs
                </LoadingButton>
              </Box>
            </Box>
          </Fade>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CTACampaignSection;

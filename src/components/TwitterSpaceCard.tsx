import { Box, Paper, Typography, Chip } from '@mui/material';
import React from 'react';
import { Campaign } from '../services/db/campaign.service';

interface TwitterSpaceCardProps {
  campaign: Campaign;
}

function formatDateTime(timestamp?: number) {
  if (!timestamp) return 'TBA';
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return date.toLocaleString('en-US', options);
}

const TwitterSpaceCard: React.FC<TwitterSpaceCardProps> = ({ campaign }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        // bgcolor: '#9466ef',
        borderRadius: 3,
        p: 2,
        width: '100%',
        // maxWidth: 400,
        color: 'white',
        minWidth: 250,
      }}
    >
      {/* <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
        <Avatar
          src="https://ui-avatars.com/api/?name=Host&background=8b5cf6&color=fff&size=64"
          alt="Host Avatar"
          sx={{ width: 32, height: 32, border: '2px solid white' }}
        />
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: 'white', fontSize: 16 }}
        >
          {campaign.hostHandle || 'Host'}
        </Typography>
        <Chip
          label="Host"
          sx={{
            ml: 0.5,
            bgcolor: 'rgba(168, 129, 255, 0.6)',
            color: 'white',
            fontWeight: 600,
            fontSize: 12,
            borderRadius: 1.5,
            height: 22,
            px: 0.5,
          }}
          size="small"
        />
      </Box> */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            mb: 0.5,
            color: 'white',
            fontSize: 22,
            background: 'linear-gradient(90deg, #60A5FA, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {campaign.spaceTitle}
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          {/* <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ color: 'white', fontSize: 16 }}
          >
            {campaign.hostHandle || 'Host'}
          </Typography>
          <Chip
            label="Host"
            sx={{
              ml: 0.5,
              bgcolor: 'rgba(168, 129, 255, 0.6)',
              color: 'white',
              fontWeight: 600,
              fontSize: 12,
              borderRadius: 1.5,
              height: 22,
              px: 0.5,
            }}
            size="small"
          /> */}
          <Typography
            variant="body2"
            sx={{ opacity: 0.9, color: 'white', fontSize: 14 }}
          >
            {campaign.scheduledStart
              ? formatDateTime(campaign.scheduledStart)
              : 'TBA'}
          </Typography>
        </Box>
        {/* Topics */}
        <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
          {campaign.topics?.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              sx={{
                bgcolor: 'rgba(168, 129, 255, 0.6)',
                color: 'white',
                fontSize: 12,
                height: 20,
              }}
              size="small"
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default TwitterSpaceCard;

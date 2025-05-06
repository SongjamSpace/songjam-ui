import React from 'react';
import {
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import { TwitterUser } from '../services/db/spaces.service';

interface SpaceSpeakerInfoProps {
  speaker: TwitterUser;
}

export const SpaceSpeakerInfo: React.FC<SpaceSpeakerInfoProps> = ({
  speaker,
}) => {
  return (
    <Box sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          src={speaker.avatarUrl}
          alt={speaker.displayName}
          sx={{ 
            width: 36, 
            height: 36,
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography 
            variant="subtitle2" 
            component="h3"
            sx={{ 
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {speaker.displayName}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            @{speaker.twitterScreenName}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SpaceSpeakerInfo;

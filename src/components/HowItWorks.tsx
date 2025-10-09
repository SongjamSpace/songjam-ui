import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';

const HowItWorks: React.FC = () => {
  return (
    <List dense>
      <ListItem>
        <ListItemText
          primary={
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              1. Access Control:
            </Typography>
          }
          secondary={
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              Only Hosts and Co-Hosts can summon the DJ.
            </Typography>
          }
        />
      </ListItem>
      <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <ListItem>
        <ListItemText
          primary={
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              2. Space URL format:
            </Typography>
          }
          secondary={
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              https://x.com/i/spaces/1LyxBXZVvwzGN
            </Typography>
          }
        />
      </ListItem>
      <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <ListItem>
        <ListItemText
          primary={
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              3. Load soundboard before joining
            </Typography>
          }
          secondary={
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              You can only load the soundboard once before joining the space.
              Use short audio clips less than 500KB for each slot.
            </Typography>
          }
        />
      </ListItem>
      <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <ListItem>
        <ListItemText
          primary={
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              4. Select music from library
            </Typography>
          }
          secondary={
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Upload/Choose a music track from your music library.
            </Typography>
          }
        />
      </ListItem>
      <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <ListItem>
        <ListItemText
          primary={
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              5. Approve speaker request
            </Typography>
          }
          secondary={
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Once you click "Join Space", approve the SongjamDJ speaker request
              in the space as soon as possible.
            </Typography>
          }
        />
      </ListItem>
    </List>
  );
};

export default HowItWorks;

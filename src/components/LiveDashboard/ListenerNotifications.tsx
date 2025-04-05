import React, { useEffect } from 'react';
import { Box, Paper, Typography, Avatar, IconButton } from '@mui/material';
import { SpaceListener } from '../../services/db/spaces.service';
import { Person } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ListenerNotificationsProps {
  listeners: SpaceListener[];
  previousListeners: SpaceListener[];
  updatePreviousListeners: () => void;
}

const ListenerNotifications: React.FC<ListenerNotificationsProps> = ({
  listeners,
  previousListeners,
  updatePreviousListeners,
}) => {
  useEffect(() => {
    // Check for new listeners
    const newListeners = listeners.filter(
      (listener) =>
        !previousListeners.find((pl) => pl.userId === listener.userId)
    );
    if (newListeners.length > 0) {
      // Show notifications for new listeners
      newListeners.forEach((listener) => {
        toast.custom(
          <Paper
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              maxWidth: '300px',
            }}
          >
            <Avatar src={listener.avatarUrl} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">
                {listener.displayName} joined
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(), 'h:mm a')}
              </Typography>
            </Box>
          </Paper>,
          {
            duration: 4000,
            position: 'bottom-right',
          }
        );
      });
      updatePreviousListeners();
    }
  }, [listeners, previousListeners]);

  return (
    <Paper
      sx={{
        p: 2,
        height: '600px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recently Joined
      </Typography>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
          },
        }}
      >
        {listeners.map((listener, index) => (
          <Box
            key={`${listener.userId}-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <Avatar
              src={listener.avatarUrl}
              sx={{
                width: 32,
                height: 32,
                cursor: 'pointer',
              }}
              onClick={() =>
                window.open(
                  `https://twitter.com/${listener.twitterScreenName}`,
                  '_blank'
                )
              }
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">{listener.displayName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {listener.joinedAt
                  ? format(new Date(listener.joinedAt), 'h:mm a')
                  : 'Unknown time'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() =>
                window.open(
                  `https://twitter.com/${listener.twitterScreenName}`,
                  '_blank'
                )
              }
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { color: '#1DA1F2' },
              }}
            >
              <Person fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ListenerNotifications;

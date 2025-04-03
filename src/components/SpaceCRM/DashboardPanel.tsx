import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { format } from 'date-fns';
import { Space, SpaceListener } from '../../services/db/spaces.service';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../../services/firebase.service';
import { Message, Person, PersonAdd } from '@mui/icons-material';

interface DashboardPanelProps {
  space: Space | null;
  spaceId: string;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ spaceId, space }) => {
  const [spaceLimit, setSpaceLimit] = useState(10);
  const [listeners, loading, error] = useCollectionData(
    query(
      collection(db, 'spaces', spaceId, 'listeners'),
      orderBy('joinedAt', 'desc'),
      limit(spaceLimit)
    )
  );

  if (!spaceId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Live Dashboard
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2,
          }}
        >
          <Paper
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Total Listeners
            </Typography>
            <Typography variant="h4">{space?.total_live_listeners}</Typography>
          </Paper>
          <Paper
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Current Listeners
            </Typography>
            <Typography variant="h4">{listeners?.length}</Typography>
          </Paper>
          <Paper
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Started At
            </Typography>
            <Typography variant="h6">
              {space?.started_at
                ? format(new Date(space.started_at), 'PPp')
                : '-'}
            </Typography>
          </Paper>
          {space?.ended_at && (
            <Paper
              sx={{
                p: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Ended At
              </Typography>
              <Typography variant="h6">
                {space?.ended_at
                  ? format(new Date(space.ended_at), 'PPp')
                  : 'Live'}
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Listeners List */}
      <Paper
        sx={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
          Listeners
        </Typography>
        <Divider sx={{ opacity: 0.1 }} />
        <List
          sx={{
            maxHeight: '500px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
            },
          }}
        >
          {(listeners as SpaceListener[])?.map((listener, index) => (
            <React.Fragment key={`${listener.userId}-${index}`}>
              <ListItem
                sx={{ py: 2 }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(
                          `https://twitter.com/messages/compose?recipient_id=${listener.userId}&text=Hi`,
                          '_blank'
                        )
                      }
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { color: '#1DA1F2' },
                      }}
                    >
                      <Message fontSize="small" />
                    </IconButton>
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
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.open(
                          `https://twitter.com/intent/follow?screen_name=${listener.twitterScreenName}`,
                          '_blank',
                          'width=600,height=400'
                        )
                      }
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { color: '#1DA1F2' },
                      }}
                    >
                      <PersonAdd fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={listener.avatarUrl}
                    sx={{ cursor: 'pointer' }}
                    onClick={() =>
                      window.open(
                        `https://twitter.com/${listener.twitterScreenName}`,
                        '_blank'
                      )
                    }
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        component="span"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { color: '#1DA1F2' },
                        }}
                        onClick={() =>
                          window.open(
                            `https://twitter.com/${listener.twitterScreenName}`,
                            '_blank'
                          )
                        }
                      >
                        {listener.displayName}
                      </Box>
                      {/* <Chip
                        size="small"
                        label={listener.status === 'joined' ? 'Joined' : 'Left'}
                        sx={{
                          background:
                            listener.status === 'joined'
                              ? 'rgba(46, 204, 113, 0.2)'
                              : 'rgba(231, 76, 60, 0.2)',
                          color:
                            listener.status === 'joined'
                              ? '#2ecc71'
                              : '#e74c3c',
                          borderRadius: '4px',
                        }}
                      /> */}
                    </Box>
                  }
                  //   secondary={
                  //     <Typography variant="caption" color="text.secondary">
                  //       {format(new Date(listener.joinedAt || 0), 'h:mm a')}
                  //     </Typography>
                  //   }
                />
              </ListItem>
              {index < (listeners as SpaceListener[]).length - 1 && (
                <Divider sx={{ opacity: 0.1 }} />
              )}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default DashboardPanel;

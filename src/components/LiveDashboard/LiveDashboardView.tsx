import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Space, SpaceListener } from '../../services/db/spaces.service';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, orderBy, query, DocumentData } from 'firebase/firestore';
import { db } from '../../services/firebase.service';
import { Toaster } from 'react-hot-toast';
import DashboardStats from './DashboardStats';
import ListenerNotifications from './ListenerNotifications';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useAuthContext } from '../../contexts/AuthContext';
import TwitterLogin from '../TwitterLogin';

interface LiveDashboardViewProps {
  spaceId: string;
  space: Space | null;
}

// Custom shape component for Scatter plot points
const CustomScatterShape = (props: any) => {
  const { cx, cy, payload } = props;
  const { avatarUrl, displayName, twitterScreenName, userId } = payload;
  const SIZE = 20; // Size of the avatar

  if (!cx || !cy) {
    return null; // Don't render if coordinates are invalid
  }

  // Render SVG image element for the avatar
  // Use a clipPath to make the image circular
  return (
    <g>
      <defs>
        <clipPath id={`clip-${userId}`}>
          <circle cx={cx} cy={cy} r={SIZE / 2} />
        </clipPath>
      </defs>
      {avatarUrl ? (
        <image
          x={cx - SIZE / 2}
          y={cy - SIZE / 2}
          width={SIZE}
          height={SIZE}
          href={avatarUrl}
          clipPath={`url(#clip-${userId})`}
          preserveAspectRatio="xMidYMid slice" // Ensures the image covers the circle area
        />
      ) : (
        // Fallback shape if no avatar_url (e.g., a simple circle)
        <circle
          cx={cx}
          cy={cy}
          r={SIZE / 2}
          fill={props.fill}
          stroke={'#fff'}
          strokeWidth={1}
        />
      )}
      {/* Optional: Add a border or background to the circle */}
      <circle
        cx={cx}
        cy={cy}
        r={SIZE / 2}
        fill="none"
        stroke={props.fill}
        strokeWidth={1.5}
      />
    </g>
  );
};

const LiveDashboardView: React.FC<LiveDashboardViewProps> = ({
  spaceId,
  space,
}) => {
  const { user } = useAuthContext();
  const theme = useTheme();
  const [previousListeners, setPreviousListeners] = useState<SpaceListener[]>(
    []
  );
  // const [currentUserJoinedAt, setCurrentUserJoinedAt] = useState<number | null>(
  //   null
  // );
  // const [chartListeners, setChartListeners] = useState<SpaceListener[]>([]);

  // // Query all listeners (removed limit)
  const [leftListeners] = useCollectionData(
    query(
      collection(db, 'spaces', spaceId, 'listenerLogs'),
      orderBy('joinedAt', 'desc') // Keep ordering if needed, or remove if natural order is fine
    )
  );

  // Query all listeners (removed limit)
  const [liveListeners, loading, error] = useCollectionData(
    query(
      collection(db, 'spaces', spaceId, 'liveListeners'),
      orderBy('joinedAt', 'desc') // Keep ordering if needed, or remove if natural order is fine
    )
  );

  useEffect(() => {
    if (liveListeners?.length && previousListeners.length === 0) {
      setPreviousListeners(liveListeners as SpaceListener[]);
    }
  }, [liveListeners]);
  // const allListeners = [...(liveListeners || []), ...(leftListeners || [])];

  // // Debug logging
  // useEffect(() => {
  //   console.log('Raw listener data:', listeners);
  //   if (listeners.length > 0) {
  //     console.log('Sample listener structure:', JSON.stringify(listeners[0], null, 2));
  //     console.log('Sample listener keys:', Object.keys(listeners[0]));
  //   }
  //   console.log('Space ID:', spaceId);
  //   console.log('Loading:', loading);
  //   console.log('Error:', error);
  // }, [listeners, spaceId, loading, error]);

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        background: theme.palette.background.default,
      }}
    >
      <Toaster position="bottom-right" />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 4,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Live Space Dashboard
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              mt: 0.5,
            }}
          >
            {space?.title || 'Loading space...'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            p: 1.5,
            borderRadius: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            Status:
            <span
              style={{
                color:
                  space?.state === 'Running'
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                marginLeft: '4px',
                fontWeight: 'bold',
              }}
            >
              {space?.state.toUpperCase() || 'Unknown'}
            </span>
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(12, 1fr)',
          filter: !user ? 'blur(8px)' : 'none',
          pointerEvents: !user ? 'none' : 'auto',
          userSelect: !user ? 'none' : 'auto',
        }}
      >
        {/* Stats Panel */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <DashboardStats space={space} />
        </Box>

        {/* Main Visualization - Scatter Plot */}
        <Box sx={{ gridColumn: 'span 9', height: '600px', minWidth: 0 }}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Participant Join Timeline {loading ? '(Loading...)' : ''}
              {error && (
                <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                  Error: {error.toString()}
                </Typography>
              )}
            </Typography>
            <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 30,
                    bottom: 50,
                    left: 20, // Increased bottom margin for labels
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                  />
                  <XAxis
                    dataKey="x"
                    type="number"
                    name="Joined At"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(unixTime) =>
                      format(new Date(unixTime), 'HH:mm:ss')
                    }
                    angle={-45} // Angle labels for better readability
                    textAnchor="end"
                    height={60} // Increase height to accommodate angled labels
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis
                    dataKey="y"
                    type="number"
                    name="Listener Index"
                    hide // Hide Y-axis as it's just for vertical separation
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Paper
                            sx={{
                              p: 1,
                              background: 'rgba(0, 0, 0, 0.8)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {data.avatarUrl && (
                              <img
                                src={data.avatarUrl}
                                alt={data.displayName}
                                width={24}
                                height={24}
                                style={{ borderRadius: '50%' }}
                              />
                            )}
                            <Typography variant="caption">
                              {data.displayName} (@{data.twitterScreenName})
                              <br />
                              Joined: {format(new Date(data.x), 'PPpp')}
                            </Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {space?.state === 'Running' ? (
                    <>
                      <Scatter
                        name="Live Participants"
                        data={
                          liveListeners?.map((listener, index) => ({
                            ...listener,
                            x: listener.joinedAt,
                            y: index + 1, // Ensure we have a valid y coordinate
                          })) || []
                        }
                        fill={theme.palette.primary.main}
                        shape={<CustomScatterShape />}
                      />
                      <Scatter
                        name="Left Listeners"
                        data={
                          leftListeners?.map((listener, index) => ({
                            ...listener,
                            x: listener.leftAt,
                            y: index + 1,
                          })) || []
                        }
                        fill={theme.palette.error.main}
                        shape={<CustomScatterShape />}
                      />
                    </>
                  ) : (
                    <Scatter
                      name="Participants"
                      data={
                        leftListeners?.map((listener, index) => ({
                          ...listener,
                          x: listener.joinedAt,
                          y: index + 1,
                        })) || []
                      }
                      fill={theme.palette.primary.main}
                      shape={<CustomScatterShape />}
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Notifications Panel */}
        <Box sx={{ gridColumn: 'span 3' }}>
          {liveListeners && (
            <ListenerNotifications
              listeners={liveListeners as SpaceListener[]}
              previousListeners={
                previousListeners.length
                  ? previousListeners
                  : (liveListeners as SpaceListener[])
              }
              updatePreviousListeners={() => {
                setPreviousListeners(liveListeners as SpaceListener[]);
              }}
            />
          )}
        </Box>
      </Box>

      {/* Authentication Dialog */}
      <Dialog
        open={!user}
        PaperProps={{
          sx: {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            minWidth: { xs: '90%', sm: 400 },
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}
        >
          Welcome to Songjam
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              mb: 3,
            }}
          >
            Connect your Twitter account to access Space analytics, audience
            insights, and AI-powered tools.
          </DialogContentText>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <TwitterLogin />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LiveDashboardView;

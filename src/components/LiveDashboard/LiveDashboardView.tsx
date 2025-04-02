import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Space, User } from '../../services/db/spaces.service';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, orderBy, query, DocumentData } from 'firebase/firestore';
import { db } from '../../services/firebase.service';
import { Toaster } from 'react-hot-toast';
import DashboardStats from './DashboardStats';
import ListenerNotifications from './ListenerNotifications';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface LiveDashboardViewProps {
  spaceId: string;
  space: Space | null;
}

// Custom shape component for Scatter plot points
const CustomScatterShape = (props: any) => {
  const { cx, cy, payload } = props;
  const { avatar_url, display_name } = payload;
  const SIZE = 20; // Size of the avatar

  if (!cx || !cy) {
    return null; // Don't render if coordinates are invalid
  }

  // Render SVG image element for the avatar
  // Use a clipPath to make the image circular
  return (
    <g>
      <defs>
        <clipPath id={`clip-${payload.user_id}`}>
          <circle cx={cx} cy={cy} r={SIZE / 2} />
        </clipPath>
      </defs>
      {avatar_url ? (
        <image
          x={cx - SIZE / 2}
          y={cy - SIZE / 2}
          width={SIZE}
          height={SIZE}
          href={avatar_url}
          clipPath={`url(#clip-${payload.user_id})`}
          preserveAspectRatio="xMidYMid slice" // Ensures the image covers the circle area
        />
      ) : (
        // Fallback shape if no avatar_url (e.g., a simple circle)
        <circle cx={cx} cy={cy} r={SIZE / 2} fill={props.fill} stroke={'#fff'} strokeWidth={1}/>
      )}
      {/* Optional: Add a border or background to the circle */}
       <circle cx={cx} cy={cy} r={SIZE / 2} fill="none" stroke={props.fill} strokeWidth={1.5} />
    </g>
  );
};

const LiveDashboardView: React.FC<LiveDashboardViewProps> = ({ spaceId, space }) => {
  const theme = useTheme();
  const [previousListeners, setPreviousListeners] = useState<User[]>([]);
  const [currentUserJoinedAt, setCurrentUserJoinedAt] = useState<number | null>(null);

  // Query all listeners (removed limit)
  const [listeners = [], loading, error] = useCollectionData(
    query(
      collection(db, 'spaces', spaceId, 'listeners'),
      orderBy('joinedAt', 'desc') // Keep ordering if needed, or remove if natural order is fine
    ),
    {
      // idField: 'id' // Removed to resolve type error
    }
  );

  // Debug logging
  useEffect(() => {
    console.log('Raw listener data:', listeners);
    if (listeners.length > 0) {
      console.log('Sample listener structure:', JSON.stringify(listeners[0], null, 2));
      console.log('Sample listener keys:', Object.keys(listeners[0]));
    }
    console.log('Space ID:', spaceId);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [listeners, spaceId, loading, error]);

  // Convert DocumentData to User type and filter active listeners
  const typedListeners = useCallback((data: DocumentData[]): User[] => {
    console.log('Converting listeners, first checking data structure...');
    if (data.length > 0) {
      const sample = data[0];
      console.log('Sample listener before conversion:', sample);
      console.log('Sample listener fields:', Object.keys(sample));
    }
    
    const converted = data
      .map(doc => {
        // Log the raw document for debugging
        console.log('Processing doc:', doc);
        
        const user: User = {
          user_id: doc.id || doc.userId || doc.user_id,
          display_name: doc.displayName || doc.display_name || doc.name || 'Anonymous',
          twitter_screen_name: doc.twitterScreenName || doc.twitter_screen_name || doc.username || '',
          avatar_url: doc.avatarUrl || doc.avatar_url || doc.avatar || '',
          is_verified: Boolean(doc.isVerified || doc.is_verified),
          status: doc.status || 'joined',
          joinedAt: doc.joinedAt?.seconds ? doc.joinedAt.seconds * 1000 : Date.now()
        };

        // Log the converted user
        console.log('Converted user:', user);
        return user;
      })
      .filter(user => {
        const isValid = Boolean(user.user_id && user.display_name);
        if (!isValid) {
          console.log('Invalid user filtered out:', user);
        }
        return isValid;
      });
      
    console.log('Final converted listeners:', converted);
    return converted;
  }, []);

  // Track listener changes for notifications and set current user join time (placeholder)
  useEffect(() => {
    const currentListeners = typedListeners(listeners);

    // Placeholder: Assume the first user fetched is the current user
    // Replace this with actual logic to identify the current user
    if (currentListeners.length > 0 && currentUserJoinedAt === null) {
        // Sort by joinedAt ascending to potentially get the host/first user
        const sortedListeners = [...currentListeners].sort((a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0));
         console.log("Setting placeholder currentUserJoinedAt:", sortedListeners[0]?.joinedAt);
        setCurrentUserJoinedAt(sortedListeners[0]?.joinedAt ?? Date.now()); // Fallback to now if undefined
    }


    const newListeners = currentListeners.filter(
      listener => !previousListeners.some(pl => pl.user_id === listener.user_id)
    );

    console.log('Current listeners:', currentListeners);
    console.log('Previous listeners:', previousListeners);
    console.log('New listeners:', newListeners);

    if (newListeners.length > 0) {
      setPreviousListeners(currentListeners); // Update previousListeners only when there are new ones
    }
  }, [listeners, typedListeners, previousListeners, currentUserJoinedAt]); // Added currentUserJoinedAt dependency

  if (!spaceId) {
    return null;
  }

  const currentListeners = typedListeners(listeners);

  // Prepare data for scatter plot
  const beforeCurrentUser = currentListeners
    .filter(l => currentUserJoinedAt && (l.joinedAt ?? 0) <= currentUserJoinedAt)
    .map((l, index) => ({ ...l, x: l.joinedAt ?? 0, y: index + 1 }));

  const afterCurrentUser = currentListeners
    .filter(l => currentUserJoinedAt && (l.joinedAt ?? 0) > currentUserJoinedAt)
    .map((l, index) => ({ ...l, x: l.joinedAt ?? 0, y: index + 1 }));

  console.log("Before Current User:", beforeCurrentUser);
  console.log("After Current User:", afterCurrentUser);
  console.log("Current User Joined At:", currentUserJoinedAt);


  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        background: theme.palette.background.default,
      }}
    >
      <Toaster position="top-right" />
      
      <Typography variant="h4" sx={{ mb: 4 }}>
        Live Space Dashboard {loading ? '(Loading...)' : `(${currentListeners.length} listeners)`}
      </Typography>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(12, 1fr)' }}>
        {/* Stats Panel */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <DashboardStats space={space} currentListeners={currentListeners.length} />
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
              Listener Join Timeline {loading ? '(Loading...)' : ''}
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
                    top: 20, right: 30, bottom: 50, left: 20, // Increased bottom margin for labels
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="x" 
                    type="number" 
                    name="Joined At" 
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(unixTime) => format(new Date(unixTime), 'HH:mm:ss')}
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
                          <Paper sx={{ p: 1, background: 'rgba(0, 0, 0, 0.8)', color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                           {data.avatar_url && <img src={data.avatar_url} alt={data.display_name} width={24} height={24} style={{ borderRadius: '50%' }} />}
                            <Typography variant="caption">
                              {data.display_name} (@{data.twitter_screen_name})<br />
                              Joined: {format(new Date(data.x), 'PPpp')}
                            </Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Scatter 
                    name="Joined Before/With You" 
                    data={beforeCurrentUser} 
                    fill={theme.palette.primary.main} 
                    shape={<CustomScatterShape />} // Use custom shape
                  />
                  <Scatter 
                    name="Joined After You" 
                    data={afterCurrentUser} 
                    fill={theme.palette.secondary.main} 
                    shape={<CustomScatterShape />} // Use custom shape
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        {/* Notifications Panel */}
        <Box sx={{ gridColumn: 'span 3' }}>
          <ListenerNotifications 
            listeners={currentListeners}
            previousListeners={previousListeners}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LiveDashboardView; 
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Space, SpaceListener } from '../../services/db/spaces.service';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase.service';
import toast, { Toaster } from 'react-hot-toast';
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
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginDialog from '../LoginDialog';
import {
  Campaign,
  campaignsByProjectSpaceId,
  createCampaign,
} from '../../services/db/campaign.service';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { LoadingButton } from '@mui/lab';
import MapView from '../../pages/MapView';
import MapIcon from '@mui/icons-material/Map';
import TimelineIcon from '@mui/icons-material/Timeline';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { MapDataPoint, GeocodedSpaceListener } from '../../types/map.types';
import {
  geocodeLocationWithCache,
  extractCoordinates,
} from '../../services/geocoding.service';

interface LiveDashboardViewProps {
  spaceId: string;
  space: Space | null;
}

// Custom shape component for Scatter plot points
export const CustomScatterShape = (props: any) => {
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
  const { user, loading: authLoading } = useAuthContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const [previousListeners, setPreviousListeners] = useState<SpaceListener[]>(
    []
  );
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [isBoosting, setIsBoosting] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');
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
  // const [leftListeners, setLeftListeners] = useState<SpaceListener[]>([]);

  // useEffect(() => {
  //   if (waitLeftListeners?.length) {
  //     setLeftListeners(waitLeftListeners.slice(0, 8) as any);

  //     setTimeout(() => {
  //       setLeftListeners(waitLeftListeners as any);
  //     }, 20000);
  //   }
  // }, [waitLeftListeners]);

  // Query all listeners (removed limit)
  const [liveListeners, loading, error] = useCollectionData(
    query(
      collection(
        db,
        'spaces',
        spaceId,
        space?.state === 'Ended' ? 'listenerLogs' : 'liveListeners'
      ),
      orderBy('joinedAt', 'desc') // Keep ordering if needed, or remove if natural order is fine
    )
  );

  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [geocodedListeners, setGeocodedListeners] = useState<
    GeocodedSpaceListener[]
  >([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const processedListenersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (
      liveListeners?.length &&
      previousListeners.length === 0 &&
      space?.state !== 'Ended'
    ) {
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

  const fetchCampaign = async (id: string) => {
    if (!user?.defaultProjectId) {
      toast.error('Please set a default project');
      return;
    }
    setIsBoosting(true);
    const campaignExists = await campaignsByProjectSpaceId(
      id,
      user.defaultProjectId
    );
    if (campaignExists?.length) {
      setUserCampaigns(campaignExists);
    }
    setIsBoosting(false);
  };

  useEffect(() => {
    if (spaceId && user) {
      fetchCampaign(spaceId);
    }
  }, [spaceId, user]);

  useEffect(() => {
    if (liveListeners?.length || leftListeners?.length) {
      const onlyLocationUsers = [
        ...(liveListeners || []),
        ...(leftListeners || []),
      ].filter((listener) => listener.location) as SpaceListener[];

      // Find new listeners that haven't been processed yet
      const newListeners = onlyLocationUsers.filter(
        (listener) => !processedListenersRef.current.has(listener.userId)
      );

      if (newListeners.length > 0) {
        // Add only new listeners to the existing array
        const newGeocodedListeners: GeocodedSpaceListener[] = newListeners.map(
          (listener) => ({
            ...listener,
            geocodingStatus: 'pending' as const,
          })
        );

        setGeocodedListeners((prev) => [...prev, ...newGeocodedListeners]);

        // Mark these listeners as processed
        newListeners.forEach((listener) => {
          processedListenersRef.current.add(listener.userId);
        });

        // Start geocoding process for only the new listeners
        geocodeListeners(newListeners);
      }
    }
  }, [liveListeners, leftListeners]);

  const geocodeListeners = async (listeners: SpaceListener[]) => {
    if (isGeocoding) return;

    setIsGeocoding(true);

    try {
      const listenersWithLocation = listeners.filter(
        (listener) => listener.location
      );

      for (let i = 0; i < listenersWithLocation.length; i++) {
        const listener = listenersWithLocation[i];

        try {
          // Update status to pending
          setGeocodedListeners((prev) =>
            prev.map((l) =>
              l.userId === listener.userId
                ? { ...l, geocodingStatus: 'pending' as const }
                : l
            )
          );

          // Geocode the location (this will check cache internally and cache the result)
          const geocodingResult = await geocodeLocationWithCache(
            listener.location
          );
          const coordinates = extractCoordinates(geocodingResult);

          // Update with coordinates if found
          setGeocodedListeners((prev) =>
            prev.map((l) =>
              l.userId === listener.userId
                ? {
                    ...l,
                    coordinates,
                    country: geocodingResult[0]?.display_name?.split(',').pop(),
                    geocodingStatus: coordinates
                      ? ('success' as const)
                      : ('failed' as const),
                  }
                : l
            )
          );

          // Add delay to respect rate limits
          if (i < listenersWithLocation.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(
            `Failed to geocode location for ${listener.displayName}:`,
            error
          );

          // Update status to failed
          setGeocodedListeners((prev) =>
            prev.map((l) =>
              l.userId === listener.userId
                ? { ...l, geocodingStatus: 'failed' as const }
                : l
            )
          );
        }
      }
    } catch (error) {
      console.error('Geocoding process failed:', error);
      toast.error('Failed to geocode some locations');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Update map data when geocoded listeners change
  useEffect(() => {
    const listenersWithCoordinates = geocodedListeners.filter(
      (listener) =>
        listener.coordinates && listener.geocodingStatus === 'success'
    );

    const newMapData: MapDataPoint[] = listenersWithCoordinates.map(
      (listener) => ({
        username: `@${listener.twitterScreenName}`,
        name: listener.displayName,
        location: listener.location,
        coordinates: listener.coordinates!,
        followers: listener.followersCount,
        bio: listener.biography,
        verified: listener.isVerified,
        userId: listener.userId,
        avatarUrl: listener.avatarUrl,
        country: listener.country,
      })
    );

    setMapData(newMapData);
  }, [geocodedListeners]);

  const successfullyGeocodedListeners = geocodedListeners.filter(
    (listener) => listener.geocodingStatus === 'success'
  );
  const failedGeocodedListeners = geocodedListeners.filter(
    (listener) => listener.geocodingStatus === 'failed'
  );
  const pendingGeocodedListeners = geocodedListeners.filter(
    (listener) => listener.geocodingStatus === 'pending'
  );

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
          <Box display={'flex'} alignItems={'center'} gap={4}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', color: 'white' }}
            >
              Live Space Dashboard
            </Typography>
            <Box display={'flex'} alignItems={'center'} gap={2}>
              <LoadingButton
                variant="contained"
                color="primary"
                onClick={async () => {
                  navigate(`/crm/${spaceId}`);
                }}
                size="small"
                endIcon={<OpenInNewIcon />}
                disabled={isBoosting}
                loading={isBoosting}
              >
                Go to CRM
              </LoadingButton>
              <LoadingButton
                variant="contained"
                color="primary"
                onClick={async () => {
                  const spaceCampaign = userCampaigns.find(
                    (c) => c.ctaType === 'space'
                  );
                  if (spaceCampaign) {
                    window.open(`/campaigns/${spaceCampaign.id}`, '_blank');
                  } else {
                    if (!user || !space?.title) {
                      toast.error('Please login to boost space');
                      return;
                    }
                    setIsBoosting(true);
                    const campaign = await createCampaign({
                      spaceId,
                      projectId: user?.defaultProjectId || '',
                      userId: user?.uid,
                      status: 'DRAFT',
                      createdAt: Date.now(),
                      ctaType: 'space',
                      ctaTarget: space?.title,
                      spaceTitle: space?.title,
                      hostHandle: space?.admins[0].twitterScreenName,
                      description: '',
                      topics: space?.topics || [],
                      scheduledStart:
                        space?.scheduledStart || space.startedAt || 0,
                      campaignType: 'listeners',
                      addedType: 'NEW',
                    });
                    // await fetchCampaign(spaceId);
                    toast.success('Campaign created successfully');
                    setIsBoosting(false);
                    window.open(`/campaigns/${campaign.id}`, '_blank');
                  }
                }}
                size="small"
                endIcon={<OpenInNewIcon />}
                disabled={isBoosting}
                loading={isBoosting}
              >
                Boost Space
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                color="primary"
                onClick={async () => {
                  const followCampaign = userCampaigns.find(
                    (c) => c.ctaType === 'follow'
                  );
                  if (followCampaign) {
                    window.open(`/campaigns/${followCampaign.id}`, '_blank');
                  } else {
                    if (!user || !space?.title) {
                      toast.error('Please login to boost space');
                      return;
                    }
                    setIsBoosting(true);
                    const campaign = await createCampaign({
                      spaceId,
                      projectId: user?.defaultProjectId || '',
                      userId: user?.uid,
                      status: 'DRAFT',
                      createdAt: Date.now(),
                      ctaType: 'follow',
                      ctaTarget: '',
                      spaceTitle: space?.title,
                      hostHandle: space?.admins[0].twitterScreenName,
                      description: '',
                      topics: space?.topics || [],
                      scheduledStart:
                        space?.scheduledStart || space.startedAt || 0,
                      campaignType: 'listeners',
                      addedType: 'NEW',
                    });
                    // await fetchCampaign(spaceId);
                    toast.success('Campaign created successfully');
                    setIsBoosting(false);
                    window.open(`/campaigns/${campaign.id}`, '_blank');
                  }
                }}
                size="small"
                endIcon={<OpenInNewIcon />}
                disabled={isBoosting}
                loading={isBoosting}
              >
                Boost Followers
              </LoadingButton>
            </Box>
          </Box>
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
          <IconButton
            onClick={() => {
              navigate(`/dashboard`);
            }}
          >
            <ArrowBackIcon />
          </IconButton>
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

        {/* Main Visualization - Toggle between Timeline and Map */}
        <Box sx={{ gridColumn: 'span 9', height: '1000px', minWidth: 0 }}>
          <Paper
            sx={{
              p: 3,
              // height: viewMode === 'timeline' ? '100%' : '600px',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              // overflow: 'hidden',
              ...(viewMode === 'map' ? {} : { height: '600px' }),
            }}
          >
            {/* Header with title and toggle */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" zIndex={999}>
                {viewMode === 'timeline'
                  ? `Participant Join Timeline ${loading ? '(Loading...)' : ''}`
                  : 'Geographic Distribution'}
                {error && (
                  <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                    Error: {error.toString()}
                  </Typography>
                )}
              </Typography>

              {/* View Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(event, newViewMode) => {
                  if (newViewMode !== null) {
                    setViewMode(newViewMode);
                  }
                }}
                size="small"
                sx={{
                  zIndex: 999,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiToggleButton-root': {
                    color: theme.palette.text.secondary,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                }}
              >
                <ToggleButton value="timeline" aria-label="timeline view">
                  <TimelineIcon sx={{ mr: 1 }} />
                  Timeline
                </ToggleButton>
                <ToggleButton value="map" aria-label="map view">
                  <MapIcon sx={{ mr: 1 }} />
                  Map
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Content area */}
            <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
              {viewMode === 'timeline' ? (
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
                          onClick={(e) => {
                            const payload = e.payload;
                            window.open(
                              `https://x.com/${payload.twitterScreenName}`,
                              '_blank'
                            );
                          }}
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
              ) : (
                <Box>
                  {/* Listener Statistics Dashboard */}
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 1,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="text.primary"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Listener Analytics
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 3,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      {/* Total Listeners */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          borderRadius: 1,
                          border: '1px solid rgba(25, 118, 210, 0.3)',
                          minWidth: 120,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#1976d2',
                          }}
                        />
                        <Box>
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          >
                            {[
                              ...(liveListeners || []),
                              ...(leftListeners || []),
                            ]?.length || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Listeners
                          </Typography>
                        </Box>
                      </Box>

                      {/* Listeners with Location */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          bgcolor: 'rgba(156, 39, 176, 0.1)',
                          borderRadius: 1,
                          border: '1px solid rgba(156, 39, 176, 0.3)',
                          minWidth: 120,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#9c27b0',
                          }}
                        />
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ color: '#9c27b0', fontWeight: 600 }}
                          >
                            {geocodedListeners.length || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            With Location
                          </Typography>
                        </Box>
                      </Box>

                      {/* Successfully Geocoded */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          borderRadius: 1,
                          border: '1px solid rgba(76, 175, 80, 0.3)',
                          minWidth: 120,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#4caf50',
                          }}
                        />
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ color: '#4caf50', fontWeight: 600 }}
                          >
                            {successfullyGeocodedListeners.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Geocoded
                          </Typography>
                        </Box>
                      </Box>

                      {/* Geocoding Progress */}
                      {isGeocoding && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                            borderRadius: 1,
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            minWidth: 120,
                          }}
                        >
                          <CircularProgress
                            size={16}
                            sx={{ color: '#ff9800' }}
                          />
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ color: '#ff9800', fontWeight: 600 }}
                            >
                              {pendingGeocodedListeners.length}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Processing
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Failed Geocoding */}
                      {failedGeocodedListeners.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            borderRadius: 1,
                            border: '1px solid rgba(244, 67, 54, 0.3)',
                            minWidth: 120,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#f44336',
                            }}
                          />
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ color: '#f44336', fontWeight: 600 }}
                            >
                              {failedGeocodedListeners.length}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Failed
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Progress Bar for Geocoding */}
                    {isGeocoding && (
                      <Box sx={{ mt: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Geocoding Progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {successfullyGeocodedListeners.length +
                              pendingGeocodedListeners.length}{' '}
                            / {geocodedListeners.length}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            geocodedListeners.length > 0
                              ? ((successfullyGeocodedListeners.length +
                                  pendingGeocodedListeners.length) /
                                  geocodedListeners.length) *
                                100
                              : 0
                          }
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#ff9800',
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <MapView data={mapData} />
                </Box>
              )}
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
      <LoginDialog open={!user && !authLoading} />
    </Box>
  );
};

export default LiveDashboardView;

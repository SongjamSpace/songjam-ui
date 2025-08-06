import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { MapDataPoint } from '../types/map.types';

interface MapViewProps {
  data?: MapDataPoint[];
}

const MapView: React.FC<MapViewProps> = ({ data }) => {
  const theme = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Function to handle overlapping coordinates
  const getAdjustedCoordinates = (dataPoints: MapDataPoint[]) => {
    const coordinateGroups: { [key: string]: any[] } = {};

    // Group users by coordinates
    dataPoints.forEach((user) => {
      const coordKey = `${user.coordinates[0]},${user.coordinates[1]}`;
      if (!coordinateGroups[coordKey]) {
        coordinateGroups[coordKey] = [];
      }
      coordinateGroups[coordKey].push(user);
    });

    // Add slight offsets for overlapping users
    const adjustedData = dataPoints.map((user) => {
      const coordKey = `${user.coordinates[0]},${user.coordinates[1]}`;
      const group = coordinateGroups[coordKey];

      if (group.length === 1) {
        return { ...user, adjustedCoordinates: user.coordinates };
      }

      // Find index in the group and add offset
      const index = group.findIndex((u) => u.username === user.username);
      const offset = 0.5; // Small offset in degrees
      const angle = (index * 2 * Math.PI) / group.length;

      const adjustedCoords: [number, number] = [
        user.coordinates[0] + Math.cos(angle) * offset,
        user.coordinates[1] + Math.sin(angle) * offset,
      ] as [number, number];

      return { ...user, adjustedCoordinates: adjustedCoords };
    });

    return adjustedData;
  };

  // Use provided data or fall back to mock data
  const dataToUse = data && data.length > 0 ? data : [];
  const adjustedData = getAdjustedCoordinates(dataToUse);

  // Calculate proportional sizes based on follower counts
  const getMarkerSize = (followers: number) => {
    const minSize = 3;
    const maxSize = 20;
    const minValue = Math.min(...dataToUse.map((d) => d.followers));
    const maxValue = Math.max(...dataToUse.map((d) => d.followers));

    return (
      minSize +
      ((followers - minValue) / (maxValue - minValue)) * (maxSize - minSize)
    );
  };

  const getVerifiedColor = (verified: boolean) => {
    return verified ? '#10b981' : '#f59e0b';
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // pb: 8,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ position: 'relative', zIndex: 1, flexGrow: 1 }}
      >
        <Grid container>
          {/* Map Section */}
          <Grid item xs={12} lg={12}>
            <Paper
              elevation={8}
              sx={{
                // p: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                height: '700px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <ComposableMap
                projection="geoEqualEarth"
                projectionConfig={{
                  scale: 147,
                }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <ZoomableGroup>
                  <Geographies
                    geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
                    fill="#D6D6DA"
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                  >
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#60a5fa"
                          stroke="#34495e"
                          strokeWidth={0.4}
                          style={{
                            default: { outline: 'none' },
                            hover: { fill: '#34495e', outline: 'none' },
                            pressed: { outline: 'none' },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {adjustedData.map(
                    ({
                      username,
                      name,
                      adjustedCoordinates,
                      followers,
                      bio,
                      verified,
                      location,
                    }) => (
                      <Marker
                        key={username}
                        coordinates={adjustedCoordinates as [number, number]}
                        onClick={() =>
                          setSelectedLocation({
                            username,
                            name,
                            followers,
                            bio,
                            verified,
                            location,
                          })
                        }
                      >
                        <Tooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#60a5fa',
                                  mb: 0.5,
                                }}
                              >
                                {name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#cbd5e1',
                                  mb: 0.5,
                                  fontFamily: 'monospace',
                                }}
                              >
                                {username}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#94a3b8',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                📍 {location}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#60a5fa',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  mt: 0.5,
                                }}
                              >
                                {followers.toLocaleString()} followers
                              </Typography>
                            </Box>
                          }
                          arrow
                          placement="top"
                          enterDelay={300}
                          leaveDelay={0}
                        >
                          <circle
                            r={getMarkerSize(followers)}
                            fill={getVerifiedColor(verified)}
                            stroke={verified ? '#60a5fa' : '#8b5cf6'}
                            strokeWidth={2.5}
                            style={{
                              cursor: 'pointer',
                              filter: `
                                drop-shadow(0 4px 8px rgba(0,0,0,0.4))
                                drop-shadow(0 2px 4px rgba(96, 165, 250, 0.3))
                              `,
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.2)';
                              e.currentTarget.style.filter = `
                                drop-shadow(0 6px 12px rgba(0,0,0,0.5))
                                drop-shadow(0 4px 8px rgba(96, 165, 250, 0.5))
                              `;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.filter = `
                                drop-shadow(0 4px 8px rgba(0,0,0,0.4))
                                drop-shadow(0 2px 4px rgba(96, 165, 250, 0.3))
                              `;
                            }}
                          />
                        </Tooltip>
                      </Marker>
                    )
                  )}
                </ZoomableGroup>
              </ComposableMap>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MapView;

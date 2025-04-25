import { Box, Paper, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Line,
  Tooltip,
} from 'recharts';
import theme from '../../theme';
import { Space } from '../../services/db/spaces.service';
import { getSegmentsByStartSeconds } from '../../services/db/spaces.service';
import { useState, useCallback, useRef } from 'react';

type Props = {
  broadcast: Space;
};

const ViewersChart = ({ broadcast }: Props) => {
  const [segments, setSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSegmentsData = useCallback(
    async (timeInSeconds: number) => {
      if (!broadcast.spaceId) return;

      setIsLoading(true);
      try {
        const fetchedSegments = await getSegmentsByStartSeconds(
          broadcast.spaceId,
          timeInSeconds
        );
        setSegments(fetchedSegments);
      } catch (error) {
        console.error('Error fetching segments:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [broadcast.spaceId]
  );

  // Handle tooltip hover with debouncing
  const handleTooltipChange = useCallback(
    (time: number) => {
      // Don't refetch if we're already showing this time
      if (hoveredTime === time) return;

      setHoveredTime(time);

      // Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new timer for debounce
      debounceTimerRef.current = setTimeout(() => {
        fetchSegmentsData(time);
      }, 300); // 300ms debounce time
    },
    [fetchSegmentsData, hoveredTime]
  );

  return (
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        height: 400,
        width: '100%',
        p: 2,
        bgcolor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
      }}
    >
      {broadcast.broadcastInfo.viewCountGraph?.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            margin={{
              top: 20,
              right: 30,
              bottom: 50,
              left: 20,
            }}
            data={broadcast.broadcastInfo.viewCountGraph.map(
              (viewers, index) => {
                if (!broadcast.endedAt || !broadcast.startedAt) {
                  return { x: 0, y: viewers };
                }
                // Calculate relative time in seconds from broadcast start
                const totalDuration = broadcast.endedAt - broadcast.startedAt;
                const timeInterval =
                  totalDuration /
                  (broadcast.broadcastInfo.viewCountGraph.length - 1 || 1);
                const relativeTimeInSeconds = (index * timeInterval) / 1000; // Convert ms to seconds

                return {
                  x: relativeTimeInSeconds,
                  y: viewers,
                };
              }
            )}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 'dataMax']}
              tickFormatter={(seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = Math.floor(seconds % 60);
                return `${minutes}:${remainingSeconds
                  .toString()
                  .padStart(2, '0')}`;
              }}
              name="Time"
              angle={-45}
              textAnchor="end"
              height={60}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="Views"
              stroke={theme.palette.text.secondary}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const minutes = Math.floor(data.x / 60);
                  const seconds = Math.floor(data.x % 60);

                  // Call the debounced fetch function when tooltip is active
                  if (active) {
                    handleTooltipChange(data.x);
                  }

                  return (
                    <Paper
                      sx={{
                        p: 1.5,
                        background: 'rgba(0, 0, 0, 0.85)',
                        color: '#fff',
                        maxWidth: 300,
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                      >
                        Time: {minutes}:{seconds.toString().padStart(2, '0')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Views: {data.y}
                      </Typography>

                      {isLoading ? (
                        <Typography variant="caption">
                          Loading segments...
                        </Typography>
                      ) : segments.length > 0 ? (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 'bold',
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            Transcript at this time:
                          </Typography>
                          {segments.map((segment, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 0.5,
                                p: 0.5,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 0.5,
                              }}
                            >
                              {segment.text && (
                                <Typography
                                  variant="caption"
                                  component="div"
                                  sx={{
                                    fontSize: '0.7rem',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                  }}
                                >
                                  {segment.text}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption">
                          No segments found at this time
                        </Typography>
                      )}
                    </Paper>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="y"
              name="Views"
              stroke={theme.palette.primary.main}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography>No view data available</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ViewersChart;

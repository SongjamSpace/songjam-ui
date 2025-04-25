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

type Props = {
  broadcast: Space;
};

const ViewersChart = ({ broadcast }: Props) => {
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
                  return (
                    <Paper
                      sx={{
                        p: 1,
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: '#fff',
                      }}
                    >
                      <Typography variant="caption">
                        Time: {minutes}:{seconds.toString().padStart(2, '0')}
                        <br />
                        Views: {data.y}
                      </Typography>
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

import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { getSpaceListeners, SpaceListener } from '../../services/db/spaces.service';

// Define the context structure
export interface RetentionContext {
  averageListenTimeSeconds: number | null;
  chartData: ChartDataPoint[]; // The processed data used by the chart
}

interface ListenerRetentionChartProps {
  spaceId: string | undefined;
  startedAt: number | undefined; // Expecting milliseconds since epoch
  endedAt: number | undefined; // Expecting milliseconds since epoch
  onContextUpdate: (context: RetentionContext | null) => void; // New prop
}

interface ChartDataPoint {
  time: number; // Milliseconds since epoch
  count: number; // Total listeners at this time
  joinCount: number; // Listeners who joined in the interval leading up to this time
  leaveCount: number; // Listeners who left in the interval leading to this time
  timeLabel: string; // Formatted time for XAxis
}

const ListenerRetentionChart: React.FC<ListenerRetentionChartProps> = ({
  spaceId,
  startedAt,
  endedAt,
  onContextUpdate,
}) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [averageListenTimeSeconds, setAverageListenTimeSeconds] = useState<number | null>(null);
  const [lineVisibility, setLineVisibility] = useState({
    count: 1, // 1 for visible, 0 for hidden
    joinCount: 1,
    leaveCount: 1,
  });

  // Callback to handle legend click
  const handleLegendClick = useCallback((o: any) => {
    const { dataKey } = o;
    setLineVisibility((prev) => ({
      ...prev,
      [dataKey]: prev[dataKey as keyof typeof prev] === 1 ? 0 : 1,
    }));
  }, []);

  useEffect(() => {
    if (!spaceId || !startedAt || !endedAt || startedAt >= endedAt) {
        // Reset or set empty state if props are invalid/missing
        setChartData([]);
        setAverageListenTimeSeconds(null);
        onContextUpdate(null); // Clear context if props are invalid
        if (startedAt && endedAt && startedAt >= endedAt) {
            setError(t('errorInvalidTimeRange'));
        } else {
            // Don't show an error if props just aren't ready yet
            setError(null);
        }
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setChartData([]); // Clear previous data
      setAverageListenTimeSeconds(null);
      onContextUpdate(null); // Clear context at start of fetch

      try {
        const listenerLogs = await getSpaceListeners(spaceId);
        setAverageListenTimeSeconds(null); // Reset average time initially

        if (!listenerLogs || listenerLogs.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }

        // --- Calculate Average Listen Time ---
        let totalDurationMillis = 0;
        let validListenerCount = 0;
        listenerLogs.forEach((listener: SpaceListener) => {
            const joinTime = listener.joinedAt;
            // Use space end time if listener never left or leftAt is invalid
            const leaveTime = (typeof listener.leftAt === 'number' && listener.leftAt > joinTime) ? listener.leftAt : endedAt;

            if (typeof joinTime === 'number') {
                 const duration = leaveTime - joinTime;
                 if (duration > 0) { // Only count valid positive durations
                    totalDurationMillis += duration;
                    validListenerCount++;
                 }
            }
        });

        if (validListenerCount > 0) {
             setAverageListenTimeSeconds(Math.round(totalDurationMillis / validListenerCount / 1000));
        } else {
            setAverageListenTimeSeconds(0); // Or null, depending on desired display for no listeners
        }
        // --- End Average Calculation ---

        const processedData: ChartDataPoint[] = [];
        const intervalMillis = 60 * 1000; // 1 minute intervals
        const spaceEndTime = endedAt; // Use actual end time

        for (let t = startedAt; t <= spaceEndTime; t += intervalMillis) {
          let currentListenerCount = 0;
          let joinsInInterval = 0;
          let leavesInInterval = 0;
          const intervalEndTime = t + intervalMillis; // End of the current interval

          listenerLogs.forEach((listener: SpaceListener) => {
            const joinTime = listener.joinedAt;
            const leaveTime = listener.leftAt;

            if (typeof joinTime !== 'number') return;

            // Calculate total count at time 't'
            const joinedBeforeOrAt = joinTime <= t;
            const leftAfter = leaveTime === null || (typeof leaveTime === 'number' && leaveTime > t);
            if (joinedBeforeOrAt && leftAfter) {
              currentListenerCount++;
            }

            // Calculate joins in the interval [t, intervalEndTime)
            if (joinTime >= t && joinTime < intervalEndTime) {
                 joinsInInterval++;
            }

            // Calculate leaves in the interval [t, intervalEndTime)
            if (leaveTime !== null && typeof leaveTime === 'number' && leaveTime >= t && leaveTime < intervalEndTime) {
                 leavesInInterval++;
            }
          });

          // Calculate elapsed time since start
          const elapsedMillis = t - startedAt;
          const totalElapsedSeconds = Math.max(0, Math.floor(elapsedMillis / 1000));
          const totalElapsedMinutes = Math.floor(totalElapsedSeconds / 60);
          const elapsedHours = Math.floor(totalElapsedMinutes / 60);
          const remainingMinutes = totalElapsedMinutes % 60;
          // Format as HH:MM
          const formattedElapsedTime = `${String(elapsedHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;

          processedData.push({
            time: t,
            count: currentListenerCount,
            joinCount: joinsInInterval,
            leaveCount: leavesInInterval,
            timeLabel: formattedElapsedTime, // Use formatted HH:MM time
          });
        }

        // Adjust final point calculation if needed - currently focuses on total count
        // For simplicity, we'll omit specific join/leave counts for the exact end moment
        if (processedData[processedData.length - 1]?.time < spaceEndTime) {
             let finalListenerCount = 0;
             const finalTime = spaceEndTime;
             listenerLogs.forEach((listener: SpaceListener) => {
                 const joinTime = listener.joinedAt;
                 const leaveTime = listener.leftAt;
                 if (typeof joinTime !== 'number') return;
                 const joinedBeforeOrAtFinal = joinTime <= finalTime;
                 // Count as present if they left exactly at or after the end time, or never left
                 const leftAtOrAfterFinal = leaveTime === null || (typeof leaveTime === 'number' && leaveTime >= finalTime);
                 if (joinedBeforeOrAtFinal && leftAtOrAfterFinal) {
                    finalListenerCount++;
                 }
             });

             // Calculate final elapsed time
             const finalElapsedMillis = finalTime - startedAt;
             const finalTotalElapsedSeconds = Math.max(0, Math.floor(finalElapsedMillis / 1000));
             const finalTotalElapsedMinutes = Math.floor(finalTotalElapsedSeconds / 60);
             const finalElapsedHours = Math.floor(finalTotalElapsedMinutes / 60);
             const finalRemainingMinutes = finalTotalElapsedMinutes % 60;
             // Format final as HH:MM
             const finalFormattedElapsedTime = `${String(finalElapsedHours).padStart(2, '0')}:${String(finalRemainingMinutes).padStart(2, '0')}`;

             processedData.push({
                time: finalTime,
                count: finalListenerCount,
                joinCount: 0, // Join/leave rates aren't calculated for this single point
                leaveCount: 0,
                timeLabel: finalFormattedElapsedTime, // Use formatted HH:MM time for final point
             });
        }

        setChartData(processedData);
        // Pass the calculated context up
        onContextUpdate({
            averageListenTimeSeconds: averageListenTimeSeconds,
            chartData: processedData
        });

      } catch (err: any) {
        console.error('Failed to load or process listener data:', err);
        setError(t('errorLoadingListenerData') + `: ${err.message}`);
        onContextUpdate(null); // Clear context on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceId, startedAt, endedAt, t, onContextUpdate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 300,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('loadingRetentionData')}</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (chartData.length === 0 && !loading) {
      return <Alert severity="info">{t('noListenerData')}</Alert>;
  }

  return (
    <>
    <Paper
      sx={{
        p: 2,
        height: 400, // Set a fixed height or use aspect ratio
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('Listener Retention')}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="timeLabel"
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            labelStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
            itemStyle={{ color: 'white' }}
            formatter={(value: number, name: string, props: any) => {
                return [value, name];
            }}
            labelFormatter={(label: string) => `Time: ${label}`}
          />
          <Legend
            wrapperStyle={{ color: 'white', paddingTop: '10px' }}
            onClick={handleLegendClick}
            formatter={(value, entry) => {
                const { color, dataKey } = entry;
                const isActive = lineVisibility[dataKey as keyof typeof lineVisibility] === 1;
                const style = {
                    color: isActive ? color : 'grey',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.6,
                };
                return <span style={style}>{value}</span>;
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            name={t('Total Listeners')}
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ r: 8 }}
            dot={false}
            strokeOpacity={lineVisibility.count}
          />
          <Line
            type="monotone"
            dataKey="joinCount"
            name={t('Joins')} // Add translation key
            stroke="#82ca9d" // Green for joins
            strokeWidth={1}
            dot={false}
            strokeOpacity={lineVisibility.joinCount}
          />
          <Line
            type="monotone"
            dataKey="leaveCount"
            name={t('Leaves')} // Add translation key
            stroke="#ffc658" // Orange/Yellow for leaves
            strokeWidth={1}
            dot={false}
            strokeOpacity={lineVisibility.leaveCount}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>

    {/* New Section for Average Listen Time */}
    {averageListenTimeSeconds !== null && (
        <Paper
            sx={{
                mt: 4, // Increased margin top from 2 to 4
                p: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
            }}
        >
            <Typography variant="subtitle1">
                {t('Average Listen Time')}
            </Typography>
            <Typography variant="h6">
                {Math.floor(averageListenTimeSeconds / 60)} {t('minutes')}, {averageListenTimeSeconds % 60} {t('seconds')}
            </Typography>
        </Paper>
    )}

    </>
  );
};

export default ListenerRetentionChart; 
import React, { useState, useEffect } from 'react';
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

interface ListenerRetentionChartProps {
  spaceId: string | undefined;
  startedAt: number | undefined; // Expecting milliseconds since epoch
  endedAt: number | undefined; // Expecting milliseconds since epoch
}

interface ChartDataPoint {
  time: number; // Milliseconds since epoch
  count: number;
  timeLabel: string; // Formatted time for XAxis
}

const ListenerRetentionChart: React.FC<ListenerRetentionChartProps> = ({
  spaceId,
  startedAt,
  endedAt,
}) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spaceId || !startedAt || !endedAt || startedAt >= endedAt) {
        // Reset or set empty state if props are invalid/missing
        setChartData([]);
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

      try {
        const listenerLogs = await getSpaceListeners(spaceId);

        if (!listenerLogs || listenerLogs.length === 0) {
          setChartData([]);
          setLoading(false);
          // Not necessarily an error, maybe no listeners were logged
          return;
        }

        const processedData: ChartDataPoint[] = [];
        const intervalMillis = 60 * 1000; // 1 minute intervals
        const spaceEndTime = endedAt; // Use actual end time

        for (let t = startedAt; t <= spaceEndTime; t += intervalMillis) {
          let currentListenerCount = 0;
          listenerLogs.forEach((listener: SpaceListener) => {
            // Ensure timestamps are valid numbers
            const joinTime = listener.joinedAt;
            const leaveTime = listener.leftAt;

            if (typeof joinTime !== 'number') return; // Skip if joinTime is invalid

            // Check if listener joined before or during this interval
            const joinedBeforeOrDuringInterval = joinTime <= t;

            // Check if listener left after this interval (or never left)
            const leftAfterInterval = leaveTime === null || (typeof leaveTime === 'number' && leaveTime > t);

            if (joinedBeforeOrDuringInterval && leftAfterInterval) {
              currentListenerCount++;
            }
          });

          processedData.push({
            time: t,
            count: currentListenerCount,
            timeLabel: format(new Date(t), 'HH:mm'), // Format time for X-axis
          });
        }

        // Add the final point at the exact end time if not already included
        if (processedData[processedData.length - 1]?.time !== spaceEndTime) {
             let finalListenerCount = 0;
             const finalTime = spaceEndTime;
             listenerLogs.forEach((listener: SpaceListener) => {
                 const joinTime = listener.joinedAt;
                 const leaveTime = listener.leftAt;
                 if (typeof joinTime !== 'number') return;
                 const joinedBeforeOrDuringInterval = joinTime <= finalTime;
                 const leftAfterInterval = leaveTime === null || (typeof leaveTime === 'number' && leaveTime >= finalTime); // Use >= for final point
                 if (joinedBeforeOrDuringInterval && leftAfterInterval) {
                    finalListenerCount++;
                 }
             });
             processedData.push({
                time: finalTime,
                count: finalListenerCount,
                timeLabel: format(new Date(finalTime), 'HH:mm'),
             });
        }


        setChartData(processedData);
      } catch (err: any) {
        console.error('Failed to load or process listener data:', err);
        setError(t('errorLoadingListenerData') + `: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceId, startedAt, endedAt, t]);

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
        {t('listenerRetentionTitle')}
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
            formatter={(value: number, name: string, props: any) => [
              value,
              t('listenersLabel')
            ]}
            labelFormatter={(label: string) => `Time: ${label}`}
          />
          <Legend wrapperStyle={{ color: 'white', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="count"
            name={t('listenersLabel')}
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ r: 8 }}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ListenerRetentionChart; 
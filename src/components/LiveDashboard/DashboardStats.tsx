import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { Space } from '../../services/db/spaces.service';
import { format } from 'date-fns';
import { PeopleAlt, Timer, TrendingUp, Schedule } from '@mui/icons-material';

interface DashboardStatsProps {
  space: Space | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
}) => (
  <Paper
    sx={{
      p: 2,
      height: '100%',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
    </Box>
    <Typography variant="h4">{value}</Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Paper>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ space }) => {
  const calculateDuration = () => {
    if (!space?.startedAt) return '0m';
    const start = new Date(space.startedAt);
    const end = space?.endedAt ? new Date(space.endedAt) : new Date();
    const durationInMinutes = Math.floor(
      (end.getTime() - start.getTime()) / 60000
    );

    if (durationInMinutes < 60) {
      return `${durationInMinutes}m`;
    }
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getListenerGrowthRate = () => {
    if (!space?.totalLiveListeners || !space.totalLiveListeners) return '0%';
    const growthRate =
      ((space.liveListenersCount || 0) / (space.totalLiveListeners || 0)) * 100;
    return `${growthRate.toFixed(1)}%`;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Current Listeners"
          value={space?.liveListenersCount || 0}
          icon={<PeopleAlt sx={{ color: '#1DA1F2' }} />}
          subtitle="Live now"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Cumulative Listeners"
          value={space?.totalLiveListeners || 0}
          icon={<TrendingUp sx={{ color: '#1DA1F2' }} />}
          subtitle="Since start"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Duration"
          value={calculateDuration()}
          icon={<Timer sx={{ color: '#1DA1F2' }} />}
          subtitle={`Started ${
            space?.startedAt ? format(new Date(space.startedAt), 'h:mm a') : '-'
          }`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Listener Retention"
          value={getListenerGrowthRate()}
          icon={<Schedule sx={{ color: '#1DA1F2' }} />}
          subtitle="Current/Total ratio"
        />
      </Grid>
    </Grid>
  );
};

export default DashboardStats;

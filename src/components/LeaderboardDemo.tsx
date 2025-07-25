import React, { useState, useEffect } from 'react';
import {
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  keyframes,
  Badge,
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  Star,
  Whatshot,
  LocalFireDepartment,
  AutoAwesome,
} from '@mui/icons-material';
import { getDemoLeaderboard } from '../services/db/demoLeaderboard.service';

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
`;

const silverGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(192, 192, 192, 0.5); }
  50% { box-shadow: 0 0 20px rgba(192, 192, 192, 0.8), 0 0 30px rgba(192, 192, 192, 0.6); }
  100% { box-shadow: 0 0 5px rgba(192, 192, 192, 0.5); }
`;

const bronzeGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(205, 127, 50, 0.5); }
  50% { box-shadow: 0 0 20px rgba(205, 127, 50, 0.8), 0 0 30px rgba(205, 127, 50, 0.6); }
  100% { box-shadow: 0 0 5px rgba(205, 127, 50, 0.5); }
`;

const scorePulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const demoData = [
  {
    userId: '1',
    name: 'Non Funktard',
    username: '@nonfunktard',
    avatar: '/logos/milidy.png',
    totalPoints: 2847,
    rank: 1,
    badge: 'gold',
    trend: 'up',
    isNew: false,
  },
  {
    userId: '2',
    name: '3LURED L1N3S',
    username: '@3lured',
    avatar: '/logos/blur.png',
    totalPoints: 2653,
    rank: 2,
    badge: 'silver',
    trend: 'up',
    isNew: true,
  },
  {
    userId: '3',
    name: 'Up Only SZN',
    username: '@Up_SZN',
    avatar: '/logos/upface.png',
    totalPoints: 2418,
    rank: 3,
    badge: 'bronze',
    trend: 'down',
    isNew: false,
  },
];

const LeaderboardDemo: React.FC<{ queryId: string | null }> = ({ queryId }) => {
  const [currentRank, setCurrentRank] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [demoLeaderboard, setDemoLeaderboard] =
    useState<
      { totalPoints: number; userId: string; name: string; username: string }[]
    >(demoData);

  const fetchDemoLeaderboard = async (queryId: string) => {
    const lb = await getDemoLeaderboard(queryId);
    setDemoLeaderboard(lb.sort((a, b) => b.totalPoints - a.totalPoints) as any);
  };

  useEffect(() => {
    if (queryId) {
      fetchDemoLeaderboard(queryId);
    }
  }, [queryId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);

      // Simulate score updates
      setCurrentRank((prev) => (prev + 1) % demoData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <EmojiEvents sx={{ color: '#FFD700', fontSize: 24 }} />;
      case 2:
        return <Star sx={{ color: '#C0C0C0', fontSize: 24 }} />;
      case 3:
        return <LocalFireDepartment sx={{ color: '#CD7F32', fontSize: 24 }} />;
      default:
        return <Box mr={1.5} />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          animation: `${glowPulse} 2s infinite`,
          border: '2px solid #FFD700',
        };
      case 2:
        return {
          animation: `${silverGlow} 2s infinite`,
          border: '2px solid #C0C0C0',
        };
      case 3:
        return {
          animation: `${bronzeGlow} 2s infinite`,
          border: '2px solid #CD7F32',
        };
      default:
        return {
          border: '2px solid rgba(96, 165, 250, 0.3)',
        };
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp sx={{ color: '#4CAF50', fontSize: 16 }} />
    ) : (
      <TrendingUp
        sx={{ color: '#F44336', fontSize: 16, transform: 'rotate(180deg)' }}
      />
    );
  };

  return (
    <Box
      sx={{
        background: 'rgba(30, 41, 59, 0.9)',
        backdropFilter: 'blur(15px)',
        borderRadius: '20px',
        border: '1px solid rgba(96, 165, 250, 0.3)',
        p: 4,
        position: 'relative',
        overflow: 'hidden',
        width: { xs: '100%', sm: 500, md: 500 },
        minWidth: 340,
        maxWidth: 520,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(135deg, rgba(96, 165, 250, 0.05), rgba(139, 92, 246, 0.05))',
          borderRadius: '20px',
          zIndex: -1,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <AutoAwesome sx={{ fontSize: 32 }} />
          Live Leaderboard
        </Typography>
        <Chip
          label="Flexible Updates"
          color="primary"
          icon={<Whatshot />}
          sx={{
            background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
            color: 'white',
            animation: isAnimating ? `${scorePulse} 0.5s ease-in-out` : 'none',
          }}
        />
      </Box>

      {/* Live Stats */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          mb: 3,
          flexWrap: 'wrap',
          // justifyContent: 'center',
        }}
      >
        {/* Query ID Display */}
        {/* {queryId && (
          <Box
            sx={{
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                background:
                  'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899, #f59e0b)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                textShadow: '0 0 30px rgba(96, 165, 250, 0.5)',
                letterSpacing: '0.1em',
                fontFamily: 'monospace',
                position: 'relative',
              }}
            >
              {queryId}
            </Typography>
          </Box>
        )} */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
          >
            {demoLeaderboard.length}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Participants
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
          >
            {Math.round(
              demoLeaderboard.reduce((acc, user) => acc + user.totalPoints, 0)
            )}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Total Points
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{ color: 'var(--text-primary)', fontWeight: 600 }}
          >
            {(Math.floor(Math.random() * 50) + 10) * 12}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Active Today
          </Typography>
        </Box>
      </Box>

      {/* Leaderboard Table */}
      <TableContainer
        component={Paper}
        sx={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '15px',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          maxHeight: 330,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ background: 'rgba(96, 165, 250, 0.1)' }}>
              <TableCell
                sx={{
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                Rank
              </TableCell>
              <TableCell
                sx={{
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                Player
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                Score
              </TableCell>
              {/* <TableCell
                align="center"
                sx={{
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  minWidth: 90,
                  width: 110,
                }}
              >
                Status
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {(demoLeaderboard || demoData).map((user, index) => (
              <TableRow
                key={user.userId}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': {
                    background: 'rgba(96, 165, 250, 0.08)',
                    transform: 'scale(1.01)',
                    transition: 'all 0.3s ease',
                  },
                  transition: 'all 0.3s ease',
                  animation:
                    isAnimating && index === currentRank
                      ? `${scorePulse} 0.5s ease-in-out`
                      : 'none',
                }}
              >
                <TableCell
                  sx={{
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
                    fontWeight: 600,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getRankIcon(index + 1)}
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      #{index + 1}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge
                      badgeContent={index === 0 ? 'NEW' : null}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: '16px',
                          minWidth: '16px',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 45,
                          height: 45,
                          ...getRankStyle(index + 1),
                        }}
                        src={`https://unavatar.io/twitter/${user.username}`}
                      />
                    </Badge>
                    <Box sx={{ minWidth: 0, flex: 1, maxWidth: 150 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: index + 1 <= 3 ? '#FFD700' : 'var(--accent)',
                      textShadow:
                        index + 1 <= 3
                          ? '0 0 8px rgba(255, 215, 0, 0.5)'
                          : 'none',
                      animation:
                        isAnimating && index === currentRank
                          ? `${scorePulse} 0.5s ease-in-out`
                          : 'none',
                    }}
                  >
                    {user.totalPoints.toLocaleString()}
                  </Typography>
                </TableCell>
                {/* <TableCell
                  align="center"
                  sx={{
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
                  }}
                >
                  <Tooltip
                    title={index + 1 === 1 ? 'Trending Up' : 'Trending Down'}
                  >
                    <IconButton size="small">
                      {getTrendIcon(index + 1 === 1 ? 'up' : 'down')}
                    </IconButton>
                  </Tooltip>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Info */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          This is a live demo showing leaderboard functionality. Scores update
          automatically so participants can see their latest rankings.
        </Typography>
      </Box>
    </Box>
  );
};

export default LeaderboardDemo;

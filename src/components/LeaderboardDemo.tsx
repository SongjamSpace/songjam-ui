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

const LeaderboardDemo: React.FC = () => {
  const [currentRank, setCurrentRank] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const demoData = [
    {
      id: 1,
      name: 'Non Funktard',
      username: '@nonfunktard',
      avatar: '/logos/milidy.png',
      score: 2847,
      rank: 1,
      badge: 'gold',
      trend: 'up',
      isNew: false,
    },
    {
      id: 2,
      name: '3LURED L1N3S',
      username: '@3lured',
      avatar: '/logos/blur.png',
      score: 2653,
      rank: 2,
      badge: 'silver',
      trend: 'up',
      isNew: true,
    },
    {
      id: 3,
      name: 'Up Only SZN',
      username: '@Up_SZN',
      avatar: '/logos/upface.png',
      score: 2418,
      rank: 3,
      badge: 'bronze',
      trend: 'down',
      isNew: false,
    },
    {
      id: 4,
      name: 'Emma Wilson',
      username: '@emmaw',
      avatar: 'https://i.pravatar.cc/150?img=4',
      score: 2189,
      rank: 4,
      badge: 'none',
      trend: 'up',
      isNew: false,
    },
    {
      id: 5,
      name: 'David Park',
      username: '@davidpark',
      avatar: 'https://i.pravatar.cc/150?img=5',
      score: 1956,
      rank: 5,
      badge: 'none',
      trend: 'up',
      isNew: true,
    },
    {
      id: 6,
      name: 'Lisa Thompson',
      username: '@lisat',
      avatar: 'https://i.pravatar.cc/150?img=6',
      score: 1823,
      rank: 6,
      badge: 'none',
      trend: 'down',
      isNew: false,
    },
    {
      id: 7,
      name: 'James Lee',
      username: '@jameslee',
      avatar: 'https://i.pravatar.cc/150?img=7',
      score: 1678,
      rank: 7,
      badge: 'none',
      trend: 'up',
      isNew: false,
    },
    {
      id: 8,
      name: 'Maria Garcia',
      username: '@mariag',
      avatar: 'https://i.pravatar.cc/150?img=8',
      score: 1542,
      rank: 8,
      badge: 'none',
      trend: 'up',
      isNew: true,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
      
      // Simulate score updates
      setCurrentRank(prev => (prev + 1) % demoData.length);
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
        return null;
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
      <TrendingUp sx={{ color: '#F44336', fontSize: 16, transform: 'rotate(180deg)' }} />
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
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.05), rgba(139, 92, 246, 0.05))',
          borderRadius: '20px',
          zIndex: -1,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            2,384
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Participants
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            650,028
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Total Points
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
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
          maxHeight: 500,
          overflow: 'hidden',
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
              <TableCell
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
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {demoData.slice(0, 3).map((user, index) => (
              <TableRow
                key={user.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': {
                    background: 'rgba(96, 165, 250, 0.08)',
                    transform: 'scale(1.01)',
                    transition: 'all 0.3s ease',
                  },
                  transition: 'all 0.3s ease',
                  animation: isAnimating && index === currentRank ? `${scorePulse} 0.5s ease-in-out` : 'none',
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
                    {getRankIcon(user.rank)}
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      #{user.rank}
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
                      badgeContent={user.isNew ? 'NEW' : null}
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
                          ...getRankStyle(user.rank),
                        }}
                        src={user.avatar}
                      />
                    </Badge>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
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
                      color: user.rank <= 3 ? '#FFD700' : 'var(--accent)',
                      textShadow: user.rank <= 3 ? '0 0 8px rgba(255, 215, 0, 0.5)' : 'none',
                      animation: isAnimating && index === currentRank ? `${scorePulse} 0.5s ease-in-out` : 'none',
                    }}
                  >
                    {user.score.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid rgba(96, 165, 250, 0.1)',
                  }}
                >
                  <Tooltip title={user.trend === 'up' ? 'Trending Up' : 'Trending Down'}>
                    <IconButton size="small">
                      {getTrendIcon(user.trend)}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Info */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          This is a live demo showing leaderboard functionality. 
          Scores update automatically so participants can see their latest rankings.
        </Typography>
      </Box>
    </Box>
  );
};

export default LeaderboardDemo; 
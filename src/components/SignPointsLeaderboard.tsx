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
  keyframes,
  Button,
  Chip,
  Grid,
  IconButton,
  CircularProgress,
  TextField,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import Background from '../components/Background';
import { useEffect, useState, useRef, useCallback } from 'react';
import { UserLeaderboardEntry } from '../services/db/twitterMentions.service';
import { BlockMath } from 'react-katex';
import axios from 'axios';
import FlagModal from './FlagModal';
import { LoadingButton } from '@mui/lab';
import toast, { Toaster } from 'react-hot-toast';
import { createSpaceSubmission } from '../services/db/spaceSubmissions.service';
import { extractSpaceId } from '../utils';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import LoginDialog from './LoginDialog';
import { useAuthContext } from '../contexts/AuthContext';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';
import { textPulse } from '../pages/Leaderboard';

const innerTextPulse = keyframes`
  0% { text-shadow: 0 0 12px #fff; opacity: 0.98; }
  50% { text-shadow: 0 0 24px #fff; opacity: 1; }
  100% { text-shadow: 0 0 12px #fff; opacity: 0.98; }
`;

const SignPointsLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<UserLeaderboardEntry[]>([]);
  const [displayedLeaderboard, setDisplayedLeaderboard] = useState<
    UserLeaderboardEntry[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 200;
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    userId: string;
    username: string;
    name: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [spaceUrlForPoints, setSpaceUrlForPoints] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const { user: dynamicUser } = useDynamicContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  const handleClaimSpacePoints = async () => {
    const _spaceId = extractSpaceId(spaceUrlForPoints);
    if (!spaceUrlForPoints.trim() || !_spaceId) {
      return toast.error('Please enter a valid Twitter Space URL.');
    }
    if (!dynamicUser) {
      setShowAuthDialog(true);
      return;
    }
    const twitterCredentials = dynamicUser.verifiedCredentials.find(
      (cred) => cred.format === 'oauth'
    );
    if (!twitterCredentials) {
      toast.error('Please connect your Twitter account.');
      return setShowAuthDialog(true);
    }
    const spaceId = extractSpaceId(spaceUrlForPoints);
    if (!spaceId) {
      toast.error('Please enter a valid Twitter Space URL.');
      return;
    }
    setIsClaiming(true);
    try {
      await createSpaceSubmission(spaceId, {
        spaceUrl: spaceUrlForPoints,
        userId: twitterCredentials.id,
        twitterId: twitterCredentials.oauthAccountId,
        username: twitterCredentials.oauthUsername,
        name: twitterCredentials.publicIdentifier,
        createdAt: new Date(),
        spacePoints: 0,
      });
      toast.success('Space URL submitted for verification!');
      setSpaceUrlForPoints('');
    } catch (error) {
      toast.error('Failed to submit space URL. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const launchDate = new Date('2025-09-17T12:00:00Z');
      const difference = launchDate.getTime() - new Date().getTime();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        'https://songjamspace-leaderboard.logesh-063.workers.dev/songjamspace'
      );
      const allData = res.data as UserLeaderboardEntry[];
      setLeaderboard(allData);
      // Initially show first 200 items
      setDisplayedLeaderboard(allData.slice(0, ITEMS_PER_PAGE));
      setHasMore(allData.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const newItems = leaderboard.slice(startIndex, endIndex);
    setDisplayedLeaderboard((prev) => [...prev, ...newItems]);
    setCurrentPage(nextPage);
    setHasMore(endIndex < leaderboard.length);
    setLoading(false);
  }, [loading, hasMore, currentPage, leaderboard]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

      // Load more when user scrolls to bottom (with a small threshold)
      if (
        scrollTop + clientHeight >= scrollHeight - 50 &&
        !loading &&
        hasMore
      ) {
        loadMoreData();
      }
    },
    [loading, hasMore, loadMoreData]
  );

  const handleFlagClick = (user: UserLeaderboardEntry) => {
    setSelectedUser({
      userId: user.userId,
      username: user.username,
      name: user.name,
    });
    setFlagModalOpen(true);
  };

  const handleCloseFlagModal = () => {
    setFlagModalOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    if (leaderboard.length === 0) {
      fetchLeaderboard();
    }
  }, []);

  return (
    <Box>
      <Background />
      {/* Header */}
      <nav>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
          }}
        >
          <div className="logo">
            <Logo />
            <span>Songjam</span>
          </div>
          <Box display="flex" gap={2} alignItems="center">
            <Button
              onClick={() => {
                navigate('/#tokenomics');
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Tokenomics
            </Button>
            <Button
              onClick={() => {
                navigate('/leaderboard');
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Leaderboard
            </Button>
            <Button
              onClick={() => {
                navigate('/#honors');
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Honors
            </Button>
            <Button
              onClick={() => {
                navigate('/#contact');
              }}
              variant="text"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Contact
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outlined"
              size="small"
              sx={{
                color: 'white',
                '&:hover': { textDecoration: 'underline' },
                animation: `${textPulse} 2s infinite ease-in-out`,
              }}
            >
              {user ? 'Dashboard' : 'CRM Login'}
            </Button>
            <Button
              onClick={() => navigate('/spaces-crm')}
              variant="contained"
              size="small"
              sx={{
                background: 'linear-gradient(90deg, #00BCD4 0%, #3F51B5 100%)',
                color: 'white',
                '&:hover': {
                  background:
                    'linear-gradient(90deg, #3F51B5 0%, #00BCD4 100%)',
                  boxShadow: '0 0 20px rgba(0, 188, 212, 0.8)',
                },
              }}
            >
              Boost & Analyze X Spaces
            </Button>
          </Box>
        </Box>
      </nav>
      <Grid container spacing={4} position={'relative'} p={4}>
        {/* Left Column - Explanation */}
        <Grid item xs={12} md={4} sx={{ minHeight: '600px' }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                background:
                  'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow:
                  '0 0 15px rgba(236, 72, 153, 0.2), 0 0 8px rgba(139, 92, 246, 0.15)',
                mb: 2,
                fontWeight: 'bold',
              }}
            >
              How Sing Points Work
            </Typography>
            <Typography
              variant="body1"
              color="#F0F8FF"
              sx={{
                mb: 3,
                opacity: 0.9,
                lineHeight: 1.6,
                textShadow: '0 0 3px rgba(0,0,0,0.1)',
              }}
            >
              Sing points are calculated based on your engagement metrics and
              when you participate. The earlier you engage, the more Sing points
              you get! Each interaction tagging{' '}
              <a
                href="https://x.com/songjamspace"
                target="_blank"
                rel="noopener"
                style={{
                  color: '#60a5fa',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                @SongjamSpace
              </a>{' '}
              or mentioning{' '}
              <a
                href="https://x.com/search?q=%24SANG&src=cashtag_click"
                target="_blank"
                rel="noopener"
                style={{
                  color: '#60a5fa',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                $SANG
              </a>{' '}
              contributes to your score, with a special multiplier for early
              participation.
            </Typography>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                background: 'linear-gradient(45deg, #60A5FA, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 8px rgba(96, 165, 250, 0.1)',
                mb: 2,
                fontWeight: 'bold',
              }}
            >
              Base Sing Points Formula
            </Typography>
            <Paper
              sx={{
                p: 2,
                background: 'rgba(96, 165, 250, 0.08)',
                border: '1px solid rgba(96, 165, 250, 0.25)',
                borderRadius: '12px',
                boxShadow: '0 0 15px rgba(96, 165, 250, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 0 25px rgba(96, 165, 250, 0.4)',
                },
                '& .katex-display': {
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': {
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(96, 165, 250, 0.5)',
                    borderRadius: '2px',
                  },
                  '& .katex': {
                    fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                  },
                },
              }}
            >
              <BlockMath>
                {`S_{\\text{base}} = \\begin{gathered} \\underbrace{((L \\cdot 0.2) + (R \\cdot 0.4) + (B \\cdot 0.4) + (RT \\cdot 0.6) + (QT \\cdot 1.0))}_{\\text{Engagement Points}} \\\\[1em] + \\underbrace{((SY \\cdot 5 + DJ \\cdot 10) \\cdot N_{\\text{listeners}} \\div S)}_{\\text{Space Points}} \\end{gathered}`}
              </BlockMath>
              <Typography
                variant="body2"
                color="#F0F8FF"
                sx={{
                  mt: 2,
                  fontSize: '0.9em',
                  opacity: 0.8,
                  textShadow: '0 0 2px rgba(0,0,0,0.3)',
                }}
              >
                Your base score is a sum of <strong>Engagement Points</strong>{' '}
                from interactions (Likes, Replies, Bookmarks, Retweets, Quote
                Tweets) and <strong>Space Points</strong>, which are awarded for
                speaking (SY) or DJing (DJ) and are multiplied by the number of
                listeners (N <sub>listeners</sub>), divided by the number of
                speakers (S).
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                background: 'linear-gradient(45deg, #EC4899, #F472B6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 8px rgba(236, 72, 153, 0.1)',
                mb: 2,
                fontWeight: 'bold',
              }}
            >
              Engagement Boosters
            </Typography>
            <Paper
              sx={{
                p: 2,
                background: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                borderRadius: '12px',
                boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)',
                },
                '& .katex-display': {
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': {
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(236, 72, 153, 0.5)',
                    borderRadius: '2px',
                  },
                  '& .katex': {
                    fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                  },
                },
              }}
            >
              <BlockMath>
                {`\\text{Booster} = \\begin{cases} 2.0 & \\text{if } \\text{engagement} \\geq \\text{high threshold} \\\\ 1.5 & \\text{if } \\text{engagement} \\geq \\text{low threshold} \\\\ 1.0 & \\text{otherwise} \\end{cases}`}
              </BlockMath>
              <Typography
                variant="body2"
                color="#F0F8FF"
                sx={{
                  mt: 2,
                  fontSize: '0.9em',
                  opacity: 0.8,
                  textShadow: '0 0 2px rgba(0,0,0,0.3)',
                }}
              >
                Your engagement score gets boosted based on the performance of
                your tweets. Here are the thresholds:
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{ opacity: 0.8, whiteSpace: 'nowrap' }}
                >
                  • Likes: 2.0x (100+), 1.5x (50+)
                </Typography>
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{ opacity: 0.8 }}
                >
                  • Replies: 2.0x (20+), 1.5x (10+)
                </Typography>
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{ opacity: 0.8 }}
                >
                  • Retweets: 2.0x (30+), 1.5x (15+)
                </Typography>
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{ opacity: 0.8 }}
                >
                  • Quote Tweets: 2.0x (15+), 1.5x (8+)
                </Typography>
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{ opacity: 0.8 }}
                >
                  • Bookmarks: 2.0x (25+), 1.5x (12+)
                </Typography>
              </Box>
            </Paper>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                gap: 2,
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 8px rgba(236, 72, 153, 0.1)',
                  fontWeight: 'bold',
                }}
              >
                Early Multiplier
              </Typography>
              <Chip
                label="Expired"
                color="error"
                variant="outlined"
                size="small"
              />
            </Box>
            <Paper
              sx={{
                p: 2,
                background: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                borderRadius: '12px',
                boxShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)',
                },
                '& .katex-display': {
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': {
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(236, 72, 153, 0.5)',
                    borderRadius: '2px',
                  },
                  '& .katex': {
                    fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                  },
                },
              }}
            >
              <BlockMath>
                {`\\text{earlyMultiplier} = 1 + 99 \\times \\frac{\\max(0, T_{genesis} - T_{post})}{604800}`}
              </BlockMath>
              <Typography
                variant="body2"
                color="#F0F8FF"
                sx={{
                  mt: 2,
                  fontSize: '0.9em',
                  opacity: 0.8,
                  textShadow: '0 0 2px rgba(0,0,0,0.3)',
                }}
              >
                Applies to posts up to 1 week before genesis. Maximum multiplier
                is 100x.
              </Typography>
            </Paper>
          </Box>
        </Grid>
        {/* Right Column - Leaderboard */}
        <Grid item xs={12} md={8}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
                }}
              >
                Leaderboard
              </Typography>
            </Box>
            {/* Centered filter above the table */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 2,
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  animation: `${innerTextPulse} 2.5s infinite ease-in-out`,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                2% of $SANG Supply Reserved for Pre-Genesis Yappers, 3% Reserved
                for Genesis Yappers
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  window.open('https://leaderboard.songjam.space', '_blank');
                }}
                sx={{
                  wordBreak: 'keep-all',
                  whiteSpace: 'nowrap',
                }}
              >
                Connect X
              </Button>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                maxHeight: 1050,
                overflow: 'auto',
              }}
              onScroll={handleScroll}
              ref={tableContainerRef}
            >
              <Table
                stickyHeader
                sx={{ minWidth: 650 }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow sx={{ background: 'rgba(96, 165, 250, 0.1)' }}>
                    <TableCell
                      sx={{
                        color: '#F0F8FF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      Rank
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#F0F8FF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#F0F8FF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <IconButton
                          size="small"
                          sx={{
                            color: '#F0F8FF',
                            '&:hover': {
                              color: '#EC4899',
                            },
                          }}
                        >
                          <FilterListIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: '#F0F8FF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      Lurky Score
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: '#F0F8FF',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 'bold',
                      }}
                    >
                      Sing Points
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedLeaderboard.map((user, index) => (
                    <TableRow
                      key={`${user.userId}-${index}`}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': {
                          background: 'rgba(96, 165, 250, 0.05)',
                          boxShadow: '0 0 15px rgba(96, 165, 250, 0.2)',
                        },
                        transition:
                          'background 0.3s ease, box-shadow 0.3s ease',
                      }}
                    >
                      <TableCell
                        sx={{
                          color: '#F0F8FF',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            textShadow: '0 0 5px rgba(255,255,255,0.2)',
                          }}
                        >
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#F0F8FF',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              border:
                                user.maxEarlyMultiplier > 1
                                  ? '2px solid #8B5CF6'
                                  : user.totalPoints
                                  ? '2px solid #EC4899'
                                  : '2px solid #FFD700',
                              boxShadow:
                                user.maxEarlyMultiplier > 1
                                  ? '0 0 10px #8B5CF6'
                                  : user.totalPoints
                                  ? '0 0 10px #EC4899'
                                  : '0 0 10px #FFD700',
                            }}
                            src={`https://unavatar.io/twitter/${user.username}`}
                          />
                          <Typography
                            variant="body1"
                            sx={{
                              textShadow: '0 0 5px rgba(255,255,255,0.1)',
                            }}
                          >
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#F0F8FF',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Chip
                          label="Flag"
                          variant="outlined"
                          size="medium"
                          sx={{
                            color: '#EF4444',
                            border: '2px solid rgba(239, 68, 68, 0.6)',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            padding: '8px 12px',
                            height: '32px',
                            transition: 'all 0.3s ease',
                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '2px solid rgba(239, 68, 68, 0.9)',
                              transform: 'scale(1.08)',
                              boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                            },
                            '& .MuiChip-label': {
                              padding: '0 8px',
                            },
                          }}
                          onClick={() => handleFlagClick(user)}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: '#F0F8FF',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            color:
                              user.lurkyScore !== undefined
                                ? '#FFD700'
                                : 'rgba(255, 255, 255, 0.6)',
                            textShadow:
                              user.lurkyScore !== undefined
                                ? '0 0 8px #FFD700'
                                : 'none',
                          }}
                        >
                          {user.lurkyScore !== undefined
                            ? user.lurkyScore.toFixed(2)
                            : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: '#F0F8FF',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            color: '#EC4899',
                            textShadow: '0 0 8px #EC4899',
                          }}
                        >
                          {user.totalPoints.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                          }}
                        >
                          <CircularProgress
                            size={24}
                            sx={{ color: '#EC4899' }}
                          />
                          <Typography variant="body2" color="#F0F8FF">
                            Loading more entries...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                  {!hasMore && displayedLeaderboard.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                        <Typography
                          variant="body2"
                          color="#F0F8FF"
                          sx={{ opacity: 0.7 }}
                        >
                          Showing {displayedLeaderboard.length} of{' '}
                          {leaderboard.length} entries
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

        <Box
          my={4}
          p={4}
          width={'100%'}
          sx={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow:
              '0 3px 15px rgba(139, 92, 246, 0.1), 0 0 10px rgba(236, 72, 153, 0.08)',
          }}
        >
          <Grid container spacing={4} sx={{ mt: 4, alignItems: 'center' }}>
            {/* Left side - Claim Space Points */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  height: '100%',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  Claim Space Points
                </Typography>
                <Typography
                  variant="body2"
                  color="rgba(255,255,255,0.7)"
                  sx={{ mb: 3 }}
                >
                  Submit the URL of a recorded Twitter Space where you were a
                  speaker or the DJ to claim your points.
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Twitter Space URL"
                  value={spaceUrlForPoints}
                  onChange={(e) => setSpaceUrlForPoints(e.target.value)}
                  sx={{ mb: 2 }}
                  helperText="Space url: x.com/i/spaces/*"
                />
                <LoadingButton
                  loading={isClaiming}
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleClaimSpacePoints}
                >
                  Claim Points
                </LoadingButton>
              </Paper>
            </Grid>
            {/* Right side - Countdown */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{
                    background:
                      'linear-gradient(135deg, #60a5fa, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow:
                      '0 0 15px rgba(236, 72, 153, 0.2), 0 0 8px rgba(139, 92, 246, 0.15)',
                    mb: 3,
                    fontWeight: 'bold',
                  }}
                >
                  Genesis Release
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <Grid item key={unit}>
                      <Paper
                        sx={{
                          p: 2,
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          width: '100px',
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 'bold',
                            color: '#EC4899',
                            textShadow: '0 0 8px #EC4899',
                          }}
                        >
                          {String(value).padStart(2, '0')}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255,255,255,0.7)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {unit}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, px: 4, textAlign: 'center' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: 'italic', opacity: 0.8 }}
            >
              Disclaimer: Songjam is constantly monitoring the timeline and
              spaces for spammy behaviour and may adjust the base points formula
              or the quality algorithm without notice if it appears the system
              is being nefariously farmed.
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Flag Modal */}
      {selectedUser && (
        <FlagModal
          open={flagModalOpen}
          onClose={handleCloseFlagModal}
          userId={selectedUser.userId}
          projectId="songjamspace"
          username={selectedUser.username}
          userAvatar={`https://unavatar.io/twitter/${selectedUser.username}`}
          getConnectedUserLbData={(userId: string) => {
            const leaderboardUser = leaderboard.find(
              (user: UserLeaderboardEntry) => user.userId === userId
            );
            return leaderboardUser;
          }}
        />
      )}
      <Toaster position="bottom-right" />
      <LoginDialog
        open={showAuthDialog && !authLoading}
        onClose={() => setShowAuthDialog(false)}
      />
    </Box>
  );
};

export default SignPointsLeaderboard;

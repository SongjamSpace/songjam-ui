import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  CircularProgress,
  Chip,
  Avatar,
  Paper,
  Container,
} from '@mui/material';
import {
  UserTweetMention,
  getTwitterMentions,
  getSlash,
  SlashDoc,
  createSlash,
  updateSlash,
  getLeaderBoardUser,
  getReport,
  AgentReport,
} from '../services/db/leaderboard.service';
import { UserLeaderboardEntry } from '../services/db/twitterMentions.service';
import {
  useDynamicContext,
  useSocialAccounts,
} from '@dynamic-labs/sdk-react-core';
import { ProviderEnum } from '@dynamic-labs/sdk-api-core';
import { LoadingButton } from '@mui/lab';
import { Toaster, toast } from 'react-hot-toast';
import AgenticReportComp from '../pages/AgenticReportComp';
import axios from 'axios';
import Background from './Background';
import Modal from '@mui/material/Modal';

interface FlagModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  projectId: string;
  username: string;
  userAvatar?: string;
  getConnectedUserLbData: (userId: string) => UserLeaderboardEntry | undefined;
}

const FlagModal = ({
  open,
  onClose,
  userId,
  projectId,
  username,
  userAvatar,
  getConnectedUserLbData,
}: FlagModalProps) => {
  const { error, isProcessing, signInWithSocialAccount } = useSocialAccounts();
  const { user } = useDynamicContext();

  const [slashDoc, setSlashDoc] = useState<SlashDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [defendVote, setDefendVote] = useState<'defend' | 'slash' | null>(null);
  const [slashedTweets, setSlashedTweets] = useState<UserTweetMention[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [voterUsername, setVoterUsername] = useState<string>('');
  const [voterUserId, setVoterUserId] = useState<string>('');
  const [reportInfo, setReportInfo] = useState<AgentReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchSlash = async (projectId: string, userId: string) => {
    const slash = await getSlash(projectId, userId);
    if (slash) {
      setSlashDoc(slash);
      fetchReport(`${projectId}_${userId}`);
    }
    const tweets = await getTwitterMentions(projectId, userId);
    setSlashedTweets(tweets);
    setLoading(false);
  };

  const handleVote = async (vote: 'defend' | 'slash') => {
    debugger;
    if (loading || isButtonDisabled) {
      return;
    }
    if (!voterUsername) {
      return await signInWithSocialAccount(ProviderEnum.Twitter, {
        redirectUrl: window.location.href,
      });
    }
    if (userId === voterUserId) {
      toast.error('Cannot flag yourself');
      return;
    }
    if (slashedTweets.length === 0) {
      alert('No tweets found');
      return;
    }
    if (userId) {
      const leaderboardUser = getConnectedUserLbData(userId);
      if (!leaderboardUser) {
        toast.error('Cannot flag. You are not on the leaderboard');
        return;
      }
      setIsButtonDisabled(true);
      if (slashDoc) {
        const slash = await updateSlash(
          projectId,
          userId,
          voterUsername,
          vote,
          voterUserId
        );
        setSlashDoc(slash);
      } else {
        const slash = await createSlash(
          projectId,
          userId,
          voterUsername,
          slashedTweets[0]?.username || '',
          voterUserId
        );
        setSlashDoc(slash);
      }
      setIsButtonDisabled(false);
    }
  };

  const fetchReport = async (id: string) => {
    const report = await getReport(id);
    if (!report) {
      return;
    }
    setReportInfo(report);
  };

  useEffect(() => {
    if (user) {
      const twitterCredential = user.verifiedCredentials.find(
        (cred) => cred.oauthProvider === 'twitter'
      );
      setVoterUsername(twitterCredential?.oauthUsername || '');
      setVoterUserId(twitterCredential?.oauthAccountId || '');
    }
  }, [user]);

  useEffect(() => {
    if (open && userId && projectId) {
      setLoading(true);
      fetchSlash(projectId, userId);
    }
  }, [open, userId, projectId]);

  const handleClose = () => {
    onClose();
    // Reset state when closing
    setSlashDoc(null);
    setSlashedTweets([]);
    setDefendVote(null);
    setReportInfo(null);
    setLoading(true);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="flag-modal-title"
      aria-describedby="flag-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        width: 550,
        heigh: 700,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          borderRadius: '20px',
          border: '2px solid rgba(236, 72, 153, 0.3)',
          boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container
          sx={{
            position: 'relative',
            zIndex: 1,
            py: 3,
            px: 3,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              pb: 2,
              borderBottom: '1px solid rgba(236, 72, 153, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  border: '2px solid #EC4899',
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)',
                }}
                src={userAvatar || `https://unavatar.io/twitter/${username}`}
              />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    textShadow: '0 0 15px rgba(236, 72, 153, 0.2)',
                  }}
                >
                  Flag @{username}
                </Typography>
                <Typography
                  variant="body2"
                  color="#F0F8FF"
                  sx={{ opacity: 0.8 }}
                >
                  Review and flag for botted/farmed content
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={handleClose}
              sx={{
                color: '#F0F8FF',
                border: '1px solid rgba(236, 72, 153, 0.5)',
                '&:hover': {
                  bgcolor: 'rgba(236, 72, 153, 0.1)',
                  border: '1px solid rgba(236, 72, 153, 0.8)',
                },
              }}
            >
              ✕
            </Button>
          </Box>

          {/* Main Content */}
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <CircularProgress sx={{ color: '#EC4899' }} />
            </Box>
          ) : slashDoc ? (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body2"
                color="#F0F8FF"
                sx={{
                  textAlign: 'center',
                  mb: 3,
                  opacity: 0.9,
                }}
              >
                {slashDoc.slashedUserIds.includes(voterUserId)
                  ? `This account has been flagged for agentic review.`
                  : `Review the tweets below and flag this account for botted/farmed/low effort content.`}
              </Typography>

              {/* Defend / Slash Buttons */}
              {slashDoc.slashedUserIds.includes(voterUserId) ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <Chip
                    label={`Flagged by You ${
                      slashDoc.slashCount > 1
                        ? `& ${slashDoc.slashCount - 1} others`
                        : ''
                    }`}
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.2)',
                      color: '#EF4444',
                      border: '2px solid rgba(239, 68, 68, 0.6)',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      padding: '12px 20px',
                      height: 'auto',
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#EF4444',
                      color: 'white',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      border: '2px solid rgba(239, 68, 68, 0.8)',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                      '&:hover': {
                        bgcolor: '#B91C1C',
                        boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => handleVote('slash')}
                  >
                    Flag Account
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#F0F8FF',
                  mb: 2,
                  fontWeight: 'bold',
                }}
              >
                Flag @{username}
              </Typography>
              <Typography
                variant="body2"
                color="#F0F8FF"
                sx={{
                  mb: 3,
                  opacity: 0.9,
                }}
              >
                Review the tweets below and flag this account for
                botted/farmed/low effort content.
              </Typography>
              <LoadingButton
                loading={loading}
                variant="contained"
                sx={{
                  bgcolor: '#EF4444',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  border: '2px solid rgba(239, 68, 68, 0.8)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                  '&:hover': {
                    bgcolor: '#B91C1C',
                    boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={async () => {
                  await handleVote('slash');
                }}
              >
                Flag Account
              </LoadingButton>
            </Box>
          )}

          {/* Report Generation */}
          {slashDoc && slashDoc.slashCount > 0 && !reportInfo && (
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <LoadingButton
                loading={reportLoading}
                variant="outlined"
                sx={{
                  color: '#EC4899',
                  borderColor: '#EC4899',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: 'rgba(236, 72, 153, 0.1)',
                    borderColor: '#EC4899',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={async () => {
                  setReportLoading(true);
                  try {
                    await axios.post(
                      `${
                        import.meta.env.VITE_JAM_SERVER_URL
                      }/agent/fetch-songjam-report`,
                      {
                        projectId: projectId,
                        userId: userId,
                      }
                    );
                    await fetchReport(`${projectId}_${userId}`);
                  } catch (error) {
                    toast.error('Error fetching report');
                  } finally {
                    setReportLoading(false);
                  }
                }}
                disabled
              >
                Send for Agentic Review
              </LoadingButton>
            </Box>
          )}

          {/* Agentic Report */}
          {reportInfo && (
            <Box sx={{ mb: 4 }}>
              <AgenticReportComp reportInfo={reportInfo} />
            </Box>
          )}

          {/* Tweets Section */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'auto',
              gap: 2,
              flexWrap: 'nowrap',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              pb: 2,
            }}
          >
            {slashedTweets.map(({ tweetId }) => (
              <Box
                key={tweetId}
                sx={{
                  flex: '0 0 auto',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  loading="lazy"
                  src={`https://platform.twitter.com/embed/Tweet.html?frame=false&hideCard=false&hideThread=false&id=${tweetId}&origin=${window.location.origin}&theme=dark`}
                  style={{ height: 600, width: 320 }}
                  frameBorder="0"
                  scrolling="no"
                />
              </Box>
            ))}
          </Box>
        </Container>
        <Toaster position="bottom-right" />
      </Box>
    </Modal>
  );
};

export default FlagModal;

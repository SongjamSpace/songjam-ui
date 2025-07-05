import { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Skeleton } from '@mui/material';
import {
  UserTweetMention,
  getTwitterMentions,
  getSlash,
  SlashDoc,
  createSlash,
  updateSlash,
} from '../services/db/leaderboard.service';
import {
  useDynamicContext,
  useSocialAccounts,
} from '@dynamic-labs/sdk-react-core';
import { ProviderEnum } from '@dynamic-labs/sdk-api-core';
import { LoadingButton } from '@mui/lab';

const Flag = () => {
  const { error, isProcessing, signInWithSocialAccount } = useSocialAccounts();

  const { user } = useDynamicContext();

  //   const [reportInfo, setReportInfo] = useState<AgentReport | null>(null);
  const [projectId, setProjectId] = useState<string>('evaonlinexyz');
  const [userId, setUserId] = useState<string>('');
  const [slashDoc, setSlashDoc] = useState<SlashDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [defendVote, setDefendVote] = useState<'defend' | 'slash' | null>(null);
  const [slashedTweets, setSlashedTweets] = useState<UserTweetMention[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [username, setUsername] = useState<string>('');

  const fetchSlash = async (projectId: string, userId: string) => {
    const slash = await getSlash(projectId, userId);
    if (slash) {
      setSlashDoc(slash);
    }
    const tweets = await getTwitterMentions(projectId, userId);

    setSlashedTweets(tweets);
    setLoading(false);
  };

  const handleVote = async (vote: 'defend' | 'slash') => {
    if (loading || isButtonDisabled) {
      return;
    }
    if (!username) {
      //   Trigger Login
      return await signInWithSocialAccount(ProviderEnum.Twitter, {
        redirectUrl: window.location.href,
      });
    }
    if (slashedTweets.length === 0) {
      alert('No tweets found');
      return;
    }
    if (userId) {
      setIsButtonDisabled(true);
      if (slashDoc) {
        const slash = await updateSlash(projectId, userId, username, vote);
        setSlashDoc(slash);
      } else {
        const slash = await createSlash(
          projectId,
          userId,
          username,
          slashedTweets[0]?.username
        );
        setSlashDoc(slash);
      }
      setIsButtonDisabled(false);
    }
  };

  useEffect(() => {
    if (user) {
      setUsername(
        user.verifiedCredentials.find(
          (cred) => cred.oauthProvider === 'twitter'
        )?.oauthUsername || ''
      );
    }
  }, [user]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('userId');
    if (!id) {
      alert('No userId provided');
      return;
    }
    setUserId(id);
    fetchSlash(projectId, id);
  }, [user]);

  return (
    <Box sx={{ bgcolor: '#f1e3eb', minHeight: '100vh' }}>
      <Container
        sx={{
          pb: 2,
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
          bgcolor: 'white',
        }}
      >
        {/* Main Content */}
        {slashDoc ? (
          <Box
            sx={{
              pt: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Chakra Petch, sans-serif',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                //   color: '#4a3740',
                //   mb: 4,
                fontFamily: 'Chakra Petch, sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                maxWidth: 500,
                color: 'black',
              }}
              component="a"
              href={`https://x.com/${
                slashDoc?.username || slashedTweets[0]?.username
              }`}
              target="_blank"
            >
              {slashDoc ? slashDoc.username : slashedTweets[0]?.username}
            </Typography>

            {/* Review Reason Placeholder */}
            <Typography
              // variant="caption"
              sx={{
                //   color: '#4a3740',
                //   mb: 4,
                fontFamily: 'Chakra Petch, sans-serif',
                textAlign: 'center',
                //   maxWidth: 500,
              }}
            >
              {slashDoc.slashedUsernames.includes(username)
                ? `This account has been flagged for agentic review.
              `
                : `Review the tweets below and flag this account for
                botted/farmed/low effort content.`}
            </Typography>

            {/* Defend / Slash Buttons */}
            {slashDoc.slashedUsernames.includes(username) ? (
              <Box
                sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
              >
                <Button
                  fullWidth
                  variant={defendVote === 'slash' ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: defendVote === 'slash' ? '#ef4444' : '#faecee',
                    color: defendVote === 'slash' ? 'white' : '#d1002c',
                    fontWeight: 700,
                    // fontSize: 24,
                    // py: 2,
                    // borderRadius: 2,
                    borderColor: 'transparent',
                    '&:hover': {
                      bgcolor: defendVote === 'slash' ? '#b91c1c' : '#f8d7da',
                    },
                    transition: 'background 0.2s',
                  }}
                >
                  Flagged by You & {slashDoc.slashCount - 1} others
                </Button>
              </Box>
            ) : (
              <Box
                sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
              >
                {/* <Button
                  fullWidth
                  variant={defendVote === 'defend' ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: defendVote === 'defend' ? '#22c55e' : '#d6f5df',
                    color: defendVote === 'defend' ? 'white' : '#008a2e',
                    fontWeight: 700,
                    // fontSize: 24,
                    // py: 2,
                    // borderRadius: 2,
                    borderColor: 'transparent',
                    '&:hover': {
                      bgcolor: defendVote === 'defend' ? '#16a34a' : '#b2e5c7',
                    },
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleVote('defend')}
                >
                  Defend
                </Button> */}
                <Button
                  fullWidth
                  variant={defendVote === 'slash' ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: defendVote === 'slash' ? '#ef4444' : '#faecee',
                    color: defendVote === 'slash' ? 'white' : '#d1002c',
                    fontWeight: 700,
                    // fontSize: 24,
                    // py: 2,
                    // borderRadius: 2,
                    borderColor: 'transparent',
                    '&:hover': {
                      bgcolor: defendVote === 'slash' ? '#b91c1c' : '#f8d7da',
                    },
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleVote('slash')}
                >
                  Flag
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            {/* Proposal Section */}
            <Box sx={{ mt: 3, mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Chakra Petch, sans-serif',
                  fontWeight: 'bold',
                  color: '#4a3740',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                component="span"
              >
                Flag
                {loading ? (
                  <Skeleton
                    width={100}
                    height={20}
                    sx={{ bgcolor: '#f1e3eb', ml: 1 }}
                    variant="rectangular"
                  />
                ) : (
                  ` @${slashedTweets[0]?.username}`
                )}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: '#666',
                  maxWidth: 600,
                }}
                align="center"
                component="span"
              >
                Review the tweets below and flag this account for
                botted/farmed/low effort content.
              </Typography>
              <Box
                sx={{ display: 'flex', gap: 2, mt: 2, mb: 4, width: '100%' }}
              >
                {/* <Button
                  fullWidth
                  variant={defendVote === 'defend' ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: defendVote === 'defend' ? '#22c55e' : '#d6f5df',
                    color: defendVote === 'defend' ? 'white' : '#008a2e',
                    fontWeight: 700,
                    // fontSize: 24,
                    // py: 2,
                    // borderRadius: 2,
                    borderColor: 'transparent',
                    '&:hover': {
                      bgcolor: defendVote === 'defend' ? '#16a34a' : '#b2e5c7',
                    },
                    transition: 'background 0.2s',
                  }}
                  onClick={() => setDefendVote('defend')}
                >
                  Defend
                </Button> */}
                <LoadingButton
                  loading={loading}
                  fullWidth
                  variant={defendVote === 'slash' ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: defendVote === 'slash' ? '#ef4444' : '#faecee',
                    color: defendVote === 'slash' ? 'white' : '#d1002c',
                    fontWeight: 700,
                    // fontSize: 24,
                    // py: 2,
                    // borderRadius: 2,
                    borderColor: 'transparent',
                    '&:hover': {
                      bgcolor: defendVote === 'slash' ? '#b91c1c' : '#f8d7da',
                    },
                    transition: 'background 0.2s',
                  }}
                  onClick={async () => {
                    await handleVote('slash');
                  }}
                >
                  Flag
                </LoadingButton>
              </Box>
            </Box>
          </Box>
        )}
        {/* Footer */}
        <Box display={'flex'} justifyContent={'center'}>
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              width: '100%',
              display: 'block',
              color: '#b0b0b0',
              fontFamily: 'Chakra Petch, sans-serif',
            }}
          >
            Powered by{' '}
            <a
              href="https://songjam.space/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontWeight: 'bold',
                textDecoration: 'none',
                color: '#ff007a',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.textDecoration = 'underline')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.textDecoration = 'none')
              }
            >
              Songjam
            </a>
          </Typography>
        </Box>

        {/* Horizontally scrollable tweets */}
        <Box
          sx={{
            width: '100%',
            pt: 4,
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            gap: 2,
            flexWrap: 'nowrap',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          {/* Example tweet IDs, replace with your own or fetch dynamically */}
          {slashedTweets.map(({ tweetId }) => (
            <Box
              key={tweetId}
              sx={{ minWidth: 350, maxWidth: 350, flex: '0 0 auto' }}
            >
              <iframe
                loading="lazy"
                src={`https://platform.twitter.com/embed/Tweet.html?frame=false&hideCard=false&hideThread=false&id=${tweetId}&origin=YOUR_DOMAIN_HERE&theme=light`}
                style={{ height: 600, width: 320 }}
                frameBorder="0"
                scrolling="no"
              ></iframe>
            </Box>
          ))}
        </Box>
      </Container>
      {/* <LoginDialog open={showAuthDialog && !authLoading} /> */}
    </Box>
  );
};

export default Flag;

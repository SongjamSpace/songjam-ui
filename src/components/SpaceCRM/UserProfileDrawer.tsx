import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Paper,
  Button,
  Drawer,
} from '@mui/material';
import { User } from '../../services/db/spaces.service';
import TwitterIcon from '@mui/icons-material/Twitter';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useEffect, useState } from 'react';
import { fetchXUserProfile, XUserProfile } from '../../services/x.service';
import axios from 'axios';

type Props = {
  userDetailDrawer: User | null;
  setUserDetailDrawer: (userDetailDrawer: User | null) => void;
  activeTab: 'speakers' | 'listeners';
};

const UserProfileDrawer = ({
  userDetailDrawer,
  setUserDetailDrawer,
  activeTab,
}: Props) => {
  const [detailTab, setDetailTab] = useState<
    'profile' | 'activity' | 'engagement' | 'insights'
  >('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState<XUserProfile | null>(null);

  useEffect(() => {
    if (
      userDetailDrawer &&
      userDetailDrawer.twitter_screen_name !== profileInfo?.username
    ) {
      const fetchProfileInfo = async () => {
        setIsLoading(true);
        try {
          const profile = await fetchXUserProfile(
            userDetailDrawer.twitter_screen_name
          );
          setProfileInfo(profile);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfileInfo();
    }
  }, [userDetailDrawer]);

  return (
    <Drawer
      anchor="right"
      open={!!userDetailDrawer}
      onClose={() => setUserDetailDrawer(null)}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          padding: 3,
          background: '#1e293b',
          color: 'white',
        },
      }}
    >
      {!!userDetailDrawer && (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6">
              {activeTab === 'speakers' ? 'Speaker' : 'Listener'} Profile
            </Typography>
            <IconButton onClick={() => setUserDetailDrawer(null)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={userDetailDrawer.avatar_url}
              sx={{ width: 64, height: 64, mr: 2 }}
            />
            <Box>
              <Typography variant="h6">
                {userDetailDrawer.display_name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                <a
                  href={`https://x.com/${userDetailDrawer.twitter_screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{ alignItems: 'start', paddingLeft: 0 }}
                >
                  @{userDetailDrawer.twitter_screen_name}
                </a>
              </Typography>
              {/* {activeTab === 'listeners' && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {userDetailDrawer.followersCount.toLocaleString()}{' '}
                    followers
                  </Typography>
                )} */}
            </Box>
          </Box>

          <Tabs
            value={detailTab}
            onChange={(_, newValue) => setDetailTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab icon={<PersonIcon />} value="profile" />
            <Tab icon={<TwitterIcon />} value="activity" />
            <Tab icon={<MessageIcon />} value="engagement" />
            <Tab icon={<BarChartIcon />} value="insights" />
          </Tabs>

          {detailTab === 'profile' && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Bio
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {profileInfo?.biography || 'No bio available'}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                X Stats
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Followers
                  </Typography>
                  <Typography variant="body1">
                    {profileInfo?.followersCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Following
                  </Typography>
                  <Typography variant="body1">
                    {profileInfo?.followingCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tweets
                  </Typography>
                  <Typography variant="body1">
                    {profileInfo?.tweetsCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Lists
                  </Typography>
                  <Typography variant="body1">
                    {profileInfo?.listedCount}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {/* {detailTab === 'activity' && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Recent Posts
                </Typography>
                {activeTab === 'speakers'
                  ? (
                      selectedAttendee as User & { recentTweets?: XTweet[] }
                    ).recentTweets?.map((tweet, index) => (
                      <Paper
                        key={tweet.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {tweet.text}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {new Date(tweet.created_at).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {tweet.public_metrics.like_count} likes
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {tweet.public_metrics.retweet_count} retweets
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {tweet.public_metrics.reply_count} replies
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    )) || (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                      >
                        No recent tweets available
                      </Typography>
                    )
                  : (selectedAttendee as any).recentPosts.map(
                      (post: any, index: number) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {post.content}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {new Date(post.timestamp).toLocaleDateString()}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {post.engagement} engagements
                            </Typography>
                          </Box>
                        </Paper>
                      )
                    )}
              </>
            )} */}

          {/* {detailTab === 'engagement' && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Engagement History
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Engagement in this Space
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Comments:</Typography>
                    <Typography variant="body2">
                      {(selectedAttendee as any).engagement.inSpaceComments}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Liked Posts:</Typography>
                    <Typography variant="body2">
                      {(selectedAttendee as any).engagement.likedPosts}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body2">
                      Recent Interactions:
                    </Typography>
                    <Typography variant="body2">
                      {(selectedAttendee as any).engagement.recentInteractions}
                    </Typography>
                  </Box>
                </Paper>

                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Message History
                </Typography>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 2 }}
                  >
                    No previous messages with this{' '}
                    {activeTab === 'speakers' ? 'speaker' : 'attendee'}
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<MessageIcon />}
                    sx={{
                      background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
                    }}
                  >
                    Start Conversation
                  </Button>
                </Box>
              </>
            )} */}

          {detailTab === 'insights' && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                AI Insights
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                  Based on this{' '}
                  {activeTab === 'speakers' ? 'speaker' : 'attendee'}
                  's profile and activity, here are some insights:
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  •{' '}
                  {activeTab === 'speakers'
                    ? 'Key speaker in the space'
                    : 'Highly engaged in AI-related topics'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  •{' '}
                  {activeTab === 'speakers'
                    ? 'Influential voice in the community'
                    : 'Frequently interacts with content about Web3'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  •{' '}
                  {activeTab === 'speakers'
                    ? 'Active in multiple spaces'
                    : 'Active during morning hours (EST)'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  •{' '}
                  {activeTab === 'speakers'
                    ? 'Strong engagement with audience'
                    : 'Responds well to technical deep dives'}
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AutoFixHighIcon />}
                  size="small"
                >
                  Generate Deeper Insights
                </Button>
              </Paper>

              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Engagement Opportunities
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                  Recommended ways to engage with this{' '}
                  {activeTab === 'speakers' ? 'speaker' : 'attendee'}:
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  •{' '}
                  {activeTab === 'speakers'
                    ? 'Invite to future spaces'
                    : 'Share technical resources about Web3 development'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  •{' '}
                  {activeTab === 'speakers'
                    ? 'Collaborate on content'
                    : 'Invite to upcoming AI Twitter spaces'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  •{' '}
                  {activeTab === 'speakers'
                    ? 'Feature in promotional materials'
                    : 'Mention in a thread about emerging tech trends'}
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  size="small"
                >
                  Create Custom Message
                </Button>
              </Paper>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<BookmarkIcon />}
              onClick={() => {
                // handleUserClick(userDetailDrawer);
              }}
            >
              Bookmark
            </Button>

            <Button
              variant="contained"
              startIcon={<MessageIcon />}
              sx={{
                background: 'linear-gradient(90deg, #60a5fa, #8b5cf6)',
              }}
            >
              Message
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default UserProfileDrawer;

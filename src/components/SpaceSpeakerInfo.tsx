import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { getUserInfo, getUserTweets } from '../services/x.service';
import { User, Tweet } from '../types/twitter.types';

interface SpaceSpeakerInfoProps {
  userId: string;
}

export const SpaceSpeakerInfo: React.FC<SpaceSpeakerInfoProps> = ({
  userId,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load user info and tweets in parallel
        const [userInfo, userTweets] = await Promise.all([
          getUserInfo(userId),
          getUserTweets(userId, 3), // Get 3 most recent tweets
        ]);

        if (userInfo) {
          setUser(userInfo);
        }
        setTweets(userTweets);
      } catch (err) {
        console.error('Error loading speaker info:', err);
        setError('Failed to load speaker information');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" sx={{ mt: 1 }} />
        <Skeleton variant="text" />
        <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={user.profile_image_url}
          alt={user.name}
          sx={{ width: 48, height: 48 }}
        />
        <Box>
          <Typography variant="h6" component="h3">
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{user.username}
          </Typography>
        </Box>
      </Box>

      {user.description && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {user.description}
        </Typography>
      )}

      {user.public_metrics && (
        <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {user.public_metrics.followers_count.toLocaleString()} followers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.public_metrics.tweet_count.toLocaleString()} tweets
          </Typography>
        </Box>
      )}

      {tweets.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Recent Tweets
          </Typography>
          {tweets.map((tweet) => (
            <Box
              key={tweet.id}
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Typography variant="body2">{tweet.text}</Typography>
              {tweet.public_metrics && (
                <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {tweet.public_metrics.like_count} likes
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tweet.public_metrics.retweet_count} retweets
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SpaceSpeakerInfo;

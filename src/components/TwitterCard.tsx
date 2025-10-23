import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import { FavoriteBorder, Repeat, ChatBubbleOutline } from '@mui/icons-material';
import { MongoTweet } from '../types/backend.types';

interface TwitterCardProps {
  tweet: MongoTweet;
  onLike?: (tweetId: string) => void;
  onRetweet?: (tweetId: string) => void;
  onReply?: (tweetId: string) => void;
  onShare?: (tweetId: string) => void;
}

export default function TwitterCard({
  tweet,
  onLike,
  onRetweet,
  onReply,
  onShare,
}: TwitterCardProps) {
  const formatDate = (dateString: string | number | undefined) => {
    if (!dateString) return '';

    let date: Date;
    if (typeof dateString === 'string') {
      // Handle both timestamp and ISO string formats
      date = new Date(
        dateString.includes('T') ? dateString : Number(dateString) * 1000
      );
    } else {
      date = new Date(dateString * 1000);
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;

    return date.toLocaleDateString();
  };

  const handleReply = () => {
    onReply?.(tweet.id);
  };

  const formatUsername = (username: string | undefined) => {
    return username ? `@${username}` : '@unknown';
  };

  const formatDisplayName = (
    name: string | undefined,
    username: string | undefined
  ) => {
    return name || username || 'Unknown User';
  };

  // Extract hashtags, mentions, cashtags, and links from text
  const renderTweetText = (text: string | undefined) => {
    if (!text) return '';

    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <Link
            key={index}
            href={`https://twitter.com/hashtag/${word.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#1d9bf0',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {word}{' '}
          </Link>
        );
      }
      if (word.startsWith('$')) {
        return (
          <Link
            key={index}
            href={`https://twitter.com/search?q=$${word.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#00ba7c',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {word}{' '}
          </Link>
        );
      }
      if (word.startsWith('@')) {
        return (
          <Link
            key={index}
            href={`https://twitter.com/${word.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#1d9bf0',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {word}{' '}
          </Link>
        );
      }
      if (word.startsWith('http')) {
        return (
          <Link
            key={index}
            href={word}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#1d9bf0',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {word.length > 30 ? `${word.slice(0, 30)}...` : word}{' '}
          </Link>
        );
      }
      return <span key={index}>{word} </span>;
    });
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        width: 350,
        flexShrink: 0,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatDisplayName(tweet.name, tweet.username)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatUsername(tweet.username)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
            }}
          >
            {formatDate(tweet.createdAt || tweet.timestamp)}
          </Typography>
        </Box>
      </Box>

      {/* Tweet Content */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{
            lineHeight: 1.5,
            color: 'text.primary',
            mb: tweet.photos?.length || tweet.videos?.length ? 2 : 0,
          }}
        >
          {renderTweetText(tweet.text)}
        </Typography>

        {/* Media */}
        {tweet.photos && tweet.photos.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                tweet.photos.length === 1
                  ? '1fr'
                  : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 1,
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {tweet.photos.slice(0, 4).map((photo, index) => (
              <Box
                key={photo.id}
                component="img"
                src={photo.url}
                alt={photo.alt_text || 'Tweet image'}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Engagement Actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          //   justifyContent: 'space-between',
          maxWidth: 400,
        }}
      >
        <Tooltip title="Reply">
          <IconButton
            onClick={handleReply}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: '#1d9bf0',
                background: 'rgba(29, 155, 240, 0.1)',
              },
            }}
          >
            <ChatBubbleOutline fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', minWidth: 24 }}
        >
          {tweet.replies || 0}
        </Typography>

        <Repeat fontSize="small" />
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', minWidth: 24 }}
        >
          {tweet.retweets || 0}
        </Typography>

        <Tooltip title="Like">
          <FavoriteBorder fontSize="small" />
        </Tooltip>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', minWidth: 24 }}
        >
          {tweet.likes || 0}
        </Typography>
      </Box>
    </Paper>
  );
}

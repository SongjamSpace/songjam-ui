import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person,
  LocationOn,
  Link as LinkIcon,
  CalendarToday,
  Verified,
  VerifiedUser,
  Public,
  Lock,
  Mail,
} from '@mui/icons-material';
import { Profile } from '../types/backend.types';

interface ProfileCardProps {
  profile: Profile;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export default function ProfileCard({
  profile,
  onFollow,
  onMessage,
  onViewProfile,
}: ProfileCardProps) {
  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';

    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleViewProfile = () => {
    onViewProfile?.(profile.userId || '');
  };

  const handleFollow = () => {
    onFollow?.(profile.userId || '');
  };

  const handleMessage = () => {
    onMessage?.(profile.userId || '');
  };

  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        width: 350,
        flexShrink: 0,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with Avatar and Basic Info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          mb: 2,
        }}
      >
        <Avatar
          src={profile.avatar}
          sx={{
            width: 60,
            height: 60,
            border: '2px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Person />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {profile.name || 'Unknown User'}
            </Typography>

            {/* Verification badges */}
            {profile.isVerified && (
              <Verified sx={{ color: '#1d9bf0', fontSize: 20 }} />
            )}
            {profile.isBlueVerified && (
              <VerifiedUser sx={{ color: '#1d9bf0', fontSize: 20 }} />
            )}
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            @{profile.username || 'unknown'}
          </Typography>

          {/* Privacy indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {profile.isPrivate ? (
              <Lock sx={{ fontSize: 16, color: 'text.secondary' }} />
            ) : (
              <Public sx={{ fontSize: 16, color: 'text.secondary' }} />
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {profile.isPrivate ? 'Private' : 'Public'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Bio */}
      {profile.biography && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            mb: 2,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {profile.biography}
        </Typography>
      )}

      {/* Location and Website */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {profile.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {profile.location}
            </Typography>
          </Box>
        )}

        {profile.website && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Link
              href={profile.website}
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
              {profile.website}
            </Link>
          </Box>
        )}

        {profile.joined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Joined {formatDate(profile.joined)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 'auto',
          py: 1,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            {formatNumber(profile.followingCount)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Following
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            {formatNumber(profile.followersCount)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Followers
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            {formatNumber(profile.tweetsCount || profile.statusesCount)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Tweets
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

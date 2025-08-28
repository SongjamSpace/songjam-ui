import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Popover,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { EmojiEmotions, Add } from '@mui/icons-material';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface EmojiReactionsProps {
  onEmojiReact: (emoji: string) => void;
  currentEmoji: string;
  isConnected: boolean;
  isInSpace: boolean;
}

const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  onEmojiReact,
  currentEmoji,
  isConnected,
  isInSpace,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const defaultEmojis = [
    '🎉',
    '🔥',
    '😂',
    '🥁',
    '👏',
    '🎧',
    '🎵',
    '🎸',
    '🎹',
    '🎺',
  ];

  const handleAddClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setShowPicker(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowPicker(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiReact(emojiData.emoji);
    handleClose();
  };

  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography
        variant="h6"
        sx={{
          mb: { xs: 1.5, sm: 2 },
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: { xs: '1rem', sm: '1.25rem' },
        }}
      >
        <EmojiEmotions /> Reactions
      </Typography>

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 2,
          border: '1px solid rgba(96, 165, 250, 0.1)',
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{
            flexWrap: 'wrap',
            gap: { xs: 0.5, sm: 1 },
            justifyContent: 'center',
          }}
        >
          {defaultEmojis.map((emoji) => (
            <Button
              key={emoji}
              onClick={() => onEmojiReact(emoji)}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                fontSize: { xs: 18, sm: 24 },
                width: { xs: 38, sm: 48 },
                height: { xs: 38, sm: 48 },
                background: 'rgba(96, 165, 250, 0.1)',
                '&:hover': {
                  background: 'rgba(96, 165, 250, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
                border: '1px solid rgba(96, 165, 250, 0.2)',
                borderRadius: 1,
                color: 'white',
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              {emoji}
            </Button>
          ))}
          <IconButton
            onClick={handleAddClick}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              width: { xs: 38, sm: 48 },
              height: { xs: 38, sm: 48 },
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              color: '#60a5fa',
              '&:hover': {
                background: 'rgba(96, 165, 250, 0.2)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            <Add fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Stack>
      </Paper>

      <Popover
        open={showPicker}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          width={isMobile ? 300 : 400}
          height={isMobile ? 400 : 500}
          searchPlaceHolder="Search emoji..."
          skinTonesDisabled
          lazyLoadEmojis
        />
      </Popover>
    </Box>
  );
};

export default EmojiReactions;

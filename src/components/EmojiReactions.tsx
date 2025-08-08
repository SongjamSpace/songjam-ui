import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Popover,
  IconButton,
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
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <EmojiEmotions /> Reactions
      </Typography>

      <Paper
        sx={{
          p: 2,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 2,
          border: '1px solid rgba(96, 165, 250, 0.1)',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          {defaultEmojis.map((emoji) => (
            <Button
              key={emoji}
              onClick={() => onEmojiReact(emoji)}
              sx={{
                fontSize: 24,
                width: 68,
                height: 48,
                background: 'rgba(96, 165, 250, 0.1)',
                '&:hover': {
                  background: 'rgba(96, 165, 250, 0.2)',
                  transform: 'scale(1.1)',
                },
                border: currentEmoji === emoji ? '2px solid #60a5fa' : 'none',
                transition: 'all 0.2s',
              }}
              disabled={!isConnected || !isInSpace}
            >
              {emoji}
            </Button>
          ))}

          <IconButton
            onClick={handleAddClick}
            sx={{
              width: 48,
              height: 48,
              background: 'rgba(96, 165, 250, 0.1)',
              '&:hover': {
                background: 'rgba(96, 165, 250, 0.2)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s',
            }}
            disabled={!isConnected || !isInSpace}
          >
            <Add />
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
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>
    </Box>
  );
};

export default EmojiReactions;

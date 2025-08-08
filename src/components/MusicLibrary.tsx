import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  IconButton,
  Skeleton,
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';

interface AudioUpload {
  name: string;
  audioUrl: string;
}

interface MusicLibraryProps {
  audioUploads: AudioUpload[];
  selectedAudioUrl: string;
  isLibraryLoading: boolean;
  isLoading: boolean;
  onSelectUpload: (url: string) => void;
  onDeleteUpload: (fileName: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({
  audioUploads,
  selectedAudioUrl,
  isLibraryLoading,
  isLoading,
  onSelectUpload,
  onDeleteUpload,
  onFileChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textShadow: '0 0 20px rgba(96, 165, 250, 0.3)',
          letterSpacing: '0.5px',
        }}
      >
        <CloudUpload sx={{ fontSize: 28, color: '#60a5fa' }} />
        Your Music Library
      </Typography>

      <Paper
        sx={{
          p: 3,
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 3,
          maxHeight: '350px',
          overflow: 'hidden',
          border: '1px solid rgba(96, 165, 250, 0.15)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            mb: 2,
            pr: 1, // Add right padding to prevent content from being covered by scrollbar
            '&::-webkit-scrollbar': {
              width: '6px', // Reduced from 10px to 6px
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(15, 23, 42, 0.3)',
              borderRadius: '3px', // Reduced from 8px to 3px
            },
            '&::-webkit-scrollbar-thumb': {
              background:
                'linear-gradient(180deg, rgba(96, 165, 250, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
              borderRadius: '3px', // Reduced from 8px to 3px
              border: '1px solid rgba(96, 165, 250, 0.2)',
              '&:hover': {
                background:
                  'linear-gradient(180deg, rgba(96, 165, 250, 0.6) 0%, rgba(59, 130, 246, 0.6) 100%)',
              },
            },
            '&::-webkit-scrollbar-corner': {
              background: 'transparent', // Hide corner where scrollbars meet
            },
            // Hide horizontal scrollbar
            '&::-webkit-scrollbar:horizontal': {
              display: 'none',
            },
            '&::-webkit-scrollbar-thumb:horizontal': {
              display: 'none',
            },
            '&::-webkit-scrollbar-track:horizontal': {
              display: 'none',
            },
          }}
        >
          {isLibraryLoading ? (
            <List>
              {[1, 2, 3, 4, 5].map((i) => (
                <ListItemButton
                  key={i}
                  sx={{
                    borderRadius: 2,
                    mb: 1.5,
                    transition: 'all 0.3s ease',
                    background: 'rgba(96, 165, 250, 0.05)',
                    border: '1px solid rgba(96, 165, 250, 0.1)',
                  }}
                  disabled
                >
                  <Radio disabled sx={{ color: '#60a5fa' }} />
                  <ListItemText
                    primary={
                      <Skeleton
                        variant="text"
                        width={140}
                        height={24}
                        sx={{
                          bgcolor: 'rgba(96, 165, 250, 0.15)',
                          borderRadius: 1,
                        }}
                      />
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          ) : audioUploads.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <CloudUpload
                sx={{
                  fontSize: 48,
                  color: 'rgba(96, 165, 250, 0.3)',
                  mb: 2,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                }}
              >
                No tracks uploaded yet
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mt: 1,
                  opacity: 0.7,
                }}
              >
                Upload your first track to get started
              </Typography>
            </Box>
          ) : (
            <List
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {audioUploads.map((audioUpload) => (
                <ListItemButton
                  key={audioUpload.audioUrl}
                  onClick={() => onSelectUpload(audioUpload.audioUrl)}
                  selected={audioUpload.audioUrl === selectedAudioUrl}
                  sx={{
                    width: '95%',
                    borderRadius: 2,
                    mb: 1.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background:
                      audioUpload.audioUrl === selectedAudioUrl
                        ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
                    border:
                      audioUpload.audioUrl === selectedAudioUrl
                        ? '1px solid rgba(96, 165, 250, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    '&.Mui-selected': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 25px rgba(96, 165, 250, 0.2)',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0 12px 35px rgba(96, 165, 250, 0.25)',
                      },
                    },
                    '&:hover': {
                      background:
                        audioUpload.audioUrl === selectedAudioUrl
                          ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)'
                          : 'rgba(96, 165, 250, 0.08)',
                      transform: 'scale(1.01)',
                      border: '1px solid rgba(96, 165, 250, 0.2)',
                    },
                  }}
                >
                  <Radio
                    checked={audioUpload.audioUrl === selectedAudioUrl}
                    value={audioUpload.audioUrl}
                    sx={{
                      color: '#60a5fa',
                      '&.Mui-checked': {
                        color: '#3b82f6',
                      },
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          color:
                            audioUpload.audioUrl === selectedAudioUrl
                              ? '#ffffff'
                              : 'rgba(255, 255, 255, 0.9)',
                          fontWeight:
                            audioUpload.audioUrl === selectedAudioUrl
                              ? 600
                              : 500,
                          //   fontSize: '0.95rem',
                          letterSpacing: '0.3px',
                        }}
                        variant="subtitle2"
                      >
                        {audioUpload.name}
                      </Typography>
                    }
                  />
                  <IconButton
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onDeleteUpload(audioUpload.name);
                    }}
                    sx={{
                      color: 'rgba(239, 68, 68, 0.7)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      width: 32,
                      height: 32,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'rgba(239, 68, 68, 0.9)',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 1,
            borderTop: '1px solid rgba(96, 165, 250, 0.1)',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              borderColor: '#60a5fa',
              color: '#60a5fa',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              letterSpacing: '0.5px',
              background: 'rgba(96, 165, 250, 0.05)',
              borderWidth: '2px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(96, 165, 250, 0.3)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                transition: 'left 0.5s ease',
              },
              '&:hover::before': {
                left: '100%',
              },
            }}
            disabled={isLoading}
          >
            Upload New Track
          </Button>
        </Box>
      </Paper>

      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="audio/mpeg"
        onChange={onFileChange}
      />
    </Box>
  );
};

export default MusicLibrary;

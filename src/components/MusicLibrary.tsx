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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography
        variant="h5"
        sx={{
          mb: { xs: 2, sm: 3 },
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
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
        }}
      >
        <CloudUpload sx={{ fontSize: { xs: 24, sm: 28 }, color: '#60a5fa' }} />
        Your Music Library
      </Typography>

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 3,
          maxHeight: { xs: '250px', sm: '350px' },
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
            mb: { xs: 1.5, sm: 2 },
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
          }}
        >
          {isLibraryLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Skeleton
                  variant="rectangular"
                  height={isMobile ? 40 : 50}
                  sx={{
                    borderRadius: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              </Box>
            ))
          ) : audioUploads.length === 0 ? (
            // Empty state
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
              }}
            >
              <CloudUpload
                sx={{
                  fontSize: { xs: 48, sm: 64 },
                  mb: 2,
                  color: 'rgba(96, 165, 250, 0.5)',
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  mb: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                No music uploaded yet
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  opacity: 0.8,
                }}
              >
                Upload your first track to get started
              </Typography>
            </Box>
          ) : (
            // Music list
            <List dense>
              {audioUploads.map((upload, index) => {
                const isSelected = upload.audioUrl === selectedAudioUrl;
                const fileName = upload.name.replace(/\.[^/.]+$/, ''); // Remove file extension

                return (
                  <ListItemButton
                    key={index}
                    onClick={() => onSelectUpload(upload.audioUrl)}
                    selected={isSelected}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(139, 92, 246, 0.2))'
                        : 'transparent',
                      border: isSelected
                        ? '1px solid rgba(96, 165, 250, 0.3)'
                        : '1px solid transparent',
                      '&:hover': {
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.25), rgba(139, 92, 246, 0.25))'
                          : 'rgba(96, 165, 250, 0.1)',
                        borderColor: 'rgba(96, 165, 250, 0.2)',
                      },
                      transition: 'all 0.2s ease',
                      minHeight: { xs: 40, sm: 50 },
                      p: 0,
                    }}
                  >
                    <Radio
                      checked={isSelected}
                      sx={{
                        color: 'rgba(96, 165, 250, 0.5)',
                        '&.Mui-checked': {
                          color: '#60a5fa',
                        },
                        mr: { xs: 1, sm: 1.5 },
                      }}
                    />
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: isSelected ? '#60a5fa' : 'white',
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            textShadow: isSelected
                              ? '0 0 5px rgba(96, 165, 250, 0.3)'
                              : 'none',
                          }}
                        >
                          {fileName}
                        </Typography>
                      }
                      sx={{
                        flex: 1,
                        minWidth: 0, // Allow text to shrink
                      }}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUpload(upload.name);
                      }}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        color: 'rgba(255, 107, 107, 0.7)',
                        '&:hover': {
                          color: '#ff6b6b',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s',
                        ml: { xs: 0.5, sm: 1 },
                      }}
                    >
                      <Close fontSize={isMobile ? 'small' : 'small'} />
                    </IconButton>
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        {/* Upload Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: { xs: 1, sm: 1.5 },
            borderTop: '1px solid rgba(96, 165, 250, 0.1)',
          }}
        >
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            startIcon={<CloudUpload />}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              borderColor: 'rgba(96, 165, 250, 0.5)',
              color: '#60a5fa',
              '&:hover': {
                borderColor: '#60a5fa',
                background: 'rgba(96, 165, 250, 0.1)',
                transform: 'scale(1.02)',
              },
              transition: 'all 0.2s',
              minWidth: { xs: '120px', sm: '140px' },
            }}
          >
            {isLoading ? 'Uploading...' : 'Upload Music'}
          </Button>
        </Box>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="audio/mpeg"
          onChange={onFileChange}
        />
      </Paper>
    </Box>
  );
};

export default MusicLibrary;

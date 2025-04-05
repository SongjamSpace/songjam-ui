import React, { useRef } from 'react';
import { Box, Typography, Skeleton, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface TrendingSpace {
  spaceId: string;
  title: string;
}

interface TrendingSpacesProps {
  spaces: TrendingSpace[];
  loading?: boolean;
}

export const TrendingSpaces: React.FC<TrendingSpacesProps> = ({
  spaces,
  loading = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth; // Scroll by the width of the container
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box sx={{ mb: 4, position: 'relative' }}>
      <Typography
        variant="h6"
        sx={{
          color: '#60a5fa',
          mb: 2,
          fontWeight: 'bold',
        }}
      >
        Trending Spaces
      </Typography>
      <Box sx={{ position: 'relative' }}>
        {showLeftArrow && (
          <IconButton
            onClick={() => scroll('left')}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(96, 165, 250, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#60a5fa',
              zIndex: 2,
              '&:hover': {
                background: 'rgba(96, 165, 250, 0.2)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
        {showRightArrow && (
          <IconButton
            onClick={() => scroll('right')}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(96, 165, 250, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#60a5fa',
              zIndex: 2,
              '&:hover': {
                background: 'rgba(96, 165, 250, 0.2)',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
        <Box
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            overflowX: 'hidden',
            pb: 2,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: 'calc(420px + 16px)', // Width of two items (200px * 2) plus gap (16px)
            margin: '0 auto',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {loading
            ? Array(2)
                .fill(0)
                .map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    sx={{
                      bgcolor: 'rgba(96, 165, 250, 0.1)',
                      borderRadius: 2,
                      width: '200px',
                      height: '60px',
                      flexShrink: 0,
                    }}
                  />
                ))
            : spaces.map((space) => (
                <Link
                  key={space.spaceId}
                  to={`/${space.spaceId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    sx={{
                      background:
                        'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.15))',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(96, 165, 250, 0.2)',
                      borderRadius: 2,
                      p: 2,
                      width: '200px',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        background:
                          'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.2))',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'white',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {space.title}
                    </Typography>
                  </Box>
                </Link>
              ))}
        </Box>
      </Box>
    </Box>
  );
};

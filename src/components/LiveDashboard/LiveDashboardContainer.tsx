import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Space, getSpace } from '../../services/db/spaces.service';
import LiveDashboardView from './LiveDashboardView';
import { Box, CircularProgress } from '@mui/material';

const LiveDashboardContainer: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) return;

    const fetchSpace = async () => {
      try {
        const spaceData = await getSpace(spaceId, (updatedSpace) => {
          setSpace(updatedSpace);
        });
        setSpace(spaceData);
      } catch (error) {
        console.error('Error fetching space:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpace();
  }, [spaceId]);

  if (!spaceId) {
    return null;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <LiveDashboardView spaceId={spaceId} space={space} />;
};

export default LiveDashboardContainer; 
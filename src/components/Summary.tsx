import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Skeleton,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { getDetailedSummary, getSummary } from '../services/db/spaces.service';
// import { PaywallOverlay } from "./PaywallOverlay";

interface SummaryProps {
  hasAccess: boolean;
  handlePayment: () => void;
  spaceId: string;
  isProcessingPayment: boolean;
  processEnded: boolean;
}

export const Summary: React.FC<SummaryProps> = ({
  hasAccess,
  handlePayment,
  spaceId,
  isProcessingPayment,
  processEnded,
}) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  React.useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const summaryDoc = await getSummary(spaceId);
      if (summaryDoc) {
        setSummary(summaryDoc?.text);
        setLoading(false);
      }
    };
    fetchSummary();
  }, [spaceId]);

  const [detailedSummary, setDetailedSummary] = useState<string[]>([]);

  React.useEffect(() => {
    const fetchDetailedSummary = async () => {
      const detailedSummaryDoc = await getDetailedSummary(spaceId);
      if (detailedSummaryDoc) {
        setDetailedSummary(detailedSummaryDoc);
        setLoading(false);
      }
    };
    fetchDetailedSummary();
  }, [spaceId]);

  return (
    <Paper
      sx={{
        background:
          'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.1))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(59, 130, 246, 0.2)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
            '& .Mui-selected': { color: '#60a5fa !important' },
            '& .MuiTabs-indicator': { backgroundColor: '#60a5fa' },
          }}
        >
          <Tab label="Space Summary" />
          <Tab label="Detailed Summary" />
        </Tabs>
        <Box>
          <Button
            startIcon={<ContentCopyIcon />}
            size="small"
            sx={{ mr: 1, color: 'white' }}
            disabled={!hasAccess}
            onClick={() => {
              if (hasAccess) {
                navigator.clipboard.writeText(
                  activeTab === 0 ? summary : detailedSummary.join('\n')
                );
              }
            }}
          >
            Copy
          </Button>
        </Box>
      </Box>
      {activeTab === 0 && (
        <Box sx={{ position: 'relative' }}>
          {loading ? (
            <Box sx={{ mb: 2 }}>
              <Skeleton
                variant="text"
                sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)', mb: 1, height: 24 }}
              />
              <Skeleton
                variant="text"
                sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)', mb: 1, height: 24 }}
              />
              <Skeleton
                variant="text"
                sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)', mb: 1, height: 24 }}
              />
              <Skeleton
                variant="text"
                sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)', mb: 1, height: 24 }}
              />
              <Skeleton
                variant="text"
                sx={{
                  bgcolor: 'rgba(96, 165, 250, 0.1)',
                  width: '60%',
                  height: 24,
                }}
              />
              {!processEnded && <></>}
            </Box>
          ) : (
            <Typography
              sx={{
                whiteSpace: 'pre-line',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                maxHeight: '400px',
                overflow: 'hidden',
                ...(hasAccess
                  ? {}
                  : {
                      maskImage:
                        'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                    }),
              }}
            >
              {summary}
            </Typography>
          )}
          {/* {!hasAccess && (
            <PaywallOverlay
              isProcessingPayment={isProcessingPayment}
              handlePayment={handlePayment}
            />
          )} */}
        </Box>
      )}
      {activeTab === 1 && (
        <Box sx={{ position: 'relative' }}>
          {loading ? (
            <Box sx={{ mb: 2 }}>
              <Skeleton
                variant="text"
                sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)', mb: 1, height: 24 }}
              />
              <Skeleton
                variant="text"
                sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)', mb: 1, height: 24 }}
              />
              <Skeleton
                variant="text"
                sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)', mb: 1, height: 24 }}
              />
              <Skeleton
                variant="text"
                sx={{ bgcolor: 'rgba(96, 165, 250, 0.1)', mb: 1, height: 24 }}
              />
              <Skeleton
                variant="text"
                sx={{
                  bgcolor: 'rgba(96, 165, 250, 0.1)',
                  width: '60%',
                  height: 24,
                }}
              />
              {!processEnded && <></>}
            </Box>
          ) : (
            <Stack gap={2}>
              {detailedSummary.map((summary, index) => (
                <Typography key={index}>{summary}</Typography>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Paper>
  );
};

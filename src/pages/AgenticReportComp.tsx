import {
  Box,
  Typography,
  Container,
  Divider,
  Skeleton,
  Button,
} from '@mui/material';
import { AgentReport } from '../services/db/leaderboard.service';

type Props = {};

// Helper to interpolate between two oklch colors
function getOklchColor(score: number, isReverse: boolean = false) {
  // Clamp score between 0 and 100
  const s = Math.max(0, Math.min(100, score));
  // oklch(50.5% 0.213 27.518) -> [50.5, 0.213, 27.518]
  // oklch(52.7% 0.154 150.069) -> [52.7, 0.154, 150.069]
  const l0 = 50.5,
    c0 = 0.213,
    h0 = 27.518;
  const l1 = 52.7,
    c1 = 0.154,
    h1 = 150.069;
  // Linear interpolation
  let l, c, h;
  if (isReverse) {
    l = l1 - (l1 - l0) * (s / 100);
    c = c1 - (c1 - c0) * (s / 100);
    h = h1 - (h1 - h0) * (s / 100);
  } else {
    l = l0 + (l1 - l0) * (s / 100);
    c = c0 + (c1 - c0) * (s / 100);
    h = h0 + (h1 - h0) * (s / 100);
  }
  return `oklch(${l}% ${c} ${h})`;
}

// Helper to get indicator label for 1-10 scale
function getScoreIndicator(score: number) {
  if (score <= 3) return 'Low';
  if (score <= 7) return 'Medium';
  return 'High';
}

// Helper to get indicator label for 0-100 scale
function getBotScoreIndicator(score: number) {
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Medium';
  return 'High';
}

const AgenticReportComp = ({ reportInfo }: { reportInfo: AgentReport }) => {
  if (!reportInfo) {
    return (
      <Box sx={{ bgcolor: '#f1e3eb' }}>
        <Container
          sx={{
            pb: 2,
            position: 'relative',
            zIndex: 1,
            flexGrow: 1,
            bgcolor: 'white',
          }}
        >
          <Box
            sx={{
              pt: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Chakra Petch, sans-serif',
            }}
          >
            {/* Username Skeleton */}
            <Box width={220} mb={2}>
              <Skeleton variant="text" width={180} height={32} />
            </Box>
            {/* Report Card Skeleton */}
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  background: 'white',
                  width: '100%',
                  maxWidth: 600,
                  mx: 'auto',
                  color: 'black',
                  fontFamily: 'Chakra Petch, sans-serif',
                }}
              >
                <Skeleton
                  variant="text"
                  width={160}
                  height={32}
                  sx={{ mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width={100}
                  height={24}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={40}
                  sx={{ mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width={120}
                  height={24}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={40}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box>
                    <Skeleton variant="text" width={80} height={24} />
                    <Skeleton variant="text" width={60} height={36} />
                    <Skeleton variant="text" width={60} height={24} />
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box>
                    <Skeleton variant="text" width={80} height={24} />
                    <Skeleton variant="text" width={60} height={36} />
                    <Skeleton variant="text" width={60} height={24} />
                  </Box>
                </Box>
                <Skeleton
                  variant="text"
                  width={120}
                  height={24}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={40}
                  sx={{ mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width={140}
                  height={24}
                  sx={{ mb: 0.5 }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box>
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width={120} height={24} />
                  </Box>
                  <Box>
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width={120} height={24} />
                  </Box>
                </Box>
                <Skeleton
                  variant="text"
                  width={160}
                  height={24}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton variant="text" width={80} height={36} />
                <Skeleton variant="text" width={60} height={24} />
              </Box>
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'center'}>
            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                width: '100%',
                display: 'block',
                color: '#b0b0b0',
                fontFamily: 'Chakra Petch, sans-serif',
              }}
            >
              Powered by{' '}
              <a
                href="https://songjam.space/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  color: '#ff007a',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.textDecoration = 'underline')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.textDecoration = 'none')
                }
              >
                Songjam
              </a>
            </Typography>
          </Box>
        </Container>
        <Box
          sx={{ width: '100%', pt: 4 }}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          gap={1}
          flexWrap={'wrap'}
        >
          {/* Skeletons for tweets */}
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={350}
              height={680}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ bgcolor: '#f1e3eb' }}>
      <Container
        // maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
          bgcolor: 'white',
        }}
      >
        {/* Content */}
        <Box
          sx={{
            // minWidth: 320,
            // minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pt: 4,
            fontFamily: 'Chakra Petch, sans-serif',
          }}
        >
          {/* ActionScoreBar omitted */}
          <Box sx={{ width: '100%' }}>
            {/* Report Section */}
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                background: 'white',
                width: '100%',
                maxWidth: 600,
                mx: 'auto',
                color: 'black',
                fontFamily: 'Chakra Petch, sans-serif',
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    fontFamily: 'Chakra Petch, sans-serif',
                    color: 'black',
                  }}
                >
                  Account Report
                </Typography>
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: 'black',
                }}
              >
                Summary
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: 'black',
                }}
              >
                {reportInfo.summary}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: 'black',
                }}
              >
                Replies Analysis
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: 'black',
                }}
              >
                {reportInfo.repliesAnalysis}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'Chakra Petch, sans-serif',
                      color: 'black',
                    }}
                  >
                    Authenticity
                  </Typography>
                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'Chakra Petch, sans-serif',
                      color: getOklchColor(
                        (reportInfo.authenticity - 1) * 11.111
                      ),
                      display: 'inline-block',
                      mr: 1,
                    }}
                  >
                    {reportInfo.authenticity}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'inline-block',
                      fontWeight: 600,
                      fontFamily: 'Chakra Petch, sans-serif',
                      color: getOklchColor(
                        (reportInfo.authenticity - 1) * 11.111
                      ),
                    }}
                  >
                    {getScoreIndicator(reportInfo.authenticity)}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'Chakra Petch, sans-serif',
                      color: 'black',
                    }}
                  >
                    Quality
                  </Typography>
                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'Chakra Petch, sans-serif',
                      color: getOklchColor((reportInfo.quality - 1) * 11.111),
                      display: 'inline-block',
                      mr: 1,
                    }}
                  >
                    {reportInfo.quality}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'inline-block',
                      fontWeight: 600,
                      fontFamily: 'Chakra Petch, sans-serif',
                      color: getOklchColor((reportInfo.quality - 1) * 11.111),
                    }}
                  >
                    {getScoreIndicator(reportInfo.quality)}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: 'black',
                }}
              >
                Explanation
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: 'black',
                  mb: 2,
                }}
              >
                {reportInfo.explanation}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: 'black',
                }}
              >
                Farming Indicators
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'black',
                      fontFamily: 'Chakra Petch, sans-serif',
                    }}
                  >
                    Avg. Hashtags:{' '}
                    <b>{reportInfo.farmingIndicators.averageHashtags}</b>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'black',
                      fontFamily: 'Chakra Petch, sans-serif',
                    }}
                  >
                    Avg. Mentions:{' '}
                    <b>{reportInfo.farmingIndicators.averageMentions}</b>
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'black',
                      fontFamily: 'Chakra Petch, sans-serif',
                    }}
                  >
                    GM Tweet Count:{' '}
                    <b>{reportInfo.farmingIndicators.gmTweetCount}</b>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'black',
                      fontFamily: 'Chakra Petch, sans-serif',
                    }}
                  >
                    Call-to-Action Ratio:{' '}
                    <b>{reportInfo.farmingIndicators.callToActionRatio}</b>
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: 'black',
                }}
              >
                Bot Likelihood Score
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'Chakra Petch, sans-serif',
                  mb: 1,
                  color: getOklchColor(reportInfo.botLikelihoodScore, true),
                  display: 'inline-block',
                  mr: 1,
                }}
              >
                {reportInfo.botLikelihoodScore}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  display: 'inline-block',
                  fontWeight: 600,
                  fontFamily: 'Chakra Petch, sans-serif',
                  color: getOklchColor(reportInfo.botLikelihoodScore, true),
                }}
              >
                {getBotScoreIndicator(reportInfo.botLikelihoodScore)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* <Box display={'flex'} justifyContent={'center'}>
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              width: '100%',
              display: 'block',
              color: '#b0b0b0',
              fontFamily: 'Chakra Petch, sans-serif',
            }}
          >
            Powered by{' '}
            <a
              href="https://songjam.space/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontWeight: 'bold',
                textDecoration: 'none',
                color: '#ff007a',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.textDecoration = 'underline')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.textDecoration = 'none')
              }
            >
              Songjam
            </a>
          </Typography>
        </Box> */}
      </Container>
    </Box>
  );
};

export default AgenticReportComp;

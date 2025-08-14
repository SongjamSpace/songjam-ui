import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material';
import {
  useCollection,
  useCollectionData,
} from 'react-firebase-hooks/firestore';
import {
  collection,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase.service';
import {
  grantSpacePoints,
  markSubmissionAsDone,
  SpaceSubmission,
} from '../services/db/spaceSubmissions.service';
import {
  getSpace,
  Space,
  TranscriptionProgress,
  TwitterUser,
} from '../services/db/spaces.service';
import axios from 'axios';
import { extractSpaceId } from '../utils';
import { transcribePy } from '../services/transcription.service';

// No need for SpaceSubmissionWithDetails since we're not fetching space details in the table

// Component to fetch and display space details in dialog
const SpaceDetailsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  spaceUrl: string;
  submission: SpaceSubmission & { id: string };
}> = ({ open, onClose, spaceUrl, submission }) => {
  const [spaceDetails, setSpaceDetails] = useState<Space | null>(null);
  const [loading, setLoading] = useState(false);
  const [baseSpaceYaps, setBaseSpaceYaps] = useState(5);

  useEffect(() => {
    if (open && spaceUrl) {
      fetchSpaceDetails();
    }
  }, [open, spaceUrl]);

  const fetchSpaceDetails = async () => {
    setLoading(true);
    try {
      const spaceId = extractSpaceId(spaceUrl);
      if (!spaceId) {
        alert('Space URL is invalid: ' + spaceUrl);
        return;
      }
      const details = await getSpace(spaceId);
      setSpaceDetails(details);
    } catch (error) {
      console.error('Error fetching space details:', error);
      setSpaceDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'N/A';
  };

  const calculateFinalPoints = () => {
    const liveListeners = spaceDetails?.totalLiveListeners || 0;
    const speakersCount = spaceDetails?.speakers?.length || 1;
    return Math.round(baseSpaceYaps * (liveListeners / speakersCount));
  };

  const handleAnalyzeCoin = async () => {
    try {
      const spaceId = extractSpaceId(spaceUrl);
      if (!spaceId) {
        alert('Space URL is invalid: ' + spaceUrl);
        return;
      }
      await axios.post(
        `${
          import.meta.env.VITE_JAM_TWEET_AGENT_URL
        }/api/analyze-songjam-mentions`,
        {
          spaceId,
        }
      );
      // Refresh space details after analysis
      await fetchSpaceDetails();
    } catch (e) {
      alert('Coin Analysis failed. Try again after transcribing the space');
    }
  };

  const transcriptionExists =
    spaceDetails?.transcriptionProgress === TranscriptionProgress.ENDED;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        zIndex: 99999999,
        '& .MuiDialog-paper': {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
        },
      }}
    >
      <DialogTitle sx={{ backgroundColor: '#1e1e1e', color: '#ffffff' }}>
        <Typography variant="h6" sx={{ color: '#ffffff' }}>
          Space Submission Details
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#1e1e1e', color: '#ffffff' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Space Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                Space Information
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#2d2d2d',
                  borderRadius: 1,
                  border: '1px solid #404040',
                }}
              >
                <Box display={'flex'} gap={2} alignItems={'center'}>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    sx={{ color: '#ffffff' }}
                  >
                    {spaceDetails?.title || 'N/A'}
                  </Typography>
                  <Chip
                    label={spaceDetails?.state || 'N/A'}
                    color={
                      spaceDetails?.state === 'Ended'
                        ? 'success'
                        : spaceDetails?.state === 'Running'
                        ? 'error'
                        : 'default'
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  <a
                    href={spaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#64b5f6' }}
                  >
                    {spaceUrl}
                  </a>
                </Typography>
              </Box>
            </Grid>

            {/* User Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                User Information
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#2d2d2d',
                  borderRadius: 1,
                  border: '1px solid #404040',
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ color: '#ffffff' }}
                >
                  {submission.name || submission.username || 'Unknown'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  User ID: {submission.userId}
                </Typography>
                {submission.username && (
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Username: {submission.username}
                  </Typography>
                )}
                {submission.twitterId && (
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Twitter: {submission.twitterId}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Submitted: {formatDate(submission.createdAt)}
                </Typography>
              </Box>
            </Grid>

            {/* Space Statistics */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                Space Statistics
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#2d2d2d',
                  borderRadius: 1,
                  border: '1px solid #404040',
                }}
              >
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  Live Listeners: {spaceDetails?.totalLiveListeners || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  Speakers: {spaceDetails?.speakers?.length || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  Started:{' '}
                  {spaceDetails?.startedAt
                    ? new Date(spaceDetails.startedAt).toLocaleString()
                    : 'N/A'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Points Calculation */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                Points Calculation
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#2d2d2d',
                  borderRadius: 1,
                  border: '1px solid #404040',
                }}
              >
                <TextField
                  label="Base Space Yaps"
                  type="number"
                  value={baseSpaceYaps}
                  onChange={(e) =>
                    setBaseSpaceYaps(Number(e.target.value) || 0)
                  }
                  size="small"
                  sx={{
                    mb: 2,
                    '& .MuiInputLabel-root': { color: '#b0b0b0' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#404040' },
                      '&:hover fieldset': { borderColor: '#64b5f6' },
                      '&.Mui-focused fieldset': { borderColor: '#64b5f6' },
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                  }}
                />
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                  Calculation: {baseSpaceYaps} × (
                  {spaceDetails?.totalLiveListeners || 0} ÷{' '}
                  {spaceDetails?.speakers?.length || 1})
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                  = {baseSpaceYaps} ×{' '}
                  {(
                    (spaceDetails?.totalLiveListeners || 0) /
                    (spaceDetails?.speakers?.length || 1)
                  ).toFixed(2)}
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ color: '#ffffff' }}
                >
                  Final Points: {calculateFinalPoints()}
                </Typography>
              </Box>
            </Grid>

            {/* Coin Analysis */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                Coin Analysis
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#2d2d2d',
                  borderRadius: 1,
                  border: '1px solid #404040',
                }}
              >
                {spaceDetails?.coinAnalysis ? (
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: '#ffffff' }}
                    >
                      Mentions: {spaceDetails.coinAnalysis.noOfMentions}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      SANG: {spaceDetails.coinAnalysis.breakdown.sang}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      SONGJAM: {spaceDetails.coinAnalysis.breakdown.songjam}
                    </Typography>
                    {spaceDetails.coinAnalysis.speakerMentions && (
                      <>
                        <Chip
                          label={
                            spaceDetails.coinAnalysis.speakerMentions.some(
                              (mention: any) =>
                                mention.userId === submission.twitterId
                            )
                              ? 'User Mentioned ✓'
                              : 'User Not Mentioned ✗'
                          }
                          color={
                            spaceDetails.coinAnalysis.speakerMentions.some(
                              (mention: any) =>
                                mention.userId === submission.twitterId
                            )
                              ? 'success'
                              : 'error'
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ color: '#ffffff' }}
                          >
                            Speaker Mentions:
                          </Typography>
                          {spaceDetails.coinAnalysis.speakerMentions.map(
                            (mention: any, index: number) => (
                              <Typography
                                key={index}
                                variant="body2"
                                sx={{ color: '#b0b0b0' }}
                              >
                                {mention.name} (@{mention.username}) -{' '}
                                {mention.count}
                              </Typography>
                            )
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                ) : (
                  <Button
                    onClick={async () => {
                      if (transcriptionExists) {
                        handleAnalyzeCoin();
                      } else {
                        if (spaceDetails?.hlsUrl) {
                          transcribePy(
                            spaceDetails.hlsUrl,
                            spaceDetails?.spaceId
                          );
                          alert('Submitted for transcribing, come back later');
                        } else {
                          alert('Space URL is invalid: ' + spaceUrl);
                        }
                      }
                    }}
                    variant="outlined"
                    color="primary"
                    size="small"
                    disabled={!spaceDetails}
                  >
                    {transcriptionExists
                      ? 'Analyze Coin Mentions'
                      : 'Transcribe Space'}
                  </Button>
                )}
                {!transcriptionExists && (
                  <Typography variant="body2" sx={{ color: '#b0b0b0', mt: 1 }}>
                    Transcription {spaceDetails?.transcriptionStatus} -{' '}
                    {spaceDetails?.userHelperMessage}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Speakers List */}
            {spaceDetails?.speakers && spaceDetails.speakers.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                  Speakers
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#2d2d2d',
                    borderRadius: 1,
                    border: '1px solid #404040',
                  }}
                >
                  {spaceDetails.speakers.map(
                    (speaker: TwitterUser, index: number) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{ color: '#ffffff' }}
                      >
                        <a
                          href={`https://x.com/${speaker.twitterScreenName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#ffffff',
                            textDecoration: 'underline',
                          }}
                        >
                          {speaker.displayName} (@{speaker.twitterScreenName})
                        </a>
                      </Typography>
                    )
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#1e1e1e', color: '#ffffff' }}>
        {!spaceDetails && (
          <Button
            variant="outlined"
            color="success"
            onClick={async () => {
              const spaceId = extractSpaceId(spaceUrl);
              if (!spaceId) {
                alert('Space URL is invalid: ' + spaceUrl);
                return;
              }
              window.open(
                `https://songjam.space/dashboard?spaceId=${spaceId}`,
                '_blank'
              );
            }}
            sx={{ mr: 1 }}
          >
            Analyze Space
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          onClick={async () => {
            await markSubmissionAsDone(submission.id as string);
            onClose();
          }}
        >
          Mark Done (NO POINTS)
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            if (!submission.twitterId)
              return alert(
                'Problem with granting points, manually add them on Firebase'
              );
            // TODO: Implement approval logic
            const finalPoints = calculateFinalPoints();
            const ok = confirm(
              `Are you ok to grant ${finalPoints} points to ${
                submission.name || submission.username || 'Unknown'
              }?`
            );
            if (!ok) {
              return;
            }
            await grantSpacePoints(
              submission.twitterId,
              submission.name || '',
              submission.username || '',
              finalPoints
            );
            await markSubmissionAsDone(submission.id as string);
            console.log('Approving submission:', submission);
            onClose();
          }}
          disabled={!spaceDetails}
        >
          Grant Points
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SpaceSubmissionsTable: React.FC = () => {
  const [submissions, setSubmissions] = useState<
    (SpaceSubmission & { id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<
    (SpaceSubmission & { id: string }) | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [submittedSpacesV2] = useCollection(
    query(
      collection(db, 'spaceSubmissions'),
      //   where('status', '!=', 'DONE'),
      orderBy('createdAt', 'desc'),
      limit(35)
    )
  );

  useEffect(() => {
    if (submittedSpacesV2) {
      const filteredSubmissions = submittedSpacesV2.docs
        .map(
          (doc) =>
            ({ ...doc.data(), id: doc.id } as SpaceSubmission & {
              id: string;
            })
        )
        .filter((submission) => submission.status !== 'done');
      debugger;
      setSubmissions(filteredSubmissions);
      setLoading(false);
    }
  }, [submittedSpacesV2]);

  const formatDate = (date: any) => {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'N/A';
  };

  const handleViewDetails = (submission: SpaceSubmission & { id: string }) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubmission(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
        Space Submissions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Space Title & URL</TableCell>
              <TableCell>User Info</TableCell>
              <TableCell>Submitted On</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      {submission.spaceUrl.split('/').pop() || 'N/A'}
                    </Typography>
                    <a
                      href={submission.spaceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1976d2', textDecoration: 'none' }}
                    >
                      {submission.spaceUrl}
                    </a>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {submission.name || submission.username || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {submission.userId}
                    </Typography>
                    {submission.username && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="textSecondary"
                      >
                        Username: {submission.username}
                      </Typography>
                    )}
                    {submission.twitterId && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="textSecondary"
                      >
                        Twitter: {submission.twitterId}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{formatDate(submission.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleViewDetails(submission)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Space Details Dialog */}
      {selectedSubmission && (
        <SpaceDetailsDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          spaceUrl={selectedSubmission.spaceUrl}
          submission={selectedSubmission}
        />
      )}
    </Box>
  );
};

export default SpaceSubmissionsTable;

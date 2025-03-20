import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSpace, Segment, Space } from "./services/db/spaces.service";
import { Box, Typography, Avatar, Paper, Chip, Button } from "@mui/material";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import {
  Autorenew as AutorenewIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";

const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SpaceDetails: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeSection, setActiveSection] = useState<'summary' | 'timeline' | 'transcript'>('summary');

  useEffect(() => {
    if (!spaceId) return;
    const fetchSpace = async () => {
      const space = await getSpace(spaceId);
      setSpace(space as Space);
    };
    fetchSpace();
  }, [spaceId]);

  const mockAISummary = `🤖 AI Summary:

This Space explored the future of web3 social platforms with industry experts. Key points:

• Discussion of decentralized identity solutions
• Analysis of token-gated communities
• Debate on privacy vs transparency
• Predictions for 2024 trends

Most engaging moment: The heated debate about data ownership rights at 23:45.
Standout speaker: @crypto_sarah with insights on scalable governance models.`;

  return (
    <Box sx={{ 
      background: "linear-gradient(to bottom, #0f172a, #1e293b)",
      minHeight: "100vh",
      color: "white"
    }}>
      {space && (
        <Box sx={{ maxWidth: "800px", margin: "0 auto", padding: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, position: "relative" }}>
            <Typography variant="overline" 
              sx={{ 
                color: "#60a5fa",
                background: "rgba(59, 130, 246, 0.1)",
                padding: "4px 12px",
                borderRadius: "16px",
                display: "inline-block",
                mb: 2
              }}>
              LIVE TRANSCRIPT
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
              {space.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Chip 
                icon={<AutorenewIcon />} 
                label={`${space.total_live_listeners} listening`}
                sx={{ background: "rgba(255,255,255,0.1)" }}
              />
              <Chip 
                label={`${space.total_replay_watched} replays`}
                sx={{ background: "rgba(255,255,255,0.1)" }}
              />
            </Box>
          </Box>

          {/* Navigation Controls */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 3,
            borderRadius: 2,
            background: "rgba(30, 41, 59, 0.7)",
            p: 1
          }}>
            <Button
              variant={activeSection === 'summary' ? 'contained' : 'text'}
              onClick={() => setActiveSection('summary')}
              sx={{ 
                color: 'white',
                '&.MuiButton-contained': { bgcolor: '#60a5fa' }
              }}
            >
              AI Summary
            </Button>
            <Button
              variant={activeSection === 'timeline' ? 'contained' : 'text'}
              onClick={() => setActiveSection('timeline')}
              sx={{ 
                color: 'white',
                '&.MuiButton-contained': { bgcolor: '#60a5fa' }
              }}
            >
              Timeline
            </Button>
            <Button
              variant={activeSection === 'transcript' ? 'contained' : 'text'}
              onClick={() => setActiveSection('transcript')}
              sx={{ 
                color: 'white',
                '&.MuiButton-contained': { bgcolor: '#60a5fa' }
              }}
            >
              Transcript
            </Button>
          </Box>

          {/* AI Summary Card */}
          {activeSection === 'summary' && <Paper sx={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.2))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: 2,
            p: 3,
            mb: 4
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" sx={{ color: "#60a5fa" }}>
                AI Summary
              </Typography>
              <Box>
                <Button 
                  startIcon={<ShareIcon />}
                  size="small"
                  sx={{ mr: 1, color: "white" }}
                >
                  Share
                </Button>
                <Button
                  startIcon={<BookmarkIcon />}
                  size="small"
                  sx={{ color: "white" }}
                >
                  Save
                </Button>
              </Box>
            </Box>
            <Typography 
              sx={{ 
                whiteSpace: "pre-line",
                fontSize: "1.1rem",
                lineHeight: 1.6
              }}
            >
              {mockAISummary}
            </Typography>
          </Paper>

          {/* Speakers */}
          <Paper sx={{
            background: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
            p: 3,
            mb: 4
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Speakers</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {space.admins?.map((admin) => (
                <Box
                  key={admin.user_id}
                  component="a"
                  href={`https://twitter.com/${admin.twitter_screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textDecoration: "none",
                    color: "inherit",
                    background: "rgba(255,255,255,0.05)",
                    p: 1,
                    borderRadius: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      background: "rgba(255,255,255,0.1)",
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  <Avatar src={admin.avatar_url} alt={admin.display_name} />
                  <Box>
                    <Typography sx={{ fontWeight: "bold" }}>{admin.display_name}</Typography>
                    <Typography sx={{ color: "#60a5fa" }}>@{admin.twitter_screen_name}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Timeline */}
          {activeSection === 'timeline' && <Paper sx={{
            background: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
            p: 3
          }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Transcript Timeline</Typography>
            <Timeline>
              {space.segments?.map((segment: Segment, index: number) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: "#60a5fa" }} />
                    {index < (space.segments?.length ?? 0) - 1 && (
                      <TimelineConnector sx={{ bgcolor: "rgba(96, 165, 250, 0.3)" }} />
                    )}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{
                      background: "rgba(255,255,255,0.05)",
                      p: 2,
                      borderRadius: 2,
                      mb: 2
                    }}>
                      <Typography>{segment.text}</Typography>
                      <Typography variant="caption" sx={{ color: "#60a5fa" }}>
                        {formatSeconds(segment.start)}
                      </Typography>
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>}

          {/* Transcript Section */}
          {activeSection === 'transcript' && (
            <Paper sx={{
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              p: 3
            }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Full Transcript</Typography>
              <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {space.segments?.map((segment: Segment, index: number) => (
                  <Box key={index} sx={{
                    background: "rgba(255,255,255,0.05)",
                    p: 2,
                    borderRadius: 2,
                    mb: 2
                  }}>
                    <Typography>{segment.text}</Typography>
                    <Typography variant="caption" sx={{ color: "#60a5fa" }}>
                      {formatSeconds(segment.start)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SpaceDetails;
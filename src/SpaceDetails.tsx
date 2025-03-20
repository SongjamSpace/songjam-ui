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
  ContentCopy as ContentCopyIcon,
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
  const [activeSection, setActiveSection] = useState<'summary' | 'timeline' | 'transcript' | 'threadoor'>('summary');

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
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      minHeight: "100vh",
      color: "white",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "60vh",
        background: "linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.1))",
        opacity: 0.7,
        pointerEvents: "none",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)"
      }
    }}>
      {space && (
        <Box sx={{ 
          maxWidth: "800px", 
          margin: "0 auto", 
          padding: { xs: 2, sm: 3, md: 4 },
          position: "relative",
          zIndex: 1
        }}>
          {/* Header */}
          <Box sx={{ mb: 4, position: "relative" }}>
            <Typography variant="overline" 
              sx={{ 
                color: "#60a5fa",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
                padding: "6px 16px",
                borderRadius: "20px",
                display: "inline-block",
                mb: 2,
                letterSpacing: "0.1em",
                fontWeight: 600,
                fontSize: "0.75rem"
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
                sx={{ background: "var(--bg-secondary)" }}
              />
              <Chip 
                label={`${space.total_replay_watched} replays`}
                sx={{ background: "var(--bg-secondary)" }}
              />
            </Box>
          </Box>

          {/* Navigation Controls */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mb: 4,
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
            p: 1,
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            <Button
              variant={activeSection === 'summary' ? 'contained' : 'text'}
              onClick={() => setActiveSection('summary')}
              sx={{ 
                color: 'white',
                '&.MuiButton-contained': { 
                  background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))"
                }
              }}
            >
              AI Summary
            </Button>
            <Button
              variant={activeSection === 'timeline' ? 'contained' : 'text'}
              onClick={() => setActiveSection('timeline')}
              sx={{ 
                color: 'white',
                '&.MuiButton-contained': { 
                  background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))"
                }
              }}
            >
              Timeline
            </Button>
            <Button
              variant={activeSection === 'transcript' ? 'contained' : 'text'}
              onClick={() => setActiveSection('transcript')}
              sx={{ 
                color: 'white',
                '&.MuiButton-contained': { 
                  background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))"
                }
              }}
            >
              Transcript
            </Button>
            <Button
              variant={activeSection === 'threadoor' ? 'contained' : 'text'}
              onClick={() => setActiveSection('threadoor')}
              sx={{ 
                color: 'white',
                '&.MuiButton-contained': { 
                  background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))"
                }
              }}
            >
              AI Threadoor
            </Button>
          </Box>

          {/* Speakers */}
          <Paper sx={{
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 3,
            p: 4,
            mb: 4,
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.03)",
              transform: "translateY(-2px)"
            }
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

          {/* AI Summary Card */}
          {activeSection === 'summary' && (
            <Paper sx={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.1))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 3,
              p: 4,
              mb: 4,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(59, 130, 246, 0.2)"
              }
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "#60a5fa" }}>
                  AI Summary
                </Typography>
                <Box>
                  <Button 
                    startIcon={<ContentCopyIcon />}
                    size="small"
                    sx={{ mr: 1, color: "white" }}
                  >
                    Copy
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
          )}

          {/* Timeline */}
          {activeSection === 'timeline' && (
            <Paper sx={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              p: 3,
              "&:hover": {
                background: "rgba(255, 255, 255, 0.05)",
              },
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
            </Paper>
          )}

          {/* AI Threadoor Section */}
          {activeSection === 'threadoor' && (
            <Paper sx={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.1))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 3,
              p: 4,
              mb: 4,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(59, 130, 246, 0.2)"
              }
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" sx={{ color: "#60a5fa" }}>
                  Twitter Thread Generator
                </Typography>
                <Typography variant="caption" sx={{ color: "#60a5fa" }}>
                  Each tweet is within the 280 character limit
                </Typography>
              </Box>
              {[
                "🧵 Key insights from our Web3 Social Platforms Space:",
                
                "1/ The future of decentralized identity is taking shape! Our experts discussed how self-sovereign identity could revolutionize social media authentication.",
                
                "2/ Token-gated communities are becoming more sophisticated. We're seeing a shift from simple ownership requirements to complex participation-based access.",
                
                "3/ The privacy vs transparency debate is heating up. The consensus? We need a hybrid approach that protects user data while maintaining platform integrity.",
                
                "4/ 2024 Predictions:\n- Rise of modular social platforms\n- Integration with DeFi protocols\n- Enhanced data portability\n- More focus on user governance",
                
                "5/ @crypto_sarah dropped some 🔥 insights on scalable governance models. Her framework for progressive decentralization is a must-read for Web3 builders.",
                
                "6/ The most engaging moment? Our heated debate on data ownership rights. The community was split on whether users should have full control over their social graph.",
                
                "7/ What's next for Web3 social?\n- Better UX for non-crypto natives\n- Interoperable identity systems\n- Real-world governance implementation\n- Enhanced privacy tools",
                
                "🎤 Thanks to all our speakers and listeners! Follow for more Web3 insights.\n\n/end"
              ].map((tweet, index) => (
                <Paper key={index} sx={{
                  background: "rgba(255,255,255,0.05)",
                  p: 2,
                  borderRadius: 2,
                  mb: 2,
                  position: "relative",
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)"
                  }
                }}>
                  <Typography 
                    sx={{ 
                      whiteSpace: "pre-line",
                      fontSize: "1.1rem",
                      lineHeight: 1.6,
                      fontFamily: "monospace",
                      pr: 4
                    }}
                  >
                    {tweet}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: "absolute",
                      right: 8,
                      bottom: 8,
                      color: tweet.length > 280 ? "#ef4444" : "#60a5fa"
                    }}
                  >
                    {tweet.length}/280
                  </Typography>
                  <Button
                    startIcon={<ContentCopyIcon />}
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      color: "white",
                      minWidth: "auto"
                    }}
                    onClick={() => navigator.clipboard.writeText(tweet)}
                  >
                    Copy
                  </Button>
                </Paper>
              ))}
            </Paper>
          )}

          {/* Transcript Section */}
          {activeSection === 'transcript' && (
            <Paper sx={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              p: 3,
              "&:hover": {
                background: "rgba(255, 255, 255, 0.05)",
              },
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
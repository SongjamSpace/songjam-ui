import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSpace, Segment, Space } from "./services/db/spaces.service";
import { Box, Typography, Avatar, Paper, Chip, Button, TextField, MenuItem } from "@mui/material";
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Thread Settings</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    select
                    label="Numbering Style"
                    defaultValue="1/"
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="1/">1/</MenuItem>
                    <MenuItem value="(1)">(1)</MenuItem>
                    <MenuItem value="">None</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Thread Indicator"
                    defaultValue="🧵"
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="🧵">🧵</MenuItem>
                    <MenuItem value="📝">📝</MenuItem>
                    <MenuItem value="Thread:">Thread:</MenuItem>
                    <MenuItem value="">None</MenuItem>
                  </TextField>
                </Box>
              </Box>
              {[
                "🧵 Unpacking the future of Web3 Social Platforms: Key insights from our groundbreaking Space featuring industry leaders, tech visionaries, and web3 builders. A thread on decentralization, governance, and the evolution of digital communities... 👇",
                
                "1/ The future of decentralized identity is revolutionizing social media! Our panel of experts discussed how self-sovereign identity systems are enabling users to maintain complete control over their digital presence while ensuring platform security and accountability. #Web3 #Identity",
                
                "2/ Token-gated communities are evolving beyond simple ownership requirements! We're witnessing a transformation towards dynamic access models that factor in participation metrics, contribution history, and reputation scores. This creates more engaged and valuable communities. 🔑",
                
                "3/ The privacy vs transparency debate sparked intense discussion. The consensus? A sophisticated hybrid approach is emerging where users can selectively reveal data while maintaining core privacy. This enables both platform integrity and user sovereignty. Key examples shared: 🔐",
                
                "4/ 2024 Predictions from our expert panel:\n\n- Rise of modular social platforms with plug-and-play components\n- Deep integration with DeFi protocols for tokenized engagement\n- Enhanced data portability standards\n- User-driven governance frameworks\n- AI-powered content curation",
                
                "5/ Spotlight on @crypto_sarah's revolutionary insights on scalable governance! Her framework for progressive decentralization introduces innovative concepts like reputation-weighted voting, delegate pools, and automated policy enforcement. This could reshape how DAOs operate. 🚀",
                
                "6/ The Space's most engaging segment? Our heated debate on data ownership rights! The community was split between full user control of social graphs vs platform-managed systems. Important nuances emerged around data portability, platform sustainability, and user privacy. 🤔",
                
                "7/ What's next for Web3 social?\n\n- Seamless UX that hides complexity from non-crypto users\n- Cross-chain identity and reputation systems\n- Real-world governance implementation at scale\n- Zero-knowledge privacy tools\n- Decentralized content moderation\n\n#Web3Social #Future",
                
                "🎤 Huge thanks to our brilliant speakers and engaged audience! This conversation showcased the rapid evolution of Web3 social platforms. Follow us for more deep dives into the future of decentralized technology.\n\nSave this thread for future reference! 🔖\n\n/end"
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
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    pt: 1,
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: tweet.length > 280 ? "#ef4444" : "#60a5fa"
                      }}
                    >
                      {tweet.length}/280
                    </Typography>
                    <Button
                      startIcon={<ContentCopyIcon />}
                      size="small"
                      sx={{
                        color: "white",
                        minWidth: "auto"
                      }}
                      onClick={() => navigator.clipboard.writeText(tweet)}
                    >
                      Copy
                    </Button>
                  </Box>
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
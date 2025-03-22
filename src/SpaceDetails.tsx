import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getFirstLevelSummaries,
  getSpace,
  getSpaceAudioDownloadUrl,
  Segment,
  Space,
} from "./services/db/spaces.service";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  Button,
  TextField,
  IconButton,
  Skeleton,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Summary } from "./components/Summary";
import { LoadingButton } from "@mui/lab";
import SegmentsTimeline from "./components/SegmentsTimeline";
import DisplayThread from "./components/DisplayThread";
import axios from "axios";

const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SpaceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [activeSection, setActiveSection] = useState<
    "summary" | "timeline" | "transcript" | "threadoor" | "moments"
  >("summary");
  const [searchTerm, setSearchTerm] = useState(""); // Added search term state
  const [filteredTranscript, setFilteredTranscript] = useState<Segment[]>([]); // Added filtered transcript state
  const [hasAccess, setHasAccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [metaSummaryList, setMetaSummaryList] = useState<string[]>([]);
  const [segmentsAndText, setSegmentsAndText] = useState<{
    segments: Segment[];
    text: string;
  } | null>(null);
  const [twitterThread, setTwitterThread] = useState<string[]>([]);

  useEffect(() => {
    if (!spaceId) return;
    const fetchSpace = async () => {
      const space = await getSpace(spaceId);
      setSpace(space as Space);
    };
    // const fetchSegments = async () => {
    //   const _segmentsAndText = await getSegmentsAndText(spaceId);
    //   setSegmentsAndText(
    //     _segmentsAndText as { segments: Segment[]; text: string }
    //   );
    //   setFilteredTranscript(_segmentsAndText?.segments || []);
    // };
    // const fetchTwitterThread = async () => {
    //   const twitterThread = await getTwitterThread(spaceId);
    //   setTwitterThread(twitterThread);
    // };
    fetchSpace();
    // fetchSegments();
    // fetchTwitterThread();
  }, [spaceId]);

  useEffect(() => {
    if (space) {
      const filtered = space.segments?.filter((segment) =>
        segment.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTranscript(filtered || []);
    }
  }, [searchTerm, space]); // Update filteredTranscript on searchTerm or space change

  const onGenerateTwitterThread = async () => {
    if (!spaceId) return;
    let _metaSummary = metaSummaryList;
    if (_metaSummary.length === 0) {
      _metaSummary = await getFirstLevelSummaries(spaceId);
      if (_metaSummary?.length) {
        setMetaSummaryList(_metaSummary);
      }
    }
    if (_metaSummary?.length) {
      const twitterThread = await axios.post(
        `${import.meta.env.VITE_JAM_PY_SERVER_URL}/twitter-thread`,
        {
          space_id: spaceId,
          text: _metaSummary.join(" "),
          speakers: [...(space?.admins || []), ...(space?.speakers || [])].map(
            (speaker) => ({
              name: speaker.display_name,
              handle: speaker.twitter_screen_name,
            })
          ),
        }
      );
      const twitterThreadData = twitterThread.data;
      if (twitterThreadData.status === "success") {
        setTwitterThread(twitterThreadData.twitter_thread);
      }
    } else {
      alert("Transcription is in progress, try again later");
    }
  };

  return (
    <Box
      sx={{
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
          background:
            "linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.1))",
          opacity: 0.7,
          pointerEvents: "none",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)",
        },
      }}
    >
      <Box
        sx={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: { xs: 2, sm: 3, md: 4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, position: "relative" }}>
          <Box display="flex" justifyContent="space-between">
            <Typography
              variant="overline"
              sx={{
                color: "#60a5fa",
                background:
                  "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
                padding: "6px 16px",
                borderRadius: "20px",
                display: "inline-block",
                mb: 2,
                letterSpacing: "0.1em",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            >
              LIVE TRANSCRIPT
            </Typography>
            <Box>
              <IconButton onClick={() => navigate("/")}>
                <ArrowBackIcon />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            {space ? (
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", flexBasis: "70%" }}
              >
                {space.title}
              </Typography>
            ) : (
              <Skeleton
                variant="text"
                sx={{
                  bgcolor: "rgba(96, 165, 250, 0.1)",
                  width: "70%",
                  height: 48,
                }}
              />
            )}
            <LoadingButton
              loading={isDownloading}
              disabled={!space || space.transcription_status !== "ENDED"}
              startIcon={<DownloadIcon />}
              onClick={async () => {
                if (!spaceId) return;
                setIsDownloading(true);
                const audioUrl = await getSpaceAudioDownloadUrl(spaceId);
                const response = await fetch(audioUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${space?.title}.mp3`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setIsDownloading(false);
              }}
              sx={{
                color: "#60a5fa",
                background: "rgba(96, 165, 250, 0.1)",
                "&:hover": {
                  background: "rgba(96, 165, 250, 0.2)",
                },
                textTransform: "none",
                px: 2,
                py: 1,
              }}
            >
              {isDownloading
                ? "Downloading..."
                : !space || space.transcription_status !== "ENDED"
                ? "Preparing"
                : "Download Recording"}
            </LoadingButton>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            {space ? (
              <>
                <Chip
                  icon={<AutorenewIcon />}
                  label={`${space.total_live_listeners} listening`}
                  sx={{ background: "var(--bg-secondary)" }}
                />
                <Chip
                  label={`${space.total_replay_watched} replays`}
                  sx={{ background: "var(--bg-secondary)" }}
                />
              </>
            ) : (
              <>
                <Skeleton
                  variant="rounded"
                  sx={{
                    bgcolor: "rgba(96, 165, 250, 0.1)",
                    width: 120,
                    height: 32,
                  }}
                />
                <Skeleton
                  variant="rounded"
                  sx={{
                    bgcolor: "rgba(96, 165, 250, 0.1)",
                    width: 100,
                    height: 32,
                  }}
                />
              </>
            )}
          </Box>
        </Box>

        {/* Navigation Controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 4,
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
            p: 1,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <Button
            variant={activeSection === "summary" ? "contained" : "text"}
            onClick={() => setActiveSection("summary")}
            sx={{
              color: "white",
              "&.MuiButton-contained": {
                background:
                  "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))",
              },
            }}
          >
            Summary
          </Button>
          <Button
            variant={activeSection === "timeline" ? "contained" : "text"}
            onClick={() => setActiveSection("timeline")}
            sx={{
              color: "white",
              "&.MuiButton-contained": {
                background:
                  "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))",
              },
            }}
            disabled={!hasAccess}
          >
            Timeline
          </Button>
          <Button
            variant={activeSection === "transcript" ? "contained" : "text"}
            onClick={() => setActiveSection("transcript")}
            sx={{
              color: "white",
              "&.MuiButton-contained": {
                background:
                  "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))",
              },
            }}
            disabled={!hasAccess}
          >
            Transcript
          </Button>
          <Button
            variant={activeSection === "threadoor" ? "contained" : "text"}
            onClick={() => setActiveSection("threadoor")}
            sx={{
              color: "white",
              "&.MuiButton-contained": {
                background:
                  "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))",
              },
            }}
            disabled={!hasAccess}
          >
            AI Threadoor
          </Button>
          <Button
            variant={activeSection === "moments" ? "contained" : "text"}
            onClick={() => setActiveSection("moments")}
            sx={{
              color: "white",
              "&.MuiButton-contained": {
                background:
                  "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))",
              },
            }}
            disabled={!hasAccess}
          >
            Memorable Moments
          </Button>
        </Box>

        {/* Speakers */}
        <Paper
          sx={{
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 3,
            p: 4,
            mb: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Speakers
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {space ? (
              space.admins?.map((admin) => (
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
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Avatar src={admin.avatar_url} alt={admin.display_name} />
                  <Box>
                    <Typography sx={{ fontWeight: "bold" }}>
                      {admin.display_name}
                    </Typography>
                    <Typography sx={{ color: "#60a5fa" }}>
                      @{admin.twitter_screen_name}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      background: "rgba(255,255,255,0.05)",
                      p: 1,
                      borderRadius: 2,
                      width: 200,
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={40}
                      height={40}
                      sx={{ bgcolor: "rgba(96, 165, 250, 0.1)" }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton
                        variant="text"
                        sx={{
                          bgcolor: "rgba(96, 165, 250, 0.1)",
                          width: "80%",
                        }}
                      />
                      <Skeleton
                        variant="text"
                        sx={{
                          bgcolor: "rgba(96, 165, 250, 0.1)",
                          width: "60%",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Paper>

        {/* Summary Card */}
        {activeSection === "summary" && space?.spaceId && (
          <Summary
            hasAccess={hasAccess}
            setHasAccess={setHasAccess}
            spaceId={space.spaceId}
          />
        )}

        {/* Timeline */}
        {activeSection === "timeline" && (
          <Paper
            sx={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              p: 3,
              "&:hover": {
                background: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Transcript Timeline
            </Typography>
            {space?.transcription_status === "ENDED" && (
              <SegmentsTimeline spaceId={space.spaceId} />
            )}
          </Paper>
        )}

        {/* AI Threadoor Section */}
        {activeSection === "threadoor" && space?.spaceId && (
          <DisplayThread
            spaceId={space.spaceId}
            onGenerateTwitterThread={onGenerateTwitterThread}
            twitterThread={twitterThread || []}
          />
        )}

        {/* Memorable Moments Section */}
        {activeSection === "moments" && (
          <Paper
            sx={{
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.1))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 3,
              p: 4,
              mb: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: "#60a5fa", mb: 3 }}>
              Memorable Moments
            </Typography>
            {[
              {
                quote:
                  "The future of web3 social isn't about replacing traditional platforms - it's about empowering users with true digital ownership.",
                speaker: "crypto_sarah",
                timestamp: "12:35",
              },
              {
                quote:
                  "When we talk about decentralized identity, we're really talking about the foundation of digital trust.",
                speaker: "web3_builder",
                timestamp: "23:15",
              },
              {
                quote:
                  "Token-gated communities are just the beginning. The real innovation comes from dynamic access models that evolve with participation.",
                speaker: "defi_max",
                timestamp: "45:20",
              },
            ].map((moment, index) => (
              <Paper
                key={index}
                sx={{
                  background: "rgba(255,255,255,0.05)",
                  p: 3,
                  borderRadius: 2,
                  mb: 2,
                  position: "relative",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                >
                  "{moment.quote}"
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ color: "#60a5fa" }}>
                    @{moment.speaker}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="caption" sx={{ color: "#60a5fa" }}>
                      {moment.timestamp}
                    </Typography>
                    <Button
                      startIcon={<ContentCopyIcon />}
                      size="small"
                      sx={{ color: "white", minWidth: "auto" }}
                      onClick={() =>
                        navigator.clipboard.writeText(moment.quote)
                      }
                    >
                      Copy
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Paper>
        )}

        {/* Transcript Section */}
        {activeSection === "transcript" && (
          <Paper
            sx={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 2,
              p: 3,
              "&:hover": {
                background: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Full Transcript
            </Typography>
            <TextField
              label="Search Transcript"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />{" "}
            {/* Added search bar */}
            <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
              {filteredTranscript.map((segment: Segment, index: number) => (
                <Box
                  key={index}
                  sx={{
                    background: "rgba(255,255,255,0.05)",
                    p: 2,
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
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
    </Box>
  );
};

export default SpaceDetails;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getFirstLevelSummaries,
  getSpace,
  getSpaceAudioDownloadUrl,
  getTwitterThread,
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
  Stack,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Badge,
} from "@mui/material";
// import AutorenewIcon from "@mui/icons-material/Autorenew";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Summary } from "./components/Summary";
import { LoadingButton } from "@mui/lab";
import SegmentsTimeline from "./components/SegmentsTimeline";
import DisplayThread from "./components/DisplayThread";
import axios from "axios";
import { useWallet } from "./hooks/useWallet";
// import { WalletModal } from "./components/WalletModal";
import { ethers } from "ethers";
import { hasAccessToSpace, updateAccess } from "./services/db/user.service";
import Logo from "./components/Logo";
import ConnectButton from "./components/ConnectButton";
import AlgoliaSearchTranscription from "./components/AlgoliaSearchTranscription";

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

const SpaceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [activeSection, setActiveSection] = useState<
    "summary" | "timeline" | "transcript" | "threadoor" | "moments"
  >("timeline");
  // const [searchTerm, setSearchTerm] = useState(""); // Added search term state
  // const [filteredTranscript, setFilteredTranscript] = useState<Segment[]>([]); // Added filtered transcript state
  const [hasAccess, setHasAccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [metaSummaryList, setMetaSummaryList] = useState<string[]>([]);
  const [segmentsAndText, setSegmentsAndText] = useState<{
    segments: Segment[];
    text: string;
  } | null>(null);
  const [twitterThread, setTwitterThread] = useState<string[]>([]);
  // const [showWalletModal, setShowWalletModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const {
    isConnected,
    connectWallet,
    disconnect,
    address,
    chainId,
    provider,
    isConnecting,
    handleSolanaConnect,
  } = useWallet();

  // const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    if (address && spaceId) {
      const checkAccess = async () => {
        const hasAccess = await hasAccessToSpace(address, spaceId);
        setHasAccess(hasAccess);
      };
      checkAccess();
    } else {
      setHasAccess(false);
    }
  }, [address, spaceId]);

  useEffect(() => {
    if (!spaceId) return;
    const fetchSpace = async () => {
      const space = await getSpace(spaceId, (space) => {
        setSpace(space);
      });
      setSpace(space);
      if (!space) {
        setToast({
          open: true,
          message: "Error: Space not found",
          severity: "error",
        });
      }
    };
    fetchSpace();
  }, [spaceId]);

  // useEffect(() => {
  //   if (segmentsAndText) {
  //     const filtered = segmentsAndText?.segments?.filter((segment) =>
  //       segment.text.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //     setFilteredTranscript(filtered || []);
  //   }
  // }, [searchTerm, segmentsAndText]); // Update filteredTranscript on searchTerm or space change

  const onGenerateTwitterThread = async (
    numberingStyle: number,
    threadIndicator: number
  ) => {
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
          numbering_style: numberingStyle,
          thread_indicator: threadIndicator,
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

  const handlePayment = async () => {
    if (!spaceId) {
      setToast({
        open: true,
        message: "Error: No space is selected",
        severity: "error",
      });
      return;
    }
    let connectedAddress = address;
    if (!isConnected || !address) {
      connectedAddress = await connectWallet("eth");
    }
    if (!connectedAddress) {
      setToast({
        open: true,
        message: "Error: Failed to connect wallet",
        severity: "error",
      });
      return;
    }

    try {
      setIsProcessingPayment(true);

      const parsedAmount = ethers.parseUnits("1", 6);
      const usdtAddress =
        chainId === 1
          ? "0xdAC17F958D2ee523a2206206994597C13D831ec7"
          : "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2";
      const receiverAddress = import.meta.env.VITE_PAYMENT_RECEIVER_ADDRESS;
      // Create provider and signer
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const usdtContract = new ethers.Contract(
        usdtAddress,
        [
          "function balanceOf(address owner) view returns (uint256)",
          "function transfer(address to, uint256 value) public returns (bool)",
        ],
        signer
      );
      const balance = await usdtContract.balanceOf(connectedAddress);
      if (balance < parsedAmount) {
        alert("Insufficient USDT balance!");
        return;
      }

      const tx = await usdtContract.transfer(receiverAddress, parsedAmount);

      setToast({
        open: true,
        message: "Payment in progress... Stay in the page",
        severity: "success",
      });
      await tx?.wait();
      setToast({
        open: true,
        message: "Payment successful! Transcription process started",
        severity: "success",
      });
      await updateAccess(connectedAddress, spaceId);
      setHasAccess(true);
      if (space) {
        const formData = new FormData();
        formData.append("hls_url", space.hls_url);
        formData.append("space_id", spaceId);
        await axios.post(
          `${import.meta.env.VITE_JAM_PY_SERVER_URL}/transcribe`,
          formData
        );
        setToast({
          open: true,
          message: "Transcription process started",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setToast({
        open: true,
        message: "Payment failed. Please try again.",
        severity: "error",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // const handleWalletConnect = async () => {
  //   await connectWallet();
  //   setShowWalletModal(false);
  //   handlePayment();
  // };

  useEffect(() => {
    // if (
    //   activeSection === "transcript" &&
    //   spaceId &&
    //   space?.transcription_status === "ENDED"
    // ) {
    //   const fetchSegments = async () => {
    //     setIsTranscriptLoading(true);
    //     const _segmentsAndText = await getSegmentsAndText(spaceId);
    //     setSegmentsAndText(
    //       _segmentsAndText as { segments: Segment[]; text: string }
    //     );
    //     setIsTranscriptLoading(false);
    //   };
    //   fetchSegments();
    // } else
    if (
      activeSection === "threadoor" &&
      spaceId &&
      space?.transcription_status === "ENDED" &&
      twitterThread.length === 0
    ) {
      const fetchTwitterThread = async () => {
        setIsThreadLoading(true);
        const twitterThread = await getTwitterThread(spaceId);
        setTwitterThread(twitterThread);
        setIsThreadLoading(false);
      };
      fetchTwitterThread();
    }
  }, [activeSection, spaceId, space]);

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };
  const handleConnect = async (chainType: "eth" | "solana") => {
    if (chainType === "eth") {
      await connectWallet("eth");
    } else {
      await handleSolanaConnect();
    }
  };

  const onDownloadRecording = async () => {
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
      <nav>
        <Box
          className="logo"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <Logo />
          <span>Songjam</span>
        </Box>
        <div className="nav-controls">
          <ConnectButton
            address={address}
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={handleConnect}
            onDisconnect={disconnect}
          />
        </div>
      </nav>
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
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                letterSpacing: "0.1em",
                fontWeight: 600,
                fontSize: "0.75rem",
                position: "relative",
                overflow: "hidden",
                "&::after":
                  space?.transcription_status !== "ENDED"
                    ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.2), transparent)",
                        animation: "shimmer 1.5s infinite",
                      }
                    : {},
                "@keyframes shimmer": {
                  "0%": {
                    transform: "translateX(-100%)",
                  },
                  "100%": {
                    transform: "translateX(100%)",
                  },
                },
              }}
            >
              {space?.user_message}
              {space?.transcription_status !== "ENDED" &&
                space?.transcription_status !== "SHORT_ENDED" && (
                  <Box
                    component="span"
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid transparent",
                      borderTopColor: "#60a5fa",
                      borderRightColor: "#60a5fa",
                      animation: "spin 1s linear infinite",
                      "@keyframes spin": {
                        "0%": {
                          transform: "rotate(0deg)",
                        },
                        "100%": {
                          transform: "rotate(360deg)",
                        },
                      },
                    }}
                  />
                )}
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
                variant={"h4"}
                sx={{ fontWeight: "bold", flexBasis: { xs: "90%", sm: "70%" } }}
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
            {isMobile ? (
              <IconButton
                disabled={!space || space.transcription_status !== "ENDED"}
                onClick={onDownloadRecording}
              >
                {isDownloading ? (
                  <CircularProgress size={20} />
                ) : (
                  <DownloadIcon />
                )}
              </IconButton>
            ) : (
              <LoadingButton
                loading={isDownloading}
                disabled={!space || space.transcription_status !== "ENDED"}
                startIcon={<DownloadIcon />}
                onClick={onDownloadRecording}
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
                {isDownloading ? "Downloading..." : "Download Recording"}
              </LoadingButton>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            {space ? (
              <Chip
                icon={<HeadphonesIcon />}
                label={`${space.total_live_listeners} listened live`}
                sx={{ background: "var(--bg-secondary)" }}
              />
            ) : (
              <Skeleton
                variant="rounded"
                sx={{
                  bgcolor: "rgba(96, 165, 250, 0.1)",
                  width: 120,
                  height: 32,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Navigation Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            mb: 4,
          }}
        >
          {/* Button Group Container with integrated arrows */}
          <Box
            sx={{
              display: "flex",
              flex: 1,
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              overflow: "hidden",
            }}
          >
            {/* Left Arrow - Only show on mobile when scrollable */}
            <IconButton
              sx={{
                display: { xs: "flex", sm: "none" },
                color: "white",
                borderRadius: "16px 0 0 16px",
                padding: "0 8px",
                "&.Mui-disabled": {
                  display: "none",
                },
                minWidth: "auto",
                flex: "0 0 auto",
              }}
              onClick={() => {
                const container = document.querySelector(
                  ".nav-scroll-container"
                );
                if (container) {
                  const scrollLeft = container.scrollLeft;
                  const buttonWidth = 120;
                  const targetScroll =
                    Math.floor(scrollLeft / buttonWidth) * buttonWidth -
                    buttonWidth;
                  container.scrollTo({
                    left: targetScroll,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>

            <Box
              className="nav-scroll-container"
              sx={{
                display: "flex",
                gap: 1,
                overflowX: { xs: "auto", sm: "visible" },
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
                scrollBehavior: "smooth",
                scrollSnapType: "x mandatory",
                p: 1,
                flex: 1,
              }}
            >
              {/* Existing Buttons */}
              <Button
                variant={activeSection === "timeline" ? "contained" : "text"}
                onClick={() => setActiveSection("timeline")}
                sx={{
                  color: "white",
                  minWidth: { xs: "120px", sm: "140px" },
                  // flex: { xs: "0 0 auto", sm: "1 1 0" },
                  scrollSnapAlign: "start",
                  "&.MuiButton-contained": {
                    background:
                      "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))",
                  },
                }}
              >
                Timeline
              </Button>
              <Button
                variant={activeSection === "summary" ? "contained" : "text"}
                onClick={() => setActiveSection("summary")}
                sx={{
                  color: "white",
                  minWidth: { xs: "120px", sm: "140px" },
                  flex: { xs: "0 0 auto", sm: "1 1 0" },
                  scrollSnapAlign: "start",
                  "&.MuiButton-contained": {
                    background:
                      "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))",
                  },
                }}
                disabled={!hasAccess}
              >
                Summary
              </Button>
              <Button
                variant={activeSection === "threadoor" ? "contained" : "text"}
                onClick={() => setActiveSection("threadoor")}
                sx={{
                  color: "white",
                  minWidth: { xs: "120px", sm: "140px" },
                  flex: { xs: "0 0 auto", sm: "1 1 0" },
                  scrollSnapAlign: "start",
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
                variant={activeSection === "transcript" ? "contained" : "text"}
                onClick={() => setActiveSection("transcript")}
                sx={{
                  color: "white",
                  minWidth: { xs: "120px", sm: "140px" },
                  flex: { xs: "0 0 auto", sm: "1 1 0" },
                  scrollSnapAlign: "start",
                  "&.MuiButton-contained": {
                    background:
                      "linear-gradient(135deg, var(--gradient-start), var(--gradient-middle), var(--gradient-end))",
                  },
                }}
                disabled={!hasAccess}
              >
                Transcription
              </Button>
            </Box>

            {/* Right Arrow - Only show on mobile when scrollable */}
            <IconButton
              sx={{
                display: { xs: "flex", sm: "none" },
                color: "white",
                borderRadius: "0 16px 16px 0",
                padding: "0 8px",
                "&.Mui-disabled": {
                  display: "none",
                },
                minWidth: "auto",
                flex: "0 0 auto",
              }}
              onClick={() => {
                const container = document.querySelector(
                  ".nav-scroll-container"
                );
                if (container) {
                  const scrollLeft = container.scrollLeft;
                  const buttonWidth = 120;
                  const targetScroll =
                    Math.ceil(scrollLeft / buttonWidth) * buttonWidth +
                    buttonWidth;
                  container.scrollTo({
                    left: targetScroll,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Speakers */}
        <Paper
          sx={{
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 3,
            p: { xs: 2, sm: 4 },
            mb: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Speakers
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "start",
              // flexWrap: { xs: "nowrap", sm: "wrap" },
              gap: 2,
              // overflowX: { xs: "auto", sm: "visible" },
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              pb: { xs: 1, sm: 0 }, // Add padding bottom on mobile for better scrolling
              py: 2,
            }}
          >
            {space ? (
              [...space.admins, ...space.speakers]?.map((admin, i) => (
                <Badge
                  key={admin.user_id}
                  badgeContent={i < space.admins.length ? "Host" : ""}
                  color="primary"
                  variant="standard"
                  // dont show empty badge
                  invisible={i >= space.admins.length}
                >
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
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        background: "rgba(255,255,255,0.1)",
                        transform: "translateY(-2px)",
                      },
                      flex: { xs: "0 0 auto", sm: "0 1 auto" }, // Prevent shrinking on mobile
                      minWidth: { xs: "250px", sm: "auto" }, // Set minimum width on mobile
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
                </Badge>
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
            handlePayment={handlePayment}
            spaceId={space.spaceId}
            isProcessingPayment={isProcessingPayment}
            processEnded={space.transcription_status === "ENDED"}
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
            {space?.spaceId && (
              <SegmentsTimeline
                spaceId={space.spaceId}
                hasAccess={hasAccess}
                isProcessingPayment={isProcessingPayment}
                handlePayment={handlePayment}
                processEnded={space.transcription_status === "ENDED"}
                refresh={space.transcription_status === "SHORT_ENDED"}
              />
            )}
          </Paper>
        )}

        {/* AI Threadoor Section */}
        {activeSection === "threadoor" && space?.spaceId && (
          <DisplayThread
            spaceId={space.spaceId}
            onGenerateTwitterThread={onGenerateTwitterThread}
            twitterThread={twitterThread || []}
            isThreadLoading={isThreadLoading}
            processEnded={space.transcription_status === "ENDED"}
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
            {[].map((moment, index) => (
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
                  {/* "{moment.quote}" */}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ color: "#60a5fa" }}>
                    {/* @{moment.speaker} */}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="caption" sx={{ color: "#60a5fa" }}>
                      {/* {moment.timestamp} */}
                    </Typography>
                    <Button
                      startIcon={<ContentCopyIcon />}
                      size="small"
                      sx={{ color: "white", minWidth: "auto" }}
                      onClick={
                        () => {}
                        // navigator.clipboard.writeText(moment.quote)
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
        {activeSection === "transcript" && space?.spaceId && (
          <AlgoliaSearchTranscription
            spaceId={space.spaceId}
            title={space.title}
          />
        )}
      </Box>
      {/* <WalletModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectChain={handleChainSelect}
        isConnected={isConnected}
        onDisconnect={disconnect}
      /> */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SpaceDetails;

import React from "react";
import { Box, Typography, Paper, Button, Skeleton } from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { getSummary } from "../services/db/spaces.service";
import { LoadingButton } from "@mui/lab";

interface SummaryProps {
  hasAccess: boolean;
  handlePayment: () => void;
  spaceId: string;
  isProcessingPayment: boolean;
}

export const Summary: React.FC<SummaryProps> = ({
  hasAccess,
  handlePayment,
  spaceId,
  isProcessingPayment,
}) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");

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

  return (
    <Paper
      sx={{
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.1))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: 3,
        p: 4,
        mb: 4,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 40px rgba(59, 130, 246, 0.2)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" sx={{ color: "#60a5fa" }}>
          Space Summary
        </Typography>
        <Box>
          <Button
            startIcon={<ContentCopyIcon />}
            size="small"
            sx={{ mr: 1, color: "white" }}
            disabled={!hasAccess}
          >
            Copy
          </Button>
          <Button
            startIcon={<BookmarkIcon />}
            size="small"
            sx={{ color: "white" }}
            disabled={!hasAccess}
          >
            Save
          </Button>
        </Box>
      </Box>
      <Box sx={{ position: "relative" }}>
        {loading ? (
          <Box sx={{ mb: 2 }}>
            <Skeleton
              variant="text"
              sx={{ bgcolor: "rgba(96, 165, 250, 0.1)", mb: 1, height: 24 }}
            />
            <Skeleton
              variant="text"
              sx={{ bgcolor: "rgba(96, 165, 250, 0.1)", mb: 1, height: 24 }}
            />
            <Skeleton
              variant="text"
              sx={{ bgcolor: "rgba(96, 165, 250, 0.1)", mb: 1, height: 24 }}
            />
            <Skeleton
              variant="text"
              sx={{ bgcolor: "rgba(96, 165, 250, 0.1)", mb: 1, height: 24 }}
            />
            <Skeleton
              variant="text"
              sx={{
                bgcolor: "rgba(96, 165, 250, 0.1)",
                width: "60%",
                height: 24,
              }}
            />
          </Box>
        ) : (
          <Typography
            sx={{
              whiteSpace: "pre-line",
              fontSize: "1.1rem",
              lineHeight: 1.6,
              maxHeight: "400px",
              overflow: "hidden",
              ...(hasAccess
                ? {}
                : {
                    maskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
                  }),
            }}
          >
            {summary}
          </Typography>
        )}
        {!hasAccess && (
          <Box
            sx={{
              position: "absolute",
              top: "25%",
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              background:
                "linear-gradient(to bottom, rgba(15,23,42,0) 0%, rgba(15,23,42,1) 25%)",
              padding: 3,
              textAlign: "center",
            }}
          >
            <Paper
              elevation={24}
              sx={{
                mt: 2,
                background: "rgba(30, 41, 59, 0.95)",
                borderRadius: 3,
                p: 2.5,
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(96, 165, 250, 0.2)",
                maxWidth: "300px",
                width: "100%",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 1,
                  background: "linear-gradient(135deg, #60a5fa, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  fontWeight: "bold",
                }}
              >
                Unlock Full Access
              </Typography>
              <Typography sx={{ mb: 3, color: "#94a3b8" }}>
                Get complete access to this space for just $1 USDT
              </Typography>

              <LoadingButton
                loading={isProcessingPayment}
                variant="contained"
                fullWidth
                size="large"
                onClick={handlePayment}
                sx={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  py: 1.5,
                  borderRadius: 2,
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Pay $1 USDT
              </LoadingButton>
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../services/firebase.service";
import { collection, orderBy, query } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Box, Button, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import axios from "axios";
import { LoadingButton } from "@mui/lab";

const TranscriptionContainer = styled.div`
  width: 60%;
  height: 90%;
  padding: 20px;
  background-color: #1e293b;
  border-radius: 12px;
  overflow-y: auto;
  white-space: pre-wrap;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  border: 1px solid ${({ theme }) => theme.palette.divider};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  /* Add scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.palette.background.default};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.divider};
    border-radius: 4px;
  }
`;

const AnimatedText = styled.span<{ theme: Theme }>`
  opacity: 0;
  animation: fadeIn 0.8s ease-in forwards;
  color: ${({ theme }) => theme.palette.text.primary};
  line-height: 1.6;
  font-size: 1.1rem;
  font-family: "Inter", sans-serif;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StyledHeader = styled(Typography)`
  background: linear-gradient(
    135deg,
    var(--gradient-start),
    var(--gradient-middle),
    var(--gradient-end)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  position: relative;
  margin-bottom: 24px !important;

  &:after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: ${({ theme }) => theme.palette.primary.main};
    border-radius: 2px;
  }
`;

const TranscriptionRow = styled(Box)`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) =>
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.02)"};
    transform: translateX(4px);
  }
`;

const TimeStamp = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.85rem;
  margin-bottom: 6px;
  font-style: italic;
`;

const TranscriptionText = styled(Typography)`
  font-size: 1rem;
  line-height: 2;
  font-family: "Inter", sans-serif;
  letter-spacing: 0.3px;
  font-weight: 400;

  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.palette.text.primary} 0%,
    ${({ theme }) => theme.palette.primary.main} 50%,
    ${({ theme }) => theme.palette.text.primary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: shine 8s linear infinite;

  @keyframes shine {
    to {
      background-position: 200% center;
    }
  }
`;

export const TranscriptionBox = ({ spaceId }: { spaceId: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [transcriptions, loading, error] = useCollectionData(
    query(
      collection(db, `spaces/${spaceId}/transcriptions`),
      orderBy("createdAt", "asc")
    )
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptionDocs, setTranscriptionDocs] = useState<any[]>([]);

  useEffect(() => {
    if (scrollContainerRef.current && transcriptions) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [transcriptions]);

  useEffect(() => {
    if (transcriptions) {
      const messages: string[] = [];
      const uniqueTranscripts = [];
      for (const doc of transcriptions) {
        if (!messages.includes(doc.transcription)) {
          uniqueTranscripts.push(doc);
          messages.push(doc.transcription);
        }
      }
      setTranscriptionDocs(uniqueTranscripts);
    }
  }, [transcriptions]);

  //   useEffect(() => {
  //     if (transcriptions) {
  //       const fullText = transcriptions
  //         // .sort((a, b) => a.timestamp - b.timestamp) // Add timestamp field if not already present
  //         .map((doc) => doc.transcription)
  //         .join(" ");
  //       setDisplayText(fullText);
  //     }
  //   }, [transcriptions]);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      //   justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={2}
      p={2}
    >
      <StyledHeader variant="h4">Space Transcription</StyledHeader>
      <TranscriptionContainer ref={scrollContainerRef}>
        {transcriptionDocs?.map((transcription) => (
          <TranscriptionRow key={transcription.createdAt}>
            <TimeStamp variant="caption">
              {formatTimestamp(transcription.createdAt)}
            </TimeStamp>
            <TranscriptionText
              variant="body1"
              sx={{
                wordBreak: "break-word",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                padding: "4px 0",
              }}
            >
              {transcription.transcription.trim()}
            </TranscriptionText>
          </TranscriptionRow>
        ))}
      </TranscriptionContainer>
      <Box>
        <LoadingButton
          variant="contained"
          className="primary"
          loading={isLoading}
          onClick={async () => {
            setIsLoading(true);
            await axios.post(
              `${import.meta.env.VITE_JAM_SERVER_URL}/leave-space`,
              {
                spaceId,
              }
            );
            setIsLoading(false);
          }}
        >
          Leave Space
        </LoadingButton>
      </Box>
    </Box>
  );
};

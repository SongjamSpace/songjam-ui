import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../services/firebase.service";
import { collection, doc, query, limit, orderBy } from "firebase/firestore";
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineConnector,
  TimelineSeparator,
  timelineOppositeContentClasses,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import { Segment } from "../services/db/spaces.service";
import {
  Box,
  Typography,
  Skeleton,
  CircularProgress,
  Stack,
} from "@mui/material";
import { formatSeconds } from "../utils";
import { PaywallOverlay } from "./PaywallOverlay";

type Props = {
  spaceId: string;
  hasAccess: boolean;
  isProcessingPayment: boolean;
  handlePayment: () => void;
  processEnded: boolean;
};

function SegmentsTimeline({
  spaceId,
  processEnded,
  hasAccess,
  isProcessingPayment,
  handlePayment,
}: Props) {
  const [segments, loading, error] = useCollectionData(
    query(
      collection(
        db,
        "spaces",
        spaceId,
        hasAccess && processEnded ? "segments" : "short_segments"
      ),
      orderBy("start", "asc"),
      limit(hasAccess ? (processEnded ? 50 : 15) : 5)
    )
  );

  if (error) return <div>Error: {error.message}</div>;

  if (!segments || segments?.length === 0) {
    return (
      <Box width={"100%"} height={400}>
        <Timeline
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.2,
            },
          }}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <TimelineItem key={item}>
              <TimelineOppositeContent>
                <Skeleton width={40} />
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Skeleton width="100%" />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        {!hasAccess && (
          <PaywallOverlay
            isProcessingPayment={isProcessingPayment}
            handlePayment={handlePayment}
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      width={"100%"}
      // height={"85vh"}
      sx={{ overflow: "auto", position: "relative" }}
    >
      <Timeline
        sx={{
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.2,
          },
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
        {(segments as Segment[])?.map((segment: Segment) => (
          <TimelineItem key={segment.id}>
            <TimelineOppositeContent color="textSecondary">
              {formatSeconds(segment.start)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body2">{segment.text}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
        {!processEnded && (
          <TimelineContent sx={{ display: "flex", justifyContent: "center" }}>
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size={28} />
              <Typography variant="body2">
                Transcription is still in progress
              </Typography>
            </Stack>
          </TimelineContent>
        )}
      </Timeline>
      {!hasAccess && (
        <PaywallOverlay
          isProcessingPayment={isProcessingPayment}
          handlePayment={handlePayment}
        />
      )}
    </Box>
  );
}

export default SegmentsTimeline;

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
  Button,
} from "@mui/material";
import { formatSeconds } from "../utils";
import { PaywallOverlay } from "./PaywallOverlay";
import { useState } from "react";

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
  const [segmentLimit, setSegmentLimit] = useState(
    hasAccess ? (processEnded ? 50 : 15) : 5
  );

  const [segments, loading, error] = useCollectionData(
    query(
      collection(
        db,
        "spaces",
        spaceId,
        hasAccess && processEnded ? "segments" : "short_segments"
      ),
      orderBy("start", "asc"),
      limit(segmentLimit)
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
      </Timeline>
      {hasAccess && processEnded && segments?.length >= segmentLimit && (
        <Box display="flex" justifyContent="center" mt={2} mb={2}>
          <Button
            variant="outlined"
            onClick={() => setSegmentLimit((prev) => prev + 50)}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            disabled={loading}
          >
            Load More
          </Button>
        </Box>
      )}
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

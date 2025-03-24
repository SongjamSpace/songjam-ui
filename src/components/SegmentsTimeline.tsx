import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../services/firebase.service";
import {
  collection,
  doc,
  query,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";
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
import { useState, useEffect } from "react";
import { getDocs } from "firebase/firestore";

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
  const BATCH_SIZE = 50;
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSegments = async (isInitial = false) => {
    try {
      setLoading(true);
      const collectionRef = collection(
        db,
        "spaces",
        spaceId,
        hasAccess && processEnded ? "segments" : "short_segments"
      );

      let q = query(
        collectionRef,
        orderBy("start", "asc"),
        limit(
          isInitial
            ? hasAccess
              ? processEnded
                ? BATCH_SIZE
                : 15
              : 5
            : BATCH_SIZE
        )
      );

      if (!isInitial && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const newSegments = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...(doc.data() as Segment),
      }));

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setSegments((prev) =>
        isInitial ? newSegments : [...prev, ...newSegments]
      );
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments(true);
  }, [spaceId, hasAccess, processEnded]);

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
        {segments?.map((segment: Segment) => (
          <TimelineItem key={segment.seek}>
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
      {hasAccess && processEnded && lastVisible && (
        <Box display="flex" justifyContent="center" mt={2} mb={2}>
          <Button
            variant="outlined"
            onClick={() => fetchSegments(false)}
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

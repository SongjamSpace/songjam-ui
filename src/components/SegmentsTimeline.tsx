import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { db } from "../services/firebase.service";
import { doc } from "firebase/firestore";
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
import { Box, Typography } from "@mui/material";
import { formatSeconds } from "../utils";
type Props = {
  spaceId: string;
};

function SegmentsTimeline({ spaceId }: Props) {
  const [segments, loading, error] = useDocumentDataOnce(
    doc(db, "spaces", spaceId, "segments", "raw")
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Box width={"100%"} height={"85vh"} sx={{ overflow: "auto" }}>
      <Timeline
        sx={{
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.2,
          },
        }}
      >
        {segments?.segments?.map((segment: Segment) => (
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
    </Box>
  );
}

export default SegmentsTimeline;

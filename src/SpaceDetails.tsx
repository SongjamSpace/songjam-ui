import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSpace } from "./services/db/spaces.service";
import { TranscriptionBox } from "./components/TranscriptionBox";
import { Box, Typography } from "@mui/material";

const SpaceDetails: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<any>(null);

  useEffect(() => {
    if (!spaceId) return;
    const fetchSpace = async () => {
      const space = await getSpace(spaceId);
      setSpace(space);
    };
    fetchSpace();
  }, [spaceId]);

  return (
    <Box
      height={"100vh"}
      sx={{
        backgroundColor: "#0f172a",
      }}
    >
      <Box height={"80%"}>
        {space?.spaceId && <TranscriptionBox spaceId={space.spaceId} />}
      </Box>
    </Box>
  );
};

export default SpaceDetails;

import React, { useState } from "react";
import { searchClient } from "@algolia/client-search";
import {
  TextField,
  Paper,
  Box,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
// import { getSegments, Segment } from "../services/db/spaces.service";
import { formatSeconds } from "../utils";
import { debounce } from "lodash";

const highlightSearchTerm = (text: string, searchTerm: string) => {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <Box
        component="span"
        key={i}
        sx={{
          backgroundColor: "rgba(96, 165, 250, 0.3)",
          // color: "rgba(255, 255, 0, 1)",
        }}
      >
        {part}
      </Box>
    ) : (
      part
    )
  );
};

// Initialize Algolia client
// Make sure to add these keys to your .env file
const client = searchClient(
  import.meta.env.VITE_ALGOLIA_APP_ID || "",
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY || ""
);

interface SearchResult {
  id: string;
  text: string;
  start: number;
  // Add other fields that match your Algolia index structure
}

const AlgoliaSearchTranscription: React.FC<{ spaceId: string }> = ({
  spaceId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  //   const [initialSegments, setInitialSegments] = useState<SearchResult[]>([]);

  //   const fetchInitialSegments = async () => {
  //     setIsTranscriptLoading(true);
  //     const segments = await getSegments(spaceId);
  //     setInitialSegments(segments as SearchResult[]);
  //     setIsTranscriptLoading(false);
  //   };

  //   useEffect(() => {
  //     fetchInitialSegments();
  //   }, [spaceId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setIsTranscriptLoading(true);
      const { results } = await client.search({
        requests: [
          {
            indexName: "segments",
            query: `spaces/${spaceId} ${query}`,
            hitsPerPage: 40,
          },
        ],
      });
      if (results.length > 0) {
        const segments = (results[0] as any).hits as unknown as SearchResult[];
        setSearchResults(segments);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsTranscriptLoading(false);
    }
  };

  return (
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
        label="Search"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          // debounce search
          debounce(() => handleSearch(e.target.value), 500)();
        }}
        fullWidth
        sx={{ mb: 2 }}
      />{" "}
      {/* Added search bar */}
      <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
        {isTranscriptLoading ? (
          <Stack direction="column" spacing={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton variant="rectangular" height="100%" sx={{ p: 2 }} />
            ))}
          </Stack>
        ) : searchResults.length > 0 ? (
          searchResults.map((result: SearchResult, index: number) => (
            <Box
              key={index}
              sx={{
                background: "rgba(255,255,255,0.05)",
                p: 2,
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography>
                {highlightSearchTerm(result.text, searchQuery)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#60a5fa" }}>
                {formatSeconds(result.start)}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{ color: "text.secondary" }}
            align="center"
          >
            No results available. Search for a word or phrase.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AlgoliaSearchTranscription;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSpace, Segment, Space } from "./services/db/spaces.service";
import { Box, Typography, Avatar, Tabs, Tab, Paper } from "@mui/material";
import {
  Timeline as TimelineIcon,
  Article as ArticleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Twitter as TwitterIcon,
} from "@mui/icons-material";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SpaceDetails: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!spaceId) return;
    const fetchSpace = async () => {
      const space = await getSpace(spaceId);
      setSpace(space as Space);
    };
    fetchSpace();
  }, [spaceId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      height={"100vh"}
      sx={{
        background: "linear-gradient(to bottom, #0f172a, #1e293b)",
        color: "white",
        overflow: "auto",
      }}
    >
      {space && (
        <Box p={4}>
          {/* Header Section with Stats */}
          <Box mb={4}>
            <Typography
              variant="h3"
              component="h1"
              mb={2}
              sx={{
                background: "linear-gradient(45deg, #60a5fa, #3b82f6)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              {space.title}
            </Typography>

            {/* Stats Section */}
            <Box
              display="flex"
              gap={4}
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.9rem",
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Typography component="span">🎧</Typography>
                <Typography>
                  {space.total_live_listeners?.toLocaleString()} live listeners
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography component="span">👥</Typography>
                <Typography>
                  {space.total_replay_watched?.toLocaleString()} replay views
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Participants Section */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography variant="h6" mb={2}>
              Hosts & Speakers
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {space.admins?.map((admin) => (
                <Box
                  key={admin.user_id}
                  component="a"
                  href={`https://twitter.com/${admin.twitter_screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    p: 1,
                    borderRadius: 1,
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <Avatar src={admin.avatar_url} alt={admin.display_name} />
                  <Box>
                    <Typography>{admin.display_name}</Typography>
                    <Typography
                      color="primary.light"
                      sx={{ fontSize: "0.9rem" }}
                    >
                      @{admin.twitter_screen_name}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Tabs Section */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="inherit"
              sx={{
                "& .MuiTab-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                  minHeight: "60px",
                  transition: "all 0.3s",
                  "&:hover": {
                    color: "white",
                    background: "rgba(255, 255, 255, 0.05)",
                  },
                  "&.Mui-selected": {
                    color: "white",
                    background:
                      "linear-gradient(45deg, rgba(96, 165, 250, 0.1), rgba(59, 130, 246, 0.1))",
                  },
                },
                "& .MuiTabs-indicator": {
                  background: "linear-gradient(45deg, #60a5fa, #3b82f6)",
                  height: "3px",
                },
              }}
            >
              <Tab
                icon={<TimelineIcon />}
                iconPosition="start"
                label="Timeline"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 1,
                }}
              />
              <Tab
                icon={<ArticleIcon />}
                iconPosition="start"
                label="Transcript"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 1,
                }}
              />
              <Tab
                icon={<AutoAwesomeIcon />}
                iconPosition="start"
                label="AI Summaries"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 1,
                }}
              />
              <Tab
                icon={<TwitterIcon />}
                iconPosition="start"
                label="Create Thread"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 1,
                }}
              />
            </Tabs>
          </Box>

          {/* Timeline Tab */}
          <TabPanel value={tabValue} index={0}>
            <Timeline position="alternate">
              {space.segments?.map((segment: Segment, index: number) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: "#3b82f6" }} />
                    {index < (space.segments?.length ?? 0) - 1 && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(30, 41, 59, 0.7)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Typography variant="h6" component="h3">
                        {segment.text}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatSeconds(segment.start)}
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </TabPanel>

          {/* Transcript Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
              {space.text}
            </Typography>
          </TabPanel>
        </Box>
      )}
    </Box>
  );
};

export default SpaceDetails;

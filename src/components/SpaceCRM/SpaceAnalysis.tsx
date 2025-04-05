import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  SelectChangeEvent,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Slider,
  Stack,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  ReactFlowInstance,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  EdgeLabelRenderer,
  MiniMap,
  ConnectionLineType,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as d3 from 'd3-force';
import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceCenter,
} from 'd3-force';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import {
  SpeakerInteraction,
  SpaceAnalysis as SpaceAnalysisType,
} from '../../types/analysis.types';
import type { SpaceAnalysis } from '../../types/analysis.types';
import {
  analyzeTranscript,
  getSentimentColor,
  formatTime,
} from '../../services/analysis.service';
import {
  Space,
  TwitterUser,
  getFullTranscription,
} from '../../services/db/spaces.service';

interface InteractionNode extends Node {
  data: {
    label: string;
    user: TwitterUser;
  };
}

interface CustomNodeProps {
  data: {
    label: string;
    user: TwitterUser;
  };
}

const CustomSpeakerNode: React.FC<CustomNodeProps> = ({ data }) => {
  return (
    <Box
      sx={{
        padding: 1,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        boxShadow: 1,
        width: 160,
        position: 'relative',
      }}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="a"
        style={{
          background: 'transparent',
          border: 'none',
          width: 1,
          height: 1,
          top: '50%',
          left: '50%',
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="b"
        style={{
          background: 'transparent',
          border: 'none',
          width: 1,
          height: 1,
          top: '50%',
          left: '50%',
        }}
      />

      <Avatar
        src={data.user.avatarUrl}
        alt={data.user.displayName}
        sx={{ width: 30, height: 30 }}
      />
      <Typography variant="body2" noWrap title={data.user.displayName}>
        {data.label}
      </Typography>
    </Box>
  );
};

const nodeTypes = {
  speakerNode: CustomSpeakerNode as any,
};

// interface ForceEdge extends Edge {
//   source: string;
//   target: string;
//   data?: SpeakerInteraction;
// }

interface ForceNode extends Node {
  id: string;
  x?: number;
  y?: number;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    user: TwitterUser;
  };
}

interface SpaceAnalysisProps {
  space: Space | null;
  onContextUpdate: (context: any) => void;
}

interface AnalysisConfig {
  interactionTypes: {
    directMentions: boolean;
    sequentialResponses: boolean;
    topicBased: boolean;
    timeProximity: boolean;
  };
  strengthMetrics: {
    frequency: boolean;
    duration: boolean;
    topicOverlap: boolean;
    sentiment: boolean;
    responseTime: boolean;
  };
  timeWindow: number; // seconds
  topicOverlapThreshold: number; // 0-1
}

interface VisualizationContext {
  type: 'space_analysis_context';
  space: {
    id: string;
    title: string;
    speakers: { id: string; name: string; handle: string }[];
  };
  analysis: {
    interactions: any[];
    topics: any[];
    currentConfig: AnalysisConfig;
    visualMetrics: {
      totalNodes: number;
      totalEdges: number;
      mostActiveNode?: [string, number];
      averageInteractions: number;
      topicCount: number;
    };
  };
  suggestions: string[];
  visualState: {
    nodes: Node[];
    edges: Edge[];
  };
}

const SpaceAnalysis: React.FC<SpaceAnalysisProps> = ({
  space,
  onContextUpdate,
}) => {
  const [analysis, setAnalysis] = useState<SpaceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [nodes, setNodes] = useState<ForceNode[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  // State for interaction details modal
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] =
    useState<SpeakerInteraction | null>(null);

  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    interactionTypes: {
      directMentions: true,
      sequentialResponses: false,
      topicBased: false,
      timeProximity: false,
    },
    strengthMetrics: {
      frequency: true,
      duration: false,
      topicOverlap: false,
      sentiment: true,
      responseTime: false,
    },
    timeWindow: 30,
    topicOverlapThreshold: 0.5,
  });

  // --- D3 Force Layout Effect ---
  useEffect(() => {
    if (!nodes.length || !edges.length || !reactFlowInstance) return;

    // Only run layout if nodes don't have positions yet (or are at 0,0)
    const needsLayout = nodes.some(
      (n) => n.position.x === 0 && n.position.y === 0
    );
    if (!needsLayout) return;

    console.log('Running D3 force layout...');

    // Create a copy for the simulation to mutate
    const simulationNodes: ForceNode[] = nodes.map((n) => ({ ...n }));
    const simulationEdges = edges.map((e) => ({ ...e }));

    // Find the nodes with the most interactions
    const nodeDegrees = new Map<string, number>();
    edges.forEach((edge) => {
      nodeDegrees.set(
        edge.source,
        (nodeDegrees.get(edge.source) || 0) + (edge.data?.count || 1)
      );
      nodeDegrees.set(
        edge.target,
        (nodeDegrees.get(edge.target) || 0) + (edge.data?.count || 1)
      );
    });

    // Sort nodes by interaction count and get the center point
    const sortedNodes = [...nodeDegrees.entries()].sort((a, b) => b[1] - a[1]);
    const centerNodeId = sortedNodes[0]?.[0];

    // Calculate viewport dimensions
    const viewportWidth = 800; // Typical viewport width
    const viewportHeight = 600; // Typical viewport height

    const simulation = forceSimulation(simulationNodes)
      .force(
        'link',
        forceLink<ForceNode, any>(simulationEdges)
          .id((d) => d.id)
          .distance((d) => {
            // Shorter distances for edges with more interactions
            const count = d.data?.count || 1;
            return Math.max(200 - count * 10, 100);
          })
          .strength((d) => {
            // Stronger links for more frequent interactions
            const count = d.data?.count || 1;
            return Math.min(0.3 + count * 0.05, 0.8);
          })
      )
      .force(
        'charge',
        forceManyBody().strength((d) => {
          // Stronger repulsion for more connected nodes
          const degree = nodeDegrees.get((d as any).id) || 1;
          return -400 - degree * 50;
        })
      )
      .force('center', forceCenter(viewportWidth / 2, viewportHeight / 2))
      .stop();

    // Run simulation ticks manually
    const iterations = 300; // More iterations for better layout
    for (let i = 0; i < iterations; ++i) {
      simulation.tick();
    }

    // Update node positions based on simulation results
    const layoutedNodes = simulationNodes.map((node) => ({
      ...node,
      position: {
        x: node.x ?? 0,
        y: node.y ?? 0,
      },
    }));

    console.log('D3 layout complete, updating nodes.');
    setNodes(layoutedNodes);

    // Find the most active node's position
    const centerNode = layoutedNodes.find((n) => n.id === centerNodeId);
    if (centerNode) {
      // Calculate zoom level based on node count
      const zoomLevel = Math.max(1, Math.min(1.5, 8 / Math.sqrt(nodes.length)));

      // Fit view with focus on the most active area
      setTimeout(() => {
        reactFlowInstance.setCenter(
          centerNode.position.x +150,
          centerNode.position.y + 50,
          { zoom: zoomLevel, duration: 800 }
        );
      }, 100);
    }
  }, [nodes, edges, reactFlowInstance]);

  useEffect(() => {
    if (!space || !space.spaceId) return;

    const loadAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get the transcript
        const fullTranscript = await getFullTranscription(space.spaceId);
        setTranscript(fullTranscript);

        if (!fullTranscript) {
          setError('No transcript available for analysis');
          setLoading(false);
          return;
        }

        // Generate analysis
        const result = await analyzeTranscript(
          space.spaceId,
          fullTranscript,
          space.speakers
        );
        setAnalysis(result);

        // --- DEBUG LOGGING START ---
        console.log('Fetched Analysis Interactions:', result.interactions);
        // --- DEBUG LOGGING END ---

        // Generate graph nodes and edges
        if (result.interactions.length > 0) {
          generateNetworkGraph(result.interactions, space.speakers);
        }

        if (result.topics.length > 0) {
          setSelectedTopic(result.topics[0].topic);
        }
      } catch (err) {
        console.error('Error analyzing transcript:', err);
        setError('Failed to analyze the transcript');
      } finally {
        setLoading(false);
      }
    };

    // Reset nodes/edges if space changes to trigger layout
    setNodes([]);
    setEdges([]);
    loadAnalysis();
  }, [space]);

  const generateNetworkGraph = (
    interactions: SpeakerInteraction[],
    speakers: TwitterUser[]
  ) => {
    // Create a map of speaker IDs
    const speakerMap = new Map<string, TwitterUser>();
    speakers.forEach((speaker) => {
      speakerMap.set(speaker.userId, speaker);
    });

    // Create nodes *without* initial positions for D3 layout
    const graphNodes: ForceNode[] = speakers.map((speaker) => ({
      id: speaker.userId,
      type: 'speakerNode',
      data: {
        label: speaker.displayName,
        user: speaker,
      },
      position: { x: 0, y: 0 }, // D3 will calculate positions
    }));

    // Create edges with enhanced metrics
    const graphEdges: any[] = interactions.map((interaction, index) => {
      // Calculate edge thickness based on available metrics
      let thickness = 1;
      let metrics = [];

      if (analysisConfig.strengthMetrics.frequency) {
        thickness = Math.min(8, Math.max(2, interaction.count));
        metrics.push(`${interaction.count} interactions`);
      }

      if (analysisConfig.strengthMetrics.duration && interaction.duration) {
        metrics.push(`${Math.round(interaction.duration)}s duration`);
      }

      if (
        analysisConfig.strengthMetrics.responseTime &&
        interaction.responseTime
      ) {
        metrics.push(`${Math.round(interaction.responseTime)}s response`);
      }

      if (
        analysisConfig.strengthMetrics.topicOverlap &&
        interaction.topicOverlapScore
      ) {
        metrics.push(
          `${Math.round(interaction.topicOverlapScore * 100)}% topic overlap`
        );
      }

      return {
        id: `e-${interaction.fromSpeakerId}-${interaction.toSpeakerId}-${index}`,
        source: interaction.fromSpeakerId,
        target: interaction.toSpeakerId,
        style: {
          stroke: analysisConfig.strengthMetrics.sentiment
            ? getSentimentColor(interaction.sentiment)
            : '#60a5fa',
          strokeWidth: thickness,
        },
        animated: true,
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: analysisConfig.strengthMetrics.sentiment
            ? getSentimentColor(interaction.sentiment)
            : '#60a5fa',
        },
        label: metrics.join('\n'),
        labelStyle: {
          fill: '#000',
          fontWeight: 600,
          fontSize: '12px',
        },
        labelShowBg: true,
        labelBgStyle: {
          fill: '#fff',
          opacity: 0.8,
          rx: 4,
        },
        data: interaction,
      };
    });

    console.log(
      'Generated initial nodes/edges for D3:',
      graphNodes,
      graphEdges
    );

    // Set initial nodes/edges - the useEffect will handle layout
    setNodes(graphNodes);
    setEdges(graphEdges);
  };

  // Update analysis when config changes
  useEffect(() => {
    if (!space || !transcript) return;

    const updateAnalysis = async () => {
      try {
        setLoading(true);
        const result = await analyzeTranscript(
          space.spaceId,
          transcript,
          space.speakers,
          analysisConfig
        );
        setAnalysis(result);

        if (result.interactions.length > 0) {
          generateNetworkGraph(result.interactions, space.speakers);
        }
      } catch (err) {
        console.error('Error updating analysis:', err);
        setError('Failed to update the analysis');
      } finally {
        setLoading(false);
      }
    };

    updateAnalysis();
  }, [analysisConfig, space, transcript]);

  // Share analysis context via callback when visualization is ready
  useEffect(() => {
    if (
      !analysis ||
      !nodes.length ||
      !edges.length ||
      !space ||
      !onContextUpdate
    )
      return;

    // Calculate node degrees within this effect
    const nodeDegrees = new Map<string, number>();
    edges.forEach((edge) => {
      nodeDegrees.set(
        edge.source,
        (nodeDegrees.get(edge.source) || 0) + (edge.data?.count || 1)
      );
      nodeDegrees.set(
        edge.target,
        (nodeDegrees.get(edge.target) || 0) + (edge.data?.count || 1)
      );
    });

    // Filter out false values from suggestions before creating context
    const suggestions = [
      edges.length < nodes.length * 0.5
        ? 'Consider enabling sequential responses to see more potential interactions'
        : null,
      !analysisConfig.strengthMetrics.topicOverlap && analysis.topics.length > 3
        ? 'Enable topic overlap analysis to see how speakers connect through shared topics'
        : null,
      edges.some((e) => e.data?.responseTime && e.data.responseTime < 10)
        ? 'Some speakers have very quick response times - try focusing on these active exchanges'
        : null,
    ].filter((suggestion): suggestion is string => suggestion !== null);

    // Prepare detailed context about the current visualization
    const visualizationContext: VisualizationContext = {
      type: 'space_analysis_context',
      space: {
        id: space.spaceId,
        title: space.title,
        speakers: space.speakers.map((s) => ({
          id: s.userId,
          name: s.displayName,
          handle: s.twitterScreenName,
        })),
      },
      analysis: {
        interactions: analysis.interactions.map((interaction) => ({
          from: space.speakers.find(
            (s) => s.userId === interaction.fromSpeakerId
          )?.displayName,
          to: space.speakers.find((s) => s.userId === interaction.toSpeakerId)
            ?.displayName,
          count: interaction.count,
          sentiment: interaction.sentiment,
          topics: interaction.topics,
          duration: interaction.duration,
          responseTime: interaction.responseTime,
          topicOverlapScore: interaction.topicOverlapScore,
        })),
        topics: analysis.topics.map((topic) => ({
          name: topic.topic,
          speakers: topic.speakers
            .map(
              (id) => space.speakers.find((s) => s.userId === id)?.displayName
            )
            .filter(Boolean),
          duration: topic.endTime - topic.startTime,
          summary: topic.summary,
        })),
        currentConfig: analysisConfig,
        visualMetrics: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          mostActiveNode:
            nodeDegrees.size > 0
              ? [...nodeDegrees.entries()].sort((a, b) => b[1] - a[1])[0]
              : undefined,
          averageInteractions:
            edges.length > 0
              ? edges.reduce((sum, e) => sum + (e.data?.count || 1), 0) /
                edges.length
              : 0,
          topicCount: analysis.topics.length,
        },
      },
      suggestions,
      visualState: {
        nodes: nodes as Node[],
        edges: edges as Edge[],
      },
    };

    // Call the callback function passed from the parent
    onContextUpdate(visualizationContext);
  }, [analysis, nodes, edges, space, analysisConfig, onContextUpdate]);

  // Add helper function to get insights about specific interactions
  const getInteractionInsights = (fromId: string, toId: string) => {
    if (!analysis || !space) return null;

    const interaction = analysis.interactions.find(
      (i) => i.fromSpeakerId === fromId && i.toSpeakerId === toId
    );
    if (!interaction) return null;

    const fromSpeaker = space.speakers.find((s) => s.userId === fromId);
    const toSpeaker = space.speakers.find((s) => s.userId === toId);

    const sharedTopics = analysis.topics.filter(
      (topic) =>
        topic.speakers.includes(fromId) && topic.speakers.includes(toId)
    );

    return {
      speakers: {
        from: fromSpeaker?.displayName,
        to: toSpeaker?.displayName,
      },
      metrics: {
        interactionCount: interaction.count,
        sentiment: interaction.sentiment,
        avgResponseTime: interaction.responseTime,
        topicOverlap: interaction.topicOverlapScore,
      },
      context: {
        sharedTopics: sharedTopics.map((t) => t.topic),
        totalDuration: interaction.duration,
        percentageOfDiscussion:
          ((interaction.duration || 0) /
            (analysis.timeline[0]?.segments.slice(-1)[0]?.endTime || 1)) *
          100,
      },
    };
  };

  // Add this to the edge click handler
  const handleEdgeClick = (
    event: React.MouseEvent,
    edge: Edge<SpeakerInteraction>
  ) => {
    console.log('Edge clicked:', edge);
    if (edge.data) {
      const insights = getInteractionInsights(edge.source, edge.target);
      console.log('Interaction insights:', insights);

      setSelectedInteraction(edge.data);
      setIsInteractionModalOpen(true);
    }
  };

  // Handlers for modal close
  const handleCloseInteractionModal = () => {
    setIsInteractionModalOpen(false);
    setSelectedInteraction(null);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTopicChange = (event: SelectChangeEvent<string>) => {
    setSelectedTopic(event.target.value);
  };

  const handleGenerateAnalysis = async () => {
    if (!space || !space.spaceId || !transcript) return;

    try {
      setLoading(true);
      setError(null);

      // Force regenerate analysis
      const result = await analyzeTranscript(
        space.spaceId,
        transcript,
        space.speakers
      );
      setAnalysis(result);

      if (result.interactions.length > 0) {
        generateNetworkGraph(result.interactions, space.speakers);
      }

      if (result.topics.length > 0) {
        setSelectedTopic(result.topics[0].topic);
      }
    } catch (err) {
      console.error('Error regenerating analysis:', err);
      setError('Failed to regenerate the analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (path: string[], value: boolean | number) => {
    setAnalysisConfig((prev) => {
      const newConfig = { ...prev };
      let current: any = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  const renderAnalysisConfig = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Analysis Configuration
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Interaction Types
        </Typography>
        <Stack>
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.interactionTypes.directMentions}
                onChange={(e) =>
                  handleConfigChange(
                    ['interactionTypes', 'directMentions'],
                    e.target.checked
                  )
                }
              />
            }
            label="Direct Mentions"
          />
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.interactionTypes.sequentialResponses}
                onChange={(e) =>
                  handleConfigChange(
                    ['interactionTypes', 'sequentialResponses'],
                    e.target.checked
                  )
                }
              />
            }
            label="Sequential Responses"
          />
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.interactionTypes.topicBased}
                onChange={(e) =>
                  handleConfigChange(
                    ['interactionTypes', 'topicBased'],
                    e.target.checked
                  )
                }
              />
            }
            label="Topic-based Connections"
          />
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.interactionTypes.timeProximity}
                onChange={(e) =>
                  handleConfigChange(
                    ['interactionTypes', 'timeProximity'],
                    e.target.checked
                  )
                }
              />
            }
            label="Time-proximity Interactions"
          />
        </Stack>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Strength Metrics
        </Typography>
        <Stack>
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.strengthMetrics.frequency}
                onChange={(e) =>
                  handleConfigChange(
                    ['strengthMetrics', 'frequency'],
                    e.target.checked
                  )
                }
              />
            }
            label="Interaction Frequency"
          />
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.strengthMetrics.duration}
                onChange={(e) =>
                  handleConfigChange(
                    ['strengthMetrics', 'duration'],
                    e.target.checked
                  )
                }
              />
            }
            label="Interaction Duration"
          />
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.strengthMetrics.topicOverlap}
                onChange={(e) =>
                  handleConfigChange(
                    ['strengthMetrics', 'topicOverlap'],
                    e.target.checked
                  )
                }
              />
            }
            label="Topic Overlap"
          />
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.strengthMetrics.sentiment}
                onChange={(e) =>
                  handleConfigChange(
                    ['strengthMetrics', 'sentiment'],
                    e.target.checked
                  )
                }
              />
            }
            label="Sentiment Analysis"
          />
          <FormControlLabel
            control={
              <Switch
                checked={analysisConfig.strengthMetrics.responseTime}
                onChange={(e) =>
                  handleConfigChange(
                    ['strengthMetrics', 'responseTime'],
                    e.target.checked
                  )
                }
              />
            }
            label="Response Time"
          />
        </Stack>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Time Window (seconds)
        </Typography>
        <Slider
          value={analysisConfig.timeWindow}
          onChange={(_, value) =>
            handleConfigChange(['timeWindow'], value as number)
          }
          min={5}
          max={120}
          step={5}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Topic Overlap Threshold
        </Typography>
        <Slider
          value={analysisConfig.topicOverlapThreshold}
          onChange={(_, value) =>
            handleConfigChange(['topicOverlapThreshold'], value as number)
          }
          min={0}
          max={1}
          step={0.1}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleGenerateAnalysis}
        sx={{ mt: 2 }}
      >
        Update Analysis
      </Button>
    </Paper>
  );

  if (!space) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Please select a space to analyze</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Analyzing space conversation...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={handleGenerateAnalysis}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No analysis available</Typography>
        <Button
          variant="contained"
          onClick={handleGenerateAnalysis}
          sx={{ mt: 2 }}
        >
          Generate Analysis
        </Button>
      </Box>
    );
  }

  // Get the current selected topic
  const currentTopic = analysis.topics.find((t) => t.topic === selectedTopic);

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Space Analysis
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Speaker Interactions" />
          <Tab label="Topics" />
          <Tab label="Timeline" />
        </Tabs>
      </Box>

      <Box sx={{ pb: 2 }}>
        {/* Speaker Interactions */}
        {tabValue === 0 && (
          <>
            <Paper sx={{ height: 600, p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Speaker Interaction Network
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Edge thickness represents interaction frequency. Click on any
                edge to see detailed interaction information.
              </Typography>
              <Box sx={{ height: 'calc(100% - 60px)' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges as Edge[]}
                  nodeTypes={nodeTypes}
                  onInit={setReactFlowInstance}
                  onEdgeClick={handleEdgeClick}
                  fitView={false}
                  nodesDraggable={true}
                  edgesFocusable={true}
                  minZoom={0.2}
                  maxZoom={4}
                  defaultEdgeOptions={{
                    type: 'default',
                    animated: true,
                  }}
                >
                  <Controls />
                  <Background />
                </ReactFlow>
              </Box>
            </Paper>

            {/* Analysis Configuration Panel */}
            {renderAnalysisConfig()}
          </>
        )}

        {/* Topics */}
        {tabValue === 1 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                Topics Discussed
              </Typography>
              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 200 }}
              >
                <InputLabel>Select Topic</InputLabel>
                <Select
                  value={selectedTopic || ''}
                  onChange={handleTopicChange}
                  label="Select Topic"
                >
                  {analysis.topics.map((topic) => (
                    <MenuItem key={topic.topic} value={topic.topic}>
                      {topic.topic}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {currentTopic && (
              <Box>
                <Typography variant="subtitle1">
                  {currentTopic.topic} ({formatTime(currentTopic.startTime)} -{' '}
                  {formatTime(currentTopic.endTime)})
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                  {currentTopic.speakers.map((speakerId) => {
                    const speaker = space.speakers.find(
                      (s) => s.userId === speakerId
                    );
                    return speaker ? (
                      <Chip
                        key={speakerId}
                        avatar={<Avatar src={speaker.avatarUrl} />}
                        label={speaker.displayName}
                        variant="outlined"
                      />
                    ) : null;
                  })}
                </Box>

                <Typography variant="body1" paragraph>
                  {currentTopic.summary}
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Timeline */}
        {tabValue === 2 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Conversation Timeline
            </Typography>

            {analysis.timeline.map((timeline) => {
              const speaker = space.speakers.find(
                (s) => s.userId === timeline.speakerId
              );
              return speaker ? (
                <Box key={timeline.speakerId} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar src={speaker.avatarUrl} sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      {speaker.displayName}
                    </Typography>
                  </Box>

                  <List>
                    {timeline.segments.map((segment, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          borderLeft: `4px solid ${getSentimentColor(
                            segment.sentiment
                          )}`,
                          pl: 2,
                          mb: 1,
                          backgroundColor: 'background.paper',
                          borderRadius: '0 4px 4px 0',
                        }}
                      >
                        <ListItemText
                          primary={segment.text}
                          secondary={`${formatTime(
                            segment.startTime
                          )} - ${formatTime(
                            segment.endTime
                          )} • ${segment.topics.join(', ')}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : null;
            })}
          </Paper>
        )}
      </Box>

      {/* Interaction Detail Modal */}
      <Dialog
        open={isInteractionModalOpen}
        onClose={handleCloseInteractionModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Interaction Details</DialogTitle>
        <DialogContent>
          {selectedInteraction && space && (
            <Box>
              {/* Speakers */}
              <Typography variant="h6" gutterBottom>
                Speakers
              </Typography>
              {(() => {
                const fromSpeaker = space.speakers.find(
                  (s) => s.userId === selectedInteraction.fromSpeakerId
                );
                const toSpeaker = space.speakers.find(
                  (s) => s.userId === selectedInteraction.toSpeakerId
                );
                return (
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                        }}
                      >
                        <Avatar
                          src={fromSpeaker?.avatarUrl}
                          sx={{ width: 56, height: 56, mb: 1 }}
                        />
                        <Typography variant="subtitle1">
                          {fromSpeaker?.displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{fromSpeaker?.twitterScreenName}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="h4" color="text.secondary">
                          →
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          interacts with
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                        }}
                      >
                        <Avatar
                          src={toSpeaker?.avatarUrl}
                          sx={{ width: 56, height: 56, mb: 1 }}
                        />
                        <Typography variant="subtitle1">
                          {toSpeaker?.displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{toSpeaker?.twitterScreenName}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              })()}

              {/* Interaction Metrics */}
              <Typography variant="h6" gutterBottom>
                Interaction Metrics
              </Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {selectedInteraction.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Interactions
                      </Typography>
                    </Box>
                  </Grid>
                  {selectedInteraction.duration && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {Math.round(selectedInteraction.duration)}s
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Duration
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {selectedInteraction.responseTime && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {Math.round(selectedInteraction.responseTime)}s
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Response Time
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {selectedInteraction.topicOverlapScore !== undefined && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {Math.round(
                            selectedInteraction.topicOverlapScore * 100
                          )}
                          %
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Topic Overlap
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ mr: 1 }}>
                    Overall Sentiment:
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getSentimentColor(selectedInteraction.sentiment),
                      mr: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {selectedInteraction.sentiment}
                  </Typography>
                </Box>
              </Paper>

              {/* Topics */}
              <Typography variant="h6" gutterBottom>
                Discussion Topics
              </Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedInteraction.topics.map((topic) => (
                    <Chip
                      key={topic}
                      label={topic}
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* Example Exchanges */}
              {analysis?.timeline && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Example Exchanges
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <List>
                      {analysis.timeline
                        .filter(
                          (t) =>
                            t.speakerId === selectedInteraction.fromSpeakerId ||
                            t.speakerId === selectedInteraction.toSpeakerId
                        )
                        .flatMap((t) => t.segments)
                        .sort((a, b) => a.startTime - b.startTime)
                        .slice(0, 5)
                        .map((segment, index) => {
                          const speaker = space.speakers.find(
                            (s) =>
                              analysis.timeline.find((t) =>
                                t.segments.includes(segment)
                              )?.speakerId === s.userId
                          );
                          return (
                            <ListItem
                              key={index}
                              sx={{
                                borderLeft: `4px solid ${getSentimentColor(
                                  segment.sentiment
                                )}`,
                                mb: 1,
                                backgroundColor: 'background.paper',
                                borderRadius: '0 4px 4px 0',
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar src={speaker?.avatarUrl} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle2">
                                    {speaker?.displayName}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" paragraph>
                                      {segment.text}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {formatTime(segment.startTime)}
                                    </Typography>
                                  </>
                                }
                              />
                            </ListItem>
                          );
                        })}
                    </List>
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInteractionModal}>Close</Button>
        </DialogActions>
      </Dialog>

      <Button
        variant="outlined"
        onClick={handleGenerateAnalysis}
        sx={{ mt: 2 }}
      >
        Regenerate Analysis
      </Button>
    </Box>
  );
};

export default SpaceAnalysis;

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
  Controls,
  Background,
  ReactFlowInstance,
  Handle,
  Position,
  MarkerType,
  MiniMap,
  ConnectionLineType,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeHandleBounds,
  Node,
  Edge,
  XYPosition,
  Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTranslation } from 'react-i18next';
import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceCenter,
  SimulationNodeDatum,
} from 'd3-force';

import {
  SpeakerInteraction,
  SpaceAnalysis as SpaceAnalysisType,
  AnalysisConfig as AnalysisConfigType,
  TopicSegment,
} from '../../types/analysis.types';
import {
  analyzeTranscript,
  getSentimentColor,
  formatTime,
} from '../../services/analysis.service';
import { getFullTranscription } from '../../services/db/spaces.service';
import { Space, TwitterUser } from '../../types/space.types';

interface ForceNodeData {
  label: string;
  user: TwitterUser;
}

// D3 Simulation Node Type
interface D3SimulationNode extends SimulationNodeDatum {
  id: string;
}

interface CustomNodeProps {
  data: ForceNodeData;
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

interface SpaceAnalysisProps {
  space: Space | null;
  onContextUpdate: (context: any) => void;
}

interface VisualizationContext {
  type: 'space_analysis_context';
  space: {
    id: string;
    title: string;
    speakers: { id: string; name: string; handle: string }[];
  };
  analysis: {
    interactions: SpeakerInteraction[];
    topics: TopicSegment[];
    currentConfig: AnalysisConfigType;
    visualMetrics: {
      totalNodes: number;
      totalEdges: number;
      mostActiveNode?: [string, number];
      averageInteractions: number;
      topicCount: number;
    };
  };
  visualState: {
    nodes: Node<ForceNodeData>[];
    edges: Edge<SpeakerInteraction>[];
  };
}

const SpaceAnalysis: React.FC<SpaceAnalysisProps> = ({
  space,
  onContextUpdate,
}) => {
  const { t } = useTranslation();
  const [analysis, setAnalysis] = useState<SpaceAnalysisType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ForceNodeData>>(
    []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<
    Edge<SpeakerInteraction>
  >([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] =
    useState<SpeakerInteraction | null>(null);
  const layoutRan = useRef(false); // Track if D3 layout has run
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null); // Ref for container dimensions

  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfigType>({
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

  const [visualMetrics, setVisualMetrics] = useState({
    totalNodes: 0,
    totalEdges: 0,
    mostActiveNode: undefined as [string, number] | undefined,
    averageInteractions: 0,
    topicCount: 0,
  });

  useEffect(() => {
    const loadTranscript = async () => {
      if (space?.spaceId && !transcript) {
        setLoading(true);
        setError(null);
        try {
          const fetchedTranscript = await getFullTranscription(space.spaceId);
          setTranscript(fetchedTranscript);
          if (!fetchedTranscript) {
            setError('Transcript not found or empty.');
          }
        } catch (err) {
          console.error('Failed to load transcript:', err);
          setError('Failed to load transcript.');
        } finally {
          setLoading(false);
        }
      }
    };
    loadTranscript();
  }, [space?.spaceId, transcript]);

  const generateGraphElements = useCallback(
    (
      interactions: SpeakerInteraction[],
      speakers: TwitterUser[]
    ): {
      initialNodes: Node<ForceNodeData>[];
      initialEdges: Edge<SpeakerInteraction>[];
    } => {
      if (!speakers) return { initialNodes: [], initialEdges: [] };

      const filteredInteractions = selectedTopic
        ? interactions.filter(
            (interaction) =>
              interaction.topics && interaction.topics.includes(selectedTopic)
          )
        : interactions;

      // Initialize nodes at (0,0) for D3 layout
      const initialNodes: Node<ForceNodeData>[] = speakers.map((speaker) => ({
        id: speaker.userId,
        type: 'speakerNode',
        position: { x: 0, y: 0 }, // Initial position for D3
        data: { label: speaker.displayName, user: speaker },
        style: { zIndex: 1 },
      }));

      // Ensure edges created match the state type
      const initialEdges: Edge<SpeakerInteraction>[] = filteredInteractions.map(
        (interaction, index) => ({
          id: `e-${interaction.fromSpeakerId}-${interaction.toSpeakerId}-${index}`,
          source: interaction.fromSpeakerId,
          target: interaction.toSpeakerId,
          type: 'smoothstep', // Or 'default', 'straight', etc.
          animated: false,
          // Add the interaction count as a label
          label: String(interaction.count || 0),
          labelStyle: {
            fill: '#fff',
            fontWeight: 500,
            fontSize: 10,
          },
          labelBgPadding: [4, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: {
            fill: '#2d3748', // Dark background for contrast
            fillOpacity: 0.8,
            stroke: '#4a5568', // Border color
            strokeWidth: 0.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: getSentimentColor(interaction.sentiment),
          },
          style: {
            strokeWidth: Math.max(1, Math.min(5, interaction.count || 1)),
            stroke: getSentimentColor(interaction.sentiment),
            zIndex: 10,
          },
          data: interaction, // Data is SpeakerInteraction
        })
      );

      const interactionCounts: { [key: string]: number } = {};
      filteredInteractions.forEach((int) => {
        interactionCounts[int.fromSpeakerId] =
          (interactionCounts[int.fromSpeakerId] || 0) + 1;
        interactionCounts[int.toSpeakerId] =
          (interactionCounts[int.toSpeakerId] || 0) + 1;
      });
      let mostActiveNodeData: [string, number] | undefined = undefined;
      if (Object.keys(interactionCounts).length > 0) {
        mostActiveNodeData = Object.entries(interactionCounts).reduce((a, b) =>
          a[1] > b[1] ? a : b
        );
      }
      const totalInteractions = filteredInteractions.reduce(
        (sum, int) => sum + (int.count || 1),
        0
      );
      const averageInteractions =
        initialNodes.length > 0 ? totalInteractions / initialNodes.length : 0;
      const topicCount = analysis?.topics?.length || 0;

      const newVisualMetrics = {
        totalNodes: initialNodes.length,
        totalEdges: initialEdges.length,
        mostActiveNode: mostActiveNodeData,
        averageInteractions,
        topicCount,
      };
      setVisualMetrics(newVisualMetrics);

      const context: VisualizationContext = {
        type: 'space_analysis_context',
        space: {
          id: space?.spaceId || '',
          title: space?.title || '',
          speakers: speakers.map((s) => ({
            id: s.userId,
            name: s.displayName,
            handle: s.twitterScreenName,
          })),
        },
        analysis: {
          interactions: filteredInteractions,
          topics: analysis?.topics || [],
          currentConfig: analysisConfig,
          visualMetrics: newVisualMetrics,
        },
        visualState: {
          nodes: initialNodes,
          edges: initialEdges,
        },
      };
      onContextUpdate(context);

      layoutRan.current = false; // Reset layout flag when elements regenerate
      return { initialNodes, initialEdges };
    },
    [
      selectedTopic,
      analysis?.topics,
      space?.spaceId,
      space?.title,
      analysisConfig,
      onContextUpdate,
    ]
  );

  // --- D3 Force Layout Effect ---
  useEffect(() => {
    // Ensure wrapper ref is available
    const wrapper = reactFlowWrapperRef.current;

    // Only run if nodes exist, are at initial (0,0) pos, layout hasn't run, RF instance, and wrapper exist
    if (
      !layoutRan.current &&
      reactFlowInstance &&
      wrapper &&
      nodes.length > 0 &&
      edges.length > 0 &&
      nodes.every((n) => n.position.x === 0 && n.position.y === 0)
    ) {
      console.log('Running D3 force layout...');
      layoutRan.current = true; // Mark layout as run

      const simulationNodes: D3SimulationNode[] = nodes.map((n) => ({
        id: n.id,
      }));
      const nodeIds = new Set(nodes.map((n) => n.id));
      const simulationLinks = edges
        .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
        .map((e) => ({ source: e.source, target: e.target }));

      // Use wrapper dimensions for centering
      const width = wrapper.clientWidth || 800;
      const height = wrapper.clientHeight || 600;

      const simulation = forceSimulation(simulationNodes)
        .force(
          'link',
          forceLink(simulationLinks)
            .id((d: any) => d.id)
            .distance(200)
            .strength(0.1)
        )
        .force('charge', forceManyBody().strength(-600))
        .force('center', forceCenter(width / 2, height / 2)) // Use calculated width/height
        .stop();

      simulation.tick(300);

      const positionMap = new Map<string, { x: number; y: number }>(
        simulationNodes.map((simNode) => [
          simNode.id,
          { x: simNode.x ?? 0, y: simNode.y ?? 0 },
        ])
      );

      // Explicitly map properties to ensure correct type
      const layoutedNodes: Node<ForceNodeData>[] = nodes.map((node) => {
        const position = positionMap.get(node.id);
        return {
          id: node.id,
          type: node.type,
          position: position ? { x: position.x, y: position.y } : node.position,
          // Cast via unknown first as suggested by linter
          data: node.data as unknown as ForceNodeData,
          style: node.style,
          // Include other potential node properties if necessary
          // e.g., className: node.className, targetPosition: node.targetPosition, sourcePosition: node.sourcePosition
          // but start with the essentials.
        };
      });

      console.log('D3 layout complete, updating nodes state.');
      // Update state, using type assertion to bypass persistent TS error
      setNodes(layoutedNodes as any);

      // Focus view after layout applied
      setTimeout(() => {
        if (reactFlowInstance) {
          // Find the strongest edge based on count using a loop
          let strongestEdge: Edge<SpeakerInteraction> | null = null;
          let maxCount = -1; // Start with -1 to handle edges with 0 count

          if (edges && edges.length > 0) {
            for (const currentEdge of edges) {
              // Use type assertion via unknown first as suggested by linter
              const currentCount =
                (currentEdge.data as unknown as SpeakerInteraction)?.count ?? 0;
              if (currentCount > maxCount) {
                maxCount = currentCount;
                // Use type assertion on assignment
                strongestEdge = currentEdge as Edge<SpeakerInteraction>;
              }
            }
            // If no edge had count > -1 (e.g., empty edges array or all counts <= 0)
            // default to the first edge if available
            if (strongestEdge === null && edges.length > 0) {
              // Use type assertion on assignment
              strongestEdge = edges[0] as Edge<SpeakerInteraction>;
            }
          }

          // Find corresponding nodes from the layouted nodes
          const sourceNode = strongestEdge
            ? layoutedNodes.find((n) => n.id === strongestEdge?.source)
            : null;
          const targetNode = strongestEdge
            ? layoutedNodes.find((n) => n.id === strongestEdge?.target)
            : null;

          if (strongestEdge && sourceNode && targetNode) {
            // Calculate center point between the two nodes
            const centerX = (sourceNode.position.x + targetNode.position.x) / 2;
            const centerY = (sourceNode.position.y + targetNode.position.y) / 2;

            console.log(
              `Focusing view on strongest edge: ${strongestEdge.id} at (${centerX}, ${centerY})`
            );
            reactFlowInstance.setCenter(centerX, centerY, {
              zoom: 1,
              duration: 500,
            });
          } else {
            // Fallback to fitting the whole view if no edge or nodes found
            console.log('Fitting view (fallback)');
            reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
          }
        }
      }, 100);
    }
  }, [nodes, edges, reactFlowInstance, setNodes]); // Dependencies for the effect

  const updateAnalysis = async () => {
    if (!space?.spaceId || !transcript || !space.speakers) return;
    setLoading(true);
    setError(null);
    try {
      const updatedAnalysis = await analyzeTranscript(
        space.spaceId,
        transcript,
        space.speakers,
        analysisConfig
      );
      setAnalysis(updatedAnalysis);
      const { initialNodes, initialEdges } = generateGraphElements(
        updatedAnalysis.interactions,
        space.speakers
      );
      // Re-add ts-ignore
      // @ts-ignore
      setNodes(initialNodes);
      // Add ts-ignore for setEdges
      // @ts-ignore
      setEdges(initialEdges);
    } catch (err) {
      setError(
        t('errorGeneratingAnalysis') +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdgeClick = (
    _: React.MouseEvent,
    edge: Edge<SpeakerInteraction>
  ) => {
    if (edge.data) {
      setSelectedInteraction(edge.data);
      setIsInteractionModalOpen(true);
    }
  };

  const handleCloseInteractionModal = () => {
    setIsInteractionModalOpen(false);
    setSelectedInteraction(null);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTopicChange = (event: SelectChangeEvent<string>) => {
    const topic = event.target.value;
    setSelectedTopic(topic === 'all' ? null : topic);
    if (analysis && space?.speakers) {
      const { initialNodes, initialEdges } = generateGraphElements(
        analysis.interactions,
        space.speakers
      );
      // Re-add ts-ignore
      // @ts-ignore
      setNodes(initialNodes);
      // Add ts-ignore for setEdges
      // @ts-ignore
      setEdges(initialEdges);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!space?.spaceId || !transcript || !space?.speakers) {
      setError(
        'Cannot generate analysis: Missing space ID, transcript, or speakers.'
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const analysisResult = await analyzeTranscript(
        space.spaceId,
        transcript,
        space.speakers,
        analysisConfig
      );
      setAnalysis(analysisResult);
      const { initialNodes, initialEdges } = generateGraphElements(
        analysisResult.interactions,
        space.speakers
      );
      // Re-add ts-ignore
      // @ts-ignore
      setNodes(initialNodes);
      // Add ts-ignore for setEdges
      // @ts-ignore
      setEdges(initialEdges);
    } catch (err) {
      setError(
        t('errorGeneratingAnalysis') +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (path: string[], value: boolean | number) => {
    setAnalysisConfig((prevConfig) => {
      const newConfig = JSON.parse(JSON.stringify(prevConfig));
      let current: any = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  const renderAnalysisConfig = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('analysisSettingsTitle')}
        <Tooltip title={t('analysisConfigHelpText')}>
          <IconButton size="small" sx={{ ml: 1 }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t('interactionTypesLabel')}
          </Typography>
          <Tooltip title="Detect interactions when one speaker directly mentions another (@username)">
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
              label={t('directMentionsConfig')}
            />
          </Tooltip>
          <Tooltip
            title={`Detect interactions when one speaker talks shortly after another (within ${analysisConfig.timeWindow}s)`}
          >
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
              label={t('sequentialResponsesConfig')}
            />
          </Tooltip>
          <Tooltip title="Detect interactions based on speakers discussing similar topics">
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
              label={t('topicBasedConfig')}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t('strengthMetricsLabel')}
          </Typography>
          <Tooltip title="Weight interaction strength by the number of times it occurs">
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
              label={t('frequencyConfig')}
            />
          </Tooltip>
          <Tooltip title="Weight interaction strength by the total speaking duration involved">
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
              label={t('durationConfig')}
            />
          </Tooltip>
          <Tooltip
            title={`Weight interaction strength by the similarity of topics discussed (above ${
              analysisConfig.topicOverlapThreshold * 100
            }% threshold)`}
          >
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
              label={t('topicOverlapConfig')}
            />
          </Tooltip>
          <Tooltip title="Color-code interactions based on sentiment analysis">
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
              label={t('sentimentConfig')}
            />
          </Tooltip>
          <Tooltip title="Weight interaction strength by the average response time">
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
              label={t('responseTimeConfig')}
            />
          </Tooltip>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {(analysisConfig.interactionTypes.sequentialResponses ||
        analysisConfig.interactionTypes.timeProximity) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t('timeWindowLabel')}
          </Typography>
          <Slider
            value={analysisConfig.timeWindow}
            onChange={(_, newValue) =>
              handleConfigChange(['timeWindow'], newValue as number)
            }
            aria-labelledby="time-window-slider"
            valueLabelDisplay="auto"
            step={10}
            marks
            min={10}
            max={300}
          />
        </Box>
      )}
      {analysisConfig.strengthMetrics.topicOverlap && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t('topicOverlapThresholdLabel')}
          </Typography>
          <Slider
            value={analysisConfig.topicOverlapThreshold}
            onChange={(_, newValue) =>
              handleConfigChange(['topicOverlapThreshold'], newValue as number)
            }
            aria-labelledby="topic-overlap-slider"
            valueLabelDisplay="auto"
            step={0.1}
            marks
            min={0}
            max={1}
          />
        </Box>
      )}

      <Button
        variant="contained"
        onClick={updateAnalysis}
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? t('generatingAnalysis') : t('updateAnalysisButton')}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <CircularProgress color="inherit" />
            <Typography sx={{ mt: 1 }}>{t('generatingAnalysis')} </Typography>
          </Box>
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      )}

      {/* Initial State: Generate Button */}
      {!analysis && !loading && !error && (
        <Box sx={{ textAlign: 'center', mt: 4, p: 2 }}>
          <Typography sx={{ mb: 2 }}>
            {transcript ? t('noAnalysisData') : 'Loading transcript...'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleGenerateAnalysis}
            disabled={!space || !transcript || loading}
          >
            {t('generateAnalysisButton')}
          </Button>
        </Box>
      )}

      {/* Analysis Available: Show Tabs and Content */}
      {analysis && (
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          {/* Left Panel - Navigation Only - REMOVED */}
          {/* 
            <Paper sx={{ width: 280, p: 2, display: 'flex', flexDirection: 'column', mr: 2, flexShrink: 0 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    orientation="vertical" 
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    <Tab label={t('interactionGraphTab')} />
                    <Tab label={t('topicsTab')} />
                    <Tab label={t('analysisSettingsTab')} />
                </Tabs>
            </Paper>
             */}

          {/* Main Content Area */}
          <Paper
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Horizontal Tabs at the Top */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                // orientation="horizontal" // Default
                sx={{ mb: 0 }} // Remove bottom margin if needed, or adjust spacing
              >
                <Tab label={t('interactionGraphTab')} />
                <Tab label={t('topicsTab')} />
                <Tab label={t('analysisSettingsTab')} />
              </Tabs>
            </Box>

            {/* Content based on tabValue */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {' '}
              {/* Add overflow auto here */}
              {tabValue === 0 && (
                // Interaction Graph View
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  {/* Controls at the top of the graph view */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>{t('selectTopicLabel')}</InputLabel>
                      <Select
                        value={selectedTopic ?? 'all'}
                        label={t('selectTopicLabel')}
                        onChange={handleTopicChange}
                      >
                        <MenuItem value="all">
                          <em>{t('allTopicsOption')}</em>
                        </MenuItem>
                        {analysis.topics.map((topic) => (
                          <MenuItem key={topic.topic} value={topic.topic}>
                            {topic.topic.length > 30
                              ? `${topic.topic.substring(0, 27)}...`
                              : topic.topic}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="body2">
                        {t('mostActiveSpeakerStat')}:{' '}
                        {visualMetrics.mostActiveNode
                          ? `${
                              space?.speakers?.find(
                                (s) =>
                                  s.userId === visualMetrics.mostActiveNode?.[0]
                              )?.displayName
                            } (${visualMetrics.mostActiveNode[1]})`
                          : 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {t('avgInteractionsStat')}:{' '}
                        {visualMetrics.averageInteractions.toFixed(1)}
                      </Typography>
                      <Typography variant="body2">
                        {t('totalConnectionsStat')}: {visualMetrics.totalEdges}
                      </Typography>
                    </Box>
                    {nodes.length === 0 &&
                      edges.length === 0 &&
                      selectedTopic && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: '100%' }}
                        >
                          {t('noInteractionsForTopic')}
                        </Typography>
                      )}
                  </Box>
                  {/* Graph takes remaining space */}
                  <Box
                    sx={{ flexGrow: 1, position: 'relative' }}
                    ref={reactFlowWrapperRef}
                  >
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onInit={setReactFlowInstance}
                      nodeTypes={nodeTypes}
                      onEdgeClick={handleEdgeClick}
                      proOptions={{ hideAttribution: true }}
                      connectionLineType={ConnectionLineType.SmoothStep}
                      style={{ background: '#1e293b' }}
                    >
                      <Controls />
                      <Background color="#4b5563" gap={16} />
                      <MiniMap nodeStrokeWidth={3} zoomable pannable />
                    </ReactFlow>
                  </Box>
                </Box>
              )}
              {tabValue === 1 && (
                // Topics View
                <Box sx={{ p: 2 }}>
                  {' '}
                  {/* Removed height: 100% */}
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('topicsTitle')}
                  </Typography>
                  {analysis.topics.length > 0 ? (
                    <List>
                      {analysis.topics.map((topic) => (
                        <ListItem
                          key={topic.topic}
                          alignItems="flex-start"
                          divider
                        >
                          <ListItemText
                            primary={topic.topic}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  Speakers:{' '}
                                  {topic.speakers
                                    .map(
                                      (id) =>
                                        space?.speakers?.find(
                                          (s) => s.userId === id
                                        )?.displayName || id
                                    )
                                    .join(', ')}
                                </Typography>
                                {` — ${
                                  topic.summary || 'No summary available.'
                                }`}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('noTopicsFound')}
                    </Typography>
                  )}
                </Box>
              )}
              {tabValue === 2 && (
                // Analysis Settings View
                <Box sx={{ p: 2 }}>
                  {' '}
                  {/* Removed height: 100% */}
                  {renderAnalysisConfig()}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Interaction Details Modal */}
      <Dialog
        open={isInteractionModalOpen}
        onClose={handleCloseInteractionModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {t('interactionDetailsTitle')}
          <IconButton onClick={handleCloseInteractionModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedInteraction && (
            <Box>
              <Typography variant="body1">
                <strong>{t('modalFromLabel')}</strong>{' '}
                {space?.speakers?.find(
                  (s) => s.userId === selectedInteraction.fromSpeakerId
                )?.displayName || selectedInteraction.fromSpeakerId}
              </Typography>
              <Typography variant="body1">
                <strong>{t('modalToLabel')}</strong>{' '}
                {space?.speakers?.find(
                  (s) => s.userId === selectedInteraction.toSpeakerId
                )?.displayName || selectedInteraction.toSpeakerId}
              </Typography>
              <Typography variant="body1">
                <strong>{t('modalSentimentLabel')}</strong>{' '}
                <Chip
                  label={selectedInteraction.sentiment}
                  size="small"
                  sx={{
                    bgcolor: getSentimentColor(selectedInteraction.sentiment),
                    color: 'white',
                  }}
                />
              </Typography>
              <Typography variant="body1">
                <strong>
                  {t('modalStrengthLabel')} ({t('frequencyConfig')}):
                </strong>{' '}
                {selectedInteraction.count}
              </Typography>
              {selectedInteraction.topics &&
                selectedInteraction.topics.length > 0 && (
                  <Typography variant="body1">
                    <strong>{t('topicsTitle')}:</strong>{' '}
                    {selectedInteraction.topics.join(', ')}
                  </Typography>
                )}
              {selectedInteraction.duration && (
                <Typography variant="body1">
                  <strong>{t('durationConfig')}:</strong>{' '}
                  {selectedInteraction.duration.toFixed(1)}s
                </Typography>
              )}
              {selectedInteraction.responseTime && (
                <Typography variant="body1">
                  <strong>{t('responseTimeConfig')}:</strong>{' '}
                  {selectedInteraction.responseTime.toFixed(1)}s
                </Typography>
              )}
              {selectedInteraction.topicOverlapScore !== undefined && (
                <Typography variant="body1">
                  <strong>{t('topicOverlapConfig')}:</strong>{' '}
                  {(selectedInteraction.topicOverlapScore * 100).toFixed(0)}%
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInteractionModal}>
            {t('closeButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Wrap with ReactFlowProvider
const SpaceAnalysisWrapper: React.FC<SpaceAnalysisProps> = (props) => (
  <ReactFlowProvider>
    <SpaceAnalysis {...props} />
  </ReactFlowProvider>
);

export default SpaceAnalysisWrapper;

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
// @ts-ignore
import ForceGraph2D from 'react-force-graph-2d';
import { Box, CircularProgress, Typography } from '@mui/material';
import { SpaceListener } from '../../services/db/spaces.service';

interface ListenerVisualizerProps {
  listeners: SpaceListener[];
  loading: boolean;
  error: Error | undefined;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  x?: number;
  y?: number;
  user: SpaceListener;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface ForceGraphProps {
  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  nodeLabel: (node: GraphNode) => string;
  nodeColor: () => string;
  nodeRelSize: number;
  linkColor: () => string;
  linkWidth: (link: GraphLink) => number;
  onNodeClick: (node: GraphNode) => void;
  cooldownTicks: number;
  nodeCanvasObject: (
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => void;
}

const ListenerVisualizer: React.FC<ListenerVisualizerProps> = ({
  listeners,
  loading,
  error,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Debug logging
  useEffect(() => {
    console.log('ListenerVisualizer - Received listeners:', listeners);
    console.log('ListenerVisualizer - Container dimensions:', dimensions);
  }, [listeners, dimensions]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        console.log('ListenerVisualizer - New dimensions:', { width, height });
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = listeners.map((listener) => ({
      id: listener.userId,
      name: listener.displayName,
      val: 1,
      user: listener,
    }));

    // Create links between nodes based on join time proximity
    const links: GraphLink[] = [];
    for (let i = 0; i < listeners.length - 1; i++) {
      const currentListener = listeners[i];
      const nextListener = listeners[i + 1];

      if (currentListener.joinedAt && nextListener.joinedAt) {
        const timeDiff = Math.abs(
          currentListener.joinedAt - nextListener.joinedAt
        );
        // Only create links between listeners who joined within 5 minutes of each other
        if (timeDiff < 300000) {
          links.push({
            source: currentListener.userId,
            target: nextListener.userId,
            value: 1 - timeDiff / 300000, // Stronger link for closer join times
          });
        }
      }
    }

    console.log('ListenerVisualizer - Graph data:', { nodes, links });
    return { nodes, links };
  }, [listeners]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    window.open(`https://twitter.com/${node.user.twitterScreenName}`, '_blank');
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Typography color="error">
          Error loading listeners: {error.toString()}
        </Typography>
      </Box>
    );
  }

  if (listeners.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Typography>No listeners found</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.1)', // Debug border
        overflow: 'hidden',
      }}
    >
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={(node: GraphNode) => node.name}
        nodeColor={() => '#1DA1F2'}
        nodeRelSize={6}
        linkColor={() => 'rgba(29, 161, 242, 0.2)'}
        linkWidth={(link: GraphLink) => link.value * 2}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        nodeCanvasObject={(
          node: GraphNode,
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.textAlign = 'center';
          ctx.fillText(label, node.x!, node.y! + 8);
        }}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0, 0, 0, 0.2)"
      />
    </Box>
  );
};

export default ListenerVisualizer;

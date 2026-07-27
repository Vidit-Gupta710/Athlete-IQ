import React, { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, Maximize2, RefreshCw, Loader2 } from 'lucide-react';
import useAthlete from '../../hooks/useAthlete';

const colors = {
  injury: '#F43F5E',      // Rose Pink
  body_part: '#6366F1',   // Sleek Indigo
  exercise: '#10B981',    // Emerald Green
  nutrition: '#F59E0B',   // Amber Gold
  recovery: '#06B6D4'     // Bright Cyan
};

export default function KnowledgeGraphViewer({ graphData, injuryKey }) {
  const { theme } = useAthlete();
  const [data, setData] = useState(graphData || { nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  const fgRef = useRef(null);
  const containerRef = useRef(null);

  // Sync dimensions with container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 600,
          height: 480
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const key = injuryKey || 'patellar_tendonitis';
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const url = `${baseUrl.replace(/\/$/, '')}/graph/${key}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve injury mapping nodes.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount if graphData is not provided
  useEffect(() => {
    if (graphData) {
      setData(graphData);
    } else {
      fetchData();
    }
  }, [injuryKey, graphData]);

  // Deep copy nodes and edges to avoid mutation conflicts in react-force-graph
  const formattedData = useMemo(() => {
    if (!data.nodes || !data.edges) return { nodes: [], links: [] };
    return {
      nodes: data.nodes.map((node) => ({
        ...node,
        color: colors[node.type] || node.color || '#FFFFFF',
      })),
      links: data.edges.map((edge) => ({
        ...edge,
        source: edge.source,
        target: edge.target,
      }))
    };
  }, [data]);

  // Fit to screen helper
  const handleFitScreen = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 60);
    }
  };

  // Keep graph centered when data loads
  useEffect(() => {
    if (formattedData.nodes.length > 0 && fgRef.current) {
      setTimeout(() => {
        handleFitScreen();
      }, 500);
    }
  }, [formattedData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full neu-flat gap-3">
        <Loader2 className="h-8 w-8 text-theme-primary animate-spin" />
        <p className="text-xs text-theme-muted font-bold uppercase tracking-wider">Loading interactive graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full neu-flat gap-4 p-6 text-center">
        <div className="p-3.5 rounded-full neu-pressed text-red-500 text-base">
          ⚠️
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-theme-heading uppercase tracking-wider">Graph Fetch Failed</h3>
          <p className="text-xs text-theme-muted font-medium mt-1 max-w-xs">{error}</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-4 py-2 neu-button text-theme-muted hover:text-theme-primary text-xs font-bold tracking-wider transition duration-200 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-theme-primary" />
          <span>Retry Fetch</span>
        </button>
      </div>
    );
  }

  const canvasBg = theme === 'light' ? '#f7ded7' : '#121418';
  const linkColor = theme === 'light' ? '#dfc0b7' : '#1c2026';

  return (
    <div className="w-full neu-flat p-6 relative flex flex-col gap-5 overflow-hidden">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-theme-primary" />
          <h3 className="text-sm font-extrabold text-theme-heading uppercase tracking-widest">
            Relational Knowledge Graph
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFitScreen}
            className="flex items-center gap-1.5 px-3.5 py-2 neu-button text-theme-muted hover:text-theme-primary text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer"
            title="Recenter and fit screen"
          >
            <Maximize2 className="h-3.5 w-3.5 text-theme-primary" />
            <span>Fit Screen</span>
          </button>
          {!graphData && (
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3.5 py-2 neu-button text-theme-muted hover:text-theme-primary text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-theme-primary" />
              <span>Reload</span>
            </button>
          )}
        </div>
      </div>

      {/* Graph Area */}
      <div 
        ref={containerRef} 
        className="w-full min-h-[480px] neu-pressed relative overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {formattedData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={fgRef}
            graphData={formattedData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor={canvasBg}
            nodeRelSize={6}
            linkWidth={1.5}
            linkColor={() => linkColor}
            
            // Particles flow along links
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={2.5}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleColor={(link) => {
              const targetNode = formattedData.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target));
              return targetNode ? targetNode.color : '#d95f54';
            }}
            
            // Interaction settings
            onNodeHover={(node) => setHoverNode(node)}
            cooldownTicks={100}
            
            // Hover Tooltips
            nodeLabel={(node) => `
              <div class="neu-flat p-2.5 text-xs font-sans">
                <div class="font-black text-theme-heading">${node.label}</div>
                <div class="text-[10px] uppercase font-black tracking-widest text-theme-muted mt-1 flex items-center gap-1.5">
                  <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${node.color}"></span>
                  ${node.type.replace('_', ' ')}
                </div>
              </div>
            `}
            linkLabel={(link) => `
              <div class="neu-pressed px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider font-sans text-theme-main">
                ${link.relation || link.label}
              </div>
            `}
            
            // Custom node drawing with canvas
            nodeCanvasObject={(node, ctx, globalScale) => {
              const size = node.size || 20;
              const radius = size / 2.5;

              // Node Glow shadow
              ctx.shadowColor = node.color;
              ctx.shadowBlur = hoverNode === node ? 12 / globalScale : 6 / globalScale;

              // Draw circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();

              // Reset shadow
              ctx.shadowBlur = 0;

              // Draw border
              ctx.strokeStyle = hoverNode === node ? (theme === 'light' ? '#361916' : '#FFFFFF') : linkColor;
              ctx.lineWidth = hoverNode === node ? 2.5 / globalScale : 1.2 / globalScale;
              ctx.stroke();

              // Draw node label centered below
              const label = node.label || node.id;
              const fontSize = 11 / globalScale;
              ctx.font = `bold ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = hoverNode === node 
                ? (theme === 'light' ? '#361916' : '#FFFFFF') 
                : (theme === 'light' ? '#4a2521' : '#94A3B8');
              
              const textY = node.y + radius + (4 / globalScale);
              ctx.fillText(label, node.x, textY);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-theme-muted text-xs font-bold">
            No graph data found
          </div>
        )}
      </div>

      {/* Legend showing types & colors */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 neu-pressed p-4">
        {Object.entries(colors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-xs font-bold text-theme-muted">
            <span 
              className="w-3 h-3 rounded-full border border-[var(--border-subtle)]" 
              style={{ backgroundColor: color }}
            />
            <span className="capitalize tracking-wider">{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

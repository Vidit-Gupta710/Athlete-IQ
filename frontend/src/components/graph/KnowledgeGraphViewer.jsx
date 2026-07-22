import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { getGraphByKey } from '../../api/memory';
import { Loader2, RefreshCw, Maximize2, Network, ShieldAlert } from 'lucide-react';

const TYPE_COLORS = {
  injury: '#F43F5E',
  body_part: '#6366F1',
  exercise: '#10B981',
  nutrition: '#F59E0B',
  recovery: '#06B6D4'
};

const sanitizeGraphData = (data) => {
  if (!data) return { nodes: [], links: [] };
  const nodes = Array.isArray(data.nodes)
    ? data.nodes.filter(n => n && typeof n === 'object' && n.id !== undefined && n.id !== null)
    : [];
  const rawLinks = Array.isArray(data.links)
    ? data.links
    : (Array.isArray(data.edges) ? data.edges : []);
  const nodeIds = new Set(nodes.map(n => n.id));
  const links = rawLinks
    .filter(l => l && typeof l === 'object' && l.source !== undefined && l.source !== null && l.target !== undefined && l.target !== null)
    .filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))
    .map(link => ({
      ...link,
      source: link.source,
      target: link.target
    }));
  return { nodes, links };
};

export default function KnowledgeGraphViewer({ injuryKey = 'patellar_tendonitis', graphData: initialGraphData }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [graphData, setGraphData] = useState(() => initialGraphData ? sanitizeGraphData(initialGraphData) : null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 550 });

  // Update dimensions to fill container dynamically
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width } = entry.contentRect;
          // Set a pleasant square or wide aspect ratio
          setDimensions({ width, height: 550 });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const fetchGraph = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getGraphByKey(injuryKey);
      setGraphData(sanitizeGraphData(response));
    } catch (err) {
      console.error('Error fetching graph data:', err);
      setError(err.message || 'Failed to fetch graph visual relationships.');
      setGraphData({ nodes: [], links: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch graph on mount and when injuryKey changes
  useEffect(() => {
    if (injuryKey) {
      fetchGraph();
    }
  }, [injuryKey]);

  // Adjust force settings and zoom to fit once data is loaded
  useEffect(() => {
    if (fgRef.current && graphData && graphData.nodes && graphData.nodes.length > 0) {
      // Set node-repelling force and link distance
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link').distance(140);
      
      // Warmup ticks to let layout settle, then fit to screen
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(500, 40);
        }
      }, 300);
    }
  }, [graphData]);

  const handleFitScreen = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 40);
    }
  };

  // Canvas Custom Drawing: Color-coded circle and labels rendered below
  const drawNode = (node, ctx, globalScale) => {
    const size = node.type === 'injury' ? 12 : 7;
    const color = TYPE_COLORS[node.type] || node.color || '#FFFFFF';

    // 1. Draw glowing circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // 2. Draw border
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8 / Math.max(1, globalScale);
    ctx.stroke();

    // 3. Draw text label below the node
    const label = node.label || '';
    const fontSize = 11;
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Text shadowing/stroke for high contrast readability
    ctx.strokeStyle = '#090D16';
    ctx.lineWidth = 3 / Math.max(1, globalScale);
    ctx.strokeText(label, node.x, node.y + size + 6);

    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(label, node.x, node.y + size + 6);
  };

  // Canvas custom hit/pointer area representation matching custom node size
  const paintNodeArea = (node, color, ctx) => {
    const size = node.type === 'injury' ? 12 : 7;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const hasData = graphData && Array.isArray(graphData.nodes) && graphData.nodes.length > 0;

  if (isLoading && !graphData) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[550px] gap-3">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">Loading interactive graph...</p>
      </div>
    );
  }

  if (error && !graphData) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[550px] text-center gap-4">
        <div className="p-3.5 rounded-full bg-red-955/20 border border-red-900/40 text-red-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Failed to Load Graph</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{error}</p>
        </div>
        <button
          onClick={fetchGraph}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 hover:text-emerald-400 text-xs font-semibold tracking-wider transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  if (!isLoading && !error && !hasData) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[550px] text-center gap-4">
        <div className="p-3.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
          <Network className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No Graph Data Available</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">There are currently no visual relationships mapped for this recovery status.</p>
        </div>
        <button
          onClick={fetchGraph}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-700 hover:text-emerald-400 text-xs font-semibold tracking-wider transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col space-y-4">
      {/* Description header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Biomedical Action Graph
          </h3>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-slate-800 bg-slate-950 text-slate-400">
          {injuryKey.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Force-directed graph container */}
      <div 
        ref={containerRef} 
        className="w-full relative rounded-xl overflow-hidden bg-[#0F172A] border border-slate-950/60"
        style={{ height: '550px' }}
      >
        {graphData && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="#0F172A"
            nodeCanvasObject={drawNode}
            nodePointerAreaPaint={paintNodeArea}
            nodeVal={node => (node.type === 'injury' ? 12 : 7)}
            
            // Edge connections & particle animation
            linkColor={() => '#334155'}
            linkWidth={1.5}
            linkDirectionalParticles={4}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleWidth={2.2}
            linkDirectionalParticleColor={link => {
              // Flow towards target, color matching source node
              const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
              return TYPE_COLORS[sourceNode?.type] || '#38BDF8';
            }}
            
            // Custom HTML hover tooltips
            nodeLabel={node => `
              <div style="
                background: #020617;
                color: #F8FAFC;
                border: 1px solid #1E293B;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 11px;
                font-family: system-ui, sans-serif;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
                pointer-events: none;
              ">
                <div style="font-weight: 700; margin-bottom: 2px;">${node.label}</div>
                <div style="font-size: 9px; text-transform: uppercase; color: ${TYPE_COLORS[node.type] || '#94A3B8'}; font-weight: 800; letter-spacing: 0.05em;">
                  ${node.type.replace('_', ' ')}
                </div>
              </div>
            `}
            
            // Drag and zoom behaviors
            enableNodeDrag={true}
            enableZoomInteraction={true}
            cooldownTicks={120}
          />
        )}

        {/* Legend Overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-xl shadow-xl space-y-2 pointer-events-auto z-10">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Legend</h5>
          <div className="space-y-1.5">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: color }} />
                <span className="text-[11px] capitalize text-slate-300 font-semibold tracking-wide">
                  {type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fit to screen button (Bottom Right) */}
        <button
          onClick={handleFitScreen}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider shadow-lg transition-all duration-200 pointer-events-auto z-10"
          title="Fit graph to viewport"
        >
          <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Fit View</span>
        </button>
      </div>
    </div>
  );
}

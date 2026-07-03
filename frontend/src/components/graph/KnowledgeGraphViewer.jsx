import React from 'react';
import { Network, GitCommit, GitBranch } from 'lucide-react';

export default function KnowledgeGraphViewer({ graphData }) {
  const { nodes = [], edges = [] } = graphData || {};

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Notice header block */}
      <div className="p-4 rounded-xl border border-indigo-900/40 bg-indigo-950/20 text-indigo-400 text-xs">
        <h4 className="font-bold flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
          <Network className="h-4.5 w-4.5" />
          Teammate Component Placeholder (KnowledgeGraphViewer)
        </h4>
        <p className="leading-relaxed">
          This component is currently a placeholder/stub wireframe for integration. The active data fetching hooks and graph props have been configured successfully.
        </p>
      </div>

      {/* Raw representation of loaded graph nodes/edges for visual verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Nodes summary */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 font-sans">
            <GitCommit className="h-4 w-4 text-emerald-400" />
            Vulnerability Nodes ({nodes.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {nodes.map((node) => (
              <div key={node.id} className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-200">{node.label}</span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded border border-slate-850 bg-slate-900 text-slate-400">
                  {node.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Edges summary */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-sans">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <GitBranch className="h-4 w-4 text-indigo-400" />
            Structural Edges / Relational ({edges.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {edges.map((edge, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400">{edge.source}</span>
                <span className="text-[10px] text-indigo-400 px-1 py-0.5 border border-indigo-900/40 rounded bg-indigo-950/20 font-bold">
                  {edge.relation}
                </span>
                <span className="text-slate-200">{edge.target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

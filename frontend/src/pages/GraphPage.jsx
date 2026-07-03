import React, { useEffect, useState } from 'react';
import useAthlete from '../hooks/useAthlete';
import { getAthleteGraph } from '../api/memory';
import KnowledgeGraphViewer from '../components/graph/KnowledgeGraphViewer';
import { Loader2, RefreshCw } from 'lucide-react';

export default function GraphPage() {
  const { athleteId } = useAthlete();
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGraphData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAthleteGraph(athleteId);
      setGraphData(response);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve injury mapping nodes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (athleteId) {
      fetchGraphData();
    }
  }, [athleteId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Syncing injury relationships...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-sm mx-auto text-center gap-4">
        <div className="p-4 rounded-full bg-red-955/20 border border-red-900/50 text-red-400 text-lg">
          ⚠️
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Injury Graph Sync Failed</h3>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchGraphData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-emerald-400 text-sm font-semibold tracking-wider transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Sync</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-slate-950/20 py-2 border-b border-slate-900/60">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Injury Knowledge Graph</h1>
          <p className="text-sm text-slate-400 mt-1">Cross-referencing training loads, symptoms and rehab drills</p>
        </div>
        <button 
          onClick={fetchGraphData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition duration-200"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Sync</span>
        </button>
      </div>

      <KnowledgeGraphViewer graphData={graphData} />
    </div>
  );
}

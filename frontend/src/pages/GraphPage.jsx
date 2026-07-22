import React, { useState } from 'react';
import useAthlete from '../hooks/useAthlete';
import KnowledgeGraphViewer from '../components/graph/KnowledgeGraphViewer';
import { RefreshCw } from 'lucide-react';

export default function GraphPage() {
  const { profile } = useAthlete();
  const [syncCounter, setSyncCounter] = useState(0);

  const injuries = profile?.injuries || [];
  let injuryKey = 'patellar_tendonitis';
  if (injuries.length > 0) {
    const name = injuries[0].name.toLowerCase();
    if (name.includes('shoulder') || name.includes('rotator')) {
      injuryKey = 'rotator_cuff_tendonitis';
    } else if (name.includes('acl')) {
      injuryKey = 'acl_sprain';
    } else if (name.includes('knee') || name.includes('patellar')) {
      injuryKey = 'patellar_tendonitis';
    }
  }

  const handleSync = () => {
    setSyncCounter(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-slate-950/20 py-2 border-b border-slate-900/60">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Injury Knowledge Graph</h1>
          <p className="text-sm text-slate-400 mt-1">Cross-referencing training loads, symptoms and rehab drills</p>
        </div>
        <button 
          onClick={handleSync}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition duration-200"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Sync</span>
        </button>
      </div>

      <KnowledgeGraphViewer key={`${injuryKey}-${syncCounter}`} injuryKey={injuryKey} />
    </div>
  );
}


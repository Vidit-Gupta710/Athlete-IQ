import React from 'react';
import { AlertCircle, ShieldAlert, Heart } from 'lucide-react';

export default function InjuryCard({ injuries }) {
  if (!injuries || injuries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-theme-muted neu-flat">
        <Heart className="h-8 w-8 text-theme-primary mb-3" />
        <h4 className="text-base font-bold text-theme-heading">No Injuries Logged</h4>
        <p className="text-xs text-theme-muted max-w-[240px] mt-1">All clear! No critical vulnerabilities or soft-tissue fatigue currently active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 neu-flat p-6">
      <h3 className="text-lg font-bold text-theme-heading mb-2 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-theme-primary" />
        Active Concerns
      </h3>
      
      <div className="space-y-3.5">
        {injuries.map((injury, idx) => {
          const pain = Number(injury.painLevel || 0);
          
          return (
            <div key={idx} className="p-4 neu-pressed">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-theme-heading">{injury.name}</h4>
                  <p className="text-xs text-theme-muted font-bold uppercase tracking-wider mt-0.5">{injury.location} Area</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                    pain >= 7 
                      ? 'bg-red-950/40 border border-red-800/50 text-red-500 font-extrabold' 
                      : pain >= 4 
                      ? 'bg-amber-950/40 border border-amber-800/50 text-amber-500 font-extrabold' 
                      : 'bg-emerald-950/40 border border-emerald-800/50 text-neon-green font-extrabold'
                  }`}>
                    Pain: {pain}/10
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 neu-pressed rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    pain >= 7 
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                      : pain >= 4 
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                      : 'bg-neon-green'
                  }`}
                  style={{ width: `${pain * 10}%` }}
                />
              </div>

              {injury.surgeryHistory ? (
                <div className="text-xs text-theme-main neu-flat p-2.5">
                  <span className="font-bold text-theme-muted">History: </span>
                  {injury.surgeryHistory}
                </div>
              ) : (
                <div className="text-xs text-theme-muted italic">No surgical histories flagged.</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

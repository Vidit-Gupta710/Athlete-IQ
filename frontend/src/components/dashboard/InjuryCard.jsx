import React from 'react';
import { AlertCircle, ShieldAlert, Heart } from 'lucide-react';

export default function InjuryCard({ injuries }) {
  if (!injuries || injuries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 bg-slate-900 border border-slate-800/80 rounded-2xl">
        <Heart className="h-8 w-8 text-emerald-500/75 mb-3" />
        <h4 className="text-base font-bold text-slate-350">No Injuries Logged</h4>
        <p className="text-xs text-slate-500 max-w-[240px] mt-1">All clear! No critical vulnerabilities or soft-tissue fatigue currently active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-amber-500" />
        Active Concerns
      </h3>
      
      <div className="space-y-3.5">
        {injuries.map((injury, idx) => {
          const pain = Number(injury.painLevel || 0);
          
          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/60 hover:border-slate-800 transition duration-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-205">{injury.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{injury.location} Area</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    pain >= 7 
                      ? 'border-red-900/50 bg-red-950/20 text-red-400' 
                      : pain >= 4 
                      ? 'border-amber-900/50 bg-amber-950/20 text-amber-500' 
                      : 'border-emerald-900/50 bg-emerald-950/20 text-emerald-400'
                  }`}>
                    Pain: {pain}/10
                  </span>
                </div>
              </div>

              {/* Progress/Severe Bar */}
              <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    pain >= 7 
                      ? 'bg-gradient-to-r from-red-650 to-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                      : pain >= 4 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${pain * 10}%` }}
                />
              </div>

              {injury.surgeryHistory ? (
                <div className="text-xs text-slate-400 bg-slate-900/40 p-2 border border-slate-850 rounded-lg">
                  <span className="font-bold text-slate-500">History: </span>
                  {injury.surgeryHistory}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">No surgical histories flagged.</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

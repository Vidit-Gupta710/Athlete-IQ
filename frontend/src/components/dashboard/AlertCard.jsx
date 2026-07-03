import React from 'react';
import { AlertTriangle, Info, BellRing } from 'lucide-react';

export default function AlertCard({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 bg-slate-900 border border-slate-800/80 rounded-2xl min-h-64 shadow-xl">
        <BellRing className="h-8 w-8 text-slate-650 mb-3" />
        <h4 className="text-base font-bold text-slate-350">No Warnings</h4>
        <p className="text-xs text-slate-500 max-w-[240px] mt-1">Smart Copilot analyzer scans training volumes - all clear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex-1 flex flex-col min-h-0">
      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        <BellRing className="h-5 w-5 text-emerald-400" />
        Smart Recovery Insights
      </h3>
      
      <div className="space-y-3 overflow-y-auto pr-1">
        {alerts.map((alert) => {
          const isWarning = alert.type === 'warning';
          
          return (
            <div key={alert.id} className={`p-4 rounded-xl border flex gap-3 transition-colors ${
              isWarning
                ? 'bg-amber-955/20 border-amber-900/50 text-amber-300'
                : 'bg-indigo-950/20 border-indigo-900/50 text-indigo-300'
            }`}>
              <div className="mt-0.5 shrink-0">
                {isWarning ? <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> : <Info className="h-4.5 w-4.5 text-indigo-405" />}
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-bold text-slate-200">{alert.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                <span className="block text-[10px] text-slate-550 font-semibold uppercase tracking-wider mt-2.5">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Real-Time Alert
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

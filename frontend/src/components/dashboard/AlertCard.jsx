import React from 'react';
import { AlertTriangle, Info, BellRing } from 'lucide-react';

export default function AlertCard({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-theme-muted neu-flat min-h-64">
        <BellRing className="h-8 w-8 text-theme-muted mb-3" />
        <h4 className="text-base font-bold text-theme-heading">No Warnings</h4>
        <p className="text-xs text-theme-muted max-w-[240px] mt-1">Smart Copilot analyzer scans training volumes - all clear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 neu-flat p-6 flex-1 flex flex-col min-h-0">
      <h3 className="text-lg font-bold text-theme-heading mb-2 flex items-center gap-2">
        <BellRing className="h-5 w-5 text-theme-primary" />
        Smart Recovery Insights
      </h3>
      
      <div className="space-y-3 overflow-y-auto pr-1">
        {alerts.map((alert) => {
          const isWarning = alert.type === 'warning';
          
          return (
            <div key={alert.id} className={`p-4 neu-pressed flex gap-3 transition-colors ${
              isWarning
                ? 'border border-amber-500/30'
                : 'border border-[var(--accent-primary)]/30'
            }`}>
              <div className="mt-0.5 shrink-0">
                {isWarning ? <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> : <Info className="h-4.5 w-4.5 text-theme-primary" />}
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-bold text-theme-heading">{alert.title}</h4>
                <p className="text-xs text-theme-main font-medium mt-1 leading-relaxed">{alert.message}</p>
                <span className="block text-[10px] text-theme-muted font-bold uppercase tracking-wider mt-2.5">
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

import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="neu-flat p-6 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-theme-muted">{title}</span>
        <div className="w-10 h-10 neu-pressed flex items-center justify-center text-theme-primary">
          <Icon className="h-5 w-5 text-theme-primary" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-theme-heading">{value}</span>
      </div>
      
      {trend && (
        <span className="block mt-2.5 text-xs text-neon-green font-bold uppercase tracking-wider">
          {trend}
        </span>
      )}
    </div>
  );
}

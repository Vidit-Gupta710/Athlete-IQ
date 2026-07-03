import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, colorClass = 'text-emerald-400 border-slate-800' }) {
  return (
    <div className="relative group overflow-hidden bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-slate-700/80 hover:translate-y-[-2px] hover:shadow-2xl">
      {/* Background soft light glow on hover */}
      <div className="absolute -inset-px -z-10 bg-gradient-to-r from-slate-800/0 via-emerald-500/5 to-slate-800/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
      </div>
      
      {trend && (
        <span className="block mt-2.5 text-xs text-slate-500 font-semibold uppercase tracking-wider animate-pulse">
          {trend}
        </span>
      )}
    </div>
  );
}

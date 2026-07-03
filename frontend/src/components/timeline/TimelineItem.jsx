import React from 'react';
import { Check, Play, Circle, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export default function TimelineItem({ item }) {
  const { title, description, date, status } = item;

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: Check,
          iconBg: 'bg-emerald-500 text-slate-950',
          border: 'border-emerald-500',
          accentText: 'text-emerald-400',
          cardBg: 'bg-slate-900/60 border-slate-805'
        };
      case 'active':
        return {
          icon: Play,
          iconBg: 'bg-indigo-500 text-white animate-pulse',
          border: 'border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
          accentText: 'text-indigo-400 font-extrabold',
          cardBg: 'bg-slate-900 border-indigo-900/50 shadow-xl'
        };
      default: // pending
        return {
          icon: Circle,
          iconBg: 'bg-slate-950 border border-slate-800 text-slate-600',
          border: 'border-slate-805',
          accentText: 'text-slate-500',
          cardBg: 'bg-slate-900/30 border-slate-850 opacity-70'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="relative pl-8 sm:pl-10 group">
      {/* Node Axis Mark */}
      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${config.iconBg} ${config.border}`}>
        <IconComponent className="h-3 w-3" />
      </div>

      {/* Box container */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 hover:border-slate-705 hover:translate-x-0.5 ${config.cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <h4 className="text-sm font-bold text-slate-100 group-hover:text-white transition duration-150">
            {title}
          </h4>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold font-sans uppercase">
            <Calendar className="h-3 w-3" />
            {formatDate(date)}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        
        {status === 'active' && (
          <span className="inline-block mt-3 px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/40 text-[10px] text-indigo-400 font-black uppercase tracking-wider">
            Current Recovery Phase
          </span>
        )}
      </div>
    </div>
  );
}

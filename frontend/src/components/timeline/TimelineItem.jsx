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
          iconBg: 'neu-button text-neon-green',
          accentText: 'text-neon-green',
          cardBg: 'neu-flat'
        };
      case 'active':
        return {
          icon: Play,
          iconBg: 'neu-pressed text-theme-primary shadow-[0_0_12px_var(--accent-primary-glow)]',
          accentText: 'text-theme-primary font-extrabold',
          cardBg: 'neu-pressed border border-[var(--accent-primary)]/30'
        };
      default: // pending
        return {
          icon: Circle,
          iconBg: 'neu-pressed text-theme-muted',
          accentText: 'text-theme-muted',
          cardBg: 'neu-flat opacity-70'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="relative pl-8 sm:pl-10 group">
      {/* Node Axis Mark */}
      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${config.iconBg}`}>
        <IconComponent className="h-3 w-3" />
      </div>

      {/* Box container */}
      <div className={`p-5 transition-all duration-300 ${config.cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <h4 className="text-sm font-extrabold text-theme-heading group-hover:text-theme-primary transition duration-150">
            {title}
          </h4>
          <span className="flex items-center gap-1.5 text-xs text-theme-muted font-bold font-sans uppercase">
            <Calendar className="h-3 w-3 text-theme-primary" />
            {formatDate(date)}
          </span>
        </div>
        <p className="text-xs text-theme-main font-medium leading-relaxed">{description}</p>
        
        {status === 'active' && (
          <span className="inline-block mt-3 px-2.5 py-1 neu-pressed text-[10px] text-theme-primary font-black uppercase tracking-wider border border-[var(--accent-primary)]/30">
            Current Recovery Phase
          </span>
        )}
      </div>
    </div>
  );
}

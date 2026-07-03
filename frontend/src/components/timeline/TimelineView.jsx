import React from 'react';
import TimelineItem from './TimelineItem';

export default function TimelineView({ timelineItems }) {
  if (!timelineItems || timelineItems.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 shadow-xl">
        No recovery milestones logged. Keep building your profile to unlock milestones!
      </div>
    );
  }

  // Sort by date ascending
  const sortedItems = [...timelineItems].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="relative">
      {/* Central Running Axis Line */}
      <div className="absolute left-3 top-2 bottom-4 w-0.5 bg-slate-800">
        <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-indigo-500 to-slate-800" />
      </div>
      
      <div className="space-y-6">
        {sortedItems.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

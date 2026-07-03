import React from 'react';

export default function StepIndicator({ currentStep }) {
  const steps = [
    { number: 1, title: 'Athlete Profile', desc: 'Basic athletic info' },
    { number: 2, title: 'Injury History', desc: 'Soreness and recovery' }
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-8 px-4">
      {steps.map((s, idx) => {
        const isActive = currentStep === s.number;
        const isCompleted = currentStep > s.number;
        
        return (
          <React.Fragment key={s.number}>
            {/* Step Node */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : isCompleted
                  ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                {s.number}
              </div>
              <div className="hidden sm:block text-left">
                <p className={`text-sm font-bold leading-none ${isActive ? 'text-slate-100 font-extrabold' : 'text-slate-400'}`}>
                  {s.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </div>
            </div>
            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-slate-800 relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

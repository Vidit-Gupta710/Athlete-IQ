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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                isActive 
                  ? 'neu-pressed text-sky-400 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                  : isCompleted
                  ? 'neu-button text-neon-green'
                  : 'neu-button text-slate-500'
              }`}>
                {s.number}
              </div>
              <div className="hidden sm:block text-left">
                <p className={`text-sm font-bold leading-none ${isActive ? 'text-sky-400 font-extrabold' : 'text-slate-400'}`}>
                  {s.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </div>
            </div>
            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 neu-pressed relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-neon-green transition-all duration-300"
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

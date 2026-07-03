import React, { useState } from 'react';

export default function InjuryForm({ initialData, onBack, onSubmit, isLoading }) {
  const [hasInjury, setHasInjury] = useState(initialData.injuries && initialData.injuries.length > 0 ? 'yes' : 'no');
  const [injuryData, setInjuryData] = useState({
    name: initialData.injuries?.[0]?.name || '',
    painLevel: initialData.injuries?.[0]?.painLevel || 3,
    location: initialData.injuries?.[0]?.location || 'Knee',
    surgeryHistory: initialData.injuries?.[0]?.surgeryHistory || ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    if (hasInjury === 'no') return true;
    const newErrors = {};
    if (!injuryData.name.trim()) {
      newErrors.name = 'Injury type/name is required (e.g. Patellar Tendonitis)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const injuriesList = hasInjury === 'yes' 
        ? [{
            name: injuryData.name,
            painLevel: Number(injuryData.painLevel),
            location: injuryData.location,
            surgeryHistory: injuryData.surgeryHistory
          }]
        : [];
      onSubmit(injuriesList);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Do you have an active or recent injury?</label>
        <div className="flex gap-4">
          <label className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition duration-200 ${
            hasInjury === 'yes'
              ? 'border-emerald-500 bg-emerald-950/20 text-white'
              : 'border-slate-800 bg-slate-950 text-slate-400'
          }`}>
            <span className="text-sm font-semibold">Yes, active soreness/injury</span>
            <input 
              type="radio" 
              name="hasInjury" 
              value="yes"
              checked={hasInjury === 'yes'}
              onChange={() => setHasInjury('yes')}
              className="accent-emerald-500"
            />
          </label>
          <label className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition duration-200 ${
            hasInjury === 'no'
              ? 'border-emerald-500 bg-emerald-950/20 text-white'
              : 'border-slate-800 bg-slate-950 text-slate-400'
          }`}>
            <span className="text-sm font-semibold">No, all clear</span>
            <input 
              type="radio" 
              name="hasInjury" 
              value="no"
              checked={hasInjury === 'no'}
              onChange={() => setHasInjury('no')}
              className="accent-emerald-500"
            />
          </label>
        </div>
      </div>

      {hasInjury === 'yes' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Injury / Soreness Name</label>
            <input
              type="text"
              value={injuryData.name}
              onChange={(e) => setInjuryData({ ...injuryData, name: e.target.value })}
              placeholder="e.g. Anterior Knee Pain, L4-L5 disc compression"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Pain Location</label>
              <select
                value={injuryData.location}
                onChange={(e) => setInjuryData({ ...injuryData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-205"
              >
                <option value="Knee">Knee</option>
                <option value="Ankle">Ankle</option>
                <option value="Hip">Hip</option>
                <option value="Shoulder">Shoulder</option>
                <option value="Elbow">Elbow</option>
                <option value="Back">Lower Back</option>
                <option value="Hamstring">Hamstring</option>
                <option value="Calf">Calf</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Pain Level ({injuryData.painLevel}/10)</label>
              <div className="flex items-center gap-3 py-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={injuryData.painLevel}
                  onChange={(e) => setInjuryData({ ...injuryData, painLevel: e.target.value })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-sm font-extrabold text-white w-5">{injuryData.painLevel}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Surgery History / Notes (Optional)</label>
            <input
              type="text"
              value={injuryData.surgeryHistory}
              onChange={(e) => setInjuryData({ ...injuryData, surgeryHistory: e.target.value })}
              placeholder="e.g. Scoped right knee 2024, no metal implants."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 border border-slate-800 bg-slate-950 text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest py-3 rounded-xl hover:bg-slate-900 active:scale-[0.98] transition-all duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm uppercase tracking-widest py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_12px_rgba(16,185,129,0.3)] disabled:opacity-50"
        >
          {isLoading ? 'Registering...' : 'Submit Profile'}
        </button>
      </div>
    </form>
  );
}

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
        <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-2">Do you have an active or recent injury?</label>
        <div className="flex gap-4">
          <label className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition duration-200 ${
            hasInjury === 'yes'
              ? 'neu-pressed text-theme-primary border border-[var(--accent-primary)]/30'
              : 'neu-button text-theme-muted font-bold'
          }`}>
            <span className="text-sm font-bold">Yes, active soreness/injury</span>
            <input 
              type="radio" 
              name="hasInjury" 
              value="yes"
              checked={hasInjury === 'yes'}
              onChange={() => setHasInjury('yes')}
              className="accent-[var(--accent-primary)]"
            />
          </label>
          <label className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition duration-200 ${
            hasInjury === 'no'
              ? 'neu-pressed text-theme-primary border border-[var(--accent-primary)]/30'
              : 'neu-button text-theme-muted font-bold'
          }`}>
            <span className="text-sm font-bold">No, all clear</span>
            <input 
              type="radio" 
              name="hasInjury" 
              value="no"
              checked={hasInjury === 'no'}
              onChange={() => setHasInjury('no')}
              className="accent-[var(--accent-primary)]"
            />
          </label>
        </div>
      </div>

      {hasInjury === 'yes' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Injury / Soreness Name</label>
            <input
              type="text"
              value={injuryData.name}
              onChange={(e) => setInjuryData({ ...injuryData, name: e.target.value })}
              placeholder="e.g. Anterior Knee Pain, L4-L5 disc compression"
              className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Pain Location</label>
              <select
                value={injuryData.location}
                onChange={(e) => setInjuryData({ ...injuryData, location: e.target.value })}
                className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200"
              >
                <option value="Knee" className="bg-[var(--bg-main)] text-[var(--text-main)]">Knee</option>
                <option value="Ankle" className="bg-[var(--bg-main)] text-[var(--text-main)]">Ankle</option>
                <option value="Hip" className="bg-[var(--bg-main)] text-[var(--text-main)]">Hip</option>
                <option value="Shoulder" className="bg-[var(--bg-main)] text-[var(--text-main)]">Shoulder</option>
                <option value="Elbow" className="bg-[var(--bg-main)] text-[var(--text-main)]">Elbow</option>
                <option value="Back" className="bg-[var(--bg-main)] text-[var(--text-main)]">Lower Back</option>
                <option value="Hamstring" className="bg-[var(--bg-main)] text-[var(--text-main)]">Hamstring</option>
                <option value="Calf" className="bg-[var(--bg-main)] text-[var(--text-main)]">Calf</option>
                <option value="Other" className="bg-[var(--bg-main)] text-[var(--text-main)]">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Pain Level ({injuryData.painLevel}/10)</label>
              <div className="flex items-center gap-3 py-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={injuryData.painLevel}
                  onChange={(e) => setInjuryData({ ...injuryData, painLevel: e.target.value })}
                  className="w-full accent-[var(--accent-primary)] cursor-pointer"
                />
                <span className="text-sm font-extrabold text-theme-primary w-5">{injuryData.painLevel}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Surgery History / Notes (Optional)</label>
            <input
              type="text"
              value={injuryData.surgeryHistory}
              onChange={(e) => setInjuryData({ ...injuryData, surgeryHistory: e.target.value })}
              placeholder="e.g. Scoped right knee 2024, no metal implants."
              className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200"
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 neu-button text-theme-muted hover:text-theme-main font-bold text-sm uppercase tracking-widest py-3.5 cursor-pointer"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 neu-blue-button font-black text-sm uppercase tracking-widest py-3.5 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Registering...' : 'Submit Profile'}
        </button>
      </div>
    </form>
  );
}

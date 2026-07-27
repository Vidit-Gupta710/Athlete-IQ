import React, { useState } from 'react';

export default function ProfileForm({ initialData, onNext }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    age: initialData.age || '',
    sport: initialData.sport || 'Football',
    level: initialData.level || 'Intermediate',
    trainingFrequency: initialData.trainingFrequency || '3-4 times a week',
    goals: initialData.goals || ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      newErrors.age = 'Age must be a positive number';
    }
    if (!formData.goals.trim()) newErrors.goals = 'Goals are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Alex Morgan"
          className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Age"
            className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200"
          />
          {errors.age && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Primary Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
            className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200"
          >
            <option value="Football" className="bg-[var(--bg-main)] text-[var(--text-main)]">Football</option>
            <option value="Basketball" className="bg-[var(--bg-main)] text-[var(--text-main)]">Basketball</option>
            <option value="Running" className="bg-[var(--bg-main)] text-[var(--text-main)]">Running</option>
            <option value="Weightlifting" className="bg-[var(--bg-main)] text-[var(--text-main)]">Weightlifting</option>
            <option value="Cycling" className="bg-[var(--bg-main)] text-[var(--text-main)]">Cycling</option>
            <option value="Swimming" className="bg-[var(--bg-main)] text-[var(--text-main)]">Swimming</option>
            <option value="Other" className="bg-[var(--bg-main)] text-[var(--text-main)]">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Playing Level</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200"
          >
            <option value="Recreational" className="bg-[var(--bg-main)] text-[var(--text-main)]">Recreational</option>
            <option value="Intermediate" className="bg-[var(--bg-main)] text-[var(--text-main)]">Intermediate</option>
            <option value="Competitive" className="bg-[var(--bg-main)] text-[var(--text-main)]">Competitive</option>
            <option value="Professional" className="bg-[var(--bg-main)] text-[var(--text-main)]">Professional</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Weekly Frequency</label>
          <select
            value={formData.trainingFrequency}
            onChange={(e) => setFormData({ ...formData, trainingFrequency: e.target.value })}
            className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200"
          >
            <option value="1-2 times a week" className="bg-[var(--bg-main)] text-[var(--text-main)]">1-2 times a week</option>
            <option value="3-4 times a week" className="bg-[var(--bg-main)] text-[var(--text-main)]">3-4 times a week</option>
            <option value="5+ times a week" className="bg-[var(--bg-main)] text-[var(--text-main)]">5+ times a week</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">Coaching & Recovery Goals</label>
        <textarea
          value={formData.goals}
          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
          placeholder="e.g. Build ankle stability post-sprain, improve hamstring capacity for sprints."
          rows="3"
          className="w-full neu-pressed px-4 py-3 text-theme-main font-semibold placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition duration-200 resize-none"
        />
        {errors.goals && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.goals}</p>}
      </div>

      <button
        type="submit"
        className="w-full neu-blue-button font-black text-sm uppercase tracking-widest py-3.5 mt-2 cursor-pointer"
      >
        Next Step
      </button>
    </form>
  );
}

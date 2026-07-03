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
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Alex Morgan"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
        />
        {errors.name && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Age"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
          />
          {errors.age && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Primary Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-205"
          >
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
            <option value="Running">Running</option>
            <option value="Weightlifting">Weightlifting</option>
            <option value="Cycling">Cycling</option>
            <option value="Swimming">Swimming</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Playing Level</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-205"
          >
            <option value="Recreational">Recreational</option>
            <option value="Competitive">Competitive</option>
            <option value="Professional">Professional</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Weekly Frequency</label>
          <select
            value={formData.trainingFrequency}
            onChange={(e) => setFormData({ ...formData, trainingFrequency: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-205"
          >
            <option value="1-2 times a week">1-2 times a week</option>
            <option value="3-4 times a week">3-4 times a week</option>
            <option value="5+ times a week">5+ times a week</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Coaching & Recovery Goals</label>
        <textarea
          value={formData.goals}
          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
          placeholder="e.g. Build ankle stability post-sprain, improve hamstring capacity for sprints."
          rows="3"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200 resize-none"
        />
        {errors.goals && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.goals}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm uppercase tracking-widest py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_12px_rgba(16,185,129,0.3)] mt-2"
      >
        Next Step
      </button>
    </form>
  );
}

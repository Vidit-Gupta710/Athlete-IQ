import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAthlete from '../hooks/useAthlete';
import StepIndicator from '../components/onboarding/StepIndicator';
import ProfileForm from '../components/onboarding/ProfileForm';
import InjuryForm from '../components/onboarding/InjuryForm';
import { createAthleteProfile } from '../api/athlete';
import { Activity, CheckCircle, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const { athleteId, loginAthlete, profile, loading, error, setLoading, setError } = useAthlete();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sport: 'Football',
    level: 'Intermediate',
    trainingFrequency: '3-4 times a week',
    goals: '',
    injuries: []
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || '',
        sport: profile.sport || 'Football',
        level: profile.level || 'Intermediate',
        trainingFrequency: profile.trainingFrequency || '3-4 times a week',
        goals: profile.goals || '',
        injuries: profile.injuries || []
      });
    }
  }, [profile]);

  const handleNext = (profileData) => {
    setFormData((prev) => ({ ...prev, ...profileData }));
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (injuries) => {
    const finalData = { ...formData, injuries };
    setFormData(finalData);
    setLoading(true);
    setError(null);

    try {
      const response = await createAthleteProfile(finalData);
      if (response && response.athlete_id) {
        loginAthlete(response.athlete_id, response.profile);
        navigate('/chat');
      } else {
        throw new Error('Onboarding failed: No athlete ID returned');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during onboarding profile compilation.');
    } finally {
      setLoading(false);
    }
  };

  if (athleteId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 animate-fade-in">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative text-center">
          {/* Glow behind container */}
          <div className="absolute -inset-0.5 -z-10 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-xl opacity-75"></div>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="h-6 w-6 text-emerald-400" />
            <span className="font-sans text-2xl font-black tracking-wider text-white">
              ATHLETE<span className="text-emerald-400">IQ</span>
            </span>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Onboarding Completed!</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
            Your athlete profile is active and fully configured. Your training data and recovery timeline are set up.
          </p>

          {profile && (
            <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-5 mb-8 text-left space-y-3">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Profile Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <span className="block text-xs text-slate-500">Name</span>
                  <span className="font-medium text-white">{profile.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">Age</span>
                  <span className="font-medium text-white">{profile.age} yrs</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">Sport & Level</span>
                  <span className="font-medium text-white">{profile.sport} ({profile.level})</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-500">Training Frequency</span>
                  <span className="font-medium text-white">{profile.trainingFrequency}</span>
                </div>
              </div>
              {profile.goals && (
                <div className="pt-2 border-t border-slate-800/40 text-sm text-slate-300">
                  <span className="block text-xs text-slate-500">Primary Goals</span>
                  <p className="mt-0.5 text-slate-300 italic">"{profile.goals}"</p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold rounded-xl transition duration-200 shadow-[0_4px_12px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700/60 transition duration-200 cursor-pointer"
            >
              Open Copilot
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 animate-fade-in">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative">
        {/* Glow behind container */}
        <div className="absolute -inset-0.5 -z-10 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-xl opacity-75"></div>
        
        <div className="flex items-center justify-center gap-2 mb-4 text-center">
          <Activity className="h-6 w-6 text-emerald-400" />
          <span className="font-sans text-2xl font-black tracking-wider text-white">
            ATHLETE<span className="text-emerald-400">IQ</span>
          </span>
        </div>
        
        <h2 className="text-center text-xl font-bold text-slate-100 mb-6">
          {step === 1 ? 'Configure Athlete Profile' : 'Injury & Pain Baseline'}
        </h2>
        
        <StepIndicator currentStep={step} />

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-900/50 bg-red-950/20 text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <ProfileForm initialData={formData} onNext={handleNext} />
        ) : (
          <InjuryForm 
            initialData={formData} 
            onBack={handleBack} 
            onSubmit={handleSubmit} 
            isLoading={loading} 
          />
        )}
      </div>
    </div>
  );
}

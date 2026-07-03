import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAthlete from '../hooks/useAthlete';
import StepIndicator from '../components/onboarding/StepIndicator';
import ProfileForm from '../components/onboarding/ProfileForm';
import InjuryForm from '../components/onboarding/InjuryForm';
import { createAthleteProfile } from '../api/athlete';
import { Activity } from 'lucide-react';

export default function OnboardingPage() {
  const { loginAthlete, profile, loading, error, setLoading, setError } = useAthlete();
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

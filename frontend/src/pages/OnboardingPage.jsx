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
        <div className="max-w-xl w-full neu-flat p-8 relative text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="h-6 w-6 text-theme-primary" />
            <span className="font-sans text-2xl font-black tracking-wider text-theme-heading">
              ATHLETE<span className="text-theme-primary">IQ</span>
            </span>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full neu-pressed text-theme-primary mb-6 shadow-[0_0_15px_var(--accent-primary-glow)]">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-theme-heading mb-2">Onboarding Completed!</h2>
          <p className="text-theme-muted text-sm max-w-sm mx-auto mb-8 font-medium">
            Your athlete profile is active and fully configured. Your training data and recovery timeline are set up.
          </p>

          {profile && (
            <div className="neu-pressed p-5 mb-8 text-left space-y-3">
              <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wider mb-2">Profile Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-theme-main">
                <div>
                  <span className="block text-xs text-theme-muted font-medium">Name</span>
                  <span className="font-bold text-theme-heading">{profile.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-theme-muted font-medium">Age</span>
                  <span className="font-bold text-theme-heading">{profile.age} yrs</span>
                </div>
                <div>
                  <span className="block text-xs text-theme-muted font-medium">Sport & Level</span>
                  <span className="font-bold text-theme-heading">{profile.sport} ({profile.level})</span>
                </div>
                <div>
                  <span className="block text-xs text-theme-muted font-medium">Training Frequency</span>
                  <span className="font-bold text-theme-heading">{profile.trainingFrequency}</span>
                </div>
              </div>
              {profile.goals && (
                <div className="pt-2 border-t border-[var(--border-subtle)] text-sm text-theme-main">
                  <span className="block text-xs text-theme-muted font-medium">Primary Goals</span>
                  <p className="mt-0.5 text-theme-main italic font-medium">"{profile.goals}"</p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="neu-blue-button px-6 py-3 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="neu-button px-6 py-3 text-theme-main hover:text-theme-primary font-bold text-sm uppercase tracking-wider cursor-pointer"
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
      <div className="max-w-xl w-full neu-flat p-8 relative">
        <div className="flex items-center justify-center gap-2 mb-4 text-center">
          <Activity className="h-6 w-6 text-theme-primary" />
          <span className="font-sans text-2xl font-black tracking-wider text-theme-heading">
            ATHLETE<span className="text-theme-primary">IQ</span>
          </span>
        </div>
        
        <h2 className="text-center text-xl font-bold text-theme-heading mb-6">
          {step === 1 ? 'Configure Athlete Profile' : 'Injury & Pain Baseline'}
        </h2>
        
        <StepIndicator currentStep={step} />

        {error && (
          <div className="mb-6 p-4 neu-pressed text-red-500 text-sm font-bold text-center">
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

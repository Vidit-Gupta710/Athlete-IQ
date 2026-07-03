import React, { createContext, useState } from 'react';

export const AthleteContext = createContext();

export function AthleteProvider({ children }) {
  const [athleteId, setAthleteId] = useState(() => localStorage.getItem('athleteId') || null);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('athleteProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginAthlete = (id, athleteProfile) => {
    setAthleteId(id);
    setProfile(athleteProfile);
    localStorage.setItem('athleteId', id);
    localStorage.setItem('athleteProfile', JSON.stringify(athleteProfile));
  };

  const logoutAthlete = () => {
    setAthleteId(null);
    setProfile(null);
    localStorage.removeItem('athleteId');
    localStorage.removeItem('athleteProfile');
  };

  return (
    <AthleteContext.Provider 
      value={{ 
        athleteId, 
        profile, 
        loading, 
        error, 
        setAthleteId,
        setProfile,
        setLoading,
        setError,
        loginAthlete, 
        logoutAthlete 
      }}
    >
      {children}
    </AthleteContext.Provider>
  );
}

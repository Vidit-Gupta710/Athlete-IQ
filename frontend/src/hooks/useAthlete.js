import { useContext } from 'react';
import { AthleteContext } from '../context/AthleteContext';

export default function useAthlete() {
  const context = useContext(AthleteContext);
  if (!context) {
    throw new Error('useAthlete must be used within an AthleteProvider');
  }
  return context;
}

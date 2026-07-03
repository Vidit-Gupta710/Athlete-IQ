import { apiClient } from './client';

export const createAthleteProfile = async (profileData) => {
  return apiClient.post('/athlete/profile', profileData);
};

export const getAthleteDashboard = async (athleteId) => {
  return apiClient.get(`/athlete/${athleteId}/dashboard`);
};

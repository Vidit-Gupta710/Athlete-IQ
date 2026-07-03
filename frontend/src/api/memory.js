import { apiClient } from './client';

export const getAthleteTimeline = async (athleteId) => {
  return apiClient.get(`/athlete/${athleteId}/timeline`);
};

export const getAthleteGraph = async (athleteId) => {
  return apiClient.get(`/athlete/${athleteId}/graph`);
};

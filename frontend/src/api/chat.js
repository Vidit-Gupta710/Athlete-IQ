import { apiClient } from './client';

export const sendChatMessage = async (athleteId, message) => {
  return apiClient.post('/chat', { athleteId, message });
};

import { v4 as uuidv4 } from 'uuid';

// Client ID management
export const getClientId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let clientId = localStorage.getItem('polls-client-id');
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem('polls-client-id', clientId);
  }
  return clientId;
};

// Generate unique poll ID
export const generatePollId = (): string => {
  return uuidv4();
};

// Calculate percentage
export const calculatePercentage = (count: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
};

// Format timestamp
export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}; 
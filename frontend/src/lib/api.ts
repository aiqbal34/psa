import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface PollOption {
  id: number;
  text: string;
  votes?: number;
}

export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  total_votes: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePollData {
  question: string;
  options: { text: string }[];
}

export interface VoteData {
  optionId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

// API functions
export const pollsApi = {
  // Get all polls
  getPolls: async (): Promise<Poll[]> => {
    try {
      const response = await api.get<ApiResponse<Poll[]>>('/api/polls');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      throw error;
    }
  },

  // Get specific poll with results
  getPoll: async (id: number): Promise<Poll> => {
    try {
      const response = await api.get<ApiResponse<Poll>>(`/api/polls/${id}`);
      if (!response.data.data) {
        throw new Error('Poll not found');
      }
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch poll ${id}:`, error);
      throw error;
    }
  },

  // Create a new poll
  createPoll: async (pollData: CreatePollData): Promise<Poll> => {
    try {
      const response = await api.post<ApiResponse<Poll>>('/api/polls', pollData);
      if (!response.data.data) {
        throw new Error('Failed to create poll');
      }
      return response.data.data;
    } catch (error) {
      console.error('Failed to create poll:', error);
      throw error;
    }
  },

  // Update a poll
  updatePoll: async (id: number, pollData: CreatePollData): Promise<Poll> => {
    try {
      const response = await api.put<ApiResponse<Poll>>(`/api/polls/${id}`, pollData);
      if (!response.data.data) {
        throw new Error('Failed to update poll');
      }
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update poll ${id}:`, error);
      throw error;
    }
  },

  // Vote on a poll
  vote: async (pollId: number, voteData: VoteData): Promise<{ options: PollOption[]; total_votes: number }> => {
    try {
      const response = await api.post<ApiResponse<{ options: PollOption[]; total_votes: number }>>(
        `/api/polls/${pollId}/vote`, 
        voteData
      );
      if (!response.data.data) {
        throw new Error('Failed to record vote');
      }
      return response.data.data;
    } catch (error) {
      console.error(`Failed to vote on poll ${pollId}:`, error);
      throw error;
    }
  },

  // Delete a poll
  deletePoll: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/polls/${id}`);
    } catch (error) {
      console.error(`Failed to delete poll ${id}:`, error);
      throw error;
    }
  },
};

export default api;
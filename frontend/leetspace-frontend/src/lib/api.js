// src/lib/api.js

import axios from 'axios';
import { auth } from './firebase';
import { demoApi } from './demoApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lightweight accessor for demo flag without importing React context in this module
const isDemoMode = () => {
  try {
    return sessionStorage.getItem('leetspace_demo_mode') === '1';
  } catch {
    return false;
  }
};

// Function to get Firebase ID token
export const getIdToken = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    const idToken = await user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('❌ Error getting ID token:', error);
    throw new Error('Failed to get authentication token');
  }
};

// Request interceptor to add Firebase ID token to all requests (skip in demo)
api.interceptors.request.use(
  async (config) => {
    if (isDemoMode()) {
      // Do not attach auth headers in demo; endpoints are public (or bypassed)
      return config;
    }
    try {
      const idToken = await getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    } catch (error) {
      console.error('❌ Failed to add auth token:', error);
      // Throw error to prevent request from proceeding without auth
      throw new Error('Authentication required but no valid token available');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isDemoMode()) {
      // Token might be expired, try to refresh
      try {
        const user = auth.currentUser;
        if (user) {
          const newToken = await user.getIdToken(true); // Force refresh
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config); // Retry the request
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login or handle as needed
      }
    }
    return Promise.reject(error);
  }
);

// API functions for problems
export const problemsAPI = {
  // Get all problems for authenticated user or demo
  getProblems: (params = {}) => {
    if (isDemoMode()) {
      return demoApi.getProblems(params);
    }
    // Remove user_id from params since it's handled by auth
    const { user_id, ...cleanParams } = params;
    return api.get('/api/problems', { params: cleanParams });
  },

  // Create a new problem (blocked in demo)
  createProblem: (problemData) => {
    if (isDemoMode()) {
      return Promise.reject(new Error('Demo mode: create disabled'));
    }
    const { user_id, ...cleanData } = problemData;
    return api.post('/api/problems', cleanData);
  },

  // Get a specific problem (demo uses local set)
  getProblem: (id) => {
    if (isDemoMode()) return demoApi.getProblem(id);
    return api.get(`/api/problems/${id}`);
  },

  // Update a problem (blocked in demo)
  updateProblem: (id, updateData) => {
    if (isDemoMode()) {
      return Promise.reject(new Error('Demo mode: update disabled'));
    }
    const { user_id, ...cleanData } = updateData;
    return api.put(`/api/problems/${id}`, cleanData);
  },

  // Delete a problem (blocked in demo)
  deleteProblem: (id) => {
    if (isDemoMode()) {
      return Promise.reject(new Error('Demo mode: delete disabled'));
    }
    return api.delete(`/api/problems/${id}`);
  },

  // Get user statistics (not used in demo)
  getStats: () => api.get('/api/problems/stats'),
};

// API functions for analytics
export const analyticsAPI = {
  // Get dashboard data for authenticated user or demo
  getDashboard: () => {
    if (isDemoMode()) {
      return demoApi.getDashboard();
    }
    return api.get('/api/analytics/dashboard');
  },

  // Get spaced repetition statistics
  getSpacedRepetitionStats: () => {
    if (isDemoMode()) {
      // Return demo data for spaced repetition stats
      return Promise.resolve({
        data: {
          total_problems: 0,
          problems_with_sr: 0,
          todays_revisions: 0,
          overdue_revisions: 0,
          average_easiness: 0,
          total_reviews: 0,
          recent_reviews: []
        }
      });
    }
    return api.get('/api/analytics/spaced-repetition');
  },

  // Lock today's revision on the server (no-op in demo)
  lockToday: (body) => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { locked: true, date: new Date().toISOString().slice(0, 10) } });
    }
    return api.post('/api/analytics/lock-today', body || {});
  },

  // Unlock today's revision on the server (no-op in demo)
  unlockToday: () => {
    if (isDemoMode()) {
      return Promise.resolve({ data: { locked: false, date: new Date().toISOString().slice(0, 10) } });
    }
    return api.post('/api/analytics/unlock-today');
  },
};

// Export the configured axios instance for custom requests
export default api;
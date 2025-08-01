const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async authenticatedRequest(endpoint, options = {}, getToken) {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      return await this.request(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Token might be expired, try to refresh and retry once
        try {
          const newToken = await getToken();
          if (newToken) {
            return await this.request(endpoint, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
              },
            });
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      throw error;
    }
  }

  // Authentication endpoints
  async registerUser(userData, getToken) {
    return await this.authenticatedRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, getToken);
  }

  async getCurrentUser(getToken) {
    return await this.authenticatedRequest('/api/auth/me', {}, getToken);
  }

  async updateCurrentUser(userData, getToken) {
    return await this.authenticatedRequest('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }, getToken);
  }

  async deleteCurrentUser(getToken) {
    return await this.authenticatedRequest('/api/auth/me', {
      method: 'DELETE',
    }, getToken);
  }

  // Problems endpoints
  async getProblems(filters = {}, getToken) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });

    const endpoint = `/api/problems?${queryParams.toString()}`;
    return await this.authenticatedRequest(endpoint, {}, getToken);
  }

  async getProblem(id, getToken) {
    return await this.authenticatedRequest(`/api/problems/${id}`, {}, getToken);
  }

  async createProblem(problemData, getToken) {
    return await this.authenticatedRequest('/api/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    }, getToken);
  }

  async updateProblem(id, problemData, getToken) {
    return await this.authenticatedRequest(`/api/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(problemData),
    }, getToken);
  }

  async deleteProblem(id, getToken) {
    return await this.authenticatedRequest(`/api/problems/${id}`, {
      method: 'DELETE',
    }, getToken);
  }

  async getProblemsStats(getToken) {
    return await this.authenticatedRequest('/api/problems/stats', {}, getToken);
  }

  // Analytics endpoints
  async getDashboardStats(getToken) {
    return await this.authenticatedRequest('/api/analytics/dashboard', {}, getToken);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Convenience function for use with auth hook
export const createAuthenticatedApi = (getToken) => ({
  // Auth
  registerUser: (userData) => apiClient.registerUser(userData, getToken),
  getCurrentUser: () => apiClient.getCurrentUser(getToken),
  updateCurrentUser: (userData) => apiClient.updateCurrentUser(userData, getToken),
  deleteCurrentUser: () => apiClient.deleteCurrentUser(getToken),

  // Problems
  getProblems: (filters) => apiClient.getProblems(filters, getToken),
  getProblem: (id) => apiClient.getProblem(id, getToken),
  createProblem: (problemData) => apiClient.createProblem(problemData, getToken),
  updateProblem: (id, problemData) => apiClient.updateProblem(id, problemData, getToken),
  deleteProblem: (id) => apiClient.deleteProblem(id, getToken),
  getProblemsStats: () => apiClient.getProblemsStats(getToken),

  // Analytics
  getDashboardStats: () => apiClient.getDashboardStats(getToken),
});
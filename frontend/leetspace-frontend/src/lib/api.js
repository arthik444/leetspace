// API service for backend communication
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    let url = `${this.baseURL}${endpoint}`;
    
    // Handle query parameters
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };
    
    // Remove params from config as it's already handled in URL
    delete config.params;

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login/json', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  // Analytics endpoints
  async getDashboardData() {
    return this.request('/analytics/dashboard', {
      method: 'GET'
    });
  }

  // Problems endpoints  
  async getProblems(params = {}) {
    // Remove user_id from params since backend gets it from auth token
    const { user_id, ...filteredParams } = params;
    return this.request('/problems', {
      method: 'GET',
      params: filteredParams
      });
  }

  async getProblem(id) {
    return this.request(`/problems/${id}`);
  }

  async createProblem(problemData) {
    return this.request('/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async updateProblem(id, problemData) {
    return this.request(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(problemData),
    });
  }

  async deleteProblem(id) {
    return this.request(`/problems/${id}`, {
      method: 'DELETE',
    });
  }

  async getProblemStats() {
    return this.request('/problems/stats', {
      method: 'GET'
    });
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get stored token
  getToken() {
    return this.token;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
// API service for backend communication
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.refreshPromise = null; // Prevent multiple refresh attempts
  }

  // Set authentication tokens
  setToken(accessToken, refreshToken = null) {
    this.token = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    } else {
      localStorage.removeItem('access_token');
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    } else if (refreshToken === null) {
      localStorage.removeItem('refresh_token');
    }
  }

  // Clear all tokens
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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

    // Refresh access token
    async refreshAccessToken() {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }
  
      // Prevent multiple refresh attempts
      if (this.refreshPromise) {
        return this.refreshPromise;
      }
  
      this.refreshPromise = fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken
        })
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        this.setToken(data.access_token, data.refresh_token);
        return data;
      }).finally(() => {
        this.refreshPromise = null;
      });
  
      return this.refreshPromise;
    }
  
    // Generic request method with automatic token refresh
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

    const makeRequest = async (retryCount = 0) => {
      const config = {
        headers: this.getAuthHeaders(),
        ...options,
      };
      
      // Remove params from config as it's already handled in URL
      delete config.params;

      try {
        const response = await fetch(url, config);
        
        // Handle token expiration (401 Unauthorized)
        if (response.status === 401 && retryCount === 0 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request with new token
            return makeRequest(1);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            window.location.href = '/auth';
            throw new Error('Session expired. Please log in again.');
          }
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Create error with additional data for conflict scenarios
          const error = new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          error.status = response.status;
          error.data = errorData;  // ← This preserves the conflicts array!
          
          throw error;
        }
        
        return await response.json();
      } catch (error) {
        if (error.message.includes('Session expired')) {
          throw error;
        }
        console.error('API request failed:', error);
        throw error;
      }
    };

    return makeRequest();
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
      this.setToken(response.access_token,response.refresh_token);
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
    try {
      // Call backend logout to blacklist the token
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    }
    
    this.clearTokens();
    return { success: true };
  }

  async logoutAllDevices() {
    try {
      await this.request('/auth/logout-all', {
        method: 'POST'
      });
      this.clearTokens();
      return { success: true };
    } catch (error) {
      console.error('Logout all devices failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  // Profile management
  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async deleteAccount() {
    const response = await this.request('/auth/account', {
      method: 'DELETE',
    });
    this.clearTokens();
    return response;
  }

  // Password reset
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        new_password: newPassword
      }),
    });
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

  // Get refresh token
  getRefreshToken() {
    return this.refreshToken;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
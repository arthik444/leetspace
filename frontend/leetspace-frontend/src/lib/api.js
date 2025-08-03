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
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

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
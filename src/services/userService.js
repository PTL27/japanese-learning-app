// API service for user management
class UserService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    this.token = localStorage.getItem('jwt_token');
  }

  // Set authorization header
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // Store token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      localStorage.removeItem('jwt_token');
    }
  }

  // Get current logged in user
  async getCurrentUser() {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse(response);
      return data.user;
    } catch (error) {
      // If token is invalid, clear it
      this.setToken(null);
      throw error;
    }
  }

  // User signup
  async signup(userData) {
    const { name, email, password, age, phone, address, japaneseLevel } = userData;
    
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password,
        age,
        phone,
        address,
        japaneseLevel: japaneseLevel || 'N5'
      })
    });

    const data = await this.handleResponse(response);
    
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    
    return data.user;
  }

  // User login
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Vui lòng điền đầy đủ email và mật khẩu');
    }

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await this.handleResponse(response);
    
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    
    return data.user;
  }

  // User logout
  async logout() {
    this.setToken(null);
    // Clear any other local data if needed
    localStorage.removeItem('japanese_app_current_user');
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    });

    const data = await this.handleResponse(response);
    return data.user;
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw new Error('Vui lòng điền đầy đủ mật khẩu cũ và mật khẩu mới');
    }

    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const response = await fetch(`${this.baseURL}/users/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        currentPassword: oldPassword,
        newPassword: newPassword
      })
    });

    await this.handleResponse(response);
  }

  // Forgot password - Step 1: Request reset token
  async forgotPassword(email) {
    const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await this.handleResponse(response);
    
    // In development, return the reset token for demo purposes
    if (process.env.NODE_ENV === 'development' && data.resetToken) {
      return { resetToken: data.resetToken };
    }
    
    return data;
  }

  // Reset password with token - Step 2: Reset with token
  async resetPassword(email, token, newPassword) {
    if (!email || !token || !newPassword) {
      throw new Error('Vui lòng điền đầy đủ thông tin');
    }

    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const response = await fetch(`${this.baseURL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        token,
        newPassword
      })
    });

    await this.handleResponse(response);
  }

  // Get user progress
  async getUserProgress(category = null) {
    const url = category 
      ? `${this.baseURL}/users/progress?category=${encodeURIComponent(category)}`
      : `${this.baseURL}/users/progress`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    const data = await this.handleResponse(response);
    return data.progress;
  }

  // Update user progress
  async updateProgress(category, itemId, progressData) {
    const response = await fetch(`${this.baseURL}/users/progress`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        category,
        itemId,
        ...progressData
      })
    });

    await this.handleResponse(response);
  }

  // Get user stats
  async getUserStats() {
    const response = await fetch(`${this.baseURL}/users/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    const data = await this.handleResponse(response);
    return data.stats;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/api/health`, {
        method: 'GET'
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw new Error('Không thể kết nối đến server');
    }
  }

  // Initialize service (check if user is logged in)
  async initialize() {
    if (!this.token) {
      return null;
    }

    try {
      return await this.getCurrentUser();
    } catch (error) {
      // Token might be invalid, clear it
      this.setToken(null);
      return null;
    }
  }
}

// Create and export singleton instance
export const userService = new UserService();
import axios from 'axios';

// API Base URL - Vercel deployment (default)
// Use .env file to override if needed
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://loan-link-server-ten.vercel.app';

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to Authorization header if available (fallback for cross-origin cookie issues)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors - especially 401 (token expiration)
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      
      // Don't clear token for /api/auth/me endpoint - let AuthContext handle it
      // This prevents infinite loops during initial auth check
      if (!requestUrl.includes('/api/auth/me')) {
        // Token expired or invalid - clear it
        localStorage.removeItem('token');
        
        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('tokenExpired'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;


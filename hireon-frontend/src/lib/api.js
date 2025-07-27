import axios from 'axios';

// Check for localStorage override first, then environment variable, then default
// Updated for production deployment - force rebuild
const API_BASE_URL = localStorage.getItem('API_OVERRIDE') || 
                     import.meta.env.VITE_API_BASE_URL || 
                     'https://hireon-aiel.onrender.com';

console.log('API Base URL:', API_BASE_URL); // Debug log
console.log('Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL); // Debug environment variable
console.log('Current domain:', window.location.hostname); // Debug current domain

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  googleLogin: async (idToken) => {
    const response = await api.post('/api/auth/google', { idToken });
    return response.data;
  },

  validateToken: async (token) => {
    const response = await api.post('/api/auth/validate-token', { token });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
  },

  checkSubscription: async () => {
    const response = await api.post('/api/auth/check-subscription');
    return response.data;
  },

  getSubscriptionStatus: async () => {
    const response = await api.get('/api/user/subscription-status');
    return response.data;
  },

  checkTrialEligibility: async () => {
    const response = await api.get('/api/auth/trial-eligibility');
    return response.data;
  },
};

// Payment API functions
export const paymentAPI = {
  createOrder: async (orderData) => {
    const response = await api.post('/api/razorpay/create-order', orderData);
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await api.post('/api/razorpay/verify-payment', paymentData);
    return response.data;
  },

  legacyVerifyPayment: async (paymentData) => {
    const response = await api.post('/api/verify-payment', paymentData);
    return response.data;
  },
};

// Deep Link API functions
export const deepLinkAPI = {
  generateDeepLink: async () => {
    const response = await api.post('/api/generate-deep-link');
    return response.data;
  },

  validateElectronToken: async (token) => {
    const response = await api.post('/api/validate-electron-token', { token });
    return response.data;
  },

  generateTokenFile: async () => {
    const response = await api.post('/api/generate-token-file');
    return response.data;
  },
};

// Utility functions
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Export the api instance for direct use
export { api };

export default api;


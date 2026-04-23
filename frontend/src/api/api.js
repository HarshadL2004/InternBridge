import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
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

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * ATS Resume Analysis API Functions
 */

// Upload and analyze resume
export const uploadResume = async (file, token) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await api.post('/api/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });

  return response;
};

// Get user's resume analysis history
export const getHistory = async (token) => {
  const response = await api.get('/api/resume/history', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response;
};

// Get specific resume analysis
export const getResume = async (id, token) => {
  const response = await api.get(`/api/resume/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response;
};

// Delete resume analysis
export const deleteResume = async (id, token) => {
  const response = await api.delete(`/api/resume/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response;
};

export default api;
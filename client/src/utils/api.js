// utils/api.js
import axios from 'axios';

/**
 * Resolve API base URL with multiple fallback options
 * Priority order:
 * 1. LocalStorage override (runtime)
 * 2. VITE_API_BASE_URL (Vite environment variable)
 * 3. /api proxy in development (Vite dev server)
 * 4. Default to localhost:5000/api
 */
const getApiBaseUrl = () => {
  const localStorageUrl = localStorage.getItem('VITE_API_BASE_URL');
  const viteUrl = import.meta.env.VITE_API_BASE_URL;
  const proxyUrl = import.meta.env.DEV ? '/api' : null;
  const defaultUrl = import.meta.env.VITE_API_BASE_URL;

  return localStorageUrl || viteUrl || proxyUrl || defaultUrl;
};

// Current base URL
let currentBaseUrl = getApiBaseUrl();

// Axios instance
const api = axios.create({
  baseURL: currentBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: attach token if available
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: handle network errors & 401
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      console.error('Network error - backend may be offline');
      return Promise.reject(
        new Error('Network connection failed. Is the backend running?')
      );
    }

    // Unauthorized - Token expired or invalid
    if (error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      // Only auto-logout if we're not already on login/register pages
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        console.warn('Session expired - logging out');
        localStorage.removeItem('token');
        
        // SPA-safe redirect
        if (window?.history?.pushState) {
          window.history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
          window.location.href = '/login';
        }
      }
    }

    // Don't try to extract error message from blob responses
    // Blob responses can't have their data read as text
    if (error.response?.data instanceof Blob) {
      console.error(`Request failed with status ${error.response.status}`);
      return Promise.reject(error);
    }

    // Only try to extract detailed error message if response is a regular object
    if (error.response?.data && typeof error.response.data === 'object' && !(error.response.data instanceof Blob)) {
      const errorMsg = error.response.data.message || error.response.data.error;
      if (errorMsg) {
        console.error(`API Error: ${errorMsg}`);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Dynamically update API base URL at runtime
 */
export const setApiBaseUrl = (url) => {
  if (url) {
    localStorage.setItem('VITE_API_BASE_URL', url);
    currentBaseUrl = url;
    api.defaults.baseURL = url;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(`[API] Base URL updated to: ${url}`);
    }
  } else {
    localStorage.removeItem('VITE_API_BASE_URL');
    currentBaseUrl = getApiBaseUrl();
    api.defaults.baseURL = currentBaseUrl;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[API] Base URL reset to default.');
    }
  }
};

/**
 * Get current API base URL
 */
export const getCurrentApiBaseUrl = () => currentBaseUrl;

/**
 * Test API connection
 */
export const testApiConnection = async (endpoint = '/auth/verify') => {
  try {
    const response = await api.get(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Debug utilities in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(`[API] Using base URL: ${currentBaseUrl}`);
  window.apiConfig = {
    api,
    setApiBaseUrl,
    getCurrentApiBaseUrl,
    testApiConnection,
  };
}

export default api;

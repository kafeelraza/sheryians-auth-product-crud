import axios from 'axios';

// Base API Axios Instance
export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial: automatically transmits httpOnly refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Memory store for short-lived access token
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request Interceptor: Attach Access Token to Authorization Header
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamless Auto-Refresh on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh token endpoint itself returns 401/403 or login/register fails
    const isAuthEndpoint =
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue pending requests while refresh token is being resolved
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request a new access token from the backend refresh-token endpoint
        const response = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        const newAccessToken = response.data?.data?.accessToken;

        setAccessToken(newAccessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        setAccessToken(null);

        // Optionally dispatch an event or callback for session expiry
        window.dispatchEvent(new CustomEvent('auth:session_expired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

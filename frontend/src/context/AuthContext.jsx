import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setAccessToken, getAccessToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state on initial app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Attempt to refresh access token using httpOnly cookie
        const refreshRes = await apiClient.post('/auth/refresh-token');
        if (refreshRes.data?.data?.accessToken) {
          setAccessToken(refreshRes.data.data.accessToken);

          // Fetch logged in user profile
          const userRes = await apiClient.get('/auth/me');
          setUser(userRes.data?.data?.user || null);
        }
      } catch (err) {
        // Not logged in or refresh token expired
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for session expiry from axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired);
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data.data;
      setAccessToken(accessToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

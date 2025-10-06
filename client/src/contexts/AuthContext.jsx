import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/verify');
          if (response.data.valid) {
            const profileResponse = await api.get('/auth/profile');
            // Ensure we use the backend user data to prevent department mismatch
            setUser(profileResponse.data.user);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Only remove token if it's actually expired/invalid (401)
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      await api.put('/auth/profile', profileData);
      
      // Refresh user data
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
      
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const checkIn = async (location, notes) => {
    try {
      const response = await api.post('/auth/checkin', { location, notes });
      toast.success('Checked in successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Check-in failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const checkOut = async (notes) => {
    try {
      const response = await api.post('/auth/checkout', { notes });
      toast.success('Checked out successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Check-out failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const getTodayAttendance = async () => {
    try {
      const response = await api.get('/auth/attendance/today');
      return { success: true, data: response.data.attendance };
    } catch (error) {
      console.error('Attendance fetch error:', error);
      return { success: false, message: 'Failed to fetch attendance' };
    }
  };

  const permissionKeySet = useMemo(() => {
    if (!user?.permissions) return new Set();
    return new Set(user.permissions.map((permission) => `${permission.module}:${permission.action}:${permission.resource}`));
  }, [user?.permissions]);

  const hasPermission = useCallback((module, action, resource) => {
    if (!user) return false;

    if (user.role && user.role.level >= 5) return true;

    return permissionKeySet.has(`${module}:${action}:${resource}`);
  }, [permissionKeySet, user]);

  const hasAnyPermission = useCallback((permTriples) => {
    if (!Array.isArray(permTriples)) {
      console.warn('hasAnyPermission expects an array of permission triples');
      return false;
    }

    if (!user) return false;
    if (user.role && user.role.level >= 5) return true;

    return permTriples.some(([module, action, resource]) => permissionKeySet.has(`${module}:${action}:${resource}`));
  }, [permissionKeySet, user]);

  // Check if user can access department
  const canAccessDepartment = useCallback((department) => {
    if (!user) return false;
    
    // Admin can access all departments
    if (user.role && user.role.level >= 4) return true;
    
    // Users can access their own department
    return user.department === department;
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    checkIn,
    checkOut,
    getTodayAttendance,
    hasPermission,
    hasAnyPermission,
    canAccessDepartment
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
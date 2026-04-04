import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await api.get('/auth/user'); 
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Login failed' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      
      if (res.data.user) {
        setUser(res.data.user);
      }

      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout failed", err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your connection.';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please check your connection.';
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      setUser(null);
    } catch (error) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        // Silent fail
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


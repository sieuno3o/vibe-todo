import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch latest user data to ensure token is valid and data is fresh (e.g. createdAt)
          const latestUser = await authApi.getMe();
          setUser(latestUser);
          localStorage.setItem('user', JSON.stringify(latestUser));
        } catch {
          // Token invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const result = await authApi.register(username, email, password);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

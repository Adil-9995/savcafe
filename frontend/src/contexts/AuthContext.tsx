import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Shop Owner' | 'Manager' | 'Cashier' | 'Staff';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('savora_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const storedToken = localStorage.getItem('savora_token');
      if (storedToken) {
        try {
          const fetchedUser = await api.getCurrentUser();
          setUser(fetchedUser);
        } catch (err) {
          console.error('Session validation failed:', err);
          // Token expired or invalid
          localStorage.removeItem('savora_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await api.login(credentials);
      localStorage.setItem('savora_token', response.token);
      setToken(response.token);
      setUser(response.user);
      setLoading(false);
      return response.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('savora_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

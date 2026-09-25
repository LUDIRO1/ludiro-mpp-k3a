import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/shipping.ts';
import { api, setAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: (roleKey: 'admin' | 'armada' | 'logistik') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure in-memory session (No localStorage is used as requested)
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setAuthToken(null);
      setIsLoading(false);
    }
  };

  const demoLogin = async (roleKey: 'admin' | 'armada' | 'logistik') => {
    const creds = {
      admin: { u: 'admin', p: 'admin123' },
      armada: { u: 'armada', p: 'armada123' },
      logistik: { u: 'logistik', p: 'logistik123' }
    }[roleKey];

    await login(creds.u, creds.p);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, demoLogin }}>
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

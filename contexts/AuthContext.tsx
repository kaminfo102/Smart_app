import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  updateUserPoints: (points: number) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await authService.login(username, password);
      setUser(loggedInUser);
      localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; username: string; password: string; firstName?: string; lastName?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data);
      // Optional: Auto login after register
      // await login(data.username, data.password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
        const updatedUser = await authService.updateProfile(user, data);
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    } catch (err: any) {
        setError(err.message);
        throw err;
    } finally {
        setIsLoading(false);
    }
  };

  const updateUserPoints = async (additionalPoints: number) => {
    if (!user) return;
    // Do not set global loading for points to keep UI responsive
    try {
        const newTotal = (user.points || 0) + additionalPoints;
        const updatedUser = await authService.updateUserPoints(user, newTotal);
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    } catch (err) {
        console.error("Error updating points context", err);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUserProfile, updateUserPoints, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
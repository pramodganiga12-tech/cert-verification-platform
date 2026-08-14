import React, { createContext, useContext, useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'ISSUER' | 'REVOKER' | 'VERIFIER' | 'STUDENT' | string;
  institutionId?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: UserProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('cert_user');
      if (!savedUser || savedUser === 'undefined' || savedUser === 'null') {
        return null;
      }
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('cert_user');
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      const savedToken = localStorage.getItem('cert_access_token');
      if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
        return null;
      }
      return savedToken;
    } catch {
      localStorage.removeItem('cert_access_token');
      return null;
    }
  });

  const login = (accessToken: string, refreshToken: string, userData: UserProfile) => {
    if (!accessToken || !userData) return;
    setToken(accessToken);
    setUser(userData);
    try {
      localStorage.setItem('cert_access_token', accessToken);
      if (refreshToken) localStorage.setItem('cert_refresh_token', refreshToken);
      localStorage.setItem('cert_user', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to persist auth token', err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('cert_access_token');
      localStorage.removeItem('cert_refresh_token');
      localStorage.removeItem('cert_user');
    } catch {
      // Ignore storage clear errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
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

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'vltrn-token'; // Standardize the key

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be inside an AuthProvider');
  }
  return ctx;
}
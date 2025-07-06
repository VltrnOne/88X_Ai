// ~/vltrn-system/frontend/command-deck/src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

const TOKEN_KEY = 'vltrn-token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  function login(newToken) {
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
  }

  function logout() {
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

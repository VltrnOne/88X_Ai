import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize state by trying to read the token from localStorage first.
  const [token, setToken] = useState(localStorage.getItem('vltrn-token'));

  // This effect runs whenever the token state changes.
  useEffect(() => {
    if (token) {
      // If a token exists, store it.
      localStorage.setItem('vltrn-token', token);
    } else {
      // If the token is null (e.g., after logout), remove it.
      localStorage.removeItem('vltrn-token');
    }
  }, [token]);

  // The login function now just needs to set the state.
  // The useEffect hook will handle saving it to localStorage.
  const login = (newToken) => {
    setToken(newToken);
  };

  // The logout function now just needs to clear the state.
  const logout = () => {
    setToken(null);
  };

  const value = { token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
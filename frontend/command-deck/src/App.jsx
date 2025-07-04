import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage      from './components/LoginPage';
import DashboardPage  from './components/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />

      {/* anything else goes home */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Import ProtectedRoute
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* V-- This is the crucial change --V */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
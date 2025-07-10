import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './components/DashboardPage';

function App() {
  return (
    <Routes>
      {/* The Dashboard is now the main route at the root path */}
      <Route path="/" element={<DashboardPage />} />

      {/* Redirect any other unknown path to the main dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
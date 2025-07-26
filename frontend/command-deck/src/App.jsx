import React from 'react';
import VLTRNCanvas from './components/VLTRNCanvas';

// --- Main App Component ---
export default function App() {
  return (
    <div className="app-container bg-primary min-h-screen">
      <div className="container py-8">
        <VLTRNCanvas />
      </div>
    </div>
  );
}
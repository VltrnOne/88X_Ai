// src/App.jsx - With Routing
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SolutionDeck from './components/SolutionDeck';
import MissionDashboard from './components/MissionDashboard';
import MissionDetail from './components/MissionDetail'; // Import the new component
import './App.css';

function Home() {
  return (
    <>
      <SolutionDeck />
      <hr />
      <MissionDashboard />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1><Link to="/">VLTRN Mission Control</Link></h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/missions/:missionId" element={<MissionDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
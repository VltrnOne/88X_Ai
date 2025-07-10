// /Users/Morpheous/vltrn-system/frontend/command-deck/src/App.jsx

import React from 'react';
import SolutionDeck from './components/SolutionDeck';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>VLTRN Mission Control</h1>
      </header>
      <main>
        <SolutionDeck />
      </main>
    </div>
  );
}

export default App;
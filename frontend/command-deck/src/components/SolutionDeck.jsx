// /Users/Morpheous/vltrn-system/frontend/command-deck/src/components/SolutionDeck.jsx
import React, { useState } from 'react';
import axios from 'axios';

function SolutionDeck() {
  const [prompt, setPrompt] = useState('');
  const [missionPlan, setMissionPlan] = useState(null);
  const [executionStatus, setExecutionStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParseIntent = async () => {
    if (!prompt) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMissionPlan(null);
    setExecutionStatus('');

    try {
      const response = await axios.post('http://localhost:4000/api/missions/parse', {
        prompt: prompt,
      });
      setMissionPlan(response.data);
    } catch (err) {
      setError('Failed to connect to the Intent Parser service.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteMission = async () => {
    if (!missionPlan) {
      setError('No mission plan to execute.');
      return;
    }
    setIsLoading(true);
    setError('');
    setExecutionStatus('Executing mission...');

    try {
      // This calls the new endpoint on our unified intent-parser/orchestrator service
      await axios.post('http://localhost:4000/api/missions/execute', missionPlan);
      setExecutionStatus('Mission execution started successfully. Check container logs for progress.');
    } catch (err) {
      setError('Failed to send execution request to the Orchestrator.');
      console.error(err);
      setExecutionStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="solution-deck">
      <h2>VLTRN Solution Deck</h2>
      <div className="prompt-input-area">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your mission objective..."
          rows="4"
          disabled={isLoading}
        />
        <button onClick={handleParseIntent} disabled={isLoading}>
          {isLoading ? 'Parsing...' : 'Generate Mission Plan'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {missionPlan && (
        <div className="mission-plan-display">
          <h3>Generated Mission Plan:</h3>
          <pre>{JSON.stringify(missionPlan, null, 2)}</pre>
          <button onClick={handleExecuteMission} disabled={isLoading}>
            {isLoading ? 'Executing...' : 'Execute Mission'}
          </button>
        </div>
      )}

      {executionStatus && <div className="status-message">{executionStatus}</div>}
    </div>
  );
}

export default SolutionDeck;
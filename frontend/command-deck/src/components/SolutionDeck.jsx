// /Users/Morpheous/vltrn-system/frontend/command-deck/src/components/SolutionDeck.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

function SolutionDeck() {
  const [prompt, setPrompt] = useState('Find tech layoffs in California');
  const [missionId, setMissionId] = useState(null);
  const [missionDetails, setMissionDetails] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // This effect will poll for mission status when a missionId is set
  useEffect(() => {
    if (!missionId) return;

    const pollStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/missions/${missionId}`);
        setMissionDetails(response.data);
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          // Mission finished, stop polling and fetch results
          fetchResults();
          clearInterval(interval);
        }
      } catch {
        setError('Failed to fetch mission status.');
        clearInterval(interval);
      }
    };
    
    const fetchResults = async () => {
    try {
            const response = await axios.get(`${API_BASE_URL}/api/missions/${missionId}/results`);
            setResults(response.data);
    } catch (err) {
            console.error("Failed to fetch results", err);
    }
  };

    const interval = setInterval(pollStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [missionId]);

  const handleExecuteMission = async () => {
    setIsLoading(true);
    setError('');
    setMissionId(null);
    setMissionDetails(null);
    setResults([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/missions/execute`, { prompt });
      setMissionId(response.data.missionId);
      setMissionDetails(response.data.plan);
    } catch (err) {
      setError('Failed to start mission.');
      console.error(err);
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
        <button onClick={handleExecuteMission} disabled={isLoading || missionId}>
          {isLoading ? 'Executing...' : 'Parse and Execute Mission'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {missionDetails && (
        <div className="mission-plan-display">
          <h3>Mission ID: {missionId}</h3>
          <p><strong>Status:</strong> <span className={`status-${missionDetails.status}`}>{missionDetails.status}</span></p>
          <h4>Execution Plan:</h4>
          <ul>
            {missionDetails?.plan?.execution_steps?.map(step => (
              <li key={step.step}>
                <strong>Step {step.step}:</strong> {step.description} ({step.agent})
              </li>
            ))}
          </ul>
          {results.length > 0 && (
            <>
              <h3>Results:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.id}>
                      <td>{result.contact_name}</td>
                      <td>{result.contact_email}</td>
                      <td>{result.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SolutionDeck;
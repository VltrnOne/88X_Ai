// /Users/Morpheous/vltrn-system/frontend/command-deck/src/components/SolutionDeck.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

function SolutionDeck() {
  const [prompt, setPrompt] = useState('Find tech company layoffs in California from last month');
  const [missionId, setMissionId] = useState(null);
  const [missionDetails, setMissionDetails] = useState(null);
  const [missionResults, setMissionResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // This effect will poll for mission status when a missionId is set
  useEffect(() => {
    if (!missionId) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/missions/${missionId}`);
        setMissionDetails(response.data);
        
        // Stop polling if the mission is completed or has failed
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(interval);
          
          // Fetch mission results if completed
          if (response.data.status === 'completed') {
            try {
              const resultsResponse = await axios.get(`${API_BASE_URL}/api/missions/${missionId}/results`);
              setMissionResults(resultsResponse.data);
            } catch (resultsError) {
              console.error('Failed to fetch mission results:', resultsError);
            }
          }
        }
      } catch {
        setError('Failed to fetch mission status.');
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [missionId]);

  const handleExecuteMission = async () => {
    if (!prompt) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMissionId(null);
    setMissionDetails(null);
    setMissionResults([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/missions/execute`, { prompt });
      setMissionId(response.data.missionId);
      setMissionDetails(response.data.missionPlan); // Display initial plan
    } catch (err) {
      setError('Failed to connect to the Orchestrator service.');
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
        <button onClick={handleExecuteMission} disabled={isLoading}>
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
        </div>
      )}

      {missionResults.length > 0 && (
        <div className="mission-results-display">
          <h3>Mission Results</h3>
          <p><strong>Total Contacts Found:</strong> {missionResults.length}</p>
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>Contact Name</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Enriched At</th>
                </tr>
              </thead>
              <tbody>
                {missionResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.contact_name}</td>
                    <td>{result.contact_email}</td>
                    <td>{result.source}</td>
                    <td>{new Date(result.enriched_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SolutionDeck;
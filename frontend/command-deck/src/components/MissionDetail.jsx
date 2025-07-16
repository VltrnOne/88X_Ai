// src/components/MissionDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

function MissionDetail() {
  const { missionId } = useParams(); // Get mission ID from the URL
  const [mission, setMission] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMissionDetails = async () => {
      setIsLoading(true);
      try {
        const missionRes = await axios.get(`${API_BASE_URL}/api/missions/${missionId}`);
        setMission(missionRes.data);
        // Also fetch the results for this mission
        const resultsRes = await axios.get(`${API_BASE_URL}/api/missions/${missionId}/results`);
        setResults(resultsRes.data);
      } catch (err) {
        setError(`Failed to fetch details for mission ${missionId}.`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMissionDetails();
  }, [missionId]);

  if (isLoading) return <p>Loading mission details...</p>;
  if (error) return <div className="error-message">{error}</div>;
  if (!mission) return <p>Mission not found.</p>;

  return (
    <div className="mission-detail">
      <h2>Mission Detail: ID {mission.id}</h2>
      <p><strong>Status:</strong> <span className={`status-${mission.status}`}>{mission.status}</span></p>
      <p><strong>Prompt:</strong> {mission.prompt}</p>
      
      <h3>Execution Plan:</h3>
      <pre>{JSON.stringify(mission.plan, null, 2)}</pre>
      
      <h3>Results:</h3>
      {results.length > 0 ? (
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
      ) : (
        <p>No results found for this mission.</p>
      )}
    </div>
  );
}

export default MissionDetail;

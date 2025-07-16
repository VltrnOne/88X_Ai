// src/components/MissionDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

function MissionDashboard() {
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/missions`);
        setMissions(response.data);
      } catch (err) {
        setError('Failed to fetch mission history.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissions();
  }, []);

  return (
    <div className="mission-dashboard">
      <h2>Mission History</h2>
      {isLoading && <p>Loading mission history...</p>}
      {error && <div className="error-message">{error}</div>}
      {!isLoading && !error && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Prompt</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission) => (
              <tr key={mission.id}>
                <td>
                  <Link to={`/missions/${mission.id}`} className="mission-link">
                    {mission.id}
                  </Link>
                </td>
                <td>{mission.prompt}</td>
                <td><span className={`status-${mission.status}`}>{mission.status}</span></td>
                <td>{new Date(mission.created_at).toLocaleString()}</td>
                <td>{mission.completed_at ? new Date(mission.completed_at).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MissionDashboard;

import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import './MissionControl.css';

const MissionControl = () => {
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');

  const handleLaunchMission = async () => {
    if (!prompt) {
      setMessage('A target company name is required.');
      return;
    }
    setMessage(`Mission for 'scout-salesnav' accepted. Launching...`);
    try {
      // **FIXED**: The API endpoint is now corrected to '/api/launch-agent'
      const response = await apiClient.post('/api/launch-agent', {
        agentName: 'scout-selenium-py',
        prompt: prompt
      });
      setMessage(response.data.message);
    } catch (err) {
      setMessage('Failed to launch mission.');
      console.error(err);
    }
  };

  return (
    <div className="mission-control-container">
      <h2>Mission Control</h2>
      <div className="mission-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter Target Company Name"
        />
        <button onClick={handleLaunchMission}>Launch Scout-SalesNav</button>
      </div>
      {message && <p className="mission-status">{message}</p>}
    </div>
  );
};

export default MissionControl;
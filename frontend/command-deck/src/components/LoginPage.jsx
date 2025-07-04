import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // We will now use this function.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Authenticating...');
    try {
      const res = await axios.post('http://localhost:8080/login', { email, password });

      // --- THE FIX ---
      // This line saves the token to localStorage via our AuthContext.
      login(res.data.token);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Command Deck</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Authenticate</button>
      </form>
      {message && <p className="login-message">{message}</p>}
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient'; // <-- Import our new apiClient
import vltrnLogo from '../assets/vltrn-logo.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Authenticating...');

    try {
      // V-- Use our new apiClient here --V
      const response = await apiClient.post('/login', {
        email: email,
        password: password
      });

      const token = response.data.token;
      setMessage('Authentication Successful. Redirecting...');
      console.log('Received JWT:', token);

      login(token);
      navigate('/dashboard');

    } catch (error) {
      setMessage(error.response?.data?.error || 'Authentication Failed.');
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={vltrnLogo} alt="VLTRN Logo" className="login-logo" /> 
        <h2 className="login-subtitle">Command Deck</h2>

        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email Address" 
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">Authenticate</button>
        </form>

        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
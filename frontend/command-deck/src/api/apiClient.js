// Dynamic API base URL for local and production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment ? 'http://localhost:8080' : 'https://vlzen.com';

const apiClient = {
  post: async (path, body) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({ error: 'API request failed with no valid JSON response' }));
      throw new Error(errorResult.error || 'API request failed');
    }
    return response.json();
  },
  get: async (path) => {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({ error: 'API request failed with no valid JSON response' }));
      throw new Error(errorResult.error || 'API request failed');
    }
    return response.json();
  },
};

export default apiClient;
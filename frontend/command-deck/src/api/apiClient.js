import { API_CONFIG } from '../config.js';

class ApiClient {
  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Intent Parser
  async parseIntent(prompt) {
    return this.request(API_CONFIG.endpoints.parseIntent, {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }

  // Mission Strategist
  async generatePlan(missionBrief) {
    return this.request(API_CONFIG.endpoints.generatePlan, {
      method: 'POST',
      body: JSON.stringify(missionBrief)
    });
  }

  // Mission Execution
  async executePlan(executionPlan) {
    return this.request(API_CONFIG.endpoints.executePlan, {
      method: 'POST',
      body: JSON.stringify(executionPlan)
    });
  }

  // Get Missions
  async getMissions() {
    return this.request(API_CONFIG.endpoints.getMissions, {
      method: 'GET'
    });
  }

  // Health Check
  async healthCheck() {
    return this.request(API_CONFIG.endpoints.health, {
      method: 'GET'
    });
  }

  // Get Mission Results
  async getMissionResults(missionId) {
    return this.request(`${API_CONFIG.endpoints.getMissions}/${missionId}/results`, {
      method: 'GET'
    });
  }

  // --- NEW LIVE SEARCH METHODS ---
  
  async liveSearch(query, sources = ['linkedin', 'google', 'warn'], filters = {}) {
    const url = `${this.baseUrl}/live-search`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, sources, filters }),
    });

    if (!response.ok) {
      throw new Error(`Live search failed: ${response.statusText}`);
    }

    return response.json();
  }

  async searchLinkedIn(query, filters = {}) {
    const url = `${this.baseUrl}/search/linkedin`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters }),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn search failed: ${response.statusText}`);
    }

    return response.json();
  }

  async searchGoogle(query, filters = {}) {
    const url = `${this.baseUrl}/search/google`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters }),
    });

    if (!response.ok) {
      throw new Error(`Google search failed: ${response.statusText}`);
    }

    return response.json();
  }

  async searchWARN(query, filters = {}) {
    const url = `${this.baseUrl}/search/warn`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters }),
    });

    if (!response.ok) {
      throw new Error(`WARN search failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
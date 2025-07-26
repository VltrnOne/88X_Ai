// API Configuration
export const API_CONFIG = {
  // Google Cloud Run Backend
  baseUrl: 'https://vltrn-api-731154200629.us-central1.run.app',
  
  // API Endpoints
  endpoints: {
    parseIntent: '/api/parse-intent',
    generatePlan: '/api/generate-plan',
    executePlan: '/api/execute-plan',
    getMissions: '/api/missions',
    health: '/health'
  }
};

// Development vs Production
export const isDevelopment = import.meta.env.DEV;

// CORS Configuration
export const CORS_CONFIG = {
  origin: isDevelopment 
    ? ['http://localhost:5173', 'http://localhost:3000']
    : ['https://vlzen.com', 'https://vltrn-api-731154200629.us-central1.run.app'],
  credentials: true
}; 
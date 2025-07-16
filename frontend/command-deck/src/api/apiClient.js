import axios from 'axios';

// Create a dedicated axios instance for our API
const apiClient = axios.create({
  baseURL: 'http://localhost:4000', // The base URL for our orchestrator
});

// Use an interceptor to attach the JWT to every request
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('vltrn-token');
    if (token) {
      // If the token exists, add the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const AGENTICFLOW_API_KEY = process.env.AGENTICFLOW_API_KEY;
const AGENTICFLOW_BASE_URL = 'https://api.agenticflow.ai/v1'; // Note: This URL is a placeholder and must be verified from their documentation.

// API client configuration
const agenticFlowClient = axios.create({
  baseURL: AGENTICFLOW_BASE_URL,
  headers: {
    'Authorization': `Bearer ${AGENTICFLOW_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Endpoint to start the Audience Analyst agent run.
 * Expects a POST request with a body like: { "keywords": ["kw1", "kw2"] }
 */
app.post('/api/inbound/start-analysis', async (req, res) => {
  const { keywords } = req.body;

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ error: 'Keywords array is required.' });
  }

  // Construct the detailed prompt as we designed
  const prompt = `For each of the following phrases, return:
- Top 5 Google autocomplete variants
- Top 5 "People Also Ask" questions
- A summary of Reddit or Quora threads discussing this issue
- Emotional keywords or repeated phrases from users

Keywords:
${keywords.map((kw, index) => `${index + 1}. ${kw}`).join('\n')}
`;

  const payload = {
    agent_id: 'AudienceAnalyst_v1', // This ID must be the one set in the agenticflow.ai UI
    prompt: prompt,
    // Add any other required parameters from their API docs, e.g., output_format
  };

  try {
    console.log('Sending job to AgenticFlow...');
    // The endpoint path '/runs' is a placeholder. Verify from docs.
    const response = await agenticFlowClient.post('/runs', payload);
    
    console.log('Job started successfully:', response.data);
    // Return the job ID or initial data to the client
    res.status(202).json({ 
      message: 'Audience analysis run initiated successfully.',
      job: response.data 
    });
  } catch (error) {
    console.error('Error starting AgenticFlow run:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to initiate agent run.' });
  }
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
  console.log(`Inbound Orchestrator listening on port ${PORT}`);
}); 
require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const AGENTICFLOW_API_KEY = process.env.AGENTICFLOW_API_KEY;
const AGENTICFLOW_TEAMSPACE_ID = process.env.AGENTICFLOW_TEAMSPACE_ID;
const AGENTICFLOW_BASE_URL = 'https://api.pixelml.com/agentic';

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
    return res.status(400).json({
      error: 'Invalid request. keywords array is required.'
    });
  }

  try {
    // Construct the prompt for the Audience Analyst agent
    const prompt = `Analyze the following keywords to identify the target audience for inbound marketing:

Keywords: ${keywords.join(', ')}

Please provide:
1. Target audience demographics
2. Pain points and challenges
3. Content preferences and consumption habits
4. Decision-making factors
5. Recommended marketing channels
6. Content strategy recommendations

Format the response as structured data for marketing automation.`;

    // Prepare the payload for agenticflow.ai
    const payload = {
      teamspace_id: AGENTICFLOW_TEAMSPACE_ID,
      prompt: prompt,
      // Note: The exact agent_id/workflow_id needs to be determined from your agenticflow.ai dashboard
      agent_id: 'AudienceAnalyst_v1', // This will need to be updated with your actual agent ID
      metadata: {
        source: 'vltrn-inbound-orchestrator',
        keywords: keywords,
        analysis_type: 'audience_analysis'
      }
    };

    console.log('Initiating agent run with payload:', JSON.stringify(payload, null, 2));

    // Make the API call to agenticflow.ai
    const response = await agenticFlowClient.post('/runs', payload);
    
    console.log('Agent run initiated successfully:', response.data);
    
    res.status(202).json({
      message: 'Audience analysis initiated successfully',
      run_id: response.data.id,
      status: response.data.status,
      estimated_completion: response.data.estimated_completion || 'Unknown'
    });

  } catch (error) {
    console.error('Failed to initiate agent run:', error.response?.data || error.message);
    
    res.status(500).json({
      error: 'Failed to initiate agent run',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Endpoint to check the status of a running agent
 */
app.get('/api/inbound/run-status/:runId', async (req, res) => {
  const { runId } = req.params;
  
  try {
    const response = await agenticFlowClient.get(`/runs/${runId}`);
    
    res.json({
      run_id: runId,
      status: response.data.status,
      result: response.data.result,
      progress: response.data.progress
    });
    
  } catch (error) {
    console.error('Failed to get run status:', error.response?.data || error.message);
    
    res.status(500).json({
      error: 'Failed to get run status',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Endpoint to retrieve completed agent results
 */
app.get('/api/inbound/run-results/:runId', async (req, res) => {
  const { runId } = req.params;
  
  try {
    const response = await agenticFlowClient.get(`/runs/${runId}/results`);
    
    res.json({
      run_id: runId,
      completed_at: response.data.completed_at,
      analysis_results: response.data.results,
      metadata: response.data.metadata
    });
    
  } catch (error) {
    console.error('Failed to get run results:', error.response?.data || error.message);
    
    res.status(500).json({
      error: 'Failed to get run results',
      details: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
  console.log(`Inbound Orchestrator service running on port ${PORT}`);
  console.log(`AgenticFlow API Base URL: ${AGENTICFLOW_BASE_URL}`);
  console.log(`Teamspace ID: ${AGENTICFLOW_TEAMSPACE_ID ? 'Configured' : 'Missing'}`);
  console.log(`API Key: ${AGENTICFLOW_API_KEY ? 'Configured' : 'Missing'}`);
}); 
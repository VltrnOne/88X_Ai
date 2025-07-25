import express from 'express';
import cors from 'cors';
import { Buffer } from 'buffer';

const app = express();
const port = process.env.PORT || 8080;

// --- CONFIGURATION ---
const MOCK_ENABLED = true; // Enable mock responses for production
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// CORS configuration for production
app.use(cors({
  origin: ['https://vlzen.com', 'http://localhost:5173'], // Allow both production and development
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Intent Parser Endpoint
app.post('/api/parse-intent', async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: 'A "prompt" is required in the request body.' });
  }

  console.log(`[Intent Parser] Received prompt: "${userPrompt}"`);

  // Mock response for production
  if (MOCK_ENABLED) {
    console.log('[Intent Parser] MOCK MODE ENABLED. Returning a mock MissionBrief.');
    const mockMissionBrief = {
      targetPersona: {
        description: "Recent ex-employees from the tech industry",
        keywords: ["ex-employee", "laid off", "former employee", "software engineer", "product manager"]
      },
      financialProfile: {
        has: ["401k", "retirement funds"],
        interestIn: "investment tool"
      },
      offering: {
        product: "A better investment tool",
        category: "insurance"
      },
      geographicScope: {
        location: "California",
        type: "State"
      },
      rawPrompt: userPrompt
    };
    return res.json(mockMissionBrief);
  }

  // Live API logic would go here
  res.status(500).json({ error: 'Live API not configured' });
});

// Mission Strategist Endpoint
app.post('/api/generate-plan', async (req, res) => {
  const missionBrief = req.body;

  if (!missionBrief || !missionBrief.rawPrompt) {
    return res.status(400).json({ error: 'A valid "MissionBrief" object is required.' });
  }

  console.log(`[Mission Strategist] Received MissionBrief for: "${missionBrief.rawPrompt}"`);

  // Mock response for production
  if (MOCK_ENABLED) {
    console.log('[Mission Strategist] MOCK MODE ENABLED. Generating a dynamic mock ExecutionPlan.');
    
    const mockExecutionPlan = {
      planId: `mission-${Date.now()}`,
      originalBrief: missionBrief,
      summary: `A multi-step plan to identify and engage potential customers for ${missionBrief.offering?.product || 'a client'}.`,
      steps: [
        {
          step: 1,
          agent: "google-search",
          status: "pending",
          description: `Identify entities related to '${missionBrief.targetPersona?.description}' in '${missionBrief.geographicScope?.location}'.`,
          params: {
            query: `${missionBrief.targetPersona?.description} in ${missionBrief.geographicScope?.location}`
          },
          output_key: "initial_entity_list"
        },
        {
          step: 2,
          agent: "scout-selenium-py",
          status: "pending",
          description: "Use Sales Navigator to find specific contacts within the identified entities.",
          params: {
            input_source: "initial_entity_list",
            filters: missionBrief.targetPersona?.keywords || []
          },
          output_key: "raw_contact_profiles"
        },
        {
          step: 3,
          agent: "lead-scorer",
          status: "pending",
          description: "Analyze and rank the raw contacts to identify high-value leads.",
          params: {
            input_source: "raw_contact_profiles",
            scoring_criteria: missionBrief.financialProfile || {}
          },
          output_key: "ranked_leads"
        },
        {
          step: 4,
          agent: "campaign-crafter",
          status: "pending",
          description: `Generate personalized outreach campaigns for the top-ranked leads regarding the '${missionBrief.offering?.product}'.`,
          params: {
            input_source: "ranked_leads",
            offering_details: missionBrief.offering
          },
          output_key: "outreach_campaigns"
        }
      ]
    };
    return res.json(mockExecutionPlan);
  }

  // Live API logic would go here
  res.status(500).json({ error: 'Live API not configured' });
});

// Mission Execution Endpoint
app.post('/api/execute-plan', async (req, res) => {
  const executionPlan = req.body;

  if (!executionPlan || !executionPlan.planId) {
    return res.status(400).json({ error: 'A valid "ExecutionPlan" object is required.' });
  }

  console.log(`[Mission Execution] Received plan: ${executionPlan.planId}`);

  // Mock response for production
  const mockExecutionResult = {
    missionId: executionPlan.planId,
    status: 'queued',
    message: 'Mission queued for execution',
    estimatedCompletion: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
    steps: executionPlan.steps.map(step => ({
      ...step,
      status: 'queued'
    }))
  };

  res.json(mockExecutionResult);
});

// Get Missions Endpoint
app.get('/api/missions', (req, res) => {
  // Mock missions list
  const mockMissions = [
    {
      id: 'mission-1',
      name: 'Tech Industry Layoffs',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      completedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: 'mission-2',
      name: 'California Software Engineers',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      progress: 60
    }
  ];

  res.json(mockMissions);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 VLTRN Production Server is online and listening on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API endpoints:`);
  console.log(`   POST /api/parse-intent`);
  console.log(`   POST /api/generate-plan`);
  console.log(`   POST /api/execute-plan`);
  console.log(`   GET  /api/missions`);
});
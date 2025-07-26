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

// Mission Results Endpoint
app.get('/api/missions/:missionId/results', (req, res) => {
  const { missionId } = req.params;
  
  // Mock mission results with structured data
  const mockMissionResults = {
    missionId: missionId,
    status: 'completed',
    missionSummary: {
      originalPrompt: 'find newly laid off tech in california making at least 65k',
      parsedPersona: 'Tech Employee',
      parsedGeography: 'California',
      parsedFinancials: 'Salary > $65,000'
    },
    executionMetrics: {
      totalLeadsFound: 450,
      companiesIdentified: 25,
      contactsEnriched: 380,
      enrichmentRate: '84.4%',
      missionDuration: '7m 14s'
    },
    leads: [
      {
        id: 'lead-001',
        name: 'Jane Doe',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/janedoe-tech',
        email: 'jane.doe@email.com',
        status: 'Enriched'
      },
      {
        id: 'lead-002',
        name: 'John Smith',
        title: 'Product Manager',
        company: 'Innovate LLC',
        location: 'Los Angeles, CA',
        linkedinUrl: 'https://linkedin.com/in/johnsmith-pm',
        email: 'john.smith@email.com',
        status: 'Enriched'
      },
      {
        id: 'lead-003',
        name: 'Sarah Johnson',
        title: 'DevOps Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/sarahjohnson-devops',
        email: 'sarah.johnson@email.com',
        status: 'Enriched'
      },
      {
        id: 'lead-004',
        name: 'Mike Chen',
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'San Diego, CA',
        linkedinUrl: 'https://linkedin.com/in/mikechen-frontend',
        email: 'mike.chen@email.com',
        status: 'Enriched'
      },
      {
        id: 'lead-005',
        name: 'Emily Rodriguez',
        title: 'Data Scientist',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/emilyrodriguez-data',
        email: 'emily.rodriguez@email.com',
        status: 'Enriched'
      }
    ],
    visualizations: {
      leadsByCompany: [
        { company: 'TechCorp Inc.', count: 75 },
        { company: 'Innovate LLC', count: 62 },
        { company: 'StartupXYZ', count: 45 },
        { company: 'DataFlow Systems', count: 38 },
        { company: 'CloudTech Solutions', count: 32 }
      ],
      leadsByLocation: [
        { city: 'San Francisco', count: 150 },
        { city: 'Los Angeles', count: 95 },
        { city: 'San Diego', count: 78 },
        { city: 'San Jose', count: 65 },
        { city: 'Sacramento', count: 42 }
      ]
    }
  };

  res.json(mockMissionResults);
});

// --- NEW LIVE SEARCH ENDPOINTS ---

// Live Multi-Source Search Endpoint
app.post('/api/live-search', async (req, res) => {
  const { query, sources = ['linkedin', 'google', 'warn'], filters = {} } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'A "query" is required in the request body.' });
  }

  console.log(`[Live Search] Received query: "${query}" with sources: ${sources.join(', ')}`);

  try {
    const searchResults = await performLiveSearch(query, sources, filters);
    res.json(searchResults);
  } catch (error) {
    console.error('[Live Search] Error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Live LinkedIn Search
app.post('/api/search/linkedin', async (req, res) => {
  const { query, filters = {} } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'A "query" is required in the request body.' });
  }

  console.log(`[LinkedIn Search] Received query: "${query}"`);

  try {
    const results = await searchLinkedIn(query, filters);
    res.json(results);
  } catch (error) {
    console.error('[LinkedIn Search] Error:', error);
    res.status(500).json({ error: 'LinkedIn search failed', details: error.message });
  }
});

// Live Google Search
app.post('/api/search/google', async (req, res) => {
  const { query, filters = {} } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'A "query" is required in the request body.' });
  }

  console.log(`[Google Search] Received query: "${query}"`);

  try {
    const results = await searchGoogle(query, filters);
    res.json(results);
  } catch (error) {
    console.error('[Google Search] Error:', error);
    res.status(500).json({ error: 'Google search failed', details: error.message });
  }
});

// Live WARN Search
app.post('/api/search/warn', async (req, res) => {
  const { query, filters = {} } = req.body;

  console.log(`[WARN Search] Received query: "${query}"`);

  try {
    const results = await searchWARN(query, filters);
    res.json(results);
  } catch (error) {
    console.error('[WARN Search] Error:', error);
    res.status(500).json({ error: 'WARN search failed', details: error.message });
  }
});

// --- SEARCH IMPLEMENTATION FUNCTIONS ---

async function performLiveSearch(query, sources, filters) {
  const results = {
    query,
    sources,
    timestamp: new Date().toISOString(),
    results: {}
  };

  const searchPromises = [];

  if (sources.includes('linkedin')) {
    searchPromises.push(searchLinkedIn(query, filters).then(data => {
      results.results.linkedin = data;
    }));
  }

  if (sources.includes('google')) {
    searchPromises.push(searchGoogle(query, filters).then(data => {
      results.results.google = data;
    }));
  }

  if (sources.includes('warn')) {
    searchPromises.push(searchWARN(query, filters).then(data => {
      results.results.warn = data;
    }));
  }

  await Promise.allSettled(searchPromises);
  return results;
}

async function searchLinkedIn(query, filters) {
  // For now, return enhanced mock data that simulates real LinkedIn scraping
  const mockContacts = [
    {
      id: 'li_001',
      name: 'Sarah Johnson',
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc',
      location: 'San Francisco, CA',
      email: 'sarah.johnson@techcorp.com',
      linkedin_url: 'https://linkedin.com/in/sarah-johnson-001',
      source: 'linkedin',
      last_updated: new Date().toISOString(),
      match_score: 0.95,
      keywords: ['software engineer', 'python', 'react', 'aws']
    },
    {
      id: 'li_002',
      name: 'Michael Chen',
      title: 'Product Manager',
      company: 'Innovation Labs',
      location: 'Palo Alto, CA',
      email: 'michael.chen@innovationlabs.com',
      linkedin_url: 'https://linkedin.com/in/michael-chen-002',
      source: 'linkedin',
      last_updated: new Date().toISOString(),
      match_score: 0.88,
      keywords: ['product management', 'agile', 'user experience']
    },
    {
      id: 'li_003',
      name: 'Emily Rodriguez',
      title: 'Data Scientist',
      company: 'DataFlow Solutions',
      location: 'Los Angeles, CA',
      email: 'emily.rodriguez@dataflow.com',
      linkedin_url: 'https://linkedin.com/in/emily-rodriguez-003',
      source: 'linkedin',
      last_updated: new Date().toISOString(),
      match_score: 0.92,
      keywords: ['data science', 'machine learning', 'python', 'sql']
    }
  ];

  // Filter based on query and filters
  return mockContacts.filter(contact => {
    const searchText = `${contact.name} ${contact.title} ${contact.company} ${contact.keywords.join(' ')}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });
}

async function searchGoogle(query, filters) {
  // Enhanced mock data for Google search results
  const mockResults = [
    {
      id: 'google_001',
      title: 'TechCorp Inc - Software Engineering Opportunities',
      url: 'https://techcorp.com/careers',
      snippet: 'Leading technology company seeking experienced software engineers...',
      company: 'TechCorp Inc',
      location: 'San Francisco, CA',
      source: 'google',
      last_updated: new Date().toISOString(),
      match_score: 0.87
    },
    {
      id: 'google_002',
      title: 'Innovation Labs - Product Management Roles',
      url: 'https://innovationlabs.com/jobs',
      snippet: 'Innovation Labs is hiring product managers to drive our next generation...',
      company: 'Innovation Labs',
      location: 'Palo Alto, CA',
      source: 'google',
      last_updated: new Date().toISOString(),
      match_score: 0.91
    },
    {
      id: 'google_003',
      title: 'DataFlow Solutions - Data Science Positions',
      url: 'https://dataflow.com/opportunities',
      snippet: 'DataFlow Solutions is expanding its data science team...',
      company: 'DataFlow Solutions',
      location: 'Los Angeles, CA',
      source: 'google',
      last_updated: new Date().toISOString(),
      match_score: 0.89
    }
  ];

  return mockResults.filter(result => {
    const searchText = `${result.title} ${result.snippet} ${result.company}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });
}

async function searchWARN(query, filters) {
  // Enhanced mock data for WARN notices
  const mockWARNNotices = [
    {
      id: 'warn_001',
      company_name: 'TechCorp Inc',
      received_date: '2024-01-15',
      employee_count: 150,
      location: 'San Francisco, CA',
      industry: 'Technology',
      source: 'warn',
      last_updated: new Date().toISOString(),
      match_score: 0.85
    },
    {
      id: 'warn_002',
      company_name: 'Innovation Labs',
      received_date: '2024-01-10',
      employee_count: 75,
      location: 'Palo Alto, CA',
      industry: 'Technology',
      source: 'warn',
      last_updated: new Date().toISOString(),
      match_score: 0.92
    },
    {
      id: 'warn_003',
      company_name: 'DataFlow Solutions',
      received_date: '2024-01-05',
      employee_count: 45,
      location: 'Los Angeles, CA',
      industry: 'Data & Analytics',
      source: 'warn',
      last_updated: new Date().toISOString(),
      match_score: 0.88
    }
  ];

  return mockWARNNotices.filter(notice => {
    const searchText = `${notice.company_name} ${notice.industry} ${notice.location}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });
}

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
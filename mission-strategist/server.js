import express from 'express';
import cors from 'cors';

const app = express();
const port = 3002;

// --- CONFIGURATION ---
// Mock mode is enabled to return a predictable ExecutionPlan.
const MOCK_ENABLED = true; // Temporarily enabled due to API rate limit

// --- API CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from your frontend development server
}));
app.use(express.json());

// This endpoint receives a MissionBrief and returns a multi-step ExecutionPlan.
app.post('/generate-plan', async (req, res) => {
  const missionBrief = req.body;

  if (!missionBrief || !missionBrief.rawPrompt) {
    return res.status(400).json({ error: 'A valid "MissionBrief" object is required.' });
  }

  console.log(`[Mission Strategist] Received MissionBrief for: "${missionBrief.rawPrompt}"`);

  // --- MOCK RESPONSE LOGIC ---
  if (MOCK_ENABLED) {
    console.log('[Mission Strategist] MOCK MODE ENABLED. Generating a dynamic mock ExecutionPlan.');
    
    // This mock logic creates a plausible plan based on the MissionBrief's contents.
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

  // --- LIVE API LOGIC (Future Implementation) ---
  // In a live environment, this section would make a call to an LLM
  // to generate the plan based on the missionBrief.
  console.log('[Mission Strategist] LIVE MODE: Generating execution plan with LLM...');
  
  const systemPrompt = `
    You are an expert mission strategist for a Signal Intelligence platform.
    Your task is to create a detailed ExecutionPlan based on a MissionBrief.

    The ExecutionPlan must include:
    - planId: A unique identifier (format: "mission-" + timestamp)
    - originalBrief: The input MissionBrief object
    - summary: A brief description of the overall strategy
    - steps: An array of execution steps, each containing:
      * step: Sequential number
      * agent: The agent to execute (google-search, scout-selenium-py, lead-scorer, campaign-crafter, scout-warn, marketer-agent, marketer-enrich)
      * status: "pending"
      * description: Clear description of what this step accomplishes
      * params: Parameters for the agent
      * output_key: Unique identifier for this step's output

    Available agents and their purposes:
    - google-search: Find companies and entities
    - scout-selenium-py: Scrape contact information from LinkedIn/Sales Navigator
    - lead-scorer: Analyze and rank leads based on criteria
    - campaign-crafter: Generate personalized outreach campaigns
    - scout-warn: Search WARN Act notices for layoff information
    - marketer-agent: Send outreach campaigns
    - marketer-enrich: Enrich contact data

    Create a logical sequence of 3-5 steps that will accomplish the mission.
    Return ONLY the JSON ExecutionPlan. No other text.
  `;

  try {
    const chatHistory = [
      { role: "user", parts: [{ text: systemPrompt + "\n\nMissionBrief: " + JSON.stringify(missionBrief, null, 2) }] }
    ];
    const payload = { contents: chatHistory };
    const apiKey = GEMINI_API_KEY;
    const apiUrl = `${GEMINI_API_URL}?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Mission Strategist] LLM API Error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error('Failed to get a response from the LLM.');
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
      let jsonString = result.candidates[0].content.parts[0].text;
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
      
      console.log('[Mission Strategist] Received raw response from LLM:', jsonString);
      const executionPlan = JSON.parse(jsonString);
      console.log('[Mission Strategist] Successfully generated ExecutionPlan.');
      
      res.json(executionPlan);
    } else {
      console.error('[Mission Strategist] LLM response was empty or malformed.', result);
      throw new Error('LLM response was empty or malformed.');
    }

  } catch (error) {
    console.error('[Mission Strategist] Critical error during plan generation:', error);
    res.status(500).json({ error: 'Failed to generate execution plan.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 VLTRN Mission Strategist is online and listening on port ${port}`);
}); 
import express from 'express';
import cors from 'cors';

const app = express();
const port = 8082;

// --- CONFIGURATION ---
// Mock mode is enabled to return a predictable ExecutionPlan.
const MOCK_ENABLED = true;

app.use(cors());
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
  console.log('[Mission Strategist] LIVE MODE: Not yet implemented.');
  res.status(501).json({ error: 'Live mission planning is not yet implemented.' });
});

app.listen(port, () => {
  console.log(`🚀 VLTRN Mission Strategist is online and listening on port ${port}`);
}); 
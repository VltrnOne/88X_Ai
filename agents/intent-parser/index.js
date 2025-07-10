// agents/intent-parser/index.js v2.0
// This service now functions as both the Intent Parser and the Orchestrator.
import express from 'express';
import { $ } from 'execa';

const PORT = 4000;
const app = express();
app.use(express.json());

// ... (The parsePrompt function remains the same)
function parsePrompt(prompt) {
  const lowerCasePrompt = prompt.toLowerCase();
  const missionPlan = {
    action: "SEARCH_LAYOFF_EVENTS",
    target_entities: [],
    filters: {}
  };
  if (lowerCasePrompt.includes('tech')) missionPlan.filters.industry = 'Technology';
  if (lowerCasePrompt.includes('california')) missionPlan.filters.location = 'California';
  if (lowerCasePrompt.includes('last month')) missionPlan.filters.date_range = 'past_30_days';
  if (lowerCasePrompt.includes('companies')) missionPlan.target_entities.push('company');
  return missionPlan;
}

/**
 * Executes an agent based on a mission plan.
 * @param {object} missionPlan - A structured mission plan.
 */
async function executeMission(missionPlan) {
    console.log(`[Orchestrator] Executing mission: ${missionPlan.action}`);
    if (missionPlan.action === 'SEARCH_LAYOFF_EVENTS') {
        // We use 'docker compose run' which is ideal for one-off tasks.
        // The '--rm' flag cleans up the container after it exits.
        // We run this command from the project root, so we adjust paths.
        const agentProcess = $({ stdio: 'inherit', cwd: '../..' })`docker compose run --rm scout-warn`;
        await agentProcess;
        console.log(`[Orchestrator] Agent scout-warn finished its mission.`);
    }
}

// Endpoint to parse a prompt.
app.post('/api/missions/parse', (req, res) => {
  const userPrompt = req.body.prompt;
  console.log(`[Intent-Parser] Received prompt: "${userPrompt}"`);
  const structuredMissionPlan = parsePrompt(userPrompt);
  res.json(structuredMissionPlan);
});

// NEW: Endpoint to execute a mission plan.
app.post('/api/missions/execute', async (req, res) => {
    const missionPlan = req.body;
    console.log('[Orchestrator] Received mission execution request.');
    res.status(202).json({ message: "Mission execution started.", mission: missionPlan });

    // Execute the mission asynchronously.
    executeMission(missionPlan);
});

app.listen(PORT, () => {
  console.log(`[Intent-Parser/Orchestrator] API server listening on http://localhost:${PORT}`);
});
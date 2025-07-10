// agents/intent-parser/index.js v1.1
import express from 'express';

const PORT = 4000;
const app = express();
app.use(express.json());

/**
 * Parses a natural language prompt to extract a structured mission plan.
 * This is a simplified simulation of NLP/LLM logic.
 * @param {string} prompt - The user's natural language input.
 * @returns {object} A structured mission plan in JSON format.
 */
function parsePrompt(prompt) {
  const lowerCasePrompt = prompt.toLowerCase();
  const missionPlan = {
    action: "SEARCH_LAYOFF_EVENTS", // Default action
    target_entities: [],
    filters: {}
  };

  // Simple keyword matching to identify entities and filters
  if (lowerCasePrompt.includes('tech')) {
    missionPlan.filters.industry = 'Technology';
  }
  if (lowerCasePrompt.includes('california')) {
    missionPlan.filters.location = 'California';
  }
  if (lowerCasePrompt.includes('last month')) {
    missionPlan.filters.date_range = 'past_30_days';
  }
  if (lowerCasePrompt.includes('companies')) {
    missionPlan.target_entities.push('company');
  }

  return missionPlan;
}

app.post('/parse', (req, res) => {
  const userPrompt = req.body.prompt;
  console.log(`[Intent-Parser] Received prompt: "${userPrompt}"`);

  // Call the new parsing function
  const structuredMissionPlan = parsePrompt(userPrompt);

  console.log('[Intent-Parser] Generated structured mission plan:');
  console.log(JSON.stringify(structuredMissionPlan, null, 2));

  res.json(structuredMissionPlan);
});

app.listen(PORT, () => {
  console.log(`[Intent-Parser] API server listening on http://localhost:${PORT}`);
});
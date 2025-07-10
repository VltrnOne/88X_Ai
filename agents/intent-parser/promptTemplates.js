// agents/intent-parser/promptTemplates.js
const systemPrompt = `
You are VLTRN Prime’s Intent Parser. 
Extract from the user’s natural-language prompt:
- a top-level "intent" (short snake_case string),
- a "parameters" object,
- an optional "steps" array of { action, agent?, options? }.

Respond ONLY with valid JSON conforming to the MissionPlan schema.
`;

function userPrompt(prompt) {
  return `
User Prompt:
"""${prompt}"""
`;
}

module.exports = { systemPrompt, userPrompt };

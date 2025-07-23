import express from 'express';
import cors from 'cors';
import { Buffer } from 'buffer'; // Node.js Buffer

const app = express();
const port = 8081;

// --- CONFIGURATION ---
// Set to true to bypass the live API and return a predictable mock object.
// Set to false to use the live Gemini API (requires an API key).
const MOCK_ENABLED = true;

app.use(cors());
app.use(express.json());

// This is the core endpoint for parsing user intent.
app.post('/parse-intent', async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: 'A "prompt" is required in the request body.' });
  }

  console.log(`[Intent Parser] Received prompt: "${userPrompt}"`);

  // --- MOCK RESPONSE LOGIC ---
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

  // --- LIVE API LOGIC ---
  // The system prompt that instructs the LLM on how to behave.
  const systemPrompt = `
    You are an expert mission planner for a Signal Intelligence platform.
    Your task is to deconstruct a user's natural language request into a structured JSON object called a "MissionBrief".

    The MissionBrief must identify the following key entities from the user's prompt:
    - targetPersona: An object describing the ideal individual to find. Include job titles, keywords, and other descriptors.
    - financialProfile: An object describing financial attributes, such as having a '401k' or 'retirement funds'.
    - offering: An object describing the product or service being offered to the target.
    - geographicScope: An object describing the location for the search.
    - rawPrompt: The original, unmodified user prompt.

    Analyze the following user prompt and return ONLY the JSON MissionBrief. Do not include any other text, greetings, or explanations.
  `;
  
  try {
    console.log('[Intent Parser] LIVE MODE: Sending prompt to LLM for analysis...');
    
    const chatHistory = [
        { role: "user", parts: [{ text: systemPrompt + "\n\nUser Prompt: " + userPrompt }] }
    ];
    const payload = { contents: chatHistory };
    const apiKey = ""; // Canvas will provide this
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Intent Parser] LLM API Error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error('Failed to get a response from the LLM.');
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
        let jsonString = result.candidates[0].content.parts[0].text;
        jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
        
        console.log('[Intent Parser] Received raw response from LLM:', jsonString);
        const missionBrief = JSON.parse(jsonString);
        console.log('[Intent Parser] Successfully parsed MissionBrief.');
        
        res.json(missionBrief);

    } else {
        console.error('[Intent Parser] LLM response was empty or malformed.', result);
        throw new Error('LLM response was empty or malformed.');
    }

  } catch (error) {
    console.error('[Intent Parser] Critical error during intent parsing:', error);
    res.status(500).json({ error: 'Failed to parse intent.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 VLTRN Intent Parser is online and listening on port ${port}`);
}); 
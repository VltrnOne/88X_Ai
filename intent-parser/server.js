import express from 'express';
import cors from 'cors';
import { Buffer } from 'buffer'; // Node.js Buffer

const app = express();
const port = 3001;

// --- CONFIGURATION ---
// Set to true to bypass the live API and return a predictable mock object.
// Set to false to use the live Gemini API (requires an API key).
const MOCK_ENABLED = true;

// --- API CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from your frontend development server
}));
app.use(express.json());

// Add debugging middleware
app.use((req, res, next) => {
  console.log(`[Intent Parser] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('[Intent Parser] Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// This is the core endpoint for parsing user intent.
app.post('/parse-intent', async (req, res) => {
  console.log('[Intent Parser] /parse-intent endpoint called');
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    console.log('[Intent Parser] No prompt provided');
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
    console.log('[Intent Parser] Sending mock response');
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
    const apiKey = GEMINI_API_KEY; // Canvas will provide this
    const apiUrl = `${GEMINI_API_URL}?key=${apiKey}`;

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

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 VLTRN Intent Parser is online and listening on port ${port}`);
}); 
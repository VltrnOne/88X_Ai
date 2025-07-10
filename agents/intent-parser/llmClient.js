// agents/intent-parser/llmClient.js
import { Configuration, OpenAIApi } from 'openai';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// OpenAI setup
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// Gemini (Google Vertex AI) setup
const gemini = new PredictionServiceClient();

// Venice Pro uses a simple HTTP endpoint
const VENICE_URL = process.env.VENICE_API_URL;
const VENICE_KEY = process.env.VENICE_API_KEY;

/**
 * generate(prompt, provider)
 * @param {string} prompt
 * @param {'openai'|'gemini'|'venice'} provider
 */
export async function generate(prompt, provider = 'openai') {
  switch (provider) {
    case 'openai': {
      const resp = await openai.createChatCompletion({
        model: process.env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are VLTRN Prime’s Intent Parser.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0
      });
      return resp.data.choices[0].message.content.trim();
    }

    case 'gemini': {
      const request = {
        endpoint: process.env.GEMINI_ENDPOINT,
        instances: [{ content: prompt }],
        parameters: { temperature: 0 }
      };
      const [response] = await gemini.predict(request);
      // Vertex AI returns `predictions` array
      return response.predictions[0].content.trim();
    }

    case 'venice': {
      const resp = await axios.post(
        VENICE_URL,
        { prompt, temperature: 0 },
        { headers: { Authorization: `Bearer ${VENICE_KEY}` } }
      );
      return resp.data.generatedText.trim();
    }

    default:
      throw new Error(`Unknown provider "${provider}"`);
  }
}

// vltrn-system/agents/intent-parser/llmClient.js
import OpenAI from 'openai';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new PredictionServiceClient();
const VENICE_URL = process.env.VENICE_API_URL;
const VENICE_KEY = process.env.VENICE_API_KEY;

export async function generate(prompt, provider = 'openai') {
  if (provider === 'openai') {
    try {
      const r = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: "You are VLTRN Prime's Mission Planner." },
          { role: 'user',   content: prompt }
        ],
        temperature: 0
      });
      return r.choices[0].message.content.trim();
    } catch (e) {
      const code   = e.code || e.error?.code;
      const status = e.status || e.statusCode;
      if (code === 'insufficient_quota' || status === 429) {
        console.warn('[LLM] OpenAI quota hit; falling back to Gemini');
        return generate(prompt, 'gemini');
      }
      throw e;
    }
  }

  if (provider === 'gemini') {
    try {
      const req = {
        endpoint:  process.env.GEMINI_ENDPOINT,
        instances: [{ content: prompt }],
        parameters:{ temperature: 0 }
      };
      const [resp] = await gemini.predict(req);
      return resp.predictions[0].content.trim();
    } catch (e) {
      console.warn('[LLM] Gemini failed; falling back to Venice');
      return generate(prompt, 'venice');
    }
  }

  // venice
  const resp = await axios.post(
    VENICE_URL,
    { prompt, temperature: 0 },
    { headers: { Authorization: `Bearer ${VENICE_KEY}` } }
  );
  return resp.data.generatedText.trim();
}

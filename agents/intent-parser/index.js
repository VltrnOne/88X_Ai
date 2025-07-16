// index.js
import express from 'express';
import { $ } from 'execa';
import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { generate } from './llmClient.js';
import { systemPrompt, userPrompt } from './promptTemplates.js';

dotenv.config();

// ESM __dirname hack
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load & compile schema
const schemaPath = path.join(__dirname, 'schemas', 'mission.schema.json');
const schema     = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate   = new Ajv({ allErrors: true }).compile(schema);

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

/**
 * Local stub parser to guarantee a mission plan.
 */
function parsePrompt(prompt) {
  const lower = prompt.toLowerCase();
  const plan = {
    intent: 'search_layoff_events',
    parameters: {},
    steps: [
      {
        id: 'run_scout_warn',
        action: 'run_container',
        agent: 'scout-warn',
        options: {}
      }
    ]
  };
  if (lower.includes('tech'))       plan.parameters.industry   = 'Technology';
  if (lower.includes('california')) plan.parameters.location   = 'California';
  if (lower.includes('last month')) plan.parameters.date_range = 'past_30_days';
  if (lower.includes('company'))    plan.parameters.target_entities = ['company'];
  return plan;
}

// 1) Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// 2) Parse endpoint with LLM → fallback stub
app.post('/api/missions/parse', async (req, res) => {
  const { prompt, provider } = req.body;
  if (typeof prompt !== 'string' || !['openai','gemini','venice'].includes(provider)) {
    return res.status(400).json({
      error: 'Request JSON must include:\n  { prompt: string, provider: "openai"|"gemini"|"venice" }'
    });
  }

  let mission;
  try {
    // Attempt LLM parse
    const raw = await generate(
      `${systemPrompt}\n${userPrompt(prompt)}`,
      provider
    );
    mission = JSON.parse(raw.trim());

    // Validate LLM output
    if (!validate(mission)) {
      throw new Error('LLM returned invalid shape');
    }

  } catch (err) {
    console.warn('[Parse] LLM failed:', err.message);
    // Fallback to local stub
    mission = parsePrompt(prompt);
  }

  // Always return a well-formed mission
  return res.json(mission);
});

// 3) Execute endpoint
app.post('/api/missions/execute', (req, res) => {
  const missionPlan = req.body;
  if (!validate(missionPlan)) {
    return res.status(422).json({
      error: 'Invalid mission plan',
      details: validate.errors
    });
  }

  res.status(202).json({ message: 'Mission execution started.', missionPlan });

  (async () => {
    console.log('[Orchestrator] Executing', missionPlan.intent);
    for (const step of missionPlan.steps) {
      console.log(`→ step ${step.id}`, step.action, step.agent);
      if (step.action === 'run_container') {
        try {
          await $(
            { stdio: 'inherit', cwd: path.resolve(__dirname, '../..') }
          )`docker compose run --rm ${step.agent}`;
          console.log(`✔ ${step.agent}`);
        } catch (e) {
          console.error(`✘ step ${step.id} failed:`, e.message);
          break;
        }
      }
    }
    console.log('[Orchestrator] Mission complete.');
  })();
});

app.listen(PORT, () => {
  console.log(`Intent-Parser listening on http://localhost:${PORT}`);
});

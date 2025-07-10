// agents/intent-parser/index.js
import express from 'express';
import { $ } from 'execa';
import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { generate } from './llmClient.js';

dotenv.config();

// ESM __dirname boilerplate
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load & compile JSON schema
const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'schemas', 'mission.schema.json'), 'utf8')
);
const validate = new Ajv().compile(schema);

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

// --- Healthcheck ---
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// --- 1) Parse with LLM ---
app.post('/api/missions/parse', async (req, res) => {
  const { prompt, provider } = req.body;
  if (typeof prompt !== 'string' || !provider) {
    return res.status(400).json({ error: 'Request must include "prompt" (string) and "provider" (openai|gemini|venice).' });
  }

  try {
    // Call the correct LLM
    const raw = await generate(prompt, provider);
    const missionPlan = JSON.parse(raw.trim());

    // Validate JSON against schema
    const valid = validate(missionPlan);
    if (!valid) {
      return res.status(422).json({ error: 'Schema validation failed', details: validate.errors });
    }

    // Return structured mission
    return res.json(missionPlan);

  } catch (err) {
    console.error('[Intent-Parser] parse error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// --- 2) Execute via Docker ---
app.post('/api/missions/execute', (req, res) => {
  const missionPlan = req.body;

  // Validate again before executing
  if (!validate(missionPlan)) {
    return res.status(422).json({ error: 'Invalid mission plan', details: validate.errors });
  }

  // Acknowledge ASAP
  res.status(202).json({ message: 'Mission execution started.', missionPlan });

  // Fire-and-forget execution
  (async () => {
    console.log('[Orchestrator] Running', missionPlan.intent);
    try {
      await $(
        { stdio: 'inherit', cwd: path.resolve(__dirname, '../..') }
      )`docker compose run --rm scout-warn`;
      console.log('[Orchestrator] scout-warn done.');
    } catch (e) {
      console.error('[Orchestrator] Execution error:', e);
    }
  })();
});

// --- Start the server ---
app.listen(PORT, () =>
  console.log(`[Intent-Parser/Orchestrator] Listening on http://localhost:${PORT}`)
);

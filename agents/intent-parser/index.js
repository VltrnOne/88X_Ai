// agents/intent-parser/index.js v4.1 - With Mission Status Endpoint
import express from 'express';
import { $ } from 'execa';
import { generateMissionPlan } from './mission-planner.js';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const PORT = process.env.PORT || 4000;
const app = express();

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: 'dataroom-db',
    database: 'dataroom',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: 5432,
});

const corsOptions = { 
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// --- (parsePrompt and generateMissionPlan functions remain the same) ---
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

async function executeMission(missionId, missionPlan) {
    console.log(`[Orchestrator] Starting execution for mission ID: ${missionId}`);
    await pool.query('UPDATE missions SET status = $1 WHERE id = $2', ['running', missionId]);
    try {
        for (const step of missionPlan.execution_steps) {
            console.log(`[Orchestrator] Executing Step ${step.step}: ${step.description}`);
            const agentProcess = $({ stdio: 'inherit', cwd: '../..' })`docker compose run --rm --env MISSION_ID=${missionId} ${step.agent}`;
            await agentProcess;
        }
        await pool.query('UPDATE missions SET status = $1, completed_at = NOW() WHERE id = $2', ['completed', missionId]);
        console.log(`[Orchestrator] Mission ID ${missionId} executed successfully.`);
    } catch (error) {
        console.error(`[Orchestrator] Mission ID ${missionId} failed. Aborting.`);
        await pool.query('UPDATE missions SET status = $1, completed_at = NOW() WHERE id = $2', ['failed', missionId]);
    }
}

// --- API Endpoints ---
app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.post('/api/missions/parse', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    const parsedIntent = parsePrompt(prompt);
    const missionPlan = generateMissionPlan(parsedIntent);
    res.json({ 
      success: true, 
      parsedIntent, 
      missionPlan 
    });
  } catch (error) {
    console.error('Error parsing mission:', error);
    res.status(500).json({ error: 'Failed to parse mission' });
  }
});

app.post('/api/missions/execute', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    const parsedIntent = parsePrompt(prompt);
    const missionPlan = generateMissionPlan(parsedIntent);

    // Create mission record
    const missionResult = await pool.query(
      'INSERT INTO missions (prompt, parsed_intent, mission_plan, status, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [prompt, JSON.stringify(parsedIntent), JSON.stringify(missionPlan), 'queued']
    );
    const missionId = missionResult.rows[0].id;
    
    console.log(`[Orchestrator] Created mission ID: ${missionId}`);
    
    // Execute mission asynchronously
    executeMission(missionId, missionPlan);
    
    res.json({ 
      success: true, 
      missionId,
      message: 'Mission queued for execution',
      parsedIntent, 
      missionPlan 
    });
  } catch (error) {
    console.error('Error executing mission:', error);
    res.status(500).json({ error: 'Failed to execute mission' });
  }
});

// NEW: Endpoint to get the status of a specific mission
app.get('/api/missions/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[Orchestrator] Received status request for mission ID: ${id}`);
    try {
        const result = await pool.query('SELECT * FROM missions WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mission not found.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`[Orchestrator] Error fetching mission status for ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch mission status.' });
    }
});

// NEW: Endpoint to list all missions
app.get('/api/missions', async (req, res) => {
    console.log(`[Orchestrator] Received request to list all missions.`);
    try {
        const result = await pool.query('SELECT id, prompt, status, created_at, completed_at FROM missions ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(`[Orchestrator] Error fetching mission list:`, error);
        res.status(500).json({ error: 'Failed to fetch mission list.' });
    }
});

// NEW: Endpoint to get mission results
app.get('/api/missions/:id/results', async (req, res) => {
    const { id } = req.params;
    console.log(`[Orchestrator] Received results request for mission ID: ${id}`);
    try {
        const result = await pool.query('SELECT * FROM mission_results WHERE mission_id = $1 ORDER BY enriched_at DESC', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error(`[Orchestrator] Error fetching mission results for ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch mission results.' });
    }
});

app.listen(PORT, () => {
  console.log(`[Intent-Parser/Orchestrator] API server listening on http://localhost:${PORT}`);
});

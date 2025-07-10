import express from 'express';
import cors from 'cors';
import { runAgentContainer } from './agent-runner.js';
import db from './db.js';

const app = express();
const port = process.env.PORT || 8080;

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

// --- Database Schema Initialization ---
async function ensureSchema() {
  try {
    const client = await db.connect();
    console.log('[Orchestrator] Verifying Dataroom schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS warn_notices (
        id SERIAL PRIMARY KEY,
        notice_date DATE,
        company_name VARCHAR(255),
        city VARCHAR(255),
        employees_affected INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_navigator_results (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    client.release();
    console.log('[Orchestrator] Schema verification complete. Dataroom is ready.');
  } catch (err) {
    console.error('[Orchestrator] Dataroom schema initialization failed:', err);
    process.exit(1);
  }
}

// --- Server Initialization ---
async function startServer() {
  await ensureSchema();

  // --- API Routes ---
  app.get('/api/warn-notices', async (req, res) => {
    try {
      const notices = await db.query('SELECT * FROM warn_notices ORDER BY notice_date DESC LIMIT 100');
      res.json(notices.rows);
    } catch (err) {
      console.error('[Orchestrator] Error fetching WARN notices:', err);
      res.status(500).send('Error retrieving WARN notices');
    }
  });

  app.get('/api/results/sales-navigator', async (req, res) => {
    console.log('[Orchestrator] Received request for Sales Navigator results.');
    try {
      const results = await db.query('SELECT * FROM sales_navigator_results ORDER BY scraped_at DESC');
      res.json(results.rows);
    } catch (err) {
      console.error('[Orchestrator] Error fetching results from Dataroom:', err);
      res.status(500).json({ error: 'Failed to retrieve results.' });
    }
  });

  app.post('/api/launch-agent', async (req, res) => {
    const { agentName, prompt } = req.body;
    if (!agentName) {
      return res.status(400).json({ error: 'agentName is required' });
    }
    console.log(`[Orchestrator] Received dispatch request for agent: ${agentName}`);
    runAgentContainer(agentName, prompt);
    res.status(202).json({ message: `Mission for agent '${agentName}' has been accepted for execution.` });
  });

  app.listen(port, () => {
    console.log(`🚀 Orchestrator is online and listening on port ${port}.`);
  });
}

startServer().catch(err => {
  console.error("[Orchestrator] Failed to initialize and start server:", err);
});
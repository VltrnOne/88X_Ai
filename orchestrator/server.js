import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import pg from 'pg';

const app = express();
const port = process.env.PORT || 8080;
const execPromise = promisify(exec);

// Database connection pool
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'dataroom-db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dataroom',
});

app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from your frontend development server
}));
app.use(express.json());

// --- Database Schema Verification ---
async function verifyDatabaseSchema() {
  try {
    const client = await pool.connect();
    console.log('[Orchestrator] Verifying Dataroom schema...');
    
    // Create missions table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
        plan_id VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        mission_brief JSONB,
        execution_plan JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create mission_results table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS mission_results (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL,
        agent_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        result_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(mission_id, step_number)
      );
    `);
    
    // Create warn_notices table if it doesn't exist (for backward compatibility)
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
    
    // Create sales_navigator_results table if it doesn't exist (for backward compatibility)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_navigator_results (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    client.release();
    console.log('[Orchestrator] Dataroom schema is valid and ready.');
  } catch (err) {
    console.error('[Orchestrator] Database schema verification failed:', err);
    // Don't exit - continue with in-memory fallback
    console.log('[Orchestrator] Continuing with in-memory storage fallback.');
  }
}

// In-memory storage fallback (temporary until database is stable)
const missions = new Map();

// --- Helper Function to Run an Agent ---
async function executeStep(step) {
  console.log(`[Orchestrator] Executing Step ${step.step || 1}: Running agent '${step.agent}'`);
  
  // This logic needs to be enhanced to map blueprint blocks to actual agent services.
  const agentServiceMap = {
    'LinkedIn Sales Navigator': 'scout-selenium-py',
    'Google Search': 'scout-selenium-py', // Use scout-selenium-py as fallback for now
    'Scrape Contacts': 'scout-selenium-py',
    'Source': 'scout-selenium-py', // Handle generic Source blocks
    'Action': 'scout-selenium-py', // Handle generic Action blocks
  };
  
  const serviceToRun = agentServiceMap[step.config?.provider] || agentServiceMap[step.config?.task] || agentServiceMap[step.agent];

  if (serviceToRun) {
    const command = `docker-compose -f /docker-compose.yaml -p vltrn-system up -d ${serviceToRun}`;
    try {
      console.log(`[Orchestrator] Launching service: ${serviceToRun}`);
      const { stdout, stderr } = await execPromise(command);
      if (stderr) console.warn(`[Orchestrator] Stderr during ${serviceToRun} launch:`, stderr);
      console.log(`[Orchestrator] Agent ${serviceToRun} launched successfully.`, stdout);
    } catch (error) {
      console.error(`[Orchestrator] FATAL: Failed to launch agent ${serviceToRun}.`, error);
    }
  } else {
    console.log(`[Orchestrator] Mock execution for step. No runnable agent found for:`, step);
  }
}

// --- API Routes ---

// NEW: Endpoint for visually built blueprints from the frontend
app.post('/api/execute-blueprint', async (req, res) => {
  const blueprint = req.body; // e.g., { missionName: '...', blocks: [...] }
  if (!blueprint || !blueprint.missionName || !blueprint.blocks) {
    return res.status(400).json({ error: 'A valid blueprint object is required.' });
  }

  const planId = `mission-${Date.now()}`;
  console.log(`[Orchestrator] Received Blueprint for new mission: "${blueprint.missionName}" (${planId})`);

  // Transform the UI blueprint into a formal ExecutionPlan
  const executionPlan = {
    planId,
    summary: blueprint.missionName,
    steps: blueprint.blocks.map((block, index) => ({
        step: index + 1,
        agent: block.type, // 'Source', 'Filter', 'Action'
        status: 'pending',
        description: `Execute ${block.type} with config: ${JSON.stringify(block.config)}`,
        config: block.config
    }))
  };

  try {
    // Try to save to database first
    try {
      const client = await pool.connect();
      const insertQuery = `
        INSERT INTO missions (plan_id, status, mission_brief, execution_plan)
        VALUES ($1, $2, $3, $4) RETURNING *;
      `;
      const values = [
        planId, 
        'running', 
        JSON.stringify({ rawPrompt: blueprint.missionName }), 
        JSON.stringify(executionPlan)
      ];
      
      const { rows } = await client.query(insertQuery, values);
      const newMission = rows[0];
      client.release();
      
      console.log(`[Orchestrator] Mission ${newMission.id} saved to database.`);
      
      // Respond to the client immediately
      res.status(202).json({ 
          message: 'Blueprint accepted and mission initiated.', 
          missionId: newMission.id, 
          planId 
      });

      // Execute the first actionable step
      if (executionPlan.steps && executionPlan.steps.length > 0) {
        // For now, we only execute the first actionable step.
        // A true workflow engine would loop through all steps.
        const firstActionableStep = executionPlan.steps.find(s => s.agent === 'Source' || s.agent === 'Action');
        if(firstActionableStep) {
          executeStep(firstActionableStep);
        }
      }
      
    } catch (dbError) {
      console.warn('[Orchestrator] Database save failed, using in-memory fallback:', dbError);
      
      // Fallback to in-memory storage
      const newMission = {
        id: Date.now(),
        plan_id: planId,
        status: 'running',
        mission_brief: { rawPrompt: blueprint.missionName },
        execution_plan: executionPlan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      missions.set(planId, newMission);
      console.log(`[Orchestrator] Mission ${newMission.id} saved to memory.`);

      // Respond to the client immediately
      res.status(202).json({ 
          message: 'Blueprint accepted and mission initiated.', 
          missionId: newMission.id, 
          planId 
      });

      // Execute the first actionable step
      if (executionPlan.steps && executionPlan.steps.length > 0) {
        const firstActionableStep = executionPlan.steps.find(s => s.agent === 'Source' || s.agent === 'Action');
        if(firstActionableStep) {
          executeStep(firstActionableStep);
        }
      }
    }

  } catch (error) {
    console.error('[Orchestrator] Failed to save or execute blueprint:', error);
    res.status(500).json({ error: 'Failed to process blueprint.' });
  }
});

// NEW: Endpoint for VLTRN 6.0 Conversational Canvas workflow
app.post('/api/execute-plan', async (req, res) => {
  const executionPlan = req.body;
  if (!executionPlan || !executionPlan.planId || !executionPlan.steps) {
    return res.status(400).json({ error: 'A valid ExecutionPlan object is required.' });
  }

  console.log(`[Orchestrator] Received ExecutionPlan for mission: "${executionPlan.planId}"`);

  try {
    // Save mission to database
    try {
      const client = await pool.connect();
      const insertQuery = `
        INSERT INTO missions (plan_id, status, mission_brief, execution_plan)
        VALUES ($1, $2, $3, $4) RETURNING *;
      `;
      const values = [
        executionPlan.planId, 
        'running', 
        JSON.stringify(executionPlan.originalBrief || {}), 
        JSON.stringify(executionPlan)
      ];
      
      const { rows } = await client.query(insertQuery, values);
      const newMission = rows[0];
      client.release();
      
      console.log(`[Orchestrator] Mission ${newMission.id} saved to database.`);
      
      // Respond to the client immediately
      res.status(202).json({ 
          message: 'ExecutionPlan accepted and mission initiated.', 
          missionId: newMission.id, 
          planId: executionPlan.planId 
      });

      // Execute the mission steps sequentially
      await executeMissionSteps(executionPlan, newMission.id);
      
    } catch (dbError) {
      console.warn('[Orchestrator] Database save failed, using in-memory fallback:', dbError);
      
      // Fallback to in-memory storage
      const newMission = {
        id: Date.now(),
        plan_id: executionPlan.planId,
        status: 'running',
        mission_brief: executionPlan.originalBrief || {},
        execution_plan: executionPlan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      missions.set(executionPlan.planId, newMission);
      console.log(`[Orchestrator] Mission ${newMission.id} saved to memory.`);

      // Respond to the client immediately
      res.status(202).json({ 
          message: 'ExecutionPlan accepted and mission initiated.', 
          missionId: newMission.id, 
          planId: executionPlan.planId 
      });

      // Execute the mission steps sequentially
      await executeMissionSteps(executionPlan, newMission.id);
    }

  } catch (error) {
    console.error('[Orchestrator] Failed to save or execute plan:', error);
    res.status(500).json({ error: 'Failed to process execution plan.' });
  }
});

// NEW: Enhanced mission execution with data handoffs
async function executeMissionSteps(executionPlan, missionId) {
  console.log(`[Orchestrator] Starting execution of mission ${missionId} with ${executionPlan.steps.length} steps`);
  
  let previousStepOutput = null;
  
  for (let i = 0; i < executionPlan.steps.length; i++) {
    const step = executionPlan.steps[i];
    console.log(`[Orchestrator] Executing step ${i + 1}/${executionPlan.steps.length}: ${step.agent}`);
    
    try {
      // Update step status to running
      await updateStepStatus(missionId, step.step, 'running');
      
      // Execute the step with previous output as input
      const stepResult = await executeStepWithDataHandoff(step, previousStepOutput);
      
      // Store step result
      await storeStepResult(missionId, step.step, step.agent, 'completed', stepResult);
      
      // Pass output to next step
      previousStepOutput = stepResult;
      
      console.log(`[Orchestrator] Step ${step.step} completed successfully`);
      
    } catch (error) {
      console.error(`[Orchestrator] Step ${step.step} failed:`, error);
      await updateStepStatus(missionId, step.step, 'failed');
      await storeStepResult(missionId, step.step, step.agent, 'failed', { error: error.message });
      break; // Stop execution on failure
    }
  }
  
  // Update mission status
  await updateMissionStatus(missionId, 'completed');
  console.log(`[Orchestrator] Mission ${missionId} execution completed`);
}

// NEW: Execute step with data handoff
async function executeStepWithDataHandoff(step, previousOutput) {
  console.log(`[Orchestrator] Executing ${step.agent} with params:`, step.params);
  
  // Map agent names to actual services
  const agentServiceMap = {
    'google-search': 'scout-selenium-py',
    'scout-selenium-py': 'scout-selenium-py',
    'lead-scorer': 'scout-selenium-py', // Placeholder - implement actual lead scorer
    'campaign-crafter': 'scout-selenium-py', // Placeholder - implement actual campaign crafter
    'scout-warn': 'scout-warn',
    'marketer-agent': 'marketer-agent',
    'marketer-enrich': 'marketer-enrich'
  };
  
  const serviceToRun = agentServiceMap[step.agent];
  
  if (serviceToRun) {
    // For now, launch the service and return mock result
    // In production, this would make API calls to the actual services
    const command = `docker-compose -f /docker-compose.yaml -p vltrn-system up -d ${serviceToRun}`;
    try {
      console.log(`[Orchestrator] Launching service: ${serviceToRun}`);
      const { stdout, stderr } = await execPromise(command);
      if (stderr) console.warn(`[Orchestrator] Stderr during ${serviceToRun} launch:`, stderr);
      console.log(`[Orchestrator] Agent ${serviceToRun} launched successfully.`, stdout);
      
      // Return mock result for now
      return {
        step: step.step,
        agent: step.agent,
        status: 'completed',
        output: `Mock output from ${step.agent}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[Orchestrator] FATAL: Failed to launch agent ${serviceToRun}.`, error);
      throw error;
    }
  } else {
    console.log(`[Orchestrator] Mock execution for step. No runnable agent found for:`, step);
    return {
      step: step.step,
      agent: step.agent,
      status: 'completed',
      output: `Mock output from ${step.agent}`,
      timestamp: new Date().toISOString()
    };
  }
}

// NEW: Update step status
async function updateStepStatus(missionId, stepNumber, status) {
  try {
    const client = await pool.connect();
    await client.query(`
      UPDATE mission_results 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE mission_id = $2 AND step_number = $3
    `, [status, missionId, stepNumber]);
    client.release();
  } catch (error) {
    console.warn('[Orchestrator] Failed to update step status in database:', error);
  }
}

// NEW: Store step result
async function storeStepResult(missionId, stepNumber, agentName, status, resultData) {
  try {
    const client = await pool.connect();
    await client.query(`
      INSERT INTO mission_results (mission_id, step_number, agent_name, status, result_data)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (mission_id, step_number) 
      DO UPDATE SET status = $4, result_data = $5, updated_at = CURRENT_TIMESTAMP
    `, [missionId, stepNumber, agentName, status, JSON.stringify(resultData)]);
    client.release();
  } catch (error) {
    console.warn('[Orchestrator] Failed to store step result in database:', error);
  }
}

// NEW: Update mission status
async function updateMissionStatus(missionId, status) {
  try {
    const client = await pool.connect();
    await client.query(`
      UPDATE missions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [status, missionId]);
    client.release();
  } catch (error) {
    console.warn('[Orchestrator] Failed to update mission status in database:', error);
  }
}

// Endpoint to get the status of all missions
app.get('/api/missions', async (req, res) => {
  try {
    // Try database first
    try {
      const client = await pool.connect();
      const { rows } = await client.query('SELECT id, plan_id, status, created_at, updated_at FROM missions ORDER BY created_at DESC');
      client.release();
      res.json(rows);
    } catch (dbError) {
      console.warn('[Orchestrator] Database query failed, using in-memory fallback:', dbError);
      // Fallback to in-memory storage
      const missionList = Array.from(missions.values()).map(mission => ({
        id: mission.id,
        plan_id: mission.plan_id,
        status: mission.status,
        created_at: mission.created_at,
        updated_at: mission.updated_at
      }));
      res.json(missionList);
    }
  } catch (error) {
    console.error('[Orchestrator] Failed to fetch missions:', error);
    res.status(500).json({ error: 'Failed to fetch missions.' });
  }
});

// Legacy endpoints for backward compatibility
app.get('/api/warn-notices', async (req, res) => {
  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM warn_notices ORDER BY notice_date DESC LIMIT 100');
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('[Orchestrator] Error fetching WARN notices:', err);
    res.json([]); // Return empty array as fallback
  }
});

app.get('/api/results/sales-navigator', async (req, res) => {
  console.log('[Orchestrator] Received request for Sales Navigator results.');
  try {
    const client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM sales_navigator_results ORDER BY scraped_at DESC');
    client.release();
    res.json(rows);
  } catch (err) {
    console.error('[Orchestrator] Error fetching results from Dataroom:', err);
    res.json([]); // Return empty array as fallback
  }
});

app.post('/api/launch-agent', async (req, res) => {
  const { agentName, prompt } = req.body;
  if (!agentName) {
    return res.status(400).json({ error: 'agentName is required' });
  }
  console.log(`[Orchestrator] Received dispatch request for agent: ${agentName}`);
  // For now, just log the request - in the future this will be integrated with the new workflow engine
  console.log(`[Orchestrator] Legacy agent launch request for: ${agentName} with prompt: ${prompt}`);
  res.status(202).json({ message: `Mission for agent '${agentName}' has been accepted for execution.` });
});

// --- Server Initialization ---
async function startServer() {
  await verifyDatabaseSchema();
  
  app.listen(port, () => {
    console.log(`🚀 VLTRN Stateful Orchestrator is online and listening on port ${port}.`);
  });
}

startServer().catch(err => {
  console.error("[Orchestrator] Failed to initialize and start server:", err);
  process.exit(1);
});
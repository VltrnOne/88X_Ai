// agents/scout-warn/db.js - v3.2 with Mission Results Table
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env' });
}
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: 'dataroom-db',
  database: 'dataroom',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: 5432,
});

async function initializeSchema() {
  const warnNoticesQuery = `
    CREATE TABLE IF NOT EXISTS warn_notices (
      id SERIAL PRIMARY KEY,
      received_date DATE,
      company_name VARCHAR(255) NOT NULL,
      employee_count INT,
      UNIQUE (company_name, received_date, employee_count)
    );
  `;
  
  const missionsQuery = `
    CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY,
      prompt TEXT,
      parsed_intent JSONB,
      mission_plan JSONB,
      status VARCHAR(50) DEFAULT 'queued',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE
    );
  `;

  // NEW: Query to create the mission_results table
  const resultsQuery = `
    CREATE TABLE IF NOT EXISTS mission_results (
      id SERIAL PRIMARY KEY,
      mission_id INT REFERENCES missions(id) ON DELETE CASCADE,
      agent_name VARCHAR(100),
      contact_name VARCHAR(255),
      contact_email VARCHAR(255) UNIQUE,
      source TEXT,
      enriched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(warnNoticesQuery);
    await pool.query(missionsQuery);
    await pool.query(resultsQuery); // Execute the new query
    console.log('[VLTRN-DB] All tables ("warn_notices", "missions", "mission_results") are ready.');
  } catch (err) {
    console.error('[VLTRN-DB] Error initializing schema:', err);
  }
}

export { pool, initializeSchema };

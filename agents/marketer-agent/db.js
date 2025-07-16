// agents/marketer-agent/db.js

import dotenv from 'dotenv';

// Only load the .env file if we are NOT in a production environment.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env' });
}

import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: 'dataroom-db',
  database: 'dataroom',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: 5432,
});

async function initializeSchema() {
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
    await pool.query(resultsQuery);
    console.log('[VLTRN-DB] Mission results table is ready.');
  } catch (err) {
    console.error('[VLTRN-DB] Error initializing schema:', err);
  }
}

export const query = (text, params) => pool.query(text, params);
export { pool, initializeSchema };
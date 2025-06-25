// db.js
// This module manages the connection to the PostgreSQL database.
require('dotenv').config({ path: '../../.env' });
const { Pool } = require('pg');

// The Pool manages multiple client connections. It will read connection details
// from environment variables by default, but we specify them for clarity.
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.DB_PORT,
});

/**
 * Initializes the database schema. Creates the 'warn_notices' table if it doesn't exist.
 */
async function initializeSchema() {
  const query = `
    CREATE TABLE IF NOT EXISTS warn_notices (
      id SERIAL PRIMARY KEY,
      received_date DATE,
      company_name VARCHAR(255) NOT NULL,
      employee_count INT,
      layoff_type VARCHAR(255),
      location VARCHAR(255),
      address TEXT,
      industry VARCHAR(255),
      source VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('[VLTRN-DB] Table "warn_notices" is ready.');
  } catch (err) {
    console.error('[VLTRN-DB] Error initializing schema:', err);
  }
}

module.exports = {
  pool,
  initializeSchema,
};
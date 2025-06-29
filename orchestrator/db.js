// orchestrator/db.js
const { Pool } = require('pg');

// CORRECTED: Using the correct 'POSTGRES_' prefixed environment variables.
const pool = new Pool({
  host:     process.env.DB_HOST, // Usually localhost, can remain.
  port:     parseInt(process.env.DB_PORT, 10), // Usually 5433, can remain.
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected PG client error', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};
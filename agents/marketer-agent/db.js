// db.js
// This module manages the connection to the PostgreSQL database for the Marketer Agent.
require('dotenv').config({ path: '../../.env' });
const { Pool } = require('pg');

// The Pool will read connection details from the .env file at the project root.
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = {
  // We export a query function that uses the pool to execute queries.
  query: (text, params) => pool.query(text, params),
  // We also export the pool itself to close the connection later.
  pool, 
};
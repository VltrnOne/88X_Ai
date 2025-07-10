// agents/marketer-agent/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10),
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 5000,
});

pool.on('error', err => {
  console.error('[marketer-agent][db] Unexpected PG client error', err);
});

module.exports = { pool };

// agents/scout-warn/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10),
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  // you can bump this if you have long queries:
  connectionTimeoutMillis: 5000,
});

pool.on('error', err => {
  console.error('[scout-warn][db] Unexpected PG client error', err);
});

module.exports = { pool };

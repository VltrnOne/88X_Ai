import pg from 'pg';
const { Pool } = pg;

// The pool will use the environment variables automatically
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'dataroom-db',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'dataroom',
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[VLTRN-DB] Unexpected PG client error', err);
  process.exit(-1);
});

export default {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};
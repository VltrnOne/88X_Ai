import pg from 'pg';
const { Pool } = pg;

// This pool will use the environment variables from docker-compose.yaml
// (POSTGRES_USER, POSTGRES_DB, POSTGRES_PASSWORD) and the service name 'dataroom-db' for the host.
const pool = new Pool({
  host: 'dataroom-db',
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

export default pool;
// File: ~/vltrn-system/agents/marketer-agent/index.js
import dotenv from 'dotenv';
import { query, pool } from './db.js'; // your ./db should export { query, pool }

dotenv.config();   // ← MUST be first!

async function ensureSchema() {
  console.log('[marketer] Verifying Dataroom schema…');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS warn_notices (
        id SERIAL PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[marketer] Schema verified. Table "warn_notices" is ready.');
  } finally {
    client.release();
  }
}

async function main() {
  console.log('[marketer] Agent starting full enrichment process…');

  // 1) make sure our table exists
  await ensureSchema();

  // 2) fetch one notice from scout
  console.log('[marketer] Fetching 1 lead from Dataroom for enrichment test…');
  const { rows } = await query('SELECT * FROM scout_warn_leads LIMIT 1');
  if (rows.length === 0) {
    console.log('[marketer] No leads found in Dataroom to process.');
    await pool.end();
    return;
  }

  const lead = rows[0];
  console.log(`[marketer] Processing lead: ${lead.company_name}`);

  // 3) build your enrichment payload (here just echoing the row)
  const payload = {
    id:           lead.id,
    notice_date:  lead.notice_date,
    company_name: lead.company_name,
    city:         lead.city,
    employees_affected: lead.employees_affected,
    scraped_at:   lead.scraped_at
  };

  // (optional) call external APIs here…

  // 4) insert payload JSON
  await query({
    text: `INSERT INTO warn_notices (payload) VALUES ($1)`,
    values: [payload]
  });
  console.log('[marketer] Inserted payload into warn_notices.');

  await pool.end();
  console.log('[marketer] Dataroom connection closed. Mission complete.');
}

main().catch(err => {
  console.error('[marketer] An error occurred:', err.message);
  process.exit(1);
});

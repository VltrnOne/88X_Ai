// File: agents/marketer-agent/index.js

import dotenv from 'dotenv';
import { Pool } from 'pg';
import axios from 'axios';

dotenv.config();

// Setup Postgres connection pool
const pool = new Pool({
  host:     process.env.PGHOST,
  port:     parseInt(process.env.PGPORT, 10),
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// Ensure enriched_leads table exists with appropriate schema
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enriched_leads (
      id            SERIAL PRIMARY KEY,
      source_id     INTEGER NOT NULL,
      employer_name TEXT,
      layoff_date   DATE,
      domain        TEXT,
      contacts      JSONB,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

// Fetch company domain using Google Custom Search API
async function fetchDomain(company) {
  console.log(`[VLTRN-Marketer][Google] Querying domain for "${company}"…`);
  const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
    params: {
      key: process.env.GOOGLE_API_KEY,
      cx:  process.env.SEARCH_ENGINE_ID,
      q:   `${company} official website`,
    }
  });
  return res.data.items?.[0]?.displayLink || null;
}

// Main pipeline
async function main() {
  try {
    console.log('[VLTRN-Marketer] Starting enrichment…');
    await ensureSchema();

    // Fetch leads to enrich
    const { rows } = await pool.query(
      'SELECT id, employer_name, layoff_date FROM scout_warn_leads;'
    );
    for (const row of rows) {
      const { id, employer_name, layoff_date } = row;
      console.log(`[VLTRN-Marketer] Processing lead: ${employer_name}`);

      if (!employer_name) {
        console.warn('[VLTRN-Marketer] Skipping empty employer_name');
        continue;
      }

      let domain = null;
      try {
        domain = await fetchDomain(employer_name);
      } catch (e) {
        console.error(`[VLTRN-Marketer][Google] API error: ${e.message}`);
      }

      // Insert enriched lead
      await pool.query(
        `INSERT INTO enriched_leads 
           (source_id, employer_name, layoff_date, domain, contacts) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, employer_name, layoff_date, domain, []]
      );
      console.log(`[VLTRN-Marketer] Inserted enriched lead for ${employer_name}`);
    }

    console.log('[VLTRN-Marketer] Done.');
  } catch (err) {
    console.error('[VLTRN-Marketer] Fatal error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

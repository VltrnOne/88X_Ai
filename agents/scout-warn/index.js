// ~/vltrn-system/agents/scout-warn/index.js
require('dotenv').config();
import axios from 'axios';
import cheerio from 'cheerio';
import { pool } from './db.js';

const TARGET_URL =
  'https://edd.ca.gov/en/jobs_and_training/layoff_services_warn/';

async function ensureSchema() {
  console.log('[scout-warn] Verifying table...');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS scout_warn_leads (
        id SERIAL PRIMARY KEY,
        notice_date DATE NOT NULL,
        company_name TEXT NOT NULL,
        city TEXT NOT NULL,
        employees_affected INT NOT NULL,
        scraped_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(notice_date, company_name, city, employees_affected)
      );
    `);
    console.log('[scout-warn] Table is ready.');
  } finally {
    client.release();
  }
}

async function runScoutWarnMission() {
  console.log('[scout-warn] Fetching page…');
  const { data: html } = await axios.get(TARGET_URL);
  const $ = cheerio.load(html);
  const notices = [];

  $('table tbody tr').each((i, row) => {
    const cols = $(row).find('td');
    if (cols.length < 4) return;
    const d = new Date($(cols[0]).text().trim());
    if (isNaN(d)) return;
    notices.push({
      notice_date: d.toISOString().slice(0, 10),
      company_name: $(cols[1]).text().trim(),
      city: $(cols[2]).text().trim(),
      employees_affected:
        parseInt($(cols[3]).text().replace(/\D/g, ''), 10) || 0,
    });
  });

  console.log(`[scout-warn] Scraped ${notices.length} notices.`);

  if (!notices.length) {
    console.log('[scout-warn] No new data → exiting.');
    return;
  }

  const client = await pool.connect();
  try {
    let inserted = 0;
    for (const n of notices) {
      const res = await client.query(
        `
        INSERT INTO scout_warn_leads
          (notice_date, company_name, city, employees_affected)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (notice_date, company_name, city, employees_affected) DO NOTHING
      `,
        [n.notice_date, n.company_name, n.city, n.employees_affected]
      );
      if (res.rowCount) {
        inserted++;
        console.log(`[scout-warn] Inserted ${n.company_name}`);
      }
    }
    console.log(`[scout-warn] ${inserted} new records.`);
  } finally {
    client.release();
  }
}

(async () => {
  try {
    await ensureSchema();
    await runScoutWarnMission();
    console.log('[scout-warn] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[scout-warn] ERROR', err);
    process.exit(1);
  }
})();

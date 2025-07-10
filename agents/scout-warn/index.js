// agents/scout-warn/index.js
require('dotenv').config();
const axios  = require('axios');
const cheerio = require('cheerio');
const { pool } = require('./db');

const TARGET_URL = 'https://edd.ca.gov/en/jobs_and_training/layoff_services_warn/';

async function ensureSchema() {
  console.log('[scout-warn] Verifying Dataroom schema…');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS scout_warn_leads (
        id               SERIAL PRIMARY KEY,
        notice_date      DATE      NOT NULL,
        company_name     TEXT      NOT NULL,
        city             TEXT      NOT NULL,
        employees_affected INT      NOT NULL,
        scraped_at       TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(notice_date, company_name, city, employees_affected)
      );
    `);
    console.log('[scout-warn] Table "scout_warn_leads" is ready.');
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
    const dateText = $(cols[0]).text().trim();
    const d = new Date(dateText);
    if (isNaN(d.getTime())) return;
    notices.push({
      notice_date:      d.toISOString().slice(0,10),
      company_name:     $(cols[1]).text().trim(),
      city:             $(cols[2]).text().trim(),
      employees_affected: parseInt($(cols[3]).text().replace(/\D/g, ''), 10) || 0,
    });
  });

  console.log(`[scout-warn] Scraped ${notices.length} notices.`);

  if (!notices.length) {
    console.log('[scout-warn] No new data → exiting.');
    return;
  }

  console.log('[scout-warn] Inserting new notices into Dataroom…');
  const client = await pool.connect();
  try {
    let inserted = 0;
    for (const n of notices) {
      const res = await client.query(
        `INSERT INTO scout_warn_leads(
           notice_date, company_name, city, employees_affected
         ) VALUES($1,$2,$3,$4)
           ON CONFLICT (notice_date, company_name, city, employees_affected)
           DO NOTHING;`,
        [n.notice_date, n.company_name, n.city, n.employees_affected]
      );
      if (res.rowCount) {
        inserted++;
        console.log(`[scout-warn] Inserted notice for "${n.company_name}"`);
      }
    }
    console.log(`[scout-warn] ${inserted} new records inserted.`);
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

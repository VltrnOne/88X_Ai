// File: agents/scout-warn/index.js
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import XLSX from 'xlsx';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const WARN_URL = process.env.WARN_URL ||
  'https://edd.ca.gov/siteassets/files/jobs_and_training/warn/warn_report1.xlsx';
const WARN_FILE = path.join(process.cwd(), 'data', 'warn_notices.xlsx');

async function downloadExcel() {
  console.log(`[scout-warn] Downloading Excel from ${WARN_URL}`);
  const resp = await axios.get(WARN_URL, { responseType: 'arraybuffer' });
  await fs.mkdir(path.dirname(WARN_FILE), { recursive: true });
  await fs.writeFile(WARN_FILE, resp.data);
  console.log('[scout-warn] Excel saved to', WARN_FILE);
}

async function loadAndInsert() {
  const workbook = XLSX.readFile(WARN_FILE);
  console.log('[scout-warn] Available sheets:', workbook.SheetNames.join(', '));

  const sheetName = workbook.SheetNames.find(n => /detailed\s*warn\s*report/i.test(n));
  if (!sheetName) {
    console.error('[scout-warn] ERROR: no "Detailed WARN Report" sheet found');
    return;
  }
  console.log('[scout-warn] Using sheet:', sheetName);

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
  console.log(`[scout-warn] Parsed ${rows.length} rows`);
  if (rows.length === 0) return;

  // Dynamically detect columns
  const sample = rows[0];
  const allKeys = Object.keys(sample);
  console.log('[scout-warn] Detected columns:', allKeys.join(', '));
  const empKey = allKeys.find(k => /employer|company/i.test(k));
  const dateKey = allKeys.find(k => /notice date|report date|layoff date/i.test(k));
  console.log('[scout-warn] Mapped employer field:', empKey);
  console.log('[scout-warn] Mapped date field:', dateKey);
  if (!empKey || !dateKey) {
    console.error('[scout-warn] ERROR: could not map employer or date columns');
    return;
  }

  // Setup DB
  const pool = new Pool({
    host:     process.env.PGHOST,
    port:     parseInt(process.env.PGPORT, 10),
    user:     process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scout_warn_leads (
      id SERIAL PRIMARY KEY,
      employer_name TEXT NOT NULL,
      notice_date DATE NOT NULL,
      raw JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  let inserted = 0;
  for (const row of rows) {
    const employer = row[empKey] ? String(row[empKey]).trim() : null;
    const dateStr  = row[dateKey];
    const noticeDate = dateStr ? new Date(dateStr) : null;
    if (!employer || isNaN(noticeDate)) continue;
    await pool.query(
      `INSERT INTO scout_warn_leads(employer_name, notice_date, raw)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`,
      [ employer, noticeDate.toISOString().split('T')[0], row ]
    );
    inserted++;
  }
  console.log(`[scout-warn] Successfully inserted ${inserted} rows`);
  await pool.end();
}

(async () => {
  try {
    await downloadExcel();
    await loadAndInsert();
    console.log('[scout-warn] All done.');
  } catch (err) {
    console.error('[scout-warn] Fatal error:', err);
    process.exit(1);
  }
})();

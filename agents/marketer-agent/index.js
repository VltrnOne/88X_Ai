// ~/vltrn-system/agents/marketer-agent/index.js
require('dotenv').config();
import axios from 'axios';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function ensureSchema() {
  console.log('[marketer-agent] Verifying table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS warn_notices (
      id SERIAL PRIMARY KEY,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('[marketer-agent] Table is ready.');
}

async function getCompanyDomain(company) {
  console.log(`[marketer-agent] Searching domain for ${company}`);
  const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.SEARCH_ENGINE_ID}&q=${encodeURIComponent(
    company
  )}`;
  try {
    const { data } = await axios.get(url);
    const link = data.items?.[0]?.link;
    if (!link) return null;
    const hostname = new URL(link).hostname.replace(/^www\./, '');
    console.log(`[marketer-agent] Found domain: ${hostname}`);
    return hostname;
  } catch (err) {
    console.error('[marketer-agent] Google API error', err.message);
    return null;
  }
}

async function getContactsFromGitHub(domain) {
  if (!domain) return [];
  console.log(`[marketer-agent] Searching GitHub commits for ${domain}`);
  const url = `https://api.github.com/search/commits?q=author-email:${domain}`;
  try {
    const res = await axios.get(url, {
      headers: {
        Accept: 'application/vnd.github.cloak-preview',
        Authorization: `token ${process.env.GITHUB_PAT}`,
      },
    });
    const commits = res.data.items || [];
    const emails = new Set();
    commits.forEach((c) => {
      const email = c.commit?.author?.email;
      if (email) emails.add(email);
    });
    return Array.from(emails);
  } catch (err) {
    console.error('[marketer-agent] GitHub API error', err.message);
    return [];
  }
}

async function main() {
  try {
    await ensureSchema();

    const { rows } = await pool.query(
      'SELECT * FROM scout_warn_leads ORDER BY scraped_at DESC LIMIT 1'
    );
    if (!rows.length) {
      console.log('[marketer-agent] No leads → exiting.');
      return;
    }
    const lead = rows[0];
    console.log(`[marketer-agent] Enriching ${lead.company_name}`);

    const domain = await getCompanyDomain(lead.company_name);
    const contacts = await getContactsFromGitHub(domain);

    const payload = { ...lead, domain, contacts };
    await pool.query('INSERT INTO warn_notices (payload) VALUES ($1)', [
      payload,
    ]);
    console.log('[marketer-agent] Inserted enriched payload.');
  } catch (err) {
    console.error('[marketer-agent] FATAL', err);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('[marketer-agent] Done.');
  }
}

main();

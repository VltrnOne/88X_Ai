// agents/marketer-agent/index.js
require('dotenv').config();
const axios = require('axios');
const { pool } = require('./db');

const GOOGLE_API_KEY     = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID   = process.env.SEARCH_ENGINE_ID;
const GITHUB_PAT         = process.env.GITHUB_PAT;

async function getCompanyDomain(companyName) {
  console.log(`[VLTRN-Marketer][Google] Querying domain for "${companyName}"…`);
  const url = 'https://www.googleapis.com/customsearch/v1'
            + `?key=${GOOGLE_API_KEY}`
            + `&cx=${SEARCH_ENGINE_ID}`
            + `&q=${encodeURIComponent(companyName)}`;
  try {
    const res = await axios.get(url);
    const items = res.data.items || [];
    if (!items.length) {
      console.log(`[VLTRN-Marketer][Google] No results for "${companyName}".`);
      return null;
    }
    // take first link and normalize hostname
    const link = new URL(items[0].link).hostname.replace(/^www\./,'');
    console.log(`[VLTRN-Marketer][Google] Found domain: ${link}`);
    return link;
  } catch (err) {
    console.error(`[VLTRN-Marketer][Google] API error:`, err.message);
    return null;
  }
}

async function getContactsFromGitHub(domain) {
  if (!domain) return [];
  console.log(`[VLTRN-Marketer][GitHub] Searching commits for domain: ${domain}`);
  const url = `https://api.github.com/search/commits?q=author-email:${domain}`;
  try {
    const res = await axios.get(url, {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept':        'application/vnd.github.v3+json'
      }
    });
    const commits = res.data.items || [];
    const contacts = commits.map(c => ({
      name:   c.commit.author.name,
      email:  c.commit.author.email,
      source: c.sha.slice(0,7)
    }));
    // dedupe by email
    return [...new Map(contacts.map(c=>[c.email,c])).values()];
  } catch (err) {
    console.error(`[VLTRN-Marketer][GitHub] API error:`, err.message);
    return [];
  }
}

async function ensureSchema() {
  console.log('[VLTRN-Marketer] Verifying warn_notices table…');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS warn_notices (
        id          SERIAL PRIMARY KEY,
        payload     JSONB NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[VLTRN-Marketer] Table "warn_notices" is ready.');
  } finally {
    client.release();
  }
}

async function main() {
  console.log('[VLTRN-Marketer] Starting enrichment…');
  await ensureSchema();

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT * FROM scout_warn_leads LIMIT 1`
    );
    if (!rows.length) {
      console.log('[VLTRN-Marketer] No rows in scout_warn_leads → exiting.');
      return;
    }
    const lead = rows[0];
    console.log(`[VLTRN-Marketer] Processing lead: ${lead.company_name}`);

    const domain   = await getCompanyDomain(lead.company_name);
    const contacts = await getContactsFromGitHub(domain);

    const payload = { ...lead, domain, contacts };
    await client.query(
      `INSERT INTO warn_notices (payload) VALUES ($1)`, 
      [payload]
    );
    console.log('[VLTRN-Marketer] Inserted enriched payload into warn_notices.');
  } finally {
    client.release();
    console.log('[VLTRN-Marketer] Done.');
  }
}

main().catch(err => {
  console.error('[VLTRN-Marketer] Fatal error:', err);
  process.exit(1);
});

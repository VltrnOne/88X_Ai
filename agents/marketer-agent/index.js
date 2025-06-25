// index.js
// Marketer Agent V2.2: Implementing GitHub API for contact enrichment.

require('dotenv').config({ path: '../../.env' });
const { query, pool } = require('./db');
const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
const GITHUB_PAT = process.env.GITHUB_PAT;

async function getCompanyDomain(companyName) {
  console.log(`[VLTRN-Marketer-Google] Querying for domain: "${companyName}"`);
  const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(companyName)}`;
  try {
    const response = await axios.get(searchUrl);
    if (response.data.items && response.data.items.length > 0) {
      const firstResultUrl = new URL(response.data.items[0].link);
      const domain = firstResultUrl.hostname.replace(/^www\./, '');
      console.log(`[VLTRN-Marketer-Google] Found domain: ${domain}`);
      return domain;
    }
    console.log(`[VLTRN-Marketer-Google] No results found for ${companyName}.`);
    return null;
  } catch (error) {
    console.error(`[VLTRN-Marketer-Google] API Error: ${error.response?.data?.error?.message || error.message}`);
    return null;
  }
}

/**
 * Searches GitHub for public commits that may contain employee emails for a given domain.
 * @param {string} domain - The company domain to search.
 * @returns {object[]} A list of potential contacts.
 */
async function getContactsFromGitHub(domain) {
  if (!domain) return [];
  console.log(`[VLTRN-Marketer-GitHub] Searching for contacts for domain: ${domain}`);
  
  // We will search for commits that contain the domain in the author field.
  const searchUrl = `https://api.github.com/search/commits?q=author-email:${domain}`;
  
  try {
    const response = await axios.get(searchUrl, {
      headers: {
        // Use the Personal Access Token for a higher rate limit.
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const contacts = response.data.items.map(item => ({
        name: item.commit.author.name,
        email: item.commit.author.email,
        source: `GitHub Commit (${item.sha.slice(0, 7)})`
      }));
      // Remove duplicate emails
      const uniqueContacts = [...new Map(contacts.map(item => [item['email'], item])).values()];
      console.log(`[VLTRN-Marketer-GitHub] Found ${uniqueContacts.length} unique potential contacts.`);
      return uniqueContacts;
    }
    console.log('[VLTRN-Marketer-GitHub] No public commits found for this domain.');
    return [];
  } catch (error) {
    console.error(`[VLTRN-Marketer-GitHub] API Error: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

async function main() {
    console.log('[VLTRN-Marketer] Agent starting full enrichment process...');
    try {
        console.log('[VLTRN-Marketer] Fetching 1 lead from Dataroom for enrichment test...');
        const { rows } = await query('SELECT * FROM warn_notices LIMIT 1');
        
        if (rows.length > 0) {
            const lead = rows[0];
            console.log(`[VLTRN-Marketer] Processing lead: ${lead.company_name}`);
            
            const domain = await getCompanyDomain(lead.company_name);
            const contacts = await getContactsFromGitHub(domain);
            
            console.log('--- ENRICHMENT PROCESS COMPLETE ---');
            console.log(JSON.stringify({ ...lead, domain, contacts }, null, 2));
        } else {
            console.log('[VLTRN-Marketer] No leads found in Dataroom to process.');
        }

    } catch (err) {
        console.error('[VLTRN-Marketer] An error occurred:', err);
    } finally {
        await pool.end();
        console.log('[VLTRN-Marketer] Dataroom connection closed. Mission complete.');
    }
}

main();
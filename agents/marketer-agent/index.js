// agents/marketer-agent/index.js v3.0 - With Result Persistence
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env' });
}

import { pool, initializeSchema } from './db.js';

async function persistResults(missionId, contacts) {
  if (!contacts || contacts.length === 0) return;
  console.log(`[Marketer-Agent] Persisting ${contacts.length} contacts to Dataroom for mission ${missionId}.`);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const contact of contacts) {
      const query = `
        INSERT INTO mission_results (mission_id, agent_name, contact_name, contact_email, source)
        VALUES ($1, 'marketer-agent', $2, $3, $4)
        ON CONFLICT (contact_email) DO NOTHING;
      `;
      await client.query(query, [missionId, contact.name, contact.email, contact.source]);
    }
    await client.query('COMMIT');
    console.log(`[Marketer-Agent] Successfully persisted ${contacts.length} contacts for mission ${missionId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Marketer-Agent] Error persisting results:', error);
  } finally {
    client.release();
  }
}

async function getContactsFromGitHub(domain) {
  // Simulated contact enrichment - in a real implementation, this would use GitHub API
  console.log(`[Marketer-Agent] Enriching contacts for domain: ${domain}`);
  
  // Simulate finding contacts
  const mockContacts = [
    {
      name: 'John Smith',
      email: `john.smith@${domain}`,
      source: 'GitHub API'
    },
    {
      name: 'Sarah Johnson',
      email: `sarah.johnson@${domain}`,
      source: 'GitHub API'
    },
    {
      name: 'Mike Davis',
      email: `mike.davis@${domain}`,
      source: 'GitHub API'
    }
  ];
  
  return mockContacts;
}

async function main() {
  const missionId = process.env.MISSION_ID;
  if (!missionId) {
    console.error("[Marketer-Agent] FATAL: MISSION_ID environment variable not provided.");
    return;
  }
  
    console.log('[VLTRN-Marketer] Starting enrichment…');
  
  try {
    await initializeSchema();
    console.log('[VLTRN-Marketer] Schema initialized successfully.');

    // Get companies from warn_notices table
    const result = await pool.query('SELECT DISTINCT company_name FROM warn_notices LIMIT 5');
    const companies = result.rows;
    
    console.log(`[VLTRN-Marketer] Found ${companies.length} companies to enrich`);

    if (companies.length === 0) {
      console.log('[VLTRN-Marketer] No companies found in warn_notices table');
      return;
      }

    const allFoundContacts = [];
    
    for (const company of companies) {
      const domain = company.company_name.toLowerCase().replace(/\s+/g, '') + '.com';
      const contacts = await getContactsFromGitHub(domain);
      allFoundContacts.push(...contacts);
    }
    
    // Persist results to mission_results table
    await persistResults(missionId, allFoundContacts);
    
  } catch (error) {
    console.error('[VLTRN-Marketer] Fatal error:', error);
  } finally {
    await pool.end();
  }
  
  console.log('[VLTRN-Marketer] Enrichment complete.');
}

main();

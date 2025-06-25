// index.js
// The Marketer Agent's mission is to read leads from the Dataroom and process them.

// Import the query function and pool from our database module.
const { query, pool } = require('./db');

/**
 * The main execution function for the Marketer Agent.
 */
async function main() {
  console.log('[VLTRN-Marketer] Agent starting...');
  
  try {
    // 1. Fetch all records from the warn_notices table.
    console.log('[VLTRN-Marketer] Fetching leads from Dataroom...');
    const selectQuery = 'SELECT * FROM warn_notices';
    const { rows } = await query(selectQuery);

    console.log(`[VLTRN-Marketer] Successfully fetched ${rows.length} records.`);
    
    if (rows.length > 0) {
      console.log('[VLTRN-Marketer] Sample of fetched data:');
      // Log the first 2 records as a sample.
      console.log(JSON.stringify(rows.slice(0, 2), null, 2));
    }

    // This is where enrichment logic (e.g., calling Apollo.io) will be added later.
    console.log('[VLTRN-Marketer] Enrichment step placeholder.');

  } catch (err) {
    console.error('[VLTRN-Marketer] An error occurred:', err);
  } finally {
    // Close the database connection pool to allow the script to exit.
    await pool.end();
    console.log('[VLTRN-Marketer] Dataroom connection closed. Mission complete.');
  }
}

main();
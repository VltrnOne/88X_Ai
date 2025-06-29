// CORRECTED: This line MUST be first to load the .env file before any other code runs.
require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db.js');

const TARGET_URL = 'https://edd.ca.gov/en/jobs_and_training/layoff_services_warn/';

async function ensureSchema() {
    console.log('[scout-warn] Verifying Dataroom schema...');
    const client = await db.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS scout_warn_leads (
                id SERIAL PRIMARY KEY,
                notice_date DATE NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                employees_affected INT NOT NULL,
                scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(notice_date, company_name, city, employees_affected)
            );
        `);
        console.log('[scout-warn] Schema verified. Table "scout_warn_leads" is ready.');
    } finally {
        client.release();
    }
}

async function runScoutWarnMission() {
    console.log(`[scout-warn] Mission starting. Target: ${TARGET_URL}`);
    const client = await db.connect();

    try {
        const { data } = await axios.get(TARGET_URL);
        const $ = cheerio.load(data);
        const notices = [];
        $('table tbody tr').each((i, element) => {
            const columns = $(element).find('td');
            if (columns.length >= 4) {
                const notice = {
                    notice_date: new Date($(columns[2]).text().trim()),
                    company_name: $(columns[0]).text().trim(),
                    city: $(columns[1]).text().trim(),
                    employees_affected: parseInt($(columns[3]).text().trim(), 10) || 0,
                };
                notices.push(notice);
            }
        });
        console.log(`[scout-warn] Successfully scraped ${notices.length} notices.`);

        if (notices.length > 0) {
            console.log('[scout-warn] Inserting new notices into Dataroom...');
            let insertedCount = 0;
            for (const notice of notices) {
                const query = {
                    text: `INSERT INTO scout_warn_leads(notice_date, company_name, city, employees_affected)
                           VALUES($1, $2, $3, $4)
                           ON CONFLICT (notice_date, company_name, city, employees_affected) DO NOTHING;`,
                    values: [notice.notice_date, notice.company_name, notice.city, notice.employees_affected],
                };
                const result = await client.query(query);
                if (result.rowCount > 0) {
                    insertedCount++;
                    console.log(`  -> Inserted notice for '${notice.company_name}'`);
                }
            }
            console.log(`[scout-warn] ${insertedCount} new records inserted into the Dataroom.`);
        }

    } catch (error) {
        console.error('[scout-warn] A critical error occurred during the mission:', error.message);
        process.exit(1);
    } finally {
        await client.release();
        console.log('[scout-warn] Dataroom client released.');
    }
    console.log('[scout-warn] Mission complete.');
}

(async () => {
    try {
        await ensureSchema();
        await runScoutWarnMission();
    } catch (err) {
        console.error("[scout-warn] Failed to initialize and run mission:", err.message);
        process.exit(1);
    }
})();
const axios = require('axios');
const xlsx = require('xlsx');
// Import the database pool and schema initializer from our new db.js module.
const { pool, initializeSchema } = require('./db');

const TARGET_URL = 'https://edd.ca.gov/siteassets/files/jobs_and_training/warn/warn_report1.xlsx';

function normalizeData(rawData) {
    const normalizedEvents = [];
    const headers = rawData[1];
    const dataRows = rawData.slice(2);
    const headerMapping = {
        'Received\r\nDate': 'received_date',
        'Company': 'company_name',
        'City/ \r\nCounty': 'location',
        'No. Of\r\nEmployees': 'employee_count',
        'Layoff/\r\nClosure': 'layoff_type'
    };

    dataRows.forEach(row => {
        if (row.length === 0) return;
        const event = {};
        headers.forEach((header, index) => {
            const cleanHeader = headerMapping[header];
            if (cleanHeader) {
                // Convert Excel date serial number to JS Date if it's the date column
                if (cleanHeader === 'received_date' && typeof row[index] === 'number') {
                    event[cleanHeader] = new Date(Date.UTC(0, 0, row[index] - 1));
                } else {
                    event[cleanHeader] = row[index];
                }
            }
        });
        if (event.company_name && event.employee_count) {
            normalizedEvents.push(event);
        }
    });
    return normalizedEvents;
}

/**
 * Inserts multiple WARN notice records into the database.
 * @param {object[]} events - An array of event objects to insert.
 */
async function insertData(events) {
    // Exit if there are no events to insert.
    if (events.length === 0) {
        console.log('[VLTRN-DB] No new data to insert.');
        return;
    }

    const client = await pool.connect();
    console.log(`[VLTRN-DB] Inserting ${events.length} records into "warn_notices"...`);

    try {
        // We use a transaction to ensure all records are inserted successfully, or none are.
        await client.query('BEGIN');

        for (const event of events) {
            const query = `
                INSERT INTO warn_notices (received_date, company_name, employee_count, layoff_type, location)
                VALUES ($1, $2, $3, $4, $5)
            `;
            const values = [
                event.received_date,
                event.company_name,
                event.employee_count,
                event.layoff_type,
                event.location
            ];
            await client.query(query, values);
        }

        await client.query('COMMIT');
        console.log('[VLTRN-DB] Successfully committed all records.');
    } catch (err) {
        // If any error occurs, roll back the transaction.
        await client.query('ROLLBACK');
        console.error('[VLTRN-DB] Error during data insertion. Transaction rolled back.', err);
    } finally {
        // Release the database client back to the pool.
        client.release();
    }
}


async function main() {
    console.log('[VLTRN-Scout-WARN] Agent starting...');
    await initializeSchema(); // Ensure the table exists.

    console.log(`[VLTRN-Scout-WARN] Downloading file: ${TARGET_URL}`);
    const { data } = await axios.get(TARGET_URL, { responseType: 'arraybuffer' });
    console.log('[VLTRN-Scout-WARN] Download complete. Parsing workbook...');
    
    const workbook = xlsx.read(data);
    const sheetName = 'Detailed WARN Report ';
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    const layoffEvents = normalizeData(rawData);
    console.log(`[VLTRN-Scout-WARN] Normalization complete. Found ${layoffEvents.length} valid records.`);

    await insertData(layoffEvents);

    console.log('[VLTRN-Scout-WARN] Mission complete.');
    // Close the database pool to allow the script to exit cleanly.
    await pool.end();
}

main().catch(err => {
    console.error("An unhandled error occurred in the main execution block:", err);
    pool.end();
});
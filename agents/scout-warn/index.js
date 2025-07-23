// agents/scout-warn/index.js - v2.2 with Fixed Excel Parsing
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env' });
}

import { pool, initializeSchema } from './db.js';
import axios from 'axios';
import xlsx from 'xlsx';

const TARGET_URL = 'https://edd.ca.gov/siteassets/files/jobs_and_training/warn/warn_report1.xlsx';

function normalizeData(rawData) {
    const normalizedEvents = [];
    const dataRows = rawData.slice(2); // Skip header rows
    
    for (const row of dataRows) {
        if (!row || row.length < 8) continue;
        
        // Based on the detected headers, map the columns
        // The Excel structure shows: WARN REPORT - 07/01/25 to 07/14/2025, __EMPTY, __EMPTY_1, etc.
        // We need to find the actual data columns
        const employer = row[0] || row[1]; // Try first two columns for employer
        const dateStr = row[2] || row[3]; // Try columns 3-4 for date
        const employeeCount = row[4] || row[5]; // Try columns 5-6 for employee count
        
        if (!employer || !dateStr) continue;
        
        // Parse the date
        let parsedDate;
        try {
            parsedDate = new Date(dateStr);
            if (isNaN(parsedDate.getTime())) {
                // Try alternative date parsing
                const dateMatch = dateStr.toString().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                if (dateMatch) {
                    parsedDate = new Date(dateMatch[3], dateMatch[1] - 1, dateMatch[2]);
                }
            }
        } catch (e) {
            console.log(`[scout-warn] Could not parse date: ${dateStr}`);
            continue;
        }
        
        if (isNaN(parsedDate.getTime())) continue;
        
        // Parse employee count
        let employeeCountNum = 0;
        if (employeeCount) {
            const countMatch = employeeCount.toString().match(/(\d+)/);
            if (countMatch) {
                employeeCountNum = parseInt(countMatch[1]);
            }
        }
        
        normalizedEvents.push({
            company_name: employer.toString().trim(),
            received_date: parsedDate,
            employee_count: employeeCountNum
        });
    }
    
    return normalizedEvents;
}

async function main() {
    console.log('[scout-warn] Starting scout-warn agent...');
    
    try {
        await initializeSchema();
        console.log('[scout-warn] Schema initialized successfully.');
        
        console.log('[scout-warn] Downloading Excel from', TARGET_URL);
        const response = await axios.get(TARGET_URL, { responseType: 'arraybuffer' });
        
        const workbook = xlsx.read(response.data, { type: 'buffer' });
        const sheetName = 'Detailed WARN Report ';
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
            console.error('[scout-warn] Sheet not found:', sheetName);
    return;
  }
        
        const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('[scout-warn] Parsed', rawData.length, 'rows');

        // Log the first few rows to understand the structure
        console.log('[scout-warn] First 3 rows:', rawData.slice(0, 3));
        
        const normalizedEvents = normalizeData(rawData);
        console.log('[scout-warn] Normalized', normalizedEvents.length, 'events');
        
        if (normalizedEvents.length === 0) {
            console.log('[scout-warn] No valid events found. Raw data sample:', rawData.slice(0, 5));
    return;
  }

        // Insert into database
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            for (const event of normalizedEvents) {
                const query = `
                    INSERT INTO warn_notices (company_name, received_date, employee_count)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (company_name, received_date, employee_count) DO NOTHING
                `;
                await client.query(query, [event.company_name, event.received_date, event.employee_count]);
            }
            
            await client.query('COMMIT');
            console.log('[scout-warn] Successfully inserted', normalizedEvents.length, 'WARN notices');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[scout-warn] Database error:', error);
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('[scout-warn] Error:', error);
    } finally {
  await pool.end();
}

    console.log('[scout-warn] All done.');
  }

main();

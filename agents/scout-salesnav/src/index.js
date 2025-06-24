import express from 'express';
 import axios from 'axios';
 import * as cheerio from 'cheerio';

 const PORT = process.env.PORT || 8080;
 const CA_WARN_URL = 'https://edd.ca.gov/en/jobs_and_training/warn_report_listing/';

 const app = express();
 app.get('/healthz', (_req, res) => res.status(200).send('OK'));

 // This agent now takes no input, its mission is hardcoded.
 app.post('/execute-task', async (_req, res) => {
     console.log('[VLTRN-WARN-SCOUT] Mission Start. Targeting CA WARN notices...');
     try {
         const { data } = await axios.get(CA_WARN_URL);
         const $ = cheerio.load(data);
         const layoffEvents = [];

         // Find the table and iterate over each row, skipping the header
         $('#warn-report table tbody tr').slice(1).each((_i, row) => {
             const columns = $(row).find('td');
             if (columns.length >= 7) {
                 const companyName = $(columns[2]).text().trim();
                 const employeeCount = parseInt($(columns[5]).text().trim(), 10);
                 if (companyName && !isNaN(employeeCount) && employeeCount > 0) {
                     layoffEvents.push({
                         source: 'CA_WARN_NOTICES',
                         company: companyName,
                         affected_employees: employeeCount,
                         location: $(columns[3]).text().trim(),
                         notice_date: $(columns[0]).text().trim(),
                     });
                 }
             }
         });

         console.log(`[VLTRN-WARN-SCOUT] SUCCESS. Ingested ${layoffEvents.length} corporate layoff events.`);
         res.status(200).json({ status: 'success', event_count: layoffEvents.length, events: layoffEvents });

     } catch (error) {
         console.error('[VLTRN-WARN-SCOUT] MISSION FAILURE:', error.message);
         res.status(500).json({ status: 'error', message: 'Failed to ingest WARN act data.', details: error.message });
     }
 });

 app.listen(PORT, () => {
     console.log(`🤖 VLTRN WARN Scout Agent is online on port ${PORT}`);
 });
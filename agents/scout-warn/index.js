const axios = require('axios');
const xlsx = require('xlsx');

const TARGET_URL = 'https://edd.ca.gov/siteassets/files/jobs_and_training/warn/warn_report1.xlsx';

/**
 * Takes the raw data from the worksheet and maps it to a clean JSON format.
 * @param {any[][]} rawData - An array of arrays from the XLSX parser.
 * @returns {object[]} An array of cleaned layoff event objects.
 */
function normalizeData(rawData) {
  const normalizedEvents = [];
  // From inspection, we know the actual headers are on the second row (index 1).
  const headers = rawData[1]; 
  // The actual data starts on the row after the headers.
  const dataRows = rawData.slice(2); 

  const headerMapping = {
    'Received\r\nDate': 'receivedDate',
    'Company': 'companyName',
    'City/ \r\nCounty': 'location',
    'No. Of\r\nEmployees': 'employeeCount',
    'Layoff/\r\nClosure': 'layoffType',
    'Address': 'address',
    'Related Industry': 'industry'
  };

  dataRows.forEach(row => {
    // Skip empty rows
    if (row.length === 0) return;

    const event = {};
    headers.forEach((header, index) => {
      const cleanHeader = headerMapping[header];
      if (cleanHeader) {
        event[cleanHeader] = row[index];
      }
    });
    
    // Only add if the event has key information
    if (event.companyName && event.employeeCount) {
      normalizedEvents.push(event);
    }
  });

  return normalizedEvents;
}

async function processWarnExcel() {
  console.log(`[VLTRN-Scout-WARN] Initializing download for: ${TARGET_URL}`);
  try {
    const { data } = await axios.get(TARGET_URL, { responseType: 'arraybuffer' });
    console.log('[VLTRN-Scout-WARN] File downloaded. Parsing workbook...');
    
    const workbook = xlsx.read(data);
    const sheetName = 'Detailed WARN Report ';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in the workbook.`);
    }

    // Convert the sheet to a raw array of arrays, ignoring library headers.
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Normalize the raw data into clean JSON.
    const layoffEvents = normalizeData(rawData);

    console.log(`[VLTRN-Scout-WARN] Normalization complete. Found ${layoffEvents.length} valid records.`);
    console.log('[VLTRN-Scout-WARN] Sample of structured data:');
    console.log(JSON.stringify(layoffEvents.slice(0, 3), null, 2));

    return layoffEvents;

  } catch (error) {
    console.error('[VLTRN-Scout-WARN] An error occurred during the operation:', error.message);
  }
}

processWarnExcel();
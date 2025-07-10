import puppeteer from 'puppeteer';
import db from './db.js'; // Import the new database connector

const mission = async () => {
  console.log('[Scout-SalesNav] Mission launched.');
  let browser = null;
  const missionData = {};

  try {
    // --- Phase 1: Scraping ---
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/sales/navigator');
    missionData.title = await page.title();
    console.log(`[Scout-SalesNav] Target acquired. Title: "${missionData.title}"`);
    await browser.close();

    // --- Phase 2: Persistence ---
    console.log('[Scout-SalesNav] Connecting to Dataroom to save results...');
    const client = await db.connect();
    const query = 'INSERT INTO sales_navigator_results(title, scraped_at) VALUES($1, NOW())';
    await client.query(query, [missionData.title]);
    client.release();
    console.log('[Scout-SalesNav] Results successfully saved to Dataroom.');

  } catch (error) {
    console.error('[Scout-SalesNav] A critical error occurred:', error);
  } finally {
    console.log('[Scout-SalesNav] Mission complete.');
    process.exit(0);
  }
};

mission();
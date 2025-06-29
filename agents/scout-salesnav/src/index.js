// agents/scout-salesnav/src/index.js

const puppeteer = require('puppeteer-core');
const db = require('../db');

// --- Environment Variable Validation ---
const { BROWSER_ENDPOINT, LINKEDIN_EMAIL, LINKEDIN_PASSWORD, SEARCH_URL } = process.env;

if (!BROWSER_ENDPOINT || !LINKEDIN_EMAIL || !LINKEDIN_PASSWORD || !SEARCH_URL) {
  console.error('FATAL: Missing one or more required environment variables.');
  console.error('Ensure BROWSER_ENDPOINT, LINKEDIN_EMAIL, LINKEDIN_PASSWORD, and SEARCH_URL are set.');
  process.exit(1);
}

// --- Database Insertion Logic ---
async function saveLeadsToDatabase(leads) {
  if (!leads || leads.length === 0) {
    console.log('No leads found to save.');
    return;
  }

  const client = await db.connect();
  console.log('Successfully connected to the database.');

  try {
    for (const lead of leads) {
      const query = {
        text: `INSERT INTO sales_navigator_leads(full_name, title, location, profile_url, source_url)
               VALUES($1, $2, $3, $4, $5)
               ON CONFLICT (profile_url) DO NOTHING;`,
        values: [lead.name, lead.title, lead.location, lead.url, SEARCH_URL],
      };
      await client.query(query);
    }
    console.log(`Successfully processed and saved/ignored ${leads.length} leads into the Dataroom.`);
  } catch (err) {
    console.error('Error during database insertion:', err.stack);
    // Propagate the error to fail the Kubernetes Job
    throw err;
  } finally {
    client.release();
    console.log('Database client released.');
  }
}

// --- Main Scraping Logic ---
async function main() {
  console.log('Connecting to remote browser...');
  const browser = await puppeteer.connect({ browserWSEndpoint: BROWSER_ENDPOINT });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });

  console.log('Navigating to LinkedIn login page...');
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
  
  await page.type('#username', LINKEDIN_EMAIL);
  await page.type('#password', LINKEDIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  console.log('Login successful.');

  console.log(`Navigating to Sales Navigator search URL...`);
  await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.artdeco-list__item', { timeout: 60000 });
  console.log('Search results page loaded.');

  console.log('Scraping leads from page...');
  // Note: LinkedIn selectors can be volatile. This is a best-effort selector.
  const leads = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('li.artdeco-list__item').forEach(item => {
      const nameElement = item.querySelector('a[data-an-action="view-profile"] .artdeco-entity-lockup__title');
      const titleElement = item.querySelector('.artdeco-entity-lockup__subtitle');
      const locationElement = item.querySelector('dd[title="Geography"]');

      if (nameElement && nameElement.href) {
        results.push({
          name: nameElement.innerText.trim(),
          title: titleElement ? titleElement.innerText.trim() : 'N/A',
          location: locationElement ? locationElement.innerText.trim() : 'N/A',
          url: nameElement.href.split('?')[0] // Clean URL
        });
      }
    });
    return results;
  });
  console.log(`Scraped ${leads.length} potential leads from the page.`);

  if (leads.length > 0) {
    await saveLeadsToDatabase(leads);
  }

  await browser.close();
  console.log('Browser closed. Mission complete.');
}

// --- Execution ---
main().catch(err => {
  console.error('A critical error occurred, failing the job:', err);
  process.exit(1);
});
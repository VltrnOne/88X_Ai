// agents/marketer-enrich/index.js
const axios = require('axios');
const db = require('./db');

// --- Validate Environment Variables ---
const { GITHUB_PAT, BRIGHTDATA_API_TOKEN } = process.env;
if (!GITHUB_PAT || !BRIGHTDATA_API_TOKEN) {
    console.error('FATAL: Missing GITHUB_PAT or BRIGHTDATA_API_TOKEN environment variables.');
    process.exit(1);
}

const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: { 'Authorization': `token ${GITHUB_PAT}` }
});

/**
 * STAGE 1: Attempt to find a public email on a user's GitHub profile.
 */
async function enrichWithGitHub(lead) {
    try {
        console.log(`[GitHub] Searching for user: ${lead.full_name}`);
        const searchResponse = await githubApi.get(`/search/users?q=${encodeURIComponent(lead.full_name)}`);

        if (searchResponse.data.items.length === 0) {
            console.log(`[GitHub] No users found for ${lead.full_name}.`);
            return null;
        }

        // For simplicity, we check the first result. A more advanced version could iterate.
        const userUrl = searchResponse.data.items[0].url;
        const userResponse = await githubApi.get(userUrl);
        const userData = userResponse.data;

        // Check if the user's company matches and if they have a public email.
        if (userData.company && userData.company.toLowerCase().includes(lead.company_name.toLowerCase()) && userData.email) {
            console.log(`[GitHub] SUCCESS: Found matching profile with email for ${lead.full_name}.`);
            return userData.email;
        } else {
             console.log(`[GitHub] User found, but company or email did not match.`);
        }

    } catch (error) {
        console.error(`[GitHub] Error during enrichment for ${lead.full_name}:`, error.message);
    }
    return null;
}

/**
 * STAGE 2: If GitHub fails, use a SERP API to search Google for a public email.
 */
async function enrichWithGoogle(lead) {
    console.log(`[Google] Searching for: ${lead.full_name} at ${lead.company_name}`);
    const query = `"<span class="math-inline">\{lead\.full\_name\}" "</span>{lead.company_name}" email OR contact`;

    try {
        const response = await axios.post('https://api.brightdata.com/serp/req', {
            country: 'US',
            query: query
        }, {
            headers: { 'Authorization': `Bearer ${BRIGHTDATA_API_TOKEN}` }
        });

        // Regular expression to find email addresses
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
        const responseText = JSON.stringify(response.data);
        const emailsFound = responseText.match(emailRegex);

        if (emailsFound && emailsFound.length > 0) {
            // Filter out common non-contact emails
            const validEmail = emailsFound.find(email => !email.includes('example.com') && !email.includes('wixpress.com'));
            if (validEmail) {
                console.log(`[Google] SUCCESS: Found potential email: ${validEmail}`);
                return validEmail;
            }
        }
         console.log(`[Google] No email found in search results.`);

    } catch (error) {
        console.error('[Google] Error during SERP API call:', error.message);
    }
    return null;
}

/**
 * MAIN FUNCTION: Fetches leads and orchestrates the enrichment cascade.
 */
async function main() {
    console.log('--- Marketer-Enrich Agent mission START ---');
    const client = await db.connect();
    try {
        // Fetch 5 leads from the 'scout_warn_leads' table that do not have an email.
        // In a real system, you'd also check other lead tables.
        const res = await client.query("SELECT id, full_name, company_name FROM scout_warn_leads WHERE contact_email IS NULL LIMIT 5");
        const leads = res.rows;

        if (leads.length === 0) {
            console.log('No unenriched leads found. Mission complete.');
            return;
        }

        console.log(`Found ${leads.length} leads to enrich.`);

        for (const lead of leads) {
            let email = await enrichWithGitHub(lead);
            if (!email) {
                email = await enrichWithGoogle(lead);
            }

            if (email) {
                await client.query("UPDATE scout_warn_leads SET contact_email = $1 WHERE id = $2", [email, lead.id]);
                console.log(`SUCCESS: Updated lead ${lead.full_name} with email ${email}`);
            } else {
                console.log(`FAILURE: Could not find an email for lead ${lead.full_name}.`);
                // Optionally, mark as 'enrichment_failed' to avoid re-running
                // await client.query("UPDATE scout_warn_leads SET enrichment_status = 'failed' WHERE id = $1", [lead.id]);
            }
            console.log('---');
        }

    } finally {
        client.release();
        console.log('Database client released. Mission END.');
    }
}

main().catch(err => console.error('A critical error occurred in the main function:', err));
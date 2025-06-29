const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// --- CORRECTED EXPORTS ---
// We now export the pool's `connect` function directly, along with the query helper.
module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect(),
};
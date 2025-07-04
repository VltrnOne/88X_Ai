import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import bcrypt from 'bcrypt';
import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken';
import { runAgentContainer } from './agent-runner.js';

async function ensureSchema() {
  console.log('[VLTRN-Orchestrator] Verifying Dataroom schema...');
  const client = await db.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`);
    await client.query(`CREATE TABLE IF NOT EXISTS scout_warn_leads (id SERIAL PRIMARY KEY, notice_date DATE NOT NULL, company_name VARCHAR(255) NOT NULL, city VARCHAR(255) NOT NULL, employees_affected INT NOT NULL, scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, UNIQUE(notice_date, company_name, city, employees_affected));`);
    const testUser = await client.query("SELECT * FROM users WHERE email = 'jay@vltrn.agency'");
    if (testUser.rows.length === 0) {
      console.log('[VLTRN-Orchestrator] Test user not found. Creating test user...');
      const passwordHash = await bcrypt.hash('password123', 10);
      await client.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", ['jay@vltrn.agency', passwordHash]);
      console.log('[VLTRN-Orchestrator] Test user created successfully.');
    }
  } finally {
    client.release();
    console.log('[VLTRN-Orchestrator] Schema verification complete. Dataroom is ready.');
  }
}

const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: function (origin, callback) { if (!origin || allowedOrigins.indexOf(origin) !== -1) { callback(null, true); } else { callback(new Error('Not allowed by CORS')); } } }));
app.use(express.json());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwtVerify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get('/', (req, res) => res.json({ status: "VLTRN Orchestrator Online" }));

app.post('/login', async (req, res) => {
  console.log(`[TRACE] /login endpoint hit at ${new Date().toISOString()}`);
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (isValid) {
        const token = jwtSign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
      }
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/warn-notices', authenticateToken, async (req, res) => { /* ... */ });
app.post('/api/missions', authenticateToken, async (req, res) => { /* ... */ });

async function startServer() {
  try {
    await ensureSchema();
    const PORT = process.env.PORT || 8080;
    // --- THIS IS THE FINAL CORRECTION ---
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`VLTRN Orchestrator is online on port ${PORT}.`);
    });
  } catch (err) {
    console.error("FATAL: Failed to initialize and start server:", err);
    process.exit(1);
  }
}

startServer();
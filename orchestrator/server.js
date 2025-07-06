// ~/vltrn-system/orchestrator/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { runAgentContainer } from './agent-runner.js';

const { sign, verify } = jwt;

async function ensureSchema() {
  console.log('⏳ [Orchestrator] Verifying schema...');
  const client = await db.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS scout_warn_leads (
        id SERIAL PRIMARY KEY,
        notice_date DATE NOT NULL,
        company_name TEXT NOT NULL,
        city TEXT NOT NULL,
        employees_affected INT NOT NULL,
        scraped_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS warn_notices (
        id SERIAL PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
  console.log('✅ [Orchestrator] Schema ready.');
}

const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(
  cors({
    origin(origin, cb) {
      cb(null, !origin || allowedOrigins.includes(origin));
    },
  })
);
app.use(express.json());

// --- auth middleware ---
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.sendStatus(401);
  try {
    req.user = verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.sendStatus(403);
  }
};

// --- routes ---
app.get('/', (req, res) => {
  res.json({ status: 'Orchestrator Online' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (!rows.length) return res.status(401).send('No such user');
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).send('Bad creds');
    const token = sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get('/api/warn-notices', authenticate, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM warn_notices');
  res.json(rows);
});

app.post('/api/missions', authenticate, async (req, res) => {
  const { agent } = req.body;
  if (!['scout-warn', 'marketer-agent'].includes(agent)) {
    return res.status(400).send('Unknown agent');
  }
  const result = await runAgentContainer(agent);
  if (result.success) return res.status(200).send('OK');
  return res.status(500).send('Agent failed');
});

// --- start ---
async function start() {
  await ensureSchema();
  const port = parseInt(process.env.PORT, 10) || 8080;
  app.listen(port, () => {
    console.log(`🚀 Orchestrator listening on port ${port}`);
  });
}

start().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});

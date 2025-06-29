require('dotenv').config();

// Diagnostic trace can be removed now, but leaving it is fine for future debugging.
console.log('--- BEGIN VLTRN DIAGNOSTIC TRACE ---');
console.log('Verifying credentials as seen by the server...');
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'MISSING');
console.log('--- END VLTRN DIAGNOSTIC TRACE ---');

const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// CORRECTED: Updated CORS policy to accept multiple origins.
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "VLTRN Orchestrator Online" });
});

app.post('/login', async (req, res) => {
  console.log('Login endpoint hit');
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (isValid) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`VLTRN Orchestrator is online on port ${PORT}.`);
});
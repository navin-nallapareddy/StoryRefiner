const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');
const { Pool } = require('pg');
const fs = require('fs');
const geoip = require('geoip-lite');

const app = express();
app.use(cors());
app.use(express.json());

const APP_ENV = process.env.APP_ENV || 'PROD';
const userStoriesTable = APP_ENV === 'TEST' ? 'tt_user_stories' : 'user_stories';
const aiResponsesTable = APP_ENV === 'TEST' ? 'tt_ai_responses' : 'ai_responses';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// User tracking middleware
app.use((req, res, next) => {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',').shift() ||
    req.socket?.remoteAddress ||
    null;
  const geo = ip ? geoip.lookup(ip) : null;

  req.location = {
    country: geo?.country || null,
    state: geo?.region || null,
    city: geo?.city || null
  };

  const logEntry = {
    time: new Date().toISOString(),
    ip,
    location: req.location,
    userAgent: req.headers['user-agent'],
    url: req.originalUrl,
    method: req.method
  };
  fs.appendFile('user_log.json', JSON.stringify(logEntry) + '\n', err => {
    if (err) console.error('Failed to log user info', err);
  });
  next();
});

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Define root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to download the user log
app.get('/download-log', (req, res) => {
  res.download(path.join(__dirname, 'user_log.json'));
});

// API endpoint
app.post('/api/openai', async (req, res) => {
  const { prompt } = req.body;
  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({
      result: chat.choices[0].message.content,
      raw: chat
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Seed test data using request body and caller location
app.post('/seed-test', async (req, res) => {
  const { original_story, original_criteria } = req.body;
  const { country, state, city } = req.location;

  try {
    const insert = await pool.query(
      `INSERT INTO ${userStoriesTable} (original_story, original_criteria, country, state, city) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [original_story, original_criteria, country, state, city]
    );
    res.json(insert.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to persist user stories and AI responses
app.post('/user-story', async (req, res) => {
  const {
    action,
    original_story,
    original_criteria,
    country: bodyCountry,
    state: bodyState,
    city: bodyCity,
    ratings,
    rewritten_story,
    rewritten_assumptions,
    rewritten_criteria,
    raw_response
  } = req.body;

  const country = bodyCountry || req.location.country;
  const state = bodyState || req.location.state;
  const city = bodyCity || req.location.city;

  if (!action || !original_story) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userStoryInsert = await client.query(
      `INSERT INTO ${userStoriesTable} (original_story, original_criteria, country, state, city) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [original_story, original_criteria, country, state, city]
    );
    const userStoryId = userStoryInsert.rows[0].id;

    await client.query(
      `INSERT INTO ${aiResponsesTable} (user_story_id, action, ratings, rewritten_story, rewritten_assumptions, rewritten_criteria, raw_response) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        userStoryId,
        action,
        ratings ? JSON.stringify(ratings) : null,
        rewritten_story || null,
        rewritten_assumptions || null,
        rewritten_criteria || null,
        raw_response ? JSON.stringify(raw_response) : null
      ]
    );

    await client.query('COMMIT');
    console.log(`[INSERT] user_story_id=${userStoryId} action=${action}`);
    res.json({ user_story_id: userStoryId, status: 'ok' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

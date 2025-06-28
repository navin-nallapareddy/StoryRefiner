const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');
const fs = require('fs');
const geoip = require('geoip-lite');

const app = express();
app.use(cors());
app.use(express.json());

// User tracking middleware
app.use((req, res, next) => {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',').shift() ||
    req.socket?.remoteAddress ||
    null;
  const geo = ip ? geoip.lookup(ip) : null;
  const logEntry = {
    time: new Date().toISOString(),
    ip,
    location: geo,
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
    res.json({ result: chat.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

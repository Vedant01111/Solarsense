import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory rate limit for AI routes: 20 requests per minute per IP.
const hits = new Map();
app.use('/api/ai', (req, res, next) => {
  const now = Date.now(), list = (hits.get(req.ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 20) return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  hits.set(req.ip, [...list, now]); next();
});

app.use('/api', router);
app.listen(process.env.PORT || 3001, () => console.log('SolarSense API on port ' + (process.env.PORT || 3001)));

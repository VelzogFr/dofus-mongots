import express, { type NextFunction, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import itemRoutes from './features/items/item.route.js';
import setRoutes from './features/sets/set.route.js';
import monsterRoutes from './features/monsters/monster.route.js';
import mountRoutes from './features/mounts/mount.route.js';
import statsRoutes from './features/stats/stats.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from .env');
}

mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes (les pages, dont index.html sur "/", sont servies par express.static)
app.use('/api/items', itemRoutes);
app.use('/api/sets', setRoutes);
app.use('/api/monsters', monsterRoutes);
app.use('/api/mounts', mountRoutes);
app.use('/api/stats', statsRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not found' });
});

// Express 5 transmet ici les erreurs des handlers async
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
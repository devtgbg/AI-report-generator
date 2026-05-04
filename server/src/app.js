import express from 'express';
import cors from 'cors';
import jobRoutes from './routes/jobRoutes.js';
import { config } from './config/env.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/health', (req, res) => res.send({ status: 'ok', region: config.zuper.region }));

export default app;

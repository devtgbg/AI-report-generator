import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jobRoutes from './routes/jobRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { config } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../../dist');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => res.send({ status: 'ok', region: config.zuper.region }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/|health$).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

export default app;

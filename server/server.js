import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const required = ['OPENAI_API_KEY', 'MONGODB_URI'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.warn(`Missing environment variables: ${missing.join(', ')}. AI requests will not work until configured.`);
}

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
);
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use(
  '/api/chat',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many chat requests. Please try again shortly.' }
  })
);
app.use('/api', chatRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

try {
  await connectDatabase();
  app.listen(port, () => console.log(`Nexus AI server listening on http://localhost:${port}`));
} catch (error) {
  console.error(`Unable to start server: ${error.message}`);
  process.exitCode = 1;
}


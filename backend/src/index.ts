import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// API Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Blockchain Certificate Verification Platform API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Version Endpoint
app.get('/api/version', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    version: '1.0.0',
    service: 'Academic Certificate Backend Service',
    nodeVersion: process.version
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Backend] Server listening on port ${PORT}`);
    console.log(`[Backend] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Backend] Version check: http://localhost:${PORT}/api/version`);
  });
}

export default app;

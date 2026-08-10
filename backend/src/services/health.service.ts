import { getDb } from '../config/database.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  database: {
    connected: boolean;
    tablesCount: number;
  };
  memoryUsage: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
  };
}

export class HealthService {
  static async checkHealth(): Promise<HealthStatus> {
    const memory = process.memoryUsage();
    let dbConnected = false;
    let tablesCount = 0;

    try {
      const db = await getDb();
      const rows = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'").get() as { count: number };
      dbConnected = true;
      tablesCount = rows ? rows.count : 0;
    } catch {
      dbConnected = false;
    }

    return {
      status: dbConnected ? 'healthy' : 'degraded',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbConnected,
        tablesCount,
      },
      memoryUsage: {
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      },
    };
  }

  static getVersion() {
    return {
      service: 'Blockchain Academic Certificate Verification Platform API',
      version: '1.0.0',
      apiVersion: 'v1',
      nodeVersion: process.version,
      architecture: process.arch,
      platform: process.platform,
    };
  }
}

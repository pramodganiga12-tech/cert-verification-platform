process.env.NODE_ENV = 'test';

import test, { describe } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import app from '../index.js';
import { closeDb, initDatabaseInstance } from '../config/database.js';
import { ApiSuccessPayload, ApiErrorPayload } from '../utils/apiResponse.js';
import { HealthStatus } from '../services/health.service.js';

describe('Backend Foundation & API Health Unit Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  test('Start test server instance', async () => {
    await initDatabaseInstance();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr !== null) {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
    assert.ok(baseUrl);
  });

  test('GET /api/health should return 200 OK and healthy payload', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as ApiSuccessPayload<HealthStatus>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'healthy');
    assert.ok(body.data.database.connected);
  });

  test('GET /api/version should return 200 OK with system version', async () => {
    const res = await fetch(`${baseUrl}/api/version`);
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as ApiSuccessPayload<{ version: string; apiVersion: string }>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.version, '1.0.0');
    assert.strictEqual(body.data.apiVersion, 'v1');
  });

  test('GET /api/unknown-route should return 404 NOT_FOUND error format', async () => {
    const res = await fetch(`${baseUrl}/api/unknown-route`);
    assert.strictEqual(res.status, 404);

    const body = (await res.json()) as ApiErrorPayload;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'NOT_FOUND');
  });

  test('Close test server and DB connection', async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDb();
  });
});

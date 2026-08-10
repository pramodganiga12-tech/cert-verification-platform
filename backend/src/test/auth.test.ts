process.env.NODE_ENV = 'test';

import test, { describe } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import app from '../index.js';
import { closeDb, initDatabaseInstance } from '../config/database.js';
import { ApiSuccessPayload, ApiErrorPayload } from '../utils/apiResponse.js';
import { LoginResult } from '../services/auth.service.js';

describe('Authentication & Authorization (RBAC) API Unit Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let accessToken: string;
  let refreshToken: string;

  test('Start test server instance & initialize DB', async () => {
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

  test('POST /api/auth/login with valid admin credentials should return 200 OK and tokens', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@platform.local',
        password: 'Admin@123456',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<LoginResult>;
    assert.strictEqual(body.success, true);
    assert.ok(body.data.accessToken);
    assert.ok(body.data.refreshToken);
    assert.strictEqual(body.data.user.email, 'admin@platform.local');
    assert.strictEqual(body.data.user.role, 'ADMIN');
    assert.ok(Array.isArray(body.data.user.permissions));

    accessToken = body.data.accessToken;
    refreshToken = body.data.refreshToken;
  });

  test('POST /api/auth/login with wrong password should return 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@platform.local',
        password: 'WrongPassword123',
      }),
    });

    assert.strictEqual(res.status, 401);
    const body = (await res.json()) as ApiErrorPayload;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'UNAUTHORIZED');
  });

  test('GET /api/auth/me with valid Bearer token should return profile', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<{ email: string; role: string }>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, 'admin@platform.local');
    assert.strictEqual(body.data.role, 'ADMIN');
  });

  test('GET /api/auth/me without token should return 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(res.status, 401);
    const body = (await res.json()) as ApiErrorPayload;
    assert.strictEqual(body.success, false);
  });

  test('POST /api/auth/refresh should rotate refresh token and issue new access token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<{ accessToken: string; refreshToken: string }>;
    assert.strictEqual(body.success, true);
    assert.ok(body.data.accessToken);
    assert.ok(body.data.refreshToken);

    // Update active tokens
    accessToken = body.data.accessToken;
    refreshToken = body.data.refreshToken;
  });

  test('POST /api/auth/logout should invalidate session', async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<null>;
    assert.strictEqual(body.success, true);

    // Verify token is now rejected
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.strictEqual(meRes.status, 401);
  });

  test('Close test server and DB connection', async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDb();
  });
});

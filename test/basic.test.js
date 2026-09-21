/** @filetype Integration tests — starts a local server for health/HTML checks */

import { beforeAll, afterAll, test, expect } from 'vitest';
import { execSync, spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.TEST_PORT || 8080;
const BASE = process.env.E2E_BASE || `http://localhost:${PORT}`;
let serverProcess = null;

// Build and start server
beforeAll(async () => {
  execSync('npm run build', {
    cwd: join(__dirname, '..'),
    stdio: 'ignore',
  });
  serverProcess = spawn('node', ['server.js'], {
    cwd: join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Wait for server using fetch retry
  const start = Date.now();
  while (Date.now() - start < 8000) {
    try {
      const r = await fetch(`${BASE}/healthz`);
      if (r.ok) break;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
});

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess.unref();
  }
});

test('/healthz returns 200 with JSON', async () => {
  const response = await fetch(`${BASE}/healthz`);
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.status).toBe('ok');
  expect(typeof body.uptime).toBe('number');
});

test('index page returns HTML with game title', async () => {
  const response = await fetch(BASE);
  expect(response.ok).toBe(true);
  const html = await response.text();
  expect(html).toContain('Daggerheart');
  expect(html).toContain('Asteroids');
  expect(html).toContain('id="app"');
});

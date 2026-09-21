import { test, expect } from 'vitest';

test('server responds with game HTML', async () => {
  const response = await fetch('http://localhost:8080/');
  expect(response.ok).toBe(true);
  expect(response.headers.get('content-type')).toContain('text/html');
});

test('HTML contains correct title', async () => {
  const response = await fetch('http://localhost:8080/');
  const html = await response.text();
  expect(html).toContain('Daggerheart');
  expect(html).toContain('Asteroids');
});

test('HTML contains app container and loading element', async () => {
  const response = await fetch('http://localhost:8080/');
  const html = await response.text();
  expect(html).toContain('id="app"');
  expect(html).toContain('id="loading"');
});

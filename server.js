import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT) || 8080;
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;

  // SPA fallback: all non-file routes go to index.html
  if (!path.extname(pathname) || pathname.endsWith('/')) {
    pathname = '/index.html';
  }

  const filepath = path.join(DIST, pathname);
  const ext = path.extname(pathname);

  // Security: prevent directory traversal
  if (!filepath.startsWith(DIST)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filepath, (err, data) => {
    if (err || !data) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`DaggerHeart Asteroids on :${PORT}`);
});

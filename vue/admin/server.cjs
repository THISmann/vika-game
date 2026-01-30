/**
 * Minimal production server for admin SPA (base /vika-admin/).
 * Serves dist at /vika-admin with SPA fallback.
 * Usage: node server.cjs (run from vue/admin after npm run build)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 5174;
const BASE = '/vika-admin';
const DIST = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (!url.startsWith(BASE)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const subPath = url.slice(BASE.length) || '/';
  const file = path.join(DIST, subPath === '/' ? 'index.html' : subPath);

  fs.readFile(file, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(DIST, 'index.html'), (e, d) => {
          if (e) {
            res.writeHead(404);
            res.end();
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(d);
        });
        return;
      }
      res.writeHead(500);
      res.end();
      return;
    }
    const ext = path.extname(file);
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin production server at http://0.0.0.0:${PORT}${BASE}/`);
});

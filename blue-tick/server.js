import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchInstagramProfile, proxyAvatarImage } from './server/instagramService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');

const PORT = process.env.PORT || 5173;
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer(async (req, res) => {
  // Global CORS & tunnel headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. API: Instagram profile detection
  if (pathname.startsWith('/api/instagram/')) {
    const username = pathname.replace('/api/instagram/', '').split('?')[0];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

    try {
      const data = await fetchInstagramProfile(username);
      res.end(JSON.stringify(data));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ exists: false, error: err.message }));
    }
    return;
  }

  // 2. API: Instagram avatar proxy
  if (pathname === '/api/avatar-proxy') {
    const targetUrl = parsedUrl.searchParams.get('url');
    if (!targetUrl) {
      res.statusCode = 400;
      res.end('Missing url param');
      return;
    }
    await proxyAvatarImage(targetUrl, res);
    return;
  }

  // 3. Payment.php Proxy (if PHP server is running on 8080)
  if (pathname.startsWith('/payment.php')) {
    const proxyReq = http.request(
      {
        host: '127.0.0.1',
        port: 8080,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', () => {
      // If PHP server is not running, redirect to the native React /payment route
      res.writeHead(302, { Location: '/payment' });
      res.end();
    });

    req.pipe(proxyReq);
    return;
  }

  // 4. Static Files from dist/
  let filePath = path.join(DIST_DIR, pathname);

  // Security check: ensure path is within DIST_DIR
  if (!filePath.startsWith(DIST_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  try {
    const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;

    if (stat && stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Immutable caching for Vite hashed assets
      if (pathname.startsWith('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }

      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  } catch (err) {
    console.error('File serve error:', err);
  }

  // 5. SPA Fallback: Serve dist/index.html for all other routes
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'no-cache');
    fs.createReadStream(indexPath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Please run "npm run build" first to generate the dist/ directory.');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.warn(`⚠️ Port ${PORT} is already in use. Trying port ${nextPort}...`);
    server.listen(nextPort, HOST);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, HOST, () => {
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : PORT;
  console.log(`\n==================================================`);
  console.log(`🚀 VerifyAssist Server running on RDP!`);
  console.log(`👉 Local:   http://localhost:${actualPort}`);
  console.log(`👉 Network: http://${HOST}:${actualPort}`);
  console.log(`==================================================\n`);
});

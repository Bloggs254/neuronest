import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const port=Number(process.env.PORT||4173);
http.createServer(async (req, res) => { try { const url = new URL(req.url, 'http://localhost'); const pathname=decodeURIComponent(url.pathname); const relative = pathname === '/' ? 'index.html' : `${pathname.replace(/^\/+/, '')}${pathname.endsWith('/')?'index.html':''}`; const file = path.resolve(root, relative); if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; } const body = await readFile(file); res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }); res.end(body); } catch { res.writeHead(404).end('Not found'); } }).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));

/** Dependency-free loopback static server for exported snapshots. */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const directory = path.resolve(process.argv[2] ?? '.');
const port = Number(process.argv[3] ?? 8080);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Choose a port from 1024 to 65535.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.pdf': 'application/pdf' };
http.createServer(async (request, response) => {
  try {
    const filename = path.resolve(directory, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    const relative = path.relative(directory, filename);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403).end(); return; }
    const candidate = (await fs.stat(filename)).isDirectory() ? path.join(filename, 'index.html') : filename;
    const real = await fs.realpath(candidate); const realRelative = path.relative(directory, real);
    if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) { response.writeHead(403).end(); return; }
    const bytes = await fs.readFile(real); response.writeHead(200, { 'Content-Type': types[path.extname(real)] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }); response.end(bytes);
  } catch { response.writeHead(404).end('File not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Serving ${directory}\nOpen http://127.0.0.1:${port}/`));

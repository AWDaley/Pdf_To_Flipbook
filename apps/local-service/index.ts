import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { z, ZodError } from 'zod';
import { conversionLimitsSchema, qualitySchema, readerSettingsSchema, type ConversionLimits } from '../../packages/shared/index';
import { assertNoSymlinks, safePath } from '../../packages/shared/files';
import { ProjectStore, ServiceError } from './store';

const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.zip': 'application/zip', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
function equalToken(actual: unknown, expected: string): boolean {
  if (typeof actual !== 'string') return false;
  const a = Buffer.from(actual), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
function decodedHeader(request: FastifyRequest, name: string, fallback = ''): string {
  const value = request.headers[name];
  if (typeof value !== 'string') return fallback;
  try { return decodeURIComponent(value); } catch { throw new ServiceError(400, 'An upload filename or title is malformed.'); }
}
async function sendFile(reply: FastifyReply, filename: string): Promise<FastifyReply> {
  await assertNoSymlinks(filename);
  const stats = await fs.stat(filename);
  if (!stats.isFile()) throw new ServiceError(404, 'File not found.');
  return reply.type(mime[path.extname(filename)] ?? 'application/octet-stream').header('Content-Length', stats.size).send(createReadStream(filename));
}

export interface ServiceOptions {
  dev?: boolean;
  projectRoot?: string;
  capability?: string;
  serveUi?: boolean;
  limits?: Partial<ConversionLimits>;
}

export async function createService(options: ServiceOptions = {}) {
  const store = new ProjectStore(options.projectRoot, options.limits);
  const app = Fastify({ logger: false, bodyLimit: store.limits.maxInputBytes, requestTimeout: 120_000 });
  await store.initialize();
  const capability = options.capability ?? randomBytes(32).toString('hex');
  app.decorate('paperboundCapability', capability);
  const authenticated = (request: FastifyRequest) => {
    if (equalToken(request.headers['x-paperbound-capability'], capability)) return true;
    const cookie = request.headers.cookie?.split(';').map((value) => value.trim()).find((value) => value.startsWith('paperbound_session='));
    return equalToken(cookie?.slice('paperbound_session='.length), capability);
  };
  app.addHook('onRequest', async (request, reply) => {
    const host = request.headers.host;
    const address = app.server.address();
    const port = typeof address === 'object' && address ? address.port : undefined;
    const allowedHosts = port ? [`127.0.0.1:${port}`, `localhost:${port}`] : ['127.0.0.1', 'localhost'];
    if (!host || !allowedHosts.includes(host)) throw new ServiceError(403, 'Use the loopback URL printed by Tervoro Digital Publishing.');
    const origin = request.headers.origin;
    if (origin && origin !== `http://${host}`) throw new ServiceError(403, 'Requests from other websites are not allowed.');
    const fetchSite = request.headers['sec-fetch-site'];
    if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') throw new ServiceError(403, 'Requests from other websites are not allowed.');
    reply.header('X-Content-Type-Options', 'nosniff').header('Referrer-Policy', 'no-referrer').header('Cross-Origin-Resource-Policy', 'same-origin');
    reply.header('Cache-Control', 'no-store');
    if (request.url.startsWith('/api/') && request.url.split('?')[0] !== '/api/health') {
      if (!authenticated(request)) throw new ServiceError(401, 'This browser needs the launch link with its capability. Open the complete URL printed in the terminal.');
      if (!['GET', 'HEAD'].includes(request.method) && !equalToken(request.headers['x-paperbound-capability'], capability)) {
        throw new ServiceError(401, 'This action requires the launch capability header. Reload using the printed launch link.');
      }
    }
  });
  app.setErrorHandler((error, _request, reply) => {
    const status = error instanceof ZodError ? 400 : (error as { statusCode?: number }).statusCode ?? ((error as NodeJS.ErrnoException).code === 'ENOENT' ? 404 : 500);
    const message = error instanceof ZodError ? 'Invalid project settings or metadata. Reload the project and check the entered values.' : (error as Error).message;
    reply.code(status).send({ error: message });
  });
  app.addContentTypeParser('application/pdf', { parseAs: 'buffer' }, (_request, body, done) => done(null, body));
  app.addContentTypeParser(/^image\//, { parseAs: 'buffer', bodyLimit: 20 * 1024 * 1024 }, (_request, body, done) => done(null, body));

  app.get('/api/health', async () => ({ status: 'ok', mode: 'local', version: '0.1.0' }));
  app.post('/api/session', async (_request, reply) => {
    reply.header('Set-Cookie', `paperbound_session=${capability}; Path=/api/; HttpOnly; SameSite=Strict`);
    return { ready: true };
  });
  app.get('/api/projects', async () => ({ projects: await store.list() }));
  app.get('/api/config', async () => ({ limits: store.limits }));
  app.post('/api/projects', async (request, reply) => {
    if (!Buffer.isBuffer(request.body) || !request.headers['content-type']?.startsWith('application/pdf')) throw new ServiceError(415, 'Upload the selected PDF file as application/pdf.');
    const project = await store.importPdf(request.body, decodedHeader(request, 'x-file-name', 'document.pdf'), decodedHeader(request, 'x-project-title') || undefined);
    return reply.code(202).send({ project });
  });
  app.get<{ Params: { id: string } }>('/api/projects/:id', async (request) => ({ project: await store.get(request.params.id), progress: store.progress(request.params.id) }));
  app.get<{ Params: { id: string } }>('/api/projects/:id/cover', async (request, reply) => {
    const { manifest } = await store.manifest(request.params.id);
    return sendFile(reply, await store.asset(request.params.id, manifest.pages[0].thumbnail.path));
  });
  app.get<{ Params: { id: string } }>('/api/projects/:id/manifest', async (request) => {
    const { manifest } = await store.manifest(request.params.id);
    for (const page of manifest.pages) {
      page.image.path = `assets/${page.image.path}`;
      page.zoomImage.path = `assets/${page.zoomImage.path}`;
      page.thumbnail.path = `assets/${page.thumbnail.path}`;
      if (page.textPath) page.textPath = `assets/${page.textPath}`;
    }
    if (manifest.settings.backgroundImage) manifest.settings.backgroundImage = `assets/${manifest.settings.backgroundImage}`;
    return manifest;
  });
  app.get<{ Params: { id: string; '*': string } }>('/api/projects/:id/assets/*', async (request, reply) => sendFile(reply, await store.asset(request.params.id, request.params['*'])));
  const settingsInput = z.object({ revision: z.number().int().positive(), title: z.string().trim().min(1).max(240), settings: readerSettingsSchema }).strict();
  app.put<{ Params: { id: string } }>('/api/projects/:id/settings', async (request) => {
    const input = settingsInput.parse(request.body);
    return { project: await store.saveSettings(request.params.id, input.revision, input.title, input.settings) };
  });
  app.post<{ Params: { id: string } }>('/api/projects/:id/convert', async (request, reply) => {
    const input = z.object({ revision: z.number().int().positive(), quality: qualitySchema }).strict().parse(request.body);
    return reply.code(202).send({ project: await store.startConversion(request.params.id, input.revision, input.quality) });
  });
  app.post<{ Params: { id: string } }>('/api/projects/:id/cancel', async (request) => ({ project: await store.cancel(request.params.id) }));
  app.post<{ Params: { id: string } }>('/api/projects/:id/background', { bodyLimit: 20 * 1024 * 1024 }, async (request) => {
    if (!Buffer.isBuffer(request.body)) throw new ServiceError(415, 'Upload a supported image file.');
    return { path: await store.saveBackground(request.params.id, request.body) };
  });
  app.post<{ Params: { id: string } }>('/api/projects/:id/export', async (request) => {
    const input = z.object({ revision: z.number().int().positive(), includeOriginal: z.boolean().default(false) }).strict().parse(request.body);
    const result = await store.export(request.params.id, input.revision, input.includeOriginal);
    return { folder: result.folder, downloadUrl: `/api/projects/${request.params.id}/exports/${result.exportId}.zip`, singleFileUrl: `/api/projects/${request.params.id}/exports/${result.exportId}.html` };
  });
  app.get<{ Params: { id: string; exportId: string } }>('/api/projects/:id/exports/:exportId.zip', async (request, reply) => {
    reply.header('Content-Disposition', 'attachment; filename="tervoro-digital-publication.zip"');
    return sendFile(reply, await store.exportZip(request.params.id, request.params.exportId));
  });
  app.get<{ Params: { id: string; exportId: string } }>('/api/projects/:id/exports/:exportId.html', async (request, reply) => {
    reply.header('Content-Disposition', 'attachment; filename="tervoro-digital-publication.html"');
    return sendFile(reply, await store.exportHtml(request.params.id, request.params.exportId));
  });

  let vite: Awaited<ReturnType<typeof import('vite')['createServer']>> | undefined;
  if (options.serveUi !== false) {
    if (options.dev) {
      const { createServer } = await import('vite');
      vite = await createServer({
        server: {
          middlewareMode: true,
          hmr: { server: app.server },
          watch: { ignored: ['**/data/**', '**/artifacts/**', '**/test-output/**', '**/.test-*/**', '**/test-results/**', '**/playwright-report/**'] },
          fs: { strict: true, allow: [process.cwd()], deny: ['**/.env', '**/.env.*', '**/.git/**', '**/data/**', '**/fixtures/**'] },
        },
        appType: 'spa',
      });
      app.setNotFoundHandler((request, reply) => {
        if (request.url.startsWith('/api/')) return reply.code(404).send({ error: 'API route not found.' });
        reply.hijack();
        vite!.middlewares(request.raw, reply.raw, () => { reply.raw.statusCode = 404; reply.raw.end('Page not found.'); });
      });
    } else {
      const studio = path.resolve('dist/studio');
      app.setNotFoundHandler(async (request, reply) => {
        if (request.url.startsWith('/api/') || !['GET', 'HEAD'].includes(request.method)) return reply.code(404).send({ error: 'Not found.' });
        const pathname = new URL(request.url, 'http://localhost').pathname;
        let relative: string;
        try { relative = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html'; }
        catch { throw new ServiceError(400, 'Invalid URL.'); }
        return sendFile(reply, await safePath(studio, relative));
      });
    }
  }
  app.addHook('onClose', async () => { await vite?.close(); await store.close(); });
  return { app, store, capability };
}

async function main() {
  const dev = process.argv.includes('--dev');
  const configuredPort = Number(process.env.PAPERBOUND_PORT ?? 4173);
  if (!Number.isInteger(configuredPort) || configuredPort < 1024 || configuredPort > 65535) throw new Error('PAPERBOUND_PORT must be between 1024 and 65535.');
  let limits: Partial<ConversionLimits> = {};
  if (process.env.PAPERBOUND_LIMITS) {
    try { limits = conversionLimitsSchema.partial().parse(JSON.parse(process.env.PAPERBOUND_LIMITS)); }
    catch (error) { throw new Error('PAPERBOUND_LIMITS must contain valid JSON with supported conversion limits.', { cause: error }); }
  }
  const service = await createService({ dev, limits });
  try { await service.app.listen({ host: '127.0.0.1', port: configuredPort }); }
  catch (error) { await service.app.close(); throw error; }
  console.log(`Tervoro Digital Publishing is running locally.\nOpen http://127.0.0.1:${configuredPort}/#cap=${service.capability}\nProjects stay in ${service.store.root}\nPress Ctrl+C to stop.`);
  let closing = false;
  const shutdown = async () => { if (closing) return; closing = true; await service.app.close(); };
  process.once('SIGINT', () => { void shutdown(); });
  process.once('SIGTERM', () => { void shutdown(); });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
}

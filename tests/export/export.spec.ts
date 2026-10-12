import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createService } from '../../apps/local-service/index';
import { exportBook } from '../../packages/exporter/index';
import { manifestSchema } from '../../packages/shared/index';

let server: Server; let origin: string; let stoppedCreator: string; let folder: string;
const mime: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp' };
// Playwright requires object destructuring for the fixtures parameter.
// eslint-disable-next-line no-empty-pattern
test.beforeAll(async ({}, info) => {
  const outputRoot = path.resolve('artifacts', `export-${info.project.name}-${Date.now()}`);
  const service = await createService({ projectRoot: path.join(outputRoot, 'project-store'), serveUi: false });
  await service.app.listen({ host: '127.0.0.1', port: 0 });
  const creatorAddress = service.app.server.address();
  stoppedCreator = `http://127.0.0.1:${typeof creatorAddress === 'object' ? creatorAddress?.port : 0}`;
  // The package is built while a creator is available, then tested after its shutdown.
  const manifest = manifestSchema.parse(JSON.parse(await fs.readFile('public/demo/manifest.json', 'utf8')));
  manifest.settings.backgroundColor = '#dce5db'; manifest.settings.motionPreference = 'full';
  manifest.pages[8]!.links.push({ x: .05, y: .3, width: .6, height: .08, label: 'Example website', target: { type: 'external', href: 'https://example.com/' } });
  await fs.mkdir(path.join(outputRoot, 'background'), { recursive: true });
  await fs.copyFile(path.join('public/demo', manifest.pages[5]!.thumbnail.path), path.join(outputRoot, 'background', 'quiet.webp'));
  manifest.settings.backgroundImage = 'background/quiet.webp';
  let result: Awaited<ReturnType<typeof exportBook>>;
  try { result = await exportBook({ buildDirectory: path.resolve('public/demo'), outputDirectory: path.join(outputRoot, 'fieldnotes'), manifest, backgroundDirectory: outputRoot }); }
  catch (error) { await service.app.close(); throw error; }
  folder = result.folder;
  expect((await fs.stat(result.zipPath)).size).toBeGreaterThan(10000);
  const standaloneHtml = await fs.readFile(path.join(folder, 'index.html'), 'utf8');
  expect(standaloneHtml).toContain('__PAPERBOUND_EMBEDDED_MANIFEST__');
  expect(standaloneHtml).toContain('__PAPERBOUND_EMBEDDED_TEXT__');
  expect(standaloneHtml).toContain('<style>');
  expect(standaloneHtml).toContain('<script>');
  expect(await fs.readFile(path.join(folder, 'reader.js'))).toEqual(await fs.readFile('dist/reader/reader.js'));
  expect(await fs.readFile(path.join(folder, 'reader.css'))).toEqual(await fs.readFile('dist/reader/reader.css'));
  await expect(fs.stat(path.join(folder, 'original.pdf'))).rejects.toThrow();
  await service.app.close();
  await expect(fetch(`${stoppedCreator}/api/health`)).rejects.toThrow();
  server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
      if (!pathname.startsWith('/shelf/fieldnotes/')) { response.writeHead(404).end(); return; }
      const relative = decodeURIComponent(pathname.slice('/shelf/fieldnotes/'.length)) || 'index.html';
      const file = path.resolve(folder, relative);
      if (!file.startsWith(folder + path.sep)) { response.writeHead(403).end(); return; }
      const bytes = await fs.readFile(file); response.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream' }); response.end(bytes);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); origin = `http://127.0.0.1:${typeof address === 'object' ? address?.port : 0}`;
});
test.afterAll(async () => { if (server) await new Promise<void>(resolve => server.close(() => resolve())); });

test('independent non-root export keeps animation, appearance, links, zoom, thumbnails and search offline', async ({ page, context }, info) => {
  const rejected: string[] = [];
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    rejected.push(route.request().url()); return route.abort('blockedbyclient');
  });
  await page.goto(`${origin}/shelf/fieldnotes/`);
  const stage = page.getByTestId('book-stage');
  await expect(stage).toHaveAttribute('data-state', 'idle'); await expect(stage).toHaveAttribute('data-page', '1');
  await expect(page.locator('.reader')).toHaveCSS('background-color', 'rgb(220, 229, 219)');
  await expect(page.locator('.reader')).toHaveCSS('background-image', /data:image\/webp;base64/);
  const bounds = await page.locator('.reader').boundingBox(); expect(bounds!.height).toBeGreaterThan(600);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(stage).toHaveAttribute('data-state', 'settling');
  await page.screenshot({ path: info.outputPath('offline-cover-turn.png') });
  await expect(stage).toHaveAttribute('data-state', 'idle'); await expect(stage).toHaveAttribute('data-page', '2-3');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(stage).toHaveAttribute('data-page', '4-5'); await expect(stage).toHaveAttribute('data-state', 'idle');
  await page.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(stage).toHaveAttribute('data-state', 'settling'); await expect(stage).toHaveAttribute('data-page', '2-3');
  await page.getByRole('button', { name: 'Thumbnails', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Open page / })).toHaveCount(10);
  await page.getByRole('button', { name: 'Open page 6', exact: true }).click();
  await expect(stage).toHaveAttribute('data-page', '6-7'); await expect(stage).toHaveAttribute('data-state', 'idle');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click(); await expect(stage).toHaveAttribute('data-state', 'zoomed');
  await page.getByRole('button', { name: 'Reset view', exact: true }).click(); await expect(stage).toHaveAttribute('data-state', 'idle');
  await page.getByRole('button', { name: 'Search text', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search this book' }).fill('headphones');
  await expect(page.locator('.reader-search-results')).toContainText('Page 9');
  await page.locator('.reader-search-results button').click(); await expect(stage).toHaveAttribute('data-page', '8-9');
  await page.getByRole('button', { name: 'Close reader panel' }).click();
  await expect(page.getByRole('link', { name: 'Example website', exact: true })).toHaveAttribute('href', 'https://example.com/');
  await page.getByRole('button', { name: 'Contents', exact: true }).click();
  await expect(page.locator('.reader-panel .reader-result')).not.toHaveCount(0);
  await page.getByRole('button', { name: 'Close reader panel' }).click();
  const manifest = JSON.parse(await fs.readFile(path.join(folder, 'manifest.json'), 'utf8'));
  const external = manifest.pages.flatMap((p: { links: Array<{ target: { type: string; href?: string } }> }) => p.links).find((link: { target: { type: string } }) => link.target.type === 'external');
  expect(external.target.href).toMatch(/^https:\/\//);
  expect(rejected).toEqual([]); // Link destinations were inspected, never followed.
  await page.screenshot({ path: info.outputPath('offline-spread.png') });
  await fs.writeFile(info.outputPath('export-evidence.json'), JSON.stringify({ folder, origin, creatorStopped: stoppedCreator, nonLocalNetworkBlocked: true, rejected, browser: info.project.name }, null, 2));
});

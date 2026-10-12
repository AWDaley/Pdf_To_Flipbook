import assert from 'node:assert/strict';
import { access, readFile, statfs } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
let failures = 0;
async function check(label, callback) {
  try {
    const detail = await callback();
    console.log(`PASS ${label}${detail ? `: ${detail}` : ''}`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${label}: ${error.message}`);
  }
}

console.log(`Tervoro Digital Publishing diagnostics — ${os.platform()} ${os.arch()} ${os.release()}`);
console.log(`Hardware: ${os.cpus()[0]?.model ?? 'unknown CPU'}; ${os.cpus().length} logical CPUs; ${(os.totalmem() / 1024 ** 3).toFixed(1)} GiB RAM`);
await check('Pinned Node runtime', () => {
  assert.equal(process.versions.node, pkg.engines.node, `Use Node ${pkg.engines.node}; found ${process.versions.node}.`);
  return process.version;
});
await check('Pinned npm runtime', () => {
  const version = process.env.npm_config_user_agent?.match(/npm\/([^ ]+)/)?.[1];
  assert.equal(version, pkg.engines.npm, `Run with npm ${pkg.engines.npm} through npm run doctor; found ${version ?? 'unknown'}.`);
  return version;
});
await check('Exact installed dependencies', async () => {
  for (const [name, expected] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const installed = JSON.parse(await readFile(join('node_modules', name, 'package.json'), 'utf8'));
    assert.equal(installed.version, expected, `${name}: run npm ci to restore ${expected}.`);
  }
  return `${Object.keys(pkg.dependencies).length + Object.keys(pkg.devDependencies).length} direct packages match package.json`;
});
await check('Local PDF rendering resources', async () => {
  const root = dirname(require.resolve('pdfjs-dist/package.json'));
  for (const resource of ['cmaps', 'standard_fonts', 'wasm', 'legacy/build/pdf.worker.mjs']) {
    await access(join(root, resource));
  }
  return 'CMaps, standard fonts, WASM codecs and worker available without a CDN';
});
await check('Native canvas → real PDF render → Sharp WebP', async () => {
  const [{ PDFDocument, StandardFonts, rgb }, pdfjs, { default: sharp }] = await Promise.all([
    import('pdf-lib'), import('pdfjs-dist/legacy/build/pdf.mjs'), import('sharp'),
  ]);
  const source = await PDFDocument.create();
  const font = await source.embedFont(StandardFonts.Helvetica);
  const page = source.addPage([144, 192]);
  page.drawRectangle({ x: 10, y: 10, width: 40, height: 40, color: rgb(0.75, 0.15, 0.1) });
  page.drawText('Local rendering', { x: 12, y: 150, size: 11, font });
  const resources = dirname(require.resolve('pdfjs-dist/package.json'));
  const resourcePath = (folder) => join(resources, folder).replaceAll('\\', '/') + '/';
  const task = pdfjs.getDocument({
    data: await source.save(),
    cMapUrl: resourcePath('cmaps'),
    cMapPacked: true,
    standardFontDataUrl: resourcePath('standard_fonts'),
    wasmUrl: resourcePath('wasm'),
    isEvalSupported: false,
    useSystemFonts: false,
  });
  const doc = await task.promise;
  let surface;
  try {
    const renderedPage = await doc.getPage(1);
    const viewport = renderedPage.getViewport({ scale: 1 });
    surface = doc.canvasFactory.create(viewport.width, viewport.height);
    await renderedPage.render({ canvasContext: surface.context, viewport }).promise;
    const png = surface.canvas.toBuffer('image/png');
    const webp = await sharp(png).webp({ quality: 90 }).toBuffer();
    const metadata = await sharp(webp).metadata();
    assert.equal(metadata.width, 144);
    assert.equal(metadata.height, 192);
    assert.equal(metadata.format, 'webp');
    const raw = await sharp(webp).raw().toBuffer();
    assert.ok(raw.some((value) => value < 200), 'Rendered output unexpectedly contains no ink.');
    renderedPage.cleanup();
    return `${metadata.width}×${metadata.height}, ${webp.length} bytes; PDF.js ${pdfjs.version}, libvips ${sharp.versions.vips}`;
  } finally {
    if (surface) doc.canvasFactory.destroy(surface);
    await task.destroy();
  }
});
await check('Page-turn engine patch', async () => {
  const source = await readFile('node_modules/page-flip/dist/js/page-flip.module.js', 'utf8');
  assert.ok(source.includes('autoResize'), 'Run npm rebuild to apply the pinned page-flip patch.');
  return 'page-flip 2.0.7 application patch installed';
});
await check('Workspace disk capacity', async () => {
  const stats = await statfs(process.cwd());
  const available = stats.bavail * stats.bsize;
  assert.ok(available > 512 * 1024 ** 2, 'Less than 512 MiB available. Free disk space before converting.');
  return `${(available / 1024 ** 3).toFixed(1)} GiB available`;
});
try {
  const { chromium, firefox } = await import('@playwright/test');
  for (const browser of [chromium, firefox]) {
    try {
      await access(browser.executablePath());
      console.log(`PASS ${browser.name()} test browser installed`);
    } catch {
      console.log(`PENDING ${browser.name()} tests: run npx playwright install chromium firefox`);
    }
  }
} catch {
  console.log('PENDING Browser verification dependencies unavailable. Run npm ci.');
}
if (failures) {
  console.error(`${failures} diagnostic check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log('Runtime and native conversion diagnostics passed. This is not visual approval of page turning.');
}

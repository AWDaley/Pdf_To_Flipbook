import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ZipArchive } from 'archiver';
import { manifestSchema, type FlipbookManifest } from '../shared/index';
import { assertContained, assertNoSymlinks, atomicJson, copySafeFile, renameWithRetry, safePath, workspaceDirectory } from '../shared/files';

export interface ExportOptions {
  buildDirectory: string;
  outputDirectory: string;
  manifest: FlipbookManifest;
  backgroundDirectory?: string;
  sourcePdf?: string;
  includeOriginal?: boolean;
  readerDirectory?: string;
}

export async function validateAssets(buildDirectory: string, manifest: FlipbookManifest): Promise<number> {
  manifestSchema.parse(manifest);
  await assertNoSymlinks(buildDirectory);
  let bytes = 0;
  const counted = new Set<string>();
  for (const page of manifest.pages) {
    for (const asset of [page.image.path, page.zoomImage.path, page.thumbnail.path, page.textPath].filter(Boolean) as string[]) {
      const filename = await safePath(buildDirectory, asset);
      const stats = await fs.stat(filename);
      if (!stats.isFile() || stats.size === 0) throw new Error(`Build asset is missing or empty: ${asset}`);
      if (!counted.has(asset)) { bytes += stats.size; counted.add(asset); }
    }
  }
  return bytes;
}

async function notices(): Promise<string> {
  const packages = ['page-flip', 'zod'];
  const sections = ['Tervoro Digital Publishing independent reader\nBundled third-party license notices\n'];
  for (const name of packages) {
    const root = path.resolve('node_modules', name);
    const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')) as { version: string; license: string };
    const license = await fs.readFile(path.join(root, 'LICENSE'), 'utf8');
    sections.push(`${name} ${pkg.version} (${pkg.license})\n${license}`);
  }
  sections.push('page-flip 2.0.7 includes an application-owned lifecycle and portrait-copy patch. Original MIT license retained.');
  return sections.join('\n\n----------------------------------------\n\n');
}

function inlineJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function assetMime(filename: string): string {
  switch (path.extname(filename).toLowerCase()) {
    case '.webp': return 'image/webp';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.avif': return 'image/avif';
    default: return 'application/octet-stream';
  }
}

async function embedAsset(root: string, assetPath: string, embedded: Record<string, string>): Promise<void> {
  if (embedded[assetPath]) return;
  const bytes = await fs.readFile(await safePath(root, assetPath));
  embedded[assetPath] = `data:${assetMime(assetPath)};base64,${bytes.toString('base64')}`;
}

export async function exportBook(options: ExportOptions): Promise<{ folder: string; zipPath: string }> {
  const manifest = manifestSchema.parse(structuredClone(options.manifest));
  const build = assertContained(process.cwd(), options.buildDirectory);
  const destination = assertContained(process.cwd(), options.outputDirectory);
  const reader = assertContained(process.cwd(), options.readerDirectory ?? path.resolve('dist/reader'));
  const parent = await workspaceDirectory(path.dirname(destination));
  await assertNoSymlinks(destination, true);
  try { await fs.lstat(destination); throw new Error('Export destination already exists. Choose a new folder.'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  let assetBytes = await validateAssets(build, manifest);
  const embeddedText: Record<string, string> = {};
  const embeddedAssets: Record<string, string> = {};
  for (const page of manifest.pages) {
    if (!page.textPath) continue;
    try {
      const parsed = JSON.parse(await fs.readFile(await safePath(build, page.textPath), 'utf8')) as { text?: unknown };
      if (typeof parsed.text === 'string') embeddedText[String(page.sourcePage)] = parsed.text;
    } catch {
      // Keep the regular text asset for HTTP-served exports; standalone mode
      // simply omits malformed optional search data.
    }
  }
  for (const page of manifest.pages) {
    for (const asset of [page.image.path, page.zoomImage.path, page.thumbnail.path]) await embedAsset(build, asset, embeddedAssets);
  }
  if (manifest.settings.backgroundImage && options.backgroundDirectory) {
    assetBytes += (await fs.stat(await safePath(options.backgroundDirectory, manifest.settings.backgroundImage))).size;
    await embedAsset(options.backgroundDirectory, manifest.settings.backgroundImage, embeddedAssets);
  }
  if (options.includeOriginal && options.sourcePdf) {
    const original = assertContained(process.cwd(), options.sourcePdf);
    await assertNoSymlinks(original);
    assetBytes += (await fs.stat(original)).size;
  }
  const capacity = await fs.statfs(parent);
  if (capacity.bavail * capacity.bsize < assetBytes * 2 + 256 * 1024 ** 2) throw new Error('There is not enough free disk space for an export folder and ZIP. Free some space and try again.');
  // Verify the shared reader exists before creating a partial export.
  for (const entry of ['reader.js', 'reader.css']) await safePath(reader, entry);
  const staging = path.join(parent, `.export-${randomUUID()}`);
  await workspaceDirectory(staging);
  const zipPath = destination + '.zip';
  try { await fs.lstat(zipPath); throw new Error('Export ZIP destination already exists. Choose a new folder.'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const temporaryZip = `${zipPath}.${randomUUID()}.tmp`;
  try {
    const copied = new Set<string>();
    for (const page of manifest.pages) {
      for (const asset of [page.image.path, page.zoomImage.path, page.thumbnail.path, page.textPath].filter(Boolean) as string[]) {
        if (!copied.has(asset)) { await copySafeFile(build, asset, staging); copied.add(asset); }
      }
    }
    if (manifest.settings.backgroundImage) {
      if (!options.backgroundDirectory || !manifest.settings.backgroundImage.startsWith('background/')) throw new Error('Project background is unavailable.');
      await copySafeFile(options.backgroundDirectory, manifest.settings.backgroundImage, staging);
    }
    manifest.originalPdf = null;
    if (options.includeOriginal) {
      if (!options.sourcePdf) throw new Error('Original PDF is unavailable.');
      const source = assertContained(process.cwd(), options.sourcePdf);
      await assertNoSymlinks(source);
      await copySafeFile(path.dirname(source), path.basename(source), staging, 'original.pdf');
      manifest.originalPdf = 'original.pdf';
    }
    for (const entry of ['reader.js', 'reader.css']) await copySafeFile(reader, entry, staging);
    await copySafeFile(process.cwd(), 'scripts/serve-export.mjs', staging, 'serve.mjs');
    try { await copySafeFile(build, 'ARTWORK-NOTICE.txt', staging); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    await atomicJson(staging, 'manifest.json', manifest);
    const readerJs = await fs.readFile(path.join(reader, 'reader.js'), 'utf8');
    const readerCss = await fs.readFile(path.join(reader, 'reader.css'), 'utf8');
    const standaloneJs = readerJs.replace(/\r?\n\/\/# sourceMappingURL=.*(?:\r?\n)?$/, '\n').replace(/<\/script/gi, '<\\/script');
    const standaloneCss = readerCss.replace(/<\/style/gi, '<\\/style');
    const index = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta name="theme-color" content="#02060d"><title>Tervoro Digital Publishing</title><style>${standaloneCss}</style></head><body style="margin:0"><div id="reader"></div><script>window.__PAPERBOUND_EMBEDDED_MANIFEST__=${inlineJson(manifest)};window.__PAPERBOUND_EMBEDDED_ASSETS__=${inlineJson(embeddedAssets)};window.__PAPERBOUND_EMBEDDED_TEXT__=${inlineJson(embeddedText)};</script><script>${standaloneJs}</script></body></html>\n`;
    await fs.writeFile(path.join(staging, 'index.html'), index);
    await fs.writeFile(path.join(staging, 'README.txt'), 'Tervoro Digital Publishing exported flipbook\n\nThis folder is a read-only snapshot, not an editable project backup.\nThe index.html file is a complete single-file flipbook. Send that one file when you want the recipient to open the book directly; it opens in Chrome or Edge without Node, a terminal, or an internet connection.\nThe other files are included for ordinary static-server hosting. If your browser blocks local files, open a terminal in this folder and run the included dependency-free Node server:\nnode serve.mjs . 8080\nThen open http://127.0.0.1:8080/ and press Ctrl+C to stop.\nYou can also serve the entire folder with any static server or static host.\nExternal document links need a network only when you choose to follow them.\nThe original PDF is included only when selected during export.\n');
    await fs.writeFile(path.join(staging, 'THIRD_PARTY_NOTICES.txt'), await notices());
    await renameWithRetry(staging, destination);
    try {
      await new Promise<void>((resolve, reject) => {
        const output = createWriteStream(temporaryZip, { flags: 'wx' });
        const archive = new ZipArchive({ zlib: { level: 8 } });
        output.once('close', resolve);
        output.once('error', reject);
        archive.once('error', reject);
        archive.once('warning', reject);
        archive.pipe(output);
        archive.directory(destination, false);
        void archive.finalize().catch(reject);
      });
      await renameWithRetry(temporaryZip, zipPath);
    } catch (error) {
      await fs.rm(temporaryZip, { force: true });
      throw error;
    }
    return { folder: destination, zipPath };
  } catch (error) {
    // Only our generated staging path can be removed; an existing export is never replaced.
    assertContained(parent, staging);
    await fs.rm(staging, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    throw error;
  }
}

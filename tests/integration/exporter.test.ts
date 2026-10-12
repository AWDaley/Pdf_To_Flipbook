import { afterEach, expect, test } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { exportBook, validateAssets } from '../../packages/exporter/index';
import { manifestSchema } from '../../packages/shared/index';
import { assertContained, safePath } from '../../packages/shared/files';

const roots: string[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) { assertContained(path.resolve('data'), root); await fs.rm(root, { recursive: true, force: true }); }
});

test('safe files reject traversal and directory junctions in real filesystem operations', async () => {
  const root = path.resolve('data', `test-paths-${randomUUID()}`);
  roots.push(root);
  await fs.mkdir(path.join(root, 'allowed'), { recursive: true });
  await fs.mkdir(path.join(root, 'outside'), { recursive: true });
  await fs.writeFile(path.join(root, 'outside', 'private.txt'), 'private');
  await expect(safePath(path.join(root, 'allowed'), '../outside/private.txt')).rejects.toThrow('Unsafe');
  await expect(safePath(path.join(root, 'allowed'), '%2e%2e/outside/private.txt')).rejects.toThrow('Unsafe');
  await fs.symlink(path.join(root, 'outside'), path.join(root, 'allowed', 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await expect(safePath(path.join(root, 'allowed'), 'linked/private.txt')).rejects.toThrow('Symbolic links');
});

test('export copies the shared reader, exact appearance, texts and license notices; original PDF is opt-in', async () => {
  const root = path.resolve('data', `test-export-${randomUUID()}`);
  roots.push(root);
  const manifest = manifestSchema.parse(JSON.parse(await fs.readFile('public/demo/manifest.json', 'utf8')));
  manifest.settings.backgroundColor = '#234567';
  const result = await exportBook({ manifest, buildDirectory: path.resolve('public/demo'), outputDirectory: path.join(root, 'snapshot') });
  const copied = manifestSchema.parse(JSON.parse(await fs.readFile(path.join(result.folder, 'manifest.json'), 'utf8')));
  expect(copied.settings.backgroundColor).toBe('#234567');
  expect(copied.pageCount).toBe(10);
  expect(copied.originalPdf).toBeNull();
  const standalone = await fs.readFile(path.join(result.folder, 'index.html'), 'utf8');
  expect(standalone).toContain('__PAPERBOUND_EMBEDDED_ASSETS__');
  expect(standalone).toContain('data:image/webp;base64,');
  expect(await fs.readFile(path.join(result.folder, 'reader.js'))).toEqual(await fs.readFile('dist/reader/reader.js'));
  expect(await fs.readFile(path.join(result.folder, 'reader.css'))).toEqual(await fs.readFile('dist/reader/reader.css'));
  expect(await fs.readFile(path.join(result.folder, 'THIRD_PARTY_NOTICES.txt'), 'utf8')).toContain('Permission is hereby granted');
  expect(await fs.readFile(path.join(result.folder, 'serve.mjs'))).toEqual(await fs.readFile('scripts/serve-export.mjs'));
  expect(await fs.readFile(path.join(result.folder, 'ARTWORK-NOTICE.txt'), 'utf8')).toContain('NASA');
  await expect(fs.access(path.join(result.folder, 'original.pdf'))).rejects.toThrow();
  expect((await fs.readFile(result.zipPath)).subarray(0, 2).toString()).toBe('PK');
  await validateAssets(result.folder, copied);
  const withPdf = await exportBook({ manifest, buildDirectory: path.resolve('public/demo'), outputDirectory: path.join(root, 'with-original'), sourcePdf: path.resolve('fixtures/fieldnotes.pdf'), includeOriginal: true });
  expect(await fs.readFile(path.join(withPdf.folder, 'original.pdf'))).toEqual(await fs.readFile('fixtures/fieldnotes.pdf'));
  await expect(exportBook({ manifest, buildDirectory: path.resolve('public/demo'), outputDirectory: result.folder })).rejects.toThrow('already exists');
});

test('missing assets fail before publishing an export folder', async () => {
  const root = path.resolve('data', `test-export-failure-${randomUUID()}`);
  roots.push(root);
  const manifest = manifestSchema.parse(JSON.parse(await fs.readFile('public/demo/manifest.json', 'utf8')));
  manifest.pages[0].image.path = 'pages/missing.webp';
  const outputDirectory = path.join(root, 'failed');
  await expect(exportBook({ manifest, buildDirectory: path.resolve('public/demo'), outputDirectory })).rejects.toThrow();
  await expect(fs.access(outputDirectory)).rejects.toThrow();
});

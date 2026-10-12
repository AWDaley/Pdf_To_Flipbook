import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { PDFDocument, degrees } from 'pdf-lib';
import { convertPdf } from './index';
import type { ConversionProgress, FlipbookManifest } from '../shared/index';

const run = promisify(execFile);
const fixture = (name: string) => path.resolve('fixtures', name);
let directory: string;
let normal: FlipbookManifest;
let normalOutput: string;
const events: ConversionProgress[] = [];

beforeAll(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'paperbound-converter-'));
  normalOutput = path.join(directory, 'normal');
  normal = await convertPdf({ input: fixture('pages-2.pdf'), output: normalOutput, title: 'A real two-page PDF', onProgress: p => events.push(p) });
});
afterAll(async () => {
  // The only recursive cleanup target is the temporary directory this suite owns.
  if (directory && path.basename(await realpath(directory)).startsWith('paperbound-converter-')) {
    await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
  }
});

describe('real PDF conversion in a child process', () => {
  it('renders readable source artwork, exact profile sizes, real text, and completed progress', async () => {
    expect(normal.pageCount).toBe(2);
    expect(normal.pages.map(p => p.sourcePage)).toEqual([1, 2]);
    expect(normal.title).toBe('A real two-page PDF');
    expect(normal.originalPdf).toBeNull();
    expect(JSON.parse(await readFile(path.join(normalOutput, 'manifest.json'), 'utf8'))).toEqual(normal);
    for (const page of normal.pages) {
      for (const [key, edge] of [['thumbnail', 320], ['image', 1600], ['zoomImage', 3200]] as const) {
        const asset = page[key];
        const image = sharp(await readFile(path.join(normalOutput, asset.path)));
        const metadata = await image.metadata();
        expect(metadata.format).toBe('webp');
        expect(Math.max(metadata.width!, metadata.height!)).toBe(edge);
        expect(metadata.width! / metadata.height!).toBeCloseTo(page.aspectRatio, 2);
        const stats = await image.stats();
        expect(stats.channels.some(channel => channel.stdev > 15)).toBe(true);
      }
    }
    const text = JSON.parse(await readFile(path.join(normalOutput, normal.pages[0].textPath!), 'utf8'));
    expect(text.sourcePage).toBe(1);
    expect(text.text).toContain('FIELDNOTES');
    expect(events.filter(e => e.stage === 'rendering').map(e => e.completedPages)).toEqual([0, 1, 1, 2]);
    expect(events.at(-1)).toMatchObject({ stage: 'finalizing', completedPages: 2, totalPages: 2 });
  });

  it('respects crop boxes and 90/270 degree rotations in actual pixel output', async () => {
    const output = path.join(directory, 'mixed');
    const manifest = await convertPdf({ input: fixture('mixed-rotation-crop.pdf'), output });
    expect(manifest.pages.map(p => p.aspectRatio)).toEqual([0.75, 0.75, 1, 0.4375]);
    const redCenters = [[105 / 450, 1 - 105 / 600], [105 / 450, 105 / 600], [65 / 570, 1 - 65 / 570], [215 / 280, 575 / 640]];
    for (let index = 0; index < manifest.pageCount; index++) {
      const asset = manifest.pages[index].image;
      const [x, y] = redCenters[index];
      const { data } = await sharp(await readFile(path.join(output, asset.path)))
        .extract({ left: Math.round(asset.width * x), top: Math.round(asset.height * y), width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      expect(data[0]).toBeGreaterThan(150);
      expect(data[1]).toBeLessThan(110);
      expect(data[2]).toBeLessThan(85);
    }
  });

  it('extracts safe links/bookmarks and transforms link rectangles with rotation and crop', async () => {
    const pdf = await PDFDocument.load(await readFile(fixture('links-bookmarks.pdf')));
    pdf.getPage(0).setCropBox(20, 20, 410, 560);
    pdf.getPage(0).setRotation(degrees(90));
    const input = path.join(directory, 'rotated-links.pdf');
    await writeFile(input, await pdf.save());
    const manifest = await convertPdf({ input, output: path.join(directory, 'links') });
    const links = manifest.pages[0].links;
    expect(links).toHaveLength(2);
    expect(links.map(link => link.target)).toEqual([{ type: 'external', href: 'https://example.com/' }, { type: 'page', sourcePage: 3 }]);
    expect(links[0].x).toBeCloseTo(435 / 560, 6);
    expect(links[0].y).toBeCloseTo(8 / 410, 6);
    expect(links[0].width).toBeCloseTo(25 / 560, 6);
    expect(links[0].height).toBeCloseTo(322 / 410, 6);
    expect(manifest.outline).toEqual([{ title: 'Third source page', sourcePage: 3 }]);
    expect(JSON.stringify(manifest)).not.toMatch(/javascript:|file:\/\//);
  });

  it('renders image-only PDFs without inventing searchable text and supports lossless WebP', async () => {
    const output = path.join(directory, 'image-only');
    const manifest = await convertPdf({ input: fixture('image-only.pdf'), output, quality: 'lossless' });
    expect(manifest.pages[0].textPath).toBeNull();
    expect(JSON.parse(await readFile(path.join(output, 'text/0001.json'), 'utf8')).text).toBe('');
    const encoded = await readFile(path.join(output, manifest.pages[0].image.path));
    // VP8L is the actual WebP lossless bitstream tag (VP8X may precede it).
    expect(encoded.includes(Buffer.from('VP8L'))).toBe(true);
    expect((await sharp(encoded).stats()).channels.some(channel => channel.stdev > 15)).toBe(true);
  });

  it.each([
    ['malformed.pdf', 'PDF_INVALID'],
    ['password-required.pdf', 'PASSWORD_REQUIRED'],
  ])('rejects %s and discards its incomplete build', async (name, code) => {
    const output = path.join(directory, code);
    await expect(convertPdf({ input: fixture(name), output })).rejects.toMatchObject({ code });
    await expect(stat(output)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('enforces bytes, pages, pixels, output size, free disk, and a real worker timeout', async () => {
    for (const [limits, code] of [
      [{ maxInputBytes: 10 }, 'INPUT_LIMIT'],
      [{ maxPages: 1 }, 'PAGE_LIMIT'],
      [{ maxPagePixels: 100 }, 'PIXEL_LIMIT'],
      [{ maxOutputBytes: 10 }, 'OUTPUT_LIMIT'],
      [{ minimumFreeDiskBytes: Number.MAX_SAFE_INTEGER }, 'DISK_LIMIT'],
      [{ pageTimeoutMs: 1000 }, 'TIMEOUT'],
    ] as const) {
      const output = path.join(directory, code);
      await expect(convertPdf({ input: fixture('pages-2.pdf'), output, limits })).rejects.toMatchObject({ code });
      await expect(stat(output)).rejects.toMatchObject({ code: 'ENOENT' });
    }
  });

  it('cancels after a real completed page, removes partial assets, and leaves prior output untouched', async () => {
    const abort = new AbortController();
    const output = path.join(directory, 'cancelled');
    const before = await readFile(path.join(normalOutput, 'manifest.json'));
    const completed: number[] = [];
    await expect(convertPdf({ input: fixture('fieldnotes.pdf'), output, signal: abort.signal, onProgress: p => {
      completed.push(p.completedPages);
      if (p.completedPages === 1) abort.abort();
    } })).rejects.toMatchObject({ code: 'CANCELLED' });
    expect(completed).toContain(1);
    await expect(stat(output)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await readFile(path.join(normalOutput, 'manifest.json'))).toEqual(before);
    await expect(convertPdf({ input: fixture('pages-1.pdf'), output: normalOutput })).rejects.toMatchObject({ code: 'OUTPUT_EXISTS' });
    expect(await readFile(path.join(normalOutput, 'manifest.json'))).toEqual(before);
  });

  it('CLI failure preserves a complete output and successful replacement installs a complete snapshot', async () => {
    const before = await readFile(path.join(normalOutput, 'manifest.json'));
    const cli = path.resolve('packages/converter/cli.ts');
    await expect(run(process.execPath, ['--import', 'tsx', cli, '--input', fixture('malformed.pdf'), '--output', normalOutput])).rejects.toMatchObject({ code: 1 });
    expect(await readFile(path.join(normalOutput, 'manifest.json'))).toEqual(before);
    const notes = path.join(normalOutput, 'owner-notes.txt');
    await writeFile(notes, 'Keep these unrelated notes.');
    await expect(run(process.execPath, ['--import', 'tsx', cli, '--input', fixture('pages-1.pdf'), '--output', normalOutput])).rejects.toMatchObject({ code: 1 });
    expect(await readFile(notes, 'utf8')).toBe('Keep these unrelated notes.');
    expect(await readFile(path.join(normalOutput, 'manifest.json'))).toEqual(before);
    await rm(notes);
    await run(process.execPath, ['--import', 'tsx', cli, '--input', fixture('pages-1.pdf'), '--output', normalOutput]);
    expect(JSON.parse(await readFile(path.join(normalOutput, 'manifest.json'), 'utf8')).pageCount).toBe(1);
    expect((await readdir(directory)).filter(name => name.startsWith('.normal-'))).toEqual([]);
  });
});

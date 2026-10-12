import { randomUUID } from 'node:crypto';
import { lstat, readFile, readdir, realpath, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { manifestSchema, qualitySchema } from '../shared/index';
import { convertPdf } from './index';

// Windows virus scanners and file watchers can briefly retain directory handles
// after the converter exits. Retry boundedly without falling back to copying.
async function move(source: string, destination: string) {
  for (let attempt = 0; ; attempt++) {
    try { await rename(source, destination); return; }
    catch (error) {
      if (!['EPERM', 'EACCES', 'EBUSY'].includes((error as NodeJS.ErrnoException).code ?? '') || attempt >= 7) throw error;
      await delay(Math.min(100 * 2 ** attempt, 1000));
    }
  }
}

async function validatePreviousBuild(output: string) {
  const manifest = manifestSchema.parse(JSON.parse(await readFile(path.join(output, 'manifest.json'), 'utf8')));
  const expected = new Set(['manifest.json']);
  for (const page of manifest.pages) {
    for (const relative of [page.image.path, page.zoomImage.path, page.thumbnail.path, `text/${String(page.sourcePage).padStart(4, '0')}.json`]) expected.add(relative);
  }
  const walk = async (folder: string, prefix = '') => {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (entry.isSymbolicLink()) throw new Error('Existing output contains a symbolic link; choose a new output folder.');
      if (entry.isDirectory()) {
        if (![...expected].some(name => name.startsWith(`${relative}/`))) throw new Error(`Existing output contains unrelated directory ${relative}; choose a new folder to preserve it.`);
        await walk(path.join(folder, entry.name), `${relative}/`);
      } else if (!entry.isFile() || !expected.has(relative)) {
        throw new Error(`Existing output contains unrelated file ${relative}; choose a new folder to preserve it.`);
      }
    }
  };
  await walk(output);
}

const { values } = parseArgs({ options: {
  input: { type: 'string' }, output: { type: 'string' }, title: { type: 'string' },
  quality: { type: 'string', default: 'standard' }, help: { type: 'boolean', short: 'h' },
} });
if (values.help || !values.input || !values.output) {
  console.log('Usage: npm run convert -- --input <PDF> --output <folder> [--title <title>] [--quality standard|lossless]');
  if (!values.help) process.exitCode = 1;
} else {
  const output = path.resolve(values.output);
  const parent = path.dirname(output);
  const stage = path.join(parent, `.${path.basename(output)}-converting-${randomUUID()}`);
  const backup = path.join(parent, `.${path.basename(output)}-previous-${randomUUID()}`);
  const abort = new AbortController();
  const cancel = () => abort.abort();
  process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
  let movedPrevious = false;
  try {
    const quality = qualitySchema.parse(values.quality);
    const existing = await lstat(output).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    if (existing) {
      if (!existing.isDirectory() || existing.isSymbolicLink()) throw new Error('Existing output must be a regular converted-book directory.');
      await validatePreviousBuild(output);
    }
    const manifest = await convertPdf({ input: values.input, output: stage, title: values.title, quality, signal: abort.signal,
      onProgress: p => console.log(`${p.stage}: ${p.completedPages}/${p.totalPages}${p.sourcePage ? ` (page ${p.sourcePage})` : ''}`),
    });
    // All move/delete targets are explicit siblings beneath the resolved output
    // parent. Only a valid previous converted book can enter the backup path.
    const physicalParent = await realpath(parent);
    for (const candidate of [output, stage, backup]) {
      if (path.dirname(path.resolve(candidate)) !== parent) throw new Error('Output transaction escaped its intended directory.');
    }
    if (existing) { await move(output, backup); movedPrevious = true; }
    try { await move(stage, output); }
    catch (error) { if (movedPrevious) { await move(backup, output); movedPrevious = false; } throw error; }
    if (movedPrevious) {
      if (path.dirname(await realpath(backup)) !== physicalParent) throw new Error(`Old output retained at ${backup}: parent changed during replacement.`);
      await rm(backup, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
      movedPrevious = false;
    }
    console.log(`Converted ${manifest.pageCount} pages to ${output}. This folder contains page assets and a manifest; use the studio Export action to include the animated reader.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    if (movedPrevious) console.error(`The previous complete book remains at ${backup}.`);
    process.exitCode = 1;
    const staged = await lstat(stage).catch(() => null);
    if (staged && !staged.isSymbolicLink() && path.dirname(await realpath(stage)) === await realpath(parent)) {
      await rm(stage, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
    }
  } finally {
    process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel);
  }
}

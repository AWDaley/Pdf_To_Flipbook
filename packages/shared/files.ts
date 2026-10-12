import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { isSafeRelativePath } from './index';

export function assertContained(root: string, target: string): string {
  const base = path.resolve(root);
  const absolute = path.resolve(target);
  const relative = path.relative(base, absolute);
  if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
    throw new Error('Path leaves the allowed workspace.');
  }
  return absolute;
}

/** Check each component: a contained string alone does not prevent junction traversal. */
export async function assertNoSymlinks(target: string, allowMissing = false): Promise<void> {
  const absolute = path.resolve(target);
  const parsed = path.parse(absolute);
  let current = parsed.root;
  for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      const stat = await fs.lstat(current);
      if (stat.isSymbolicLink()) throw new Error('Symbolic links and directory junctions are not allowed in project paths.');
    } catch (error) {
      if (allowMissing && (error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
  }
}

export async function workspaceDirectory(directory: string): Promise<string> {
  const absolute = assertContained(process.cwd(), directory);
  await assertNoSymlinks(absolute, true);
  await fs.mkdir(absolute, { recursive: true });
  await assertNoSymlinks(absolute);
  return absolute;
}

export async function safePath(root: string, relative: string, allowMissing = false): Promise<string> {
  if (!isSafeRelativePath(relative)) throw new Error('Unsafe project path.');
  const absolute = assertContained(root, path.join(root, relative));
  await assertNoSymlinks(absolute, allowMissing);
  return absolute;
}

export async function readJson(root: string, relative: string): Promise<unknown> {
  const file = await safePath(root, relative);
  const stats = await fs.stat(file);
  if (!stats.isFile() || stats.size > 20 * 1024 * 1024) throw new Error('Project metadata is not a valid bounded file.');
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

export async function atomicJson(root: string, relative: string, value: unknown): Promise<void> {
  const destination = await safePath(root, relative, true);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  await assertNoSymlinks(path.dirname(temporary));
  const handle = await fs.open(temporary, 'wx', 0o600);
  try {
    await handle.writeFile(JSON.stringify(value, null, 2));
    await handle.sync();
  } finally { await handle.close(); }
  try {
    // rename replaces the file atomically; never remove the last good file first.
    await renameWithRetry(temporary, destination);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}

/** Antivirus and browser/dev-server directory handles can briefly delay Windows replacement. */
export async function renameWithRetry(source: string, destination: string): Promise<void> {
  assertContained(process.cwd(), source);
  assertContained(process.cwd(), destination);
  for (let attempt = 0; ; attempt++) {
    try { await fs.rename(source, destination); return; }
    catch (error) {
      if (attempt >= 8 || !['EPERM', 'EACCES', 'EBUSY'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
      await delay(80 * (attempt + 1));
    }
  }
}

export async function copySafeFile(sourceRoot: string, relative: string, targetRoot: string, targetRelative = relative): Promise<void> {
  const source = await safePath(sourceRoot, relative);
  const stats = await fs.stat(source);
  if (!stats.isFile()) throw new Error('Expected a regular asset file.');
  const target = await safePath(targetRoot, targetRelative, true);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { convertPdf } from '../../packages/converter/index';
import { exportBook, validateAssets } from '../../packages/exporter/index';
import {
  conversionLimitsSchema, currentBuildSchema, defaultLimits, defaultSettings, identifierSchema, manifestSchema,
  projectSchema, readerSettingsSchema, type ConversionProgress, type FlipbookManifest,
  type Project, type ReaderSettings, type RenderQuality, type ConversionLimits,
} from '../../packages/shared/index';
import { assertContained, atomicJson, readJson, safePath, workspaceDirectory } from '../../packages/shared/files';

export class ServiceError extends Error {
  constructor(public statusCode: number, message: string, options?: ErrorOptions) { super(message, options); }
}
interface Job {
  projectId: string;
  controller: AbortController;
  progress: ConversionProgress;
  done: Promise<void>;
}

export class ProjectStore {
  readonly root: string;
  readonly limits: ConversionLimits;
  private chain: Promise<unknown> = Promise.resolve();
  private active: Job | null = null;
  private lockToken = randomUUID();
  private ownsLock = false;

  constructor(root = path.resolve('data/projects'), limits: Partial<ConversionLimits> = {}) {
    this.root = assertContained(process.cwd(), root);
    this.limits = conversionLimitsSchema.parse({ ...defaultLimits, ...limits });
  }

  private serial<T>(operation: () => Promise<T>): Promise<T> {
    const pending = this.chain.then(operation, operation);
    this.chain = pending.catch(() => undefined);
    return pending;
  }

  async initialize(): Promise<void> {
    await workspaceDirectory(this.root);
    await this.acquireLock();
    try {
      for (const project of await this.list()) {
        if (project.status === 'converting') {
          const restored = await this.get(project.id);
          await atomicJson(this.root, `${project.id}/project.json`, {
            ...restored,
            status: restored.currentBuildId ? 'ready' : 'cancelled',
            error: 'The previous conversion was interrupted. The last complete build is preserved; convert again to retry.',
            revision: restored.revision + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) { await this.close(); throw error; }
  }

  private async acquireLock(): Promise<void> {
    const lock = await safePath(this.root, '.instance-lock.json', true);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const handle = await fs.open(lock, 'wx', 0o600);
        try { await handle.writeFile(JSON.stringify({ pid: process.pid, token: this.lockToken, createdAt: new Date().toISOString() })); await handle.sync(); }
        finally { await handle.close(); }
        this.ownsLock = true;
        return;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
        let prior: { pid: number; token: string };
        try {
          prior = JSON.parse(await fs.readFile(lock, 'utf8')) as typeof prior;
          if (!Number.isInteger(prior.pid) || prior.pid <= 0 || typeof prior.token !== 'string') throw new Error('Existing lock has invalid metadata.', { cause: error });
        } catch (error) { throw new ServiceError(409, 'The workspace lock is invalid. Check that no Paperbound process is running, then remove data/projects/.instance-lock.json.', { cause: error }); }
        let alive = true;
        try { process.kill(prior.pid, 0); }
        catch (error) { if ((error as NodeJS.ErrnoException).code === 'ESRCH') alive = false; }
        if (alive) throw new ServiceError(409, 'Tervoro Digital Publishing is already using this project workspace. Open the existing window or stop its process first.');
        const latest = JSON.parse(await fs.readFile(lock, 'utf8')) as typeof prior;
        if (latest.token === prior.token) await fs.unlink(lock);
      }
    }
    throw new ServiceError(409, 'Another process is acquiring the project workspace. Try again.');
  }

  async close(): Promise<void> {
    if (this.active) { this.active.controller.abort(); await this.active.done; }
    await this.chain;
    if (this.ownsLock) {
      const lock = await safePath(this.root, '.instance-lock.json', true);
      try {
        const content = JSON.parse(await fs.readFile(lock, 'utf8')) as { token: string };
        if (content.token === this.lockToken) await fs.unlink(lock);
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      this.ownsLock = false;
    }
  }

  async projectDirectory(id: string): Promise<string> {
    if (!identifierSchema.safeParse(id).success) throw new ServiceError(400, 'Invalid project identifier.');
    try { return await safePath(this.root, id); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new ServiceError(404, 'Project not found.', { cause: error }); throw error; }
  }

  async get(id: string): Promise<Project> {
    const directory = await this.projectDirectory(id);
    const project = projectSchema.parse(await readJson(directory, 'project.json'));
    if (project.id !== id) throw new ServiceError(409, 'Project metadata does not match its folder.');
    try {
      const pointer = currentBuildSchema.parse(await readJson(directory, 'current-build.json'));
      project.currentBuildId = pointer.buildId;
      const manifest = manifestSchema.parse(await readJson(directory, `builds/${pointer.buildId}/manifest.json`));
      project.pageCount = manifest.pageCount;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || project.currentBuildId) throw error;
    }
    return project;
  }

  async list(): Promise<Project[]> {
    const entries = await fs.readdir(this.root, { withFileTypes: true });
    const projects: Project[] = [];
    for (const entry of entries) {
      if (entry.isSymbolicLink()) throw new ServiceError(409, 'A linked directory was found in the project library. Move it out of data/projects.');
      if (entry.isDirectory() && identifierSchema.safeParse(entry.name).success) {
        projects.push(await this.get(entry.name));
      }
    }
    return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async importPdf(bytes: Buffer, filename: string, title?: string): Promise<Project> {
    if (!bytes.length || bytes.length > this.limits.maxInputBytes) throw new ServiceError(413, `Choose a PDF up to ${Math.floor(this.limits.maxInputBytes / 1024 ** 2)} MiB.`);
    if (!bytes.subarray(0, 1024).includes('%PDF-')) throw new ServiceError(400, 'The selected file does not appear to be a PDF.');
    const project = await this.serial(async () => {
      if (this.active) throw new ServiceError(409, 'One PDF is already converting. Wait or cancel it before importing another.');
      const disk = await fs.statfs(this.root);
      if (disk.bavail * disk.bsize < bytes.length + this.limits.minimumFreeDiskBytes) throw new ServiceError(413, 'There is not enough free disk space to import this PDF. Free some space and try again.');
      const id = randomUUID();
      const directory = await workspaceDirectory(path.join(this.root, id));
      // eslint-disable-next-line no-control-regex -- filenames are display metadata, never paths; remove control characters.
      const name = filename.split(/[\\/]/).at(-1)?.replace(/[\x00-\x1f]/g, ' ').slice(0, 256) || 'document.pdf';
      const now = new Date().toISOString();
      const created = projectSchema.parse({
        id, title: (title || name.replace(/\.pdf$/i, '') || 'Untitled flipbook').trim().slice(0, 240),
        revision: 1, createdAt: now, updatedAt: now, settings: { ...defaultSettings }, quality: 'standard',
        sourceFileName: name, pageCount: 0, currentBuildId: null, status: 'draft', error: null,
      });
      await fs.writeFile(path.join(directory, 'source.pdf'), bytes, { flag: 'wx', mode: 0o600 });
      await atomicJson(directory, 'project.json', created);
      return created;
    });
    return this.startConversion(project.id, project.revision, project.quality);
  }

  progress(id: string): ConversionProgress | null { return this.active?.projectId === id ? { ...this.active.progress } : null; }

  async saveSettings(id: string, revision: number, title: string, settings: ReaderSettings): Promise<Project> {
    return this.serial(async () => {
      const project = await this.get(id);
      this.checkRevision(project, revision);
      const validated = readerSettingsSchema.parse(settings);
      if (validated.backgroundImage) {
        if (!validated.backgroundImage.startsWith('background/')) throw new ServiceError(400, 'Choose a project background image.');
        await safePath(await this.projectDirectory(id), validated.backgroundImage);
      }
      const updated = projectSchema.parse({ ...project, title, settings: validated, revision: project.revision + 1, updatedAt: new Date().toISOString() });
      await atomicJson(this.root, `${id}/project.json`, updated);
      return updated;
    });
  }

  private checkRevision(project: Project, revision: number): void {
    if (project.revision !== revision) throw new ServiceError(409, 'This project changed in another window. Reload it before saving your changes.');
  }

  async startConversion(id: string, revision: number, quality: RenderQuality): Promise<Project> {
    return this.serial(async () => {
      if (this.active) throw new ServiceError(409, 'One PDF is already converting. Wait or cancel it first.');
      const project = await this.get(id);
      this.checkRevision(project, revision);
      const updated = projectSchema.parse({ ...project, quality, status: 'converting', error: null, revision: project.revision + 1, updatedAt: new Date().toISOString() });
      await atomicJson(this.root, `${id}/project.json`, updated);
      const job: Job = { projectId: id, controller: new AbortController(), progress: { stage: 'validating', completedPages: 0, totalPages: 0 }, done: Promise.resolve() };
      this.active = job;
      // Leave the serialization boundary before the child finishes and commits its result.
      job.done = this.performConversion(updated, job);
      return updated;
    });
  }

  private async performConversion(project: Project, job: Job): Promise<void> {
    const buildId = randomUUID();
    try {
      const directory = await this.projectDirectory(project.id);
      const build = await safePath(directory, `builds/${buildId}`, true);
      const source = await safePath(directory, 'source.pdf');
      const manifest = await convertPdf({
        input: source, output: build, title: project.title, quality: project.quality, settings: project.settings,
        limits: this.limits, signal: job.controller.signal, onProgress: (progress) => { job.progress = progress; },
      });
      if (job.controller.signal.aborted) throw new Error('Conversion cancelled.');
      await validateAssets(build, manifest);
      await this.serial(async () => {
        if (job.controller.signal.aborted) throw new Error('Conversion cancelled.');
        const latest = await this.get(project.id);
        const updated = projectSchema.parse({ ...latest, currentBuildId: buildId, pageCount: manifest.pageCount, status: 'ready', error: null, revision: latest.revision + 1, updatedAt: new Date().toISOString() });
        await atomicJson(directory, 'current-build.json', { buildId, completedAt: updated.updatedAt });
        await atomicJson(directory, 'project.json', updated);
      });
    } catch (error) {
      await this.serial(async () => {
        const latest = await this.get(project.id);
        await atomicJson(this.root, `${project.id}/project.json`, {
          ...latest, status: job.controller.signal.aborted ? 'cancelled' : 'error',
          error: (job.controller.signal.aborted ? 'Conversion cancelled. The last complete build is preserved.' : (error as Error).message).slice(0, 4096),
          revision: latest.revision + 1, updatedAt: new Date().toISOString(),
        });
      }).catch((storageError) => console.error('Unable to persist conversion failure:', storageError));
    } finally { if (this.active === job) this.active = null; }
  }

  async waitForIdle(): Promise<void> { if (this.active) await this.active.done; await this.chain; }

  async cancel(id: string): Promise<Project> {
    if (this.active?.projectId === id) this.active.controller.abort();
    return this.get(id);
  }

  async manifest(id: string): Promise<{ manifest: FlipbookManifest; buildDirectory: string; project: Project }> {
    const project = await this.get(id);
    if (!project.currentBuildId) throw new ServiceError(409, 'This project has no complete build yet.');
    const directory = await this.projectDirectory(id);
    const buildDirectory = await safePath(directory, `builds/${project.currentBuildId}`);
    const manifest = manifestSchema.parse(await readJson(buildDirectory, 'manifest.json'));
    manifest.title = project.title;
    manifest.settings = { ...project.settings };
    return { manifest, buildDirectory, project };
  }

  async asset(id: string, relative: string): Promise<string> {
    if (relative.startsWith('background/')) return safePath(await this.projectDirectory(id), relative);
    const { manifest, buildDirectory } = await this.manifest(id);
    const allowed = new Set(manifest.pages.flatMap((p) => [p.image.path, p.zoomImage.path, p.thumbnail.path, ...(p.textPath ? [p.textPath] : [])]));
    if (!allowed.has(relative)) throw new ServiceError(404, 'Reader asset not found.');
    return safePath(buildDirectory, relative);
  }

  async saveBackground(id: string, bytes: Buffer): Promise<string> {
    if (bytes.length > 20 * 1024 * 1024) throw new ServiceError(413, 'Choose a background image up to 20 MiB.');
    return this.serial(async () => {
      const directory = await this.projectDirectory(id);
      const image = sharp(bytes, { limitInputPixels: 40_000_000 });
      const metadata = await image.metadata();
      if (!['jpeg', 'png', 'webp', 'avif'].includes(metadata.format ?? '')) throw new ServiceError(400, 'Use a JPEG, PNG, WebP, or AVIF background image.');
      const asset = `background/${randomUUID()}.webp`;
      const target = await safePath(directory, asset, true);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await image.rotate().resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toFile(target);
      return asset;
    });
  }

  async export(id: string, revision: number, includeOriginal: boolean): Promise<{ folder: string; zipPath: string; exportId: string }> {
    return this.serial(async () => {
      const { manifest, buildDirectory, project } = await this.manifest(id);
      this.checkRevision(project, revision);
      const directory = await this.projectDirectory(id);
      const exportId = randomUUID();
      const result = await exportBook({ buildDirectory, manifest, outputDirectory: path.join(directory, 'exports', exportId), backgroundDirectory: directory, sourcePdf: path.join(directory, 'source.pdf'), includeOriginal });
      return { ...result, exportId };
    });
  }

  async exportZip(id: string, exportId: string): Promise<string> {
    identifierSchema.parse(exportId);
    return safePath(await this.projectDirectory(id), `exports/${exportId}.zip`);
  }

  async exportHtml(id: string, exportId: string): Promise<string> {
    identifierSchema.parse(exportId);
    return safePath(await this.projectDirectory(id), `exports/${exportId}/index.html`);
  }
}

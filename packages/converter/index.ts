import { fork, type ForkOptions } from 'node:child_process';
import { lstat, mkdir, realpath, rm, statfs } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  conversionLimitsSchema, defaultLimits, defaultSettings, manifestSchema, qualitySchema,
  readerSettingsSchema, type ConversionLimits, type ConversionOptions,
  type ConversionProgress, type FlipbookManifest, type ReaderSettings, type RenderQuality,
} from '../shared/index';

export interface ConvertPdfOptions extends ConversionOptions {
  input: string;
  /** A new directory. Existing builds are never overwritten by this API. */
  output: string;
  onProgress?: (progress: ConversionProgress) => void;
  signal?: AbortSignal;
}
export interface ConversionRequest {
  input: string;
  output: string;
  title: string;
  quality: RenderQuality;
  settings: ReaderSettings;
  limits: ConversionLimits;
}
export type ConversionMessage =
  | { type: 'progress'; progress: ConversionProgress }
  | { type: 'result'; manifest: FlipbookManifest }
  | { type: 'error'; code: string; message: string };

export class ConversionError extends Error {
  constructor(public code: string, message: string) { super(message); this.name = 'ConversionError'; }
}

export async function checkDiskCapacity(directory: string, limits: ConversionLimits, nextBytes = 0) {
  const disk = await statfs(directory);
  const available = disk.bavail * disk.bsize;
  if (available < limits.minimumFreeDiskBytes + nextBytes) {
    throw new ConversionError('DISK_LIMIT', `Not enough free disk space. Keep at least ${Math.ceil(limits.minimumFreeDiskBytes / 1024 ** 2)} MiB free during conversion.`);
  }
}

/**
 * Convert real PDF bytes in a disposable child process. The local service owns
 * concurrency and publishing the resulting complete build. This function owns
 * only its newly-created output directory and removes it after failure.
 */
export async function convertPdf(options: ConvertPdfOptions): Promise<FlipbookManifest> {
  if (options.signal?.aborted) throw new ConversionError('CANCELLED', 'Conversion cancelled.');
  const input = path.resolve(options.input);
  const output = path.resolve(options.output);
  const limits = conversionLimitsSchema.parse({ ...defaultLimits, ...options.limits });
  const quality = qualitySchema.parse(options.quality ?? 'standard');
  const settings = readerSettingsSchema.parse(options.settings ?? defaultSettings);
  const title = (options.title ?? path.basename(input, path.extname(input))).trim().slice(0, 240) || 'Untitled flipbook';
  const source = await lstat(input);
  if (!source.isFile() || source.isSymbolicLink()) throw new ConversionError('INPUT_INVALID', 'Input must be a regular local PDF file.');
  if (source.size === 0 || source.size > limits.maxInputBytes) {
    throw new ConversionError('INPUT_LIMIT', `PDF must contain data and be no larger than ${Math.floor(limits.maxInputBytes / 1024 ** 2)} MiB.`);
  }
  const parent = path.dirname(output);
  await mkdir(parent, { recursive: true });
  await checkDiskCapacity(parent, limits);
  try { await mkdir(output); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new ConversionError('OUTPUT_EXISTS', 'The output directory already exists. Use a new build directory; the CLI can safely replace an existing converted book.');
    throw error;
  }
  const ownedDirectory = await realpath(output);
  const request: ConversionRequest = { input, output, title, quality, settings, limits };
  try {
    return await new Promise<FlipbookManifest>((resolve, reject) => {
      const workerOptions: ForkOptions & { windowsHide: boolean } = {
        execArgv: ['--import', 'tsx', '--max-old-space-size=1536'],
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        windowsHide: true,
      };
      const child = fork(fileURLToPath(new URL('./child.ts', import.meta.url)), [], workerOptions);
      let result: FlipbookManifest | undefined;
      let failure: Error | undefined;
      let diagnostics = '';
      let stage = 'PDF validation';
      let timer: ReturnType<typeof setTimeout>;
      const stop = (error: Error) => {
        failure ??= error;
        if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      };
      const watchdog = () => {
        clearTimeout(timer);
        timer = setTimeout(() => stop(new ConversionError('TIMEOUT', `${stage} exceeded ${limits.pageTimeoutMs / 1000} seconds. Try a simpler PDF or increase the conversion timeout.`)), limits.pageTimeoutMs);
      };
      const cancel = () => stop(new ConversionError('CANCELLED', 'Conversion cancelled. The previous complete build is unchanged.'));
      options.signal?.addEventListener('abort', cancel, { once: true });
      const collect = (chunk: Buffer) => { diagnostics = (diagnostics + chunk.toString('utf8')).slice(-4000); };
      child.stdout?.on('data', collect); child.stderr?.on('data', collect);
      child.on('message', (message: ConversionMessage) => {
        if (failure) return;
        try {
          if (message.type === 'progress') {
            stage = message.progress.stage === 'rendering' ? `Page ${message.progress.sourcePage}` : message.progress.stage;
            watchdog(); options.onProgress?.(message.progress);
          } else if (message.type === 'result') {
            result = manifestSchema.parse(message.manifest);
          } else if (message.type === 'error') {
            failure = new ConversionError(message.code, message.message);
          }
        } catch (error) { stop(error instanceof Error ? error : new Error(String(error))); }
      });
      child.once('error', error => { failure = error; });
      child.once('close', code => {
        clearTimeout(timer); options.signal?.removeEventListener('abort', cancel);
        if (failure) reject(failure);
        else if (code === 0 && result) resolve(result);
        else reject(new ConversionError('WORKER_FAILED', `Conversion process ended without a complete build${code === null ? '' : ` (exit ${code})`}.${diagnostics ? ` ${diagnostics.trim()}` : ''}`));
      });
      watchdog();
      if (options.signal?.aborted) cancel();
      else child.send(request, error => { if (error) stop(error); });
    });
  } catch (error) {
    // This exact directory was exclusively created above. Never recurse through
    // a substituted symlink or remove an unrelated pre-existing output.
    const current = await lstat(output).catch(() => null);
    if (current && !current.isSymbolicLink() && await realpath(output) === ownedDirectory) {
      await rm(output, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
    }
    throw error;
  }
}

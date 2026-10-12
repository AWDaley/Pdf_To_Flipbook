import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { getDocument, AnnotationType, AnnotationMode, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import type { Canvas, SKRSContext2D } from '@napi-rs/canvas';
import sharp from 'sharp';
import {
  assetProfiles, isSafeExternalUrl, manifestSchema, pageTextSchema,
  type ConversionProgress, type FlipbookManifest, type ManifestPage, type PageAsset, type PageLink,
} from '../shared/index';
import { checkDiskCapacity, ConversionError, type ConversionMessage, type ConversionRequest } from './index';

const require = createRequire(import.meta.url);
const resourceRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
const resourcePath = (name: string) => path.join(resourceRoot, name).replaceAll('\\', '/') + '/';
type Surface = { canvas: Canvas; context: SKRSContext2D };
type CanvasFactory = { create(width: number, height: number): Surface; destroy(surface: Surface): void };
type Annotation = { annotationType: number; rect?: number[]; url?: string; dest?: unknown; titleObj?: { str?: string }; contentsObj?: { str?: string } };
type OutlineItem = { title: string; dest: unknown; items: OutlineItem[] };

function send(message: ConversionMessage) { if (process.connected) process.send?.(message); }
function progress(data: ConversionProgress) { send({ type: 'progress', progress: data }); }

async function destinationPage(document: PDFDocumentProxy, destination: unknown): Promise<number | null> {
  try {
    const actual = typeof destination === 'string' ? await document.getDestination(destination) : destination;
    if (!Array.isArray(actual) || actual.length === 0) return null;
    const reference = actual[0];
    const index = typeof reference === 'number' ? reference : await document.getPageIndex(reference);
    return Number.isInteger(index) && index >= 0 && index < document.numPages ? index + 1 : null;
  } catch { return null; } // An unsupported/broken navigation target does not invalidate visual artwork.
}

async function extractLinks(document: PDFDocumentProxy, page: PDFPageProxy): Promise<PageLink[]> {
  const viewport = page.getViewport({ scale: 1 });
  const annotations = await page.getAnnotations({ intent: 'display' }) as Annotation[];
  const links: PageLink[] = [];
  for (const annotation of annotations) {
    if (annotation.annotationType !== AnnotationType.LINK || !annotation.rect || annotation.rect.length !== 4) continue;
    let target: PageLink['target'] | undefined;
    if (annotation.url && isSafeExternalUrl(annotation.url)) target = { type: 'external', href: annotation.url };
    else if (annotation.dest) {
      const sourcePage = await destinationPage(document, annotation.dest);
      if (sourcePage !== null) target = { type: 'page', sourcePage };
    }
    if (!target) continue;
    const box = [...viewport.convertToViewportPoint(annotation.rect[0], annotation.rect[1]),
      ...viewport.convertToViewportPoint(annotation.rect[2], annotation.rect[3])];
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const left = clamp(Math.min(box[0], box[2]) / viewport.width);
    const right = clamp(Math.max(box[0], box[2]) / viewport.width);
    const top = clamp(Math.min(box[1], box[3]) / viewport.height);
    const bottom = clamp(Math.max(box[1], box[3]) / viewport.height);
    if (![left, right, top, bottom].every(Number.isFinite) || right <= left || bottom <= top) continue;
    links.push({
      x: left, y: top, width: right - left, height: bottom - top,
      label: (annotation.contentsObj?.str || annotation.titleObj?.str || (target.type === 'external' ? target.href : `Page ${target.sourcePage}`)).slice(0, 2048),
      target,
    });
    if (links.length > 10000) throw new ConversionError('NAVIGATION_LIMIT', `Page ${page.pageNumber} contains too many links.`);
  }
  return links;
}

async function extractOutline(document: PDFDocumentProxy): Promise<FlipbookManifest['outline']> {
  const outline: FlipbookManifest['outline'] = [];
  const pending = [...((await document.getOutline()) ?? [])] as OutlineItem[];
  let examined = 0;
  while (pending.length) {
    const item = pending.shift()!;
    if (++examined > 10000) throw new ConversionError('NAVIGATION_LIMIT', 'The PDF contains too many bookmark entries.');
    const sourcePage = await destinationPage(document, item.dest);
    if (sourcePage !== null) outline.push({ title: String(item.title).slice(0, 2048), sourcePage });
    pending.unshift(...(item.items ?? []));
  }
  return outline;
}

async function convert(request: ConversionRequest): Promise<FlipbookManifest> {
  const { input, output, title, quality, settings, limits } = request;
  const source = await stat(input);
  if (!source.isFile() || source.size === 0 || source.size > limits.maxInputBytes) throw new ConversionError('INPUT_LIMIT', 'PDF input exceeds the permitted byte limit or is empty.');
  progress({ stage: 'validating', completedPages: 0, totalPages: 0 });
  const loadingTask = getDocument({
    data: new Uint8Array(await readFile(input)),
    cMapUrl: resourcePath('cmaps'), cMapPacked: true,
    standardFontDataUrl: resourcePath('standard_fonts'), wasmUrl: resourcePath('wasm'), iccUrl: resourcePath('iccs'),
    useSystemFonts: false, enableXfa: false,
    stopAtErrors: true, verbosity: VerbosityLevel.ERRORS,
    // A finite maxImageSize makes PDF.js silently omit larger images. Keep its
    // faithful path; bound output pixels and terminate the process on timeout.
    maxImageSize: -1,
  });
  let totalBytes = 0;
  const write = async (relative: string, data: Buffer | string) => {
    const bytes = typeof data === 'string' ? Buffer.byteLength(data) : data.length;
    if (totalBytes + bytes > limits.maxOutputBytes) throw new ConversionError('OUTPUT_LIMIT', 'Converted assets exceed the configured output-size limit.');
    await checkDiskCapacity(output, limits, bytes);
    await writeFile(path.join(output, relative), data, { flag: 'wx' });
    totalBytes += bytes;
  };
  try {
    const document = await loadingTask.promise;
    if (document.numPages < 1 || document.numPages > limits.maxPages) throw new ConversionError('PAGE_LIMIT', `PDF contains ${document.numPages} pages; the limit is ${limits.maxPages}.`);
    if (document.isPureXfa) throw new ConversionError('UNSUPPORTED_XFA', 'Dynamic XFA forms are unsupported. Print this document to a normal PDF before importing.');
    for (const directory of ['pages', 'thumbnails', 'text']) await mkdir(path.join(output, directory));
    const labels = await document.getPageLabels();
    const pages: ManifestPage[] = [];
    const canvasFactory = document.canvasFactory as CanvasFactory;
    for (let number = 1; number <= document.numPages; number++) {
      progress({ stage: 'rendering', completedPages: number - 1, totalPages: document.numPages, sourcePage: number });
      await checkDiskCapacity(output, limits);
      const page = await document.getPage(number);
      let surface: Surface | undefined;
      try {
        const original = page.getViewport({ scale: 1 });
        if (!(Number.isFinite(original.width) && Number.isFinite(original.height) && original.width > 0 && original.height > 0)) throw new ConversionError('PAGE_INVALID', `Page ${number} has invalid displayed dimensions.`);
        const viewport = page.getViewport({ scale: assetProfiles.zoomImage.longEdge / Math.max(original.width, original.height) });
        const width = Math.ceil(viewport.width), height = Math.ceil(viewport.height);
        if (width * height > limits.maxPagePixels) throw new ConversionError('PIXEL_LIMIT', `Page ${number} needs ${width * height} pixels; the configured limit is ${limits.maxPagePixels}.`);
        surface = canvasFactory.create(width, height);
        await page.render({
          canvas: surface.canvas as unknown as HTMLCanvasElement,
          canvasContext: surface.context as unknown as CanvasRenderingContext2D,
          viewport, background: '#ffffff', annotationMode: AnnotationMode.ENABLE,
        }).promise;
        const png = surface.canvas.toBuffer('image/png');
        const prefix = String(number).padStart(4, '0');
        const variants = {} as Record<keyof typeof assetProfiles, PageAsset>;
        for (const key of ['zoomImage', 'image', 'thumbnail'] as const) {
          const profile = assetProfiles[key];
          const relative = key === 'thumbnail' ? `thumbnails/${prefix}.webp` : `pages/${prefix}${key === 'zoomImage' ? '-zoom' : ''}.webp`;
          const { data, info } = await sharp(png, { limitInputPixels: limits.maxPagePixels })
            .resize({ width: profile.longEdge, height: profile.longEdge, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: profile.quality, lossless: quality === 'lossless', effort: 4 })
            .toBuffer({ resolveWithObject: true });
          await write(relative, data);
          variants[key] = { path: relative, width: info.width, height: info.height };
        }
        const extracted = await page.getTextContent();
        const text = extracted.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim();
        const textPath = `text/${prefix}.json`;
        await write(textPath, JSON.stringify(pageTextSchema.parse({ sourcePage: number, text })));
        pages.push({ sourcePage: number, label: String(labels?.[number - 1] ?? number).slice(0, 256), aspectRatio: original.width / original.height, ...variants, textPath: text ? textPath : null, links: await extractLinks(document, page) });
      } catch (error) {
        if (error instanceof ConversionError) throw error;
        throw new ConversionError('PAGE_FAILED', `Page ${number} could not be converted: ${error instanceof Error ? error.message : String(error)}. No replacement build was published.`);
      } finally {
        if (surface) canvasFactory.destroy(surface);
        page.cleanup();
      }
      progress({ stage: 'rendering', completedPages: number, totalPages: document.numPages, sourcePage: number });
    }
    progress({ stage: 'finalizing', completedPages: pages.length, totalPages: document.numPages });
    const manifest = manifestSchema.parse({ schemaVersion: '2.0', title, pageCount: document.numPages, settings, pages, outline: await extractOutline(document), originalPdf: null });
    for (const page of pages) {
      for (const relative of [page.image.path, page.zoomImage.path, page.thumbnail.path, `text/${String(page.sourcePage).padStart(4, '0')}.json`]) {
        const asset = await stat(path.join(output, relative));
        if (!asset.isFile() || asset.size === 0) throw new ConversionError('ASSET_INVALID', `Incomplete conversion asset: ${relative}`);
      }
    }
    await write('manifest.json', JSON.stringify(manifest, null, 2));
    return manifest;
  } catch (error) {
    if (error instanceof Error && error.name === 'PasswordException') throw new ConversionError('PASSWORD_REQUIRED', 'Password-protected PDFs are unsupported. Save an unprotected copy and import it again.');
    if (error instanceof Error && error.name === 'InvalidPDFException') throw new ConversionError('PDF_INVALID', 'This file is not a parseable PDF or is damaged.');
    throw error;
  } finally {
    await loadingTask.destroy();
  }
}

let started = false;
process.once('disconnect', () => { process.exit(); });
process.on('message', (request: ConversionRequest) => {
  if (started) return;
  started = true;
  void convert(request).then(manifest => {
    process.send?.({ type: 'result', manifest } satisfies ConversionMessage, () => { process.disconnect(); });
  }).catch(error => {
    const failure: ConversionMessage = { type: 'error', code: error instanceof ConversionError ? error.code : 'CONVERSION_FAILED', message: error instanceof Error ? error.message : String(error) };
    process.exitCode = 1;
    process.send?.(failure, () => { process.disconnect(); });
  });
});

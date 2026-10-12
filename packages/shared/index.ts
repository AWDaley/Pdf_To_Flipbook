import { z } from 'zod';

/** Portable manifests may reference only files beneath their own directory. */
export function isSafeRelativePath(value: string): boolean {
  // Reject control characters deliberately: paths are serialized into manifests and URLs.
  // eslint-disable-next-line no-control-regex
  if (!value || value.length > 512 || value.startsWith('/') || value.startsWith('\\') || /[\\\x00-\x1f\x7f:#?]/.test(value)) return false;
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return false; }
  if (decoded !== value) return false;
  // Windows normalizes trailing spaces/dots and reserves device names even with extensions.
  return value.split('/').every((part) => part !== '' && part !== '.' && part !== '..'
    && part.trim() === part && !part.endsWith('.') && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part));
}

export function isSafeExternalUrl(value: string): boolean {
  // URL parsers silently discard some control characters; reject them before parsing.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x20\x7f]/.test(value) || value.length > 4096) return false;
  try {
    const url = new URL(value);
    return ((url.protocol === 'https:' || url.protocol === 'http:') && !!url.hostname && !url.username && !url.password)
      || (url.protocol === 'mailto:' && !!url.pathname && !url.search && !url.hash);
  } catch { return false; }
}

export const safeRelativePathSchema = z.string().refine(isSafeRelativePath, 'Expected a safe relative asset path');
export const externalUrlSchema = z.string().refine(isSafeExternalUrl, 'Only HTTP, HTTPS, and plain mailto links are supported');
const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected a six-digit hexadecimal color');

export const readerSettingsSchema = z.object({
  preset: z.literal('magazine'),
  layout: z.enum(['auto', 'spread', 'single']),
  showCoverAlone: z.boolean(),
  backgroundColor: hexColorSchema,
  backgroundImage: safeRelativePathSchema.nullable(),
  toolbarTheme: z.enum(['light', 'dark']),
  turnDurationMs: z.number().int().min(200).max(2500),
  shadowStrength: z.number().min(0).max(1),
  showPageEdges: z.boolean(),
  motionPreference: z.enum(['system', 'full', 'reduced']),
}).strict();
export type ReaderSettings = z.infer<typeof readerSettingsSchema>;
export const defaultSettings: ReaderSettings = {
  preset: 'magazine',
  layout: 'auto',
  showCoverAlone: true,
  backgroundColor: '#02060d',
  backgroundImage: null,
  toolbarTheme: 'dark',
  turnDurationMs: 850,
  shadowStrength: 0.32,
  showPageEdges: true,
  motionPreference: 'system',
};

export const pageAssetSchema = z.object({
  path: safeRelativePathSchema,
  width: z.number().int().positive().max(64000),
  height: z.number().int().positive().max(64000),
}).strict();
export type PageAsset = z.infer<typeof pageAssetSchema>;

export const linkSchema = z.object({
  x: z.number().min(0).max(1), y: z.number().min(0).max(1),
  width: z.number().min(0).max(1), height: z.number().min(0).max(1),
  label: z.string().max(2048),
  target: z.discriminatedUnion('type', [
    z.object({ type: z.literal('page'), sourcePage: z.number().int().positive() }).strict(),
    z.object({ type: z.literal('external'), href: externalUrlSchema }).strict(),
  ]),
}).strict().superRefine((link, context) => {
  if (link.x + link.width > 1.00001 || link.y + link.height > 1.00001) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Link rectangle extends outside displayed artwork' });
  }
});
export type PageLink = z.infer<typeof linkSchema>;

export const manifestPageSchema = z.object({
  sourcePage: z.number().int().positive().max(300),
  label: z.string().max(256),
  aspectRatio: z.number().positive().max(100),
  image: pageAssetSchema,
  zoomImage: pageAssetSchema,
  thumbnail: pageAssetSchema,
  textPath: safeRelativePathSchema.nullable(),
  links: z.array(linkSchema).max(10000),
}).strict();
export type ManifestPage = z.infer<typeof manifestPageSchema>;

export const manifestSchema = z.object({
  schemaVersion: z.literal('2.0'),
  title: z.string().trim().min(1).max(240),
  pageCount: z.number().int().min(1).max(300),
  settings: readerSettingsSchema,
  pages: z.array(manifestPageSchema).min(1).max(300),
  outline: z.array(z.object({ title: z.string().max(2048), sourcePage: z.number().int().positive() }).strict()).max(10000),
  originalPdf: safeRelativePathSchema.nullable(),
}).strict().superRefine((manifest, context) => {
  if (manifest.pageCount !== manifest.pages.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['pageCount'], message: 'Page count must equal the number of source pages' });
  }
  manifest.pages.forEach((page, index) => {
    if (page.sourcePage !== index + 1) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['pages', index, 'sourcePage'], message: 'Source pages must be consecutive, one-based, and ordered' });
    }
    page.links.forEach((link, linkIndex) => {
      if (link.target.type === 'page' && link.target.sourcePage > manifest.pageCount) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['pages', index, 'links', linkIndex, 'target'], message: 'Link target is outside the source document' });
      }
    });
  });
  manifest.outline.forEach((entry, index) => {
    if (entry.sourcePage > manifest.pageCount) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['outline', index, 'sourcePage'], message: 'Outline target is outside the source document' });
    }
  });
});
export type FlipbookManifest = z.infer<typeof manifestSchema>;
export const flipbookManifestSchema = manifestSchema;

export const qualitySchema = z.enum(['standard', 'lossless']);
export type RenderQuality = z.infer<typeof qualitySchema>;
export const identifierSchema = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,95}$/, 'Invalid generated identifier');
export const projectSchema = z.object({
  id: identifierSchema,
  title: z.string().trim().min(1).max(240),
  revision: z.number().int().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  settings: readerSettingsSchema,
  quality: qualitySchema,
  sourceFileName: z.string().max(256),
  pageCount: z.number().int().min(0).max(300),
  currentBuildId: identifierSchema.nullable(),
  status: z.enum(['draft', 'converting', 'ready', 'error', 'cancelled']),
  error: z.string().max(4096).nullable(),
}).strict();
export type Project = z.infer<typeof projectSchema>;

export const currentBuildSchema = z.object({
  buildId: identifierSchema,
  completedAt: z.string().datetime(),
}).strict();
export type CurrentBuild = z.infer<typeof currentBuildSchema>;

export const conversionLimitsSchema = z.object({
  maxInputBytes: z.number().int().positive().max(1024 * 1024 * 1024),
  maxPages: z.number().int().min(1).max(300),
  maxPagePixels: z.number().int().positive().max(100_000_000),
  pageTimeoutMs: z.number().int().min(1000).max(600_000),
  maxOutputBytes: z.number().int().positive(),
  minimumFreeDiskBytes: z.number().int().nonnegative(),
}).strict();
export type ConversionLimits = z.infer<typeof conversionLimitsSchema>;
export const defaultLimits: ConversionLimits = {
  maxInputBytes: 100 * 1024 * 1024,
  maxPages: 300,
  maxPagePixels: 16_000_000,
  pageTimeoutMs: 60_000,
  maxOutputBytes: 2 * 1024 * 1024 * 1024,
  minimumFreeDiskBytes: 256 * 1024 * 1024,
};
export const conversionLimits = defaultLimits;
export const assetProfiles = {
  thumbnail: { longEdge: 320, quality: 80 },
  image: { longEdge: 1600, quality: 90 },
  zoomImage: { longEdge: 3200, quality: 95 },
} as const;

export interface ConversionOptions {
  title?: string;
  quality?: RenderQuality;
  settings?: ReaderSettings;
  limits?: Partial<ConversionLimits>;
}
export interface ConversionProgress {
  stage: 'validating' | 'rendering' | 'finalizing';
  completedPages: number;
  totalPages: number;
  sourcePage?: number;
}
export const pageTextSchema = z.object({
  sourcePage: z.number().int().positive().max(300),
  text: z.string().max(10_000_000),
}).strict();
export type PageText = z.infer<typeof pageTextSchema>;

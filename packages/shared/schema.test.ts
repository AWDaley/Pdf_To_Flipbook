import { describe, expect, it } from 'vitest';
import { defaultSettings, isSafeExternalUrl, isSafeRelativePath, manifestSchema, projectSchema, readerSettingsSchema } from './index';

const page = (sourcePage: number) => ({
  sourcePage, label: String(sourcePage), aspectRatio: 0.75,
  image: { path: `pages/${sourcePage}.webp`, width: 1200, height: 1600 },
  zoomImage: { path: `pages/${sourcePage}-zoom.webp`, width: 2400, height: 3200 },
  thumbnail: { path: `thumbnails/${sourcePage}.webp`, width: 240, height: 320 },
  textPath: null, links: [],
});
const manifest = (count: number) => ({
  schemaVersion: '2.0', title: 'Fixture', pageCount: count, settings: { ...defaultSettings },
  pages: Array.from({ length: count }, (_, index) => page(index + 1)), outline: [], originalPdf: null,
});

describe('portable manifest', () => {
  it.each([1, 2, 3, 10, 300])('accepts %i consecutive source pages without virtual surfaces', (count) => {
    expect(manifestSchema.parse(manifest(count)).pageCount).toBe(count);
  });
  it('rejects mismatched counts and duplicate or missing source pages', () => {
    const input = manifest(3);
    expect(manifestSchema.safeParse({ ...input, pageCount: 2 }).success).toBe(false);
    input.pages[1]!.sourcePage = 1;
    expect(manifestSchema.safeParse(input).success).toBe(false);
  });
  it('rejects navigation targets outside the source document', () => {
    const input = manifest(2);
    expect(manifestSchema.safeParse({ ...input, outline: [{ title: 'Missing', sourcePage: 3 }] }).success).toBe(false);
    const withLinks = { ...input, pages: [{ ...input.pages[0], links: [{ x: 0, y: 0, width: 0.2, height: 0.1, label: 'Missing', target: { type: 'page', sourcePage: 3 } }] }, input.pages[1]] };
    expect(manifestSchema.safeParse(withLinks).success).toBe(false);
  });
  it('validates normalized artwork coordinates', () => {
    const input = manifest(1);
    const withLink = (x: number) => ({ ...input, pages: [{ ...input.pages[0], links: [{ x, y: 0.1, width: 0.2, height: 0.2, label: 'Site', target: { type: 'external', href: 'https://example.com/' } }] }] });
    expect(manifestSchema.safeParse(withLink(0.1)).success).toBe(true);
    expect(manifestSchema.safeParse(withLink(0.9)).success).toBe(false);
  });
});

describe('asset and link containment', () => {
  it.each(['../secret', '/absolute', 'C:/data.pdf', 'pages\\evil', '//example.com/a', 'pages/../x', 'pages//x', 'pages/%2e%2e/x', 'pages/%252e%252e/x', 'pages/a?b', 'pages/a#b', './page.png', 'pages/\0', 'pages/.. /secret', 'pages/page.', 'pages/NUL.webp', 'pages/COM1.txt'])('rejects unsafe path %s', (path) => {
    expect(isSafeRelativePath(path)).toBe(false);
  });
  it.each(['pages/page-001.webp', 'background/paper texture.jpg', 'original.pdf'])('accepts relative path %s', (path) => {
    expect(isSafeRelativePath(path)).toBe(true);
  });
  it.each(['javascript:alert(1)', 'file:///C:/secret', 'data:text/html,hello', 'https://user:pass@example.com', 'http://example.com/\n', 'mailto:x@example.com?body=secret'])('rejects unsafe URL %s', (url) => {
    expect(isSafeExternalUrl(url)).toBe(false);
  });
  it.each(['https://example.com/a?q=b', 'http://localhost/page', 'mailto:reader@example.com'])('accepts intended URL %s', (url) => {
    expect(isSafeExternalUrl(url)).toBe(true);
  });
});

describe('project settings', () => {
  it('ships valid settings and rejects external background dependencies', () => {
    expect(readerSettingsSchema.parse(defaultSettings)).toEqual(defaultSettings);
    expect(readerSettingsSchema.safeParse({ ...defaultSettings, backgroundImage: 'https://example.com/a.jpg' }).success).toBe(false);
  });
  it('requires a positive revision and contained generated identifiers', () => {
    const input = { id: 'project-1', title: 'My book', revision: 1, createdAt: '2026-09-14T12:00:00.000Z', updatedAt: '2026-09-14T12:00:00.000Z', settings: defaultSettings, quality: 'standard', sourceFileName: 'book.pdf', pageCount: 0, currentBuildId: null, status: 'draft', error: null };
    expect(projectSchema.safeParse(input).success).toBe(true);
    expect(projectSchema.safeParse({ ...input, revision: 0 }).success).toBe(false);
    expect(projectSchema.safeParse({ ...input, id: '../outside' }).success).toBe(false);
  });
});

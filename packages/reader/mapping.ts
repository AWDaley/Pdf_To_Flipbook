export type BookLayout = 'spread' | 'single';
export type ReaderState = 'loading' | 'idle' | 'dragging' | 'settling' | 'zoomed' | 'error';

export function visiblePages(page: number, count: number, layout: BookLayout, cover = true): number[] {
  const p = Math.max(1, Math.min(count, page));
  if (layout === 'single' || (cover && p === 1)) return [p];
  const first = cover ? p - (p % 2) : p - ((p - 1) % 2);
  return [first, first + 1].filter(n => n > 0 && n <= count);
}

export function adjacentPage(page: number, count: number, layout: BookLayout, cover: boolean, direction: number): number {
  const current = visiblePages(page, count, layout, cover);
  return Math.min(count, Math.max(1, direction > 0 ? current[current.length - 1]! + 1 : current[0]! - 1));
}

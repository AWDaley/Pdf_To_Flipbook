import { describe, expect, it } from 'vitest';
import { adjacentPage, visiblePages, type BookLayout } from './mapping';

function navigate(count: number, layout: BookLayout, cover: boolean) {
  const spreads: number[][] = [];
  let page = 1;
  for (let guard = 0; guard < count; guard++) {
    spreads.push(visiblePages(page, count, layout, cover));
    const next = adjacentPage(page, count, layout, cover, 1);
    if (spreads.at(-1)!.includes(next)) break;
    page = next;
  }
  return spreads;
}

describe('logical source-page mapping', () => {
  it.each([
    [1, [[1]]],
    [2, [[1], [2]]],
    [3, [[1], [2, 3]]],
    [5, [[1], [2, 3], [4, 5]]],
    [6, [[1], [2, 3], [4, 5], [6]]],
  ] as const)('cover-alone %i-page document has the specified reading order', (count, expected) => {
    expect(navigate(count, 'spread', true)).toEqual(expected);
  });

  it('single mode visits every source in order for both cover preferences', () => {
    for (const cover of [true, false]) {
      expect(navigate(6, 'single', cover)).toEqual([[1], [2], [3], [4], [5], [6]]);
    }
  });

  it('cover disabled starts with pages 1–2 and preserves a singleton odd tail', () => {
    expect(navigate(5, 'spread', false)).toEqual([[1, 2], [3, 4], [5]]);
    expect(navigate(6, 'spread', false)).toEqual([[1, 2], [3, 4], [5, 6]]);
  });

  it('source pages are never skipped, duplicated, or inflated by virtual surfaces', () => {
    for (const count of [1, 2, 3, 5, 6, 299, 300]) for (const cover of [true, false]) for (const layout of ['single', 'spread'] as const) {
      const spreads = navigate(count, layout, cover);
      expect(spreads.flat()).toEqual(Array.from({ length: count }, (_, index) => index + 1));
      for (let index = spreads.length - 1; index > 0; index--) {
        const previous = adjacentPage(spreads[index][0], count, layout, cover, -1);
        expect(visiblePages(previous, count, layout, cover)).toEqual(spreads[index - 1]);
      }
    }
  });

  it('a remembered logical destination belongs to its spread and survives return to single', () => {
    for (let sourcePage = 1; sourcePage <= 17; sourcePage++) {
      for (const cover of [true, false]) expect(visiblePages(sourcePage, 17, 'spread', cover)).toContain(sourcePage);
      expect(visiblePages(sourcePage, 17, 'single')).toEqual([sourcePage]);
    }
  });

  it('impossible first/last navigation stays inside the document', () => {
    for (const layout of ['single', 'spread'] as const) for (const cover of [true, false]) {
      expect(adjacentPage(1, 1, layout, cover, 1)).toBe(1);
      expect(adjacentPage(1, 1, layout, cover, -1)).toBe(1);
      expect(adjacentPage(1, 6, layout, cover, -1)).toBe(1);
      expect(adjacentPage(6, 6, layout, cover, 1)).toBe(6);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { adjacentPage, visiblePages } from '../../packages/reader/mapping';

describe('one-based source page mapping', () => {
  it('keeps a lone cover independent from subsequent spread indices', () => {
    expect(visiblePages(1, 10, 'spread', true)).toEqual([1]);
    expect(visiblePages(2, 10, 'spread', true)).toEqual([2, 3]);
    expect(visiblePages(3, 10, 'spread', true)).toEqual([2, 3]);
    expect(visiblePages(4, 10, 'spread', true)).toEqual([4, 5]);
    expect(visiblePages(10, 10, 'spread', true)).toEqual([10]);
  });
  it('supports open spreads when the cover setting is disabled', () => {
    expect(visiblePages(1, 5, 'spread', false)).toEqual([1, 2]);
    expect(visiblePages(2, 5, 'spread', false)).toEqual([1, 2]);
    expect(visiblePages(3, 5, 'spread', false)).toEqual([3, 4]);
    expect(visiblePages(5, 5, 'spread', false)).toEqual([5]);
  });
  it.each([1, 2, 5, 6, 299, 300])('visits every source page of a %i-page document exactly once per forward traversal', count => {
    for (const layout of ['single', 'spread'] as const) for (const cover of [true, false]) {
      const visited: number[] = [];
      let source = 1;
      for (let turns = 0; turns < count; turns++) {
        const current = visiblePages(source, count, layout, cover);
        visited.push(...current);
        if (current.at(-1) === count) break;
        source = adjacentPage(source, count, layout, cover, 1);
      }
      expect(visited).toEqual(Array.from({ length: count }, (_, index) => index + 1));
    }
  });
  it('single layout advances and reverses every source page, including odd pages', () => {
    for (let source = 1; source <= 6; source++) {
      expect(visiblePages(source, 6, 'single', true)).toEqual([source]);
      expect(adjacentPage(source, 6, 'single', true, 1)).toBe(Math.min(6, source + 1));
      expect(adjacentPage(source, 6, 'single', true, -1)).toBe(Math.max(1, source - 1));
    }
  });
  it('virtual surfaces never increase source count at either end', () => {
    expect(adjacentPage(1, 1, 'spread', true, 1)).toBe(1);
    expect(adjacentPage(1, 1, 'single', true, -1)).toBe(1);
    expect(adjacentPage(6, 6, 'spread', true, 1)).toBe(6);
    expect(adjacentPage(2, 6, 'spread', true, -1)).toBe(1);
  });
});

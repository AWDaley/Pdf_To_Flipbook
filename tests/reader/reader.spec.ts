import { test, expect, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { FlipbookManifest } from '../../packages/shared/index';

async function openBook(page: Page, options: { count?: number; layout?: 'auto' | 'spread' | 'single'; motion?: 'system' | 'full' | 'reduced'; links?: boolean; aspectRatio?: number } = {}) {
  const manifest = JSON.parse(await fs.readFile(path.resolve('public/demo/manifest.json'), 'utf8')) as FlipbookManifest;
  if (options.count) {
    manifest.pageCount = options.count;
    manifest.pages = manifest.pages.slice(0, options.count);
    manifest.outline = manifest.outline.filter(entry => entry.sourcePage <= options.count!);
    for (const p of manifest.pages) p.links = p.links.filter(link => link.target.type !== 'page' || link.target.sourcePage <= options.count!);
  }
  manifest.settings.layout = options.layout ?? 'auto';
  manifest.settings.motionPreference = options.motion ?? 'full';
  if (options.aspectRatio) for (const p of manifest.pages) p.aspectRatio = options.aspectRatio;
  if (options.links) manifest.pages[0]!.links = [
    { x: .7, y: .8, width: .29, height: .19, label: 'Jump to page six', target: { type: 'page', sourcePage: 6 } },
    { x: .05, y: .3, width: .6, height: .1, label: 'Example website', target: { type: 'external', href: 'https://example.com/' } },
  ];
  await page.route('**/demo/manifest.json', route => route.fulfill({ json: manifest }));
  await page.goto('/?demo=1');
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'idle');
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-page', '1');
}
async function settled(page: Page, sourcePages: string) {
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'idle');
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-page', sourcePages);
}
async function enterPage(page: Page, number: number) {
  await page.getByRole('spinbutton', { name: 'Go to page' }).fill(String(number));
  await page.getByRole('spinbutton', { name: 'Go to page' }).press('Enter');
}
async function shot(page: Page, info: TestInfo, name: string) {
  const file = info.outputPath(`${name}.png`);
  await page.screenshot({ path: file });
  await info.attach(name, { path: file, contentType: 'image/png' });
}

test('M0 normal-speed cover, forward/reverse folds, partial return, and narrow turn', async ({ page }, info) => {
  await openBook(page);
  await shot(page, info, 'cover');
  const stage = await page.getByTestId('book-stage').boundingBox();
  const cover = await page.locator('.paper-sheet[data-source-page="1"]').boundingBox();
  expect(stage && cover).toBeTruthy();
  expect(Math.abs((cover!.x + cover!.width / 2) - (stage!.x + stage!.width / 2))).toBeLessThan(3);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'settling');
  await shot(page, info, 'cover-opening');
  await settled(page, '2-3');
  await shot(page, info, 'resting-spread');
  const book = await page.locator('.paper-book').boundingBox();
  expect(book).not.toBeNull();
  const x = book!.x + book!.width - 4, y = book!.y + book!.height - 4;
  await page.mouse.move(x, y); await page.mouse.down();
  for (const [progress, name] of [[.25, 'fold-quarter'], [.5, 'fold-half'], [.75, 'fold-three-quarter']] as const) {
    await page.mouse.move(x - book!.width * progress, y - 70, { steps: 15 });
    await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'dragging');
    await shot(page, info, name);
  }
  await page.mouse.up();
  await settled(page, '4-5');
  await page.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'settling');
  await shot(page, info, 'reverse-fold');
  await settled(page, '2-3');
  const nextBook = await page.locator('.paper-book').boundingBox();
  const rx = nextBook!.x + nextBook!.width - 5, ry = nextBook!.y + nextBook!.height - 5;
  await page.mouse.move(rx, ry); await page.mouse.down();
  await page.mouse.move(rx - nextBook!.width * .16, ry - 40, { steps: 12 });
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'dragging');
  await shot(page, info, 'partial-return-before');
  await page.mouse.move(rx - 2, ry - 1, { steps: 12 }); await page.mouse.up();
  await settled(page, '2-3');
  await shot(page, info, 'partial-return-after');
  await page.setViewportSize({ width: 390, height: 844 });
  await settled(page, '2');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'settling');
  await shot(page, info, 'narrow-fold');
  await settled(page, '3'); await shot(page, info, 'narrow-rest');
  await page.setViewportSize({ width: 1280, height: 720 }); await settled(page, '2-3');
  await enterPage(page, 6); await settled(page, '6-7'); await shot(page, info, 'photographic-spread');
});

test('closing the first cover reveals the reader background beneath it', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }] as const) {
    await page.setViewportSize(viewport);
    await openBook(page);
    await page.getByRole('button', { name: 'Next page', exact: true }).click();
    await settled(page, viewport.width < 720 ? '2' : '2-3');
    await page.getByRole('button', { name: 'Previous page', exact: true }).click();
    await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'settling');
    await expect(page.locator('.paper-sheet[data-source-page="2"]')).toHaveClass(/cover-closing-underlay/);
    await settled(page, '1');
    await expect(page.locator('.paper-sheet[data-source-page="2"]')).not.toHaveClass(/cover-closing-underlay/);
  }
});

test('fractional PDF ratios keep both pages visible in a desktop spread', async ({ page }) => {
  await openBook(page, { aspectRatio: 0.7727272727 });
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await settled(page, '2-3');
  await expect(page.locator('.paper-sheet[data-source-page="2"]')).toBeVisible();
  await expect(page.locator('.paper-sheet[data-source-page="3"]')).toBeVisible();
});

test('spread navigation, page entry, thumbnails, bookmarks, and extracted-text search', async ({ page }) => {
  await openBook(page);
  await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, '2-3');
  await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, '4-5');
  await enterPage(page, 8); await settled(page, '8-9');
  await page.getByRole('button', { name: 'Thumbnails', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Open page / })).toHaveCount(10);
  await page.getByRole('button', { name: 'Open page 1', exact: true }).click(); await settled(page, '1');
  await page.getByRole('button', { name: 'Contents', exact: true }).click();
  await page.getByRole('button', { name: 'Water holds the sky Page 6', exact: true }).click(); await settled(page, '6-7');
  await page.getByRole('button', { name: 'Close reader panel' }).click();
  await page.getByRole('button', { name: 'Search text', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search this book' }).fill('headphones');
  await expect(page.locator('.reader-search-results .reader-result')).toHaveCount(1);
  await expect(page.locator('.reader-search-results')).toContainText('Page 9');
});

test('single-page layout visits every source page and source survives responsive resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBook(page, { count: 6 });
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-layout', 'single');
  for (let p = 2; p <= 6; p++) { await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, String(p)); }
  await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
  await enterPage(page, 5); await settled(page, '5');
  await page.setViewportSize({ width: 1440, height: 1000 }); await settled(page, '4-5');
  await page.setViewportSize({ width: 390, height: 844 }); await settled(page, '5');
  for (let p = 4; p >= 1; p--) { await page.getByRole('button', { name: 'Previous page', exact: true }).click(); await settled(page, String(p)); }
  await expect(page.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled();
});

for (const count of [1, 2, 5, 6]) {
  test(`${count}-page input has correct source count and ending controls`, async ({ page }) => {
    await openBook(page, { count });
    await expect(page.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled();
    if (count === 1) { await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled(); return; }
    for (let p = 2; p <= count; p += 2) {
      await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, p === count ? String(p) : `${p}-${p + 1}`);
    }
    await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
    await expect(page.locator('.reader-position')).toContainText(`of ${count}`);
    await expect(page.getByRole('spinbutton', { name: 'Go to page' })).toHaveAttribute('max', String(count));
    const book = await page.locator('.paper-book').boundingBox();
    const x = book!.x + book!.width - 5, y = book!.y + book!.height - 5;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - book!.width * .6, y - 50, { steps: 15 }); await page.mouse.up();
    await settled(page, count % 2 === 0 ? String(count) : `${count - 1}-${count}`);
    await expect(page.locator(`.paper-sheet[data-source-page="${count}"]`)).toBeVisible();
  });
}

test('zoom pans, next restores fit then animates, and focused inputs retain arrow keys', async ({ page }) => {
  await openBook(page);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'zoomed');
  const before = await page.locator('.paper-mover').getAttribute('style');
  const bounds = await page.getByTestId('book-stage').boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2); await page.mouse.down(); await page.mouse.move(bounds!.x + bounds!.width / 2 + 80, bounds!.y + bounds!.height / 2 + 35, { steps: 10 }); await page.mouse.up();
  expect(await page.locator('.paper-mover').getAttribute('style')).not.toBe(before);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'settling'); await settled(page, '2-3');
  await expect(page.locator('.paper-mover')).toHaveCSS('transform', /matrix\(1, 0, 0, 1,/);
  await page.getByRole('spinbutton', { name: 'Go to page' }).focus(); await page.keyboard.press('ArrowRight'); await settled(page, '2-3');
  await page.getByTestId('book-stage').focus(); await page.keyboard.press('ArrowRight'); await settled(page, '4-5');
});

test('rapid inputs keep a bounded navigation intent and decoded image window', async ({ page }) => {
  await openBook(page);
  await page.getByRole('button', { name: 'Next page', exact: true }).evaluate((button: HTMLButtonElement) => { for (let i = 0; i < 30; i++) button.click(); });
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'idle');
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-page', '2-3');
  for (const destination of [8, 2, 8, 2, 8, 2]) { await enterPage(page, destination); await settled(page, `${destination}-${destination + 1}`); }
  const activeImages = await page.locator('.paper-artwork[src]').count();
  expect(activeImages).toBeLessThanOrEqual(8);
});

test('safe links near page-turn corners take priority and remain outside cloned pages', async ({ page }) => {
  await openBook(page, { links: true });
  const external = page.getByRole('link', { name: 'Example website' });
  await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('.paper-sheet a')).toHaveCount(0);
  await page.getByRole('link', { name: 'Jump to page six' }).click(); await settled(page, '6-7');
});

test('missing visual assets show error and retry recovers a readable book', async ({ page }) => {
  let block = true;
  await page.route('**/demo/pages/page-003-fit.webp', route => block ? route.abort() : route.continue());
  await page.goto('/?demo=1');
  await expect(page.locator('.reader')).toHaveAttribute('data-state', 'error');
  await expect(page.getByRole('button', { name: 'Retry reader' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
  block = false; await page.getByRole('button', { name: 'Retry reader' }).click(); await settled(page, '1');
});

test('explicit reduced motion changes pages without folding', async ({ page }) => {
  await openBook(page, { motion: 'reduced' });
  await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, '2-3');
  await expect(page.locator('.stf__outerShadow')).not.toBeVisible();
});

test('pointer cancellation rolls a partial drag back to the committed spread', async ({ page }) => {
  await openBook(page);
  await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, '2-3');
  const book = await page.locator('.paper-book').boundingBox();
  const x = book!.x + book!.width - 4, y = book!.y + book!.height - 4;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - book!.width * .2, y - 45, { steps: 15 });
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'dragging');
  await page.getByTestId('book-stage').dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', bubbles: true });
  await page.mouse.up(); await settled(page, '2-3');
  await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, '4-5');
});

test('resize during a turn settles with the logical page preserved', async ({ page }) => {
  await openBook(page);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'settling');
  await page.setViewportSize({ width: 390, height: 844 });
  await settled(page, '2');
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-layout', 'single');
  await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, '3');
});

test('slow destination assets preserve the current cover through resize and pending navigation', async ({ page }) => {
  let releaseAsset!: () => void;
  const delayed = new Promise<void>(resolve => { releaseAsset = resolve; });
  await page.route('**/demo/pages/page-006-fit.webp', async route => { await delayed; await route.continue(); });
  await openBook(page);
  await enterPage(page, 8);
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-state', 'loading');
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-page', '1');
  const currentImage = page.locator('.paper-sheet[data-source-page="1"] .paper-artwork');
  await expect(currentImage).toHaveAttribute('src', /^blob:/);
  expect(await currentImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await enterPage(page, 3);
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-page', '1');
  releaseAsset();
  await settled(page, '3');
  await expect(page.getByTestId('book-stage')).toHaveAttribute('data-layout', 'single');
  const destinationImage = page.locator('.paper-sheet[data-source-page="3"] .paper-artwork').first();
  await expect(destinationImage).toHaveAttribute('src', /^blob:/);
  expect(await destinationImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, '4');
});

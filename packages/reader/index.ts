import { manifestSchema, type FlipbookManifest, type ReaderSettings } from '../shared/index';
import { MagazineEngine } from './engine';
import { resolveAssetUrl } from './assets';
import './reader.css';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag); node.className = className; if (text) node.textContent = text; return node;
}
const icons: Record<string, string> = {
  previous: '<path d="m14 6-6 6 6 6"/>', next: '<path d="m10 6 6 6-6 6"/>',
  grid: '<rect x="4" y="4" width="6" height="7" rx="1"/><rect x="14" y="4" width="6" height="7" rx="1"/><rect x="4" y="15" width="6" height="5" rx="1"/><rect x="14" y="15" width="6" height="5" rx="1"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4M7 10.5h7M10.5 7v7"/>',
  reset: '<path d="M7 3H3v4m0-4 6 6M17 3h4v4m0-4-6 6M7 21H3v-4m0 4 6-6m8 6h4v-4m0 4-6-6"/>',
  fullscreen: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  contents: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
};
function button(name: string, icon: string, action: () => void, className = '') {
  const node = element('button', `reader-button ${className}`); node.type = 'button'; node.title = name; node.setAttribute('aria-label', name);
  node.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[icon]}</svg>`;
  node.addEventListener('click', action); return node;
}

export class Reader {
  public engine!: MagazineEngine;
  public readonly root = element('section', 'reader');
  private stage = element('div', 'reader-stage');
  private title = element('div', 'reader-title');
  private status = element('div', 'reader-status');
  private position = element('span', 'reader-position');
  private input = element('input', 'reader-page-input');
  private panel = element('aside', 'reader-panel');
  private toolbar = element('div', 'reader-toolbar');
  private previous: HTMLButtonElement;
  private next: HTMLButtonElement;
  private zoom: HTMLButtonElement;
  private panelMode = '';
  private abort = new AbortController();
  private base: URL;
  private searchSequence = 0;
  private manifest: FlipbookManifest;

  constructor(container: HTMLElement, manifest: FlipbookManifest, base: string | URL) {
    this.manifest = manifestSchema.parse(manifest); this.base = new URL(base, location.href);
    this.root.setAttribute('aria-label', `${manifest.title} flipbook`);
    this.stage.tabIndex = 0; this.stage.setAttribute('aria-label', 'Flipbook pages. Use arrow keys to turn, plus to zoom, Escape to reset.');
    this.stage.dataset.testid = 'book-stage';
    this.title.textContent = manifest.title;
    this.status.setAttribute('role', 'status'); this.status.setAttribute('aria-live', 'polite');
    this.previous = button('Previous page', 'previous', () => { void this.engine.previous(); }, 'reader-arrow reader-arrow-left');
    this.next = button('Next page', 'next', () => { void this.engine.next(); }, 'reader-arrow reader-arrow-right');
    this.input.type = 'number'; this.input.min = '1'; this.input.max = String(manifest.pageCount); this.input.value = '1'; this.input.setAttribute('aria-label', 'Go to page');
    const pageForm = element('form', 'reader-page-form'); pageForm.append(this.input, element('span', '', `/ ${manifest.pageCount}`));
    pageForm.addEventListener('submit', event => { event.preventDefault(); void this.engine.goTo(Number(this.input.value)); this.stage.focus(); });
    this.zoom = button('Zoom in', 'zoom', () => { void this.engine.setZoom(this.engine.zoom > 1 ? 1 : 2); });
    this.toolbar.setAttribute('role', 'toolbar'); this.toolbar.setAttribute('aria-label', 'Reader controls');
    this.toolbar.append(button('Thumbnails', 'grid', () => this.togglePanel('thumbnails')), button('Search text', 'search', () => this.togglePanel('search')),
      button('Contents', 'contents', () => this.togglePanel('contents')), element('span', 'reader-divider'), pageForm,
      element('span', 'reader-divider'), this.zoom, button('Reset view', 'reset', () => { void this.engine.setZoom(1); }),
      button('Fullscreen', 'fullscreen', () => { void (document.fullscreenElement ? document.exitFullscreen() : this.root.requestFullscreen()).catch(() => { this.status.textContent = 'Fullscreen is unavailable in this browser.'; }); }));
    this.position.setAttribute('aria-live', 'polite'); this.panel.hidden = true;
    const footer = element('div', 'reader-footer'); footer.append(this.position, this.toolbar, element('div', 'reader-hint', 'Drag a corner · ← → to turn'));
    this.root.append(this.title, this.stage, this.previous, this.next, this.panel, this.status, footer); container.replaceChildren(this.root);
    this.stage.addEventListener('keydown', event => {
      if ((event.target as HTMLElement).closest('input,textarea,select,[contenteditable],a,button') || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); void this.engine.next(); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); void this.engine.previous(); }
      else if (event.key === 'Home') { event.preventDefault(); void this.engine.goTo(1); }
      else if (event.key === 'End') { event.preventDefault(); void this.engine.goTo(manifest.pageCount); }
      else if (event.key === '+' || event.key === '=') { event.preventDefault(); void this.engine.setZoom(2); }
      else if (event.key === 'Escape') { void this.engine.setZoom(1); }
    }, { signal: this.abort.signal });
    this.applyAppearance(manifest.settings);
  }
  async mount() {
    this.engine = new MagazineEngine(this.stage, this.manifest, this.base, state => {
      this.root.dataset.state = state;
      this.status.textContent = state === 'loading' ? 'Preparing page images…' : state === 'zoomed' ? '200% · Drag to pan. Reset or turn to return to fit.' : '';
      this.zoom?.setAttribute('aria-label', state === 'zoomed' ? 'Zoom out' : 'Zoom in');
    }, error => this.showError(error));
    this.engine.onPageChange(pages => {
      this.input.value = String(this.engine.sourcePage); this.position.textContent = `${pages.length > 1 ? 'Pages' : 'Page'} ${pages.join('–')} of ${this.manifest.pageCount}`;
      this.previous.disabled = pages[0] === 1; this.next.disabled = pages[pages.length - 1] === this.manifest.pageCount;
    });
    try { await this.engine.mount(); } catch (error) { this.showError(error instanceof Error ? error : new Error(String(error))); }
    return this;
  }
  private showError(error: Error) {
    this.root.dataset.state = 'error'; this.status.replaceChildren(element('span', '', error.message));
    const retry = element('button', 'reader-retry', 'Retry reader'); retry.addEventListener('click', () => { this.engine.destroy(); this.status.replaceChildren(); void this.mount(); }); this.status.append(retry);
    this.previous.disabled = true; this.next.disabled = true;
  }
  async updateAppearance(settings: ReaderSettings, title?: string) {
    this.manifest.settings = settings; if (title) { this.title.textContent = title; this.manifest.title = title; }
    this.applyAppearance(settings); await this.engine.updateAppearance(settings);
  }
  private applyAppearance(settings: ReaderSettings) {
    this.root.style.backgroundColor = settings.backgroundColor;
    this.root.style.backgroundImage = settings.backgroundImage ? `url("${resolveAssetUrl(settings.backgroundImage, this.base)}")` : '';
    this.root.dataset.theme = settings.toolbarTheme;
  }
  private togglePanel(mode: string) {
    this.panelMode = this.panelMode === mode ? '' : mode; this.panel.hidden = !this.panelMode; this.searchSequence++;
    this.panel.replaceChildren(); if (!this.panelMode) return;
    const heading = element('div', 'reader-panel-heading'); heading.append(element('strong', '', mode === 'thumbnails' ? 'Pages' : mode === 'search' ? 'Find in this book' : 'Contents'));
    const close = element('button', 'reader-button', '×'); close.setAttribute('aria-label', 'Close reader panel'); close.addEventListener('click', () => this.togglePanel(mode)); heading.append(close); this.panel.append(heading);
    if (mode === 'thumbnails') {
      const grid = element('div', 'reader-thumbnails');
      for (const page of this.manifest.pages) {
        const tile = element('button', 'reader-thumbnail'); tile.setAttribute('aria-label', `Open page ${page.sourcePage}`);
        const img = element('img', ''); img.loading = 'lazy'; img.src = resolveAssetUrl(page.thumbnail.path, this.base); img.alt = '';
        tile.append(img, element('span', '', String(page.sourcePage))); tile.addEventListener('click', () => { void this.engine.goTo(page.sourcePage); this.togglePanel(mode); }); grid.append(tile);
      } this.panel.append(grid);
    } else if (mode === 'contents') {
      if (!this.manifest.outline.length) this.panel.append(element('p', '', 'This PDF has no available bookmarks.'));
      for (const entry of this.manifest.outline) this.result(entry.title, entry.sourcePage, this.panel);
    } else {
      const input = element('input', 'reader-search'); input.type = 'search'; input.placeholder = 'Search words…'; input.setAttribute('aria-label', 'Search this book');
      const coverage = this.manifest.pages.filter(page => page.textPath).length;
      this.panel.append(input, element('p', 'reader-search-coverage', `Extracted text available on ${coverage} of ${this.manifest.pageCount} pages. Scanned text is not searched; no OCR.`));
      const results = element('div', 'reader-search-results'); this.panel.append(results);
      input.addEventListener('input', () => { void this.search(input.value, results); }); input.focus();
    }
  }
  private result(title: string, page: number, parent: HTMLElement) {
    const item = element('button', 'reader-result'); item.append(element('span', '', title), element('small', '', `Page ${page}`));
    item.addEventListener('click', () => { void this.engine.goTo(page); }); parent.append(item);
  }
  private async search(query: string, results: HTMLElement) {
    const sequence = ++this.searchSequence; results.replaceChildren(); if (query.trim().length < 2) return;
    results.textContent = 'Searching…'; let count = 0;
    try {
      for (const page of this.manifest.pages) {
        if (sequence !== this.searchSequence) return;
        if (!page.textPath) continue;
        const embeddedText = window.__PAPERBOUND_EMBEDDED_TEXT__?.[String(page.sourcePage)];
        const data = embeddedText === undefined
          ? await fetch(new URL(page.textPath, this.base), { signal: this.abort.signal }).then(async response => {
            if (!response.ok) throw new Error('Some search data is unavailable. Rebuild this project.');
            return await response.json() as { text: string };
          })
          : { text: embeddedText };
        const at = data.text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
        if (sequence !== this.searchSequence) return;
        if (at >= 0) { if (!count) results.replaceChildren(); this.result(data.text.slice(Math.max(0, at - 36), at + query.length + 72), page.sourcePage, results); count++; }
      }
      if (!count) results.textContent = 'No matching extracted text.';
    } catch (error) { if (!this.abort.signal.aborted) results.textContent = error instanceof Error ? error.message : 'Search failed.'; }
  }
  destroy() { this.searchSequence++; this.abort.abort(); this.engine?.destroy(); this.root.remove(); }
}

export async function mountReader(container: HTMLElement, manifest: FlipbookManifest, base: string | URL) {
  return new Reader(container, manifest, base).mount();
}

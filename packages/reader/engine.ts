import { PageFlip } from 'page-flip';
import type { FlipbookManifest, ReaderSettings } from '../shared/index';
import { AssetWindow } from './assets';
import { adjacentPage, visiblePages, type BookLayout, type ReaderState } from './mapping';

export interface FlipEngine {
  next(): Promise<void>; previous(): Promise<void>; goTo(sourcePage: number): Promise<void>;
  setLayout(layout: BookLayout): Promise<void>; updateAppearance(settings: ReaderSettings): Promise<void>;
  onPageChange(callback: (sourcePages: number[]) => void): () => void; destroy(): void;
}

export class MagazineEngine implements FlipEngine {
  public state: ReaderState = 'loading';
  public sourcePage = 1;
  public layout: BookLayout = 'spread';
  public zoom = 1;
  public settings: ReaderSettings;
  public readonly mover = document.createElement('div');
  public readonly book = document.createElement('div');
  public readonly links = document.createElement('div');
  private flip!: PageFlip;
  private images: HTMLImageElement[] = [];
  private sheets: HTMLElement[] = [];
  private assets: AssetWindow;
  private observers = new Set<(pages: number[]) => void>();
  private abort = new AbortController();
  private resizeObserver: ResizeObserver;
  private pending?: number;
  private targetPage?: number;
  private pendingResize = false;
  private pendingAppearance?: ReaderSettings;
  private width = 400;
  private height = 560;
  private raf = 0;
  private gone = false;
  private assetGeneration = 0;
  private turnTimeout?: ReturnType<typeof setTimeout>;
  private settle?: () => void;
  private pan = { x: 0, y: 0 };
  private lastTransform = '';
  private pointer?: { id: number; x: number; y: number; clientX: number; clientY: number; moved: boolean; started: boolean };
  private pointerIds = new Set<number>();
  private errorCallback: (error: Error) => void;
  private stateCallback: (state: ReaderState) => void;

  constructor(private root: HTMLElement, public manifest: FlipbookManifest, private base: URL,
    onState: (state: ReaderState) => void, onError: (error: Error) => void) {
    this.settings = { ...manifest.settings };
    this.assets = new AssetWindow(base);
    this.stateCallback = onState;
    this.errorCallback = onError;
    this.mover.className = 'paper-mover'; this.book.className = 'paper-book'; this.links.className = 'paper-links';
    this.mover.append(this.book, this.links); root.append(this.mover);
    this.resizeObserver = new ResizeObserver(() => {
      if (this.busy()) this.pendingResize = true;
      else if (this.flip) this.resize();
    });
  }
  async mount() {
    this.measure();
    const pages = this.manifest.pages.map(page => {
      const sheet = document.createElement('div'); sheet.className = 'paper-sheet'; sheet.dataset.sourcePage = String(page.sourcePage);
      sheet.dataset.density = 'soft'; sheet.setAttribute('aria-hidden', 'true');
      const img = document.createElement('img'); img.alt = ''; img.draggable = false; img.className = 'paper-artwork';
      sheet.append(img); this.book.append(sheet); this.images.push(img); return sheet;
    });
    // Balance the final physical sheet without inventing a source page. This
    // avoids sharing one printed page object between reverse and revealed surfaces.
    const blank = document.createElement('div'); blank.className = 'paper-sheet'; blank.dataset.virtual = 'true';
    blank.setAttribute('aria-hidden', 'true'); pages.push(blank); this.book.append(blank);
    this.sheets = pages;
    await this.prepare(1);
    if (this.gone) return;
    this.flip = new PageFlip(this.book, {
      width: this.width, height: this.height, size: 'fixed', autoSize: false, autoResize: false, usePortrait: true,
      showCover: this.settings.showCoverAlone, useMouseEvents: false, showPageCorners: false,
      flippingTime: this.duration(), maxShadowOpacity: this.settings.shadowStrength,
      mobileScrollSupport: false, disableFlipByClick: false,
    });
    this.flip.on('changeState', event => {
      if (this.gone) return;
      if (event.data === 'read') queueMicrotask(() => { if (!this.gone) void this.finish(); });
      else this.setState(event.data === 'user_fold' ? 'dragging' : 'settling');
    });
    this.flip.loadFromHTML(pages);
    for (let i = 0; i < pages.length; i++) this.flip.getPage(i).setDensity('soft');
    this.resizeObserver.observe(this.root);
    this.bindPointer(); this.setState('idle'); this.updatePresentation(); this.notify();
    this.tick();
  }
  private setState(state: ReaderState) { this.state = state; this.root.dataset.state = state; this.stateCallback(state); }
  private busy() { return this.state === 'loading' || this.state === 'dragging' || this.state === 'settling'; }
  private measure() {
    const rect = this.root.getBoundingClientRect();
    this.layout = this.manifest.pageCount === 1 || this.settings.layout === 'single' || (this.settings.layout === 'auto' && rect.width < 720) ? 'single' : 'spread';
    const ratio = this.manifest.pages[0]!.aspectRatio;
    const availableWidth = Math.max(140, rect.width - (this.layout === 'single' ? 34 : 120));
    const availableHeight = Math.max(180, rect.height - 36);
    // PageFlip compares the integer CSS block width with twice its page width
    // to choose portrait or landscape. Keep both dimensions integral so a
    // fractional PDF ratio cannot round the spread down into portrait mode.
    this.height = Math.round(Math.min(availableHeight, (availableWidth / (this.layout === 'single' ? 1 : 2)) / ratio));
    this.width = Math.round(this.height * ratio);
    this.book.style.width = `${this.width * (this.layout === 'single' ? 1 : 2)}px`;
    this.book.style.height = `${this.height}px`;
    this.mover.style.width = this.book.style.width; this.mover.style.height = this.book.style.height;
    this.root.dataset.layout = this.layout;
  }
  private resize() {
    const page = this.sourcePage; this.measure();
    const settings = this.flip.getSettings(); settings.width = this.width; settings.height = this.height; settings.flippingTime = this.duration();
    this.flip.update(); this.flip.turnToPage(page - 1);
    this.updatePresentation(); this.notify();
    void this.prepare(page).catch(error => this.fail(error));
  }
  private async prepare(page: number, high = false) {
    const generation = ++this.assetGeneration;
    const wanted = new Set<number>();
    for (const center of [this.sourcePage, page]) for (let p = center - 3; p <= center + 4; p++) if (p >= 1 && p <= this.manifest.pageCount) wanted.add(p);
    const paths = new Set<string>();
    const visible = this.pages;
    const assignments = await Promise.all([...wanted].map(async number => {
      const data = this.manifest.pages[number - 1]!;
      const asset = high && visible.includes(number) ? data.zoomImage : data.image;
      paths.add(asset.path); const url = await this.assets.get(asset.path);
      return { number, url };
    })).catch(error => { if (generation !== this.assetGeneration || this.gone) return null; throw error; });
    if (!assignments || this.gone || generation !== this.assetGeneration || this.state === 'dragging' || this.state === 'settling') return;
    // Decode the whole surface set, then commit it atomically outside a fold.
    for (const assignment of assignments) this.images[assignment.number - 1]!.src = assignment.url;
    for (let i = 0; i < this.images.length; i++) if (!wanted.has(i + 1)) this.images[i]!.removeAttribute('src');
    this.assets.retain(paths);
  }
  get pages() { return visiblePages(this.sourcePage, this.manifest.pageCount, this.layout, this.settings.showCoverAlone); }
  get reduced() { return this.settings.motionPreference === 'reduced' || (this.settings.motionPreference === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  private duration() { return this.settings.turnDurationMs / Math.min(1, Math.max(0.2, (2 * this.width - this.height / 10) / 1000)); }
  next() { return this.goTo(adjacentPage(this.sourcePage, this.manifest.pageCount, this.layout, this.settings.showCoverAlone, 1)); }
  previous() { return this.goTo(adjacentPage(this.sourcePage, this.manifest.pageCount, this.layout, this.settings.showCoverAlone, -1)); }
  async goTo(page: number) {
    page = Math.max(1, Math.min(this.manifest.pageCount, Math.round(page)));
    if (this.gone || this.state === 'error' || !Number.isFinite(page) || this.manifest.pageCount === 1) return;
    if (this.busy()) { this.pending = page; return; }
    if (this.pages.includes(page)) { this.sourcePage = page; this.notify(); return; }
    try {
      if (this.zoom !== 1) await this.setZoom(1);
      this.setState('loading'); await this.prepare(page);
      if (this.gone) return;
      this.targetPage = page;
      if (this.reduced) { this.flip.turnToPage(page - 1); this.sourcePage = page; await this.finish(); return; }
      this.setState('settling');
      await new Promise<void>(resolve => {
        this.settle = resolve;
        this.flip.flip(page - 1, 'bottom');
        this.turnTimeout = setTimeout(() => this.fail(new Error('The page-turn renderer did not settle. Retry the reader to restore this book.')), this.settings.turnDurationMs * 2 + 3000);
      });
    } catch (error) { this.fail(error); }
  }
  private async finish() {
    if (this.gone) return;
    clearTimeout(this.turnTimeout);
    const settled = Math.min(this.manifest.pageCount, this.flip.getCurrentPageIndex() + 1);
    this.sourcePage = this.targetPage && visiblePages(settled, this.manifest.pageCount, this.layout, this.settings.showCoverAlone).includes(this.targetPage) ? this.targetPage : settled;
    this.targetPage = undefined;
    this.setState(this.zoom > 1 ? 'zoomed' : 'idle'); this.updatePresentation(); this.notify();
    this.settle?.(); this.settle = undefined;
    if (this.pendingAppearance) { const settings = this.pendingAppearance; this.pendingAppearance = undefined; await this.updateAppearance(settings); }
    if (this.pendingResize) { this.pendingResize = false; this.resize(); }
    const pending = this.pending; this.pending = undefined;
    if (pending !== undefined) void this.goTo(pending);
    else void this.prepare(this.sourcePage, this.zoom > 1).catch(error => this.fail(error));
  }
  private notify() { this.root.dataset.page = this.pages.join('-'); for (const callback of this.observers) callback(this.pages); }
  onPageChange(callback: (pages: number[]) => void) { this.observers.add(callback); callback(this.pages); return () => { this.observers.delete(callback); }; }
  async setLayout(layout: BookLayout) { await this.updateAppearance({ ...this.settings, layout }); }
  async updateAppearance(settings: ReaderSettings) {
    if (this.busy()) { this.pendingAppearance = settings; return; }
    const changedCover = settings.showCoverAlone !== this.settings.showCoverAlone;
    const changedLayout = settings.layout !== this.settings.layout;
    this.settings = { ...settings };
    const engineSettings = this.flip.getSettings();
    engineSettings.flippingTime = this.duration(); engineSettings.maxShadowOpacity = settings.shadowStrength;
    if (changedCover) {
      engineSettings.showCover = settings.showCoverAlone;
      this.flip.updateFromHtml(this.sheets);
      for (let i = 0; i < this.flip.getPageCount(); i++) this.flip.getPage(i).setDensity('soft');
    }
    if (changedCover || changedLayout) this.resize(); else this.updatePresentation();
  }
  async setZoom(zoom: number) {
    if (this.busy()) return;
    this.zoom = zoom; this.pan = { x: 0, y: 0 }; this.setState('loading');
    try { await this.prepare(this.sourcePage, zoom > 1); this.setState(zoom > 1 ? 'zoomed' : 'idle'); this.updatePresentation(); this.notify(); }
    catch (error) { this.fail(error); }
  }
  private tick = () => {
    if (this.gone) return;
    this.updateTransform(); this.raf = requestAnimationFrame(this.tick);
  };
  private updateTransform() {
    let offset = 0;
    const controller = this.flip?.getFlipController();
    const calculation = controller?.getCalculation();
    const closingCover = this.settings.showCoverAlone && this.sourcePage === 2 &&
      (this.state === 'settling' || this.state === 'dragging') && calculation?.getDirection() === 1;
    this.sheets[1]?.classList.toggle('--cover-closing-underlay', closingCover);
    if (this.layout === 'spread' && this.settings.showCoverAlone) {
      let progress = 0;
      if (this.state === 'settling' || this.state === 'dragging') progress = calculation?.getFlippingProgress() ?? 0;
      if (this.sourcePage === 1) offset = -this.width / 2 * (1 - progress / 100);
      else if (this.pages[0] === 2 && calculation?.getDirection() === 1 && progress > 0) offset = -this.width / 2 * progress / 100;
    }
    const transform = `translate(${offset + this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
    if (transform !== this.lastTransform) { this.mover.style.transform = transform; this.lastTransform = transform; }
    const visibility = this.busy() ? 'hidden' : 'visible';
    if (this.links.style.visibility !== visibility) this.links.style.visibility = visibility;
  }
  private updatePresentation() {
    this.root.classList.toggle('paper-edges', this.settings.showPageEdges);
    this.updateTransform(); this.links.replaceChildren();
    // Interaction overlays deliberately live outside the renderer's cloned DOM.
    for (const number of this.pages) {
      const page = this.manifest.pages[number - 1]!;
      const isRight = this.layout === 'single' || (this.settings.showCoverAlone && number === 1) || (this.pages.length > 1 && number === this.pages[1]);
      const xSlot = this.layout === 'single' ? 0 : isRight ? this.width : 0;
      const imageWidth = Math.min(this.width, this.height * page.aspectRatio);
      const imageHeight = imageWidth / page.aspectRatio;
      for (const link of page.links) {
        const element = document.createElement('a'); element.className = 'paper-link'; element.setAttribute('aria-label', link.label || 'Document link');
        element.style.left = `${xSlot + (this.width - imageWidth) / 2 + imageWidth * link.x}px`;
        element.style.top = `${(this.height - imageHeight) / 2 + imageHeight * link.y}px`;
        element.style.width = `${imageWidth * link.width}px`; element.style.height = `${imageHeight * link.height}px`;
        if (link.target.type === 'external') { element.href = link.target.href; element.target = '_blank'; element.rel = 'noopener noreferrer'; }
        else { const destination = link.target.sourcePage; element.href = `#page-${destination}`; element.addEventListener('click', e => { e.preventDefault(); void this.goTo(destination); }); }
        this.links.append(element);
      }
    }
  }
  private point(event: PointerEvent) { const rect = this.book.getBoundingClientRect(); return { x: (event.clientX - rect.left) / this.zoom, y: (event.clientY - rect.top) / this.zoom }; }
  private isPageCorner(point: { x: number; y: number }) {
    const cornerSize = Math.hypot(this.width, this.height) / 5;
    const nearOuterEdge = point.x < cornerSize || point.x > this.width * (this.layout === 'single' ? 1 : 2) - cornerSize;
    return nearOuterEdge && (point.y < cornerSize || point.y > this.height - cornerSize);
  }
  private bindPointer() {
    const options = { signal: this.abort.signal };
    this.root.addEventListener('pointerdown', event => {
      if ((event.target as HTMLElement).closest('a,button,input,select')) return;
      if (this.pointer) {
        this.pointerIds.add(event.pointerId); this.root.setPointerCapture(event.pointerId);
        this.cancelGesture(); if (this.zoom === 1) void this.setZoom(2); return;
      }
      if (this.busy() || this.state === 'error') return;
      const point = this.point(event);
      const rect = this.book.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      event.preventDefault();
      this.pointerIds.add(event.pointerId);
      this.root.focus({ preventScroll: true }); this.root.setPointerCapture(event.pointerId);
      this.pointer = { id: event.pointerId, ...point, clientX: event.clientX, clientY: event.clientY, moved: false, started: false };
    }, options);
    this.root.addEventListener('dragstart', event => event.preventDefault(), options);
    this.root.addEventListener('pointermove', event => {
      const pointer = this.pointer; if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.clientX; const dy = event.clientY - pointer.clientY;
      if (this.zoom > 1) {
        this.pan.x = Math.max(-this.width * this.zoom, Math.min(this.width * this.zoom, this.pan.x + dx));
        this.pan.y = Math.max(-this.height, Math.min(this.height, this.pan.y + dy));
        pointer.clientX = event.clientX; pointer.clientY = event.clientY; return;
      }
      if (this.manifest.pageCount < 2 || this.reduced) return;
      if (!pointer.started && Math.hypot(dx, dy) > 10) {
        if (Math.abs(dy) > Math.abs(dx) * 1.7 && !this.isPageCorner(pointer)) { this.cancelGesture(); return; }
        const backward = pointer.x < this.width * (this.layout === 'single' ? .4 : 1);
        if ((backward && this.pages[0] === 1) || (!backward && this.pages.at(-1) === this.manifest.pageCount)) { this.pointer = undefined; return; }
        pointer.started = true; pointer.moved = true;
        this.flip.startUserTouch({ x: pointer.x, y: pointer.y });
        if (!this.flip.getFlipController().start({ x: pointer.x, y: pointer.y })) { this.pointer = undefined; return; }
      }
      if (pointer.started) { event.preventDefault(); this.flip.userMove(this.point(event), false); }
    }, options);
    this.root.addEventListener('pointerup', event => {
      this.pointerIds.delete(event.pointerId);
      const pointer = this.pointer; if (!pointer || pointer.id !== event.pointerId) return;
      this.pointer = undefined;
      if (pointer.started) this.flip.userStop(this.point(event), false);
      else if (this.zoom === 1 && Math.abs(event.clientX - pointer.clientX) > 30) void (event.clientX < pointer.clientX ? this.next() : this.previous());
      if (this.root.hasPointerCapture(event.pointerId)) this.root.releasePointerCapture(event.pointerId);
    }, options);
    this.root.addEventListener('pointercancel', () => { this.pointerIds.clear(); this.cancelGesture(); }, options);
    this.root.addEventListener('lostpointercapture', () => this.cancelGesture(), options);
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.cancelGesture(); }, options);
  }
  private cancelGesture() {
    const pointer = this.pointer; this.pointer = undefined;
    if (pointer?.started) {
      const controller = this.flip.getFlipController(); const calculation = controller.getCalculation();
      this.flip.userStop({ x: pointer.x, y: pointer.y }, true);
      if (calculation) {
        this.setState('settling');
        controller.animateFlippingTo(calculation.getPosition(), { x: this.width, y: calculation.getCorner() === 'bottom' ? this.height : 0 }, false);
      }
    }
  }
  private fail(error: unknown) { if (this.gone) return; clearTimeout(this.turnTimeout); this.setState('error'); this.pending = undefined; this.settle?.(); this.errorCallback(error instanceof Error ? error : new Error(String(error))); }
  destroy() { this.gone = true; this.assetGeneration++; clearTimeout(this.turnTimeout); cancelAnimationFrame(this.raf); this.abort.abort(); this.resizeObserver.disconnect(); this.assets.destroy(); this.settle?.(); this.flip?.destroy(); this.mover.remove(); this.observers.clear(); }
}

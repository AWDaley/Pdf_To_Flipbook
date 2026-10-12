/** Audited subset of the pinned 2.0.7 runtime. Extra internals stay inside the adapter. */
declare module 'page-flip' {
  type Point = { x: number; y: number };
  type Settings = { width: number; height: number; flippingTime: number; maxShadowOpacity: number; showCover: boolean; [key: string]: unknown };
  type Calculation = { getFlippingProgress(): number; getDirection(): number; getPosition(): Point; getCorner(): 'top' | 'bottom' };
  type Controller = { getCalculation(): Calculation | null; start(point: Point): boolean; animateFlippingTo(start: Point, end: Point, turn: boolean, reset?: boolean): void };
  export class PageFlip {
    constructor(root: HTMLElement, settings: Partial<Settings> & { width: number; height: number });
    on(event: string, callback: (event: { data: string | number }) => void): void;
    loadFromHTML(pages: HTMLElement[]): void;
    updateFromHtml(pages: HTMLElement[]): void;
    getPage(index: number): { setDensity(density: 'soft' | 'hard'): void };
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getSettings(): Settings;
    getFlipController(): Controller;
    getBoundsRect(): { left: number; top: number; width: number; height: number; pageWidth: number };
    update(): void;
    turnToPage(index: number): void;
    flip(index: number, corner: 'top' | 'bottom'): void;
    flipNext(corner: 'top' | 'bottom'): void;
    flipPrev(corner: 'top' | 'bottom'): void;
    startUserTouch(point: Point): void;
    userMove(point: Point, isTouch: boolean): void;
    userStop(point: Point, isSwipe?: boolean): void;
    destroy(): void;
  }
}

/** Decoded fit assets are bounded; zoom is only loaded for the visible artwork. */
export function resolveAssetUrl(path: string, base: URL): string {
  const embedded = window.__PAPERBOUND_EMBEDDED_ASSETS__?.[path];
  return typeof embedded === 'string' ? embedded : new URL(path, base).href;
}

export class AssetWindow {
  private entries = new Map<string, { url?: string; abort: AbortController; pending: Promise<string> }>();
  constructor(private base: URL) {}
  get(path: string): Promise<string> {
    const existing = this.entries.get(path);
    if (existing) return existing.pending;
    const abort = new AbortController();
    const entry = { abort, pending: Promise.resolve(''), url: undefined as string | undefined };
    entry.pending = (async () => {
      const embedded = window.__PAPERBOUND_EMBEDDED_ASSETS__?.[path];
      if (typeof embedded === 'string') {
        const image = new Image();
        image.src = embedded;
        try { await image.decode(); } catch { throw new Error(`Page image ${path} is damaged. Rebuild the PDF.`); }
        if (abort.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        entry.url = embedded;
        return embedded;
      }
      const assetUrl = new URL(path, this.base);
      if (assetUrl.protocol === 'file:') {
        const image = new Image();
        image.src = assetUrl.href;
        try { await image.decode(); } catch { throw new Error(`Page image ${path} is damaged. Rebuild the PDF.`); }
        if (abort.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        entry.url = assetUrl.href;
        return assetUrl.href;
      }
      const response = await fetch(assetUrl, { signal: abort.signal });
      if (!response.ok) throw new Error(`Cannot load ${path} (${response.status}). Reopen the project or rebuild its page images.`);
      const url = URL.createObjectURL(await response.blob());
      entry.url = url;
      const image = new Image();
      image.src = url;
      try { await image.decode(); } catch { URL.revokeObjectURL(url); throw new Error(`Page image ${path} is damaged. Rebuild the PDF.`); }
      if (abort.signal.aborted) { URL.revokeObjectURL(url); throw new DOMException('Cancelled', 'AbortError'); }
      return url;
    })();
    this.entries.set(path, entry);
    entry.pending.catch(() => { if (this.entries.get(path) === entry) this.entries.delete(path); });
    return entry.pending;
  }
  retain(paths: Set<string>) {
    for (const [path, entry] of this.entries) if (!paths.has(path)) {
      entry.abort.abort();
      if (entry.url?.startsWith('blob:')) URL.revokeObjectURL(entry.url);
      this.entries.delete(path);
    }
  }
  destroy() { this.retain(new Set()); }
}

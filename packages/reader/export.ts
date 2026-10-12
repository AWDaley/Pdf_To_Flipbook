import { mountReader } from './index';
import { manifestSchema } from '../shared/index';

declare global {
  interface Window {
    __PAPERBOUND_EMBEDDED_MANIFEST__?: unknown;
    __PAPERBOUND_EMBEDDED_ASSETS__?: Record<string, string>;
    __PAPERBOUND_EMBEDDED_TEXT__?: Record<string, string>;
  }
}

const host = document.getElementById('reader') ?? document.body;
host.style.height = '100dvh';
async function start() {
  if (window.__PAPERBOUND_EMBEDDED_MANIFEST__) {
    const manifest = manifestSchema.parse(window.__PAPERBOUND_EMBEDDED_MANIFEST__);
    document.title = manifest.title;
    await mountReader(host, manifest, new URL('.', location.href));
    return;
  }
  const url = new URL('manifest.json', location.href);
  const response = await fetch(url); if (!response.ok) throw new Error('Cannot load manifest.json. Check that the complete export folder is present.');
  const manifest = manifestSchema.parse(await response.json()); document.title = manifest.title;
  await mountReader(host, manifest, new URL('.', url));
}
void start().catch(error => { host.textContent = `Unable to open flipbook: ${error instanceof Error ? error.message : String(error)}`; });

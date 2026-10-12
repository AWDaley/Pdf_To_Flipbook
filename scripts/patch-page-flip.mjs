/**
 * Small, reproducible compatibility patch for the pinned MIT page-flip 2.0.7.
 * Geometry and shadow calculations remain upstream. See docs/ENGINE_EVALUATION.md.
 *
 * Both published bundles are patched so preview and export cannot diverge.
 * Exact replacement counts deliberately fail installation after an upstream change.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const dependencyRoot = path.join(projectRoot, 'node_modules', 'page-flip');
const manifest = JSON.parse(await readFile(path.join(dependencyRoot, 'package.json'), 'utf8'));
if (manifest.version !== '2.0.7') {
  throw new Error(`Review the PageFlip compatibility patch before upgrading from 2.0.7 to ${manifest.version}.`);
}

const marker = '/* Flipbook Studio: page-flip 2.0.7 compatibility patch v1 */';
const patches = [
  {
    name: 'portrait forward reverse uses the following source artwork',
    before: 'this.pages[e].newTemporaryCopy():this.pages[e-1]',
    after: 'this.pages[e].newTemporaryCopy(this.pages[e+1]):this.pages[e-1]',
  },
  {
    name: 'optional reverse artwork for the temporary HTML surface',
    before: 'newTemporaryCopy(){return"hard"===this.nowDrawingDensity?this:(null===this.temporaryCopy&&(this.copiedElement=this.element.cloneNode(!0),',
    after: 'newTemporaryCopy(sourcePage){return"hard"===this.nowDrawingDensity?this:(null===this.temporaryCopy&&(this.copiedElement=(sourcePage&&sourcePage.getElement?sourcePage.getElement():this.element).cloneNode(!0),',
  },
  {
    name: 'cancellable render loop',
    before: 'start(){this.update();const t=e=>{this.render(e),requestAnimationFrame(t)};requestAnimationFrame(t)}',
    after: 'start(){this.__studioStopped=!1,this.update();const t=e=>{if(this.__studioStopped)return;this.render(e);if(!this.__studioStopped)this.__studioRaf=requestAnimationFrame(t)};this.__studioRaf=requestAnimationFrame(t)}stop(){this.__studioStopped=!0,cancelAnimationFrame(this.__studioRaf),this.animation=null}',
  },
  {
    name: 'stop rendering and release collection on destroy',
    before: 'destroy(){this.ui.destroy(),this.block.remove()}',
    after: 'destroy(){this.__studioDestroyed=!0,this.render&&this.render.stop(),this.ui&&this.ui.destroy(),this.pages&&this.pages.destroy(),this.block.remove()}',
  },
  {
    name: 'release window listeners even with application-owned pointers',
    before: 'destroy(){this.app.getSettings().useMouseEvents&&this.removeHandlers(),this.distElement.remove(),this.wrapper.remove()}',
    after: 'destroy(){this.touchPoint=null,this.removeHandlers(),this.distElement.remove(),this.wrapper.remove()}',
  },
  {
    name: 'let the adapter own resize scheduling with autoResize false',
    before: 'this.onResize=()=>{this.update()}',
    after: 'this.onResize=()=>{!1!==this.app.getSettings().autoResize&&this.update()}',
  },
  {
    name: 'do not run delayed initialization after destruction',
    before: 'setTimeout(()=>{this.ui.update(),this.trigger("init",',
    after: 'setTimeout(()=>{if(this.__studioDestroyed)return;this.ui.update(),this.trigger("init",',
    count: 2,
  },
];

// Compute both outputs before writing either one; unexpected input fails closed.
const outputs = [];
for (const name of ['page-flip.browser.js', 'page-flip.module.js']) {
  const filename = path.join(dependencyRoot, 'dist', 'js', name);
  let source = await readFile(filename, 'utf8');
  if (source.startsWith(marker)) {
    for (const patch of patches) {
      const count = source.split(patch.after).length - 1;
      if (count !== (patch.count ?? 1)) {
        throw new Error(`${name}: existing patch is incomplete: ${patch.name}. Reinstall with npm ci.`);
      }
    }
    continue;
  }
  for (const patch of patches) {
    const count = source.split(patch.before).length - 1;
    if (count !== (patch.count ?? 1)) {
      throw new Error(`${name}: expected ${patch.count ?? 1} occurrence(s), found ${count}: ${patch.name}.`);
    }
    source = source.split(patch.before).join(patch.after);
  }
  outputs.push({ filename, source: `${marker}\n${source}` });
}
for (const output of outputs) await writeFile(output.filename, output.source);
console.log(`PageFlip 2.0.7 compatibility patch verified (${outputs.length} bundle(s) updated).`);

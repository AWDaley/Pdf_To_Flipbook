import { build } from 'vite';
import { resolve } from 'node:path';

await build();
await build({
  configFile: false,
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist/reader',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve('packages/reader/export.ts'),
      formats: ['es'],
      fileName: () => 'reader.js',
      cssFileName: 'reader',
    },
  },
});
console.log('Built studio and independent reader from the shared reader source.');

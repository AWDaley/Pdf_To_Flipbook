import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    allowedHosts: ['127.0.0.1', 'localhost'],
    watch: { ignored: ['**/data/**', '**/artifacts/**', '**/test-output/**', '**/.test-*/**', '**/test-results/**', '**/playwright-report/**'] },
  },
  build: { outDir: 'dist/studio', target: 'es2022', sourcemap: true },
});

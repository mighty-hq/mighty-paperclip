import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'node:fs/promises': resolve(__dirname, 'src/stubs/node-fs-promises.ts'),
      'node:stream/promises': resolve(__dirname, 'src/stubs/node-stream-promises.ts'),
      'node:child_process': resolve(__dirname, 'src/stubs/node-child_process.ts'),
      'node:fs': resolve(__dirname, 'src/stubs/node-fs.ts'),
      'node:path': resolve(__dirname, 'src/stubs/node-path.ts'),
      'node:buffer': resolve(__dirname, 'src/stubs/node-buffer.ts'),
      'node:stream': resolve(__dirname, 'src/stubs/node-stream.ts'),
      'node:util': resolve(__dirname, 'src/stubs/node-util.ts'),
      'node:os': resolve(__dirname, 'src/stubs/node-os.ts'),
      'node:url': resolve(__dirname, 'src/stubs/node-url.ts'),
      'node:string_decoder': resolve(__dirname, 'src/stubs/node-string_decoder.ts'),
      'node:events': resolve(__dirname, 'src/stubs/node-events.ts'),
      'node:crypto': resolve(__dirname, 'src/stubs/node-crypto.ts'),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
});

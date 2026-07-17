import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/diff.ts'),
      fileName: () => 'diff.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^@platejs\//, /^platejs(?:\/.*)?$/],
      output: {
        entryFileNames: 'diff.js',
      },
    },
    target: 'es2022',
  },
});

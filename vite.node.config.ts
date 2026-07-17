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
      entry: path.resolve(__dirname, 'src/node.ts'),
      fileName: () => 'node.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        /^@platejs\//,
        /^platejs(?:\/.*)?$/,
        /^react(?:\/.*)?$/,
        /^react-dom(?:\/.*)?$/,
        'remark-gfm',
      ],
      output: {
        entryFileNames: 'node.js',
      },
    },
    target: 'node18',
  },
});

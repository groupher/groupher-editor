// vite.config.js
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const bundledDependencies = ['@emoji-mart/data']

const isBundledDependency = (id: string): boolean =>
  bundledDependencies.some(
    (dependency) => id === dependency || id.startsWith(`${dependency}/`)
  )

const isExternalDependency = (id: string): boolean =>
  !isBundledDependency(id) &&
  !id.startsWith('.') &&
  !id.startsWith('\0') &&
  !id.startsWith('@/') &&
  !path.isAbsolute(id)

export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: {
        'diff-viewer': path.resolve(__dirname, 'src/RichEditorDiff.tsx'),
        'rich-editor': path.resolve(__dirname, 'src/RichEditor.tsx'),
      },
      cssFileName: 'rich-editor',
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: isExternalDependency,
      output: {
        exports: 'named',
        chunkFileNames: `chunks/[name]-[hash].js`,
        assetFileNames: `[name].[ext]`
      }
    },
    // warning size
    chunkSizeWarningLimit: 2000
  }
})

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd()) },
  },
  oxc: {
    include: /\.[jt]sx?$/,
    exclude: /node_modules/,
    lang: 'jsx',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
})

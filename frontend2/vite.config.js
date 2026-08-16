import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    visualizer({
      template: 'raw-data',
      filename: 'stats.json',
      brotliSize: true,
      gzipSize: true
    })
  ],
  server: {
    host: true,  // allow phone access on same WiFi
    port: 5173,
    allowedHosts: true 
  },
  build: {
    chunkSizeWarningLimit: 1000
  }
})

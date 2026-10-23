import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js + drei viven en un chunk diferido que sólo se descarga con el Custom Lab.
    chunkSizeWarningLimit: 1100,
    // Dos páginas: la landing (/) y el Custom Lab (/custom-lab/).
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        lab: resolve(import.meta.dirname, 'custom-lab/index.html'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // three.js + drei viven en un chunk diferido que sólo se descarga con el Custom Lab.
  build: { chunkSizeWarningLimit: 1100 },
})

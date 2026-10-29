import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

// Sitio estático: la home (/) en Astro y el Custom Lab (/custom-lab/) como isla de React.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [react()],
  vite: {
    build: {
      // three.js + drei viven en un chunk diferido que sólo se descarga con el Custom Lab.
      chunkSizeWarningLimit: 1100,
    },
  },
})

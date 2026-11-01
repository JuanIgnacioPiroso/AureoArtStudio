import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { business } from './src/config/business.ts'

// Con `business.siteUrl` en null no hay `site`: sin URL absoluta no se genera el sitemap.
const site = business.siteUrl ?? undefined

// Sitio estático: la home (/) en Astro y el Custom Lab (/custom-lab/) como isla de React.
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [react(), ...(site ? [sitemap()] : [])],
  vite: {
    build: {
      // three.js + drei viven en un chunk diferido que sólo se descarga con el Custom Lab.
      chunkSizeWarningLimit: 1100,
    },
  },
})

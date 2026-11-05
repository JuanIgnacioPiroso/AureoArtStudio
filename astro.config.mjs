import { defineConfig, fontProviders } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { business } from './src/config/business.ts'

// Con `business.siteUrl` en null no hay `site`: sin URL absoluta no se genera el sitemap.
const site = business.siteUrl ?? undefined

// Fuentes alojadas en el sitio (src/assets/fonts/, ver scripts/subset-fonts.sh). Astro genera los
// @font-face, los fallbacks ajustados por métricas y los preload; cada familia expone su variable CSS.
const localFont = (name, cssVariable, file, weight, fallbacks) => ({
  provider: fontProviders.local(),
  name,
  cssVariable,
  fallbacks,
  display: 'swap',
  options: { variants: [{ src: [`./src/assets/fonts/${file}.woff2`], weight, style: 'normal' }] },
})

const fonts = [
  localFont('Bodoni Moda', '--font-bodoni', 'bodoni-moda', '400 700', ['Didot', 'Bodoni 72', 'Georgia', 'serif']),
  localFont('Hanken Grotesk', '--font-grotesk', 'hanken-grotesk', '400 600', ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif']),
  // Grabado del Custom Lab: `--font-<FontId>` con la genérica de `FontDef.fallback` (src/lab/model/catalog.ts).
  localFont('Playfair Display', '--font-playfair', 'playfair-display', 500, ['serif']),
  localFont('Cormorant Garamond', '--font-cormorant', 'cormorant-garamond', 600, ['serif']),
  localFont('EB Garamond', '--font-garamond', 'eb-garamond', 500, ['serif']),
  localFont('Libre Baskerville', '--font-baskerville', 'libre-baskerville', 400, ['serif']),
  localFont('Cinzel', '--font-cinzel', 'cinzel', 500, ['serif']),
  localFont('Cinzel Decorative', '--font-cinzel-deco', 'cinzel-decorative', 400, ['serif']),
  localFont('Abril Fatface', '--font-abril', 'abril-fatface', 400, ['serif']),
  localFont('Bebas Neue', '--font-bebas', 'bebas-neue', 400, ['serif']),
  localFont('Oswald', '--font-oswald', 'oswald', 500, ['serif']),
  localFont('Montserrat', '--font-montserrat', 'montserrat', 500, ['sans-serif']),
  localFont('Josefin Sans', '--font-josefin', 'josefin-sans', 500, ['sans-serif']),
  localFont('Raleway', '--font-raleway', 'raleway', 500, ['sans-serif']),
  localFont('Pinyon Script', '--font-script', 'pinyon-script', 400, ['cursive']),
  localFont('Great Vibes', '--font-great-vibes', 'great-vibes', 400, ['cursive']),
  localFont('Dancing Script', '--font-dancing', 'dancing-script', 500, ['cursive']),
  localFont('Allura', '--font-allura', 'allura', 400, ['cursive']),
  localFont('Space Mono', '--font-space-mono', 'space-mono', 400, ['monospace']),
]

// Sitio estático: la home (/) en Astro y el Custom Lab (/custom-lab/) como isla de React.
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  fonts,
  integrations: [react(), ...(site ? [sitemap()] : [])],
  vite: {
    build: {
      // three.js + drei viven en un chunk diferido que sólo se descarga con el Custom Lab.
      chunkSizeWarningLimit: 1100,
    },
  },
})

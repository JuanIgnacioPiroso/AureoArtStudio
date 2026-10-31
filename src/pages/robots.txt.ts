import type { APIRoute } from 'astro'
import { absoluteUrl } from '../config/seo'

// La línea Sitemap sólo aparece cuando hay `business.siteUrl` (mismo criterio que la integración).
export const GET: APIRoute = () => {
  const sitemapUrl = absoluteUrl('/sitemap-index.xml')
  const lines = ['User-agent: *', 'Allow: /', ...(sitemapUrl ? ['', `Sitemap: ${sitemapUrl}`] : [])]
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

import type { BusinessConfig } from './business'
import { business } from './business'

/** Imagen de Open Graph compartida por todas las páginas (en `public/`). */
export const OG_IMAGE = {
  path: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'AUREO Art Studio: grabado láser personalizado en cuchillos, tablas, termos y regalos.',
} as const

const DESCRIPTION =
  'Estudio de grabado láser personalizado en cuchillos, tablas de madera, termos, mates, placas, trofeos y artículos de cuero.'

/** `siteUrl` sin barras finales, o `null` si no está cargado. */
function baseUrl(siteUrl: string | null): string | null {
  if (!siteUrl) return null
  return siteUrl.replace(/\/+$/, '')
}

/**
 * Une la URL del sitio con `path`. Devuelve `null` mientras `siteUrl` no esté cargado,
 * así quien la usa puede omitir la etiqueta en vez de publicar una URL incompleta.
 */
export function absoluteUrl(path: string, siteUrl: string | null = business.siteUrl): string | null {
  const base = baseUrl(siteUrl)
  if (!base) return null
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/** Saca las propiedades con `null`, `undefined` o listas vacías (no se publican datos que falten). */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0),
    ),
  ) as Partial<T>
}

/** JSON-LD del negocio: `LocalBusiness` si hay ciudad o dirección; si no, `Organization`. */
export function organizationSchema(b: BusinessConfig): object {
  const site = baseUrl(b.siteUrl)
  const hasLocation = Boolean(b.city || b.address)

  return compact({
    '@context': 'https://schema.org',
    '@type': hasLocation ? 'LocalBusiness' : 'Organization',
    '@id': site ? `${site}/#negocio` : null,
    name: b.name,
    legalName: b.legalName,
    url: site,
    logo: site ? `${site}/favicon.svg` : null,
    image: absoluteUrl(OG_IMAGE.path, b.siteUrl),
    description: DESCRIPTION,
    telephone: b.whatsapp ? `+${b.whatsapp}` : null,
    email: b.email,
    sameAs: [b.instagram, b.facebook].filter((u): u is string => Boolean(u)),
    address: hasLocation
      ? compact({
          '@type': 'PostalAddress',
          streetAddress: b.address,
          addressLocality: b.city,
          addressCountry: 'AR',
        })
      : null,
  })
}

/** JSON-LD `WebSite`; `null` mientras no haya `siteUrl`. */
export function websiteSchema(b: BusinessConfig): object | null {
  const site = baseUrl(b.siteUrl)
  if (!site) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: b.name,
    url: site,
  }
}

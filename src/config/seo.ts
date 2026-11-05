import type { Faq } from '../content/site'
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
    logo: site ? `${site}/logo.png` : null,
    image: absoluteUrl(OG_IMAGE.path, b.siteUrl),
    description: DESCRIPTION,
    telephone: b.whatsapp ? `+${b.whatsapp}` : null,
    email: b.email,
    sameAs: [b.instagram].filter((u): u is string => Boolean(u)),
    address: hasLocation
      ? compact({
          '@type': 'PostalAddress',
          streetAddress: b.address,
          addressLocality: b.city,
          postalCode: b.postalCode,
          addressCountry: 'AR',
        })
      : null,
    openingHours: b.openingHours,
    paymentAccepted: b.paymentAccepted,
    areaServed: b.areaServed.map((name) => ({
      '@type': name === 'Argentina' ? 'Country' : 'AdministrativeArea',
      name,
    })),
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

/**
 * JSON-LD `FAQPage` con las preguntas respondidas, filtradas igual que en la página.
 * El texto del enlace se suma a la respuesta para que coincida con lo visible.
 * `null` si no hay ninguna respondida.
 */
export function faqSchema(items: readonly Faq[]): object | null {
  const answered = items.filter((f) => f.a)
  if (answered.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: answered.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.link ? `${f.a} ${f.link.label}` : f.a,
      },
    })),
  }
}

export interface Crumb {
  name: string
  path: string
}

/**
 * JSON-LD `BreadcrumbList` de las migas de una página. El último paso es la página actual y va sin `item`.
 * `null` mientras no haya `siteUrl`: los pasos anteriores necesitan una URL absoluta.
 */
export function breadcrumbSchema(crumbs: readonly Crumb[], b: BusinessConfig = business): object | null {
  if (!baseUrl(b.siteUrl)) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) =>
      compact({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: i < crumbs.length - 1 ? absoluteUrl(c.path, b.siteUrl) : null,
      }),
    ),
  }
}

export interface ListEntry {
  name: string
  description: string
  path: string
}

/**
 * JSON-LD `ItemList` de los productos de una página (y no `Product`: sin precio ni stock da avisos en Search Console).
 * Sin `siteUrl` cada elemento va sin `url`. `null` si la lista está vacía.
 */
export function itemListSchema(name: string, entries: readonly ListEntry[], b: BusinessConfig = business): object | null {
  if (entries.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: entries.length,
    itemListElement: entries.map((e, i) =>
      compact({
        '@type': 'ListItem',
        position: i + 1,
        name: e.name,
        description: e.description,
        url: absoluteUrl(e.path, b.siteUrl),
      }),
    ),
  }
}

export interface ArticleInput {
  path: string
  headline: string
  description: string
  /** Fecha ISO (AAAA-MM-DD) de la última revisión del contenido. */
  dateModified: string
}

/** Referencia al negocio: su `@id` (el de `organizationSchema`) o, sin `siteUrl`, su nombre como `Organization`. */
function businessRef(b: BusinessConfig): object {
  const site = baseUrl(b.siteUrl)
  return site ? { '@id': `${site}/#negocio` } : { '@type': 'Organization', name: b.name }
}

/**
 * JSON-LD `Article` de una página de contenido. Autor y editor apuntan al `@id` del negocio
 * (el de `organizationSchema`); sin `siteUrl` no hay `@id` y se nombra al negocio como `Organization`.
 */
export function articleSchema(b: BusinessConfig, a: ArticleInput): object {
  const org = businessRef(b)
  const url = absoluteUrl(a.path, b.siteUrl)
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    inLanguage: 'es-AR',
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(OG_IMAGE.path, b.siteUrl),
    dateModified: a.dateModified,
    author: org,
    publisher: org,
  })
}

export interface ServiceInput {
  path: string
  name: string
  serviceType: string
  description: string
}

/**
 * JSON-LD `Service` de una página de servicio. `provider` apunta al negocio como en `articleSchema`;
 * `areaServed` es la ciudad del negocio y se omite mientras `business.city` no esté cargada.
 */
export function serviceSchema(b: BusinessConfig, s: ServiceInput): object {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    serviceType: s.serviceType,
    description: s.description,
    url: absoluteUrl(s.path, b.siteUrl),
    provider: businessRef(b),
    areaServed: b.city ? { '@type': 'City', name: b.city } : null,
  })
}

export interface WebApplicationInput {
  path: string
  name: string
  description: string
}

/** JSON-LD `WebApplication` del simulador. `provider` apunta al negocio como en `serviceSchema`. */
export function webApplicationSchema(b: BusinessConfig, a: WebApplicationInput): object {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: a.name,
    description: a.description,
    url: absoluteUrl(a.path, b.siteUrl),
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requiere WebGL',
    inLanguage: 'es-AR',
    isAccessibleForFree: true,
    provider: businessRef(b),
  })
}

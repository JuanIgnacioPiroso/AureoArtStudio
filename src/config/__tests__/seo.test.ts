import { describe, expect, it } from 'vitest'
import type { BusinessConfig } from '../business'
import { absoluteUrl, organizationSchema, websiteSchema } from '../seo'

const empty: BusinessConfig = {
  name: 'AUREO Art Studio',
  legalName: null,
  whatsapp: null,
  email: null,
  instagram: null,
  facebook: null,
  city: null,
  address: null,
  siteUrl: null,
}

const full: BusinessConfig = {
  name: 'AUREO Art Studio',
  legalName: 'Aureo SRL',
  whatsapp: '5491112345678',
  email: 'hola@example.com',
  instagram: 'https://instagram.com/aureo',
  facebook: null,
  city: 'Tandil',
  address: 'Calle 123',
  siteUrl: 'https://example.com/',
}

describe('absoluteUrl', () => {
  it('devuelve null sin siteUrl', () => {
    expect(absoluteUrl('/', null)).toBeNull()
  })

  it('une la URL del sitio con la ruta', () => {
    expect(absoluteUrl('/custom-lab/', 'https://example.com')).toBe('https://example.com/custom-lab/')
  })

  it('quita la barra final de siteUrl', () => {
    expect(absoluteUrl('/', 'https://example.com//')).toBe('https://example.com/')
  })

  it('agrega la barra inicial si falta', () => {
    expect(absoluteUrl('og-image.png', 'https://example.com')).toBe('https://example.com/og-image.png')
  })
})

describe('organizationSchema', () => {
  it('sin datos es Organization con name y description, sin propiedades vacías', () => {
    const schema = organizationSchema(empty) as Record<string, unknown>
    expect(schema['@type']).toBe('Organization')
    expect(schema.name).toBe('AUREO Art Studio')
    expect(typeof schema.description).toBe('string')
    expect(Object.keys(schema).sort()).toEqual(['@context', '@type', 'description', 'name'])
    expect(JSON.stringify(schema)).not.toContain('null')
  })

  it('con ciudad es LocalBusiness con dirección argentina', () => {
    const schema = organizationSchema({ ...empty, city: 'Tandil' }) as Record<string, unknown>
    expect(schema['@type']).toBe('LocalBusiness')
    expect(schema.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Tandil',
      addressCountry: 'AR',
    })
  })

  it('con todos los datos arma URLs absolutas y contactos', () => {
    const schema = organizationSchema(full) as Record<string, unknown>
    expect(schema).toMatchObject({
      '@id': 'https://example.com/#negocio',
      url: 'https://example.com',
      logo: 'https://example.com/favicon.svg',
      image: 'https://example.com/og-image.png',
      legalName: 'Aureo SRL',
      telephone: '+5491112345678',
      email: 'hola@example.com',
      sameAs: ['https://instagram.com/aureo'],
      address: { streetAddress: 'Calle 123', addressLocality: 'Tandil', addressCountry: 'AR' },
    })
  })

  it('omite sameAs si no hay redes', () => {
    expect(organizationSchema(empty)).not.toHaveProperty('sameAs')
  })
})

describe('websiteSchema', () => {
  it('es null sin siteUrl', () => {
    expect(websiteSchema(empty)).toBeNull()
  })

  it('arma WebSite con name y url', () => {
    expect(websiteSchema(full)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AUREO Art Studio',
      url: 'https://example.com',
    })
  })
})

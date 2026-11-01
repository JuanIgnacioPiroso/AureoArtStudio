import { describe, expect, it } from 'vitest'
import type { BusinessConfig } from '../../config/business'
import { MATERIALS, PRODUCTS } from '../../lab/model/catalog'
import { categoryHref, categoryLink, categoryProducts } from '../categories'
import { CATEGORIES, GIFT_IDEA_PRODUCT_IDS, type Category } from '../site'

const noContact: BusinessConfig = {
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

const byId = (id: string): Category => {
  const c = CATEGORIES.find((x) => x.id === id)
  if (!c) throw new Error(`No existe la categoría ${id}`)
  return c
}

describe('categoryHref', () => {
  it('con producto en el Lab, abre el Lab con ese producto aunque haya canales', () => {
    const b = { ...noContact, whatsapp: '5491112345678', email: 'hola@ejemplo.com' }
    expect(categoryHref(byId('cuchillos'), b)).toEqual({ href: '/custom-lab/?producto=knife', kind: 'lab' })
  })

  it('sin producto y con WhatsApp, abre wa.me con el saludo y la consulta', () => {
    const b = { ...noContact, whatsapp: '5491112345678', email: 'hola@ejemplo.com' }
    expect(categoryHref(byId('regalos'), b)).toEqual({
      href:
        'https://wa.me/5491112345678?text=' +
        encodeURIComponent('Hola, AUREO Art Studio. Quiero consultar por un regalo personalizado.'),
      kind: 'whatsapp',
    })
  })

  it('sin producto y con sólo email, abre mailto con el asunto de la categoría', () => {
    const b = { ...noContact, email: 'hola@ejemplo.com' }
    expect(categoryHref(byId('empresas'), b)).toEqual({
      href:
        'mailto:hola@ejemplo.com?subject=' +
        encodeURIComponent('Hola, AUREO Art Studio. Quiero consultar por productos con el logo de mi empresa.'),
      kind: 'email',
    })
  })

  it('sin producto ni canales, lleva al Lab sin producto elegido', () => {
    expect(categoryHref(byId('regalos'), noContact)).toEqual({ href: '/custom-lab/', kind: 'lab' })
    expect(categoryHref(byId('empresas'), noContact)).toEqual({ href: '/custom-lab/', kind: 'lab' })
  })
})

describe('CATEGORIES', () => {
  it('toda categoría sin producto en el Lab tiene consulta', () => {
    const missing = CATEGORIES.filter((c) => c.labProductIds.length === 0 && !c.inquiry?.trim()).map((c) => c.id)
    expect(missing).toEqual([])
  })

  it('los slugs son únicos', () => {
    const slugs = CATEGORIES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('los slugs van en minúscula, sin tildes ni espacios', () => {
    expect(CATEGORIES.filter((c) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)).map((c) => c.id)).toEqual([])
  })

  it('todo id de labProductIds existe en PRODUCTS', () => {
    const ids = new Set(PRODUCTS.map((p) => p.id))
    const missing = CATEGORIES.flatMap((c) => c.labProductIds.filter((id) => !ids.has(id)).map((id) => `${c.id}:${id}`))
    expect(missing).toEqual([])
  })

  it('ningún producto de PRODUCTS queda sin categoría', () => {
    const used = new Set(CATEGORIES.flatMap((c) => c.labProductIds))
    expect(PRODUCTS.filter((p) => !used.has(p.id)).map((p) => p.id)).toEqual([])
  })

  it.each(CATEGORIES.map((c) => [c.id, c] as const))('los textos SEO de %s respetan las longitudes', (_, c) => {
    expect(c.seo.title.length).toBeLessThanOrEqual(60)
    expect(c.seo.description.length).toBeLessThanOrEqual(155)
    expect(c.seo.h1.trim()).not.toBe('')
    expect(c.seo.intro.trim()).not.toBe('')
  })
})

describe('categoryProducts', () => {
  it('toma materiales y zonas en mm del catálogo', () => {
    const [knife] = categoryProducts(byId('cuchillos'))
    expect(knife).toMatchObject({
      id: 'knife',
      href: '/custom-lab/?producto=knife',
      materials: PRODUCTS.find((p) => p.id === 'knife')!.materialIds.map((m) => MATERIALS[m]!.name),
      zones: [
        { label: 'Hoja', size: '120 × 22 mm' },
        { label: 'Mango', size: '80 × 15 mm' },
      ],
    })
  })

  it('con formas, arma una línea por forma', () => {
    const keychain = categoryProducts(byId('cuero')).find((p) => p.id === 'leather-keychain')
    expect(keychain?.zones).toEqual([
      { label: 'Rectángulo', size: 'frente 25 × 45 mm · dorso 25 × 45 mm' },
      { label: 'Redondo', size: 'frente 28 × 28 mm · dorso 28 × 28 mm' },
      { label: 'Escudo', size: 'frente 30 × 30 mm · dorso 30 × 30 mm' },
    ])
  })

  it('la boca de una virola se mide con sus dos diámetros', () => {
    const imperial = categoryProducts(byId('termos')).find((p) => p.id === 'mate-imperial')
    expect(imperial?.zones[0]).toEqual({ label: 'Boca', size: 'aro de Ø 88 mm (Ø 64 mm por dentro)' })
  })

  it('Regalos muestra la selección de ideas, que existe en PRODUCTS', () => {
    const ids = new Set(PRODUCTS.map((p) => p.id))
    expect(GIFT_IDEA_PRODUCT_IDS.filter((id) => !ids.has(id))).toEqual([])
    expect(categoryProducts(byId('regalos')).map((p) => p.id)).toEqual([...GIFT_IDEA_PRODUCT_IDS])
  })
})

describe('categoryLink', () => {
  it('con página propia, lleva a /<slug>/ aunque tenga producto en el Lab', () => {
    expect(categoryLink(byId('termos'), noContact)).toEqual({ href: '/mates-y-termos-grabados/', kind: 'page' })
    expect(categoryLink(byId('regalos'), noContact)).toEqual({ href: '/regalos-personalizados/', kind: 'page' })
  })

  it('empresas lleva a /regalos-empresariales/ aunque haya canales', () => {
    const b = { ...noContact, whatsapp: '5491112345678', email: 'hola@ejemplo.com' }
    expect(categoryLink(byId('empresas'), b)).toEqual({ href: '/regalos-empresariales/', kind: 'page' })
  })

  it('una categoría deshabilitada sin producto sigue la regla de categoryHref', () => {
    const c = { ...byId('empresas'), enabled: false }
    const b = { ...noContact, email: 'hola@ejemplo.com' }
    expect(categoryLink(c, b)).toEqual(categoryHref(c, b))
  })
})

import { describe, expect, it } from 'vitest'
import type { BusinessConfig } from '../../config/business'
import { categoryHref } from '../categories'
import { CATEGORIES, type Category } from '../site'

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
    const missing = CATEGORIES.filter((c) => !c.labProductId && !c.inquiry?.trim()).map((c) => c.id)
    expect(missing).toEqual([])
  })
})

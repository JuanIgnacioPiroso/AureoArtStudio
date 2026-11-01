import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../../lab/model/catalog'
import {
  CORPORATE,
  CORPORATE_OCCASIONS,
  CORPORATE_PRODUCT_IDS,
  CORPORATE_SEO,
  corporateConditions,
  corporateSteps,
  type CorporateConditions,
} from '../corporate'

const empty: CorporateConditions = {
  minimumOrder: null,
  leadTime: null,
  sample: null,
  invoicing: null,
  delivery: null,
}

const filled: CorporateConditions = {
  minimumOrder: '10 unidades',
  leadTime: '15 días hábiles desde que se aprueba la muestra',
  sample: true,
  invoicing: 'Factura A y B',
  delivery: 'Envíos a todo el país; entregas en CABA y GBA',
}

const productIds = new Set(PRODUCTS.map((p) => p.id))

describe('textos SEO de empresas', () => {
  it('el title mide 60 caracteres o menos', () => {
    expect(CORPORATE_SEO.title.length).toBeLessThanOrEqual(60)
  })

  it('la description mide 155 caracteres o menos', () => {
    expect(CORPORATE_SEO.description.length).toBeLessThanOrEqual(155)
  })
})

describe('corporateConditions', () => {
  it('con todo en null no hay líneas, así que «Datos del pedido» no se renderiza', () => {
    expect(corporateConditions(empty)).toEqual([])
  })

  it('CORPORATE arranca vacío: la sección no aparece hasta que el taller cargue datos', () => {
    expect(corporateConditions(CORPORATE)).toEqual([])
  })

  it('con datos, cada condición va en su línea', () => {
    expect(corporateConditions(filled).map((l) => l.label)).toEqual([
      'Pedido mínimo',
      'Plazo de producción',
      'Muestra para aprobar',
      'Facturación',
      'Entrega y envíos',
    ])
  })

  it('sólo muestra los datos cargados', () => {
    expect(corporateConditions({ ...empty, invoicing: 'Factura A y B' })).toEqual([
      { label: 'Facturación', value: 'Factura A y B' },
    ])
  })

  it('una muestra en false también es un dato', () => {
    expect(corporateConditions({ ...empty, sample: false }).map((l) => l.label)).toEqual(['Muestra para aprobar'])
  })
})

describe('corporateSteps', () => {
  it('sin muestra confirmada, el proceso no la promete', () => {
    for (const sample of [null, false]) {
      const titles = corporateSteps({ ...empty, sample }).map((s) => s.title)
      expect(titles).toHaveLength(4)
      expect(titles.join(' ')).not.toMatch(/muestra/i)
    }
  })

  it('con muestra, es el tercer paso de cinco', () => {
    const steps = corporateSteps({ ...empty, sample: true })
    expect(steps).toHaveLength(5)
    expect(steps[2]!.title).toMatch(/muestra/i)
  })

  it('la factura sólo figura si está cargada', () => {
    expect(corporateSteps(empty).at(-1)!.title).not.toMatch(/factura/i)
    expect(corporateSteps({ ...empty, invoicing: 'Factura A y B' }).at(-1)!.title).toMatch(/factura/i)
  })
})

describe('productos de la página de empresas', () => {
  it('los productos y las sugerencias de cada ocasión existen en el Lab', () => {
    const ids = [...CORPORATE_PRODUCT_IDS, ...CORPORATE_OCCASIONS.flatMap((o) => o.productIds)]
    expect(ids.filter((id) => !productIds.has(id))).toEqual([])
  })
})

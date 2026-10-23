import { describe, expect, it } from 'vitest'
import { getProduct } from '../../model/catalog'
import { imageElement, shapeElement, textElement } from '../../model/elements'
import { decodeDesign } from '../../model/serialize'
import type { DesignState, MeasureText } from '../../model/types'
import { buildQuoteMessage, summaryRows, whatsappLink } from '../quote'

const measure: MeasureText = (t, _f, h) => t.length * h * 0.6
const design: DesignState = {
  v: 2,
  productId: 'knife',
  notes: 'Para el Día del Padre',
  source: 'ai',
  ...structuredClone(getProduct('knife').defaultDesign),
}

describe('buildQuoteMessage', () => {
  const msg = buildQuoteMessage(design, 'https://aureo.example/', measure)

  it('incluye producto, cada capa, material, notas y código', () => {
    expect(msg).toContain('Cuchillo con mango de madera')
    expect(msg).toContain('Capa 1: Texto «Martín» en Bodoni, 8 mm de alto')
    expect(msg).toContain('Capa 2: Texto «14 · 10 · 2026»')
    expect(msg).toContain('Madera oscura (mango)')
    expect(msg).toContain('Notas: Para el Día del Padre')
    expect(msg).toMatch(/AU-[0-9A-Z]{7}/)
    expect(msg).toContain('Propuesta del asistente')
  })

  it('el enlace restaura exactamente el diseño', () => {
    const url = new URL(msg.match(/https:\/\/\S+/)![0])
    expect(decodeDesign(url.searchParams.get('d')!)).toEqual(design)
  })

  it('sin número configurado no genera enlace de WhatsApp', () => {
    expect(whatsappLink(msg)).toBeNull()
  })
})

describe('summaryRows', () => {
  it('describe logos y formas, y avisa que el logo no viaja en el enlace', () => {
    const d: DesignState = {
      ...design,
      elements: [
        imageElement({ assetId: 'x', widthMm: 40, heightMm: 20, x: -10 }),
        shapeElement('rect', { widthMm: 30, heightMm: 10, strokeMm: 0.5, rotation: 15 }),
        textElement({ text: 'Curvo', arc: 90 }),
      ],
    }
    const values = summaryRows(d, measure).map((r) => `${r.label}: ${r.value}`)
    expect(values).toContain('Capa 1: Logo de 40 × 20 mm; 10 mm a la izquierda')
    expect(values).toContain('Capa 2: Rectángulo de 30 × 10 mm, trazo de 0,5 mm; centrado, rotado 15°')
    expect(values.some((v) => v.includes('en arco de 90° hacia arriba'))).toBe(true)
    expect(values.some((v) => v.startsWith('Logo: Adjuntá el archivo'))).toBe(true)
  })

  it('indica cuando no hay nada para grabar', () => {
    const rows = summaryRows({ ...design, elements: [] }, measure)
    expect(rows.find((r) => r.label === 'Diseño')?.value).toBe('(sin grabado)')
  })
})

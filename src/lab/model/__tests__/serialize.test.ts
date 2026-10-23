import { describe, expect, it } from 'vitest'
import { decodeDesign, designId, encodeDesign } from '../serialize'
import { getProduct } from '../catalog'
import { imageElement, shapeElement } from '../elements'
import type { DesignState, MeasureText, TextElement } from '../types'

const base: DesignState = {
  v: 2,
  productId: 'board',
  notes: 'Con ñ y acentos: José',
  source: 'ai',
  ...structuredClone(getProduct('board').defaultDesign),
}

const b64 = (o: unknown) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
const measure: MeasureText = (t, _f, h) => t.length * h * 0.6

const v1 = {
  v: 1,
  productId: 'knife',
  materialId: 'wood-dark',
  surfaceId: 'blade',
  lines: [
    { text: 'Martín', role: 'primary' },
    { text: '14 · 10', role: 'secondary' },
  ],
  fontId: 'cinzel',
  align: 'center',
  size: 10,
  rotation: 0,
  offset: { u: 0, v: 0 },
  styleId: 'mark-dark',
  notes: 'nota',
  source: 'manual',
}

describe('serialize', () => {
  it('codifica y decodifica sin pérdida (incluye UTF-8 y todos los tipos de capa)', () => {
    const d: DesignState = {
      ...base,
      elements: [...base.elements, imageElement({ assetId: 'abc123', widthMm: 40, heightMm: 20 }), shapeElement('ellipse')],
    }
    expect(decodeDesign(encodeDesign(d))).toEqual(d)
  })

  it('rechaza datos inválidos', () => {
    expect(decodeDesign('no-es-base64!!')).toBeNull()
    expect(decodeDesign(b64({ v: 2 }))).toBeNull()
    expect(decodeDesign(b64({ ...base, elements: [{ kind: 'video' }] }))).toBeNull()
  })

  it('migra enlaces v1 a capas de texto con la misma composición', () => {
    const d = decodeDesign(b64(v1), measure)!
    expect(d.v).toBe(2)
    expect(d.notes).toBe('nota')
    const [name, date] = d.elements as TextElement[]
    expect(name!.text).toBe('Martín')
    expect(name!.sizeMm).toBe(10)
    expect(name!.fontId).toBe('cinzel')
    expect(date!.sizeMm).toBe(5.5)
    // Bloque de 10 + 4,5 + 5,5 = 20 mm centrado: principal arriba, secundaria abajo.
    expect(name!.y).toBeCloseTo(5)
    expect(date!.y).toBeCloseTo(-7.25)
    expect(name!.x).toBeCloseTo(0)
  })

  it('al migrar respeta la alineación, el desplazamiento y la rotación del bloque', () => {
    const d = decodeDesign(b64({ ...v1, align: 'left', offset: { u: 1, v: 0 }, rotation: 90 }), measure)!
    const [name, date] = d.elements as TextElement[]
    expect(name!.rotation).toBe(90)
    // Rotado 90°: las líneas quedan una al lado de la otra en horizontal.
    expect(name!.x).toBeLessThan(date!.x)
    expect(name!.x).toBeGreaterThan(0)
  })

  it('designId es estable e ignora notas', () => {
    expect(designId(base)).toBe(designId({ ...base, notes: 'otra cosa' }))
    const moved = { ...base, elements: base.elements.map((e, i) => (i === 0 ? { ...e, x: e.x + 1 } : e)) }
    expect(designId(base)).not.toBe(designId(moved))
    expect(designId(base)).toMatch(/^AU-[0-9A-Z]{7}$/)
  })
})

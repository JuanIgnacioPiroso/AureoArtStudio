import { describe, expect, it } from 'vitest'
import { getProduct, getSurface } from '../../model/catalog'
import { elementBounds } from '../../model/constraints'
import type { DesignState, MeasureText } from '../../model/types'
import { defaultDesign } from '../../store'
import { PRESETS } from '../presets'

/** Medidor determinista: cada carácter ocupa 0.6 × la altura. */
const measure: MeasureText = (text, _font, h) => text.length * h * 0.6
const recognition = PRESETS.find((p) => p.id === 'recognition')!
const surfaceOf = (d: DesignState) => getSurface(getProduct(d.productId), d.surfaceId, d.shapeId)

describe('plantilla «Reconocimiento»', () => {
  it('aparece en las placas y el trofeo, y no en la chapita', () => {
    for (const id of ['plaque-base', 'plaque-wall', 'trophy']) expect(recognition.available(surfaceOf(defaultDesign(id)))).toBe(true)
    expect(recognition.available(surfaceOf(defaultDesign('dog-tag')))).toBe(false)
  })

  it.each(['plaque-base', 'plaque-wall', 'trophy'])('%s: cuatro textos que entran en la zona', (id) => {
    const d = { ...defaultDesign(id), elements: [] }
    const surface = surfaceOf(d)
    const els = recognition.build(d, surface, measure)
    expect(els.map((e) => e.kind)).toEqual(['text', 'text', 'text', 'text'])
    for (const el of els) {
      const b = elementBounds(el, measure)
      expect(Math.abs(b.minX)).toBeLessThanOrEqual(surface.widthMm / 2)
      expect(Math.abs(b.maxX)).toBeLessThanOrEqual(surface.widthMm / 2)
      expect(Math.abs(b.minY)).toBeLessThanOrEqual(surface.heightMm / 2)
      expect(Math.abs(b.maxY)).toBeLessThanOrEqual(surface.heightMm / 2)
    }
  })

  it('usa el primer texto del usuario como nombre, salteando las líneas fijas', () => {
    const d = defaultDesign('plaque-base')
    const els = recognition.build(d, surfaceOf(d), measure)
    expect(els[1]!.kind === 'text' && els[1]!.text).toBe('Laura Méndez')
  })
})

describe('plantilla «Sello» sobre un anillo', () => {
  const seal = PRESETS.find((p) => p.id === 'seal')!
  const ring = { outerMm: 78, innerMm: 52 }
  const surface = { ...getSurface(getProduct('board'), 'face'), widthMm: 78, heightMm: 78, ring }

  it('pone un círculo en cada borde y los textos curvos, sin nada en el centro', () => {
    const els = seal.build(defaultDesign('board'), surface, measure)
    const shapes = els.filter((e) => e.kind === 'shape')
    const texts = els.filter((e) => e.kind === 'text')
    expect(shapes).toHaveLength(2)
    expect(texts).toHaveLength(2)
    // Los círculos quedan sobre el anillo.
    for (const s of shapes) {
      expect(s.kind === 'shape' && s.widthMm).toBeGreaterThan(ring.innerMm)
      expect(s.kind === 'shape' && s.widthMm).toBeLessThan(ring.outerMm)
    }
    // Los textos son curvos, centrados en x y entran en el ancho del anillo.
    for (const t of texts) {
      if (t.kind !== 'text') throw new Error('se esperaba un texto')
      expect(t.arc).not.toBe(0)
      expect(Math.abs(t.x)).toBeLessThan(1e-6)
      expect(t.sizeMm).toBeLessThan((ring.outerMm - ring.innerMm) / 2)
    }
  })
})

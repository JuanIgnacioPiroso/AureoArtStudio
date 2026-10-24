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

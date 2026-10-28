import { describe, expect, it } from 'vitest'
import { onRing } from '../ringCheck'

describe('onRing', () => {
  const ring = { outerMm: 78, innerMm: 52 }

  it('acepta un punto sobre el anillo', () => {
    expect(onRing(0, 32, ring)).toBe(true)
    expect(onRing(-20, -25, ring)).toBe(true)
  })

  it('rechaza un punto en la boca', () => {
    expect(onRing(0, 0, ring)).toBe(false)
    expect(onRing(25, 0, ring)).toBe(false)
  })

  it('rechaza un punto fuera del anillo (las esquinas de la zona)', () => {
    expect(onRing(38, 38, ring)).toBe(false)
    expect(onRing(0, 40, ring)).toBe(false)
  })

  it('tolera un margen en los bordes', () => {
    expect(onRing(0, 39.2, ring)).toBe(false)
    expect(onRing(0, 39.2, ring, 0.25)).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { getProduct, MM } from '../../model/catalog'
import { BUCKLE, HOLE_R, HOLES_X, W } from '../meshes/beltLayout'

describe('zona del cinturón', () => {
  const zone = getProduct('leather-belt').surfaces[0]!
  const [cx, cy] = [zone.position[0] / MM, zone.position[1] / MM]
  const [hw, hh] = [zone.widthMm / 2, zone.heightMm / 2]

  it('mide 200 × 25 mm', () => {
    expect([zone.widthMm, zone.heightMm]).toEqual([200, 25])
  })

  it('arranca pasando la hebilla', () => {
    expect(cx - hw).toBeGreaterThan((BUCKLE.right + BUCKLE.wire) / MM)
  })

  it('termina antes del primer agujero', () => {
    expect(cx + hw).toBeLessThan((HOLES_X[0]! - HOLE_R) / MM)
  })

  it('no pisa la costura de los bordes largos (a 4 mm, 0,9 mm de ancho)', () => {
    const stitchInner = W / MM - 4 - 0.45
    expect(cy + hh).toBeLessThanOrEqual(stitchInner)
    expect(cy - hh).toBeGreaterThanOrEqual(-stitchInner)
  })
})

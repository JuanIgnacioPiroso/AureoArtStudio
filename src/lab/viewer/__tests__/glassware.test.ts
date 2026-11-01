import { describe, expect, it } from 'vitest'
import { getProduct, MM } from '../../model/catalog'
import { glasswareProfile } from '../meshes/glasswareProfiles'
import type { Profile } from '../meshes/thermos'

/** Radio de la cara de afuera a la altura z (el mayor, si el perfil pasa varias veces), o null. */
function radiusAt(outer: Profile, z: number): number | null {
  let best: number | null = null
  for (let i = 1; i < outer.length; i++) {
    const [ra, za] = outer[i - 1]!
    const [rb, zb] = outer[i]!
    if (z < Math.min(za, zb) || z > Math.max(za, zb) || za === zb) continue
    const r = ra + ((rb - ra) * (z - za)) / (zb - za)
    best = best === null ? r : Math.max(best, r)
  }
  return best
}

describe('zonas de copas y vasos', () => {
  const glassware = getProduct('glassware')

  it.each(glassware.shapes!.map((s) => [s.name, s] as const))('%s: la zona va sobre la parte casi cilíndrica', (_name, shape) => {
    const zone = shape.surfaces[0]!
    const profile = glasswareProfile(shape.id)
    expect(Math.abs(zone.position[2] - profile.zone.centerZ)).toBeLessThan(1e-9)
    const half = (zone.heightMm / 2) * MM
    const radii = Array.from({ length: 21 }, (_, i) => radiusAt(profile.outer, zone.position[2] - half + (2 * half * i) / 20))
    // El perfil cubre toda la altura de la zona.
    expect(radii.every((r) => r !== null)).toBe(true)
    const rs = radii as number[]
    // El radio varía menos de 3 mm y la zona usa el radio de esa parte.
    expect((Math.max(...rs) - Math.min(...rs)) / MM).toBeLessThan(3)
    expect(Math.abs(Math.max(...rs) - profile.zone.radius) / MM).toBeLessThan(1)
  })
})

import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { getProduct, MM } from '../../model/catalog'
import { TROPHY_PLATE_BOTTOM } from '../meshes/Trophy'
import { trophyShape } from '../meshes/trophyShapes'

/** Distancia (mm) de un punto al contorno; negativa si queda afuera. */
function insetMm(poly: THREE.Vector2[], p: THREE.Vector2): number {
  let inside = false
  let min = Infinity
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!
    const b = poly[j]!
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
    const ab = b.clone().sub(a)
    if (ab.lengthSq() === 0) continue
    const t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1)
    min = Math.min(min, a.clone().addScaledVector(ab, t).distanceTo(p))
  }
  return (inside ? 1 : -1) * (min / MM)
}

describe('zonas del trofeo', () => {
  const trophy = getProduct('trophy')
  /** La base cubre los 10 mm de abajo de la placa. */
  const BASE_COVER_MM = 10

  it.each(trophy.shapes!.map((s) => [s.name, s] as const))('%s: la zona entra con 10 mm de margen', (_name, shape) => {
    const poly = trophyShape(shape.id).getPoints(64)
    const zone = shape.surfaces[0]!
    // Centro de la zona en coordenadas de la silueta (y = 0 en el borde de abajo de la placa).
    const cy = zone.position[2] - TROPHY_PLATE_BOTTOM
    const [hw, hh] = [(zone.widthMm / 2) * MM, (zone.heightMm / 2) * MM]
    for (let k = 0; k <= 20; k++) {
      const t = k / 20
      for (const p of [
        new THREE.Vector2(-hw + 2 * hw * t, cy - hh),
        new THREE.Vector2(-hw + 2 * hw * t, cy + hh),
        new THREE.Vector2(-hw, cy - hh + 2 * hh * t),
        new THREE.Vector2(hw, cy - hh + 2 * hh * t),
      ]) {
        expect(insetMm(poly, p)).toBeGreaterThanOrEqual(9.9)
      }
    }
    expect((cy - hh) / MM).toBeGreaterThanOrEqual(BASE_COVER_MM + 9.9)
  })
})

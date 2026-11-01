import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { getProduct, MM } from '../../model/catalog'
import { KEYCHAIN, KEYCHAIN_HALF_HEIGHT_MM, keychainHoleY, keychainOutline, type KeychainShapeId } from '../meshes/keychainShapes'

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

/** La costura va a 4 mm del borde y mide 0,9 mm de ancho: la zona tiene que quedar más adentro. */
const STITCH_CLEAR_MM = 4 + 0.45

describe('zonas del llavero', () => {
  const keychain = getProduct('leather-keychain')

  it('tiene las tres formas en orden', () => {
    expect(keychain.shapes!.map((s) => s.name)).toEqual(['Rectángulo', 'Redondo', 'Escudo'])
  })

  it.each(keychain.shapes!.map((s) => [s.name, s] as const))('%s: frente y dorso quedan adentro de la costura', (_name, shape) => {
    const poly = keychainOutline(shape.id, { tab: false, divisions: 64 })
    expect(shape.surfaces.map((s) => s.id)).toEqual(['front', 'back'])
    for (const zone of shape.surfaces) {
      // Centro de la zona en coordenadas de la silueta (y = 0 en el centro de la pieza).
      const cy = zone.position[2] - KEYCHAIN_HALF_HEIGHT_MM[shape.id as KeychainShapeId] * MM
      const [hw, hh] = [(zone.widthMm / 2) * MM, (zone.heightMm / 2) * MM]
      for (let k = 0; k <= 20; k++) {
        const t = k / 20
        for (const p of [
          new THREE.Vector2(-hw + 2 * hw * t, cy - hh),
          new THREE.Vector2(-hw + 2 * hw * t, cy + hh),
          new THREE.Vector2(-hw, cy - hh + 2 * hh * t),
          new THREE.Vector2(hw, cy - hh + 2 * hh * t),
        ]) {
          expect(insetMm(poly, p)).toBeGreaterThanOrEqual(STITCH_CLEAR_MM)
        }
      }
    }
  })

  it.each(['rect', 'round', 'shield'] as const)('%s: el agujero del ojal queda fuera de la pieza', (id) => {
    const poly = keychainOutline(id, { tab: false, divisions: 64 })
    const hole = new THREE.Vector2(0, keychainHoleY(id) * MM)
    expect(insetMm(poly, hole)).toBeLessThanOrEqual(-KEYCHAIN.holeRMm + 0.01)
  })
})

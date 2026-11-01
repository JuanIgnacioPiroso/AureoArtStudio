import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { MM } from '../../model/catalog'
import { roundedRect } from '../meshes/shapes'
import { stitchGeometry, stitchPoints } from '../meshes/stitch'

/** Distancia (mm) de un punto al contorno cerrado; negativa si queda afuera. */
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

const v = (xMm: number, yMm: number) => new THREE.Vector2(xMm * MM, yMm * MM)

describe('stitchPoints', () => {
  const rect = [v(-50, -25), v(50, -25), v(50, 25), v(-50, 25)]

  it('en un rectángulo de 100 × 50 mm, todas las puntadas quedan a 4 mm del borde', () => {
    const stitches = stitchPoints(rect, { insetMm: 4 })
    expect(stitches.length).toBeGreaterThan(50)
    for (const s of stitches) expect(Math.abs(insetMm(rect, new THREE.Vector2(s.x, s.y)) - 4)).toBeLessThanOrEqual(0.5)
  })

  it('da lo mismo si el contorno va en sentido horario', () => {
    const cw = [...rect].reverse()
    for (const s of stitchPoints(cw, { insetMm: 4 })) expect(Math.abs(insetMm(cw, new THREE.Vector2(s.x, s.y)) - 4)).toBeLessThanOrEqual(0.5)
  })

  it('sigue un círculo y un rectángulo redondeado sin salirse del margen', () => {
    const circle = new THREE.Shape().absarc(0, 0, 25 * MM, 0, Math.PI * 2, false).getPoints(64)
    const rounded = (roundedRect(new THREE.Shape(), 0, 0, 35 * MM, 70 * MM, 6 * MM) as THREE.Shape).getPoints(16)
    for (const poly of [circle, rounded]) {
      for (const s of stitchPoints(poly, { insetMm: 4 })) expect(Math.abs(insetMm(poly, new THREE.Vector2(s.x, s.y)) - 4)).toBeLessThanOrEqual(0.5)
    }
  })

  it('reparte las puntadas parejas', () => {
    const stitches = stitchPoints(rect, { insetMm: 4, pitchMm: 4 })
    // Perímetro corrido: 2 × (92 + 42) = 268 mm → 67 puntadas de 4 mm.
    expect(stitches).toHaveLength(67)
  })

  it('en un contorno abierto, corre la línea hacia la izquierda', () => {
    const stitches = stitchPoints([v(0, 0), v(100, 0)], { insetMm: 3, closed: false })
    for (const s of stitches) {
      expect(s.y / MM).toBeCloseTo(3, 5)
      expect(s.angle).toBeCloseTo(0, 5)
    }
  })
})

describe('stitchGeometry', () => {
  it('arma todas las puntadas en una sola geometría, sobre la cara pedida', () => {
    const stitches = stitchPoints([v(-50, -25), v(50, -25), v(50, 25), v(-50, 25)], { insetMm: 4 })
    const geo = stitchGeometry(stitches, { z: 0.06, side: -1 })
    geo.computeBoundingBox()
    expect(geo.getAttribute('position').count).toBe(stitches.length * 24)
    expect(geo.boundingBox!.min.z).toBeLessThan(0.06)
    expect(geo.boundingBox!.max.z).toBeGreaterThan(0.06)
  })
})

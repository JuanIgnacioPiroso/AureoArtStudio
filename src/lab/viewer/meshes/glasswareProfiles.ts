import * as THREE from 'three'
import { arc, bend, type Profile } from './thermos'

export type GlasswareShapeId = 'wine' | 'flute' | 'whisky' | 'mug'

/**
 * Perfiles de torno (r, z) de las piezas de vidrio, en unidades de escena, paradas con la base
 * en z = 0. `outer` va del centro de la base hasta el labio, por afuera, y termina del lado de
 * adentro del labio; `inner` sigue desde ahí por la cara de adentro hasta el fondo. Pared de 2 mm.
 * `zone`: altura del centro y radio de la parte casi cilíndrica donde va el frente.
 */
export interface GlasswareProfile {
  outer: Profile
  inner: Profile
  zone: { centerZ: number; radius: number }
  /** Asa al costado (+X): sólo el jarro. Recorrido del tubo y su radio. */
  handle?: { points: [number, number, number][]; radius: number }
}

/** Labio redondeado de 2 mm, de la cara de afuera (r) a la de adentro (r - 0,02), en z. */
const lip = (r: number, z: number) => arc(r - 0.01, z, 0.01, 0, Math.PI)

/** Copa de vino: 210 mm de alto, pie de Ø 76, tallo y cáliz de Ø 85 que se cierra apenas en la boca. */
const wine: GlasswareProfile = {
  outer: [
    [0, 0],
    [0.37, 0],
    [0.38, 0.012],
    [0.375, 0.03],
    ...bend([0.375, 0.03], [0.1, 0.05], [0.05, 0.12]),
    [0.045, 0.92],
    ...bend([0.045, 0.92], [0.42, 0.96], [0.425, 1.45], 24),
    ...bend([0.425, 1.45], [0.43, 1.85], [0.385, 2.1], 24),
    ...lip(0.385, 2.1).slice(1),
  ],
  inner: [
    [0.365, 2.1],
    ...bend([0.365, 2.1], [0.41, 1.85], [0.405, 1.45], 24),
    ...bend([0.405, 1.45], [0.4, 1.0], [0, 0.98], 24),
  ],
  zone: { centerZ: 1.55, radius: 0.425 },
}

/** Copa de champagne (flauta): 230 mm de alto, cáliz angosto de Ø 70 casi recto. */
const flute: GlasswareProfile = {
  outer: [
    [0, 0],
    [0.32, 0],
    [0.33, 0.012],
    [0.325, 0.03],
    ...bend([0.325, 0.03], [0.09, 0.05], [0.04, 0.12]),
    [0.035, 0.98],
    ...bend([0.035, 0.98], [0.345, 1.05], [0.35, 1.6], 24),
    ...bend([0.35, 1.6], [0.355, 2.0], [0.33, 2.3], 24),
    ...lip(0.33, 2.3).slice(1),
  ],
  inner: [
    [0.31, 2.3],
    ...bend([0.31, 2.3], [0.335, 2.0], [0.33, 1.6], 24),
    ...bend([0.33, 1.6], [0.32, 1.12], [0, 1.08], 24),
  ],
  zone: { centerZ: 1.75, radius: 0.35 },
}

/** Vaso de whisky: Ø 80 × 95 mm, recto, con fondo grueso de 12 mm. */
const whisky: GlasswareProfile = {
  outer: [[0, 0], [0.37, 0], ...arc(0.37, 0.03, 0.03, -Math.PI / 2, 0).slice(1), [0.4, 0.94], ...lip(0.4, 0.94).slice(1)],
  inner: [[0.38, 0.94], [0.38, 0.15], ...arc(0.35, 0.15, 0.03, 0, -Math.PI / 2).slice(1), [0, 0.12]],
  zone: { centerZ: 0.52, radius: 0.4 },
}

/** Jarro de cerveza: Ø 85 × 150 mm, recto, con fondo de 9 mm y asa al costado. */
const mug: GlasswareProfile = {
  outer: [[0, 0], [0.395, 0], ...arc(0.395, 0.03, 0.03, -Math.PI / 2, 0).slice(1), [0.425, 1.49], ...lip(0.425, 1.49).slice(1)],
  inner: [[0.405, 1.49], [0.405, 0.12], ...arc(0.375, 0.12, 0.03, 0, -Math.PI / 2).slice(1), [0, 0.09]],
  zone: { centerZ: 0.75, radius: 0.425 },
  handle: {
    points: [
      [0.41, 0, 1.22],
      [0.6, 0, 1.2],
      [0.7, 0, 1.05],
      [0.71, 0, 0.75],
      [0.68, 0, 0.5],
      [0.56, 0, 0.4],
      [0.41, 0, 0.38],
    ],
    radius: 0.055,
  },
}

export const GLASSWARE_PROFILES: Record<GlasswareShapeId, GlasswareProfile> = { wine, flute, whisky, mug }

export function glasswareProfile(id: string | undefined): GlasswareProfile {
  return GLASSWARE_PROFILES[id as GlasswareShapeId] ?? wine
}

/** Silueta para el selector «Forma»: el perfil de afuera espejado y, en el jarro, el asa. */
export function glasswareSilhouette(id: string): THREE.Vector2[] {
  const p = glasswareProfile(id)
  // Sólo la cara de afuera, hasta el borde exterior del labio.
  const right = p.outer.filter(([r]) => r >= 0).map(([r, z]) => new THREE.Vector2(r, z))
  const left = [...right].reverse().map((v) => new THREE.Vector2(-v.x, v.y))
  if (!p.handle) return [...right, ...left]
  // El asa, como un saliente hacia +X entre sus dos enganches.
  const [top, ...rest] = p.handle.points
  const bottom = rest[rest.length - 1]!
  const out = p.handle.points.map(([x, , z]) => new THREE.Vector2(x + p.handle!.radius, z))
  const body = right.filter((v) => v.y < bottom[2] || v.y > top![2])
  const below = body.filter((v) => v.y < bottom[2])
  const above = body.filter((v) => v.y > top![2])
  return [...below, ...[...out].reverse(), ...above, ...left]
}

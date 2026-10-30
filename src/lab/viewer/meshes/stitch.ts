import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MM } from '../../model/catalog'

/** Una puntada: centro (unidades de escena) y ángulo de la línea de costura. */
export interface Stitch {
  x: number
  y: number
  angle: number
}

export interface StitchOptions {
  /** Distancia de la costura al contorno, hacia adentro (mm). */
  insetMm: number
  /** Paso entre puntadas (mm). */
  pitchMm?: number
  /** Contorno cerrado (pieza) o abierto (un borde del cinturón). */
  closed?: boolean
}

/** Saca los puntos repetidos seguidos (getPoints repite el primero al cerrar). */
function dedupe(points: readonly THREE.Vector2[], closed: boolean): THREE.Vector2[] {
  const out: THREE.Vector2[] = []
  for (const p of points) if (!out.length || out[out.length - 1]!.distanceTo(p) > 1e-6) out.push(p.clone())
  if (closed && out.length > 2 && out[0]!.distanceTo(out[out.length - 1]!) < 1e-6) out.pop()
  return out
}

/** Normal unitaria del lado izquierdo del tramo a → b. */
function leftNormal(a: THREE.Vector2, b: THREE.Vector2) {
  const d = b.clone().sub(a).normalize()
  return new THREE.Vector2(-d.y, d.x)
}

/**
 * Corre el contorno `d` hacia adentro, con inglete en los vértices, así cada tramo queda a la
 * misma distancia del borde también en las esquinas. En un contorno abierto, «adentro» es la izquierda.
 */
function offsetContour(points: THREE.Vector2[], d: number, closed: boolean): THREE.Vector2[] {
  const n = points.length
  let area = 0
  for (let i = 0; i < n; i++) area += points[i]!.cross(points[(i + 1) % n]!)
  // En un contorno horario, la izquierda queda afuera.
  const sign = closed && area < 0 ? -1 : 1
  return points.map((p, i) => {
    const prev = i > 0 ? points[i - 1]! : closed ? points[n - 1]! : null
    const next = i < n - 1 ? points[i + 1]! : closed ? points[0]! : null
    const n1 = prev ? leftNormal(prev, p) : null
    const n2 = next ? leftNormal(p, next) : null
    if (!n1 || !n2) return p.clone().addScaledVector((n1 ?? n2)!, d * sign)
    const m = n1.clone().add(n2)
    if (m.lengthSq() < 1e-12) return p.clone().addScaledVector(n1, d * sign)
    m.normalize()
    // En esquinas muy agudas el inglete se dispara: se limita a 4 veces la distancia.
    const len = Math.min(d / Math.max(m.dot(n1), 0.25), d * 4)
    return p.clone().addScaledVector(m, len * sign)
  })
}

/** Puntadas repartidas parejas a lo largo del contorno corrido `insetMm` hacia adentro. */
export function stitchPoints(contour: readonly THREE.Vector2[], { insetMm, pitchMm = 3.5, closed = true }: StitchOptions): Stitch[] {
  const pts = offsetContour(dedupe(contour, closed), insetMm * MM, closed)
  const segs = closed ? pts.map((p, i) => [p, pts[(i + 1) % pts.length]!] as const) : pts.slice(1).map((p, i) => [pts[i]!, p] as const)
  const total = segs.reduce((acc, [a, b]) => acc + a.distanceTo(b), 0)
  const count = Math.max(1, Math.round(total / (pitchMm * MM)))
  const step = total / count

  const out: Stitch[] = []
  let seg = 0
  let start = 0
  for (let k = 0; k < count; k++) {
    const at = (k + 0.5) * step
    while (seg < segs.length - 1 && start + segs[seg]![0].distanceTo(segs[seg]![1]) < at) {
      start += segs[seg]![0].distanceTo(segs[seg]![1])
      seg++
    }
    const [a, b] = segs[seg]!
    const len = a.distanceTo(b)
    const p = a.clone().lerp(b, len > 0 ? (at - start) / len : 0)
    out.push({ x: p.x, y: p.y, angle: Math.atan2(b.y - a.y, b.x - a.x) })
  }
  return out
}

export interface StitchGeometryOptions {
  /** Altura (unidades de escena) de la cara donde va la costura. */
  z: number
  /** Hacia dónde mira la cara: +Z (frente) o −Z (dorso). */
  side: 1 | -1
  /** Largo de cada puntada a la vista (mm). */
  lengthMm?: number
}

/**
 * Todas las puntadas de una cara en una sola geometría: barritas apenas hundidas en el cuero,
 * para que la escena no sume una malla por puntada.
 */
export function stitchGeometry(stitches: readonly Stitch[], { z, side, lengthMm = 2.4 }: StitchGeometryOptions): THREE.BufferGeometry {
  const w = 0.9 * MM
  const h = 0.6 * MM
  const parts = stitches.map((s) => {
    const g = new THREE.BoxGeometry(lengthMm * MM, w, h)
    g.rotateZ(s.angle)
    // Un tercio queda adentro del cuero: el hilo asoma sin flotar.
    g.translate(s.x, s.y, z + side * h * 0.15)
    return g
  })
  const merged = mergeGeometries(parts)!
  parts.forEach((g) => g.dispose())
  return merged
}

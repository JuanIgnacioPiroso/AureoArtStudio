import * as THREE from 'three'

/**
 * Piezas compartidas de los termos. El termo se arma parado sobre el eje Z local
 * (que el visor convierte en "arriba"), con la base en z = 0. El frente mira hacia -Y
 * y la manija va al costado, sobre el eje X.
 */

/** Radio del cuerpo: Ø 90 mm. */
export const THERMOS_RADIUS = 0.45
/** Alto de la base de acero, común a los dos modelos. */
export const BASE_HEIGHT = 0.3
const SEGMENTS = 96

export type Profile = [r: number, z: number][]

/**
 * Revoluciona un perfil (r, z) alrededor del eje Z. Reescribe los UV para que U siga la
 * altura y V la vuelta: así el cepillado del acero queda vertical, como en un termo real.
 */
export function lathe(profile: Profile, segments = SEGMENTS) {
  const geo = new THREE.LatheGeometry(
    profile.map(([r, z]) => new THREE.Vector2(r, z)),
    segments,
  )
  geo.rotateX(Math.PI / 2)
  const pos = geo.getAttribute('position')
  const uv = geo.getAttribute('uv')
  const circumference = 2 * Math.PI * THERMOS_RADIUS
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getZ(i), uv.getX(i) * circumference)
  uv.needsUpdate = true
  // LatheGeometry ya trae normales suaves que cierran la costura; no se recalculan.
  return geo
}

/** Arco de circunferencia (centro, radio, ángulos) para redondear bordes del perfil. */
export function arc(cr: number, cz: number, radius: number, from: number, to: number, steps = 8): Profile {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / steps
    return [cr + radius * Math.cos(a), cz + radius * Math.sin(a)] as [number, number]
  })
}

/** Curva cuadrática del perfil (sin el primer punto, para encadenarla). */
export function bend(from: [number, number], control: [number, number], to: [number, number], steps = 16): Profile {
  return new THREE.QuadraticBezierCurve(new THREE.Vector2(...from), new THREE.Vector2(...control), new THREE.Vector2(...to))
    .getPoints(steps)
    .slice(1)
    .map((p) => [p.x, p.y] as [number, number])
}

/** Base de acero: anillo con el borde inferior redondeado, de z = 0 a BASE_HEIGHT. */
export function baseGeometry() {
  const R = THERMOS_RADIUS
  return lathe([[0, 0], ...arc(R - 0.04, 0.04, 0.04, -Math.PI / 2, 0), [R, BASE_HEIGHT], [0, BASE_HEIGHT]])
}

/**
 * Aro estriado (agarre de la tapa): cilindro cuyo radio sube y baja `ribs` veces por vuelta.
 * Va de z0 a z1, con tapas planas arriba y abajo.
 */
export function ribbedRing(radius: number, z0: number, z1: number, ribs: number, depth: number) {
  const geo = new THREE.CylinderGeometry(radius, radius, z1 - z0, ribs * 4, 1, false)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, z)
    if (r < 1e-6) continue
    const k = (radius - depth * (0.5 + 0.5 * Math.cos(Math.atan2(z, x) * ribs))) / r
    pos.setXYZ(i, x * k, pos.getY(i), z * k)
  }
  geo.computeVertexNormals()
  geo.rotateX(Math.PI / 2)
  geo.translate(0, 0, (z0 + z1) / 2)
  return geo
}

/** Tubo de sección circular a lo largo de una curva suave que pasa por los puntos (x, y, z). */
export function tubeAlong(points: [number, number, number][], radius: number, tubular = 64) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
    false,
    'centripetal',
  )
  return new THREE.TubeGeometry(curve, tubular, radius, 16, false)
}

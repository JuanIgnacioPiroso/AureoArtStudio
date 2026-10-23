import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { extrudeCentered } from './shapes'

/** Muestra una curva y devuelve y(x) por interpolación lineal (la curva debe ser monótona en x). */
function profile(curves: THREE.Curve<THREE.Vector2>[]) {
  const pts = curves.flatMap((c) => c.getPoints(48)).sort((a, b) => a.x - b.x)
  return (x: number) => {
    if (x <= pts[0]!.x) return pts[0]!.y
    for (let i = 1; i < pts.length; i++) {
      const b = pts[i]!
      if (x <= b.x) {
        const a = pts[i - 1]!
        return a.y + ((b.y - a.y) * (x - a.x)) / Math.max(1e-6, b.x - a.x)
      }
    }
    return pts[pts.length - 1]!.y
  }
}

const v2 = (x: number, y: number) => new THREE.Vector2(x, y)
const BLADE_TIP = 2.06
/** El talón arranca bajo la virola para que no quede un hueco entre mango y filo. */
const BLADE_HEEL = -0.065
const spineY = profile([
  new THREE.LineCurve(v2(BLADE_HEEL, 0.2), v2(1.55, 0.2)),
  new THREE.QuadraticBezierCurve(v2(1.55, 0.2), v2(1.92, 0.19), v2(BLADE_TIP, 0.04)),
])
const edgeY = profile([
  new THREE.QuadraticBezierCurve(v2(BLADE_HEEL, -0.18), v2(BLADE_HEEL, -0.2), v2(BLADE_HEEL + 0.06, -0.205)),
  new THREE.LineCurve(v2(BLADE_HEEL + 0.06, -0.205), v2(1.38, -0.205)),
  new THREE.QuadraticBezierCurve(v2(1.38, -0.205), v2(1.86, -0.17), v2(BLADE_TIP, 0.04)),
])

/** Medio espesor del lomo (2,5 mm en total), que se afina hacia la punta. */
const SPINE_HALF = 0.0125
const EDGE_HALF = 0.0006
/** Altura de la línea de afilado, como fracción desde el filo hasta el lomo. */
const GRIND = 0.27
const spineHalf = (x: number) => SPINE_HALF * (1 - 0.6 * smoothstep(x, 1.2, BLADE_TIP))

function smoothstep(x: number, a: number, b: number) {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Grilla de cols × rows con UV = posición X/Y; invierte el orden si la normal no apunta a `facing`. */
function patch(cols: number, rows: number, at: (u: number, v: number) => THREE.Vector3, facing: THREE.Vector3) {
  const pos: number[] = []
  const uv: number[] = []
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const p = at(i / cols, j / rows)
      pos.push(p.x, p.y, p.z)
      uv.push(p.x, p.y)
    }
  }
  const index: number[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i
      const b = a + 1
      const c = a + cols + 1
      const d = c + 1
      index.push(a, b, d, a, d, c)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(index)
  geo.computeVertexNormals()
  const n = geo.getAttribute('normal')
  const mid = Math.floor(n.count / 2)
  if (new THREE.Vector3(n.getX(mid), n.getY(mid), n.getZ(mid)).dot(facing) < 0) {
    for (let k = 0; k < index.length; k += 3) [index[k + 1], index[k + 2]] = [index[k + 2]!, index[k + 1]!]
    geo.setIndex(index)
    geo.computeVertexNormals()
  }
  return geo
}

/**
 * Hoja con afilado plano: zona plana del lomo hasta la línea de afilado y desde ahí un
 * bisel que baja hasta el filo. Cada zona es una malla aparte para que la arista quede marcada.
 */
function bladeGeometry() {
  const COLS = 140
  const xAt = (u: number) => BLADE_HEEL + (BLADE_TIP - BLADE_HEEL) * (1 - Math.pow(1 - u, 1.4))
  const grindY = (x: number) => edgeY(x) + (spineY(x) - edgeY(x)) * GRIND
  const flat = (side: 1 | -1) => (u: number, v: number) => {
    const x = xAt(u)
    return new THREE.Vector3(x, THREE.MathUtils.lerp(spineY(x), grindY(x), v), side * spineHalf(x))
  }
  const bevel = (side: 1 | -1) => (u: number, v: number) => {
    const x = xAt(u)
    return new THREE.Vector3(x, THREE.MathUtils.lerp(grindY(x), edgeY(x), v), side * THREE.MathUtils.lerp(spineHalf(x), EDGE_HALF, v))
  }
  const along = (y: (x: number) => number, half: (x: number) => number) => (u: number, v: number) => {
    const x = xAt(u)
    return new THREE.Vector3(x, y(x), THREE.MathUtils.lerp(half(x), -half(x), v))
  }
  const heel = (u: number, v: number) => {
    const x = BLADE_HEEL
    const y = THREE.MathUtils.lerp(spineY(x), edgeY(x), u)
    const half = y > grindY(x) ? spineHalf(x) : THREE.MathUtils.lerp(spineHalf(x), EDGE_HALF, (grindY(x) - y) / (grindY(x) - edgeY(x)))
    return new THREE.Vector3(x, y, THREE.MathUtils.lerp(half, -half, v))
  }
  const Z = new THREE.Vector3(0, 0, 1)
  const geo = mergeGeometries([
    patch(COLS, 10, flat(1), Z),
    patch(COLS, 10, flat(-1), Z.clone().negate()),
    patch(COLS, 6, bevel(1), new THREE.Vector3(0, -0.3, 1)),
    patch(COLS, 6, bevel(-1), new THREE.Vector3(0, -0.3, -1)),
    patch(COLS, 2, along(spineY, spineHalf), new THREE.Vector3(0, 1, 0)),
    patch(COLS, 1, along(edgeY, () => EDGE_HALF), new THREE.Vector3(0, -1, 0)),
    patch(16, 2, heel, new THREE.Vector3(-1, 0, 0)),
  ])!
  geo.userData.halfThickness = SPINE_HALF
  return geo
}

function handleGeometry() {
  const s = new THREE.Shape()
  s.moveTo(-0.06, 0.12)
  s.quadraticCurveTo(-0.7, 0.155, -1.26, 0.11)
  s.quadraticCurveTo(-1.33, 0.1, -1.33, 0)
  s.quadraticCurveTo(-1.33, -0.1, -1.26, -0.115)
  s.quadraticCurveTo(-0.7, -0.165, -0.06, -0.125)
  s.lineTo(-0.06, 0.12)
  return extrudeCentered(s, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.032,
    bevelSegments: 8,
  })
}

/** Cuchillo procedural: hoja de acero, virola y mango de madera con remaches. */
export function Knife({ materialFor, registerPart }: ProductMeshProps) {
  const blade = useMemo(() => bladeGeometry(), [])
  const handle = useMemo(() => handleGeometry(), [])
  const steel = materialFor('blade')
  // Virola y remaches satinados: con espejo puro reflejan la mesa y se ven negros.
  const satin = useMemo(() => ({ ...steel, roughness: 0.55 }), [steel])
  const bladeRef = useCallback((m: THREE.Mesh | null) => registerPart('blade', m), [registerPart])
  const handleRef = useCallback((m: THREE.Mesh | null) => registerPart('handle', m), [registerPart])

  return (
    <group>
      <mesh geometry={blade} castShadow receiveShadow ref={bladeRef}>
        <PartMaterial material={steel} />
      </mesh>
      <mesh position={[-0.03, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.29, 0.17]} />
        <PartMaterial material={satin} />
      </mesh>
      <mesh geometry={handle} castShadow receiveShadow ref={handleRef}>
        <PartMaterial material={materialFor('handle')} />
      </mesh>
      {[-0.16, -1.16].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.204, 24]} />
          <PartMaterial material={satin} />
        </mesh>
      ))}
    </group>
  )
}

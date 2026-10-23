import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { arc, BASE_HEIGHT, baseGeometry, lathe, ribbedRing, THERMOS_RADIUS, tubeAlong, type Profile } from './thermos'

/** Fin del cuerpo recto, donde empieza el collar de plástico. */
const BODY_TOP = 2.28

/** Cuerpo recto sobre la base de acero, con el borde superior apenas redondeado. */
function bodyGeometry() {
  const R = THERMOS_RADIUS
  return lathe([[0, BASE_HEIGHT], [R, BASE_HEIGHT], [R, BODY_TOP - 0.04], ...arc(R - 0.04, BODY_TOP - 0.04, 0.04, 0, Math.PI / 2), [0, BODY_TOP]])
}

/** Collar, rosca y tapa de plástico negro, con el aro estriado de agarre. */
function capGeometry() {
  // Rosca: cuatro estrías horizontales entre el collar y la tapa.
  const thread: Profile = [0, 1, 2, 3].flatMap((i) => {
    const z = 2.47 + i * 0.04
    return [
      [0.4, z],
      [0.385, z + 0.02],
    ] as Profile
  })
  const collar = lathe([[0, BODY_TOP], [0.39, BODY_TOP], [0.39, 2.45], [0.4, 2.47], ...thread, [0.4, 2.63], [0.355, 2.64], [0, 2.64]])
  const grip = ribbedRing(0.37, 2.64, 2.75, 48, 0.012)
  const lid = lathe([[0, 2.75], [0.36, 2.75], ...arc(0.33, 2.77, 0.03, 0, Math.PI / 2), [0, 2.8]])
  return mergeGeometries([collar, grip, lid])!
}

/** Pico cebador rojo: base corta y un caño que se curva hacia el lado opuesto al asa. */
function spoutGeometry() {
  const base = lathe([[0, 2.8], [0.09, 2.8], [0.09, 2.84], ...arc(0.07, 2.84, 0.02, 0, Math.PI / 2), [0, 2.86]], 32)
  base.translate(0.06, 0, 0)
  const pipe = tubeAlong(
    [
      [0.06, 0, 2.8],
      [0.07, 0, 2.9],
      [0.12, 0, 2.95],
      [0.22, 0, 2.97],
    ],
    0.045,
  )
  return mergeGeometries([base, pipe])!
}

/** Asa en L del lado -X: sale del collar, va hacia afuera y baja hasta poco más de la mitad del alto. */
function handleGeometry() {
  const bar = tubeAlong(
    [
      [-0.36, 0, 2.4],
      [-0.55, 0, 2.41],
      [-0.68, 0, 2.39],
      [-0.73, 0, 2.3],
      [-0.74, 0, 2.0],
      [-0.74, 0, 1.6],
    ],
    0.045,
    96,
  )
  const tip = new THREE.SphereGeometry(0.045, 16, 12)
  tip.translate(-0.74, 0, 1.6)
  return mergeGeometries([bar.toNonIndexed(), tip.toNonIndexed()])!
}

/** Termo media manija: base de acero, cuerpo recto, collar y tapa negros, pico rojo y asa en L. */
export function ThermosHalf({ materialFor, registerPart }: ProductMeshProps) {
  const base = useMemo(() => baseGeometry(), [])
  const body = useMemo(() => bodyGeometry(), [])
  const cap = useMemo(() => capGeometry(), [])
  const spout = useMemo(() => spoutGeometry(), [])
  const handle = useMemo(() => handleGeometry(), [])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])

  return (
    <group>
      <mesh geometry={base} castShadow receiveShadow>
        <PartMaterial material={materialFor('base')} />
      </mesh>
      <mesh geometry={body} castShadow receiveShadow ref={bodyRef}>
        <PartMaterial material={materialFor('body')} />
      </mesh>
      <mesh geometry={cap} castShadow receiveShadow>
        <PartMaterial material={materialFor('cap')} />
      </mesh>
      <mesh geometry={spout} castShadow>
        <PartMaterial material={materialFor('spout')} />
      </mesh>
      <mesh geometry={handle} castShadow>
        <PartMaterial material={materialFor('handle')} />
      </mesh>
    </group>
  )
}

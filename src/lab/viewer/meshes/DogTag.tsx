import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { extrudeCentered, roundedRect } from './shapes'

/** Chapita de 50 × 28 mm y 1 mm de espesor, parada sobre su canto largo. */
const DOG_TAG = { width: 0.5, height: 0.28, thickness: 0.01, radius: 0.07 }
/** Centro de la chapita: queda apoyada en z = 0. */
const DOG_TAG_CENTER_Z = DOG_TAG.height / 2
/** Agujero para la cadena, en el extremo izquierdo visto de frente. */
const HOLE_X = -0.205
const HOLE_R = 0.02
const BALL_R = 0.012
const BALL_STEP = 0.029

function tagGeometry() {
  const shape = roundedRect(new THREE.Shape(), 0, 0, DOG_TAG.width, DOG_TAG.height, DOG_TAG.radius) as THREE.Shape
  shape.holes.push(new THREE.Path().absarc(HOLE_X, 0, HOLE_R, 0, Math.PI * 2, true))
  const geo = extrudeCentered(shape, { depth: DOG_TAG.thickness, bevelEnabled: false })
  // Se para la chapita: la cara frontal (+Z del perfil) pasa a mirar hacia -Y, como el frente de los termos.
  geo.rotateX(Math.PI / 2)
  geo.translate(0, 0, DOG_TAG_CENTER_Z)
  return geo
}

/** Recorrido de la cadena: pasa por el agujero, baja por detrás y queda enrollada sobre la mesa. */
function chainPath() {
  const z = DOG_TAG_CENTER_Z
  const floor = BALL_R
  const pts: [number, number, number][] = [
    [HOLE_X, -0.03, z],
    [HOLE_X - 0.06, -0.05, z - 0.07],
    [HOLE_X - 0.13, -0.02, floor],
    [HOLE_X - 0.24, 0.16, floor],
    [HOLE_X + 0.02, 0.36, floor],
    [HOLE_X + 0.32, 0.3, floor],
    [HOLE_X + 0.26, 0.12, floor],
    [HOLE_X + 0.08, 0.06, z - 0.09],
    [HOLE_X, 0.03, z],
  ]
  return new THREE.CatmullRomCurve3(
    pts.map((p) => new THREE.Vector3(...p)),
    true,
  )
}

/** Chapita identificatoria con su cadena de bolitas. */
export function DogTag({ materialFor, registerPart }: ProductMeshProps) {
  const tag = useMemo(() => tagGeometry(), [])
  const ball = useMemo(() => new THREE.SphereGeometry(BALL_R, 12, 8), [])
  const path = useMemo(() => chainPath(), [])
  const count = Math.round(path.getLength() / BALL_STEP)
  const chainRef = useRef<THREE.InstancedMesh>(null)
  const tagRef = useCallback((m: THREE.Mesh | null) => registerPart('tag', m), [registerPart])

  useLayoutEffect(() => {
    const mesh = chainRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    path.getSpacedPoints(count).slice(0, count).forEach((p, i) => mesh.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)))
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [path, count])

  return (
    <>
      <mesh geometry={tag} castShadow receiveShadow ref={tagRef}>
        <PartMaterial material={materialFor('tag')} />
      </mesh>
      <instancedMesh ref={chainRef} args={[ball, undefined, count]} castShadow>
        <PartMaterial material={materialFor('chain')} />
      </instancedMesh>
    </>
  )
}

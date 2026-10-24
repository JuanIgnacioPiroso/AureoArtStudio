import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { extrudeCentered, roundedRect } from './shapes'

/** Medio espesor de la placa (6 mm en total, con el bisel). */
export const PLAQUE_WALL_HALF = 0.03
/** Centro de los tornillos: a 12 mm de cada borde, fuera de la zona de 360 × 260 mm. */
const SCREW_X = 1.88
const SCREW_Y = 1.38
const SCREW_R = 0.05

function plateGeometry() {
  const shape = roundedRect(new THREE.Shape(), 0, 0, 3.98, 2.98, 0.02) as THREE.Shape
  return extrudeCentered(shape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  })
}

/** Cabezas de tornillo abombadas, apoyadas sobre la cara de la placa. */
function screwsGeometry() {
  const profile = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 8) * (Math.PI / 2)
    return new THREE.Vector2(Math.cos(a) * SCREW_R, Math.sin(a) * SCREW_R * 0.35)
  }).reverse()
  const head = new THREE.LatheGeometry(profile, 24)
  // El torno gira sobre Y: se acuesta para que la cúpula mire hacia +Z.
  head.rotateX(Math.PI / 2)
  const heads = [-1, 1].flatMap((sx) =>
    [-1, 1].map((sy) => head.clone().translate(sx * SCREW_X, sy * SCREW_Y, PLAQUE_WALL_HALF)),
  )
  head.dispose()
  const geo = mergeGeometries(heads)!
  heads.forEach((g) => g.dispose())
  return geo
}

/** Placa de pared de 400 × 300 mm con cuatro tornillos en las esquinas. */
export function PlaqueWall({ materialFor, registerPart }: ProductMeshProps) {
  const plate = useMemo(() => plateGeometry(), [])
  const screws = useMemo(() => screwsGeometry(), [])
  const plateRef = useCallback((m: THREE.Mesh | null) => registerPart('plate', m), [registerPart])
  return (
    <>
      <mesh geometry={plate} castShadow receiveShadow ref={plateRef}>
        <PartMaterial material={materialFor('plate')} />
      </mesh>
      <mesh geometry={screws} castShadow>
        <PartMaterial material={materialFor('screws')} />
      </mesh>
    </>
  )
}

import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { extrudeCentered, roundedRect } from './shapes'

/** Medio espesor de la base (18 mm en total, con el bisel). */
export const PLAQUE_BASE_HALF = 0.09
/** Espesor de la chapa: 1 mm. */
const PLATE_THICKNESS = 0.01

function baseGeometry() {
  const shape = roundedRect(new THREE.Shape(), 0, 0, 1.94, 1.44, 0.04) as THREE.Shape
  return extrudeCentered(shape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 5,
  })
}

/** Chapa apoyada sobre la base: su cara queda en z = PLAQUE_BASE_HALF + 1 mm. */
function plateGeometry() {
  const shape = roundedRect(new THREE.Shape(), 0, 0, 1.7, 1.2, 0.015) as THREE.Shape
  const geo = extrudeCentered(shape, { depth: PLATE_THICKNESS, bevelEnabled: false })
  geo.translate(0, 0, PLAQUE_BASE_HALF + PLATE_THICKNESS / 2)
  return geo
}

/** Placa de 200 × 150 mm: base de madera biselada y chapa de 170 × 120 mm centrada. */
export function PlaqueBase({ materialFor, registerPart }: ProductMeshProps) {
  const base = useMemo(() => baseGeometry(), [])
  const plate = useMemo(() => plateGeometry(), [])
  const plateRef = useCallback((m: THREE.Mesh | null) => registerPart('plate', m), [registerPart])
  return (
    <>
      <mesh geometry={base} castShadow receiveShadow>
        <PartMaterial material={materialFor('base')} />
      </mesh>
      <mesh geometry={plate} castShadow receiveShadow ref={plateRef}>
        <PartMaterial material={materialFor('plate')} />
      </mesh>
    </>
  )
}

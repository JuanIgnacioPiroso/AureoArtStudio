import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { extrudeCentered, roundedRect } from './shapes'

function boardGeometry() {
  const shape = roundedRect(new THREE.Shape(), 0, 0, 3.94, 2.34, 0.2) as THREE.Shape
  shape.holes.push(roundedRect(new THREE.Path(), -1.68, 0, 0.17, 0.62, 0.085))
  return extrudeCentered(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 6,
  })
}

/** Tabla procedural de 40 × 24 cm con manija calada. */
export function Board({ materialFor, registerPart }: ProductMeshProps) {
  const geo = useMemo(() => boardGeometry(), [])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])
  return (
    <mesh geometry={geo} castShadow receiveShadow ref={bodyRef}>
      <PartMaterial material={materialFor('body')} />
    </mesh>
  )
}

import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { extrudeCentered, roundedRect } from './shapes'
import { trophyShape } from './trophyShapes'

/** Base negra de 180 × 60 × 30 mm. */
const BASE = { width: 1.8, depth: 0.6, height: 0.3 }
/** La placa entra 10 mm en la base: su borde de abajo queda a 20 mm de la mesa. */
export const TROPHY_PLATE_BOTTOM = 0.2
/** Acrílico de 10 mm. */
const PLATE_THICKNESS = 0.1

function plateGeometry(shapeId: string | undefined) {
  const geo = extrudeCentered(trophyShape(shapeId), { depth: PLATE_THICKNESS, bevelEnabled: false })
  // Se para la placa: la cara frontal (+Z del perfil) pasa a mirar hacia -Y, como el frente de los termos.
  geo.rotateX(Math.PI / 2)
  geo.translate(0, 0, TROPHY_PLATE_BOTTOM)
  return geo
}

function baseGeometry() {
  const bevel = 0.02
  const shape = roundedRect(new THREE.Shape(), 0, 0, BASE.width - bevel * 2, BASE.depth - bevel * 2, 0.03) as THREE.Shape
  const geo = extrudeCentered(shape, {
    depth: BASE.height - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
  })
  geo.translate(0, 0, BASE.height / 2)
  return geo
}

/** Trofeo de acrílico transparente parado sobre una base negra; la silueta sale de la forma elegida. */
export function Trophy({ materialFor, registerPart, shapeId }: ProductMeshProps) {
  const plate = useMemo(() => plateGeometry(shapeId), [shapeId])
  const base = useMemo(() => baseGeometry(), [])
  const plateRef = useCallback((m: THREE.Mesh | null) => registerPart('plate', m), [registerPart])
  return (
    <>
      <mesh geometry={plate} castShadow ref={plateRef}>
        <PartMaterial material={materialFor('plate')} />
      </mesh>
      <mesh geometry={base} castShadow receiveShadow>
        <PartMaterial material={materialFor('base')} />
      </mesh>
    </>
  )
}

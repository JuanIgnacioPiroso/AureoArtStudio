import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MM } from '../../model/catalog'
import { KEYCHAIN, KEYCHAIN_HALF_HEIGHT_MM, keychainHoleY, keychainOutline, keychainShape, type KeychainShapeId } from './keychainShapes'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { stitchGeometry, stitchPoints } from './stitch'

/** Canto apenas redondeado, sin cambiar la silueta (mm). */
const BEVEL_MM = 0.5
/** Argolla de acero de Ø 25 mm por fuera, con alambre de 2 mm. */
const RING_R = 0.115
const RING_WIRE = 0.01

const halfHeight = (id: string | undefined) => KEYCHAIN_HALF_HEIGHT_MM[(id ?? 'rect') as KeychainShapeId] ?? KEYCHAIN_HALF_HEIGHT_MM.rect

/**
 * Pieza parada: la cara del perfil (+Z) pasa a mirar hacia -Y, como el frente de la chapita, y el
 * punto más bajo apoya en z = 0.
 */
function pieceGeometry(id: string | undefined) {
  const geo = new THREE.ExtrudeGeometry(keychainShape(id), {
    depth: KEYCHAIN.thicknessMm - BEVEL_MM * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL_MM,
    bevelSize: BEVEL_MM,
    bevelOffset: -BEVEL_MM,
    bevelSegments: 2,
    curveSegments: 32,
  })
  geo.translate(0, 0, -(KEYCHAIN.thicknessMm / 2 - BEVEL_MM))
  geo.scale(MM, MM, MM)
  // Las UV salen en mm: se pasan a unidades de escena, como en el resto de las mallas (el grano del cuero va por unidad).
  const uv = geo.getAttribute('uv')
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * MM, uv.getY(i) * MM)
  geo.rotateX(Math.PI / 2)
  geo.translate(0, 0, halfHeight(id) * MM)
  return geo
}

/** Costura alrededor de la pieza (sin el ojal), en las dos caras. Las siluetas son simétricas: el dorso es el frente girado. */
function stitchesGeometry(id: string | undefined) {
  const stitches = stitchPoints(keychainOutline(id, { tab: false, divisions: 48 }), { insetMm: 4, pitchMm: 3 })
  const front = stitchGeometry(stitches, { z: (KEYCHAIN.thicknessMm / 2) * MM, side: 1, lengthMm: 2 })
  front.rotateX(Math.PI / 2)
  const back = front.clone().rotateZ(Math.PI)
  const geo = mergeGeometries([front, back])!
  front.dispose()
  back.dispose()
  geo.translate(0, 0, halfHeight(id) * MM)
  return geo
}

/**
 * Argolla: un aro vertical con el alambre pasando por el ojal. Va girado 45° sobre el eje del ojal:
 * de canto, desde el frente, se ve como un clip.
 */
function ringGeometry(id: string | undefined) {
  const geo = new THREE.TorusGeometry(RING_R, RING_WIRE, 12, 72)
  geo.rotateY(Math.PI / 2)
  geo.translate(0, 0, RING_R)
  geo.rotateZ(Math.PI / 4)
  geo.translate(0, 0, (halfHeight(id) + keychainHoleY(id)) * MM)
  return geo
}

/** Llavero de cuero con costura y argolla de acero, en la forma elegida. */
export function LeatherKeychain({ materialFor, registerPart, shapeId }: ProductMeshProps) {
  const piece = useMemo(() => pieceGeometry(shapeId), [shapeId])
  const stitch = useMemo(() => stitchesGeometry(shapeId), [shapeId])
  const ring = useMemo(() => ringGeometry(shapeId), [shapeId])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])
  const stitchRef = useCallback((m: THREE.Mesh | null) => registerPart('stitch', m), [registerPart])

  return (
    <>
      <mesh geometry={piece} castShadow receiveShadow ref={bodyRef}>
        <PartMaterial material={materialFor('body')} />
      </mesh>
      <mesh geometry={stitch} castShadow ref={stitchRef}>
        <PartMaterial material={materialFor('stitch')} />
      </mesh>
      <mesh geometry={ring} castShadow>
        <PartMaterial material={materialFor('ring')} />
      </mesh>
    </>
  )
}

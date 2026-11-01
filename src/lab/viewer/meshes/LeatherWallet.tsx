import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { extrudeCentered } from './shapes'
import { stitchGeometry, stitchPoints } from './stitch'

/** Billetera cerrada de 110 × 90 mm y 12 mm de espesor, parada, con el lomo a la izquierda mirando el frente. */
const WALLET = { width: 1.1, height: 0.9, thickness: 0.12 }
/** Canto redondeado (bisel) y radio de las esquinas del lado abierto. */
const BEVEL = 0.008
const CORNER = 0.02
/** Centro del lomo: medio caño del radio del espesor. */
const SPINE_X = -WALLET.width / 2 + WALLET.thickness / 2
/** La costura va a 4 mm del canto. */
const STITCH_INSET_MM = 4

/**
 * Cuerpo: la sección (ancho × espesor) con el lomo en semicírculo, extruida hacia arriba. El frente
 * queda en y = -espesor/2 mirando hacia -Y, como el de la chapita, y la base apoya en z = 0.
 */
function bodyGeometry() {
  const half = WALLET.thickness / 2 - BEVEL
  const right = WALLET.width / 2 - BEVEL
  const s = new THREE.Shape()
  s.moveTo(SPINE_X, -half)
  s.lineTo(right - CORNER, -half)
  s.quadraticCurveTo(right, -half, right, -half + CORNER)
  s.lineTo(right, half - CORNER)
  s.quadraticCurveTo(right, half, right - CORNER, half)
  s.lineTo(SPINE_X, half)
  s.absarc(SPINE_X, 0, half, Math.PI / 2, (Math.PI * 3) / 2, false)
  const raw = extrudeCentered(s, {
    depth: WALLET.height - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
  })
  // Normales suaves en el lomo y en los cantos: sin esto, el medio caño se ve facetado.
  const geo = mergeVertices(raw.deleteAttribute('normal'))
  raw.dispose()
  geo.computeVertexNormals()
  geo.translate(0, 0, WALLET.height / 2)
  return geo
}

/**
 * Costura de una tapa: arriba, del lado abierto y abajo (el lomo es un doblez y no lleva).
 * Se arma en el plano de la tapa (u = ancho, v = alto) y se para sobre su cara.
 */
function stitchesGeometry(side: 1 | -1) {
  const [l, r] = [SPINE_X, WALLET.width / 2]
  const h = WALLET.height / 2
  // Recorrido abierto con el interior a la izquierda. En el dorso se espeja (y se invierte, para
  // que siga con el interior a la izquierda) y después se gira 180°: el lomo vuelve a quedar en -X.
  let path = [new THREE.Vector2(l, -h), new THREE.Vector2(r, -h), new THREE.Vector2(r, h), new THREE.Vector2(l, h)]
  if (side === 1) path = path.map((p) => new THREE.Vector2(-p.x, p.y)).reverse()
  const geo = stitchGeometry(stitchPoints(path, { insetMm: STITCH_INSET_MM, closed: false }), { z: WALLET.thickness / 2, side: 1 })
  geo.rotateX(Math.PI / 2)
  if (side === 1) geo.rotateZ(Math.PI)
  geo.translate(0, 0, WALLET.height / 2)
  return geo
}

/** Billetera plegable cerrada, con costura en las dos tapas. */
export function LeatherWallet({ materialFor, registerPart }: ProductMeshProps) {
  const body = useMemo(() => bodyGeometry(), [])
  const stitch = useMemo(() => mergeGeometries([stitchesGeometry(-1), stitchesGeometry(1)])!, [])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])
  const stitchRef = useCallback((m: THREE.Mesh | null) => registerPart('stitch', m), [registerPart])

  return (
    <>
      <mesh geometry={body} castShadow receiveShadow ref={bodyRef}>
        <PartMaterial material={materialFor('body')} />
      </mesh>
      <mesh geometry={stitch} castShadow ref={stitchRef}>
        <PartMaterial material={materialFor('stitch')} />
      </mesh>
    </>
  )
}

import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { BELT, BELT_HALF, BEVEL, BUCKLE, HOLE_R, HOLES_X, L, STITCH_FROM, TIP_X, W } from './beltLayout'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { stitchGeometry, stitchPoints } from './stitch'

function strapGeometry() {
  const s = new THREE.Shape()
  s.moveTo(-L, -W)
  s.lineTo(TIP_X, -W)
  s.absarc(TIP_X, 0, W, -Math.PI / 2, Math.PI / 2, false)
  s.lineTo(-L, W)
  s.lineTo(-L, -W)
  for (const x of HOLES_X) s.holes.push(new THREE.Path().absarc(x, 0, HOLE_R, 0, Math.PI * 2, true))
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: BELT.thickness - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelOffset: -BEVEL,
    bevelSegments: 2,
    curveSegments: 32,
  })
  geo.translate(0, 0, -(BELT_HALF - BEVEL))
  return geo
}

/** Costura en los dos bordes largos, a 4 mm del canto (recorridos abiertos con el cuero a la izquierda). */
function stitchesGeometry() {
  const edges = [
    [new THREE.Vector2(STITCH_FROM, -W), new THREE.Vector2(TIP_X, -W)],
    [new THREE.Vector2(TIP_X, W), new THREE.Vector2(STITCH_FROM, W)],
  ]
  const stitches = edges.flatMap((edge) => stitchPoints(edge, { insetMm: 4, closed: false }))
  return stitchGeometry(stitches, { z: BELT_HALF, side: 1 })
}

/** Hebilla de acero: marco, travesaño central (donde se dobla el cinturón) y pasador apoyado sobre el cuero. */
function buckleGeometry() {
  const { left, right, half, wire, corner } = BUCKLE
  const z = -BELT_HALF + wire
  const outline = new THREE.Shape()
  outline.moveTo(left + corner, -half)
  outline.lineTo(right - corner, -half)
  outline.quadraticCurveTo(right, -half, right, -half + corner)
  outline.lineTo(right, half - corner)
  outline.quadraticCurveTo(right, half, right - corner, half)
  outline.lineTo(left + corner, half)
  outline.quadraticCurveTo(left, half, left, half - corner)
  outline.lineTo(left, -half + corner)
  outline.quadraticCurveTo(left, -half, left + corner, -half)
  const path = new THREE.CatmullRomCurve3(
    outline.getSpacedPoints(120).slice(0, -1).map((p) => new THREE.Vector3(p.x, p.y, z)),
    true,
  )
  const frame = new THREE.TubeGeometry(path, 240, wire, 12, true)

  const barX = -L
  const bar = new THREE.CylinderGeometry(wire, wire, half * 2, 16)
  bar.translate(barX, 0, z)

  // El pasador sale del travesaño y apoya la punta sobre el lado derecho del marco.
  const prongLength = right - barX + wire
  const prong = new THREE.CylinderGeometry(wire * 0.7, wire * 0.8, prongLength, 12)
  prong.rotateZ(-Math.PI / 2)
  prong.translate(barX + prongLength / 2, 0, BELT_HALF + wire * 0.8)

  const geo = mergeGeometries([frame, bar, prong])!
  ;[frame, bar, prong].forEach((g) => g.dispose())
  return geo
}

/** Tramo de cinturón de cuero con hebilla de acero, agujeros y costura en los bordes. */
export function LeatherBelt({ materialFor, registerPart }: ProductMeshProps) {
  const strap = useMemo(() => strapGeometry(), [])
  const stitch = useMemo(() => stitchesGeometry(), [])
  const buckle = useMemo(() => buckleGeometry(), [])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])
  const stitchRef = useCallback((m: THREE.Mesh | null) => registerPart('stitch', m), [registerPart])

  return (
    <>
      <mesh geometry={strap} castShadow receiveShadow ref={bodyRef}>
        <PartMaterial material={materialFor('body')} />
      </mesh>
      <mesh geometry={stitch} castShadow ref={stitchRef}>
        <PartMaterial material={materialFor('stitch')} />
      </mesh>
      <mesh geometry={buckle} castShadow>
        <PartMaterial material={materialFor('buckle')} />
      </mesh>
    </>
  )
}

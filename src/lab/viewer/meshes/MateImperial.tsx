import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { arc, bend, lathe, type Profile } from './thermos'

/**
 * Virola (según «Mate imperial 2.webp»): una banda casi tan ancha como el cuerpo (Ø 83, de 93 a
 * 109 mm de alto) y arriba un labio que sobresale apenas, con la cara plana: Ø 88 por fuera y
 * boca de Ø 64, a 115 mm de alto.
 */
const RIM = { band: 0.415, lip: 0.44, inner: 0.32, bottom: 0.93, lipBottom: 1.09, top: 1.15 }
/** Radio en la parte más ancha del cuerpo (Ø 85), por encima de la mitad, como un huevo. */
const R = 0.425
/** Punta de abajo del huevo: queda levantada sobre las patas. */
const BODY_BOTTOM = 0.24
/** Las patas suben por la panza hasta acá (el fondo del interior está en 0,46). */
const LEG_TOP = 0.42

/** Perfil del cuerpo de cuero: huevo con la parte ancha arriba, que se cierra apenas bajo la virola. */
const BODY: Profile = [
  [0, BODY_BOTTOM],
  [0.1, BODY_BOTTOM + 0.012],
  ...bend([0.1, BODY_BOTTOM + 0.012], [0.39, 0.3], [R, 0.64], 28),
  ...bend([R, 0.64], [0.435, 0.84], [RIM.band - 0.01, RIM.bottom + 0.01], 20),
  [RIM.band - 0.03, RIM.bottom + 0.03],
]

/** Radio del cuerpo a la altura z (para que las patas sigan la panza). */
function bodyRadius(z: number): number {
  for (let i = 1; i < BODY.length; i++) {
    const [ra, za] = BODY[i - 1]!
    const [rb, zb] = BODY[i]!
    if (z >= Math.min(za, zb) && z <= Math.max(za, zb) && za !== zb) return ra + ((rb - ra) * (z - za)) / (zb - za)
  }
  return 0
}

/**
 * Tres patas de cuero: tiras gruesas que bajan pegadas a la panza, se juntan debajo de la punta
 * del huevo y terminan en una pisada plana sobre la mesa. Cada una es un perfil (radio, altura)
 * extruido 12 mm (17 mm con el canto redondeado); una queda adelante, como en la foto, y las otras dos a 120°.
 */
function feetGeometry() {
  const t = 0.02
  const leg = new THREE.Shape()
  // Arranca por debajo del fondo del interior (0,46), así no asoma dentro del mate.
  leg.moveTo(0.02, LEG_TOP)
  // Borde de afuera: sigue la panza un poco por fuera, de arriba hacia la punta del huevo.
  for (let z = LEG_TOP; z >= BODY_BOTTOM + 0.03; z -= 0.02) leg.lineTo(bodyRadius(z) + t, z)
  // Debajo del huevo baja hacia la mesa y se abre en la pisada.
  leg.quadraticCurveTo(0.24, 0.12, 0.31, 0.05)
  leg.quadraticCurveTo(0.34, 0.035, 0.42, 0.032)
  leg.quadraticCurveTo(0.45, 0.02, 0.42, 0)
  // Borde de adentro: llega al centro, donde se juntan las tres patas.
  leg.lineTo(0, 0)
  leg.closePath()
  const base = new THREE.ExtrudeGeometry(leg, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.012, bevelSegments: 5, curveSegments: 12 })
  base.translate(0, 0, -0.06)
  // El perfil se dibuja en el plano XY: Y pasa a ser la altura y X, el radio.
  base.rotateX(Math.PI / 2)
  const feet = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6].map((a) => base.clone().rotateZ(a))
  base.dispose()
  const merged = mergeGeometries(feet)!
  feet.forEach((g) => g.dispose())
  // El bisel agranda el perfil hacia abajo: se sube para que las patas apoyen en z = 0.
  merged.translate(0, 0, 0.012)
  return merged
}

/** Virola de alpaca: banda del costado, labio que sobresale con la cara de arriba plana y la boca. */
function rimGeometry() {
  const { band, lip, inner, bottom, lipBottom, top } = RIM
  const e = 0.012
  return lathe([
    [band - 0.04, bottom - 0.01],
    [band, bottom],
    [band, lipBottom - 0.005],
    [lip - e, lipBottom],
    ...arc(lip - e, lipBottom + e, e, -Math.PI / 2, 0).slice(1),
    [lip, top - e],
    ...arc(lip - e, top - e, e, 0, Math.PI / 2).slice(1),
    [inner + e, top],
    ...arc(inner + e, top - e, e, Math.PI / 2, Math.PI).slice(1),
    [inner, lipBottom - 0.02],
  ])
}

/** Interior de calabaza, que se ve por la boca. El fondo queda por encima de las patas. */
function insideGeometry() {
  const { inner, lipBottom } = RIM
  return lathe([
    [inner, lipBottom - 0.02],
    ...bend([inner, lipBottom - 0.02], [R - 0.04, 0.95], [R - 0.04, 0.66], 20),
    ...bend([R - 0.04, 0.66], [R - 0.06, 0.48], [0, 0.46], 16),
  ])
}

/** Mate imperial: huevo de cuero sobre tres patas, virola ancha con labio e interior de calabaza. */
export function MateImperial({ materialFor, registerPart }: ProductMeshProps) {
  // La costura del torno (ángulo 0) cae en el frente: media vuelta la deja atrás.
  const body = useMemo(() => lathe(BODY).rotateZ(Math.PI), [])
  const feet = useMemo(() => feetGeometry(), [])
  const rim = useMemo(() => rimGeometry().rotateZ(Math.PI), [])
  const inside = useMemo(() => insideGeometry().rotateZ(Math.PI), [])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])
  const rimRef = useCallback((m: THREE.Mesh | null) => registerPart('rim', m), [registerPart])
  return (
    <>
      <mesh geometry={body} castShadow receiveShadow ref={bodyRef}>
        <PartMaterial material={materialFor('body')} />
      </mesh>
      <mesh geometry={feet} castShadow receiveShadow>
        <PartMaterial material={materialFor('body')} />
      </mesh>
      <mesh geometry={rim} castShadow receiveShadow ref={rimRef}>
        <PartMaterial material={materialFor('rim')} />
      </mesh>
      <mesh geometry={inside} receiveShadow>
        <PartMaterial material={materialFor('inside')} />
      </mesh>
    </>
  )
}

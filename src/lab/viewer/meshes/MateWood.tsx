import { useCallback, useMemo } from 'react'
import type * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { arc, bend, lathe } from './thermos'

/** Radio del cuerpo (Ø 75 mm) y alto (95 mm). */
const R = 0.375
const H = 0.95
/** Radio de la boca: apenas más abierta que el cuerpo. */
const MOUTH = 0.392
/** Pared de madera de 6 mm. */
const WALL = 0.06
/** Banda recta donde apoyan el frente y la vuelta completa (de 30 a 75 mm de alto). */
const BAND = [0.3, 0.75] as const

/** Cara de afuera: fondo redondeado, banda recta y boca que se abre apenas. Es la que se registra. */
function outerGeometry() {
  return lathe([
    [0, 0],
    ...arc(0.27, 0.05, 0.05, -Math.PI / 2, 0),
    ...bend([0.32, 0.05], [0.37, 0.12], [R, BAND[0]]),
    [R, BAND[1]],
    ...bend([R, BAND[1]], [R, 0.86], [MOUTH, H - 0.02]),
    ...arc(MOUTH - 0.02, H - 0.02, 0.02, 0, Math.PI / 2),
  ])
}

/** Labio de la boca y cara de adentro, hasta el fondo interior. */
function innerGeometry() {
  const lip = MOUTH - 0.02
  return lathe([
    [lip, H],
    ...arc(lip - 0.02, H - 0.02, 0.02, Math.PI / 2, Math.PI),
    ...bend([lip - 0.04, H - 0.02], [R - WALL, 0.8], [R - WALL, BAND[1]]),
    [R - WALL, 0.25],
    ...arc(R - WALL - 0.08, 0.25, 0.08, 0, -Math.PI / 2),
    [0, 0.17],
  ])
}

/** Mate de madera torneado de una pieza, Ø 75 × 95 mm, vacío. */
export function MateWood({ materialFor, registerPart }: ProductMeshProps) {
  // La costura del torno (ángulo 0) cae en el frente: media vuelta la deja atrás, en la franja sin grabar.
  const outer = useMemo(() => outerGeometry().rotateZ(Math.PI), [])
  const inner = useMemo(() => innerGeometry().rotateZ(Math.PI), [])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])
  return (
    <>
      <mesh geometry={outer} castShadow receiveShadow ref={bodyRef}>
        <PartMaterial material={materialFor('body')} />
      </mesh>
      <mesh geometry={inner} castShadow receiveShadow>
        <PartMaterial material={materialFor('body')} />
      </mesh>
    </>
  )
}

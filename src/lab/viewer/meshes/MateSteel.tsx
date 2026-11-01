import { useCallback, useMemo } from 'react'
import type * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { arc, bend, lathe } from './thermos'

/** Radio exterior (Ø 85 mm) y alto (100 mm). */
const R = 0.425
const H = 1
/** Pared doble: la cara de adentro queda 3,5 mm hacia el centro. */
const INNER = 0.39
/** Banda recta donde apoyan el frente y la vuelta completa (de 25 a 90 mm de alto). */
const BAND = [0.25, 0.9] as const

/**
 * Cara de afuera, desde el centro de la base hasta el borde de la boca. Es la única que se
 * registra: el decal del frente no se proyecta sobre la cara de adentro.
 */
function outerGeometry() {
  return lathe([[0, 0], ...arc(0.34, 0.06, 0.06, -Math.PI / 2, 0), ...bend([0.4, 0.06], [0.41, 0.17], [R, BAND[0]]), [R, BAND[1]], [R, H - 0.03], ...arc(R - 0.0175, H - 0.03, 0.0175, 0, Math.PI / 2)])
}

/** Borde de la boca y cara de adentro, hasta el fondo interior. */
function innerGeometry() {
  return lathe([[R - 0.0175, H - 0.0125], ...arc(INNER + 0.0175, H - 0.03, 0.0175, Math.PI / 2, Math.PI), [INNER, 0.2], ...arc(INNER - 0.05, 0.2, 0.05, 0, -Math.PI / 2), [0, 0.15]])
}

/** Mate de acero de doble pared, Ø 85 × 100 mm, vacío. */
export function MateSteel({ materialFor, registerPart }: ProductMeshProps) {
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

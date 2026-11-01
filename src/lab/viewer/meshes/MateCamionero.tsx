import { useCallback, useMemo } from 'react'
import type * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { arc, bend, lathe } from './thermos'

/** Virola ancha: Ø 78 por fuera, boca de Ø 52, de 93 a 105 mm de alto (12 mm). */
const CAMIONERO_RIM = { outer: 0.39, inner: 0.26, bottom: 0.93, top: 1.05 }
/** Radio en la parte más ancha del cuerpo (Ø 90). */
const R = 0.45
/** Base fruncida: pliegues del cuero, más marcados abajo. */
const PLEATS = 7
const PLEAT_TOP = 0.32

/**
 * Cuerpo de cuero: panza ancha abajo que se angosta hacia la virola. La base fruncida se hace
 * moviendo los vértices hacia afuera y adentro según el ángulo, con pliegues que se apagan al subir.
 */
function bodyGeometry() {
  const { outer, bottom } = CAMIONERO_RIM
  const geo = lathe(
    [
      [0, 0.015],
      [0.22, 0],
      ...bend([0.22, 0], [R, 0.0], [R, 0.24], 20),
      ...bend([R, 0.24], [R, 0.62], [outer - 0.03, bottom - 0.03], 24),
      [outer - 0.04, bottom + 0.01],
    ],
    128,
  )
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    if (z > PLEAT_TOP) continue
    const k = 1 - z / PLEAT_TOP
    const f = 1 + 0.07 * k * k * Math.cos(Math.atan2(y, x) * PLEATS)
    pos.setXY(i, x * f, y * f)
  }
  geo.computeVertexNormals()
  return geo
}

/** Virola de alpaca: banda del costado, cara de arriba plana y cara de adentro de la boca. */
function rimGeometry() {
  const { outer, inner, bottom, top } = CAMIONERO_RIM
  const e = 0.01
  return lathe([
    [outer - 0.05, bottom - 0.01],
    [outer, bottom],
    [outer, top - e],
    ...arc(outer - e, top - e, e, 0, Math.PI / 2).slice(1),
    [inner + e, top],
    ...arc(inner + e, top - e, e, Math.PI / 2, Math.PI).slice(1),
    [inner, bottom + 0.02],
  ])
}

/** Interior de calabaza, que se ve por la boca. */
function insideGeometry() {
  const { inner, bottom } = CAMIONERO_RIM
  return lathe([[inner, bottom + 0.02], ...bend([inner, bottom + 0.02], [R - 0.04, 0.8], [R - 0.04, 0.35], 20), ...bend([R - 0.04, 0.35], [R - 0.05, 0.06], [0, 0.06], 16)])
}

/** Mate camionero: cuero con base fruncida, virola ancha de alpaca e interior de calabaza. */
export function MateCamionero({ materialFor, registerPart }: ProductMeshProps) {
  // La costura del torno (ángulo 0) cae en el frente: media vuelta la deja atrás.
  const body = useMemo(() => bodyGeometry().rotateZ(Math.PI), [])
  const rim = useMemo(() => rimGeometry().rotateZ(Math.PI), [])
  const inside = useMemo(() => insideGeometry().rotateZ(Math.PI), [])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])
  const rimRef = useCallback((m: THREE.Mesh | null) => registerPart('rim', m), [registerPart])
  return (
    <>
      <mesh geometry={body} castShadow receiveShadow ref={bodyRef}>
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

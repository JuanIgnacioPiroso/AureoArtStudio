import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { MM } from '../model/catalog'
import type { DesignState, SurfaceDef } from '../model/types'
import { wrapAngle } from './surfaceFrame'
import { useEngravingMaterial } from './useEngravingMaterial'

/** Separación entre la manga y el cuerpo, en mm: evita que se pisen sin que se vea flotando. */
const GAP_MM = 0.2
const SEGMENTS = 128

interface Props {
  design: DesignState
  surface: SurfaceDef
  target: THREE.Mesh | null
  /** Tamaño máximo de la textura en px (menor en móviles). */
  maxTexturePx: number
  /** Cambia cuando cargan tipografías o logos: obliga a volver a dibujar. */
  revision: number
}

/**
 * Dibuja el grabado de una tira cilíndrica sobre una manga apenas más grande que el cuerpo.
 * U recorre la tira de izquierda a derecha (visto desde afuera) y V va de abajo hacia arriba,
 * así cada milímetro del diseño mide lo mismo en cualquier punto de la vuelta.
 */
export function EngravingWrap({ design, surface, target, maxTexturePx, revision }: Props) {
  const invalidate = useThree((s) => s.invalidate)
  const geometry = useMemo(() => {
    const wrap = surface.wrap
    if (!target || !wrap) return null
    target.updateWorldMatrix(true, false)
    const radius = (wrap.radiusMm + GAP_MM) * MM
    const thetaLength = surface.widthMm / wrap.radiusMm
    // CylinderGeometry gira alrededor de +Y desde +Z; al pasar su eje a +Z, θ = φ + π/2.
    const thetaStart = wrapAngle(wrap, -surface.widthMm / 2) + Math.PI / 2
    const geo = new THREE.CylinderGeometry(radius, radius, surface.heightMm * MM, SEGMENTS, 1, true, thetaStart, thetaLength)
    geo.rotateX(Math.PI / 2)
    geo.translate(0, 0, surface.position[2])
    geo.applyMatrix4(target.matrixWorld)
    return geo
  }, [target, surface])

  useEffect(() => {
    invalidate()
    return () => geometry?.dispose()
  }, [geometry, invalidate])

  const material = useEngravingMaterial(design, surface, maxTexturePx, revision)

  if (!geometry) return null
  return <mesh geometry={geometry} material={material} renderOrder={2} />
}

import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { MM } from '../model/catalog'
import type { DesignState, SurfaceDef } from '../model/types'
import { surfaceFrame } from './surfaceFrame'
import { useEngravingMaterial } from './useEngravingMaterial'

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
 * Proyecta el grabado sobre la malla de la parte. La geometría del decal cubre toda la zona
 * grabable y sólo se recalcula al cambiar de superficie; el diseño vive en las texturas.
 */
export function EngravingDecal({ design, surface, target, maxTexturePx, revision }: Props) {
  const invalidate = useThree((s) => s.invalidate)
  const geometry = useMemo(() => {
    if (!target) return null
    target.updateWorldMatrix(true, false)
    const { position, quaternion } = surfaceFrame(target, surface)
    const size = new THREE.Vector3(surface.widthMm * MM, surface.heightMm * MM, surface.depthMm * MM)
    return new DecalGeometry(target, position, new THREE.Euler().setFromQuaternion(quaternion), size)
  }, [target, surface])

  useEffect(() => {
    invalidate()
    return () => geometry?.dispose()
  }, [geometry, invalidate])

  const material = useEngravingMaterial(design, surface, maxTexturePx, revision)

  if (!geometry) return null
  return <mesh geometry={geometry} material={material} renderOrder={2} />
}

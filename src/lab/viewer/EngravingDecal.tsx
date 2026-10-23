import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import { MM } from '../model/catalog'
import type { DesignState, SurfaceDef } from '../model/types'
import { ENGRAVING_LOOKS, renderEngravingMaps } from './engravingTexture'
import { surfaceFrame } from './surfaceFrame'

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

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  // Regenera las texturas con un pequeño debounce mientras el usuario escribe o arrastra.
  const pending = useRef<number | undefined>(undefined)
  useEffect(() => {
    window.clearTimeout(pending.current)
    pending.current = window.setTimeout(() => {
      const maps = renderEngravingMaps(design, surface, maxTexturePx)
      const look = ENGRAVING_LOOKS[design.styleId]
      const color = new THREE.CanvasTexture(maps.color)
      color.colorSpace = THREE.SRGBColorSpace
      color.anisotropy = 8
      const normal = new THREE.CanvasTexture(maps.normal)
      const prev = [material.map, material.normalMap]
      material.map = color
      material.normalMap = normal
      material.normalScale.set(1, 1)
      material.roughness = look.roughness
      material.metalness = look.metalness
      material.needsUpdate = true
      prev.forEach((t) => t?.dispose())
      invalidate()
    }, 60)
    return () => window.clearTimeout(pending.current)
  }, [design, surface, revision, material, maxTexturePx, invalidate])

  useEffect(
    () => () => {
      material.map?.dispose()
      material.normalMap?.dispose()
    },
    [material],
  )

  if (!geometry) return null
  return <mesh geometry={geometry} material={material} renderOrder={2} />
}

import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { DesignState, SurfaceDef } from '../model/types'
import { ENGRAVING_LOOKS, renderEngravingMaps } from './engravingTexture'

/**
 * Material del grabado (marca + hundimiento) para toda la zona. Lo comparten el decal del frente
 * y la manga de la tira; las texturas se regeneran con un pequeño debounce mientras el usuario
 * escribe o arrastra.
 */
export function useEngravingMaterial(design: DesignState, surface: SurfaceDef, maxTexturePx: number, revision: number) {
  const invalidate = useThree((s) => s.invalidate)
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

  return material
}

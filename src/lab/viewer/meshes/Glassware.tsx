import { useCallback, useMemo } from 'react'
import type * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { glasswareProfile } from './glasswareProfiles'
import { lathe, tubeAlong } from './thermos'

/**
 * Copas y vasos de vidrio, huecos, según la forma elegida. La cara de afuera es una malla aparte
 * y es la única que se registra: el decal del frente no toca la cara de adentro ni la pared de
 * atrás. La costura del torno queda atrás (media vuelta), y el asa del jarro al costado (+X).
 */
export function Glassware({ materialFor, registerPart, shapeId }: ProductMeshProps) {
  const profile = glasswareProfile(shapeId)
  const outer = useMemo(() => lathe(profile.outer).rotateZ(Math.PI), [profile])
  const inner = useMemo(() => lathe(profile.inner).rotateZ(Math.PI), [profile])
  const handle = useMemo(() => (profile.handle ? tubeAlong(profile.handle.points, profile.handle.radius) : null), [profile])
  const glassRef = useCallback((m: THREE.Mesh | null) => registerPart('glass', m), [registerPart])
  const material = materialFor('glass')
  return (
    <>
      <mesh geometry={outer} castShadow ref={glassRef}>
        <PartMaterial material={material} />
      </mesh>
      <mesh geometry={inner}>
        <PartMaterial material={material} />
      </mesh>
      {handle && (
        <mesh geometry={handle} castShadow>
          <PartMaterial material={material} />
        </mesh>
      )}
    </>
  )
}

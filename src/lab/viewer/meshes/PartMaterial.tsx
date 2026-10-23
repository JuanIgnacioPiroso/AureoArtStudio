import type { MaterialDef } from '../../model/types'
import { surfaceMaps } from '../surfaceTextures'

/** Material PBR de una parte del producto, a partir de la definición del catálogo. */
export function PartMaterial({ material }: { material: MaterialDef }) {
  const maps = surfaceMaps(material)
  if (material.texture === 'wood-grain') {
    // Madera aceitada: poro abierto con una capa fina de brillo suave encima.
    return (
      <meshPhysicalMaterial
        map={maps.map}
        roughnessMap={maps.roughnessMap}
        roughness={material.roughness * 1.15}
        bumpMap={maps.bumpMap}
        bumpScale={0.12}
        metalness={0}
        clearcoat={0.18}
        clearcoatRoughness={0.42}
        specularIntensity={0.6}
      />
    )
  }
  if (material.texture === 'matte') {
    // Pintura en polvo: difusa y sin reflejo metálico.
    return (
      <meshPhysicalMaterial
        color={material.color}
        roughnessMap={maps.roughnessMap}
        roughness={material.roughness}
        metalness={0}
        clearcoat={0}
        specularIntensity={1}
      />
    )
  }
  // Acero cepillado: el reflejo se estira a lo largo del cepillado (eje U = X del modelo).
  return (
    <meshPhysicalMaterial
      color={material.color}
      roughnessMap={maps.roughnessMap}
      roughness={material.roughness * 1.4}
      metalness={material.metalness}
      anisotropy={0.55}
      anisotropyRotation={0}
      envMapIntensity={1}
    />
  )
}

import type { MaterialDef } from '../../model/types'
import { surfaceMaps } from '../surfaceTextures'

/**
 * Material PBR de una parte del producto, a partir de la definición del catálogo. Cada material
 * lleva `key`: si React reusara la instancia al cambiar de acabado, arrastraría propiedades del
 * anterior (la anisotropía y el reflejo del acero oscurecían el mármol).
 */
export function PartMaterial({ material }: { material: MaterialDef }) {
  const maps = surfaceMaps(material)
  if (material.texture === 'wood-grain') {
    // Madera aceitada: poro abierto con una capa fina de brillo suave encima.
    return (
      <meshPhysicalMaterial
        key={material.id}
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
  if (material.texture === 'marble') {
    // Mármol pulido: veta en el color y un brillo fino encima.
    return (
      <meshPhysicalMaterial
        key={material.id}
        map={maps.map}
        roughnessMap={maps.roughnessMap}
        roughness={material.roughness}
        metalness={0}
        clearcoat={0.5}
        clearcoatRoughness={0.12}
      />
    )
  }
  if (material.texture === 'clear') {
    // Acrílico transparente (PMMA, índice 1,49). Un leve tinte por espesor y un brillo de canto
    // hacen que se lea como acrílico aun sobre el fondo oscuro del estudio.
    return (
      <meshPhysicalMaterial
        key={material.id}
        color="#ffffff"
        roughness={material.roughness}
        metalness={0}
        transmission={0.92}
        thickness={0.1}
        ior={1.49}
        attenuationColor="#d9eef0"
        attenuationDistance={0.6}
        clearcoat={1}
        clearcoatRoughness={0.05}
        specularIntensity={1}
        envMapIntensity={1.8}
      />
    )
  }
  if (material.texture === 'matte') {
    // Pintura en polvo: difusa y sin reflejo metálico.
    return (
      <meshPhysicalMaterial
        key={material.id}
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
        key={material.id}
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

import { useCallback, useMemo } from 'react'
import type * as THREE from 'three'
import type { ProductMeshProps } from './types'
import { PartMaterial } from './PartMaterial'
import { arc, BASE_HEIGHT, baseGeometry, bend, lathe, THERMOS_RADIUS, tubeAlong } from './thermos'

/** Fin del tramo recto del cuerpo; arriba arranca el hombro. */
const SHOULDER = 2.3
/** Radio del cuello, donde apoya la tapa-vaso. */
const NECK = 0.37

/** Cuerpo sobre la base de acero, con hombro que se angosta hacia el cuello. */
function bodyGeometry() {
  const R = THERMOS_RADIUS
  return lathe([[0, BASE_HEIGHT], [R, BASE_HEIGHT], [R, SHOULDER], ...bend([R, SHOULDER], [R, 2.47], [NECK, 2.5]), [0, 2.5]])
}

/** Tapa-vaso de acero, cerrada: banda sobre el cuello y vaso con el borde superior redondeado. */
function cupGeometry() {
  return lathe([[0, 2.5], [NECK, 2.5], [NECK, 2.56], [0.355, 2.58], [0.36, 2.62], [0.355, 2.64], [0.355, 3.25], ...arc(0.305, 3.25, 0.05, 0, Math.PI / 2), [0, 3.3]])
}

/**
 * Manija plana del lado +X: una cinta vertical separada del cuerpo, que vuelve a él arriba y
 * abajo. Se arma como tubo y se aplasta: angosta hacia afuera, ancha hacia el frente.
 */
function handleGeometry() {
  const geo = tubeAlong(
    [
      [-0.13, 0, 2.22],
      [0, 0, 2.25],
      [0.11, 0, 2.13],
      [0.13, 0, 1.5],
      [0.11, 0, 0.87],
      [0, 0, 0.75],
      [-0.13, 0, 0.78],
    ],
    0.05,
    128,
  )
  geo.scale(0.7, 1.8, 1)
  geo.translate(0.55, 0, 0)
  return geo
}

/** Enganches de alambre: dos aros finos que unen la manija con el cuerpo. */
function clipGeometry(z: number) {
  return tubeAlong(
    [
      [0.44, -0.07, z - 0.08],
      [0.6, -0.07, z],
      [0.6, 0.07, z],
      [0.44, 0.07, z - 0.08],
    ],
    0.012,
    32,
  )
}

/** Termo de 1 L tipo Stanley: base y tapa-vaso de acero, cuerpo con hombro y manija lateral. */
export function ThermosHandle({ materialFor, registerPart }: ProductMeshProps) {
  const base = useMemo(() => baseGeometry(), [])
  const body = useMemo(() => bodyGeometry(), [])
  const cup = useMemo(() => cupGeometry(), [])
  const handle = useMemo(() => handleGeometry(), [])
  const clips = useMemo(() => [clipGeometry(2.0), clipGeometry(1.08)], [])
  const steel = materialFor('cup')
  // Acero satinado: con espejo puro, a esa altura refleja el fondo oscuro del estudio y se ve negro.
  const satin = useMemo(() => ({ ...steel, roughness: 0.55 }), [steel])
  const bodyRef = useCallback((m: THREE.Mesh | null) => registerPart('body', m), [registerPart])

  return (
    <group>
      <mesh geometry={base} castShadow receiveShadow>
        <PartMaterial material={materialFor('base')} />
      </mesh>
      <mesh geometry={body} castShadow receiveShadow ref={bodyRef}>
        <PartMaterial material={materialFor('body')} />
      </mesh>
      <mesh geometry={cup} castShadow receiveShadow>
        <PartMaterial material={satin} />
      </mesh>
      <mesh geometry={handle} castShadow>
        <PartMaterial material={materialFor('handle')} />
      </mesh>
      {clips.map((g, i) => (
        <mesh key={i} geometry={g}>
          <PartMaterial material={satin} />
        </mesh>
      ))}
    </group>
  )
}

import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { getProduct, getSurface, partMaterial } from '../model/catalog'
import { elementBounds, unionBounds } from '../model/constraints'
import { measureTextMm } from '../model/measure'
import type { DesignState, MaterialKind, ProductDef } from '../model/types'
import { useRenderRevision } from '../render/preview'
import { useLab, type ViewMode } from '../store'
import { EngravingDecal } from './EngravingDecal'
import { EngravingWrap } from './EngravingWrap'
import { Board } from './meshes/Board'
import { DogTag } from './meshes/DogTag'
import { Glassware } from './meshes/Glassware'
import { BELT_HALF } from './meshes/beltLayout'
import { Knife } from './meshes/Knife'
import { LeatherBelt } from './meshes/LeatherBelt'
import { LeatherKeychain } from './meshes/LeatherKeychain'
import { LeatherWallet } from './meshes/LeatherWallet'
import { MateCamionero } from './meshes/MateCamionero'
import { MateImperial } from './meshes/MateImperial'
import { MateSteel } from './meshes/MateSteel'
import { MateWood } from './meshes/MateWood'
import { PLAQUE_BASE_HALF, PlaqueBase } from './meshes/PlaqueBase'
import { PLAQUE_WALL_HALF, PlaqueWall } from './meshes/PlaqueWall'
import { ThermosHalf } from './meshes/ThermosHalf'
import { ThermosHandle } from './meshes/ThermosHandle'
import { Trophy } from './meshes/Trophy'
import type { ProductMeshProps } from './meshes/types'
import { zoneCamera } from './surfaceFrame'

const MODELS: Record<ProductDef['modelId'], { Component: ComponentType<ProductMeshProps>; rest: number }> = {
  'knife-v1': { Component: Knife, rest: 0.1 },
  'board-v1': { Component: Board, rest: 0.11 },
  // Los termos se arman parados con la base en z = 0.
  'thermos-handle-v1': { Component: ThermosHandle, rest: 0 },
  'thermos-half-v1': { Component: ThermosHalf, rest: 0 },
  // Las placas se apoyan boca arriba, como la tabla.
  'plaque-base-v1': { Component: PlaqueBase, rest: PLAQUE_BASE_HALF },
  'plaque-wall-v1': { Component: PlaqueWall, rest: PLAQUE_WALL_HALF },
  // La chapita va parada sobre su canto, con el borde de abajo en z = 0.
  'dog-tag-v1': { Component: DogTag, rest: 0 },
  'trophy-v1': { Component: Trophy, rest: 0 },
  // Los mates se arman parados con la base en z = 0, como los termos.
  'mate-wood-v1': { Component: MateWood, rest: 0 },
  'mate-imperial-v1': { Component: MateImperial, rest: 0 },
  'mate-camionero-v1': { Component: MateCamionero, rest: 0 },
  'mate-steel-v1': { Component: MateSteel, rest: 0 },
  'glassware-v1': { Component: Glassware, rest: 0 },
  // La billetera va parada, como la chapita.
  'leather-wallet-v1': { Component: LeatherWallet, rest: 0 },
  // El llavero va parado sobre su punto más bajo, con la argolla arriba.
  'leather-keychain-v1': { Component: LeatherKeychain, rest: 0 },
  // El cinturón se acuesta, como la tabla.
  'leather-belt-v1': { Component: LeatherBelt, rest: BELT_HALF },
}

type StageTone = 'dark' | 'light'
/** Fondo y piso del estudio. El claro (gris cálido) deja ver la transparencia del vidrio y el acrílico. */
const STAGE_BG: Record<StageTone, string> = { dark: '#1D1F23', light: '#D3CEC4' }
/** Tono según el tipo de material de la parte que se elige: claro sólo para `glass`. */
const stageTone = (kind: MaterialKind): StageTone => (kind === 'glass' ? 'light' : 'dark')
const MIN_DISTANCE = 0.9
const MAX_DISTANCE = 12
const MAX_POLAR = Math.PI * 0.44

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Parts = Partial<Record<string, THREE.Mesh>>

/** Centro horizontal (mm) de las capas seleccionadas, o `fallback` si no hay ninguna. */
function wrapFocus(fallback: number): number {
  const { design, selection } = useLab.getState()
  const box = unionBounds(design.elements.filter((e) => selection.includes(e.id)).map((e) => elementBounds(e, measureTextMm)))
  return box ? (box.minX + box.maxX) / 2 : fallback
}

/** Encuadre de producto: misma dirección de cámara, distancia ajustada al aspecto del canvas. */
function productCamera(product: ProductDef, cam: THREE.PerspectiveCamera) {
  const target = new THREE.Vector3(...product.camera.target)
  const dir = new THREE.Vector3(...product.camera.position).sub(target).normalize()
  const vFov = THREE.MathUtils.degToRad(cam.fov)
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * cam.aspect)
  const dist = (product.frameRadius / Math.sin(Math.min(vFov, hFov) / 2)) * 1.02
  return { eye: target.clone().addScaledVector(dir, dist), target }
}

function CameraRig({
  product,
  design,
  parts,
  viewMode,
  resetToken,
}: {
  product: ProductDef
  design: DesignState
  parts: Parts
  viewMode: ViewMode
  resetToken: number
}) {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)
  const scene = useThree((s) => s.scene)
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null
  const invalidate = useThree((s) => s.invalidate)
  const goal = useRef<{ eye: THREE.Vector3; target: THREE.Vector3 } | null>(null)
  const surface = getSurface(product, design.surfaceId, design.shapeId)
  const zoneMesh = parts[surface.part]
  // En una tira, la vista de zona sigue a la selección; sin selección, mira el frente.
  // Depende de qué está seleccionado y no de dónde está: mover una capa no mueve la cámara.
  const selectionKey = useLab((s) => s.selection.join(','))

  useEffect(() => {
    if (!controls) return
    let next: { eye: THREE.Vector3; target: THREE.Vector3 }
    if (viewMode === 'zone' && zoneMesh) {
      zoneMesh.updateWorldMatrix(true, false)
      next = zoneCamera(zoneMesh, surface, surface.wrap ? wrapFocus(surface.wrap.frontOffsetMm) : 0)
    } else {
      next = productCamera(product, camera as THREE.PerspectiveCamera)
    }
    if (prefersReducedMotion()) {
      camera.position.copy(next.eye)
      controls.target.copy(next.target)
      controls.update()
      goal.current = null
    } else {
      goal.current = next
    }
    invalidate()
  }, [product, surface, zoneMesh, viewMode, resetToken, controls, camera, invalidate, aspect, selectionKey])

  // Sólo en desarrollo: acceso a cámara y controles para capturas y depuración.
  useEffect(() => {
    if (!import.meta.env.DEV || !controls) return
    ;(window as unknown as Record<string, unknown>).__aureoLab = { camera, controls, invalidate, scene }
  }, [camera, controls, invalidate, scene])

  useEffect(() => {
    if (!controls) return
    const stop = () => (goal.current = null)
    controls.addEventListener('start', stop)
    return () => controls.removeEventListener('start', stop)
  }, [controls])

  // Alternativa de teclado al arrastre: gira sobre el objetivo con los mismos límites que OrbitControls.
  const setOrbit = useLab((s) => s.setOrbit)
  useEffect(() => {
    if (!controls) return
    const spherical = new THREE.Spherical()
    const offset = new THREE.Vector3()
    setOrbit((azimuth, polar, zoom) => {
      goal.current = null
      offset.copy(camera.position).sub(controls.target)
      spherical.setFromVector3(offset)
      spherical.theta += azimuth
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + polar, 0.05, MAX_POLAR)
      spherical.radius = THREE.MathUtils.clamp(spherical.radius * zoom, MIN_DISTANCE, MAX_DISTANCE)
      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical))
      controls.update()
      invalidate()
    })
    return () => setOrbit(null)
  }, [controls, camera, invalidate, setOrbit])

  useFrame((_, dt) => {
    const g = goal.current
    if (!g || !controls) return
    const k = 1 - Math.exp(-dt * 7)
    camera.position.lerp(g.eye, k)
    controls.target.lerp(g.target, k)
    controls.update()
    if (camera.position.distanceTo(g.eye) < 0.002 && controls.target.distanceTo(g.target) < 0.002) {
      goal.current = null
    }
    invalidate()
  })
  return null
}

/** Registra en el store una función que captura la vista actual como PNG. */
function CaptureBridge() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const setCapture = useLab((s) => s.setCapture)
  useEffect(() => {
    setCapture(() => {
      try {
        gl.render(scene, camera)
        return gl.domElement.toDataURL('image/png')
      } catch {
        return null
      }
    })
    return () => setCapture(null)
  }, [gl, scene, camera, setCapture])
  return null
}

/**
 * Estudio de producto: cajas de luz rectangulares sobre fondo oscuro. Los metales reflejan
 * el entorno, así que el contraste entre las cajas y el fondo es lo que define el acero.
 */
function Studio({ tone }: { tone: StageTone }) {
  return (
    <>
      <color attach="background" args={[STAGE_BG[tone]]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[-3, 6, 3]} intensity={1.5} />
      <directionalLight position={[4, 3, -4]} intensity={0.45} color="#E8D9BE" />
      <Environment resolution={512} frames={1}>
        <color attach="background" args={['#15161a']} />
        <Lightformer form="rect" intensity={0.6} position={[0, -3, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} color="#24262b" />
        {/* Caja principal cenital, desplazada para que la hoja refleje un degradé y no un plano uniforme. */}
        <Lightformer form="rect" intensity={1.3} position={[-1.2, 5, -1]} rotation-x={Math.PI / 2} scale={[5, 2.2, 1]} />
        <Lightformer form="rect" intensity={1} position={[2.5, 4.5, 1.5]} rotation-x={Math.PI / 2} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#F2EBDF" position={[5, 1.5, -1]} rotation-y={-Math.PI / 2} scale={[6, 1, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0.5, 2.5, 5]} scale={[7, 0.35, 1]} />
        {/* Relleno bajo y frontal: las caras verticales del metal no se ven negras. */}
        <Lightformer form="rect" intensity={0.7} position={[0, 0.6, 6]} scale={[10, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[-3, 3.5, -3]} rotation-y={2.4} scale={[4, 2, 1]} color="#F2EDE4" />
        {/* Paneles grandes y suaves: las caras planas de metal (placas, chapita) reflejan un gris claro y no el fondo. */}
        <Lightformer form="rect" intensity={0.45} position={[0, 6, -3]} rotation-x={Math.PI / 2} scale={[12, 7, 1]} color="#EDEDEA" />
        <Lightformer form="rect" intensity={0.4} position={[0, 2.4, 6]} scale={[10, 3.5, 1]} color="#EDEDEA" />
        {/* Vista desde arriba, una cara vertical refleja lo que tiene adelante y abajo: una mesa clara. */}
        <Lightformer form="rect" intensity={0.4} position={[0, -1.8, 6]} rotation-x={-0.3} scale={[12, 3.6, 1]} color="#EDEDEA" />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
        <planeGeometry args={[40, 40]} />
        {/* Sin iluminar: coincide exactamente con el fondo y sólo recibe las sombras de contacto. */}
        <meshBasicMaterial color={STAGE_BG[tone]} toneMapped={false} />
      </mesh>
    </>
  )
}

interface TextureCaps {
  /** Tope de textura del decal (frente y demás zonas planas). */
  decal: number
  /** Tope de la tira cilíndrica, más largo: 250 mm necesitan más píxeles. */
  wrap: number
}

function Scene({ design, textureCaps }: { design: DesignState; textureCaps: TextureCaps }) {
  const revision = useRenderRevision()
  const maxTextureSize = useThree((s) => s.gl.capabilities.maxTextureSize)
  const viewMode = useLab((s) => s.viewMode)
  const resetToken = useLab((s) => s.viewResetToken)
  const product = useLab((s) => s.design.productId)
  const productDef = useMemo(() => getProduct(product), [product])
  const surface = getSurface(productDef, design.surfaceId, design.shapeId)
  const model = MODELS[productDef.modelId]

  const [parts, setParts] = useState<Parts>({})
  const registerPart = useCallback((partId: string, mesh: THREE.Mesh | null) => {
    setParts((prev) => (prev[partId] === (mesh ?? undefined) ? prev : { ...prev, [partId]: mesh ?? undefined }))
  }, [])
  const materialFor = useCallback(
    (partId: string) => partMaterial(productDef, partId, design.materialId),
    [productDef, design.materialId],
  )

  return (
    <>
      <Studio tone={stageTone(partMaterial(productDef, productDef.selectablePart, design.materialId).kind)} />
      {/* La forma va en la clave: al cambiarla se vuelve a montar la malla y se reproyecta el grabado. */}
      <group key={`${productDef.id}:${design.shapeId ?? ''}`} position={[0, model.rest, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <model.Component materialFor={materialFor} registerPart={registerPart} shapeId={design.shapeId} />
      </group>
      {surface.wrap ? (
        <EngravingWrap
          key={`${productDef.id}:${design.shapeId ?? ''}:${surface.id}`}
          design={design}
          surface={surface}
          target={parts[surface.part] ?? null}
          maxTexturePx={Math.min(textureCaps.wrap, maxTextureSize)}
          revision={revision}
        />
      ) : (
        <EngravingDecal
          key={`${productDef.id}:${design.shapeId ?? ''}:${surface.id}`}
          design={design}
          surface={surface}
          target={parts[surface.part] ?? null}
          maxTexturePx={textureCaps.decal}
          revision={revision}
        />
      )}
      {/* Dos capas: penumbra amplia y oclusión ajustada donde el objeto toca la mesa. */}
      <ContactShadows key={`shadow-${productDef.id}`} frames={1} position={[0, 0, 0]} scale={7} blur={2.6} opacity={0.6} far={1.2} resolution={512} />
      <ContactShadows key={`ao-${productDef.id}`} frames={1} position={[0, 0.0005, 0]} scale={7} blur={0.9} opacity={0.55} far={0.25} resolution={1024} />
      <CameraRig product={productDef} design={design} parts={parts} viewMode={viewMode} resetToken={resetToken} />
      <CaptureBridge />
    </>
  )
}

interface ViewerProps {
  design: DesignState
  onContextLost: () => void
  label: string
}

/** Visor 3D del producto con el grabado aplicado. Se carga de forma diferida. */
export default function ProductViewer3D({ design, onContextLost, label }: ViewerProps) {
  const product = getProduct(design.productId)
  const [coarse] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)
  const textureCaps = useMemo<TextureCaps>(() => (coarse ? { decal: 1024, wrap: 2048 } : { decal: 2048, wrap: 4096 }), [coarse])

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, coarse ? 1.5 : 1.75]}
      camera={{ position: [...product.camera.position], fov: 35, near: 0.05, far: 60 }}
      // Tone mapping neutro: conserva el color real de la madera y del acero.
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1 }}
      onCreated={({ gl }) => {
        // El listener vive lo mismo que el canvas: al desmontarse el visor, el elemento se descarta con él.
        gl.domElement.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault()
            onContextLost()
          },
          { once: true },
        )
      }}
      aria-label={label}
      role="img"
    >
      <Scene design={design} textureCaps={textureCaps} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping={false}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        maxPolarAngle={MAX_POLAR}
        target={[...product.camera.target]}
      />
    </Canvas>
  )
}

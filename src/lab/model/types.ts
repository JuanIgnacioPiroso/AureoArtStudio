import { z } from 'zod'

/** Tipografías de grabado disponibles. Deben estar cargadas en index.html. */
export const FONT_IDS = [
  'bodoni',
  'playfair',
  'cormorant',
  'garamond',
  'baskerville',
  'cinzel',
  'cinzel-deco',
  'abril',
  'bebas',
  'oswald',
  'grotesk',
  'montserrat',
  'josefin',
  'raleway',
  'script',
  'great-vibes',
  'dancing',
  'allura',
  'space-mono',
] as const
export type FontId = (typeof FONT_IDS)[number]

export const FONT_CATEGORIES = ['classic', 'display', 'modern', 'script', 'technical'] as const
export type FontCategory = (typeof FONT_CATEGORIES)[number]

/** Estilos de grabado. Cada superficie habilita solo los compatibles con su material. */
export const STYLE_IDS = ['burn', 'mark-dark', 'frost', 'reveal', 'carve', 'etch'] as const
export type StyleId = (typeof STYLE_IDS)[number]

export const ALIGNS = ['left', 'center', 'right'] as const
export type Align = (typeof ALIGNS)[number]

export const SHAPES = ['rect', 'ellipse', 'line'] as const
export type ShapeKind = (typeof SHAPES)[number]

/** Largo máximo del contenido de una capa de texto (admite saltos de línea). */
export const MAX_TEXT_LENGTH = 120
export const MAX_ELEMENTS = 20

const ElementBase = {
  id: z.string().min(1).max(24),
  /** Nombre visible en la lista de capas; vacío = se deriva del contenido. */
  name: z.string().max(40),
  /** Centro de la capa respecto del centro de la zona, en mm (+derecha, +arriba). */
  x: z.number(),
  y: z.number(),
  /** Grados, antihorario positivo. */
  rotation: z.number().min(-180).max(180),
  hidden: z.boolean(),
  locked: z.boolean(),
}

export const TextElementSchema = z.object({
  ...ElementBase,
  kind: z.literal('text'),
  text: z.string().max(MAX_TEXT_LENGTH),
  fontId: z.enum(FONT_IDS),
  /** Altura de mayúscula, en mm. */
  sizeMm: z.number().positive(),
  align: z.enum(ALIGNS),
  /** Espacio extra entre letras, como fracción de la altura de mayúscula. */
  letterSpacing: z.number(),
  /** Distancia entre líneas base, como múltiplo de la altura de mayúscula. */
  lineHeight: z.number().positive(),
  /** Grados de arco que recorre el texto: 0 = recto, + = curva hacia arriba (∩), − = hacia abajo (∪). */
  arc: z.number().min(-360).max(360),
})
export type TextElement = z.infer<typeof TextElementSchema>

export const ImageElementSchema = z.object({
  ...ElementBase,
  kind: z.literal('image'),
  /** Hash del archivo; el archivo vive sólo en el navegador que lo subió. */
  assetId: z.string().min(1).max(64),
  widthMm: z.number().positive(),
  heightMm: z.number().positive(),
  /** Umbral de luminancia (0..1): lo más oscuro que el umbral se graba. */
  threshold: z.number().min(0).max(1),
  invert: z.boolean(),
})
export type ImageElement = z.infer<typeof ImageElementSchema>

export const ShapeElementSchema = z.object({
  ...ElementBase,
  kind: z.literal('shape'),
  shape: z.enum(SHAPES),
  widthMm: z.number().positive(),
  heightMm: z.number().positive(),
  strokeMm: z.number().positive(),
  fill: z.boolean(),
  radiusMm: z.number().min(0),
})
export type ShapeElement = z.infer<typeof ShapeElementSchema>

export const DesignElementSchema = z.discriminatedUnion('kind', [TextElementSchema, ImageElementSchema, ShapeElementSchema])
export type DesignElement = z.infer<typeof DesignElementSchema>
export type ElementKind = DesignElement['kind']

/** Estado del diseño: única fuente de verdad del editor. Serializable a URL. */
export const DesignStateSchema = z.object({
  v: z.literal(2),
  productId: z.string(),
  materialId: z.string(),
  surfaceId: z.string(),
  /** Forma elegida, sólo en los productos que tienen formas (opcional: los enlaces viejos no la traen). */
  shapeId: z.string().optional(),
  styleId: z.enum(STYLE_IDS),
  /** Capas en orden de apilado (la última queda arriba). */
  elements: z.array(DesignElementSchema).max(MAX_ELEMENTS),
  notes: z.string().max(500),
  source: z.enum(['manual', 'ai']),
})
export type DesignState = z.infer<typeof DesignStateSchema>

export type Vec3 = readonly [number, number, number]

export type MaterialKind = 'wood' | 'steel' | 'coated' | 'stone' | 'glass' | 'leather'

export interface MaterialDef {
  id: string
  name: string
  kind: MaterialKind
  /** Color base de la superficie (para 3D y miniaturas). */
  color: string
  roughness: number
  metalness: number
  /** Veta / textura procedural. */
  texture: 'wood-grain' | 'brushed' | 'matte' | 'marble' | 'clear' | 'gourd' | 'leather'
}

export interface EngravingStyleDef {
  id: StyleId
  name: string
  description: string
  /** Material sobre el que tiene sentido. */
  kind: MaterialKind
}

export interface SurfaceDef {
  id: string
  name: string
  /** Parte del modelo donde está la zona; define el material que recibe el grabado. */
  part: string
  /** Centro de la zona en coordenadas locales del producto (unidades de escena). */
  position: Vec3
  /** Rotación (Euler XYZ, radianes) cuya Z local apunta hacia afuera de la superficie. */
  orientation: Vec3
  /** Área útil en milímetros. */
  widthMm: number
  heightMm: number
  /** Profundidad de proyección del decal, en mm (mayor en superficies curvas). */
  depthMm: number
  curved: boolean
  /** Rango de referencia para el texto principal (presets y avisos de legibilidad). */
  sizeRange: readonly [number, number]
  /** Cámara de la "vista de zona", en el marco local de la zona (Z = hacia afuera). */
  cameraOffset: Vec3
  /** Si está, la zona es una tira cilíndrica y se dibuja con EngravingWrap en lugar de un decal. */
  wrap?: WrapDef
  /** Zona plana con forma de anillo (la boca de una virola): diámetros de afuera y de la boca, en mm. */
  ring?: RingDef
}

export interface RingDef {
  outerMm: number
  innerMm: number
}

/** Zona que rodea un cuerpo cilíndrico sobre el eje Z local del producto. */
export interface WrapDef {
  /** Radio del cuerpo donde se apoya la manga, en mm. */
  radiusMm: number
  /** Ángulo (radianes, en el plano XY local, 0 = +X) del centro de la tira. */
  centerAngle: number
  /** Posición del frente del termo dentro de la tira, en mm desde su centro (+ = derecha). */
  frontOffsetMm: number
  /** Qué hay en los bordes de la tira: la manija (termos, por defecto) o la parte de atrás (mates). */
  edge?: 'handle' | 'back'
}

export interface ProductPart {
  id: string
  name: string
  /** Material fijo de la parte, o null si lo elige el usuario. */
  fixedMaterialId: string | null
}

/** Variante de silueta de un producto; cada una tiene sus propias zonas. */
export interface ProductShapeDef {
  id: string
  name: string
  /** Zonas de esta forma; reemplazan a ProductDef.surfaces. */
  surfaces: readonly SurfaceDef[]
}

export interface ProductDef {
  id: string
  name: string
  description: string
  /** Identificador del modelo 3D que renderiza el visor. */
  modelId: 'knife-v1' | 'board-v1' | 'thermos-handle-v1' | 'thermos-half-v1' | 'plaque-base-v1' | 'plaque-wall-v1' | 'dog-tag-v1' | 'trophy-v1' | 'mate-wood-v1' | 'mate-camionero-v1' | 'mate-imperial-v1' | 'mate-steel-v1' | 'glassware-v1'
  parts: readonly ProductPart[]
  /** Parte cuyo material elige el usuario. */
  selectablePart: string
  materialIds: readonly string[]
  surfaces: readonly SurfaceDef[]
  /** Textos del diseño por defecto en una zona con anillo: se arman curvos al crear el diseño (ver store). */
  ringTexts?: { top: string; bottom: string }
  /** Formas elegibles. Sin formas, el producto usa `surfaces`. */
  shapes?: readonly ProductShapeDef[]
  /** Cámara de la vista de producto, en coordenadas de mundo (el producto se apoya sobre la mesa). */
  camera: { position: Vec3; target: Vec3 }
  /** Radio (unidades de escena) que la vista de producto debe encuadrar completo. */
  frameRadius: number
  defaultDesign: Pick<DesignState, 'materialId' | 'surfaceId' | 'styleId' | 'elements'>
}

/** Mide el ancho de un texto en mm para una tipografía y altura de mayúscula dadas. */
export type MeasureText = (text: string, fontId: FontId, heightMm: number) => number

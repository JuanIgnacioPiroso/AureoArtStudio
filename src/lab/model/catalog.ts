import { textElement } from './elements'
import type { EngravingStyleDef, FontCategory, FontId, MaterialDef, ProductDef, ProductShapeDef, StyleId, SurfaceDef } from './types'

/** 1 unidad de escena = 100 mm. */
export const MM = 0.01

export const MATERIALS: Record<string, MaterialDef> = {
  'wood-light': {
    id: 'wood-light',
    name: 'Madera clara',
    kind: 'wood',
    color: '#C9A479',
    roughness: 0.72,
    metalness: 0,
    texture: 'wood-grain',
  },
  'wood-dark': {
    id: 'wood-dark',
    name: 'Madera oscura',
    kind: 'wood',
    color: '#6B4630',
    roughness: 0.62,
    metalness: 0,
    texture: 'wood-grain',
  },
  steel: {
    id: 'steel',
    name: 'Acero inoxidable',
    kind: 'steel',
    color: '#C9CCD0',
    roughness: 0.3,
    metalness: 1,
    texture: 'brushed',
  },
  'black-matte': {
    id: 'black-matte',
    name: 'Negro mate',
    kind: 'coated',
    color: '#2A2B2E',
    roughness: 0.7,
    metalness: 0,
    texture: 'matte',
  },
  gold: {
    id: 'gold',
    name: 'Dorado',
    kind: 'steel',
    color: '#D4B05A',
    roughness: 0.3,
    metalness: 1,
    texture: 'brushed',
  },
  'marble-white': {
    id: 'marble-white',
    name: 'Mármol blanco',
    kind: 'stone',
    color: '#ECEAE6',
    roughness: 0.35,
    metalness: 0,
    texture: 'marble',
  },
  'acrylic-clear': {
    id: 'acrylic-clear',
    name: 'Acrílico transparente',
    kind: 'glass',
    // Tono de la muestra y de la vista plana; en 3D el acrílico es incoloro.
    color: '#9DB4BE',
    roughness: 0.04,
    metalness: 0,
    texture: 'clear',
  },
  // Base del trofeo: no se elige ni se graba.
  'black-acrylic': {
    id: 'black-acrylic',
    name: 'Acrílico negro',
    kind: 'coated',
    color: '#141518',
    roughness: 0.25,
    metalness: 0,
    texture: 'matte',
  },
  // Plásticos fijos de los termos: no se eligen ni se graban.
  'black-plastic': {
    id: 'black-plastic',
    name: 'Plástico negro',
    kind: 'coated',
    color: '#1B1C1E',
    roughness: 0.6,
    metalness: 0,
    texture: 'matte',
  },
  'red-plastic': {
    id: 'red-plastic',
    name: 'Plástico rojo',
    kind: 'coated',
    color: '#C8231E',
    roughness: 0.45,
    metalness: 0,
    texture: 'matte',
  },
}

export const ENGRAVING_STYLES: Record<StyleId, EngravingStyleDef> = {
  burn: {
    id: 'burn',
    name: 'Quemado láser',
    description: 'Tono tostado que se lee sobre la veta.',
    kind: 'wood',
  },
  'mark-dark': {
    id: 'mark-dark',
    name: 'Marcado oscuro',
    description: 'Marca mate de alto contraste sobre el metal.',
    kind: 'steel',
  },
  frost: {
    id: 'frost',
    name: 'Esmerilado',
    description: 'Acabado claro y satinado, más sutil.',
    kind: 'steel',
  },
  reveal: {
    id: 'reveal',
    name: 'Grabado a metal',
    description: 'El láser retira la pintura y deja ver el acero.',
    kind: 'coated',
  },
  carve: {
    id: 'carve',
    name: 'Bajorrelieve',
    description: 'Letra hundida y oscura sobre la piedra.',
    kind: 'stone',
  },
  etch: {
    id: 'etch',
    name: 'Grabado esmerilado',
    description: 'Marca blanca y satinada dentro del acrílico.',
    kind: 'glass',
  },
}

export interface FontDef {
  id: FontId
  name: string
  category: FontCategory
  /** Familia CSS (cargada desde Google Fonts en index.html). */
  family: string
  weight: number
  /** Relación altura de mayúscula / tamaño de fuente estimada; en el navegador se mide (ver measure.ts). */
  capRatio: number
  /** Familia genérica de respaldo. */
  fallback: 'serif' | 'sans-serif' | 'cursive' | 'monospace'
}

export const FONT_CATEGORY_LABEL: Record<FontCategory, string> = {
  classic: 'Clásicas',
  display: 'Lapidarias',
  modern: 'Modernas',
  script: 'Caligráficas',
  technical: 'Técnicas',
}

const font = (id: FontId, name: string, category: FontCategory, family: string, weight: number, capRatio: number): FontDef => ({
  id,
  name,
  category,
  family: `"${family}"`,
  weight,
  capRatio,
  fallback: category === 'script' ? 'cursive' : category === 'technical' ? 'monospace' : category === 'modern' ? 'sans-serif' : 'serif',
})

export const FONTS: Record<FontId, FontDef> = {
  bodoni: font('bodoni', 'Bodoni', 'classic', 'Bodoni Moda', 500, 0.68),
  playfair: font('playfair', 'Playfair', 'classic', 'Playfair Display', 500, 0.71),
  cormorant: font('cormorant', 'Cormorant', 'classic', 'Cormorant Garamond', 600, 0.63),
  garamond: font('garamond', 'Garamond', 'classic', 'EB Garamond', 500, 0.65),
  baskerville: font('baskerville', 'Baskerville', 'classic', 'Libre Baskerville', 400, 0.77),
  cinzel: font('cinzel', 'Cinzel', 'display', 'Cinzel', 500, 0.7),
  'cinzel-deco': font('cinzel-deco', 'Cinzel Decorative', 'display', 'Cinzel Decorative', 400, 0.7),
  abril: font('abril', 'Abril Fatface', 'display', 'Abril Fatface', 400, 0.7),
  bebas: font('bebas', 'Bebas Neue', 'display', 'Bebas Neue', 400, 0.7),
  oswald: font('oswald', 'Oswald', 'display', 'Oswald', 500, 0.81),
  grotesk: font('grotesk', 'Hanken Grotesk', 'modern', 'Hanken Grotesk', 500, 0.7),
  montserrat: font('montserrat', 'Montserrat', 'modern', 'Montserrat', 500, 0.7),
  josefin: font('josefin', 'Josefin Sans', 'modern', 'Josefin Sans', 500, 0.75),
  raleway: font('raleway', 'Raleway', 'modern', 'Raleway', 500, 0.71),
  script: font('script', 'Pinyon Script', 'script', 'Pinyon Script', 400, 0.62),
  'great-vibes': font('great-vibes', 'Great Vibes', 'script', 'Great Vibes', 400, 0.6),
  dancing: font('dancing', 'Dancing Script', 'script', 'Dancing Script', 500, 0.72),
  allura: font('allura', 'Allura', 'script', 'Allura', 400, 0.6),
  'space-mono': font('space-mono', 'Space Mono', 'technical', 'Space Mono', 400, 0.7),
}

const knifeBlade: SurfaceDef = {
  id: 'blade',
  name: 'Hoja',
  part: 'blade',
  position: [0.95, 0.02, 0.0125],
  orientation: [0, 0, 0],
  widthMm: 120,
  heightMm: 22,
  depthMm: 2,
  curved: false,
  sizeRange: [3, 12],
  cameraOffset: [0, -0.55, 1.55],
}

const knifeHandle: SurfaceDef = {
  id: 'handle',
  name: 'Mango',
  part: 'handle',
  position: [-0.64, 0, 0.1],
  orientation: [0, 0, 0],
  widthMm: 80,
  heightMm: 15,
  depthMm: 16,
  curved: true,
  sizeRange: [3, 10],
  cameraOffset: [0, -0.5, 1.3],
}

const boardFace: SurfaceDef = {
  id: 'face',
  name: 'Cara principal',
  part: 'body',
  position: [0.3, 0, 0.11],
  orientation: [0, 0, 0],
  widthMm: 270,
  heightMm: 170,
  depthMm: 6,
  curved: false,
  sizeRange: [8, 50],
  cameraOffset: [0, -1.3, 3.3],
}

/**
 * Frente de un termo parado (Ø 90 mm): la Z local de la zona apunta hacia -Y, con la
 * manija al costado. El centro va 5,75 mm hacia adentro para que la caja del decal (16 mm) abarque
 * también los bordes laterales, que por la curvatura quedan 11,5 mm detrás del frente.
 */
function thermosFront(centerZ: number): SurfaceDef {
  return {
    id: 'front',
    name: 'Frente',
    part: 'body',
    position: [0, -(0.45 - 0.0575), centerZ],
    orientation: [Math.PI / 2, 0, 0],
    widthMm: 60,
    heightMm: 120,
    depthMm: 16,
    curved: true,
    sizeRange: [5, 20],
    cameraOffset: [0, 0.35, 2.3],
  }
}

/**
 * Vuelta completa de un termo (Ø 90 mm): tira de 250 × 120 mm centrada en el lado opuesto a la
 * manija, con los dos bordes detrás de ella. handleSide: +1 = manija en +X, −1 = manija en −X.
 * El frente (-Y) queda a un cuarto de vuelta del centro de la tira: 282,74 / 4 ≈ 70,7 mm.
 */
function thermosWrap(centerZ: number, handleSide: 1 | -1): SurfaceDef {
  const centerAngle = handleSide === 1 ? Math.PI : 0
  return {
    id: 'wrap',
    name: 'Vuelta completa',
    part: 'body',
    position: [-handleSide * 0.45, 0, centerZ],
    // Como el frente, pero girado sobre el eje del termo hasta mirar al centro de la tira.
    orientation: [Math.PI / 2, centerAngle + Math.PI / 2, 0],
    widthMm: 250,
    heightMm: 120,
    // No se usa: la tira no se proyecta con un decal.
    depthMm: 0,
    curved: true,
    sizeRange: [5, 20],
    cameraOffset: [0, 0.35, 2.3],
    wrap: { radiusMm: 45, centerAngle, frontOffsetMm: handleSide * 70.7 },
  }
}

/** Chapa de la placa sobre base: 170 × 120 mm, con 10 mm de margen. Su cara está a 10 mm de la mesa. */
const plaqueBasePlate: SurfaceDef = {
  id: 'plate',
  name: 'Chapa',
  part: 'plate',
  position: [0, 0, 0.1],
  orientation: [0, 0, 0],
  widthMm: 150,
  heightMm: 100,
  depthMm: 2,
  curved: false,
  sizeRange: [3, 20],
  cameraOffset: [0, -0.75, 1.9],
}

/** Frente de la placa de pared: 360 × 260 mm, sin pisar los tornillos de las esquinas. */
const plaqueWallFront: SurfaceDef = {
  id: 'front',
  name: 'Frente',
  part: 'plate',
  position: [0, 0, 0.03],
  orientation: [0, 0, 0],
  widthMm: 360,
  heightMm: 260,
  depthMm: 4,
  curved: false,
  sizeRange: [5, 40],
  cameraOffset: [0, -1.7, 4.4],
}

/**
 * Caras de la chapita parada (50 × 28 mm, 1 mm de espesor). La zona de 40 × 20 mm se corre 3 mm
 * hacia el lado opuesto al agujero. La caja del decal (0,8 mm) toma sólo la cara de su lado.
 * side: -1 = frente (mira hacia -Y), +1 = dorso (girado 180° sobre el eje vertical).
 */
function dogTagFace(side: 1 | -1): SurfaceDef {
  return {
    id: side === -1 ? 'front' : 'back',
    name: side === -1 ? 'Frente' : 'Dorso',
    part: 'tag',
    position: [0.03, side * 0.005, 0.14],
    orientation: [Math.PI / 2, side === -1 ? 0 : Math.PI, 0],
    widthMm: 40,
    heightMm: 20,
    depthMm: 0.8,
    curved: false,
    sizeRange: [2.5, 8],
    cameraOffset: [0, 0.3, 1],
  }
}

/**
 * Frente del trofeo parado: la placa (150 × 200 mm, 10 mm de espesor) arranca a 20 mm de la mesa.
 * Cada forma tiene su zona, con al menos 10 mm de margen dentro de la silueta y sobre la base.
 * centerMm: altura del centro de la zona desde el borde de abajo de la placa.
 */
function trophyFront(widthMm: number, heightMm: number, centerMm: number): SurfaceDef {
  return {
    id: 'front',
    name: 'Frente',
    part: 'plate',
    position: [0, -0.05, 0.2 + centerMm * MM],
    orientation: [Math.PI / 2, 0, 0],
    widthMm,
    heightMm,
    // Menos que el espesor: el decal no toca la cara de atrás.
    depthMm: 4,
    curved: false,
    sizeRange: [3, 20],
    cameraOffset: [0, 0.3, 2.2],
  }
}

const trophyShapes: ProductShapeDef[] = [
  // Ochavas de 35 mm: la zona de 120 × 120 mm deja 10 mm hasta los cortes.
  { id: 'octagon', name: 'Octógono', surfaces: [trophyFront(120, 120, 105)] },
  { id: 'rectangle', name: 'Rectángulo', surfaces: [trophyFront(130, 170, 105)] },
  // La zona termina donde el arco ya está 10 mm por encima de sus esquinas.
  { id: 'arch', name: 'Arco', surfaces: [trophyFront(120, 130, 85)] },
  // La gota se angosta hacia arriba: la zona queda en la parte ancha.
  { id: 'flame', name: 'Gota', surfaces: [trophyFront(90, 90, 65)] },
]

/** Diseño inicial de los termos: un nombre y una frase, centrados. */
const thermosElements = (prefix: string) => [
  textElement({ id: `${prefix}-name`, text: 'Lucas', fontId: 'great-vibes', sizeMm: 16, y: 10 }),
  textElement({ id: `${prefix}-phrase`, text: 'Mateando desde 2026', fontId: 'montserrat', sizeMm: 3.6, y: -9 }),
]

/** Sólo el cuerpo toma el acabado elegido; base y vaso son de acero y el resto, de plástico. */
const thermosBody = { id: 'body', name: 'Cuerpo', fixedMaterialId: null }
const thermosBase = { id: 'base', name: 'Base', fixedMaterialId: 'steel' }
const thermosHandle = { id: 'handle', name: 'Manija', fixedMaterialId: 'black-plastic' }

export const PRODUCTS: readonly ProductDef[] = [
  {
    id: 'knife',
    name: 'Cuchillo con mango de madera',
    description: 'Hoja de acero de 20 cm y mango de madera. Se graba en la hoja o en el mango.',
    modelId: 'knife-v1',
    parts: [
      { id: 'blade', name: 'Hoja', fixedMaterialId: 'steel' },
      { id: 'handle', name: 'Mango', fixedMaterialId: null },
    ],
    selectablePart: 'handle',
    materialIds: ['wood-light', 'wood-dark'],
    surfaces: [knifeBlade, knifeHandle],
    camera: { position: [0.37, 3.3, 2.7], target: [0.37, 0, 0.05] },
    frameRadius: 1.78,
    defaultDesign: {
      materialId: 'wood-dark',
      surfaceId: 'blade',
      styleId: 'mark-dark',
      elements: [
        textElement({ id: 'knife-name', text: 'Martín', fontId: 'bodoni', sizeMm: 8, y: 4 }),
        textElement({ id: 'knife-date', text: '14 · 10 · 2026', fontId: 'bodoni', sizeMm: 4.4, y: -5.8 }),
      ],
    },
  },
  {
    id: 'board',
    name: 'Tabla de madera',
    description: 'Tabla de 40 × 24 cm con manija calada. Se graba en la cara principal.',
    modelId: 'board-v1',
    parts: [{ id: 'body', name: 'Tabla', fixedMaterialId: null }],
    selectablePart: 'body',
    materialIds: ['wood-light', 'wood-dark'],
    surfaces: [boardFace],
    camera: { position: [0, 4.3, 3.4], target: [0, 0, 0.1] },
    frameRadius: 2.25,
    defaultDesign: {
      materialId: 'wood-light',
      surfaceId: 'face',
      styleId: 'burn',
      elements: [
        textElement({ id: 'board-name', text: 'Familia Ríos', fontId: 'cinzel', sizeMm: 24, y: 12 }),
        textElement({ id: 'board-since', text: 'Desde 1998', fontId: 'cinzel', sizeMm: 13.2, y: -17.4 }),
      ],
    },
  },
  {
    id: 'thermos-handle',
    name: 'Termo 1 L con manija',
    description: 'Termo de 1 L con tapa-vaso de acero y manija lateral. Se graba en el frente.',
    modelId: 'thermos-handle-v1',
    parts: [thermosBody, thermosBase, { id: 'cup', name: 'Vaso', fixedMaterialId: 'steel' }, thermosHandle],
    selectablePart: 'body',
    materialIds: ['steel', 'black-matte'],
    surfaces: [thermosFront(1.3), thermosWrap(1.3, 1)],
    camera: { position: [1, 3.7, 6.8], target: [0, 1.65, 0] },
    frameRadius: 1.85,
    defaultDesign: {
      materialId: 'steel',
      surfaceId: 'front',
      styleId: 'mark-dark',
      elements: thermosElements('thermos-handle'),
    },
  },
  {
    id: 'thermos-half',
    name: 'Termo media manija',
    description: 'Termo con asa en L, tapa negra y pico cebador. Se graba en el frente.',
    modelId: 'thermos-half-v1',
    parts: [
      thermosBody,
      thermosBase,
      { id: 'cap', name: 'Tapa', fixedMaterialId: 'black-plastic' },
      { id: 'spout', name: 'Pico cebador', fixedMaterialId: 'red-plastic' },
      thermosHandle,
    ],
    selectablePart: 'body',
    materialIds: ['steel', 'black-matte'],
    surfaces: [thermosFront(1.27), thermosWrap(1.27, -1)],
    camera: { position: [1, 3.5, 6.8], target: [0, 1.5, 0] },
    frameRadius: 1.75,
    defaultDesign: {
      materialId: 'black-matte',
      surfaceId: 'front',
      styleId: 'reveal',
      elements: thermosElements('thermos-half'),
    },
  },
  {
    id: 'plaque-base',
    name: 'Placa sobre base de madera',
    description: 'Chapa de 17 × 12 cm sobre una base de madera de 20 × 15 cm. Se graba en la chapa.',
    modelId: 'plaque-base-v1',
    parts: [
      { id: 'plate', name: 'Chapa', fixedMaterialId: null },
      { id: 'base', name: 'Base', fixedMaterialId: 'wood-dark' },
    ],
    selectablePart: 'plate',
    materialIds: ['gold', 'steel'],
    surfaces: [plaqueBasePlate],
    camera: { position: [0, 3.4, 2.7], target: [0, 0, 0.05] },
    frameRadius: 1.3,
    defaultDesign: {
      materialId: 'gold',
      surfaceId: 'plate',
      styleId: 'mark-dark',
      elements: [
        textElement({ id: 'plaque-base-title', text: 'En reconocimiento a', fontId: 'montserrat', sizeMm: 5, y: 30 }),
        textElement({ id: 'plaque-base-name', text: 'Laura Méndez', fontId: 'cinzel', sizeMm: 12, y: 13 }),
        textElement({ id: 'plaque-base-text', text: 'Por su dedicación y compromiso', fontId: 'montserrat', sizeMm: 5, y: -8 }),
        textElement({ id: 'plaque-base-date', text: 'Buenos Aires · 2026', fontId: 'montserrat', sizeMm: 4, y: -30 }),
      ],
    },
  },
  {
    id: 'plaque-wall',
    name: 'Placa de pared',
    description: 'Placa de 40 × 30 cm en acero o mármol, con tornillos en las esquinas. Se graba en el frente.',
    modelId: 'plaque-wall-v1',
    parts: [
      { id: 'plate', name: 'Placa', fixedMaterialId: null },
      { id: 'screws', name: 'Tornillos', fixedMaterialId: 'steel' },
    ],
    selectablePart: 'plate',
    materialIds: ['steel', 'marble-white'],
    surfaces: [plaqueWallFront],
    camera: { position: [0, 5.2, 4.1], target: [0, 0, 0.05] },
    frameRadius: 2.55,
    defaultDesign: {
      materialId: 'steel',
      surfaceId: 'front',
      styleId: 'mark-dark',
      elements: [
        textElement({ id: 'plaque-wall-name', text: 'Biblioteca Popular', fontId: 'cinzel', sizeMm: 20, y: 22 }),
        textElement({ id: 'plaque-wall-date', text: 'Inaugurada el 24 de octubre de 2026', fontId: 'montserrat', sizeMm: 9, y: -22 }),
      ],
    },
  },
  {
    id: 'dog-tag',
    name: 'Chapita identificatoria',
    description: 'Chapita de acero de 5 × 2,8 cm con cadena de bolitas. Se graba en el frente o en el dorso.',
    modelId: 'dog-tag-v1',
    parts: [
      { id: 'tag', name: 'Chapita', fixedMaterialId: null },
      { id: 'chain', name: 'Cadena', fixedMaterialId: 'steel' },
    ],
    selectablePart: 'tag',
    materialIds: ['steel'],
    surfaces: [dogTagFace(-1), dogTagFace(1)],
    camera: { position: [0.3, 0.75, 1.6], target: [0, 0.12, 0] },
    frameRadius: 0.5,
    defaultDesign: {
      materialId: 'steel',
      surfaceId: 'front',
      styleId: 'mark-dark',
      elements: [textElement({ id: 'dog-tag-name', text: 'Tomás Ruiz', fontId: 'oswald', sizeMm: 5.5, y: 0 })],
    },
  },
  {
    id: 'trophy',
    name: 'Trofeo de acrílico',
    description: 'Placa de acrílico transparente de 15 × 20 cm sobre una base negra. Se graba en el frente.',
    modelId: 'trophy-v1',
    parts: [
      { id: 'plate', name: 'Placa', fixedMaterialId: null },
      { id: 'base', name: 'Base', fixedMaterialId: 'black-acrylic' },
    ],
    selectablePart: 'plate',
    materialIds: ['acrylic-clear'],
    // Las zonas que usan los lugares que no conocen las formas: las del octógono.
    surfaces: trophyShapes[0]!.surfaces,
    shapes: trophyShapes,
    camera: { position: [0.8, 2.6, 5.5], target: [0, 1.1, 0] },
    frameRadius: 1.3,
    defaultDesign: {
      materialId: 'acrylic-clear',
      surfaceId: 'front',
      styleId: 'etch',
      elements: [
        textElement({ id: 'trophy-title', text: 'Premio a la excelencia', fontId: 'montserrat', sizeMm: 6, y: 32 }),
        textElement({ id: 'trophy-name', text: 'Laura Méndez', fontId: 'cinzel', sizeMm: 10, y: 8 }),
        textElement({ id: 'trophy-year', text: '2026', fontId: 'montserrat', sizeMm: 7, y: -22 }),
      ],
    },
  },
]

export function getProduct(id: string): ProductDef {
  const p = PRODUCTS.find((x) => x.id === id)
  if (!p) throw new Error(`Producto desconocido: ${id}`)
  return p
}

/** Forma efectiva: la del diseño si existe en el producto; si no, la primera. Null si el producto no tiene formas. */
export function getShape(product: ProductDef, shapeId: string | undefined): ProductShapeDef | null {
  if (!product.shapes?.length) return null
  return product.shapes.find((s) => s.id === shapeId) ?? product.shapes[0]!
}

/** Zonas del producto para la forma elegida. */
export function surfacesOf(product: ProductDef, shapeId: string | undefined): readonly SurfaceDef[] {
  return getShape(product, shapeId)?.surfaces ?? product.surfaces
}

/** Zona del producto (en la forma elegida, si tiene formas); si no existe, la primera. */
export function getSurface(product: ProductDef, surfaceId: string, shapeId?: string): SurfaceDef {
  const surfaces = surfacesOf(product, shapeId)
  return surfaces.find((s) => s.id === surfaceId) ?? surfaces[0]!
}

/** Material efectivo de una parte: fijo o el elegido por el usuario. */
export function partMaterial(product: ProductDef, partId: string, chosenMaterialId: string): MaterialDef {
  const part = product.parts.find((p) => p.id === partId)
  const id = part?.fixedMaterialId ?? chosenMaterialId
  const m = MATERIALS[id]
  if (!m) throw new Error(`Material desconocido: ${id}`)
  return m
}

/** Estilos de grabado compatibles con el material que tiene la superficie. */
export function stylesForSurface(product: ProductDef, surface: SurfaceDef, materialId: string): EngravingStyleDef[] {
  const kind = partMaterial(product, surface.part, materialId).kind
  return Object.values(ENGRAVING_STYLES).filter((s) => s.kind === kind)
}

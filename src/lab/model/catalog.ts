import { textElement } from './elements'
import type { EngravingStyleDef, FontCategory, FontId, MaterialDef, ProductDef, StyleId, SurfaceDef } from './types'

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
    surfaces: [thermosFront(1.3)],
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
    surfaces: [thermosFront(1.27)],
    camera: { position: [1, 3.5, 6.8], target: [0, 1.5, 0] },
    frameRadius: 1.75,
    defaultDesign: {
      materialId: 'black-matte',
      surfaceId: 'front',
      styleId: 'reveal',
      elements: thermosElements('thermos-half'),
    },
  },
]

export function getProduct(id: string): ProductDef {
  const p = PRODUCTS.find((x) => x.id === id)
  if (!p) throw new Error(`Producto desconocido: ${id}`)
  return p
}

export function getSurface(product: ProductDef, surfaceId: string): SurfaceDef {
  return product.surfaces.find((s) => s.id === surfaceId) ?? product.surfaces[0]!
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

import { ENGRAVING_STYLES, MATERIALS, PRODUCTS, partMaterial } from '../lab/model/catalog'
import type { EngravingStyleDef, ProductDef } from '../lab/model/types'
import { IMAGES, type SiteImage } from './site'

export const MATERIALS_SEO = {
  title: 'Grabado láser por material: madera, acero, vidrio y cuero',
  description:
    'Cómo toma el grabado láser cada material: madera, acero, alpaca, vidrio, acrílico, mármol y cuero. Qué tono y contraste deja en cada uno.',
}

export type LaserId = 'fibra' | 'co2'

/** Equipos del taller, para la guía de materiales y la sección de corte. */
export const LASERS: Record<LaserId, { name: string; text: string }> = {
  fibra: {
    name: 'Láser de fibra',
    text: 'Marca metales: acero inoxidable, alpaca, chapa dorada o plateada, bronce y metal pintado. Deja una línea muy fina, sin sacar material.',
  },
  co2: {
    name: 'Láser CO₂',
    text: 'Graba madera, MDF, cuero, vidrio, acrílico, mármol y granito, y corta acrílico, MDF y madera a medida.',
  },
}

export interface MaterialGuide {
  /** id del ancla: /materiales/#acero */
  id: string
  name: string
  /** Materiales del catálogo que entran en esta sección. */
  materialIds: readonly string[]
  /** Qué le hace el láser al material (verbo concreto: tuesta, oxida, retira la pintura, microfractura…). */
  process: string
  /** Cómo se ve la marca terminada. */
  result: string
  /** Equipo con el que se graba: fibra para los metales, CO₂ para el resto (SPEC 26). */
  laser: LaserId
  /** Pendiente del taller: tamaño mínimo de letra legible, p. ej. "2 mm de alto de mayúscula". */
  minTextHeight: string | null
  /** Pendiente del taller: cómo cuidar la pieza. */
  care: string | null
  image: SiteImage | null
}

/**
 * Secciones de la guía. Los textos son borradores para validar con el taller (ver README). Quedan afuera los
 * materiales que el Lab no graba: hilo, plásticos, la calabaza del interior de los mates y la base del trofeo.
 */
export const MATERIAL_GUIDES: readonly MaterialGuide[] = [
  {
    id: 'madera',
    name: 'Madera',
    materialIds: ['wood-light', 'wood-dark'],
    process: 'El láser tuesta la capa de arriba de la madera, sin tinta.',
    result: 'Un tono marrón cálido que sigue la veta; en maderas claras contrasta más que en las oscuras.',
    laser: 'co2',
    minTextHeight: null,
    care: null,
    image: IMAGES.caja,
  },
  {
    id: 'acero',
    name: 'Acero inoxidable, alpaca y dorado',
    materialIds: ['steel', 'alpaca', 'gold'],
    process: 'El láser oxida la superficie del metal (marcado oscuro) o la vuelve mate (esmerilado), sin sacar material.',
    result: 'Una marca fina y de alto contraste, o una más sutil y satinada.',
    laser: 'fibra',
    minTextHeight: null,
    care: null,
    image: IMAGES.mate,
  },
  {
    id: 'metal-pintado',
    name: 'Metal pintado',
    materialIds: ['black-matte'],
    process: 'El láser retira la pintura y deja ver el metal de abajo.',
    result: 'Una marca plateada y brillante sobre el negro mate.',
    laser: 'fibra',
    minTextHeight: null,
    care: null,
    image: IMAGES.termo,
  },
  {
    id: 'vidrio',
    name: 'Vidrio y acrílico transparente',
    materialIds: ['glass-clear', 'acrylic-clear'],
    process: 'El láser microfractura la superficie.',
    result: 'Una marca blanca y satinada, como un esmerilado.',
    laser: 'co2',
    minTextHeight: null,
    care: null,
    image: IMAGES.copas,
  },
  {
    id: 'marmol',
    name: 'Mármol',
    materialIds: ['marble-white'],
    process: 'El láser hunde apenas la piedra.',
    result: 'Una letra hundida y más oscura que la piedra.',
    laser: 'co2',
    minTextHeight: null,
    care: null,
    image: IMAGES.hungria,
  },
  {
    id: 'cuero',
    name: 'Cuero',
    materialIds: ['leather-black', 'leather-brown', 'leather-tan'],
    process: 'El láser quema y hunde apenas la flor del cuero.',
    result: 'Una marca más oscura que el cuero, que se nota al tacto.',
    laser: 'co2',
    minTextHeight: null,
    care: null,
    image: IMAGES.leather,
  },
]

/** Estilos del Lab que corresponden a la sección (por el MaterialKind de sus materiales). */
export function stylesFor(g: MaterialGuide): EngravingStyleDef[] {
  const kinds = new Set(g.materialIds.map((id) => MATERIALS[id]?.kind))
  return Object.values(ENGRAVING_STYLES).filter((s) => kinds.has(s.kind))
}

/**
 * Productos del Lab que graban alguno de los materiales de la sección: alguna de sus zonas (de cualquier forma)
 * cae sobre ese material. En los mates de cuero se graba la virola, así que van en la sección del acero.
 */
export function productsFor(g: MaterialGuide): ProductDef[] {
  const ids = new Set(g.materialIds)
  return PRODUCTS.filter((p) => {
    const surfaces = [...p.surfaces, ...(p.shapes ?? []).flatMap((s) => s.surfaces)]
    return surfaces.some((s) => p.materialIds.some((m) => ids.has(partMaterial(p, s.part, m).id)))
  })
}

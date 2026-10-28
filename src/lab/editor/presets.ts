import { layoutText } from '../model/constraints'
import { shapeElement, textElement } from '../model/elements'
import { LINE_GAP_RATIO, SECONDARY_RATIO, stackedTextElements } from '../model/legacy'
import type { DesignElement, DesignState, MeasureText, RingDef, SurfaceDef, TextElement } from '../model/types'

function initials(text: string): string {
  const parts = text
    .replace(/\[.*?\]/g, '')
    .split(/\s+/)
    .filter(Boolean)
  return parts.length ? parts.map((p) => p[0]!.toUpperCase()).join(' · ') : 'A · M'
}

const DATE_PARTS = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'numeric', year: 'numeric' })

/** Fecha de hoy con el separador de grabado (día · mes · año), en el orden del locale. */
function today(): string {
  return DATE_PARTS.formatToParts(new Date())
    .filter((p) => p.type !== 'literal')
    .map((p) => p.value)
    .join(' · ')
}

/** Primer texto que escribió el usuario, para reutilizarlo en la plantilla. */
function firstText(d: DesignState): string {
  for (const el of d.elements) if (el.kind === 'text' && el.text.trim()) return el.text.split('\n')[0]!.trim()
  return ''
}

/** Tamaño de la línea principal que entra holgado en la zona. */
function fitSize(text: string, ratio: number, surface: SurfaceDef, measure: MeasureText, font: Parameters<MeasureText>[1]) {
  const byWidth = (surface.widthMm * 0.85) / Math.max(0.1, measure(text, font, 1))
  return Math.max(surface.sizeRange[0], Math.min(surface.sizeRange[1], surface.heightMm * ratio, byWidth))
}

/** Texto curvo concéntrico con el centro de la zona: arco necesario para el radio pedido y centro del círculo en el origen. */
function ringText(text: string, sizeMm: number, radius: number, dir: 1 | -1, measure: MeasureText) {
  const el = textElement({ text, fontId: 'cinzel', sizeMm, letterSpacing: 0.15 })
  const width = measure(text, el.fontId, sizeMm) + el.letterSpacing * sizeMm * (Array.from(text).length - 1)
  const arched = { ...el, arc: dir * Math.min(220, Math.max(2, Math.round((width / radius) * (180 / Math.PI)))) }
  const pivot = layoutText(arched, measure).arcCenter
  return { ...arched, y: pivot ? -pivot.y : 0 }
}

/**
 * Dos textos curvos centrados en el ancho del anillo: uno arriba y otro abajo. Los usan «Sello»
 * y el diseño por defecto de los mates con virola. `ids` fija los id (el diseño por defecto los necesita estables).
 */
export function ringTextElements(top: string, bottom: string, ring: RingDef, measure: MeasureText, ids?: [string, string]): TextElement[] {
  const ro = ring.outerMm / 2
  const ri = ring.innerMm / 2
  const size = (ro - ri) * 0.38
  const mid = (ro + ri) / 2
  // Arriba la línea base va por dentro (las letras crecen hacia afuera); abajo, al revés.
  const a = ringText(top, size, mid - size / 2, 1, measure)
  const b = ringText(bottom, size, mid + size / 2, -1, measure)
  return ids ? [{ ...a, id: ids[0] }, { ...b, id: ids[1] }] : [a, b]
}

/**
 * «Sello» sobre un anillo (la boca de una virola): un círculo fino en cada borde, el texto
 * curvo arriba y el año abajo. Sin monograma: el centro es la boca.
 */
function ringSeal(name: string, ring: RingDef, measure: MeasureText): DesignElement[] {
  const ro = ring.outerMm / 2
  const ri = ring.innerMm / 2
  const band = ro - ri
  const stroke = Math.max(0.3, band * 0.03)
  const inset = band * 0.12
  const outer = shapeElement('ellipse', { widthMm: (ro - inset) * 2, heightMm: (ro - inset) * 2, strokeMm: stroke })
  const inner = shapeElement('ellipse', { widthMm: (ri + inset) * 2, heightMm: (ri + inset) * 2, strokeMm: stroke })
  return [outer, inner, ...ringTextElements(name, String(new Date().getFullYear()), ring, measure)]
}

export interface Preset {
  id: string
  name: string
  /** Algunas plantillas necesitan una zona con cierto alto para leerse. */
  available: (surface: SurfaceDef) => boolean
  build: (d: DesignState, surface: SurfaceDef, measure: MeasureText) => DesignElement[]
}

/** Puntos de partida rápidos; reutilizan el texto que ya escribió el usuario. */
export const PRESETS: readonly Preset[] = [
  {
    id: 'name-date',
    name: 'Nombre y fecha',
    available: () => true,
    build: (d, surface, measure) => {
      const name = firstText(d) || 'Nombre'
      const size = fitSize(name, 0.36, surface, measure, 'bodoni')
      return stackedTextElements(
        { fontId: 'bodoni', align: 'center', size, lines: [{ text: name, role: 'primary' }, { text: today(), role: 'secondary' }] },
        surface,
        measure,
      )
    },
  },
  {
    id: 'initials',
    name: 'Iniciales',
    available: () => true,
    build: (d, surface, measure) => {
      const text = initials(firstText(d))
      return [textElement({ text, fontId: 'cinzel', sizeMm: fitSize(text, 0.55, surface, measure, 'cinzel') })]
    },
  },
  {
    id: 'dedication',
    name: 'Dedicatoria',
    available: () => true,
    build: (d, surface, measure) => {
      const text = `Para ${(firstText(d) || 'vos').replace(/^Para\s+/i, '')}`
      const size = fitSize(text, 0.4, surface, measure, 'script')
      return stackedTextElements(
        { fontId: 'script', align: 'center', size, lines: [{ text, role: 'primary' }, { text: 'con cariño', role: 'secondary' }] },
        surface,
        measure,
      )
    },
  },
  {
    id: 'recognition',
    name: 'Reconocimiento',
    // Cuatro líneas necesitan alto: placas y trofeos, no la chapita ni el cuchillo.
    available: (surface) => surface.heightMm >= 80,
    build: (d, surface, measure) => {
      const fixed = ['En reconocimiento a', 'Por su dedicación y compromiso']
      // El nombre es el primer texto del usuario; se saltean las líneas fijas de la plantilla.
      const name =
        d.elements
          .flatMap((el) => (el.kind === 'text' ? [el.text.split('\n')[0]!.trim()] : []))
          .find((t) => t && !fixed.includes(t)) || 'Nombre y apellido'
      const secondary = [fixed[0]!, fixed[1]!, today()]
      // Todo el bloque (4 líneas: 1 + 3 × 0,55 de alto y 3 espacios de 0,45) en el 85 % de la zona.
      const byHeight = (surface.heightMm * 0.85) / (1 + 3 * SECONDARY_RATIO + 3 * LINE_GAP_RATIO)
      const byWidth = Math.min(
        ...secondary.map((t) => (surface.widthMm * 0.85) / Math.max(0.1, measure(t, 'cinzel', SECONDARY_RATIO))),
      )
      const size = Math.min(fitSize(name, 0.3, surface, measure, 'cinzel'), byHeight, byWidth)
      return stackedTextElements(
        {
          fontId: 'cinzel',
          align: 'center',
          size,
          lines: [
            { text: secondary[0]!, role: 'secondary' },
            { text: name, role: 'primary' },
            { text: secondary[1]!, role: 'secondary' },
            { text: secondary[2]!, role: 'secondary' },
          ],
        },
        surface,
        measure,
      )
    },
  },
  {
    id: 'seal',
    name: 'Sello',
    // Un sello circular necesita alto: en zonas angostas el texto curvo no se leería.
    available: (surface) => surface.heightMm >= 60,
    build: (d, surface, measure) => {
      const name = (firstText(d) || 'Hecho a mano').toUpperCase()
      if (surface.ring) return ringSeal(name, surface.ring, measure)
      const diameter = Math.min(surface.widthMm, surface.heightMm) * 0.9
      const stroke = Math.max(0.6, diameter * 0.012)
      const textSize = diameter * 0.075
      const ring = shapeElement('ellipse', { widthMm: diameter, heightMm: diameter, strokeMm: stroke })
      const inner = shapeElement('ellipse', { widthMm: diameter * 0.66, heightMm: diameter * 0.66, strokeMm: stroke * 0.6 })
      // Arriba la línea base va por dentro (las letras crecen hacia afuera); abajo, al revés.
      const arched = ringText(name, textSize, diameter / 2 - stroke * 2 - textSize * 1.1, 1, measure)
      const year = ringText(String(new Date().getFullYear()), textSize, diameter / 2 - stroke * 2 - textSize * 0.25, -1, measure)
      const mono = initials(firstText(d)).replace(/ · /g, '').slice(0, 3)
      const center = textElement({ text: mono || 'AU', fontId: 'cinzel-deco', sizeMm: diameter * 0.16 })
      return [ring, inner, arched, center, year]
    },
  },
]

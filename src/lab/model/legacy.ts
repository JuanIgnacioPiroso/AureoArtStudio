import { z } from 'zod'
import { getProduct, getSurface, PRODUCTS } from './catalog'
import { textElement } from './elements'
import { ALIGNS, STYLE_IDS, type Align, type DesignState, type FontId, type MeasureText, type SurfaceDef, type TextElement } from './types'

/** Tipografías del formato v1 (antes de ampliar el catálogo). */
const V1_FONTS = ['bodoni', 'cinzel', 'script', 'grotesk'] as const

/** Proporciones del bloque de dos líneas del formato v1 (y de las propuestas del asistente). */
export const SECONDARY_RATIO = 0.55
export const LINE_GAP_RATIO = 0.45

/** Diseño v1: 1–2 líneas en un bloque, con posición normalizada. Sólo se lee para migrar enlaces viejos. */
export const LegacyDesignV1Schema = z.object({
  v: z.literal(1),
  productId: z.string(),
  materialId: z.string(),
  surfaceId: z.string(),
  lines: z
    .array(z.object({ text: z.string().max(40), role: z.enum(['primary', 'secondary']) }))
    .min(1)
    .max(2),
  fontId: z.enum(V1_FONTS),
  align: z.enum(ALIGNS),
  size: z.number().positive(),
  rotation: z.number(),
  offset: z.object({ u: z.number().min(-1).max(1), v: z.number().min(-1).max(1) }),
  styleId: z.enum(STYLE_IDS),
  notes: z.string().max(500),
  source: z.enum(['manual', 'ai']),
})
export type LegacyDesignV1 = z.infer<typeof LegacyDesignV1Schema>

export interface StackedLines {
  lines: readonly { text: string; role: 'primary' | 'secondary' }[]
  fontId: FontId
  align: Align
  /** Altura de la línea principal, en mm. */
  size: number
  rotation?: number
  /** Desplazamiento normalizado (−1..1) dentro del espacio libre de la zona. */
  offset?: { u: number; v: number }
}

/**
 * Convierte un bloque de líneas (formato v1 o propuesta del asistente) en capas de texto
 * sueltas que reproducen exactamente la misma composición.
 */
export function stackedTextElements(block: StackedLines, surface: SurfaceDef, measure: MeasureText): TextElement[] {
  const lines = block.lines.map((l) => ({ ...l, text: l.text.trim() })).filter((l) => l.text)
  if (!lines.length) return []
  const rotation = block.rotation ?? 0
  const offset = block.offset ?? { u: 0, v: 0 }
  const laid = lines.map((l) => {
    const h = l.role === 'primary' ? block.size : block.size * SECONDARY_RATIO
    return { ...l, h, w: measure(l.text, block.fontId, h) }
  })
  const width = Math.max(...laid.map((l) => l.w))
  const height = laid.reduce((acc, l, i) => acc + l.h + (i > 0 ? block.size * LINE_GAP_RATIO : 0), 0)

  const r = (rotation * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  const boundsW = width * Math.abs(c) + height * Math.abs(s)
  const boundsH = width * Math.abs(s) + height * Math.abs(c)
  const cx = offset.u * (Math.max(0, surface.widthMm - boundsW) / 2)
  const cy = offset.v * (Math.max(0, surface.heightMm - boundsH) / 2)

  let cursor = height / 2
  return laid.map((l, i) => {
    if (i > 0) cursor -= block.size * LINE_GAP_RATIO
    const ly = cursor - l.h / 2
    cursor -= l.h
    const lx = block.align === 'left' ? -width / 2 + l.w / 2 : block.align === 'right' ? width / 2 - l.w / 2 : 0
    return textElement({
      text: l.text,
      fontId: block.fontId,
      sizeMm: Math.round(l.h * 10) / 10,
      align: block.align,
      x: cx + lx * c - ly * s,
      y: cy + lx * s + ly * c,
      rotation,
    })
  })
}

/** Migra un diseño v1 al formato de capas. */
export function migrateV1(d: LegacyDesignV1, measure: MeasureText): DesignState {
  const product = PRODUCTS.find((p) => p.id === d.productId) ?? PRODUCTS[0]!
  const surface = getSurface(getProduct(product.id), d.surfaceId)
  return {
    v: 2,
    productId: d.productId,
    materialId: d.materialId,
    surfaceId: d.surfaceId,
    styleId: d.styleId,
    elements: stackedTextElements(d, surface, measure),
    notes: d.notes,
    source: d.source,
  }
}

import { FONTS } from './catalog'
import type { DesignState, FontId, MeasureText } from './types'

const REF_PX = 100
let ctx: CanvasRenderingContext2D | null = null
const capCache = new Map<FontId, number>()
const familyCache = new Map<FontId, string>()

/**
 * Nombre real de la familia (con el hash de Astro) más el fallback, listo para `ctx.font` y `document.fonts`.
 * Se lee de la variable CSS que genera `<Font>`; si todavía no está (tests, SSR), sólo el fallback y sin caché.
 */
export function fontFamily(fontId: FontId): string {
  const cached = familyCache.get(fontId)
  if (cached) return cached
  const f = FONTS[fontId]
  if (typeof document === 'undefined') return f.fallback
  const family = getComputedStyle(document.documentElement).getPropertyValue(f.cssVariable).trim()
  if (!family) return f.fallback
  familyCache.set(fontId, family)
  return family
}

export function fontCss(fontId: FontId, px: number): string {
  return `${FONTS[fontId].weight} ${px}px ${fontFamily(fontId)}`
}

function context(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  ctx ??= document.createElement('canvas').getContext('2d')
  return ctx
}

/**
 * Altura de mayúscula / tamaño de fuente. Se mide con la «H» de la fuente ya cargada, así
 * una tipografía nueva no necesita calibrarse a mano; mientras no cargó se usa la estimación.
 */
export function capRatio(fontId: FontId): number {
  const cached = capCache.get(fontId)
  if (cached) return cached
  const c = context()
  const css = fontCss(fontId, REF_PX)
  if (!c || !document.fonts?.check(css)) return FONTS[fontId].capRatio
  c.font = css
  const ascent = c.measureText('H').actualBoundingBoxAscent
  const ratio = ascent > 0 ? ascent / REF_PX : FONTS[fontId].capRatio
  capCache.set(fontId, ratio)
  return ratio
}

/** Medición en el navegador: ancho del texto (mm) para una altura de mayúscula (mm). */
export const measureTextMm: MeasureText = (text, fontId, heightMm) => {
  if (!text) return 0
  const c = context()
  if (!c) return text.length * heightMm * 0.6
  c.font = fontCss(fontId, REF_PX)
  const widthPx = c.measureText(text).width
  return (widthPx / (REF_PX * capRatio(fontId))) * heightMm
}

/** Tipografías que usa el diseño. */
export function designFonts(design: DesignState): FontId[] {
  return [...new Set(design.elements.flatMap((e) => (e.kind === 'text' ? [e.fontId] : [])))]
}

/** Carga (bajo demanda) las tipografías indicadas. Resuelve true si alguna terminó de cargar recién. */
export async function ensureFonts(fontIds: readonly FontId[]): Promise<boolean> {
  if (typeof document === 'undefined' || !('fonts' in document)) return false
  const missing = fontIds.filter((id) => !document.fonts.check(fontCss(id, 40)))
  if (!missing.length) return false
  await Promise.allSettled(missing.map((id) => document.fonts.load(fontCss(id, 40), 'AaÁñ0')))
  missing.forEach((id) => capCache.delete(id))
  return true
}

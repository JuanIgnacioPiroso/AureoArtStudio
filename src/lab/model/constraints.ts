import { getProduct, getShape, getSurface, PRODUCTS, stylesForSurface } from './catalog'
import { elementHasContent, elementLabel } from './elements'
import { MAX_ELEMENTS, MAX_TEXT_LENGTH, type DesignElement, type DesignState, type MeasureText, type SurfaceDef, type TextElement } from './types'

/** Caja alineada a los ejes, en mm respecto del centro de la zona (+derecha, +arriba). */
export interface Box {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface TextLine {
  text: string
  /** Borde izquierdo de la línea, en el marco local de la capa (mm). */
  x: number
  /** Línea base, en el marco local (mm, +arriba). */
  baseline: number
  width: number
}

/** Letra de un texto en arco: centro de su línea base y giro (radianes, antihorario). */
export interface Glyph {
  ch: string
  x: number
  y: number
  angle: number
}

export interface TextLayout {
  width: number
  height: number
  /** Espacio extra entre letras, en mm. */
  spacingMm: number
  lines: TextLine[]
  /** Sólo en texto curvo. */
  glyphs: Glyph[] | null
  /** Centro del círculo que sigue el texto curvo, en el marco local. */
  arcCenter: { x: number; y: number } | null
}

/** Debajo de esta curvatura (grados) el texto se trata como recto. */
const MIN_ARC = 1

const layoutCache = new WeakMap<MeasureText, Map<string, TextLayout>>()

/** Descarta las mediciones guardadas (por ejemplo, cuando termina de cargar una tipografía). */
export function clearLayoutCache(measure: MeasureText) {
  layoutCache.delete(measure)
}

function advances(text: string, el: TextElement, measure: MeasureText): number[] {
  // Diferencias de anchos acumulados: respeta el kerning de la fuente.
  const chars = Array.from(text)
  const out: number[] = []
  let prev = 0
  let acc = ''
  for (const ch of chars) {
    acc += ch
    const w = measure(acc, el.fontId, el.sizeMm)
    out.push(w - prev)
    prev = w
  }
  return out
}

function straightLayout(el: TextElement, measure: MeasureText, spacing: number): TextLayout {
  const raw = el.text.split('\n').map((l) => l.trimEnd())
  if (!raw.some((l) => l.trim())) return { width: 0, height: 0, spacingMm: spacing, lines: [], glyphs: null, arcCenter: null }
  const gap = el.sizeMm * el.lineHeight
  const height = el.sizeMm + (raw.length - 1) * gap
  const widths = raw.map((t) => (t ? measure(t, el.fontId, el.sizeMm) + spacing * (Array.from(t).length - 1) : 0))
  const width = Math.max(...widths)
  const lines = raw.map((text, i) => {
    const w = widths[i]!
    const x = el.align === 'left' ? -width / 2 : el.align === 'right' ? width / 2 - w : -w / 2
    return { text, x, baseline: height / 2 - i * gap - el.sizeMm, width: w }
  })
  return { width, height, spacingMm: spacing, lines, glyphs: null, arcCenter: null }
}

function arcLayout(el: TextElement, measure: MeasureText, spacing: number): TextLayout {
  const text = el.text.replace(/\s*\n\s*/g, ' ').trim()
  if (!text) return { width: 0, height: 0, spacingMm: spacing, lines: [], glyphs: null, arcCenter: null }
  const chars = Array.from(text)
  const adv = advances(text, el, measure)
  const total = adv.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  const theta = (Math.abs(el.arc) * Math.PI) / 180
  const r = total / theta
  const up = el.arc > 0
  const glyphs: Glyph[] = []
  const box: Box = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  let s = -total / 2
  chars.forEach((ch, i) => {
    const a = adv[i]!
    const phi = (s + a / 2) / r
    s += a + spacing
    // Arriba (∩): centro del círculo debajo; abajo (∪): centro arriba y la letra mira hacia él.
    const x = r * Math.sin(phi)
    const y = up ? -r + r * Math.cos(phi) : r - r * Math.cos(phi)
    const angle = up ? -phi : phi
    glyphs.push({ ch, x, y, angle })
    const c = Math.cos(angle)
    const sn = Math.sin(angle)
    for (const [lx, ly] of [
      [-a / 2, 0],
      [a / 2, 0],
      [-a / 2, el.sizeMm],
      [a / 2, el.sizeMm],
    ] as const) {
      const px = x + lx * c - ly * sn
      const py = y + lx * sn + ly * c
      box.minX = Math.min(box.minX, px)
      box.maxX = Math.max(box.maxX, px)
      box.minY = Math.min(box.minY, py)
      box.maxY = Math.max(box.maxY, py)
    }
  })
  // El origen local de la capa es el centro de su caja.
  const cx = (box.minX + box.maxX) / 2
  const cy = (box.minY + box.maxY) / 2
  return {
    width: box.maxX - box.minX,
    height: box.maxY - box.minY,
    spacingMm: spacing,
    lines: [],
    glyphs: glyphs.map((g) => ({ ...g, x: g.x - cx, y: g.y - cy })),
    arcCenter: { x: -cx, y: (up ? -r : r) - cy },
  }
}

/** Disposición de una capa de texto en su marco local (centrada en el origen), en mm. */
export function layoutText(el: TextElement, measure: MeasureText): TextLayout {
  const key = `${el.fontId}|${el.sizeMm}|${el.letterSpacing}|${el.lineHeight}|${el.arc}|${el.align}|${el.text}`
  let cache = layoutCache.get(measure)
  if (!cache) layoutCache.set(measure, (cache = new Map()))
  const hit = cache.get(key)
  if (hit) return hit
  const spacing = el.letterSpacing * el.sizeMm
  const out = Math.abs(el.arc) >= MIN_ARC ? arcLayout(el, measure, spacing) : straightLayout(el, measure, spacing)
  if (cache.size > 500) cache.clear()
  cache.set(key, out)
  return out
}

/** Ancho y alto de la capa sin rotar, en mm. */
export function elementSize(el: DesignElement, measure: MeasureText): { w: number; h: number } {
  if (el.kind === 'text') {
    const l = layoutText(el, measure)
    return { w: l.width, h: l.height }
  }
  if (el.kind === 'shape' && el.shape === 'line') return { w: el.widthMm, h: el.strokeMm }
  return { w: el.widthMm, h: el.heightMm }
}

/** Caja envolvente de la capa ya rotada, en coordenadas de la zona. */
export function elementBounds(el: DesignElement, measure: MeasureText): Box {
  const { w, h } = elementSize(el, measure)
  const r = (el.rotation * Math.PI) / 180
  const c = Math.abs(Math.cos(r))
  const s = Math.abs(Math.sin(r))
  const bw = (w * c + h * s) / 2
  const bh = (w * s + h * c) / 2
  return { minX: el.x - bw, maxX: el.x + bw, minY: el.y - bh, maxY: el.y + bh }
}

export function unionBounds(boxes: readonly Box[]): Box | null {
  if (!boxes.length) return null
  return boxes.reduce((a, b) => ({
    minX: Math.min(a.minX, b.minX),
    maxX: Math.max(a.maxX, b.maxX),
    minY: Math.min(a.minY, b.minY),
    maxY: Math.max(a.maxY, b.maxY),
  }))
}

/** Caja del conjunto de capas visibles con contenido. */
export function designBounds(design: DesignState, measure: MeasureText): Box | null {
  return unionBounds(design.elements.filter(elementHasContent).map((e) => elementBounds(e, measure)))
}

/** Altura de texto mínima recomendable para que se lea grabado en esta zona. */
export function minDetailMm(surface: SurfaceDef): number {
  return Math.max(2, surface.sizeRange[0] * 0.5)
}

/** Trazo mínimo que el láser marca de forma pareja. */
export const MIN_STROKE_MM = 0.3

export type WarningCode = 'empty' | 'outside' | 'too-small' | 'thin-stroke'

export interface DesignWarning {
  code: WarningCode
  elementId: string | null
  message: string
}

const fmt = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 1 })

/** Avisos del diseño. No lo corrigen: el usuario decide, pero sabe qué no se va a grabar bien. */
export function checkDesign(design: DesignState, surface: SurfaceDef, measure: MeasureText): DesignWarning[] {
  const out: DesignWarning[] = []
  const visible = design.elements.filter(elementHasContent)
  if (!visible.length) {
    out.push({ code: 'empty', elementId: null, message: 'El diseño está vacío: agregá un texto, un logo o una forma.' })
    return out
  }
  const halfW = surface.widthMm / 2 + 0.2
  const halfH = surface.heightMm / 2 + 0.2
  const minText = minDetailMm(surface)
  for (const el of visible) {
    const name = `«${elementLabel(el)}»`
    const b = elementBounds(el, measure)
    if (b.minX < -halfW || b.maxX > halfW || b.minY < -halfH || b.maxY > halfH) {
      out.push({ code: 'outside', elementId: el.id, message: `${name} se sale de la zona: lo que quede afuera no se graba.` })
    }
    if (el.kind === 'text' && el.sizeMm < minText) {
      out.push({
        code: 'too-small',
        elementId: el.id,
        message: `${name} mide ${fmt(el.sizeMm)} mm de alto: por debajo de ${fmt(minText)} mm puede no leerse bien.`,
      })
    }
    if (el.kind === 'shape' && (!el.fill || el.shape === 'line') && el.strokeMm < MIN_STROKE_MM) {
      out.push({
        code: 'thin-stroke',
        elementId: el.id,
        message: `El trazo de ${name} es muy fino (${fmt(el.strokeMm)} mm): usá al menos ${fmt(MIN_STROKE_MM)} mm.`,
      })
    }
  }
  return out
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const round = (n: number, step: number) => Math.round(n / step) * step
const wrapDeg = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180

function normalizeElement(el: DesignElement, surface: SurfaceDef): DesignElement {
  const maxDim = Math.max(surface.widthMm, surface.heightMm)
  const common = {
    x: round(clamp(el.x, -surface.widthMm / 2, surface.widthMm / 2), 0.01),
    y: round(clamp(el.y, -surface.heightMm / 2, surface.heightMm / 2), 0.01),
    rotation: round(wrapDeg(el.rotation), 0.1),
    name: el.name.slice(0, 40),
  }
  if (el.kind === 'text') {
    return {
      ...el,
      ...common,
      text: el.text.slice(0, MAX_TEXT_LENGTH),
      sizeMm: round(clamp(el.sizeMm, 1, maxDim), 0.1),
      letterSpacing: round(clamp(el.letterSpacing, -0.3, 1.5), 0.01),
      lineHeight: round(clamp(el.lineHeight, 0.8, 4), 0.05),
      arc: Math.round(clamp(el.arc, -360, 360)),
    }
  }
  if (el.kind === 'image') {
    return {
      ...el,
      ...common,
      widthMm: round(clamp(el.widthMm, 1, maxDim * 2), 0.1),
      heightMm: round(clamp(el.heightMm, 1, maxDim * 2), 0.1),
      threshold: round(clamp(el.threshold, 0, 1), 0.01),
    }
  }
  const widthMm = round(clamp(el.widthMm, 0.5, maxDim * 2), 0.1)
  const heightMm = round(clamp(el.heightMm, 0.5, maxDim * 2), 0.1)
  return {
    ...el,
    ...common,
    widthMm,
    heightMm,
    strokeMm: round(clamp(el.strokeMm, 0.1, 30), 0.05),
    radiusMm: round(clamp(el.radiusMm, 0, Math.min(widthMm, heightMm) / 2), 0.1),
  }
}

/**
 * Devuelve un diseño válido para el catálogo: producto, material, superficie y estilo compatibles,
 * capas con el centro dentro de la zona y medidas en rangos sanos. No achica el diseño para que
 * entre: eso lo informa `checkDesign`.
 */
export function normalizeDesign(input: DesignState): DesignState {
  const product = PRODUCTS.some((p) => p.id === input.productId) ? getProduct(input.productId) : PRODUCTS[0]!
  // La forma sólo existe en los productos que tienen formas; si falta o no existe, va la primera.
  const { shapeId: _shapeId, ...rest } = input
  const d: DesignState = { ...rest, productId: product.id }
  const shape = getShape(product, input.shapeId)
  if (shape) d.shapeId = shape.id

  if (!product.materialIds.includes(d.materialId)) d.materialId = product.defaultDesign.materialId
  const surface = getSurface(product, d.surfaceId, d.shapeId)
  d.surfaceId = surface.id

  const styles = stylesForSurface(product, surface, d.materialId)
  if (!styles.some((s) => s.id === d.styleId)) d.styleId = styles[0]!.id

  const seen = new Set<string>()
  d.elements = input.elements
    .slice(0, MAX_ELEMENTS)
    .map((el) => {
      const id = seen.has(el.id) ? `${el.id.slice(0, 20)}-${seen.size}` : el.id
      seen.add(id)
      return normalizeElement({ ...el, id }, surface)
    })
  return d
}

/** ¿La caja de la capa entra en el ancho de la zona? */
export function fitsWidth(el: DesignElement, surface: SurfaceDef, measure: MeasureText): boolean {
  const b = elementBounds(el, measure)
  return b.minX >= -surface.widthMm / 2 - 1e-6 && b.maxX <= surface.widthMm / 2 + 1e-6
}

/**
 * Achica el texto para que su caja entre en el ancho de la zona, sin bajar de sizeRange[0].
 * La caja crece en proporción al tamaño y alrededor del centro de la capa (x), así que alcanza
 * con un factor. Si el texto ya entra, o si el centro queda fuera de la zona, no lo toca.
 */
export function fitTextWidth(el: TextElement, surface: SurfaceDef, measure: MeasureText): TextElement {
  const room = surface.widthMm / 2 - Math.abs(el.x)
  const box = elementBounds(el, measure)
  const half = (box.maxX - box.minX) / 2
  if (room <= 0 || half <= room) return el
  // Hacia abajo al décimo de mm, para que el redondeo no lo deje apenas afuera.
  const fitted = Math.floor(((el.sizeMm * room) / half) * 10) / 10
  return { ...el, sizeMm: Math.max(surface.sizeRange[0], fitted) }
}

/**
 * De un anillo (la boca de una virola) a una banda: los textos se enderezan, se ponen en fila
 * centrados en el frente y se achican para entrar en el alto y el ancho de la banda, sin bajar de
 * sizeRange[0]. Las demás capas se reescalan como en cualquier cambio de zona.
 */
export function straightenForBand(elements: readonly DesignElement[], from: SurfaceDef, to: SurfaceDef, measure: MeasureText): DesignElement[] {
  const texts = elements.filter((e): e is TextElement => e.kind === 'text')
  const others = rescaleElements(
    elements.filter((e) => e.kind !== 'text'),
    from,
    to,
  )
  if (!texts.length) return others
  const gap = to.heightMm * 0.6
  let size = Math.min(to.heightMm * 0.6, to.sizeRange[1])
  const flat = texts.map((t) => ({ ...t, arc: 0, rotation: 0, text: t.text.replace(/\s*\n\s*/g, ' ') }))
  const widths = (s: number) => flat.map((t) => measure(t.text, t.fontId, s) + t.letterSpacing * s * Math.max(0, Array.from(t.text).length - 1))
  const total = (s: number) => widths(s).reduce((a, w) => a + w, 0) + gap * (flat.length - 1)
  if (total(size) > to.widthMm * 0.9) size = Math.max(to.sizeRange[0], (size * to.widthMm * 0.9) / total(size))
  const ws = widths(size)
  const center = to.wrap?.frontOffsetMm ?? 0
  let x = center - total(size) / 2
  const placed = flat.map((t, i) => {
    const el = { ...t, sizeMm: Math.floor(size * 10) / 10, x: x + ws[i]! / 2, y: 0 }
    x += ws[i]! + gap
    return el
  })
  return [...placed, ...others]
}

/** Reescala las capas al pasar a otra zona, conservando la composición. */
export function rescaleElements(elements: readonly DesignElement[], from: SurfaceDef, to: SurfaceDef): DesignElement[] {
  const k = Math.min(to.widthMm / from.widthMm, to.heightMm / from.heightMm)
  if (Math.abs(k - 1) < 1e-6) return [...elements]
  return elements.map((el) => {
    const pos = { x: el.x * k, y: el.y * k }
    if (el.kind === 'text') return { ...el, ...pos, sizeMm: el.sizeMm * k }
    if (el.kind === 'image') return { ...el, ...pos, widthMm: el.widthMm * k, heightMm: el.heightMm * k }
    return { ...el, ...pos, widthMm: el.widthMm * k, heightMm: el.heightMm * k, strokeMm: Math.max(MIN_STROKE_MM, el.strokeMm * k), radiusMm: el.radiusMm * k }
  })
}

/**
 * Pasa las capas de una zona a otra. Entre el frente y la tira que lo rodea (misma parte), corre x
 * en ±frontOffsetMm sin reescalar, para que el diseño siga en el frente; en el resto, reescala.
 */
export function transferElements(elements: readonly DesignElement[], from: SurfaceDef, to: SurfaceDef): DesignElement[] {
  const shiftX = (dx: number) => elements.map((el) => ({ ...el, x: el.x + dx }))
  if (from.part === to.part && to.wrap && !from.wrap) return shiftX(to.wrap.frontOffsetMm)
  if (from.part === to.part && from.wrap && !to.wrap) return shiftX(-from.wrap.frontOffsetMm)
  return rescaleElements(elements, from, to)
}

import { getAssetImage } from '../assets/assetStore'
import { elementHasContent } from '../model/elements'
import { layoutText, type TextLayout } from '../model/constraints'
import { capRatio, fontCss, measureTextMm } from '../model/measure'
import type { DesignElement, ImageElement, ShapeElement, TextElement } from '../model/types'

const maskCache = new Map<string, HTMLCanvasElement>()

/**
 * Máscara monocromática de un logo: se graba lo que es más oscuro que el umbral (o más claro,
 * si está invertido). Los píxeles transparentes nunca se graban.
 */
export function imageMask(assetId: string, threshold: number, invert: boolean): HTMLCanvasElement | null {
  const key = `${assetId}|${threshold.toFixed(2)}|${invert ? 1 : 0}`
  const hit = maskCache.get(key)
  if (hit) return hit
  const src = getAssetImage(assetId)
  if (!src) return null
  const w = (src as { width: number }).width
  const h = (src as { height: number }).height
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(src, 0, 0)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const lum = (0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!) / 255
    const dark = invert ? lum - threshold : threshold - lum
    // Transición suave alrededor del umbral: bordes antialiasados en lugar de escalones.
    const m = Math.min(1, Math.max(0, dark / 0.08 + 0.5)) * (d[i + 3]! / 255)
    d[i] = d[i + 1] = d[i + 2] = 255
    d[i + 3] = Math.round(m * 255)
  }
  ctx.putImageData(img, 0, 0)
  if (maskCache.size > 40) maskCache.delete(maskCache.keys().next().value!)
  maskCache.set(key, canvas)
  return canvas
}

function drawSpacedText(ctx: CanvasRenderingContext2D, text: string, el: TextElement, x: number, y: number, spacingMm: number, ppm: number) {
  if (Math.abs(spacingMm) < 1e-3) {
    ctx.fillText(text, x, y)
    return
  }
  // Posición de cada letra = ancho del prefijo (respeta el kerning) + espacio extra acumulado.
  const chars = Array.from(text)
  let prefix = ''
  chars.forEach((ch, i) => {
    const offset = measureTextMm(prefix, el.fontId, el.sizeMm) + i * spacingMm
    ctx.fillText(ch, x + offset * ppm, y)
    prefix += ch
  })
}

function drawText(ctx: CanvasRenderingContext2D, el: TextElement, layout: TextLayout, ppm: number) {
  ctx.font = fontCss(el.fontId, (el.sizeMm / capRatio(el.fontId)) * ppm)
  ctx.textBaseline = 'alphabetic'
  if (layout.glyphs) {
    ctx.textAlign = 'center'
    for (const g of layout.glyphs) {
      ctx.save()
      ctx.translate(g.x * ppm, -g.y * ppm)
      ctx.rotate(-g.angle)
      ctx.fillText(g.ch, 0, 0)
      ctx.restore()
    }
    return
  }
  ctx.textAlign = 'left'
  for (const line of layout.lines) {
    if (line.text) drawSpacedText(ctx, line.text, el, line.x * ppm, -line.baseline * ppm, layout.spacingMm, ppm)
  }
}

function drawShape(ctx: CanvasRenderingContext2D, el: ShapeElement, ppm: number) {
  const w = el.widthMm * ppm
  const h = el.heightMm * ppm
  const s = el.strokeMm * ppm
  if (el.shape === 'line') {
    ctx.fillRect(-w / 2, -s / 2, w, s)
    return
  }
  ctx.beginPath()
  // Con contorno, el trazo queda hacia adentro: la medida exterior es la que eligió el usuario.
  const inset = el.fill ? 0 : s / 2
  const iw = Math.max(0, w - inset * 2)
  const ih = Math.max(0, h - inset * 2)
  if (el.shape === 'ellipse') {
    ctx.ellipse(0, 0, iw / 2, ih / 2, 0, 0, Math.PI * 2)
  } else {
    const r = Math.max(0, Math.min(el.radiusMm * ppm - inset, iw / 2, ih / 2))
    if (r > 0 && typeof ctx.roundRect === 'function') ctx.roundRect(-iw / 2, -ih / 2, iw, ih, r)
    else ctx.rect(-iw / 2, -ih / 2, iw, ih)
  }
  if (el.fill) {
    ctx.fill()
  } else {
    ctx.lineWidth = s
    ctx.stroke()
  }
}

function drawImage(ctx: CanvasRenderingContext2D, el: ImageElement, ppm: number) {
  const mask = imageMask(el.assetId, el.threshold, el.invert)
  if (!mask) return
  const w = el.widthMm * ppm
  const h = el.heightMm * ppm
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(mask, -w / 2, -h / 2, w, h)
}

/**
 * Dibuja la máscara del grabado (blanco con alfa) de todas las capas visibles. `origin` es el
 * centro de la zona en píxeles del canvas; `ppm`, los píxeles por milímetro. Es la única
 * función de dibujo: la usan el 3D, la vista plana, el editor y el arte para el taller.
 */
export function drawDesignMask(
  ctx: CanvasRenderingContext2D,
  elements: readonly DesignElement[],
  origin: { x: number; y: number },
  ppm: number,
) {
  ctx.save()
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  for (const el of elements) {
    if (!elementHasContent(el)) continue
    ctx.save()
    ctx.translate(origin.x + el.x * ppm, origin.y - el.y * ppm)
    ctx.rotate((-el.rotation * Math.PI) / 180)
    if (el.kind === 'text') drawText(ctx, el, layoutText(el, measureTextMm), ppm)
    else if (el.kind === 'shape') drawShape(ctx, el, ppm)
    else drawImage(ctx, el, ppm)
    ctx.restore()
  }
  ctx.restore()
}

import type { DesignState, StyleId, SurfaceDef } from '../model/types'
import { drawDesignMask } from '../render/drawDesign'

export interface EngravingLook {
  /** Color del grabado (RGB) y opacidad máxima. */
  rgb: readonly [number, number, number]
  alpha: number
  roughness: number
  metalness: number
  /** Intensidad del relieve en el normal map. */
  depth: number
  /** Variación de tono dentro de la marca (carbonizado irregular, pasadas del láser). */
  mottle: number
  /** Aureola alrededor del trazo: el calor tuesta la madera vecina. */
  halo?: { rgb: readonly [number, number, number]; alpha: number; radiusMm: number }
}

export const ENGRAVING_LOOKS: Record<StyleId, EngravingLook> = {
  burn: {
    rgb: [48, 27, 15],
    alpha: 0.95,
    roughness: 0.95,
    metalness: 0,
    depth: 3,
    mottle: 0.35,
    halo: { rgb: [120, 72, 38], alpha: 0.42, radiusMm: 0.45 },
  },
  'mark-dark': { rgb: [30, 31, 34], alpha: 0.95, roughness: 0.5, metalness: 0.6, depth: 0.6, mottle: 0.12 },
  frost: { rgb: [214, 217, 221], alpha: 0.85, roughness: 0.85, metalness: 0.7, depth: 1.2, mottle: 0.1 },
  // Acero claro que asoma bajo la pintura retirada. Satinado: con metal espejo no se ve contra el estudio.
  reveal: { rgb: [214, 217, 221], alpha: 0.95, roughness: 0.55, metalness: 0.45, depth: 0.4, mottle: 0.08 },
}

export interface EngravingMaps {
  color: HTMLCanvasElement
  normal: HTMLCanvasElement
}

/** Píxeles por milímetro del canvas de la zona, con un tope para no exceder la textura máxima. */
export function pixelsPerMm(surface: SurfaceDef, maxPx: number): number {
  return Math.min(16, maxPx / surface.widthMm)
}

function drawMask(design: DesignState, surface: SurfaceDef, ppm: number) {
  const w = Math.round(surface.widthMm * ppm)
  const h = Math.round(surface.heightMm * ppm)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  drawDesignMask(canvas.getContext('2d')!, design.elements, { x: w / 2, y: h / 2 }, ppm)
  return canvas
}

/** Desenfoque de caja separable sobre un canal (para el mapa de altura). */
function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  if (r < 1) return src
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  const span = 2 * r + 1
  for (let y = 0; y < h; y++) {
    let acc = 0
    for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))]!
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / span
      const add = src[y * w + Math.min(w - 1, x + r + 1)]!
      const sub = src[y * w + Math.max(0, x - r)]!
      acc += add - sub
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]!
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / span
      const add = tmp[Math.min(h - 1, y + r + 1) * w + x]!
      const sub = tmp[Math.max(0, y - r) * w + x]!
      acc += add - sub
    }
  }
  return out
}

/** Ruido suave en [0, 1] con grano de ~0,4 mm, determinista. */
function mottleField(w: number, h: number, ppm: number): Float32Array {
  let seed = 12345
  const noise = new Float32Array(w * h)
  for (let i = 0; i < noise.length; i++) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0
    noise[i] = seed / 4294967296
  }
  const blurred = boxBlur(boxBlur(noise, w, h, Math.max(1, Math.round(ppm * 0.2))), w, h, Math.max(1, Math.round(ppm * 0.2)))
  // Reescala al rango completo: el desenfoque concentra los valores alrededor de 0,5.
  let lo = 1
  let hi = 0
  for (const v of blurred) {
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  const range = Math.max(1e-6, hi - lo)
  for (let i = 0; i < blurred.length; i++) blurred[i] = (blurred[i]! - lo) / range
  return blurred
}

/**
 * Genera los mapas del grabado para toda la zona: color con alfa (la marca) y normal map
 * (el hundimiento), derivados de la misma máscara del diseño.
 */
export function renderEngravingMaps(design: DesignState, surface: SurfaceDef, maxPx: number): EngravingMaps {
  const ppm = pixelsPerMm(surface, maxPx)
  const mask = drawMask(design, surface, ppm)
  const { width: w, height: h } = mask
  const mctx = mask.getContext('2d')!
  const maskData = mctx.getImageData(0, 0, w, h).data
  const look = ENGRAVING_LOOKS[design.styleId]

  const alpha = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) alpha[i] = maskData[i * 4 + 3]! / 255

  // Color: la marca, con bordes apenas suavizados para imitar el haz.
  const soft = boxBlur(alpha, w, h, Math.max(1, Math.round(ppm * 0.05)))
  const halo = look.halo ? boxBlur(boxBlur(alpha, w, h, Math.max(1, Math.round(ppm * look.halo.radiusMm))), w, h, Math.max(1, Math.round(ppm * look.halo.radiusMm))) : null
  const grain = mottleField(w, h, ppm)
  const color = document.createElement('canvas')
  color.width = w
  color.height = h
  const cctx = color.getContext('2d')!
  const cimg = cctx.createImageData(w, h)
  for (let i = 0; i < w * h; i++) {
    const a = Math.min(1, soft[i]! * 1.15)
    // El centro del trazo se carboniza más que los bordes; el ruido rompe el tono plano.
    const tone = 1 + (grain[i]! - 0.5) * look.mottle * 2 + (1 - a) * look.mottle
    let r = look.rgb[0] * tone
    let g = look.rgb[1] * tone
    let b = look.rgb[2] * tone
    let out = a * look.alpha * (1 - look.mottle * 0.3 * grain[i]!)
    if (halo && look.halo) {
      const ha = Math.max(0, halo[i]! * 1.6 - a) * look.halo.alpha
      const total = out + ha * (1 - out)
      if (total > 0) {
        const k = out / total
        r = r * k + look.halo.rgb[0] * (1 - k)
        g = g * k + look.halo.rgb[1] * (1 - k)
        b = b * k + look.halo.rgb[2] * (1 - k)
      }
      out = total
    }
    cimg.data[i * 4] = r
    cimg.data[i * 4 + 1] = g
    cimg.data[i * 4 + 2] = b
    cimg.data[i * 4 + 3] = Math.round(out * 255)
  }
  cctx.putImageData(cimg, 0, 0)

  // Normal map: el texto es un hundimiento; gradiente de la altura desenfocada.
  const height = boxBlur(alpha, w, h, Math.max(1, Math.round(ppm * 0.12)))
  const normal = document.createElement('canvas')
  normal.width = w
  normal.height = h
  const nctx = normal.getContext('2d')!
  const nimg = nctx.createImageData(w, h)
  const k = look.depth
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      const l = height[y * w + Math.max(0, x - 1)]!
      const r = height[y * w + Math.min(w - 1, x + 1)]!
      const u = height[Math.max(0, y - 1) * w + x]!
      const d = height[Math.min(h - 1, y + 1) * w + x]!
      // Altura = −alpha (hundido); en canvas Y crece hacia abajo.
      const nx = (r - l) * k
      const ny = (u - d) * k
      const inv = 1 / Math.hypot(nx, ny, 1)
      nimg.data[i * 4] = Math.round((nx * inv * 0.5 + 0.5) * 255)
      nimg.data[i * 4 + 1] = Math.round((ny * inv * 0.5 + 0.5) * 255)
      nimg.data[i * 4 + 2] = Math.round((inv * 0.5 + 0.5) * 255)
      nimg.data[i * 4 + 3] = 255
    }
  }
  nctx.putImageData(nimg, 0, 0)
  return { color, normal }
}

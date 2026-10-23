import * as THREE from 'three'
import type { MaterialDef } from '../model/types'

/** Ruido determinista para que la veta sea siempre la misma. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const smooth = (t: number) => t * t * (3 - 2 * t)

/** Ruido de valor 2D periódico (px × py celdas), para que la textura no tenga costuras. */
function valueNoise(seed: number, px: number, py: number) {
  const rand = rng(seed)
  const grid = Float32Array.from({ length: px * py }, () => rand())
  return (x: number, y: number) => {
    const xf = Math.floor(x)
    const yf = Math.floor(y)
    const tx = smooth(x - xf)
    const ty = smooth(y - yf)
    const x0 = ((xf % px) + px) % px
    const y0 = ((yf % py) + py) % py
    const x1 = (x0 + 1) % px
    const y1 = (y0 + 1) % py
    const a = grid[y0 * px + x0]!
    const b = grid[y0 * px + x1]!
    const c = grid[y1 * px + x0]!
    const d = grid[y1 * px + x1]!
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty
  }
}

export interface SurfaceMaps {
  /** Color (sólo madera). */
  map: THREE.Texture | null
  /** Rugosidad en escala de grises (canal G). */
  roughnessMap: THREE.Texture
  /** Relieve fino: poros y fibras (sólo madera). */
  bumpMap: THREE.Texture | null
}

interface WoodCanvases {
  color: HTMLCanvasElement
  rough: HTMLCanvasElement
  bump: HTMLCanvasElement
}

/**
 * Veta de madera longitudinal (a lo largo de X): anillos de ancho irregular con transición
 * gradual de madera temprana a tardía, deformados por ruido, más fibras y poros.
 */
function woodCanvases(base: string, seed: number): WoodCanvases {
  const w = 1536
  const h = 768
  const rand = rng(seed)
  const [r0, g0, b0] = hexToRgb(base)

  // Perfil de anillos precalculado sobre la coordenada deformada (con margen para la deformación).
  const span = h + 400
  const late = new Float32Array(span)
  for (let y = 0; y < span; ) {
    const width = Math.round(18 + rand() * 30 + (rand() < 0.2 ? rand() * 50 : 0))
    const lateFrac = 0.1 + rand() * 0.12
    const strength = 0.45 + rand() * 0.45
    for (let k = 0; k < width && y < span; k++, y++) {
      const t = k / width
      // Madera temprana casi pareja; la tardía es una banda angosta de bordes suaves.
      const d = Math.abs(t - (1 - lateFrac / 2)) / (lateFrac / 2)
      const v = 0.12 * t + (d < 1 ? 1 - smooth(d) : 0) * 0.88
      late[y] = v * strength
    }
  }
  // Fibras: valor aleatorio por sub-píxel de la coordenada deformada.
  const fiberRow = Float32Array.from({ length: span * 2 }, () => rand() - 0.5)

  const warp = valueNoise(seed + 1, 6, 4)
  const warp2 = valueNoise(seed + 2, 16, 8)
  const tone = valueNoise(seed + 3, 5, 9)
  const streak = valueNoise(seed + 4, 48, 96)

  const make = () => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c
  }
  const color = make()
  const rough = make()
  const bump = make()
  const cctx = color.getContext('2d')!
  const rctx = rough.getContext('2d')!
  const bctx = bump.getContext('2d')!
  const cimg = cctx.createImageData(w, h)
  const rimg = rctx.createImageData(w, h)
  const bimg = bctx.createImageData(w, h)

  // Tardía: más oscura y saturada; temprana: algo más clara.
  const early: [number, number, number] = [r0 * 1.07, g0 * 1.06, b0 * 1.03]
  const lateC: [number, number, number] = [r0 * 0.74, g0 * 0.64, b0 * 0.56]

  for (let y = 0; y < h; y++) {
    const fy = y / h
    for (let x = 0; x < w; x++) {
      const fx = x / w
      const wv = (warp(fx * 6, fy * 4) - 0.5) * 70 + (warp2(fx * 16, fy * 8) - 0.5) * 8
      const yy = y + 200 + wv
      const yi = Math.max(0, Math.min(span - 2, Math.floor(yy)))
      const yt = yy - Math.floor(yy)
      const ring = late[yi]! + (late[yi + 1]! - late[yi]!) * yt
      const fiber = fiberRow[Math.max(0, Math.min(span * 2 - 1, Math.floor(yy * 2)))]! * (0.6 + streak(fx * 48, fy * 96) * 0.8)
      const broad = (tone(fx * 5, fy * 9) - 0.5) * 0.12

      const shade = 1 + broad + fiber * 0.07
      const i = (y * w + x) * 4
      for (let ch = 0; ch < 3; ch++) {
        const v = (early[ch]! + (lateC[ch]! - early[ch]!) * ring) * shade
        cimg.data[i + ch] = v > 255 ? 255 : v
      }
      cimg.data[i + 3] = 255

      // La tardía es más densa y cierra mejor: algo menos rugosa.
      const rv = (0.76 - ring * 0.08 + fiber * 0.1) * 255
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = rv
      rimg.data[i + 3] = 255

      // Superficie cepillada y aceitada: casi plana, sólo la fibra se nota al tacto.
      const bv = (0.6 + ring * 0.04 + fiber * 0.12) * 255
      bimg.data[i] = bimg.data[i + 1] = bimg.data[i + 2] = bv
      bimg.data[i + 3] = 255
    }
  }
  cctx.putImageData(cimg, 0, 0)
  rctx.putImageData(rimg, 0, 0)
  bctx.putImageData(bimg, 0, 0)

  // Poros: trazos cortos a lo largo de la fibra, oscuros, rugosos y hundidos.
  for (let n = 0; n < 5200; n++) {
    const x = rand() * w
    const y = rand() * h
    const len = 2 + rand() * 14
    const lw = 0.5 + rand() * 0.9
    const a = 0.06 + rand() * 0.14
    const dy = (rand() - 0.5) * 0.8
    const stroke = (ctx: CanvasRenderingContext2D, style: string) => {
      ctx.globalAlpha = a
      ctx.strokeStyle = style
      ctx.lineWidth = lw
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + len, y + dy)
      ctx.stroke()
    }
    stroke(cctx, '#1a0e06')
    stroke(rctx, '#fff')
    stroke(bctx, '#000')
  }
  for (const ctx of [cctx, rctx, bctx]) ctx.globalAlpha = 1
  return { color, rough, bump }
}

/** Cepillado fino del acero (rayas a lo largo de X). Se usa como mapa de rugosidad. */
function brushedCanvas(seed: number): HTMLCanvasElement {
  const w = 1024
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = 'rgb(128,128,128)'
  ctx.fillRect(0, 0, w, h)
  const rand = rng(seed)
  for (let i = 0; i < 6000; i++) {
    const v = 100 + rand() * 70
    ctx.strokeStyle = `rgba(${v},${v},${v},${0.15 + rand() * 0.25})`
    ctx.lineWidth = 0.4 + rand() * 0.7
    const y = rand() * h
    const x = rand() * w
    ctx.beginPath()
    ctx.moveTo(x - 300, y)
    ctx.lineTo(x + 300 + rand() * 400, y + (rand() - 0.5) * 0.5)
    ctx.stroke()
  }
  return c
}

const cache = new Map<string, SurfaceMaps>()

function canvasTexture(canvas: HTMLCanvasElement, repeat: [number, number], srgb: boolean) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(...repeat)
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.anisotropy = 8
  return tex
}

/**
 * Mapas base del material. Las caras frontales de los modelos usan las coordenadas X/Y
 * como UV, así que `repeat` define cuántas unidades de escena cubre la imagen.
 */
export function surfaceMaps(material: MaterialDef): SurfaceMaps {
  const key = material.id
  const hit = cache.get(key)
  if (hit) return hit
  let maps: SurfaceMaps
  if (material.texture === 'wood-grain') {
    // La madera cubre la tabla entera con una sola imagen (sin costuras visibles).
    const repeat: [number, number] = [0.24, 0.42]
    const c = woodCanvases(material.color, key === 'wood-dark' ? 11 : 29)
    maps = {
      map: canvasTexture(c.color, repeat, true),
      roughnessMap: canvasTexture(c.rough, repeat, false),
      bumpMap: canvasTexture(c.bump, repeat, false),
    }
  } else {
    maps = { map: null, roughnessMap: canvasTexture(brushedCanvas(7), [0.6, 3], false), bumpMap: null }
  }
  cache.set(key, maps)
  return maps
}

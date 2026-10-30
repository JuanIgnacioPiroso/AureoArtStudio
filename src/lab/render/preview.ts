import { useSyncExternalStore } from 'react'
import { assetsVersion, subscribeAssets } from '../assets/assetStore'
import { partMaterial } from '../model/catalog'
import type { DesignState, ProductDef, SurfaceDef } from '../model/types'
import { useLab } from '../store'
import { ENGRAVING_LOOKS, markRgb } from '../viewer/engravingTexture'
import { drawDesignMask } from './drawDesign'

export interface PaintOptions {
  /** Píxeles del canvas por milímetro. */
  ppm: number
  /** Margen alrededor de la zona, en mm. */
  padMm: number
  /** Muestra atenuado lo que se sale de la zona (en el editor, para no "perder" capas). */
  ghostOutside?: boolean
  /** Borde punteado de la zona. */
  framed?: boolean
}

/** Pinta la zona con el color del material y el grabado con el tono de su estilo. */
export function paintZone(canvas: HTMLCanvasElement, design: DesignState, product: ProductDef, surface: SurfaceDef, opts: PaintOptions) {
  const { ppm, padMm } = opts
  const w = Math.max(1, Math.round((surface.widthMm + padMm * 2) * ppm))
  const h = Math.max(1, Math.round((surface.heightMm + padMm * 2) * ppm))
  if (canvas.width !== w) canvas.width = w
  if (canvas.height !== h) canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const material = partMaterial(product, surface.part, design.materialId)
  const look = ENGRAVING_LOOKS[design.styleId]

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = material.color
  ctx.fillRect(0, 0, w, h)

  const mask = document.createElement('canvas')
  mask.width = w
  mask.height = h
  const mctx = mask.getContext('2d')!
  drawDesignMask(mctx, design.elements, { x: w / 2, y: h / 2 }, ppm)
  mctx.globalCompositeOperation = 'source-in'
  mctx.fillStyle = `rgb(${markRgb(look, material).join(',')})`
  mctx.fillRect(0, 0, w, h)

  const zx = padMm * ppm
  const zy = padMm * ppm
  const zw = surface.widthMm * ppm
  const zh = surface.heightMm * ppm
  if (opts.ghostOutside) {
    ctx.globalAlpha = 0.3
    ctx.drawImage(mask, 0, 0)
  }
  ctx.save()
  ctx.beginPath()
  ctx.rect(zx, zy, zw, zh)
  ctx.clip()
  ctx.globalAlpha = look.alpha
  ctx.drawImage(mask, 0, 0)
  ctx.restore()
  ctx.globalAlpha = 1

  if (opts.framed) {
    ctx.strokeStyle = 'rgba(0,0,0,.4)'
    ctx.lineWidth = Math.max(1, ppm * 0.3)
    ctx.setLineDash([ppm * 1.5, ppm * 1.5])
    ctx.strokeRect(zx, zy, zw, zh)
    ctx.setLineDash([])
  }
}

/** Arte para el taller: la máscara del grabado en negro sobre transparente, a escala real. */
export function renderArtwork(design: DesignState, surface: SurfaceDef, ppm = 20): string | null {
  const scale = Math.min(ppm, 8000 / Math.max(surface.widthMm, surface.heightMm))
  const w = Math.round(surface.widthMm * scale)
  const h = Math.round(surface.heightMm * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  drawDesignMask(ctx, design.elements, { x: w / 2, y: h / 2 }, scale)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  try {
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

/**
 * Cambia cuando termina de cargar una tipografía o un logo: los componentes que dibujan el
 * grabado lo usan como dependencia para volver a pintar.
 */
export function useRenderRevision(): number {
  const assets = useSyncExternalStore(subscribeAssets, assetsVersion, assetsVersion)
  const fonts = useLab((s) => s.fontsVersion)
  return assets * 1000 + fonts
}

import type { DesignState, RingDef, SurfaceDef } from '../model/types'
import { drawDesignMask } from './drawDesign'

/** Margen (mm) que se tolera fuera del anillo: el borde suavizado de los trazos. */
const TOLERANCE_MM = 0.25
/** Resolución del chequeo: alcanza para trazos de texto y es rápido. */
const PPM = 2

/** ¿El punto (mm desde el centro de la zona) cae sobre el anillo? */
export function onRing(xMm: number, yMm: number, ring: RingDef, toleranceMm = 0): boolean {
  const r = Math.hypot(xMm, yMm)
  return r >= ring.innerMm / 2 - toleranceMm && r <= ring.outerMm / 2 + toleranceMm
}

/**
 * Capas cuyo grabado cae en la boca o fuera del anillo. Mira los píxeles del dibujo real
 * (drawDesignMask), así el texto curvo que va sobre el anillo no da un falso aviso.
 */
export function ringOverflowIds(design: DesignState, surface: SurfaceDef): string[] {
  const ring = surface.ring
  if (!ring || typeof document === 'undefined') return []
  const w = Math.ceil(surface.widthMm * PPM)
  const h = Math.ceil(surface.heightMm * PPM)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  const out: string[] = []
  for (const el of design.elements) {
    if (el.hidden) continue
    ctx.clearRect(0, 0, w, h)
    drawDesignMask(ctx, [el], { x: w / 2, y: h / 2 }, PPM)
    const data = ctx.getImageData(0, 0, w, h).data
    let overflow = false
    for (let py = 0; py < h && !overflow; py++) {
      for (let px = 0; px < w; px++) {
        if (data[(py * w + px) * 4 + 3]! < 80) continue
        if (!onRing((px + 0.5) / PPM - surface.widthMm / 2, surface.heightMm / 2 - (py + 0.5) / PPM, ring, TOLERANCE_MM)) {
          overflow = true
          break
        }
      }
    }
    if (overflow) out.push(el.id)
  }
  return out
}

export const RING_WARNING = 'Parte del diseño cae en la boca o fuera de la virola: eso no se graba.'

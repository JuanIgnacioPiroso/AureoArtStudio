import { useEffect, useRef } from 'react'
import { partMaterial } from '../model/catalog'
import { elementHasContent, elementLabel } from '../model/elements'
import type { DesignState, ProductDef, SurfaceDef } from '../model/types'
import { paintZone, useRenderRevision } from '../render/preview'

interface Props {
  product: ProductDef
  surface: SurfaceDef
  design: DesignState
  /** Muestra un margen y el borde de la zona (miniaturas no lo necesitan). */
  framed?: boolean
  /** Ancho aproximado del canvas en píxeles. */
  resolution?: number
  className?: string
}

/**
 * Vista plana de la zona grabable con el diseño, en milímetros reales.
 * Se usa cuando no hay WebGL y como miniatura de las propuestas del asistente.
 */
export function Fallback2D({ product, surface, design, framed = true, resolution = 900, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const revision = useRenderRevision()
  const pad = framed ? Math.max(surface.widthMm, surface.heightMm) * 0.06 : 0

  useEffect(() => {
    if (!ref.current) return
    const ppm = (resolution * Math.min(2, window.devicePixelRatio || 1)) / (surface.widthMm + pad * 2)
    paintZone(ref.current, design, product, surface, { ppm, padMm: pad, framed })
  }, [design, product, surface, pad, framed, resolution, revision])

  const material = partMaterial(product, surface.part, design.materialId)
  const items = design.elements.filter(elementHasContent).map((e) => (e.kind === 'text' ? `el texto «${elementLabel(e)}»` : elementLabel(e).toLowerCase()))
  const label = `Vista plana: ${surface.name.toLowerCase()} de ${product.name.toLowerCase()} en ${material.name.toLowerCase()}, ${
    items.length ? `con ${items.join(', ')}` : 'sin grabado'
  }.`

  return (
    <canvas
      ref={ref}
      className={className}
      role="img"
      aria-label={label}
      style={{ aspectRatio: `${surface.widthMm + pad * 2} / ${surface.heightMm + pad * 2}` }}
    />
  )
}

import { elementBounds, unionBounds, type Box } from './constraints'
import type { DesignElement, MeasureText, SurfaceDef } from './types'

export type AlignEdge = 'left' | 'hcenter' | 'right' | 'top' | 'vcenter' | 'bottom'
export type ReorderDir = 'up' | 'down' | 'top' | 'bottom'

export function zoneBox(surface: SurfaceDef): Box {
  return { minX: -surface.widthMm / 2, maxX: surface.widthMm / 2, minY: -surface.heightMm / 2, maxY: surface.heightMm / 2 }
}

/**
 * Alinea las capas indicadas. Con una sola capa se alinea a la zona; con varias, a la caja
 * que forman entre todas. Las capas bloqueadas no se mueven.
 */
export function alignElements(
  elements: readonly DesignElement[],
  ids: readonly string[],
  edge: AlignEdge,
  surface: SurfaceDef,
  measure: MeasureText,
): DesignElement[] {
  const chosen = elements.filter((e) => ids.includes(e.id))
  if (!chosen.length) return [...elements]
  const ref = chosen.length === 1 ? zoneBox(surface) : unionBounds(chosen.map((e) => elementBounds(e, measure)))!
  return elements.map((e) => {
    if (!ids.includes(e.id) || e.locked) return e
    const b = elementBounds(e, measure)
    switch (edge) {
      case 'left':
        return { ...e, x: e.x + ref.minX - b.minX }
      case 'right':
        return { ...e, x: e.x + ref.maxX - b.maxX }
      case 'hcenter':
        return { ...e, x: e.x + (ref.minX + ref.maxX) / 2 - (b.minX + b.maxX) / 2 }
      case 'top':
        return { ...e, y: e.y + ref.maxY - b.maxY }
      case 'bottom':
        return { ...e, y: e.y + ref.minY - b.minY }
      case 'vcenter':
        return { ...e, y: e.y + (ref.minY + ref.maxY) / 2 - (b.minY + b.maxY) / 2 }
    }
  })
}

/** Reparte con el mismo espacio entre capas (necesita al menos 3). Los extremos quedan fijos. */
export function distributeElements(
  elements: readonly DesignElement[],
  ids: readonly string[],
  axis: 'x' | 'y',
  measure: MeasureText,
): DesignElement[] {
  const chosen = elements
    .filter((e) => ids.includes(e.id))
    .map((e) => ({ e, b: elementBounds(e, measure) }))
    .sort((a, b) => (axis === 'x' ? a.b.minX - b.b.minX : a.b.minY - b.b.minY))
  if (chosen.length < 3) return [...elements]
  const lo = (b: Box) => (axis === 'x' ? b.minX : b.minY)
  const hi = (b: Box) => (axis === 'x' ? b.maxX : b.maxY)
  const first = chosen[0]!
  const last = chosen[chosen.length - 1]!
  const sizes = chosen.reduce((acc, c) => acc + hi(c.b) - lo(c.b), 0)
  const gap = (hi(last.b) - lo(first.b) - sizes) / (chosen.length - 1)
  const moved = new Map<string, number>()
  let cursor = lo(first.b)
  for (const c of chosen) {
    moved.set(c.e.id, cursor - lo(c.b))
    cursor += hi(c.b) - lo(c.b) + gap
  }
  return elements.map((e) => {
    const d = moved.get(e.id)
    if (d === undefined || e.locked) return e
    return axis === 'x' ? { ...e, x: e.x + d } : { ...e, y: e.y + d }
  })
}

/** Cambia el orden de apilado de una capa (la última del arreglo queda arriba). */
export function reorderElement(elements: readonly DesignElement[], id: string, dir: ReorderDir): DesignElement[] {
  const i = elements.findIndex((e) => e.id === id)
  if (i < 0) return [...elements]
  const out = [...elements]
  const [el] = out.splice(i, 1)
  const to = dir === 'top' ? out.length : dir === 'bottom' ? 0 : dir === 'up' ? Math.min(out.length, i + 1) : Math.max(0, i - 1)
  out.splice(to, 0, el!)
  return out
}

export interface SnapResult {
  dx: number
  dy: number
  /** Guías a dibujar: posición x (vertical) o y (horizontal), en mm. */
  guides: { x: number[]; y: number[] }
}

/**
 * Ajusta un desplazamiento para que la caja en movimiento se pegue a bordes y centros de la zona
 * y de las otras capas, si queda a menos de `threshold` mm.
 */
export function snapMove(moving: Box, dx: number, dy: number, others: readonly Box[], zone: Box, threshold: number): SnapResult {
  const targetsX = [zone.minX, 0, zone.maxX, ...others.flatMap((b) => [b.minX, (b.minX + b.maxX) / 2, b.maxX])]
  const targetsY = [zone.minY, 0, zone.maxY, ...others.flatMap((b) => [b.minY, (b.minY + b.maxY) / 2, b.maxY])]
  const pick = (edges: number[], targets: number[]) => {
    let best: { d: number; at: number } | null = null
    for (const e of edges)
      for (const t of targets) {
        const d = t - e
        if (Math.abs(d) <= threshold && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, at: t }
      }
    return best
  }
  const x0 = moving.minX + dx
  const x1 = moving.maxX + dx
  const y0 = moving.minY + dy
  const y1 = moving.maxY + dy
  const sx = pick([x0, (x0 + x1) / 2, x1], targetsX)
  const sy = pick([y0, (y0 + y1) / 2, y1], targetsY)
  return {
    dx: dx + (sx?.d ?? 0),
    dy: dy + (sy?.d ?? 0),
    guides: { x: sx ? [sx.at] : [], y: sy ? [sy.at] : [] },
  }
}

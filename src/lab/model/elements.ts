import type { DesignElement, ImageElement, ShapeElement, ShapeKind, TextElement } from './types'

let counter = 0

/** Id corto y único dentro de la sesión (no necesita ser global: sólo distingue capas de un diseño). */
export function newElementId(): string {
  counter = (counter + 1) % 1296
  return `${Date.now().toString(36).slice(-5)}${Math.floor(Math.random() * 1296).toString(36)}${counter.toString(36)}`
}

const base = { name: '', x: 0, y: 0, rotation: 0, hidden: false, locked: false }

export function textElement(init: Partial<Omit<TextElement, 'kind'>> = {}): TextElement {
  return {
    ...base,
    id: init.id ?? newElementId(),
    kind: 'text',
    text: 'Texto',
    fontId: 'bodoni',
    sizeMm: 8,
    align: 'center',
    letterSpacing: 0,
    lineHeight: 1.6,
    arc: 0,
    ...init,
  }
}

export function imageElement(init: Partial<Omit<ImageElement, 'kind'>> & Pick<ImageElement, 'assetId' | 'widthMm' | 'heightMm'>): ImageElement {
  return { ...base, id: newElementId(), kind: 'image', threshold: 0.5, invert: false, ...init }
}

export function shapeElement(shape: ShapeKind, init: Partial<Omit<ShapeElement, 'kind' | 'shape'>> = {}): ShapeElement {
  return {
    ...base,
    id: newElementId(),
    kind: 'shape',
    shape,
    widthMm: 30,
    heightMm: shape === 'line' ? 0.6 : 20,
    strokeMm: 0.6,
    fill: false,
    radiusMm: 0,
    ...init,
  }
}

export const SHAPE_LABEL: Record<ShapeKind, string> = { rect: 'Rectángulo', ellipse: 'Elipse', line: 'Línea' }

/** Nombre que se muestra en la lista de capas y en el resumen. */
export function elementLabel(el: DesignElement): string {
  if (el.name.trim()) return el.name.trim()
  if (el.kind === 'text') {
    const t = el.text.replace(/\s+/g, ' ').trim()
    return t ? (t.length > 24 ? `${t.slice(0, 23)}…` : t) : 'Texto vacío'
  }
  if (el.kind === 'image') return 'Logo'
  return SHAPE_LABEL[el.shape]
}

/** La capa deja una marca visible (un texto vacío o una capa oculta no cuentan). */
export function elementHasContent(el: DesignElement): boolean {
  if (el.hidden) return false
  return el.kind !== 'text' || el.text.trim().length > 0
}

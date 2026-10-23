import { business } from '../../config/business'
import { ENGRAVING_STYLES, FONTS, getProduct, getSurface, MATERIALS, partMaterial } from '../model/catalog'
import { designBounds } from '../model/constraints'
import { elementHasContent, SHAPE_LABEL } from '../model/elements'
import { designId, designUrl } from '../model/serialize'
import type { DesignElement, DesignState, MeasureText, SurfaceDef } from '../model/types'

const fmt = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 1 })

/** Posición de la capa. En una tira, x se mide desde el frente del termo, no desde el centro de la zona. */
function placement(el: DesignElement, surface?: SurfaceDef): string {
  const x = el.x - (surface?.wrap?.frontOffsetMm ?? 0)
  const ref = surface?.wrap ? ' del frente' : ''
  const h = Math.abs(x) < 1 ? `centrado${surface?.wrap ? ' en el frente' : ''}` : `${fmt(Math.abs(x))} mm a la ${x < 0 ? 'izquierda' : 'derecha'}${ref}`
  const v = Math.abs(el.y) < 1 ? '' : `, ${fmt(Math.abs(el.y))} mm ${el.y > 0 ? 'arriba' : 'abajo'}`
  const r = Math.abs(el.rotation) >= 0.5 ? `, rotado ${fmt(el.rotation)}°` : ''
  return `${h}${v}${r}`
}

/** Descripción de una capa para el taller. */
export function describeElement(el: DesignElement, surface?: SurfaceDef): string {
  if (el.kind === 'text') {
    const text = el.text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((t) => `«${t}»`)
      .join(' / ')
    const arc = el.arc ? `, en arco de ${Math.abs(el.arc)}° hacia ${el.arc > 0 ? 'arriba' : 'abajo'}` : ''
    return `Texto ${text} en ${FONTS[el.fontId].name}, ${fmt(el.sizeMm)} mm de alto${arc}; ${placement(el, surface)}`
  }
  if (el.kind === 'image') {
    return `Logo de ${fmt(el.widthMm)} × ${fmt(el.heightMm)} mm${el.invert ? ' (invertido)' : ''}; ${placement(el, surface)}`
  }
  const size = el.shape === 'line' ? `${fmt(el.widthMm)} mm de largo` : `${fmt(el.widthMm)} × ${fmt(el.heightMm)} mm`
  const stroke = el.shape !== 'line' && el.fill ? 'con relleno' : `trazo de ${fmt(el.strokeMm)} mm`
  return `${SHAPE_LABEL[el.shape]} de ${size}, ${stroke}; ${placement(el, surface)}`
}

export interface QuoteSummaryRow {
  label: string
  value: string
}

export const hasLogos = (design: DesignState) => design.elements.some((e) => e.kind === 'image' && elementHasContent(e))

/** Filas del resumen comercial, derivadas del estado del diseño. */
export function summaryRows(design: DesignState, measure: MeasureText): QuoteSummaryRow[] {
  const product = getProduct(design.productId)
  const surface = getSurface(product, design.surfaceId)
  const chosen = MATERIALS[design.materialId]
  const surfaceMaterial = partMaterial(product, surface.part, design.materialId)
  const layers = design.elements.filter(elementHasContent)
  const bounds = designBounds(design, measure)
  const rows: QuoteSummaryRow[] = [
    { label: 'Producto', value: product.name },
    {
      label: 'Material',
      value: `${chosen ? chosen.name : design.materialId} (${(product.parts.find((p) => p.id === product.selectablePart)?.name ?? '').toLowerCase()})`,
    },
    { label: 'Zona de grabado', value: `${surface.name} (${surfaceMaterial.name.toLowerCase()}), ${surface.widthMm} × ${surface.heightMm} mm` },
    { label: 'Estilo de grabado', value: ENGRAVING_STYLES[design.styleId].name },
  ]
  if (!layers.length) rows.push({ label: 'Diseño', value: '(sin grabado)' })
  layers.forEach((el, i) => rows.push({ label: layers.length > 1 ? `Capa ${i + 1}` : 'Diseño', value: describeElement(el, surface) }))
  if (bounds) {
    rows.push({ label: 'Medida total', value: `${fmt(bounds.maxX - bounds.minX)} × ${fmt(bounds.maxY - bounds.minY)} mm` })
  }
  if (hasLogos(design)) {
    rows.push({ label: 'Logo', value: 'Adjuntá el archivo del logo al enviar el mensaje: no viaja en el enlace.' })
  }
  rows.push({ label: 'Código de diseño', value: `${designId(design)} · modelo ${product.modelId}` })
  return rows
}

/** Mensaje ordenado para enviar por WhatsApp o email. */
export function buildQuoteMessage(design: DesignState, pageUrl: string, measure: MeasureText): string {
  const rows = summaryRows(design, measure)
  const lines = [
    `Hola, ${business.name}. Quiero pedir un presupuesto para este diseño:`,
    '',
    ...rows.map((r) => `• ${r.label}: ${r.value}`),
  ]
  if (design.notes.trim()) lines.push(`• Notas: ${design.notes.trim()}`)
  lines.push('', `Ver el diseño: ${designUrl(design, pageUrl)}`)
  return lines.join('\n')
}

export function whatsappLink(message: string): string | null {
  if (!business.whatsapp) return null
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`
}

export function mailtoLink(message: string, design: DesignState): string | null {
  if (!business.email) return null
  const subject = `Presupuesto de grabado ${designId(design)}`
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
}

export function downloadFile(name: string, href: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  downloadFile(name, url)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

import type { BusinessConfig } from '../config/business'
import { LAB_PATH, labProductHref } from '../lab/intent'
import { getProduct, MATERIALS, surfacesOf } from '../lab/model/catalog'
import type { ProductDef, SurfaceDef } from '../lab/model/types'
import { CORPORATE_PATH } from './corporate'
import { MATERIAL_GUIDES, productsFor, type MaterialGuide } from './materials'
import { GIFT_IDEA_PRODUCT_IDS, PURCHASE_FAQ, type Category, type Faq } from './site'
import { WORKS, type Work } from './works'

export type CategoryDestination = { href: string; kind: 'lab' | 'whatsapp' | 'email' }

/**
 * Adónde lleva una categoría: a su producto en el Lab; si no tiene, a WhatsApp o email con la consulta armada;
 * y si no hay ningún canal cargado, al Lab sin producto elegido, que es desde donde se arma un pedido.
 */
export function categoryHref(c: Category, b: BusinessConfig): CategoryDestination {
  const productId = c.labProductIds[0] ?? null
  if (productId) return { href: labProductHref(productId), kind: 'lab' }

  const message = `Hola, ${b.name}. ${c.inquiry ?? ''}`.trim()
  if (b.whatsapp) {
    return { href: `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(message)}`, kind: 'whatsapp' }
  }
  if (b.email) return { href: `mailto:${b.email}?subject=${encodeURIComponent(message)}`, kind: 'email' }
  return { href: LAB_PATH, kind: 'lab' }
}

/** Categorías con página propia en /<slug>/: las habilitadas, salvo empresas, que tiene la suya (SPEC 19). */
export function hasCategoryPage(c: Category): boolean {
  return c.enabled && c.id !== 'empresas'
}

/** Ruta de la página de la categoría, o null si no tiene. Empresas lleva a su página propia. */
export function categoryPagePath(c: Category): string | null {
  if (c.enabled && c.id === 'empresas') return CORPORATE_PATH
  return hasCategoryPage(c) ? `/${c.slug}/` : null
}

export type CategoryLink = { href: string; kind: 'page' } | CategoryDestination

/** Enlace de la categoría en la home y el footer: su página; si no tiene, `categoryHref`. */
export function categoryLink(c: Category, b: BusinessConfig): CategoryLink {
  const page = categoryPagePath(c)
  return page ? { href: page, kind: 'page' } : categoryHref(c, b)
}

/** Una zona de grabado de la tarjeta de producto: «Hoja» → «120 × 22 mm». Con formas, una línea por forma. */
export interface ZoneLine {
  label: string
  size: string
}

export interface CategoryProduct {
  id: string
  name: string
  description: string
  href: string
  materials: string[]
  zones: ZoneLine[]
}

const mm = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })

/** Medida de una zona: ancho × alto, o los dos diámetros si es el aro de la boca de una virola. */
export function zoneSize(s: SurfaceDef): string {
  if (s.ring) return `aro de Ø ${mm.format(s.ring.outerMm)} mm (Ø ${mm.format(s.ring.innerMm)} mm por dentro)`
  return `${mm.format(s.widthMm)} × ${mm.format(s.heightMm)} mm`
}

function zonesOf(p: ProductDef): ZoneLine[] {
  if (!p.shapes?.length) return p.surfaces.map((s) => ({ label: s.name, size: zoneSize(s) }))
  return p.shapes.map((shape) => ({
    label: shape.name,
    size: surfacesOf(p, shape.id)
      .map((s) => `${s.name.toLowerCase()} ${zoneSize(s)}`)
      .join(' · '),
  }))
}

/** Productos que muestra la página de la categoría: los suyos o, en Regalos, la selección de ideas. */
export function categoryProductIds(c: Category): readonly string[] {
  return c.id === 'regalos' ? GIFT_IDEA_PRODUCT_IDS : c.labProductIds
}

/** Tarjetas de producto de la página de la categoría, con materiales y medidas tomados del catálogo del Lab. */
export function categoryProducts(c: Category): CategoryProduct[] {
  return labProducts(categoryProductIds(c))
}

/** Tarjetas de los productos del Lab pedidos, en ese orden (categorías y página de empresas). */
export function labProducts(ids: readonly string[]): CategoryProduct[] {
  return ids.map((id) => {
    const p = getProduct(id)
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      href: labProductHref(p.id),
      materials: p.materialIds.map((m) => MATERIALS[m]!.name),
      zones: zonesOf(p),
    }
  })
}

/** Secciones de la guía de materiales (SPEC 17) que graban los productos de la página. */
export function categoryMaterials(c: Category): MaterialGuide[] {
  const ids = new Set(categoryProductIds(c))
  return MATERIAL_GUIDES.filter((g) => productsFor(g).some((p) => ids.has(p.id)))
}

/** Trabajos de la galería (SPEC 16) de la categoría. */
export function categoryWorks(c: Category): Work[] {
  return WORKS.filter((w) => w.category === c.id)
}

/** Preguntas de la página: las propias y las generales de compra. Las respuestas en null no se muestran. */
export function categoryFaq(c: Category): readonly Faq[] {
  return [...c.faq, ...PURCHASE_FAQ]
}

import type { BusinessConfig } from '../config/business'
import { LAB_PATH, labProductHref } from '../lab/intent'
import type { Category } from './site'

export type CategoryDestination = { href: string; kind: 'lab' | 'whatsapp' | 'email' }

/**
 * Adónde lleva una categoría: a su producto en el Lab; si no tiene, a WhatsApp o email con la consulta armada;
 * y si no hay ningún canal cargado, al Lab sin producto elegido, que es desde donde se arma un pedido.
 */
export function categoryHref(c: Category, b: BusinessConfig): CategoryDestination {
  if (c.labProductId) return { href: labProductHref(c.labProductId), kind: 'lab' }

  const message = `Hola, ${b.name}. ${c.inquiry ?? ''}`.trim()
  if (b.whatsapp) {
    return { href: `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(message)}`, kind: 'whatsapp' }
  }
  if (b.email) return { href: `mailto:${b.email}?subject=${encodeURIComponent(message)}`, kind: 'email' }
  return { href: LAB_PATH, kind: 'lab' }
}

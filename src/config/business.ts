/**
 * Datos comerciales de AUREO Art Studio.
 *
 * Todo lo que está en `null` está PENDIENTE: completalo con los datos reales del negocio.
 * Mientras un dato falte, la web oculta el botón o enlace que lo usa (no se muestran
 * contactos que no funcionen).
 */
export interface BusinessConfig {
  name: string
  legalName: string | null
  /** Número de WhatsApp en formato internacional sin "+" ni espacios, ej. 5491112345678. */
  whatsapp: string | null
  email: string | null
  instagram: string | null
  facebook: string | null
  /** Ciudad o zona de trabajo, ej. "Buenos Aires". */
  city: string | null
  address: string | null
  /** URL pública del sitio, para Open Graph y enlaces de diseño. */
  siteUrl: string | null
}

export const business: BusinessConfig = {
  name: 'AUREO Art Studio',
  legalName: null,
  whatsapp: null,
  email: null,
  instagram: null,
  facebook: null,
  city: null,
  address: null,
  siteUrl: null,
}

export const hasDirectContact = Boolean(business.whatsapp || business.email)

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
  /** Ciudad o zona de trabajo, ej. "Buenos Aires". */
  city: string | null
  address: string | null
  /** Código postal del taller, ej. "C1427". */
  postalCode: string | null
  /** Horario en el formato de schema.org, ej. "Mo-Fr 09:00-18:00". */
  openingHours: string | null
  /** Medios de pago, en texto, ej. "Transferencia, Mercado Pago, efectivo". */
  paymentAccepted: string | null
  /** Zonas de entrega: la primera es la ciudad del taller; "Argentina" significa envíos a todo el país. */
  areaServed: readonly string[]
  /** URL pública del sitio, con el host que responde sin redirigir (canonical, Open Graph, sitemap). */
  siteUrl: string | null
}

export const business: BusinessConfig = {
  name: 'AUREO Art Studio',
  legalName: 'AUREO Art Studio',
  whatsapp: '5491135646122',
  email: 'grabados@aureoartstudio.com',
  instagram: 'https://www.instagram.com/aureoartstudio/',
  city: 'Ciudad Autónoma de Buenos Aires',
  address: 'Roseti 1514',
  postalCode: '1427',
  openingHours: 'Lu-Vi 09:00-18:00',
  paymentAccepted: 'Transferencia, Mercado Pago, efectivo',
  areaServed: ['Ciudad Autónoma de Buenos Aires', 'Gran Buenos Aires', 'Argentina'],
  // Con www: el dominio sin www redirige (308) a este host en Vercel.
  siteUrl: 'https://www.aureoartstudio.com/',
}

export const hasDirectContact = Boolean(business.whatsapp || business.email)

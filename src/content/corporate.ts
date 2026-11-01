import type { Faq, ProcessStep } from './site'

/** Condiciones de los pedidos para empresas. null = pendiente; no se muestra. */
export const CORPORATE = {
  /** p. ej. "10 unidades" */
  minimumOrder: null as string | null,
  /** p. ej. "15 días hábiles desde que se aprueba la muestra" */
  leadTime: null as string | null,
  /** true si se graba una muestra para aprobar antes de la tanda. */
  sample: null as boolean | null,
  /** p. ej. "Factura A y B" */
  invoicing: null as string | null,
  /** p. ej. "Envíos a todo el país; entregas en CABA y GBA" */
  delivery: null as string | null,
}

export type CorporateConditions = typeof CORPORATE

/** Preguntas propias de empresas: en null hasta que las confirme el taller. */
export const CORPORATE_FAQ: readonly Faq[] = [
  { q: '¿Cuál es el pedido mínimo?', a: null },
  { q: '¿Puedo ver una muestra antes de la tanda completa?', a: null },
  { q: '¿Se puede grabar un logo distinto en cada pieza, o un nombre por persona?', a: null },
  { q: '¿Emiten factura A?', a: null },
  { q: '¿Cuánto tarda un pedido de 50 o 100 unidades?', a: null },
]

export const CORPORATE_PATH = '/regalos-empresariales/'

export const CORPORATE_SEO = {
  title: 'Regalos empresariales con logo · grabado láser',
  description:
    'Grabamos el logo de tu empresa en cuchillos, mates, termos, tablas, copas y placas. Pedidos por cantidad, con vista 3D antes de producir.',
  h1: 'Regalos empresariales con el logo de tu marca',
  intro:
    'Grabamos a láser el logo de tu empresa o de tu organismo en objetos para equipos, clientes y eventos. Probá el logo sobre cada producto en el Custom Lab y pedinos el presupuesto para la cantidad que necesites.',
} as const

/** Ocasiones de compra: cada una sugiere productos del Lab (ids de PRODUCTS). */
export const CORPORATE_OCCASIONS: readonly { title: string; text: string; productIds: readonly string[] }[] = [
  {
    title: 'Regalos de fin de año',
    text: 'Un regalo con la marca para todo el equipo.',
    productIds: ['thermos-handle', 'mate-steel', 'board'],
  },
  {
    title: 'Bienvenida de empleados',
    text: 'El kit de quien se suma, con el logo de la empresa.',
    productIds: ['mate-steel', 'thermos-half', 'leather-keychain'],
  },
  {
    title: 'Clientes y proveedores',
    text: 'Un objeto que se usa todos los días y recuerda quién lo regaló.',
    productIds: ['knife', 'board', 'leather-wallet'],
  },
  {
    title: 'Eventos y congresos',
    text: 'Piezas para entregar a cada asistente o a los oradores.',
    productIds: ['glassware', 'leather-keychain', 'dog-tag'],
  },
  {
    title: 'Reconocimientos y aniversarios',
    text: 'Placas y trofeos para premiar trayectorias y celebrar fechas.',
    productIds: ['plaque-base', 'plaque-wall', 'trophy'],
  },
]

/** «Productos que más se piden con logo», en este orden. */
export const CORPORATE_PRODUCT_IDS: readonly string[] = [
  'thermos-handle',
  'thermos-half',
  'mate-steel',
  'knife',
  'board',
  'glassware',
  'leather-wallet',
  'plaque-base',
  'plaque-wall',
]

/** Pasos del proceso con empresas. La muestra sólo figura si el taller la ofrece, y la factura si está cargada. */
export function corporateSteps(c: CorporateConditions = CORPORATE): ProcessStep[] {
  return [
    {
      title: 'Nos mandás el logo y la cantidad',
      text: 'Con el archivo del logo, cuántas piezas necesitás y para cuándo.',
    },
    {
      title: 'Te proponemos productos y ubicación',
      text: 'Armamos la propuesta con la vista 3D del Custom Lab, sobre las zonas reales de cada objeto.',
    },
    ...(c.sample === true
      ? [
          {
            title: 'Grabamos una muestra para aprobar',
            text: 'Ves el logo grabado en el material antes de producir la tanda.',
          },
        ]
      : []),
    { title: 'Producimos la tanda', text: 'Grabamos todas las piezas con el diseño aprobado.' },
    c.invoicing
      ? { title: 'Entregamos o enviamos, con factura', text: 'Coordinamos la entrega o el envío y te mandamos la factura.' }
      : { title: 'Entregamos o enviamos la tanda', text: 'Coordinamos la entrega o el envío de las piezas.' },
  ]
}

export interface ConditionLine {
  label: string
  value: string
}

/** Líneas de «Datos del pedido»: sólo las que tienen dato. Sin ninguna, la sección no se muestra. */
export function corporateConditions(c: CorporateConditions = CORPORATE): ConditionLine[] {
  const lines: (ConditionLine | null)[] = [
    c.minimumOrder ? { label: 'Pedido mínimo', value: c.minimumOrder } : null,
    c.leadTime ? { label: 'Plazo de producción', value: c.leadTime } : null,
    c.sample === null
      ? null
      : {
          label: 'Muestra para aprobar',
          value: c.sample
            ? 'Sí: grabamos una pieza para que la apruebes antes de la tanda.'
            : 'No hacemos muestra: aprobás el diseño con la vista 3D del Custom Lab.',
        },
    c.invoicing ? { label: 'Facturación', value: c.invoicing } : null,
    c.delivery ? { label: 'Entrega y envíos', value: c.delivery } : null,
  ]
  return lines.filter((l): l is ConditionLine => l !== null)
}

/** Campos de CORPORATE en null, para el aviso de desarrollo. */
export function pendingCorporateFields(c: CorporateConditions = CORPORATE): string[] {
  return Object.entries(c)
    .filter(([, v]) => v === null)
    .map(([k]) => k)
}

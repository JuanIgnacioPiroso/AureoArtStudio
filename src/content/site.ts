/** Enlaces absolutos: en la home son saltos dentro de la página; desde el Custom Lab vuelven a la home. */
export const NAV = [
  { href: '/#inicio', label: 'Inicio' },
  { href: '/#productos', label: 'Productos' },
  { href: '/custom-lab/', label: 'Simulador 3D' },
  { href: '/#galeria', label: 'Galería' },
  { href: '/#proceso', label: 'Cómo trabajamos' },
  { href: '/#preguntas', label: 'Preguntas' },
  { href: '/#contacto', label: 'Contacto' },
] as const

export interface ImageAsset {
  src: string
  srcSmall: string
  width: number
  height: number
  alt: string
  /** Imagen provisional de terceros (ver public/img/placeholder/manifest.json). */
  illustrative: boolean
}

const ph = (id: string, width: number, height: number, alt: string): ImageAsset => ({
  src: `/img/placeholder/${id}-1600.webp`,
  srcSmall: `/img/placeholder/${id}-800.webp`,
  width,
  height,
  alt,
  illustrative: true,
})

export const IMAGES = {
  knife: ph('knife-stone', 1600, 900, 'Cuchillo de cocina con mango de madera clara apoyado sobre piedra'),
  board: ph('end-grain-board', 1600, 2133, 'Tabla de madera de distintos tonos sobre una mesada'),
  box: ph('engraved-box', 1600, 1067, 'Caja de madera con un diseño geométrico grabado a láser'),
  laser: ph('laser-wood-crest', 1600, 918, 'Cabezal láser grabando un escudo sobre una tabla de madera'),
  grain: ph('olive-wood-grain', 1600, 1067, 'Veta de madera de olivo vista de cerca'),
  thermos: ph('thermos-mate', 1600, 2133, 'Mate de madera con yerba y bombilla delante de un termo de acero'),
} satisfies Record<string, ImageAsset>

export interface Category {
  id: string
  name: string
  description: string
  image: ImageAsset
  /** Producto del Custom Lab que se abre al elegir la categoría, si existe. */
  labProductId: string | null
  /** Pendiente de validar con el negocio: sólo se muestran las habilitadas. */
  enabled: boolean
}

export const CATEGORIES: Category[] = [
  {
    id: 'cuchillos',
    name: 'Cuchillos y accesorios',
    description: 'Un nombre, iniciales o una fecha en la hoja o en el mango.',
    image: IMAGES.knife,
    labProductId: 'knife',
    enabled: true,
  },
  {
    id: 'tablas',
    name: 'Tablas y madera',
    description: 'Tablas para regalar o para el uso de todos los días, con el grabado sobre la cara principal.',
    image: IMAGES.board,
    labProductId: 'board',
    enabled: true,
  },
  {
    id: 'termos',
    name: 'Termos y mates',
    description: 'Termos de acero o negro mate con un nombre o una frase en el frente.',
    image: IMAGES.thermos,
    labProductId: 'thermos-handle',
    enabled: true,
  },
  {
    id: 'regalos',
    name: 'Regalos personalizados',
    description: 'Piezas con una dedicatoria pensada para una persona y una ocasión.',
    image: IMAGES.box,
    labProductId: null,
    enabled: true,
  },
  {
    id: 'empresas',
    name: 'Productos empresariales',
    description: 'Tu marca en objetos para equipos, clientes y eventos.',
    image: IMAGES.laser,
    labProductId: null,
    enabled: true,
  },
  {
    id: 'placas',
    name: 'Placas y reconocimientos',
    description: 'Placas para homenajes, inauguraciones y premios.',
    image: IMAGES.laser,
    labProductId: null,
    enabled: false,
  },
]

export const PROCESS = [
  { title: 'Elegís el producto', text: 'Partís de uno de nuestros objetos o nos contás qué querés personalizar.' },
  { title: 'Personalizás el diseño', text: 'Probás textos, tipografías y ubicación en el Custom Lab, o nos mandás tu idea.' },
  { title: 'Revisamos tu idea', text: 'Chequeamos que el diseño sea viable en el material y la zona elegida, y te proponemos ajustes si hace falta.' },
  { title: 'Recibís el presupuesto', text: 'Te pasamos el presupuesto y coordinamos los detalles del pedido.' },
  { title: 'Grabamos y entregamos', text: 'Producimos la pieza y coordinamos la entrega con vos.' },
] as const

export const DIFFERENTIALS = [
  { title: 'Personalización a medida', text: 'Cada pieza se diseña para una persona y una ocasión. No trabajamos con textos genéricos.' },
  { title: 'Diseño pensado para el objeto', text: 'El grabado se ubica donde el objeto lo permite y se ve bien con el uso: cada zona tiene medidas reales.' },
  { title: 'Ves la idea antes de pedirla', text: 'El Custom Lab muestra tu grabado sobre el objeto en 3D, con el material y la tipografía que elijas.' },
  { title: 'Te asesoramos antes de grabar', text: 'Revisamos cada diseño con vos antes de confirmar el pedido.' },
] as const

export interface Faq {
  q: string
  a: string | null
}

/** Las respuestas en null están pendientes de completar con el negocio y no se muestran. */
export const FAQ: Faq[] = [
  {
    q: '¿Qué productos puedo diseñar en el simulador?',
    a: 'Por ahora, un cuchillo con mango de madera (grabado en la hoja o en el mango) y una tabla de madera. Vamos a ir sumando más objetos. Si querés personalizar otra cosa, escribinos.',
  },
  {
    q: '¿La vista 3D muestra exactamente cómo va a quedar?',
    a: 'Es una representación orientativa: respeta las medidas de la zona, el tamaño y la ubicación del texto, pero el tono final del grabado depende de cada pieza y de su material. Antes de grabar revisamos el diseño con vos.',
  },
  {
    q: '¿Cómo pido un presupuesto?',
    a: 'Al terminar tu diseño, en el paso 5 del Custom Lab, generás un resumen con todos los datos. Podés enviarlo directamente o copiarlo y descargarlo junto con la imagen del diseño.',
  },
  {
    q: '¿Puedo retomar un diseño más tarde?',
    a: 'Sí. Con «Copiar enlace del diseño» guardás un link que abre el simulador con tu configuración exacta. No guardamos tus diseños en ningún servidor.',
  },
  { q: '¿Puedo enviar mi propio diseño o logo?', a: null },
  { q: '¿Qué materiales se pueden grabar?', a: null },
  { q: '¿Cómo se coordinan los pagos y las entregas?', a: null },
  { q: '¿Cuánto tarda un pedido?', a: null },
]

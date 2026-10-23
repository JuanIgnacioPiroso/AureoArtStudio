import { IMAGES, type ImageAsset } from './site'

export interface Work {
  id: string
  title: string
  category: 'cuchillos' | 'tablas' | 'regalos' | 'empresas'
  material: string
  detail: string
  image: ImageAsset
}

/**
 * Trabajos de la galería. TODAS las imágenes actuales son ilustrativas (de terceros, con
 * licencia libre) y se rotulan así en la interfaz. Reemplazalas por fotos de trabajos reales
 * del taller y poné `illustrative: false` en cada imagen propia.
 */
export const WORKS: Work[] = [
  {
    id: 'w-box',
    title: 'Caja con motivo geométrico',
    category: 'regalos',
    material: 'Madera',
    detail: 'Grabado de líneas finas en la tapa y los laterales.',
    image: IMAGES.box,
  },
  {
    id: 'w-crest',
    title: 'Escudo sobre tabla',
    category: 'empresas',
    material: 'Madera',
    detail: 'Logo con texto en arco, grabado a láser.',
    image: IMAGES.laser,
  },
  {
    id: 'w-knife',
    title: 'Cuchillo de cocina',
    category: 'cuchillos',
    material: 'Acero y madera',
    detail: 'Zona de grabado en la hoja, cerca de la virola.',
    image: IMAGES.knife,
  },
  {
    id: 'w-board',
    title: 'Tabla de cortes combinados',
    category: 'tablas',
    material: 'Maderas mixtas',
    detail: 'Cara principal disponible para un nombre o una frase.',
    image: IMAGES.board,
  },
]

export const WORK_CATEGORIES: { id: Work['category'] | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'cuchillos', label: 'Cuchillos' },
  { id: 'tablas', label: 'Tablas' },
  { id: 'regalos', label: 'Regalos' },
  { id: 'empresas', label: 'Empresas' },
]

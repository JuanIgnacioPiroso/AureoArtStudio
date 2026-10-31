import type { ImageMetadata } from 'astro'
import { CATEGORIES, IMAGES, type Category, type ImageAsset } from './site'

/** Imagen importada desde src/assets/works/: astro:assets genera los tamaños y el formato en el build. */
export interface WorkImage {
  src: ImageMetadata
  alt: string
}

export interface Work {
  id: string
  title: string
  /** id de una categoría de CATEGORIES. */
  category: Category['id']
  material: string
  detail: string
  /** Foto de la pieza: propia (de src/assets/works/) o ilustrativa. */
  photo: WorkImage | ImageAsset
  /** Captura del Custom Lab con el mismo diseño, si la hay. */
  labPreview?: WorkImage
  /** Producto del Lab para «Diseñar algo parecido». */
  labProductId?: string
}

export const isImageAsset = (photo: Work['photo']): photo is ImageAsset => typeof photo.src === 'string'

/** Una foto es propia si no es una imagen ilustrativa de terceros. */
export const isOwnPhoto = (photo: Work['photo']): boolean => !(isImageAsset(photo) && photo.illustrative)

/**
 * Trabajos de la galería. Las imágenes actuales son ilustrativas (de terceros, con licencia libre) y se rotulan así
 * en la interfaz. Para sumar un trabajo propio, copiá la foto en src/assets/works/, importala y agregá una entrada
 * acá (ver «Fotos» en el README). Las ilustrativas se quitan cuando haya fotos propias de la misma categoría.
 */
export const WORKS: Work[] = [
  {
    id: 'w-box',
    title: 'Caja con motivo geométrico',
    category: 'regalos',
    material: 'Madera',
    detail: 'Grabado de líneas finas en la tapa y los laterales.',
    photo: IMAGES.box,
  },
  {
    id: 'w-crest',
    title: 'Escudo sobre tabla',
    category: 'empresas',
    material: 'Madera',
    detail: 'Logo con texto en arco, grabado a láser.',
    photo: IMAGES.laser,
  },
  {
    id: 'w-knife',
    title: 'Cuchillo de cocina',
    category: 'cuchillos',
    material: 'Acero y madera',
    detail: 'Zona de grabado en la hoja, cerca de la virola.',
    photo: IMAGES.knife,
  },
  {
    id: 'w-board',
    title: 'Tabla de cortes combinados',
    category: 'tablas',
    material: 'Maderas mixtas',
    detail: 'Cara principal disponible para un nombre o una frase.',
    photo: IMAGES.board,
  },
]

/** Orden de la galería: los trabajos propios antes que los ilustrativos; dentro de cada grupo, el de WORKS. */
export function orderedWorks(works: readonly Work[] = WORKS): Work[] {
  return [...works.filter((w) => isOwnPhoto(w.photo)), ...works.filter((w) => !isOwnPhoto(w.photo))]
}

/** Filtros de la galería: «Todos» y las categorías de CATEGORIES que tienen al menos un trabajo, en ese orden. */
export function workFilters(works: readonly Work[] = WORKS): { id: string; label: string }[] {
  return [
    { id: 'todos', label: 'Todos' },
    ...CATEGORIES.filter((c) => works.some((w) => w.category === c.id)).map((c) => ({ id: c.id, label: c.name })),
  ]
}

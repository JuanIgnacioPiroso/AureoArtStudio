import type { ImageMetadata } from 'astro'
import bodegaIaccarini from '../assets/works/01-bodega-iaccarini.webp'
import arnegJubilacion from '../assets/works/02-arneg-jubilacion.webp'
import bomberosQuilmes from '../assets/works/03-bomberos-quilmes.webp'
import bandejaAdicora from '../assets/works/04-bandeja-adicora.webp'
import utnFinDeCursada from '../assets/works/05-utn-fin-de-cursada.webp'
import eseadeHonorisCausa from '../assets/works/06-eseade-honoris-causa.webp'
import marmolHungria from '../assets/works/07-marmol-embajada-hungria.webp'
import homenajeCgt from '../assets/works/09-homenaje-cgt.webp'
import municipioTigre from '../assets/works/10-cuadro-municipio-tigre.webp'
import ciudadMoto from '../assets/works/11-ciudad-moto.webp'
import imaginario from '../assets/works/13-imaginario-galeria.webp'
import granitoForestal from '../assets/works/14-granito-compania-forestal.webp'
import trofeoNalco from '../assets/works/15-trofeo-vidrio-nalco.webp'
import embajadaArgentina from '../assets/works/17-embajada-argentina.webp'
import armadaArgentina from '../assets/works/18-armada-argentina.webp'
import chapitaAdvanta from '../assets/works/19-chapa-advanta.webp'
import chapitaOctavio from '../assets/works/20-chapa-octavio.webp'
import diTella from '../assets/works/21-placa-centro-estudiantes-di-tella.jpg'
import { CATEGORIES, type Category, type ImageAsset } from './site'

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

/** Trabajos que la galería de la home muestra antes del botón «Ver más». */
export const HOME_WORKS_LIMIT = 8

/**
 * Trabajos de la galería, en el orden en que se muestran: los primeros HOME_WORKS_LIMIT son los que ve la home. Para
 * sumar uno, copiá la foto en src/assets/works/, importala y agregá una entrada acá (ver «Fotos» en el README).
 */
export const WORKS: Work[] = [
  {
    id: 'w-embajada-argentina',
    title: 'Placa de la Embajada de la República Argentina',
    category: 'placas',
    material: 'Acero inoxidable',
    detail: 'Escudo nacional y nombre de la embajada en letras grandes.',
    photo: {
      src: embajadaArgentina,
      alt: 'Placa de pared con el escudo argentino y la leyenda «Embajada de la República Argentina».',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-armada-argentina',
    title: 'Reconocimiento de la Armada Argentina',
    category: 'placas',
    material: 'Chapa negra sobre base de madera',
    detail: 'Escudo del buque multipropósito Ciudad de Rosario con dedicatoria.',
    photo: {
      src: armadaArgentina,
      alt: 'Placa negra sobre madera con el escudo de la Armada Argentina y del buque multipropósito Ciudad de Rosario, y una dedicatoria al jefe del departamento cubierta.',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-bomberos-quilmes',
    title: '50 años de Bomberos Voluntarios de Quilmes',
    category: 'placas',
    material: 'Chapa negra sobre base de madera',
    detail: 'Escudo y la dotación completa del destacamento en dos columnas.',
    photo: {
      src: bomberosQuilmes,
      alt: 'Placa negra sobre madera de la Sociedad Bomberos Voluntarios de Quilmes, destacamento Ezpeleta, con el escudo, la dotación en dos columnas y la leyenda por sus 50 años de servicio.',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-marmol-hungria',
    title: 'Homenaje de la Embajada de Hungría',
    category: 'placas',
    material: 'Mármol blanco',
    detail: 'Escudo húngaro y texto por el centenario del Hogar Húngaro San Esteban.',
    photo: {
      src: marmolHungria,
      alt: 'Placa de mármol blanco con el escudo de Hungría y el homenaje de la embajada al Hogar Húngaro San Esteban en su centenario, 1922–2022.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-trofeo-nalco',
    title: 'Trofeo de reconocimiento para Nalco Water',
    category: 'placas',
    material: 'Vidrio',
    detail: 'Logo de la empresa y nombre del premiado.',
    photo: {
      src: trofeoNalco,
      alt: 'Trofeo de vidrio octogonal con el logo de Nalco Water y la leyenda «En reconocimiento a» con el nombre del premiado.',
    },
    labProductId: 'trophy',
  },
  {
    id: 'w-chapita-advanta',
    title: 'Chapita identificatoria para Advanta',
    category: 'placas',
    material: 'Acero inoxidable',
    detail: 'Logo y nombre de la misión, con cadena de bolitas.',
    photo: {
      src: chapitaAdvanta,
      alt: 'Chapita de acero con cadena de bolitas, grabada con el logo de Advanta y la leyenda «Misión 023».',
    },
    labProductId: 'dog-tag',
  },
  {
    id: 'w-granito-forestal',
    title: 'Placa histórica de la Compañía Forestal de Tierra del Fuego',
    category: 'placas',
    material: 'Granito negro',
    detail: 'Texto en recuerdo del fundador, con letras de molde.',
    photo: {
      src: granitoForestal,
      alt: 'Placa de granito negro con la leyenda «Aquí funcionó en 1905 Compañía Forestal de Tierra del Fuego» en recuerdo de su fundador.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-utn-fin-de-cursada',
    title: 'Fin de cursada en la UTN',
    category: 'placas',
    material: 'Chapa dorada sobre base de madera',
    detail: 'Logo de la UTN, nombre del egresado, carrera y frase, con guardas en las esquinas.',
    photo: {
      src: utnFinDeCursada,
      alt: 'Placa dorada sobre madera con el logo de la UTN, el nombre del egresado, «Ingeniería en sistemas, fin de cursada», una dedicatoria y guardas en las esquinas.',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-municipio-tigre',
    title: 'Ciudadano ilustre del Municipio de Tigre',
    category: 'placas',
    material: 'Chapa dorada en cuadro con marco',
    detail: 'Logo del municipio y texto del decreto, enmarcado con paspartú.',
    photo: {
      src: municipioTigre,
      alt: 'Cuadro con marco y paspartú azul con una chapa dorada del Municipio de Tigre que declara ciudadano ilustre del partido al homenajeado.',
    },
  },
  {
    id: 'w-eseade-honoris-causa',
    title: 'Doctorado honoris causa de ESEADE',
    category: 'placas',
    material: 'Chapa dorada sobre base de madera',
    detail: 'Texto de la distinción con separadores metálicos en las esquinas.',
    photo: {
      src: eseadeHonorisCausa,
      alt: 'Placa dorada sobre madera con el nombre de ESEADE y el texto que otorga el título de doctor honoris causa, con separadores en las esquinas.',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-bodega-iaccarini',
    title: 'Reconocimiento de Bodega Iaccarini',
    category: 'placas',
    material: 'Chapa dorada sobre base de madera',
    detail: 'Logo de la bodega y agradecimiento por 11 años, con filete perimetral.',
    photo: {
      src: bodegaIaccarini,
      alt: 'Placa dorada sobre madera con el logo de Bodega Iaccarini y un agradecimiento «por pertenecer y agrandar esta gran familia en sus 11 años».',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-arneg-jubilacion',
    title: 'Placa de jubilación para Arneg',
    category: 'placas',
    material: 'Chapa dorada con separadores',
    detail: 'Logo de la empresa, nombre en letra manuscrita y dedicatoria.',
    photo: {
      src: arnegJubilacion,
      alt: 'Placa dorada con el logo de Arneg World, el nombre del homenajeado en letra manuscrita, una dedicatoria por 35 años de trabajo y «¡Feliz jubilación!».',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-ciudad-moto',
    title: 'Reconocimiento de Ciudad Moto',
    category: 'placas',
    material: 'Chapa plateada sobre base de madera',
    detail: 'Agradecimiento por 17 años, con logo y firmas.',
    photo: {
      src: ciudadMoto,
      alt: 'Placa plateada sobre madera con un agradecimiento por 17 años de trabajo, el logo de Ciudad Moto y dos firmas.',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-homenaje-cgt',
    title: 'Homenaje del Sindicato Portuario Zona Norte',
    category: 'placas',
    material: 'Acero inoxidable',
    detail: 'Dos logos y texto de homenaje, con separadores en las esquinas.',
    photo: {
      src: homenajeCgt,
      alt: 'Placa de acero con los logos del Sindicato Portuario Zona Norte y de la CGT, y un texto de homenaje fechado en San Fernando en diciembre de 2022.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-imaginario',
    title: 'Cartel de Imaginario Galería de Arte',
    category: 'placas',
    material: 'Acrílico blanco',
    detail: 'Logo de la galería con separadores dorados.',
    photo: {
      src: imaginario,
      alt: 'Cartel blanco en una pared con la leyenda «Imaginario, galería de arte» y separadores dorados en las esquinas.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-bandeja-adicora',
    title: 'Bandeja de reconocimiento para ADICORA',
    category: 'placas',
    material: 'Vidrio con borde dorado',
    detail: 'Texto de la Legislatura porteña grabado en el centro de una bandeja oval.',
    photo: {
      src: bandejaAdicora,
      alt: 'Bandeja oval con borde dorado y un reconocimiento de la Legislatura de la Ciudad de Buenos Aires a la Asociación de Directores de Coro de la República Argentina.',
    },
  },
  {
    id: 'w-chapita-octavio',
    title: 'Chapita con nombre',
    category: 'placas',
    material: 'Acero inoxidable',
    detail: 'Nombre y apellido en dos líneas.',
    photo: {
      src: chapitaOctavio,
      alt: 'Chapita de acero con cadena de bolitas y un nombre y apellido grabados en dos líneas.',
    },
    labProductId: 'dog-tag',
  },
  {
    id: 'w-di-tella',
    title: 'Placa del Centro de Estudiantes Di Tella',
    category: 'placas',
    material: 'Chapa dorada sobre base de madera',
    detail: 'Consigna en letras grandes y firma del centro de estudiantes.',
    photo: {
      src: diTella,
      alt: 'Placa dorada sobre madera con la consigna «Viva la libertad carajo» y la firma «Centro de Estudiantes Di Tella».',
    },
    labProductId: 'plaque-base',
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

import bodegaIaccarini from '../assets/works/01-bodega-iaccarini.webp'
import arnegJubilacion from '../assets/works/02-arneg-jubilacion.webp'
import bomberosQuilmes from '../assets/works/03-bomberos-quilmes.webp'
import bandejaAdicora from '../assets/works/04-bandeja-adicora.webp'
import utnFinDeCursada from '../assets/works/05-utn-fin-de-cursada.webp'
import eseadeHonorisCausa from '../assets/works/06-eseade-honoris-causa.webp'
import homenajeCgt from '../assets/works/09-homenaje-cgt.webp'
import municipioTigre from '../assets/works/10-cuadro-municipio-tigre.webp'
import ciudadMoto from '../assets/works/11-ciudad-moto.webp'
import imaginario from '../assets/works/13-imaginario-galeria.webp'
import granitoForestal from '../assets/works/14-granito-compania-forestal.webp'
import trofeoNalco from '../assets/works/15-trofeo-vidrio-nalco.webp'
import armadaArgentina from '../assets/works/18-armada-argentina.webp'
import chapitaAdvanta from '../assets/works/19-chapa-advanta.webp'
import chapitaOctavio from '../assets/works/20-chapa-octavio.webp'
import diTella from '../assets/works/21-placa-centro-estudiantes-di-tella.jpg'
import trofeoAesa from '../assets/works/23-trofeo-aesa-veolia.webp'
import panelUba from '../assets/works/27-panel-acero-uba.webp'
import chapitasMascotas from '../assets/works/28-chapitas-hueso-mascotas.webp'
import granitoPeron from '../assets/works/30-granito-peron-pj-tigre.webp'
import marmolTigre from '../assets/works/31-marmol-municipio-tigre.webp'
import portanombreAbogada from '../assets/works/32-portanombre-abogada.webp'
import placaAmerisourcebergen from '../assets/works/33-placa-amerisourcebergen.webp'
import marmolMalvinas from '../assets/works/34-marmol-heroes-de-malvinas.webp'
import marmolAraSanJuan from '../assets/works/36-marmol-ara-san-juan.webp'
import acrilicoEp167 from '../assets/works/37-acrilico-ep167-50-anos.webp'
import marmolKirchner from '../assets/works/38-marmol-homenaje-pj-pilar.webp'
import retratoMarmol from '../assets/works/39-retrato-grabado-en-marmol.webp'
import marmolRimec6 from '../assets/works/40-marmol-rimec6-gral-viamonte.webp'
import cuadrosSalud from '../assets/works/41-cuadros-direccion-general-salud.webp'
import placaLogias from '../assets/works/44-placa-bronce-estuche-logias.webp'
import bronceEnElTaller from '../assets/works/46-grabado-bronce-en-proceso.webp'
import bandejaCfj from '../assets/works/47-bandeja-oval-cfj.webp'
import medallasPadel from '../assets/works/48-medallas-asociacion-padel.webp'
import acrilicoLedTaval from '../assets/works/49-acrilico-led-taval-dervos.webp'
import trofeoArteNuevo from '../assets/works/51-trofeo-vidrio-arte-nuevo.webp'
import { CATEGORIES, IMAGES, type Category, type ImageAsset, type OwnImage } from './site'

/** Imagen importada desde src/assets/works/: astro:assets genera los tamaños y el formato en el build. */
export type WorkImage = OwnImage

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

/** Trabajos que muestra cada grilla (home, filtros y páginas de categoría) antes del botón «Ver más». */
export const WORKS_LIMIT = 8

/**
 * Trabajos de la galería, en el orden en que se muestran: los primeros WORKS_LIMIT son los que ve cada grilla. Para
 * sumar uno, copiá la foto en src/assets/works/, importala y agregá una entrada acá (ver «Fotos» en el README).
 */
export const WORKS: Work[] = [
  {
    id: 'w-embajada-argentina',
    title: 'Placa de la Embajada de la República Argentina',
    category: 'placas',
    material: 'Acero inoxidable',
    detail: 'Escudo nacional y nombre de la embajada en letras grandes.',
    photo: IMAGES.embajada,
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-termo-ypf-colapinto',
    title: 'Termo con los logos de YPF y Franco Colapinto',
    category: 'termos',
    material: 'Acero con pintura negra mate',
    detail: 'Logos de YPF y del piloto grabados a metal en el frente.',
    photo: IMAGES.termo,
    labProductId: 'thermos-handle',
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
    id: 'w-perro-en-piedra',
    title: 'Retrato de un cachorro en piedra',
    category: 'regalos',
    material: 'Piedra',
    detail: 'Grabado a partir de una foto, con el detalle del pelaje.',
    photo: IMAGES.perro,
  },
  {
    id: 'w-marmol-hungria',
    title: 'Homenaje de la Embajada de Hungría',
    category: 'placas',
    material: 'Mármol blanco',
    detail: 'Escudo húngaro y texto por el centenario del Hogar Húngaro San Esteban.',
    photo: IMAGES.hungria,
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-copas-en-el-rotativo',
    title: 'Copas de cristal en el rotativo',
    category: 'copas',
    material: 'Cristal',
    detail: 'Copas de vino en la máquina, mientras se graban.',
    photo: IMAGES.copas,
    labProductId: 'glassware',
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
    id: 'w-mate-navegar-en-paz',
    title: 'Mate de acero «Navegar en paz»',
    category: 'termos',
    material: 'Acero inoxidable',
    detail: 'Frase y un barco grabados en el borde de la boca.',
    photo: IMAGES.mate,
    labProductId: 'mate-steel',
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
  {
    id: 'w-panel-uba',
    title: 'Inauguración en la Facultad de Filosofía y Letras (UBA)',
    category: 'placas',
    material: 'Acero inoxidable',
    detail: 'Logo de la UBA, texto de la inauguración del edificio anexo y la nómina de autoridades.',
    photo: {
      src: panelUba,
      alt: 'Panel de acero con el logo de la Universidad de Buenos Aires, el texto de la inauguración del edificio anexo de la Facultad de Filosofía y Letras y la nómina de autoridades.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-trofeo-aesa',
    title: 'Trofeo de reconocimiento para AESA Buenos Aires',
    category: 'placas',
    material: 'Acrílico bordó sobre base metálica',
    detail: 'Logos de AESA y Veolia y reconocimiento por asistencia perfecta.',
    photo: {
      src: trofeoAesa,
      alt: 'Trofeo bordó sobre base metálica con los logos de AESA y Veolia y un reconocimiento por asistencia perfecta.',
    },
    labProductId: 'trophy',
  },
  {
    id: 'w-trofeo-linde',
    title: 'Premio a la trayectoria de Linde',
    category: 'placas',
    material: 'Acrílico transparente y chapa plateada sobre base de madera',
    detail: 'Logo recortado en acrílico y chapa con la mención por 20 años de servicio.',
    photo: IMAGES.linde,
    labProductId: 'trophy',
  },
  {
    id: 'w-marmol-tigre',
    title: 'Cartel del Municipio de Tigre',
    category: 'placas',
    material: 'Mármol blanco',
    detail: 'Logo con el jaguar y el nombre del municipio en letras grandes.',
    photo: {
      src: marmolTigre,
      alt: 'Placa de mármol blanco con el logo del jaguar y la leyenda «Municipio de Tigre» en letras grandes.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-marmol-ara-san-juan',
    title: 'Homenaje a los tripulantes del ARA San Juan',
    category: 'placas',
    material: 'Mármol blanco',
    detail: 'Escudos y texto por el quinto aniversario del naufragio.',
    photo: {
      src: marmolAraSanJuan,
      alt: 'Placa de mármol blanco con el escudo del submarino ARA San Juan y la leyenda «En recuerdo de sus abnegados tripulantes en el Vº aniversario de su naufragio».',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-marmol-malvinas',
    title: 'Placa del Edificio Héroes de Malvinas',
    category: 'placas',
    material: 'Mármol blanco',
    detail: 'Nombre del edificio y el mapa de las islas pintado en celeste.',
    photo: {
      src: marmolMalvinas,
      alt: 'Placa de mármol blanco con la leyenda «Edificio Héroes de Malvinas» y el mapa de las islas pintado en celeste.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-marmol-rimec6',
    title: 'Homenaje a los veteranos del RIMec 6 «Gral. Viamonte»',
    category: 'placas',
    material: 'Mármol blanco',
    detail: 'Escudos, texto del bicentenario y la nómina de veteranos del regimiento.',
    photo: {
      src: marmolRimec6,
      alt: 'Placa de mármol blanco con los escudos del Regimiento de Infantería Mecanizado 6 «General Viamonte», el texto por el bicentenario y la nómina de veteranos de Malvinas.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-acrilico-ep167',
    title: '50 años de la Escuela Primaria 167 de La Matanza',
    category: 'placas',
    material: 'Acrílico blanco',
    detail: 'Logo del aniversario y la nómina del personal en columnas.',
    photo: {
      src: acrilicoEp167,
      alt: 'Placa blanca con el logo por los 50 años de la Escuela Primaria 167 de La Matanza y la nómina del personal en columnas.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-placa-amerisourcebergen',
    title: 'Aniversario de 10 años en AmerisourceBergen',
    category: 'placas',
    material: 'Chapa dorada sobre base de madera',
    detail: 'Saludo en letra manuscrita, dedicatoria y logo de la empresa.',
    photo: {
      src: placaAmerisourcebergen,
      alt: 'Placa dorada sobre madera con un saludo en letra manuscrita, una dedicatoria por 10 años en la empresa y el logo de AmerisourceBergen.',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-placa-logias',
    title: 'Placa de hermanamiento entre logias',
    category: 'placas',
    material: 'Chapa dorada sobre madera, en estuche',
    detail: 'Texto del hermanamiento, dos emblemas y guarda perimetral.',
    photo: {
      src: placaLogias,
      alt: 'Placa dorada sobre madera dentro de un estuche abierto, con el texto del hermanamiento entre dos logias, sus emblemas y una guarda perimetral.',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-cuadros-salud',
    title: 'Reconocimiento de la Dirección General de Salud',
    category: 'placas',
    material: 'Chapa negra en marco dorado',
    detail: 'Logo por los 100 años de la dirección y reconocimiento a la trayectoria.',
    photo: {
      src: cuadrosSalud,
      alt: 'Cuadros con marco dorado y chapa negra con el logo por los 100 años de la Dirección General de Salud y un reconocimiento a la trayectoria.',
    },
  },
  {
    id: 'w-acrilico-led-taval',
    title: 'Cartel con luz para Taval y Dervos',
    category: 'placas',
    material: 'Acrílico sobre base de luz LED',
    detail: 'Logos de las dos empresas y mensaje por 10 años de relación comercial.',
    photo: {
      src: acrilicoLedTaval,
      alt: 'Acrílico iluminado sobre una base de luz LED con los logos de Taval y Dervos y un mensaje por 10 años de relación comercial.',
    },
  },
  {
    id: 'w-trofeo-arte-nuevo',
    title: 'Trofeo por los 40 años del Grupo Arte Nuevo',
    category: 'placas',
    material: 'Acrílico bordó sobre base metálica',
    detail: 'Logo de la asociación y homenaje a su director.',
    photo: {
      src: trofeoArteNuevo,
      alt: 'Trofeo bordó sobre base metálica con el logo del Grupo Arte Nuevo y un homenaje a su director por los 40 años de la asociación.',
    },
    labProductId: 'trophy',
  },
  {
    id: 'w-bandeja-cfj',
    title: 'Bandeja del Centro de Formación Judicial',
    category: 'placas',
    material: 'Bandeja oval de metal con borde dorado',
    detail: 'Logo del centro y texto por los diez años del instituto.',
    photo: {
      src: bandejaCfj,
      alt: 'Bandeja oval con borde dorado, grabada con el logo del Centro de Formación Judicial y un texto por los diez años del instituto.',
    },
  },
  {
    id: 'w-medallas-padel',
    title: 'Medallas de la Asociación de Pádel',
    category: 'placas',
    material: 'Metal con cinta',
    detail: 'Escudo de la asociación en medallas con cinta celeste y blanca.',
    photo: {
      src: medallasPadel,
      alt: 'Medallas con cinta celeste y blanca, grabadas con el escudo de la Asociación de Pádel.',
    },
  },
  {
    id: 'w-portanombre-abogada',
    title: 'Portanombre de escritorio',
    category: 'placas',
    material: 'Chapa negra sobre base de madera',
    detail: 'Nombre, profesión y la balanza de la justicia.',
    photo: {
      src: portanombreAbogada,
      alt: 'Portanombre de escritorio con chapa negra sobre madera, grabado con un nombre, la palabra «Abogada» y la balanza de la justicia.',
    },
    labProductId: 'plaque-base',
  },
  {
    id: 'w-granito-peron',
    title: 'Placa del Día de la Lealtad del PJ de Tigre',
    category: 'placas',
    material: 'Granito negro',
    detail: 'Texto en conmemoración y logo del partido.',
    photo: {
      src: granitoPeron,
      alt: 'Placa de granito negro con un texto en conmemoración del Día de la Lealtad y el logo del Partido Justicialista de Tigre.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-marmol-kirchner',
    title: 'Homenaje del PJ de Pilar',
    category: 'placas',
    material: 'Mármol blanco en caja de acrílico',
    detail: 'Logo, fecha y texto del homenaje a Néstor Kirchner.',
    photo: {
      src: marmolKirchner,
      alt: 'Placa de mármol blanco en una caja de acrílico con el logo del Partido Justicialista de Pilar, la fecha y un homenaje a Néstor Kirchner.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-bandeja-en-el-taller',
    title: 'Bandeja de acero en el taller',
    category: 'placas',
    material: 'Acero inoxidable',
    detail: 'Dedicatoria por 42 años de servicio, en la máquina mientras se graba.',
    photo: IMAGES.bandejaTaller,
  },
  {
    id: 'w-bronce-en-el-taller',
    title: 'Placa de bronce en el taller',
    category: 'placas',
    material: 'Bronce',
    detail: 'Reconocimiento a un docente, en la máquina mientras se graba.',
    photo: {
      src: bronceEnElTaller,
      alt: 'Placa de bronce en la máquina láser mientras se graba un reconocimiento a un docente.',
    },
    labProductId: 'plaque-wall',
  },
  {
    id: 'w-caja-cumpleanos',
    title: 'Caja de cumpleaños de MDF',
    category: 'regalos',
    material: 'MDF',
    detail: 'Caja con encastres, «Happy Birthday» y Darth Vader en el frente.',
    photo: IMAGES.caja,
  },
  {
    id: 'w-chapitas-mascotas',
    title: 'Chapitas para mascotas',
    category: 'regalos',
    material: 'Acero inoxidable',
    detail: 'Dos chapitas con forma de hueso, con el nombre y el dibujo de cada perro.',
    photo: {
      src: chapitasMascotas,
      alt: 'Dos chapitas de acero con forma de hueso, cada una con el nombre y el dibujo de un perro.',
    },
    labProductId: 'dog-tag',
  },
  {
    id: 'w-retrato-marmol',
    title: 'Retrato grabado en mármol',
    category: 'regalos',
    material: 'Mármol blanco',
    detail: 'Retrato a partir de una foto, con toda la escala de grises.',
    photo: {
      src: retratoMarmol,
      alt: 'Placa de mármol blanco con un retrato grabado a partir de una foto, con toda la escala de grises.',
    },
    labProductId: 'plaque-wall',
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

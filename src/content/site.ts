import type { ImageMetadata } from "astro";
import marmolHungria from "../assets/works/07-marmol-embajada-hungria.webp";
import embajadaArgentina from "../assets/works/17-embajada-argentina.webp";
import cajaCumpleanos from "../assets/works/24-caja-mdf-cumpleanos.webp";
import mateNavegarEnPaz from "../assets/works/26-mate-acero-navegar-en-paz.webp";
import trofeoLinde from "../assets/works/29-trofeo-acrilico-linde.webp";
import perroEnPiedra from "../assets/works/42-grabado-perro-sobre-piedra.webp";
import bandejaEnElTaller from "../assets/works/45-bandeja-acero-en-grabado.webp";
import copasEnElRotativo from "../assets/works/50-grabado-copas-de-cristal.webp";
import termoYpfColapinto from "../assets/works/52-termo-ypf-franco-colapinto.webp";

/** Enlaces absolutos: en la home son saltos dentro de la página; desde el Custom Lab vuelven a la home. */
export const NAV = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#productos", label: "Productos" },
  { href: "/custom-lab/", label: "Simulador 3D" },
  { href: "/#galeria", label: "Galería" },
  { href: "/#preguntas", label: "Preguntas" },
  { href: "/#contacto", label: "Contacto" },
] as const;

/** Textos del <head> de la home. La description nombra la ciudad cuando business.city está cargada. */
export const HOME_SEO = {
  title: "Grabado láser personalizado · cuchillos, mates y tablas",
  description: (city: string | null) =>
    city
      ? `Grabado láser personalizado en ${city}: cuchillos, tablas, mates, copas y cuero. Probá tu diseño en 3D y pedí presupuesto.`
      : "Grabamos nombres, fechas y logos en cuchillos, tablas, mates, copas y cuero. Probá tu diseño en 3D antes de pedir presupuesto.",
  ogTitle: "AUREO Art Studio · Grabados láser que dejan huella",
} as const;

export const LAB_SEO = {
  title: "Simulador de grabado láser 3D · AUREO Custom Lab",
  description:
    "Elegí un objeto, escribí tu nombre o subí tu logo y mirá en 3D cómo queda el grabado antes de pedir tu presupuesto.",
} as const;

export interface ImageAsset {
  src: string;
  srcSmall: string;
  width: number;
  height: number;
  alt: string;
  /** Imagen provisional de terceros (ver public/img/placeholder/manifest.json). */
  illustrative: boolean;
}

/** Foto del taller, importada desde src/assets/works/: astro:assets genera los tamaños en el build. */
export interface OwnImage {
  src: ImageMetadata;
  alt: string;
  /** object-position para los recortes 4:3 (tarjetas) y 16:10 (hero); centro si no se pasa. */
  position?: string;
}

export type SiteImage = ImageAsset | OwnImage;

export const isIllustrative = (image: SiteImage): image is ImageAsset =>
  typeof image.src === "string";

const ph = (
  id: string,
  width: number,
  height: number,
  alt: string,
): ImageAsset => ({
  src: `/img/placeholder/${id}-1600.webp`,
  srcSmall: `/img/placeholder/${id}-800.webp`,
  width,
  height,
  alt,
  illustrative: true,
});

export const IMAGES = {
  knife: ph(
    "knife-stone",
    1600,
    900,
    "Cuchillo de cocina con mango de madera clara apoyado sobre piedra",
  ),
  board: ph(
    "end-grain-board",
    1600,
    2133,
    "Tabla de madera de distintos tonos sobre una mesada",
  ),
  leather: ph(
    "leather-belts",
    1600,
    1067,
    "Dos cinturones de cuero negro enrollados, con una hebilla plateada y otra dorada",
  ),
  // Fotos del taller: las usan la galería (WORKS), las tarjetas, la guía de materiales y el hero.
  termo: {
    src: termoYpfColapinto,
    alt: "Termo negro mate con manija, grabado en el frente con el logo de YPF y el de Franco Colapinto a la vista del acero.",
  },
  copas: {
    src: copasEnElRotativo,
    alt: "Copas de vino de cristal montadas en el rotativo de la máquina láser, mientras se graban.",
  },
  perro: {
    src: perroEnPiedra,
    alt: "Piedra pulida con el retrato grabado de un cachorro, hecho a partir de una foto, con el pelaje en detalle.",
  },
  embajada: {
    src: embajadaArgentina,
    alt: "Placa de pared con el escudo argentino y la leyenda «Embajada de la República Argentina».",
  },
  linde: {
    src: trofeoLinde,
    position: "center 35%",
    alt: "Trofeo con el logo de Linde recortado en acrílico transparente sobre base de madera y una chapa plateada con la mención por 20 años de servicio.",
  },
  caja: {
    src: cajaCumpleanos,
    alt: "Caja de MDF armada con encastres, con «Happy Birthday» y la figura de Darth Vader grabados en el frente.",
  },
  mate: {
    src: mateNavegarEnPaz,
    alt: "Mate de acero inoxidable con la frase «Navegar en paz» y un barco grabados en el borde de la boca.",
  },
  hungria: {
    src: marmolHungria,
    alt: "Placa de mármol blanco con el escudo de Hungría y el homenaje de la embajada al Hogar Húngaro San Esteban en su centenario, 1922–2022.",
  },
  bandejaTaller: {
    src: bandejaEnElTaller,
    alt: "Bandeja de acero en la cama de la máquina láser mientras se graba una dedicatoria por 42 años de servicio.",
  },
} satisfies Record<string, SiteImage>;

export interface Category {
  id: string;
  /** Ruta de la página de la categoría, sin barras: /<slug>/. */
  slug: string;
  name: string;
  description: string;
  image: SiteImage;
  /** Productos del Custom Lab de la categoría, en orden; el primero es el que se abre al elegirla. Vacío si no tiene. */
  labProductIds: readonly string[];
  /** Consulta para WhatsApp o asunto de email cuando la categoría no tiene producto en el Lab, sin el saludo. */
  inquiry: string | null;
  /** Pendiente de validar con el negocio: sólo se muestran las habilitadas. */
  enabled: boolean;
  /** Textos de la página de la categoría. */
  seo: { title: string; description: string; h1: string; intro: string };
  /** Preguntas propias de la categoría; las respuestas en null no se muestran. */
  faq: readonly Faq[];
}

export const CATEGORIES: Category[] = [
  {
    id: "cuchillos",
    slug: "cuchillos-grabados",
    name: "Cuchillos y accesorios",
    description: "Un nombre, iniciales o una fecha en la hoja o en el mango.",
    image: IMAGES.knife,
    labProductIds: ["knife"],
    inquiry: null,
    enabled: true,
    seo: {
      title: "Cuchillos grabados con nombre · grabado láser",
      description:
        "Cuchillos con un nombre, iniciales, una fecha o tu logo grabados a láser en la hoja o en el mango. Probá el diseño en 3D y pedí presupuesto.",
      h1: "Cuchillos grabados con tu nombre o tu logo",
      intro:
        "Grabamos a láser nombres, iniciales, fechas y logos en la hoja de acero o en el mango de madera. Cada zona tiene medidas reales, así que podés probar el diseño en el Custom Lab antes de pedirlo.",
    },
    faq: [
      { q: "¿Se graba la hoja o el mango?", a: null },
      { q: "¿El grabado se va con el uso o el afilado?", a: null },
    ],
  },
  {
    id: "tablas",
    slug: "tablas-personalizadas",
    name: "Tablas y madera",
    description:
      "Tablas para regalar o para el uso de todos los días, con el grabado sobre la cara principal.",
    image: IMAGES.board,
    labProductIds: ["board"],
    inquiry: null,
    enabled: true,
    seo: {
      title: "Tablas personalizadas grabadas a láser",
      description:
        "Tablas de madera con un nombre, una frase o un logo grabados a láser en la cara principal. Probá tu diseño en 3D y pedí presupuesto.",
      h1: "Tablas de madera personalizadas",
      intro:
        "Grabamos a láser nombres, frases, fechas y logos sobre la cara principal de la tabla. Probá el texto, la tipografía y la ubicación en el Custom Lab antes de pedirla.",
    },
    faq: [
      { q: "¿Se puede usar para cortar?", a: null },
      { q: "¿Qué madera es?", a: null },
    ],
  },
  {
    id: "termos",
    slug: "mates-y-termos-grabados",
    name: "Termos y mates",
    description:
      "Termos y mates de acero, madera o cuero, con un nombre o una frase en el cuerpo o en la virola.",
    image: IMAGES.termo,
    labProductIds: [
      "thermos-handle",
      "thermos-half",
      "mate-wood",
      "mate-steel",
      "mate-camionero",
      "mate-imperial",
    ],
    inquiry: null,
    enabled: true,
    seo: {
      title: "Mates y termos grabados con nombre o logo",
      description:
        "Mates de madera, acero o forrados en cuero y termos de acero con un nombre, una frase o un logo grabados a láser. Probá tu diseño en 3D y pedí presupuesto.",
      h1: "Mates y termos grabados a láser",
      intro:
        "Grabamos nombres, frases y logos en termos, mates de madera, de acero, camioneros e imperiales, en el cuerpo o en la virola. Elegí el modelo, probá el diseño en 3D y pedí tu presupuesto.",
    },
    faq: [
      { q: "¿Se graba la virola de alpaca?", a: null },
      { q: "¿Puedo traer mi propio mate o termo?", a: null },
    ],
  },
  {
    id: "copas",
    slug: "copas-y-vasos-grabados",
    name: "Copas y vasos",
    description:
      "Copas, vasos y jarros de vidrio con nombres o una fecha grabados en esmerilado.",
    image: IMAGES.copas,
    labProductIds: ["glassware"],
    inquiry: null,
    enabled: true,
    seo: {
      title: "Copas y vasos grabados a láser · personalizados",
      description:
        "Copas, vasos y jarros de vidrio con nombres, iniciales o una fecha grabados en esmerilado. Probá tu diseño en 3D y pedí presupuesto.",
      h1: "Copas y vasos grabados con nombres o fechas",
      intro:
        "Grabamos nombres, iniciales y fechas en copas, vasos y jarros de vidrio, con un acabado esmerilado. Probá el diseño en el Custom Lab antes de pedirlo.",
    },
    faq: [
      { q: "¿Se pueden lavar en el lavavajillas?", a: null },
      { q: "¿Hacen juegos para casamientos?", a: null },
    ],
  },
  {
    id: "cuero",
    slug: "cuero-grabado",
    name: "Cuero",
    description:
      "Billeteras, llaveros y cinturones de cuero con un nombre o iniciales grabados a láser.",
    image: IMAGES.leather,
    labProductIds: ["leather-wallet", "leather-keychain", "leather-belt"],
    inquiry: null,
    enabled: true,
    seo: {
      title: "Billeteras, llaveros y cinturones de cuero grabados",
      description:
        "Billeteras, llaveros y cinturones de cuero con un nombre, iniciales o un logo grabados a láser. Probá tu diseño en 3D y pedí presupuesto.",
      h1: "Cuero grabado a láser",
      intro:
        "Grabamos a láser nombres, iniciales y logos en billeteras, llaveros y cinturones de cuero. Elegí la pieza y el color del cuero, y probá el diseño en el Custom Lab.",
    },
    faq: [
      { q: "¿Qué colores de cuero hay?", a: null },
      { q: "¿Se puede grabar un logo?", a: null },
    ],
  },
  {
    id: "regalos",
    slug: "regalos-personalizados",
    name: "Regalos personalizados",
    description:
      "Piezas con una dedicatoria pensada para una persona y una ocasión.",
    image: IMAGES.perro,
    labProductIds: [],
    inquiry: "Quiero consultar por un regalo personalizado.",
    enabled: true,
    seo: {
      title: "Regalos personalizados grabados a láser",
      description:
        "Regalos con un nombre, una fecha o una dedicatoria grabados a láser: cuchillos, tablas, mates, copas, cuero y placas. Contanos la ocasión.",
      h1: "Regalos personalizados con grabado láser",
      intro:
        "Un regalo grabado lleva el nombre, la fecha o la frase de quien lo recibe. Te mostramos algunas ideas y te ayudamos a elegir la pieza y el diseño para cada ocasión.",
    },
    faq: [],
  },
  {
    id: "empresas",
    /** La página es /regalos-empresariales/ (SPEC 19, textos en src/content/corporate.ts); seo no se usa. */
    slug: "regalos-empresariales",
    name: "Productos empresariales",
    description: "Tu marca en objetos para equipos, clientes y eventos.",
    image: IMAGES.linde,
    labProductIds: [],
    inquiry: "Quiero consultar por productos con el logo de mi empresa.",
    enabled: true,
    seo: {
      title: "Regalos empresariales con logo grabado a láser",
      description:
        "Regalos corporativos y productos con el logo de tu empresa grabado a láser, para equipos, clientes y eventos. Pedí tu presupuesto.",
      h1: "Regalos empresariales con tu logo",
      intro:
        "Grabamos el logo de tu empresa en objetos para equipos, clientes y eventos. Contanos qué necesitás y te pasamos el presupuesto.",
    },
    faq: [],
  },
  {
    id: "placas",
    slug: "placas-y-reconocimientos",
    name: "Placas y reconocimientos",
    description: "Placas para homenajes, inauguraciones y premios.",
    image: IMAGES.embajada,
    labProductIds: ["plaque-base", "plaque-wall", "dog-tag", "trophy"],
    inquiry: null,
    enabled: true,
    seo: {
      title: "Placas y reconocimientos grabados · trofeos",
      description:
        "Placas, chapitas y trofeos grabados a láser para homenajes, inauguraciones y premios. Probá el texto en 3D y pedí presupuesto.",
      h1: "Placas, trofeos y reconocimientos grabados",
      intro:
        "Grabamos placas sobre base o de pared, chapitas y trofeos para homenajes, inauguraciones y premios. Probá el texto y la ubicación en el Custom Lab antes de pedirlo.",
    },
    faq: [
      { q: "¿Cuánto texto entra en una placa?", a: null },
      { q: "¿Hacen trofeos por cantidad?", a: null },
    ],
  },
];

/** «Ideas para regalar» de la página de Regalos: un producto del Lab por categoría. */
export const GIFT_IDEA_PRODUCT_IDS: readonly string[] = [
  "knife",
  "board",
  "mate-wood",
  "glassware",
  "leather-wallet",
  "plaque-base",
];

export interface ProcessStep {
  title: string;
  text: string;
}

export const DIFFERENTIALS = [
  {
    title: "Personalización a medida",
    text: "Cada pieza se diseña para una persona y una ocasión. No trabajamos con textos genéricos.",
  },
  {
    title: "Diseño pensado para el objeto",
    text: "El grabado se ubica donde el objeto lo permite y se ve bien con el uso: cada zona tiene medidas reales.",
  },
  {
    title: "Ves la idea antes de pedirla",
    text: "El Custom Lab muestra tu grabado sobre el objeto en 3D, con el material y la tipografía que elijas.",
  },
  {
    title: "Te asesoramos antes de grabar",
    text: "Revisamos cada diseño con vos antes de confirmar el pedido.",
  },
] as const;

export interface Faq {
  q: string;
  a: string | null;
  /** Enlace opcional al final de la respuesta. */
  link?: { href: string; label: string };
}

/** Preguntas generales de compra (precio, plazos, envíos): van en el FAQ de la home y en cada página de categoría. */
export const PURCHASE_FAQ: readonly Faq[] = [
  {
    q: "¿Cuánto cuesta un grabado personalizado?",
    a: "El precio depende del producto, el material, el tamaño y la complejidad del diseño. Podés personalizar tu pieza en nuestro Custom Lab 3D y enviarnos el resultado para recibir un presupuesto sin compromiso.",
  },
  {
    q: "¿Cuánto tarda un pedido?",
    a: "El tiempo de producción depende del producto y la cantidad de piezas. Una vez confirmado el diseño y el presupuesto, te informamos el plazo estimado de entrega.",
  },
  {
    q: "¿Hacen envíos? ¿A qué zonas?",
    a: "Consultanos por las opciones de entrega y envío disponibles. Trabajamos con pedidos personalizados y coordinamos la entrega para que recibas tu producto donde lo necesites.",
  },
];

/** Las respuestas en null están pendientes de completar con el negocio y no se muestran. */
export const FAQ: Faq[] = [
  {
    q: "¿La vista 3D muestra exactamente cómo va a quedar?",
    a: "Es una representación orientativa: respeta las medidas de la zona, el tamaño y la ubicación del texto, pero el tono final del grabado depende de cada pieza y de su material. Antes de grabar revisamos el diseño con vos.",
  },
  {
    q: "¿Cómo pido un presupuesto?",
    a: "Al terminar tu diseño, en el paso 5 del Custom Lab, generás un resumen con todos los datos. Podés enviarlo directamente o copiarlo y descargarlo junto con la imagen del diseño.",
  },
  ...PURCHASE_FAQ,
  {
    q: "¿Cómo se paga?",
    a: "Una vez confirmado el diseño y el presupuesto, te informamos los medios de pago disponibles para realizar tu pedido.",
  },
  {
    q: "¿Hacen pedidos por cantidad o para empresas?",
    a: "¡Sí! Realizamos regalos empresariales, productos institucionales y reconocimientos personalizados. Grabamos logos y diseños corporativos en distintos materiales para empresas, equipos de trabajo, clientes y eventos. Consultanos por presupuestos especiales por cantidad.",
  },
  {
    q: "¿Puedo enviar mi propio diseño o logo? ¿En qué formato?",
    a: "¡Por supuesto! Podés enviarnos tu logo, imagen o diseño para personalizar tu producto. Preferentemente trabajamos con archivos vectoriales como SVG, AI, EPS o PDF, aunque también podemos evaluar imágenes PNG o JPG según el diseño.",
  },
  {
    q: "¿Qué materiales se pueden grabar?",
    a: "Realizamos grabados láser sobre distintos materiales, como acero inoxidable, madera, cuero, vidrio, acrílico y piedra, entre otros. Cada material requiere una técnica específica para conseguir el mejor resultado. Consultá nuestra guía de materiales para conocer más.",
    link: { href: "/materiales/", label: "Ver la guía de materiales" },
  },
  {
    q: "¿Las tablas grabadas se pueden usar con alimentos?",
    a: "Sí, las tablas de madera pueden utilizarse para alimentos. Recomendamos limpiarlas adecuadamente después de cada uso, evitar dejarlas en remojo y seguir los cuidados correspondientes para conservar la madera.",
  },
  {
    q: "¿Cómo cuido una pieza grabada?",
    a: "Los cuidados dependen del material. En general, recomendamos evitar productos abrasivos, golpes y métodos de limpieza agresivos. Para conservar tu producto personalizado durante más tiempo, te indicamos los cuidados específicos según cada pieza.",
  },
  {
    q: "¿Puedo retomar un diseño más tarde?",
    a: "Sí. Con «Copiar enlace del diseño» guardás un link que abre el simulador con tu configuración exacta. No guardamos tus diseños en ningún servidor.",
  },
];

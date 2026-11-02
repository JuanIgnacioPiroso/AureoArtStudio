# SPEC 22 — Fotos propias en lugar de imágenes ilustrativas

> **Estado:** Aprobado
> **Depende de:** SPEC 16, SPEC 17, SPEC 18, SPEC 20, SPEC 21
> **Fecha:** 2026-11-01
> **Objetivo:** Reemplazar las imágenes ilustrativas por las mejores fotos propias de cada tema, dejar ilustrativas sólo donde no hay foto del taller y poner un collage de trabajos propios en el hero de la home.

---

## Por qué esta spec

Con la SPEC 21 la galería ya tiene 45 trabajos propios, pero el resto del sitio sigue mostrando fotos de Wikimedia marcadas «Imagen ilustrativa»: 8 archivos repartidos en las tarjetas de «Qué personalizamos», los encabezados de cada página de categoría, la sección «Cada material pide su grabado» y la guía de materiales. Varias muestran objetos que el taller ya fotografió: un termo, copas, una caja, mármol. Y el hero, lo primero que se ve, es una captura del Custom Lab, no un trabajo real.

La regla de esta spec: en cada lugar va la foto propia que mejor representa el título. Si no hay ninguna (cuchillos, tablas, cuero), queda la ilustrativa.

---

## Alcance

**Entra:**

- **Imágenes propias en `IMAGES`** (`src/content/site.ts`): 9 entradas nuevas que importan fotos de `src/assets/works/` (ver «Modelo de datos»).
- **Tarjetas y encabezados de categoría** (`CATEGORIES[].image`, que usan `Categories.astro`, `[categoria]/index.astro` y `regalos-empresariales/index.astro`):
  - Termos y mates → termo YPF (52).
  - Copas y vasos → copas en el rotativo (50).
  - Regalos personalizados → cachorro en piedra (42).
  - Placas y reconocimientos → Embajada Argentina (17).
  - Productos empresariales → trofeo Linde (29).
  - Cuchillos (`knife`), Tablas (`board`) y Cuero (`leather`) siguen con su ilustrativa.
- **Guía de materiales** (`MATERIAL_GUIDES[].image`, `src/content/materials.ts`):
  - Madera → caja de cumpleaños de MDF (24).
  - Acero inoxidable, alpaca y dorado → mate «Navegar en paz» (26).
  - Metal pintado → termo YPF (52). Hoy no tiene imagen.
  - Vidrio y acrílico → copas en el rotativo (50).
  - Mármol → mármol de la embajada de Hungría (07). Hoy no tiene imagen.
  - Cuero sigue con `leather`.
- **«Cada material pide su grabado»** (`Differentials.astro`): la veta de olivo pasa a la bandeja de acero en la máquina (45).
- **Hero de la home** (`Hero.astro`):
  - la captura del Lab pasa a ser un collage 2×2 de cuatro fotos propias, sin animación, dentro del mismo recuadro 16:10: termo YPF (52) y copas (50) arriba, cachorro en piedra (42) y Embajada Argentina (17) abajo;
  - las fotos no son enlaces (el botón «Explorar trabajos» ya lleva a la galería);
  - se quitan la línea dorada (`hero__trace`, SVG y CSS) y el pie actual. Pie nuevo: «Trabajos hechos en nuestro taller.», sin la nota del Custom Lab;
  - las cuatro fotos cargan sin `lazy`; la primera lleva `fetchpriority="high"`;
  - el texto, el titular y los botones del hero no cambian.
- **`Picture.astro`** acepta imágenes propias: con `astro:assets` genera los `.webp` de 800 y 1600 px (sin agrandar las más chicas) y no muestra el cartel «Imagen ilustrativa». Las ilustrativas siguen igual.
- **Encuadre**: cada imagen propia admite un `position` opcional (CSS `object-position`) para los recortes 4:3 y 16:10. Se completa en la verificación sólo donde el recorte corta el grabado.
- **Trabajos de la galería**: los 9 trabajos de `WORKS` que usan esas fotos pasan a referenciar la entrada de `IMAGES` (misma foto y mismo `alt`), en lugar de importar la foto por su cuenta. El orden y los textos de `WORKS` no cambian.
- **Borrar lo que deja de usarse**:
  - `public/img/hero-lab.webp`;
  - de `public/img/placeholder/`, los dos `.webp` de `thermos-mate`, `engraved-glass`, `engraved-box`, `laser-wood-crest` y `olive-wood-grain`;
  - sus 5 entradas de `src/content/image-credits.json`. Quedan `knife-stone`, `end-grain-board` y `leather-belts`;
  - las claves `thermos`, `glass`, `box`, `laser` y `grain` de `IMAGES`.
- **README**: el párrafo de «Fotos» dice que las ilustrativas quedan sólo en Cuchillos, Tablas y Cuero (tarjeta, encabezado y, en cuero, la guía de materiales), y que el hero es un collage de trabajos propios.
- **Tests**:
  - nuevo `src/content/__tests__/images.test.ts`: las categorías `termos`, `copas`, `regalos`, `placas` y `empresas` no tienen imagen ilustrativa; las únicas ilustrativas en `CATEGORIES` son las de `cuchillos`, `tablas` y `cuero`; en `MATERIAL_GUIDES` sólo `cuero` es ilustrativa y ninguna sección queda con `image: null`; `image-credits.json` tiene exactamente `knife-stone`, `end-grain-board` y `leather-belts`, y cada archivo que lista existe en `public/`;
  - `works.test.ts`: el test de orden propios/ilustrativos usa `IMAGES.knife` e `IMAGES.board` en lugar de `IMAGES.box`.

**No entra:**

- Fotos nuevas de cuchillos, tablas o cuero. Cuando lleguen, cada una es cambiar una clave de `IMAGES`.
- Cambiar el texto del hero (sigue nombrando el simulador 3D) o sus botones.
- Mostrar el Custom Lab en otra parte de la home para compensar la captura que sale del hero.
- Collage animado, en carrusel o con enlaces al visor.
- Cambiar la imagen para compartir (`og-image.png`).
- Retocar, recortar o editar las fotos. El encuadre se ajusta sólo con CSS.
- Cambiar las fotos de la galería, su orden o sus textos.

---

## Modelo de datos

`ImageAsset` (ilustrativas en `public/`) no cambia. Se suma la imagen propia y una unión de las dos:

```ts
// src/content/site.ts
import type { ImageMetadata } from 'astro'

/** Foto del taller, importada desde src/assets/works/: astro:assets genera los tamaños en el build. */
export interface OwnImage {
  src: ImageMetadata
  alt: string
  /** object-position para los recortes 4:3 (tarjetas) y 16:10 (hero); centro si no se pasa. */
  position?: string
}

export type SiteImage = ImageAsset | OwnImage

export const isIllustrative = (image: SiteImage): image is ImageAsset => typeof image.src === 'string'
```

`Category.image` pasa a `SiteImage`, `MaterialGuide.image` a `SiteImage | null` y el prop `image` de `Picture.astro` a `SiteImage`. En `works.ts`, `WorkImage` pasa a ser un alias de `OwnImage`.

### `IMAGES`

| Clave | Foto | `alt` | Se usa en |
| --- | --- | --- | --- |
| `knife` | ilustrativa (sin cambios) | sin cambios | Cuchillos |
| `board` | ilustrativa (sin cambios) | sin cambios | Tablas |
| `leather` | ilustrativa (sin cambios) | sin cambios | Cuero, guía: Cuero |
| `termo` | `52-termo-ypf-franco-colapinto.webp` | el de `w-termo-ypf-colapinto` | Termos, guía: Metal pintado, hero |
| `copas` | `50-grabado-copas-de-cristal.webp` | el de `w-copas-en-el-rotativo` | Copas, guía: Vidrio, hero |
| `perro` | `42-grabado-perro-sobre-piedra.webp` | el de `w-perro-en-piedra` | Regalos, hero |
| `embajada` | `17-embajada-argentina.webp` | el de `w-embajada-argentina` | Placas, hero |
| `linde` | `29-trofeo-acrilico-linde.webp` | el de `w-trofeo-linde` | Empresas |
| `caja` | `24-caja-mdf-cumpleanos.webp` | el de `w-caja-cumpleanos` | Guía: Madera |
| `mate` | `26-mate-acero-navegar-en-paz.webp` | el de `w-mate-navegar-en-paz` | Guía: Acero |
| `hungria` | `07-marmol-embajada-hungria.webp` | el de `w-marmol-hungria` | Guía: Mármol |
| `bandejaTaller` | `45-bandeja-acero-en-grabado.webp` | el de `w-bandeja-en-el-taller` | «Cada material pide su grabado» |

El `alt` se mueve de `WORKS` a `IMAGES` sin cambiar el texto, y el trabajo lo toma de ahí (`photo: IMAGES.termo`).

---

## Plan de implementación

1. **Tipos y `Picture`.** `OwnImage`, `SiteImage`, `isIllustrative`; `Picture.astro` resuelve las propias con `astro:assets` (800 y 1600 px, `object-position` si hay `position`). Nada cambia todavía en pantalla.
2. **`IMAGES` y `WORKS`.** Las 9 entradas propias; los 9 trabajos pasan a `photo: IMAGES.<clave>`. La galería se ve igual.
3. **Categorías y materiales.** Cambiar `image` en `CATEGORIES` y en `MATERIAL_GUIDES`; sumar imagen a Metal pintado y Mármol.
4. **«Cada material pide su grabado».** `IMAGES.bandejaTaller` en `Differentials.astro`.
5. **Hero.** Collage 2×2, pie nuevo, sin línea dorada (SVG, CSS y el comentario del componente).
6. **Limpieza.** Borrar `hero-lab.webp`, los 10 `.webp` de placeholder y sus 5 créditos; borrar las claves viejas de `IMAGES`. Tests nuevos y ajuste de `works.test.ts`. README.
7. **Verificación.** Capturas con el Chromium de Playwright por CDP, a 1440 y 375 px: hero de la home, «Qué personalizamos», «Cada material pide su grabado», las 8 páginas de categoría (incluida `/regalos-empresariales/`) y `/materiales/`. Ajustar `position` donde el recorte corte el grabado y volver a capturar. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] El hero de la home muestra un collage 2×2 con el termo YPF y las copas arriba, el cachorro en piedra y la Embajada Argentina abajo, cada foto con su `alt`.
- [ ] El hero no tiene la línea dorada ni la captura del Lab, y el pie dice «Trabajos hechos en nuestro taller.».
- [ ] Las fotos del collage no son enlaces y ninguna tiene `loading="lazy"`; la primera tiene `fetchpriority="high"`.
- [ ] En «Qué personalizamos», Termos, Copas, Regalos, Placas y Productos empresariales muestran foto propia sin el cartel «Imagen ilustrativa».
- [ ] Cuchillos, Tablas y Cuero siguen con su ilustrativa y el cartel «Imagen ilustrativa».
- [ ] Placas y Productos empresariales ya no comparten imagen.
- [ ] El encabezado de cada página de categoría (y de `/regalos-empresariales/`) muestra la misma imagen que su tarjeta.
- [ ] En `/materiales/`, Madera, Acero, Metal pintado, Vidrio y Mármol tienen foto propia; Cuero, la ilustrativa. Ninguna sección queda sin imagen.
- [ ] «Cada material pide su grabado» muestra la bandeja de acero en la máquina, sin cartel.
- [ ] En las tarjetas y en el hero, el grabado principal de cada foto se ve dentro del recorte (logos del termo, escudo de la embajada, cara del cachorro, copas).
- [ ] La galería muestra los mismos 45 trabajos, en el mismo orden y con los mismos textos que antes.
- [ ] El pie del sitio acredita sólo 3 imágenes: el cuchillo, la tabla y los cinturones.
- [ ] `public/img/hero-lab.webp` y los `.webp` de `thermos-mate`, `engraved-glass`, `engraved-box`, `laser-wood-crest` y `olive-wood-grain` no existen.
- [ ] `IMAGES` no tiene las claves `thermos`, `glass`, `box`, `laser` ni `grain`.
- [ ] En 375 px el collage del hero se ve 2×2 y no hay scroll horizontal en la home, las páginas de categoría ni `/materiales/`.
- [ ] El README describe dónde quedan ilustrativas y que el hero es un collage propio.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** el collage va en el hero, no en la tarjeta de Cuchillos. Es «la foto principal» del sitio y la primera prueba de que el taller es real. La tarjeta de Cuchillos queda ilustrativa porque no hay fotos de cuchillos y un collage de otros objetos ahí confundiría.
- **Sí:** 4 fotos fijas en 2×2. Entran en el 16:10 actual sin rediseñar el hero; con 6, en móvil cada foto queda demasiado chica.
- **Sí:** termo, copas, cachorro y embajada en el collage. Cuatro categorías distintas: muestra de entrada que no se hacen sólo placas.
- **No:** el retrato en mármol (39) en el collage ni en tarjetas. Depende del permiso pendiente de la SPEC 21.
- **No:** fotos con enlace en el collage. El botón «Explorar trabajos» ya cumple esa función y cuatro enlaces más suman paradas de teclado sin aportar.
- **Sí:** sacar la línea dorada. Estaba dibujada sobre el grabado de la captura del Lab; sobre el collage no apunta a nada.
- **Sí:** Placas con la Embajada Argentina y Empresas con el trofeo Linde. Antes compartían la foto del láser; ahora cada una muestra lo suyo.
- **Sí:** Metal pintado con el termo negro y Mármol con la placa de Hungría. Son exactamente esos materiales y hoy esas secciones no tienen foto.
- **Sí:** la caja de MDF para Madera. El MDF también se tuesta como la madera, y es la única pieza de madera fotografiada.
- **Sí:** la bandeja en la máquina para «Cada material pide su grabado». Muestra el oficio y el acero que nombra el texto.
- **Sí:** una sola fuente por foto (`IMAGES`) que usan la galería, las tarjetas y el hero. El `alt` no se escribe dos veces.
- **Sí:** borrar archivos y créditos sin uso. El pie no acredita imágenes que no se ven y el sitio no publica archivos huérfanos.
- **Sí:** ajustar el encuadre con `object-position` y no recortar los archivos. Las mismas fotos se usan sin recorte en el visor de la galería.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El termo (881×1600) y las copas (816×1020) son verticales: en 4:3 y en las celdas 16:10 del hero se pierde mucho alto. | `position` por imagen, ajustado con las capturas del paso 7. Si aun así se corta el grabado, se cambia la foto de esa celda en `IMAGES`. |
| Las copas (816 px) y el termo (881 px) son más chicos que 1600: en el encabezado de categoría pueden verse blandas. | `astro:assets` no agranda; el encabezado ocupa ~40% del ancho, menos de 816 px en casi todas las pantallas. |
| Las cuatro fotos del hero sin `lazy` suben el peso de la carga inicial frente a una sola captura. | Las celdas usan `sizes` de un cuarto del recuadro, así el navegador baja la variante de 800 px o menos. |
| Las marcas de YPF, Franco Colapinto y Linde pasan a verse en el hero y en tarjetas, no sólo en la galería. | Son trabajos hechos por encargo (misma postura que la SPEC 21). Si el negocio prefiere no destacarlas, se cambia la clave de `IMAGES` sin tocar componentes. |
| Un cliente pide que se quite su trabajo y esa foto también está en una tarjeta o en el hero. | Quitar el trabajo de `WORKS` no alcanza: también hay que cambiar la clave de `IMAGES`. El README lo aclara. |
| El hero deja de mostrar el Custom Lab, que es el diferencial del sitio. | El texto y el botón «Crear mi grabado» siguen. Darle otro lugar visual al Lab queda fuera de esta spec. |

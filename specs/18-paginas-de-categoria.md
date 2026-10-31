# SPEC 18 — Páginas de categoría indexables

> **Estado:** Borrador
> **Depende de:** SPEC 12, SPEC 13, SPEC 14, SPEC 15, SPEC 16, SPEC 17
> **Fecha:** 2026-10-30
> **Objetivo:** Darle a cada categoría de «Qué personalizamos» su propia página, con una URL que la gente busca (`/mates-y-termos-grabados/`, `/tablas-personalizadas/`…), los productos del Lab con sus medidas reales, los materiales, los trabajos de la galería, preguntas propias y un acceso directo al producto en el Custom Lab.

---

## Por qué esta spec

La auditoría SEO de la home (2026-10-29) encontró que las búsquedas que el sitio podría ganar son por producto («mates grabados», «tablas personalizadas», «cuchillos grabados con nombre», «copas grabadas»), y que no hay ninguna página para ellas:

- Las 8 categorías viven sólo como tarjetas en la home.
- Las tarjetas llevan a `/custom-lab/?producto=…`. Por la SPEC 12, esas URLs declaran como canónica `/custom-lab/`, así que no compiten por nada.
- Una sola página (la home) no puede posicionar a la vez para cuchillos, mates, copas, cuero y placas.

El catálogo del Lab ya tiene el contenido que hace falta y que ningún competidor publica: 16 productos con descripción, medidas, materiales y zonas de grabado en milímetros.

---

## Alcance

**Entra:**

- **Ruta dinámica** `src/pages/[categoria]/index.astro` con `getStaticPaths` desde `CATEGORIES` habilitadas, salvo `empresas` (tiene su propia página, SPEC 19). Una página por categoría.
- **Slugs** (campo nuevo `slug` en `Category`):

  | Categoría | Slug |
  | --- | --- |
  | Cuchillos y accesorios | `/cuchillos-grabados/` |
  | Tablas y madera | `/tablas-personalizadas/` |
  | Termos y mates | `/mates-y-termos-grabados/` |
  | Copas y vasos | `/copas-y-vasos-grabados/` |
  | Cuero | `/cuero-grabado/` |
  | Regalos personalizados | `/regalos-personalizados/` |
  | Placas y reconocimientos | `/placas-y-reconocimientos/` |

- **Productos por categoría** (campo nuevo `labProductIds`, que reemplaza a `labProductId`):

  | Categoría | Productos del Lab |
  | --- | --- |
  | Cuchillos | `knife` |
  | Tablas | `board` |
  | Termos y mates | `thermos-handle`, `thermos-half`, `mate-wood`, `mate-steel`, `mate-camionero`, `mate-imperial` |
  | Copas y vasos | `glassware` |
  | Cuero | `leather-wallet`, `leather-keychain`, `leather-belt` |
  | Regalos | ninguno: la página muestra una selección de todos (ver abajo) |
  | Placas | `plaque-base`, `plaque-wall`, `dog-tag`, `trophy` |

  El primer producto de la lista es el que abre la tarjeta de la home cuando hace falta ir directo al Lab.
- **SEO por categoría** (campo nuevo `seo` en `Category`): `title` (≤ 60), `description` (≤ 155), `h1` e `intro` (2 o 3 oraciones). Test de longitudes. Textos sugeridos abajo.
- **Estructura de cada página:**
  1. Migas de pan: «Inicio › <categoría>».
  2. H1, `intro` y botón principal «Diseñar en el Custom Lab» (primer producto) o, en Regalos, el destino de `categoryHref` (SPEC 14).
  3. **Productos**: una tarjeta por producto del Lab con nombre, descripción, materiales disponibles (`MATERIALS[id].name`), zonas de grabado con sus medidas en mm (de `surfacesOf`; con formas, una línea por forma) y enlace «Diseñarlo» a `labProductHref(id)`.
  4. **Materiales**: los de la guía (SPEC 17) que usan esos productos, con un resumen de una línea y enlace a `/materiales/#<id>`.
  5. **Trabajos**: los de `WORKS` con esa categoría (SPEC 16), con su foto y el visor de la galería. Sin trabajos, la sección no aparece.
  6. **Preguntas**: las de `faq` de la categoría (campo nuevo, `Faq[]`, mismas reglas de `null` que el FAQ de la home) y las generales de compra que estén respondidas (precio, plazos, envíos).
  7. Cierre con el mismo bloque de la home (`ContactCta.astro`).
- **Regalos personalizados**: la sección «Productos» muestra un producto por categoría (cuchillo, tabla, mate de madera, copas, billetera, placa sobre base) con el título «Ideas para regalar».
- **Home y footer**: las tarjetas de «Qué personalizamos» y los enlaces de «Categorías» del footer llevan a la página de cada categoría. El `aria-label` pasa a ser «<nombre>, ver productos».
- **JSON-LD** de cada página: `BreadcrumbList` y `ItemList` con los productos (`name`, `description`, `url` al Lab). Más `FAQPage` si hay preguntas respondidas (función de la SPEC 15).
- **Sitemap**: las páginas entran solas.
- **Tests** `src/content/__tests__/categories.test.ts`: slugs únicos y en minúscula sin tildes; todo id de `labProductIds` existe en `PRODUCTS`; ningún producto de `PRODUCTS` queda sin categoría; longitudes de `seo`.

**No entra:**

- Una página por producto (`/mates-y-termos-grabados/mate-imperial/`). Si alguna categoría lo pide, va en otra spec.
- Precios.
- Fotos nuevas: la cabecera usa `Category.image`.
- Embeber el visor 3D en la página de categoría. Se entra al Lab con el producto elegido.
- La página de empresas (SPEC 19).
- Redirecciones: no hay URLs viejas de categoría.

---

## Modelo de datos

```ts
// src/content/site.ts
export interface Category {
  id: string
  slug: string
  name: string
  description: string
  image: ImageAsset
  /** Productos del Custom Lab de la categoría, en orden. Vacío si no tiene. */
  labProductIds: readonly string[]
  inquiry: string | null           // SPEC 14
  enabled: boolean
  seo: { title: string; description: string; h1: string; intro: string }
  /** Preguntas propias de la categoría. */
  faq: readonly Faq[]
}
```

`labProductId` se reemplaza por `labProductIds[0] ?? null` en `categoryHref` (SPEC 14) y en el resto del código que lo usa.

---

## Textos sugeridos

| Categoría | `title` | `h1` |
| --- | --- | --- |
| Cuchillos | Cuchillos grabados con nombre · grabado láser | Cuchillos grabados con tu nombre o tu logo |
| Tablas | Tablas personalizadas grabadas a láser | Tablas de madera personalizadas |
| Termos y mates | Mates y termos grabados con nombre o logo | Mates y termos grabados a láser |
| Copas y vasos | Copas y vasos grabados a láser · personalizados | Copas y vasos grabados con nombres o fechas |
| Cuero | Billeteras, llaveros y cinturones de cuero grabados | Cuero grabado a láser |
| Regalos | Regalos personalizados grabados a láser | Regalos personalizados con grabado láser |
| Placas | Placas y reconocimientos grabados · trofeos | Placas, trofeos y reconocimientos grabados |

Preguntas propias sugeridas (en `null` hasta que las confirme el taller):

- Cuchillos: ¿Se graba la hoja o el mango? ¿El grabado se va con el uso o el afilado?
- Tablas: ¿Se puede usar para cortar? ¿Qué madera es?
- Termos y mates: ¿Se graba la virola de alpaca? ¿Puedo traer mi propio mate o termo?
- Copas y vasos: ¿Se pueden lavar en el lavavajillas? ¿Hacen juegos para casamientos?
- Cuero: ¿Qué colores de cuero hay? ¿Se puede grabar un logo?
- Placas: ¿Cuánto texto entra en una placa? ¿Hacen trofeos por cantidad?

---

## Plan de implementación

1. **Modelo.** Pasar `labProductId` a `labProductIds`, sumar `slug`, `seo` y `faq`, y actualizar `categoryHref` y el resto del código que usa el campo viejo. Tests. La home se ve igual que antes.
2. **Ruta.** Crear `[categoria]/index.astro` con cabecera, productos y cierre.
3. **Secciones que reutilizan.** Materiales (SPEC 17), trabajos (SPEC 16) y preguntas (SPEC 15). Si hace falta, extraer la grilla de trabajos y el visor de `Gallery.astro` a un componente compartido.
4. **Enlaces.** Tarjetas de la home y footer hacia las páginas nuevas.
5. **JSON-LD.** `BreadcrumbList`, `ItemList` y `FAQPage`.
6. **Verificación.** Capturas de `/mates-y-termos-grabados/` y `/regalos-personalizados/` a 1440 y 375 px con el Chromium de Playwright por CDP. Cada «Diseñarlo» abre el producto correcto en el Lab. Validador de schema.org. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] Hay una página por categoría habilitada salvo empresas, con la URL de la tabla de slugs.
- [ ] Cada página tiene un solo `<h1>`, su `title` y su `description`, y canonical con `siteUrl`.
- [ ] Cada página lista sus productos del Lab con materiales y zonas en mm iguales a las del catálogo.
- [ ] Cada «Diseñarlo» abre ese producto en el Lab.
- [ ] Ningún producto de `PRODUCTS` queda fuera de todas las categorías (test).
- [ ] Las secciones de materiales, trabajos y preguntas sólo aparecen si tienen contenido.
- [ ] Regalos muestra «Ideas para regalar» y su botón principal sigue la regla de `categoryHref`.
- [ ] Las tarjetas de la home y el footer llevan a las páginas de categoría.
- [ ] Cada página tiene `BreadcrumbList` e `ItemList` válidos en el validador de schema.org.
- [ ] Las páginas aparecen en el sitemap.
- [ ] En 375 px no hay scroll horizontal.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** URLs en la raíz con la palabra clave (`/mates-y-termos-grabados/`) y no bajo `/productos/`. Son cortas, se leen en el resultado de Google y nombran lo que se busca.
- **Sí:** las tarjetas de la home llevan a la página de categoría, no al Lab. Es el enlace interno más fuerte del sitio y la página de categoría tiene el botón al Lab arriba. Cambia el destino que fijó la SPEC 11.
- **No:** dejar las tarjetas yendo al Lab y enlazar las categorías sólo desde el footer. Los enlaces desde el cuerpo de la página pesan más que los del footer.
- **Sí:** medidas y materiales desde el catálogo. Es información que nadie más publica y no se desactualiza respecto del simulador.
- **Sí:** `ItemList` y no `Product`. `Product` sin precio ni stock da avisos en Search Console y no hay precios publicados.
- **Sí:** empresas queda afuera de la ruta dinámica. Su página tiene otra estructura (SPEC 19).

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Las páginas quedan finas mientras no haya trabajos propios ni respuestas del taller. | Productos y materiales salen del catálogo y ya tienen contenido real. Trabajos y preguntas se suman solos cuando aparecen. |
| Un clic más para llegar al Lab desde la home. | El botón principal de cada página lleva al Lab con el producto elegido, arriba de todo. El Lab sigue en el menú y en el hero de la home. |
| Contenido parecido entre la página de Regalos y las demás. | Regalos tiene su propio texto y una selección de productos, no la lista completa. |
| Cambiar `labProductId` por una lista rompe código que no se revisó. | TypeScript marca cada uso; el paso 1 termina con la home igual que antes. |

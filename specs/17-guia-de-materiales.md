# SPEC 17 — Guía de materiales: cómo toma el grabado cada material

> **Estado:** Borrador
> **Depende de:** SPEC 12, SPEC 13
> **Fecha:** 2026-10-30
> **Objetivo:** Publicar en `/materiales/` una guía de referencia sobre cómo graba el láser cada material que trabaja el estudio (madera, acero, alpaca y dorado, metal pintado, vidrio y acrílico, mármol y cuero), armada en lo posible con los datos que ya tiene el catálogo del Custom Lab.

---

## Por qué esta spec

La auditoría SEO de la home (2026-10-29) encontró que el bloque «Cada material pide su grabado» de `Differentials.astro` es el contenido más experto del sitio: explica que el láser tuesta la madera y deja en el acero una marca fina y de alto contraste. Son dos oraciones y es lo único de la home que un competidor no tiene.

El catálogo del Lab ya sabe mucho más. `MATERIALS` y `ENGRAVING_STYLES` en `src/lab/model/catalog.ts` tienen 7 estilos de grabado con su descripción y el tipo de material en el que tiene sentido cada uno, y `PRODUCTS` tiene las medidas reales de cada zona de grabado. Nada de eso es visible fuera del simulador.

Una página de referencia con esos datos sirve para las búsquedas informativas («grabado láser en acero», «grabado en vidrio», «grabar cuero con láser»), es la que pueden citar Google y los buscadores con IA, y le da a las páginas de categoría (SPEC 18) un lugar al que enlazar.

---

## Alcance

**Entra:**

- **Página** `src/pages/materiales/index.astro` → `/materiales/`, con `BaseLayout` (`path="/materiales/"`).
  - `title`: «Grabado láser por material: madera, acero, vidrio y cuero» (57 caracteres);
  - `description`: «Cómo toma el grabado láser cada material: madera, acero, alpaca, vidrio, acrílico, mármol y cuero. Qué tono y contraste deja en cada uno.» (máximo 155 caracteres, con test);
  - H1: «Cómo graba el láser cada material».
- **Estructura de la página:**
  1. Párrafo de entrada de 2 o 3 oraciones: el mismo láser deja marcas distintas según el material.
  2. **Tabla comparativa** (`<table>` con `<caption>`): una fila por material y las columnas «Qué hace el láser», «Cómo se ve», «Estilos en el Custom Lab» y «Dónde lo usamos».
  3. **Una sección por material** (`<h2>` con `id`): qué le pasa al material, cómo se ve la marca, qué estilos del Lab le corresponden, en qué productos se usa (con enlace al producto en el Lab), y, si están confirmados, el tamaño mínimo de letra legible y el cuidado.
  4. Cierre con enlace al Custom Lab: «Probá cómo queda tu grabado en cada material».
- **Datos** en `src/content/materials.ts` (ver «Modelo de datos»):
  - los estilos y los productos de cada material se calculan desde `ENGRAVING_STYLES`, `MATERIALS` y `PRODUCTS`, no se escriben a mano;
  - los textos editoriales (qué hace el láser, cómo se ve) se escriben en el archivo;
  - lo que depende del taller (letra mínima, cuidado) es `string | null` y no se muestra en `null`.
- **Materiales de la guía** (por `MaterialKind` del catálogo, sin los materiales que no se graban: hilo y plásticos):
  - Madera y calabaza (`wood`): quemado láser.
  - Acero inoxidable, alpaca y dorado (`steel`): marcado oscuro y esmerilado.
  - Metal pintado y acrílico negro (`coated`, sólo `black-matte` y `black-acrylic`): grabado a metal.
  - Vidrio y acrílico transparente (`glass`): grabado esmerilado.
  - Mármol (`stone`): bajorrelieve.
  - Cuero (`leather`): grabado láser.
- **Enlaces que llegan a la guía:**
  - en la home, el bloque «Cada material pide su grabado» suma el enlace «Ver la guía de materiales»;
  - en el footer, «Guía de materiales» en la columna «Secciones»;
  - la pregunta «¿Qué materiales se pueden grabar?» del FAQ (SPEC 15) usa `link` hacia `/materiales/`.
- **JSON-LD**: `Article` con `headline`, `description`, `inLanguage: 'es-AR'`, `author` y `publisher` apuntando al `@id` del negocio (SPEC 12) y `dateModified` desde una constante de la página.
- **Sitemap**: la página entra sola por `@astrojs/sitemap`.
- **README**: entrada en «Datos pendientes del negocio» para validar los textos y completar letra mínima y cuidado.
- **Tests** `src/content/__tests__/materials.test.ts`: cada material de la guía tiene al menos un estilo y un producto calculados; ningún estilo de `ENGRAVING_STYLES` queda sin material en la guía.

**No entra:**

- Fotos nuevas por material. Se reutilizan las de `IMAGES` donde haya una (madera, acero, vidrio, cuero); el resto va sin foto.
- Capturas del Lab generadas en el build.
- Precios por material.
- Una página por material. Si una sección crece mucho, va en otra spec.
- Materiales que el Lab no tiene (corte de MDF, grabado en piedra natural sin pulir, etc.).

---

## Modelo de datos

```ts
// src/content/materials.ts
import type { MaterialKind } from '../lab/model/types'

export interface MaterialGuide {
  /** id del ancla: /materiales/#acero */
  id: string
  name: string
  /** Materiales del catálogo que entran en esta sección. */
  materialIds: readonly string[]
  /** Qué le hace el láser al material (verbo concreto: tuesta, oxida, retira la pintura, microfractura…). */
  process: string
  /** Cómo se ve la marca terminada. */
  result: string
  /** Pendiente del taller: tamaño mínimo de letra legible, p. ej. "2 mm de alto de mayúscula". */
  minTextHeight: string | null
  /** Pendiente del taller: cómo cuidar la pieza. */
  care: string | null
  image: ImageAsset | null
}

export const MATERIAL_GUIDES: readonly MaterialGuide[]

/** Estilos del Lab que corresponden a la sección (por el MaterialKind de sus materiales). */
export function stylesFor(g: MaterialGuide): EngravingStyleDef[]
/** Productos del Lab que ofrecen alguno de los materiales de la sección. */
export function productsFor(g: MaterialGuide): ProductDef[]
```

---

## Textos sugeridos (para validar con el taller)

- **Madera y calabaza.** *Proceso:* el láser tuesta la capa de arriba de la madera, sin tinta. *Resultado:* un tono marrón cálido que sigue la veta; en maderas claras contrasta más que en las oscuras.
- **Acero, alpaca y dorado.** *Proceso:* el láser oxida la superficie del metal (marcado oscuro) o la vuelve mate (esmerilado), sin sacar material. *Resultado:* una marca fina y de alto contraste, o una más sutil y satinada.
- **Metal pintado.** *Proceso:* el láser retira la pintura y deja ver el metal de abajo. *Resultado:* una marca plateada y brillante sobre el negro mate.
- **Vidrio y acrílico.** *Proceso:* el láser microfractura la superficie. *Resultado:* una marca blanca y satinada, como un esmerilado.
- **Mármol.** *Proceso:* el láser hunde apenas la piedra. *Resultado:* una letra hundida y más oscura que la piedra.
- **Cuero.** *Proceso:* el láser quema y hunde apenas la flor del cuero. *Resultado:* una marca más oscura que el cuero, que se nota al tacto.

---

## Plan de implementación

1. **Datos y tests.** Crear `materials.ts` con los textos sugeridos, `stylesFor`, `productsFor` y sus tests.
2. **Página.** Crear `/materiales/` con la tabla, las secciones y el cierre. Estilos en un bloque nuevo de `landing.css`, reutilizando `section`, `wrap` y `section-title`.
3. **Enlaces.** Home (bloque de materiales), footer y FAQ.
4. **JSON-LD.** `Article` con `JsonLd.astro`.
5. **README.**
6. **Verificación.** Capturas de la página a 1440 y 375 px con el Chromium de Playwright por CDP. La tabla se puede leer en móvil. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] `/materiales/` responde y tiene un solo `<h1>`.
- [ ] La tabla tiene una fila por material de la guía y `<caption>`.
- [ ] Cada sección de material tiene `id`, y `/materiales/#cuero` (por ejemplo) lleva a su sección.
- [ ] Los estilos y productos de cada sección coinciden con los del catálogo del Lab, y cada producto enlaza a `labProductHref(id)`.
- [ ] Los campos `null` (letra mínima, cuidado) no dejan rótulos vacíos.
- [ ] En 375 px la tabla no genera scroll horizontal en la página (se desplaza dentro de su contenedor o se apila).
- [ ] La home, el footer y el FAQ (si está respondida) enlazan a `/materiales/`.
- [ ] La página tiene `<link rel="canonical">` (con `siteUrl`) y aparece en el sitemap.
- [ ] El validador de schema.org no muestra errores en el `Article`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** una sola página con anclas, no una por material. Hoy hay contenido para una página sólida y no para siete finas.
- **Sí:** estilos y productos calculados desde el catálogo. Si el Lab suma un producto o un material, la guía se actualiza sola y no se contradice con el simulador.
- **Sí:** tabla comparativa arriba. Es el formato que Google y los buscadores con IA citan mejor para comparaciones.
- **Sí:** verbos concretos en los textos (tuesta, oxida, microfractura, retira la pintura). Es lo que distingue un texto de oficio de uno genérico.
- **No:** promesas de durabilidad («dura para siempre») sin confirmación del taller.
- **Sí:** URL `/materiales/` corta. Si más adelante hay una página por material, cuelgan de ahí (`/materiales/cuero/`).

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Un texto técnico es incorrecto para la máquina del taller (p. ej. si su láser no oxida el acero sino que lo graba en profundidad). | Los textos son borradores y el README pide validarlos antes de publicar. |
| La guía nombra materiales que el taller todavía no confirmó (el README ya los lista como pendientes). | Se publica sólo cuando el negocio confirma la lista; hasta entonces la página puede quedar sin enlaces desde la home. |
| La tabla es ancha y en móvil se lee mal. | Contenedor con desplazamiento horizontal propio y la primera columna fija, o formato apilado. Se decide con las capturas. |
| Importar el catálogo del Lab en una página estática suma peso. | `catalog.ts` es sólo datos; se usa en el build y no llega al navegador. |

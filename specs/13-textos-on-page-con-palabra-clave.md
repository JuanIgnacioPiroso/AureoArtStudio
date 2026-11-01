# SPEC 13 — Títulos, descripciones y H1 con la palabra clave

> **Estado:** Implementado
> **Depende de:** SPEC 11, SPEC 12
> **Fecha:** 2026-10-30
> **Objetivo:** Que el `<title>`, la meta description, el H1 y el párrafo del hero de la home, y el `<title>` del Custom Lab, nombren lo que la gente busca («grabado láser personalizado», cuchillos, mates, tablas) sin perder el tono de la marca.

---

## Por qué esta spec

La auditoría SEO de la home (2026-10-29) encontró que los textos que más pesan para Google no usan las palabras con las que la gente busca:

- El `<title>` es «AUREO Art Studio · Grabado láser personalizado con simulador 3D» (63 caracteres). Empieza con la marca, que todavía nadie busca, y termina en «simulador 3D», que tampoco se busca. Google lo corta cerca de los 60.
- El H1 «Objetos únicos. Diseños que dejan huella.» no dice qué hace el estudio.
- El `og:title` («Objetos únicos, diseños que dejan huella») no coincide con el `<title>`.
- En «Qué personalizamos», el texto oculto para lectores de pantalla está dentro del `<h3>`: para Google cada título es «Cuchillos y accesorios, diseñarlo en el Custom Lab».

---

## Alcance

**Entra:**

- **Home** (`src/pages/index.astro`):
  - `title`: «Grabado láser personalizado · cuchillos, mates y placas (55 caracteres);
  - `description`: «Grabamos nombres, fechas y logos en cuchillos, tablas, mates, copas y cuero. Probá tu diseño en 3D antes de pedir presupuesto.» (126 caracteres);
  - con `business.city` cargada, la description cambia a la variante con ciudad (ver «Modelo de datos»), siempre de 155 caracteres como máximo;
  - `ogTitle`: «AUREO Art Studio · Grabados láser que dejan huella»;
  - `ogDescription`: la misma que `description`.
- **Hero** (`src/sections/Hero.astro`):
  - el eslogan «Objetos únicos.» pasa a una línea chica sobre el título (`<p class="hero__eyebrow">`), con el estilo de eyebrow que ya usa «Confían en nosotros»;
  - el H1 pasa a ser «Grabados láser personalizados que dejan huella.»;
  - el párrafo (`.lede`) pasa a ser: «Grabamos a láser cuchillos, tablas, mates, copas y cuero con tu nombre, una fecha o tu logo. Diseñalo en nuestro simulador 3D, miralo sobre el objeto y pedí tu presupuesto.»;
  - los botones, la imagen y su pie no cambian.
- **Estilos del hero** (`src/styles/landing.css`): el H1 nuevo es más largo; se ajusta su tamaño máximo para que no pase de 3 líneas en 1440 px ni de 4 en 375 px.
- **«Qué personalizamos»** (`src/sections/Categories.astro`): el texto del destino sale del `<h3>`. El `<a class="category__link">` lleva `aria-label` con el nombre de la categoría más el destino, y adentro sólo el nombre. El nombre accesible del enlace no cambia respecto de la SPEC 11.
- **Custom Lab** (`src/pages/custom-lab/index.astro`):
  - `title`: «Simulador de grabado láser 3D · AUREO Custom Lab» (48 caracteres);
  - `description`: «Elegí un objeto, escribí tu nombre o subí tu logo y mirá en 3D cómo queda el grabado antes de pedir tu presupuesto.» (115 caracteres);
  - el H1 «Tu idea, antes de grabarla.» no cambia.
- **Test** de longitud en `src/content/__tests__/seo-copy.test.ts`: todos los `title` miden 60 caracteres o menos y todas las `description` 155 o menos, también la variante con ciudad, probada con una ciudad de 25 caracteres.

**No entra:**

- Cambiar los títulos de las secciones (H2) de la home.
- Agregar texto nuevo a otras secciones (FAQ en la SPEC 15, materiales en la SPEC 17).
- Una imagen de Open Graph nueva.
- Cambiar los textos del Custom Lab fuera del `<head>`.

---

## Modelo de datos

Los textos de la home pasan a constantes en `src/content/site.ts` para poder testearlos:

```ts
export const HOME_SEO = {
  title: 'Grabado láser personalizado · cuchillos, mates y tablas',
  description: (city: string | null) =>
    city
      ? `Grabado láser personalizado en ${city}: cuchillos, tablas, mates, copas y cuero. Probá tu diseño en 3D y pedí presupuesto.`
      : 'Grabamos nombres, fechas y logos en cuchillos, tablas, mates, copas y cuero. Probá tu diseño en 3D antes de pedir presupuesto.',
  ogTitle: 'AUREO Art Studio · Grabados láser que dejan huella',
} as const
```

Lo mismo para el Lab, con `LAB_SEO`.

---

## Plan de implementación

1. **Constantes y test.** Crear `HOME_SEO` y `LAB_SEO` y el test de longitud. Si la variante con ciudad pasa de 155 con 25 caracteres de ciudad, se acorta el texto.
2. **Páginas.** Usar las constantes en `index.astro` y `custom-lab/index.astro`.
3. **Hero.** Eyebrow, H1 y párrafo nuevos. Ajustar el tamaño del H1 en `landing.css`.
4. **Categorías.** Pasar el texto del destino de `visually-hidden` a `aria-label`.
5. **Verificación visual.** Capturas del hero a 1440, 768 y 375 px con el Chromium de Playwright por CDP. Comprobar que la línea dorada del hero sigue cayendo sobre el grabado.
6. **Verificación de código.** `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] El `<title>` de la home es «Grabado láser personalizado · cuchillos, mates y tablas».
- [ ] La meta description de la home mide 155 caracteres o menos y nombra cuchillos, tablas, mates, copas y cuero.
- [ ] Con `city` de prueba (sin commitear), la description nombra la ciudad.
- [ ] La home tiene un solo `<h1>` y su texto es «Grabados láser personalizados que dejan huella.».
- [ ] «Objetos únicos.» se ve sobre el H1 y no es un heading.
- [ ] El H1 no pasa de 3 líneas a 1440 px ni de 4 a 375 px, y no hay scroll horizontal.
- [ ] Los `<h3>` de «Qué personalizamos» contienen sólo el nombre de la categoría.
- [ ] Un lector de pantalla sigue anunciando cada enlace de categoría como «Cuchillos y accesorios, diseñarlo en el Custom Lab» (o «…, consultar por este producto»).
- [ ] El `<title>` del Lab es «Simulador de grabado láser 3D · AUREO Custom Lab».
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** el `<title>` de la home no lleva la marca. Los 60 caracteres alcanzan para la palabra clave y tres productos, o para la marca y la palabra clave, pero no para las tres cosas. La marca llega igual al resultado de Google por `og:site_name` y por el JSON-LD de la SPEC 12. Cuando la marca tenga búsquedas propias, se vuelve a evaluar.
- **Sí:** cuchillos, mates y tablas en el título. Son los tres productos con más búsquedas de la lista y los primeros que tuvo el Lab.
- **Sí:** el eslogan se conserva como eyebrow. Es la voz de la marca y no se pierde; deja de ser el H1.
- **No:** «Objetos únicos. Grabados láser que dejan huella.» como H1. Repite la estructura de dos frases cortas pero empuja la palabra clave a la segunda línea.
- **Sí:** `aria-label` en el enlace en lugar del texto oculto. Google lee el contenido del `<h3>` y no el `aria-label`, y el lector de pantalla anuncia lo mismo que antes. Corrige una decisión de la SPEC 11 sin cambiar lo que se ve.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El H1 más largo empuja los botones del hero fuera de la primera pantalla en móvil. | Se revisa en la captura a 375 px. Si pasa, se achica el tamaño del H1 en móvil. |
| La línea dorada del hero deja de caer sobre el grabado si cambia el alto del bloque de texto. | La línea vive en el SVG de la imagen, no depende del texto. Se revisa igual en las capturas. |
| `aria-label` pisa el texto visible y una herramienta de traducción automática no lo traduce. | El sitio es sólo en español. |
| Google reescribe el `<title>` igual. | Pasa cuando el título no coincide con la página. Con el H1 y el título alineados, es menos probable. |

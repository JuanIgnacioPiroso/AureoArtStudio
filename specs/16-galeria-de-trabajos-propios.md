# SPEC 16 — Galería lista para trabajos propios, con la vista 3D al lado de la pieza real

> **Estado:** Borrador
> **Depende de:** SPEC 08, SPEC 11
> **Fecha:** 2026-10-30
> **Objetivo:** Preparar la galería para reemplazar las fotos ilustrativas por trabajos del taller: sumar fotos propias sin tocar componentes, filtrar por las mismas categorías que «Qué personalizamos» y, cuando exista, mostrar la captura del Custom Lab junto a la foto de la pieza grabada.

---

## Por qué esta spec

La auditoría SEO de la home (2026-10-29) marcó la galería como la mayor falta de señales de experiencia. Hoy son 4 fotos de Wikimedia Commons rotuladas «Imagen ilustrativa». Es honesto, pero no muestra nada hecho por el estudio.

Además:

- La galería filtra por 4 categorías propias (`cuchillos`, `tablas`, `regalos`, `empresas`) que no coinciden con las 8 de `CATEGORIES`. Termos, copas, cuero y placas no tienen filtro.
- Sumar un trabajo implica generar a mano dos `.webp` (1600 y 800 px) y escribir un `ImageAsset`.
- Lo que ningún competidor puede mostrar es la vista previa 3D al lado del resultado real. Es la prueba de que el simulador es fiel y es información que no existe en otro sitio.

---

## Alcance

**Entra:**

- **Carpeta de trabajos** `src/assets/works/`, versionada con un `.gitkeep`. Las fotos propias van ahí y pasan por `astro:assets` (como los logos de la SPEC 09), que genera los tamaños y el formato en el build.
- **Datos de cada trabajo** en `src/content/works.ts`, con el modelo nuevo (ver «Modelo de datos»):
  - `category` pasa a ser el `id` de una categoría de `CATEGORIES`;
  - `photo`: la foto de la pieza, importada desde `src/assets/works/` o un `ImageAsset` ilustrativo de los actuales;
  - `labPreview` opcional: la captura del Custom Lab del mismo diseño;
  - `labProductId` opcional: para el enlace «Diseñar algo parecido».
- **Filtros**: se arman a partir de `CATEGORIES` y sólo aparecen los de categorías que tienen al menos un trabajo. Se borra `WORK_CATEGORIES`. Las 4 fotos actuales pasan a las categorías equivalentes (`regalos`, `empresas`, `cuchillos`, `tablas`).
- **Tarjeta y visor**:
  - con `labPreview`, la tarjeta muestra una marca chica «Con vista 3D» y el visor muestra las dos imágenes lado a lado (una debajo de la otra en móvil), rotuladas «Vista en el Custom Lab» y «Pieza grabada»;
  - con `labProductId`, el visor suma el enlace «Diseñar algo parecido» a `labProductHref(labProductId)`.
- **Texto de la sección**: la bajada sobre fotos ilustrativas sigue apareciendo sólo mientras quede alguna (como hoy). Cuando todas son propias, la bajada pasa a «Piezas grabadas en el taller. En las que tienen vista 3D, comparala con el resultado.», y sólo si hay al menos un `labPreview`.
- **Orden**: los trabajos propios van antes que los ilustrativos.
- **README**: en «Datos pendientes del negocio», la entrada «Fotos» explica cómo sumar un trabajo (carpeta, formato, tamaño mínimo de 1600 px del lado largo, cómo sacar la captura del Lab y qué escribir en `alt`).
- **Tests** `src/content/__tests__/works.test.ts`: toda `category` existe en `CATEGORIES`; todo `labProductId` existe en `PRODUCTS`; ningún `alt` está vacío.

**No entra:**

- Sacar las fotos. Las hace el negocio.
- Capturar las vistas del Lab de forma automática.
- Un control deslizante para comparar las dos imágenes. Lado a lado alcanza y no necesita script nuevo.
- Mostrar la galería en las páginas de categoría (SPEC 18 la reutiliza).
- Borrar las fotos ilustrativas: se quitan una a una cuando haya fotos propias de la misma categoría.

---

## Modelo de datos

```ts
// src/content/works.ts
import type { ImageMetadata } from 'astro'

export interface Work {
  id: string
  title: string
  /** id de una categoría de CATEGORIES. */
  category: Category['id']
  material: string
  detail: string
  /** Foto de la pieza: propia (de src/assets/works/) o ilustrativa. */
  photo: { src: ImageMetadata; alt: string } | ImageAsset
  /** Captura del Custom Lab con el mismo diseño, si la hay. */
  labPreview?: { src: ImageMetadata; alt: string }
  /** Producto del Lab para «Diseñar algo parecido». */
  labProductId?: string
}
```

Una foto es propia si no es un `ImageAsset` con `illustrative: true`.

---

## Plan de implementación

1. **Modelo.** Cambiar `Work`, pasar las 4 fotos actuales a `photo` con su categoría nueva, borrar `WORK_CATEGORIES` y armar los filtros desde `CATEGORIES`. Tests.
2. **Fotos propias.** Crear `src/assets/works/` y renderizar las fotos propias con `<Picture>` de `astro:assets` (anchos 800 y 1600, `webp`). Las ilustrativas siguen como hoy.
3. **Vista 3D.** Marca «Con vista 3D» en la tarjeta y las dos imágenes en el visor. Los `data-*` del botón suman la captura; el script del visor arma la segunda figura sólo si existe.
4. **Enlace al Lab.** «Diseñar algo parecido» en el visor.
5. **Texto y orden.** Bajada condicional y orden de propios antes que ilustrativos.
6. **README.**
7. **Verificación.** Con un trabajo de prueba con `labPreview` (sin commitear, con una captura del Lab y cualquier foto): capturas de la galería y del visor a 1440 y 375 px con el Chromium de Playwright por CDP. Filtros, `?cat=` y `?obra=` siguen funcionando. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] Con los datos actuales, la galería se ve igual que antes: 4 trabajos ilustrativos, con su rótulo y la bajada actual.
- [ ] Los filtros usan los nombres de `CATEGORIES` y sólo aparecen los de categorías con trabajos.
- [ ] Un trabajo nuevo se suma copiando la foto en `src/assets/works/` y agregando una entrada en `WORKS`, sin tocar `Gallery.astro`.
- [ ] Las fotos propias salen en `webp` a 800 y 1600 px.
- [ ] Un trabajo con `labPreview` muestra «Con vista 3D» y el visor muestra las dos imágenes rotuladas.
- [ ] En 375 px, las dos imágenes del visor van una debajo de la otra y no hay scroll horizontal.
- [ ] Un trabajo con `labProductId` muestra «Diseñar algo parecido» en el visor y lleva al producto en el Lab.
- [ ] Sin fotos ilustrativas, desaparece la bajada sobre fotos ilustrativas.
- [ ] `?cat=` y `?obra=` siguen abriendo el filtro y el trabajo.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** las fotos propias van en `src/assets/works/` y se optimizan en el build. Es el mismo camino que los logos y evita generar los `.webp` a mano.
- **Sí:** los filtros son las categorías de `CATEGORIES`. Una sola lista de categorías para todo el sitio, que también usan las páginas de la SPEC 18.
- **Sí:** vista 3D y pieza real lado a lado. Es la prueba de que el simulador es fiel y es contenido que sólo AUREO puede publicar.
- **No:** un control deslizante de antes y después. Necesita script y en móvil se usa mal.
- **No:** carpeta autocargada sin `WORKS` (como los logos). Un trabajo necesita título, material, detalle y categoría, que no caben en el nombre del archivo.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Las fotos del taller tienen calidad despareja (luz, fondo). | El README da una guía corta: luz natural, fondo liso, el grabado en foco y al menos 1600 px del lado largo. |
| La captura del Lab y la foto no tienen el mismo encuadre y la comparación confunde. | El README pide sacar la captura desde la vista de zona del Lab, que es la que más se parece a una foto del grabado. |
| Muchas fotos propias pesan en la home. | Las imágenes son `loading="lazy"` y la home sólo carga la de 800 px; la de 1600 se pide al abrir el visor. |
| Cambiar los ids de categoría rompe enlaces viejos con `?cat=tablas`. | Los 4 ids actuales existen en `CATEGORIES` con el mismo nombre. |

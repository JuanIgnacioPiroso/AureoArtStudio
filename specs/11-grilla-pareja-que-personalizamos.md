# SPEC 11 — Grilla pareja y compacta en «Qué personalizamos»

> **Estado:** Implementado
> **Depende de:** SPEC 08, SPEC 10
> **Fecha:** 2026-10-29
> **Objetivo:** Reemplazar la grilla editorial de «Qué personalizamos» por una grilla uniforme de 4 × 2 tarjetas iguales, con todas las fotos en 4:3, que se vea compacta en escritorio, tablet y móvil.

---

## Por qué esta spec

La grilla de `src/sections/Categories.astro` se pensó para pocas categorías: la primera ocupa 4 × 2 celdas, la 2ª y la 3ª van en 1.618:1, la 4ª es una franja de 2.4:1 y el resto en 4:5. Con las 8 categorías que hay desde la SPEC 10 (sumó «Cuero»), el resultado mezcla cuatro proporciones, alturas de texto distintas y la 8ª categoría queda sola en su fila. Se ve dispareja y ocupa mucho alto.

Con 8 categorías, 4 columnas × 2 filas iguales cierran justas, sin huecos.

---

## Alcance

**Entra:**

- **Marcado** (`src/sections/Categories.astro`):
  - se quita la clase `category--lead` y la lógica `i === 0`; todas las tarjetas son iguales;
  - `sizes` único para todas: `(min-width: 901px) 25vw, 50vw`;
  - se quitan los enlaces de abajo («Diseñarlo en el Custom Lab» / «Consultar por este producto»);
  - la tarjeta entera es clickeable: el nombre (`h3`) lleva un `<a class="category__link">` con el mismo destino que el enlace de hoy (`/custom-lab/?producto=<id>` o `#contacto`), y su `::after` se estira sobre toda la tarjeta (`.category` con `position: relative`);
  - el nombre accesible del enlace es el de la categoría más un texto `.visually-hidden` con el destino: «, diseñarlo en el Custom Lab» o «, consultar por este producto»;
  - el nombre de la categoría y la descripción no cambian.
- **Estilos** (bloque `.categories` / `.category` de `src/styles/landing.css`):
  - se borran las reglas de `.category--lead`, `.category:nth-child(2)`, `:nth-child(3)`, `:nth-child(4)` y `:nth-child(n + 2)`, con sus comentarios;
  - escritorio (> 900 px): `grid-template-columns: repeat(4, minmax(0, 1fr))`;
  - tablet (561–900 px): 2 columnas;
  - móvil (≤ 560 px): 2 columnas (hoy es 1);
  - todas las fotos con `aspect-ratio: 4 / 3` en todos los anchos;
  - el gap se achica para que la grilla se lea compacta;
  - el nombre baja de `--step-2` a `--step-1`, porque la tarjeta es ~4 veces más angosta que la destacada de hoy;
  - descripción recortada a 2 líneas (`line-clamp: 2`) y con el alto de 2 líneas reservado, así todas las tarjetas de una fila miden lo mismo aunque la descripción sea corta;
  - al pasar el mouse por la tarjeta, el nombre toma `--accent` (como `.text-link:hover`) y el cursor es de enlace;
  - con foco de teclado, el contorno de `:focus-visible` rodea toda la tarjeta (se dibuja en el `::after`);
  - en ≤ 560 px la descripción se oculta: queda foto y nombre.
- La marca «Imagen ilustrativa» de `Picture.astro` se mantiene como está.

**No entra:**

- Cambiar las fotos. «Productos empresariales» y «Placas y reconocimientos» siguen compartiendo `IMAGES.laser` hasta que lleguen fotos propias.
- Cambiar nombres, descripciones, orden o `enabled` de `CATEGORIES` en `src/content/site.ts`.
- Cambiar los destinos: siguen siendo los de `labProductHref` y `#contacto`.
- Carrusel horizontal en móvil.
- Centrar la última fila cuando la cantidad de categorías no sea múltiplo de 4 (o de 2).
- Tocar `Picture.astro`, la Galería u otras secciones.

---

## Modelo de datos

No hay datos nuevos. `Category` e `IMAGES` en `src/content/site.ts` no cambian.

---

## Plan de implementación

1. **Marcado.** En `Categories.astro`, quitar `category--lead` del `class:list` (queda `class="category"`) y usar el `sizes` único. `npm run build` pasa; la grilla vieja se ve rota hasta el paso 2, porque todavía tiene las reglas `:nth-child`.
2. **Grilla uniforme.** En `landing.css`, borrar las reglas de la destacada, las `:nth-child` y sus media queries, y dejar: 4 columnas en escritorio, 2 en ≤ 900 px y 2 en ≤ 560 px, con `aspect-ratio: 4 / 3` en todas las fotos y el gap más chico.
3. **Texto parejo.** Nombre en `--step-1`, descripción a 2 líneas con el alto reservado, enlace pegado abajo (la tarjeta en columna, con el enlace en `margin-top: auto`), y descripción oculta en ≤ 560 px.
4. **Tarjeta clickeable.** En `Categories.astro`, quitar los enlaces de abajo y poner el `<a class="category__link">` dentro del `h3`, con el texto oculto del destino. En `landing.css`, borrar la regla `.category__text .text-link`, sumar el `::after` estirado, el hover del nombre y el foco sobre la tarjeta.
5. **Verificación visual.** Capturas de la sección a 1440, 768 y 375 px con el Chromium de Playwright por CDP (la extensión de Chrome se cuelga con el 3D, y acá alcanza con la home). Correr `npm run lint`, `npm run typecheck` y `npm run build`.

---

## Criterios de aceptación

**Escritorio (1440 px)**

- [ ] Las 8 categorías se ven en 2 filas de 4, sin huecos.
- [ ] Las 8 fotos miden lo mismo de ancho y de alto, en 4:3.
- [ ] En cada fila, los nombres empiezan a la misma altura y las tarjetas terminan a la misma altura.
- [ ] Ninguna descripción pasa de 2 líneas; si se corta, termina en «…».
- [ ] La sección mide menos de alto que antes del cambio (comparar capturas a 1440 px).

**Tablet (768 px)**

- [ ] 4 filas de 2 tarjetas iguales, con fotos en 4:3 y la descripción visible a 2 líneas como máximo.

**Móvil (375 px)**

- [ ] 4 filas de 2 tarjetas iguales, con fotos en 4:3.
- [ ] No se ve la descripción; cada tarjeta muestra foto y nombre.
- [ ] La página no tiene scroll horizontal.

**Código**

- [ ] `landing.css` no tiene reglas `.category--lead` ni `.category:nth-child(…)`.
- [ ] `Categories.astro` no tiene la clase `category--lead` ni un `sizes` que dependa del índice.
- [ ] Las tarjetas no muestran «Diseñarlo en el Custom Lab» ni «Consultar por este producto» como texto visible.
- [ ] Un clic en cualquier punto de la tarjeta (foto, nombre o descripción) lleva a `/custom-lab/?producto=<id>` o a `#contacto`, los mismos destinos que antes.
- [ ] Hay un solo enlace por tarjeta, y su nombre accesible es el de la categoría más el destino (p. ej. «Cuchillos y accesorios, diseñarlo en el Custom Lab»).
- [ ] Con Tab, el foco pasa por las 8 tarjetas en orden y el contorno rodea la tarjeta entera.
- [ ] Al pasar el mouse por una tarjeta, el nombre cambia a `--accent`.
- [ ] La home sigue sin `<script>` nuevo en la sección.
- [ ] `npm run lint`, `npm run typecheck` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** 4 columnas × 2 filas, todas iguales. Con 8 categorías cierra justo y es lo más compacto. Lo eligió el usuario.
- **No:** 3 columnas. La última fila quedaría con 2 tarjetas.
- **No:** mantener una primera categoría destacada de 2 × 2. Vuelve a haber dos tamaños, que es lo que hoy se ve disparejo.
- **Sí:** todas las fotos en 4:3. Apaisada leve: compacta en alto y recorta poco las fotos actuales (la mayoría son 16:9 o 3:2; las verticales del termo y del vidrio se recortan arriba y abajo con `object-fit: cover`, que ya está).
- **No:** 1:1 ni 4:5. Más altas, la sección crece.
- **Sí:** nombre, descripción y enlace, con la descripción a 2 líneas. Se conserva la información y las tarjetas quedan del mismo alto.
- **Sí:** tarjeta entera clickeable, sin los enlaces de abajo. La grilla queda más limpia y no se pierde el acceso al Lab ni a contacto. Lo pidió el usuario durante la implementación.
- **No:** sacar los enlaces sin hacer clickeable la tarjeta. Las categorías serían el único camino de la home al Lab por producto.
- **Sí:** un solo `<a>` en el nombre, con `::after` estirado, en lugar de envolver toda la tarjeta en el `<a>`. Así el nombre accesible es corto (categoría + destino) y no lee la descripción entera.
- **Sí:** 2 columnas en móvil y en tablet, con la descripción oculta en ≤ 560 px. En una columna la sección ocupaba unas 8 pantallas.
- **No:** carrusel horizontal en móvil. Esconde categorías.
- **Sí:** nombre en `--step-1`. Es consecuencia de tarjetas de ~¼ del ancho; `--step-2` parte nombres como «Productos empresariales» en tres líneas.
- **Sí:** la foto repetida de empresas y placas queda fuera de alcance. Esta spec es sólo de maquetación y las fotos son provisionales.
- **Sí:** si cambia la cantidad de categorías habilitadas, se acepta el hueco en la última fila. Se ajusta cuando cambien.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Con 7 o 9 categorías habilitadas queda un hueco en la última fila. | Aceptado (ver Decisiones). Si pasa, va en otra spec. |
| El recorte a 4:3 corta mal las fotos verticales (termo y vidrio, 3:4). | `object-fit: cover` centra la imagen. Se revisa en las capturas del paso 4; si se pierde el objeto, se ajusta `object-position` sólo para esa tarjeta. |
| En móvil, sin descripción, «Regalos personalizados» o «Productos empresariales» no dicen qué incluyen. | El nombre y la foto alcanzan para elegir; la descripción sigue en tablet y escritorio. |
| La marca «Imagen ilustrativa» tapa parte de una foto chica en móvil. | Se revisa en la captura a 375 px. Achicarla queda fuera de alcance salvo que tape el objeto. |
| Un nombre largo ocupa 2 líneas y desalinea la descripción con la de su vecina. | Las tarjetas de la fila terminan a la misma altura igual; se acepta que el arranque de la descripción varíe una línea. |
| Sin el texto del enlace, no es evidente que la tarjeta se puede clickear (sobre todo en móvil, donde no hay hover). | La foto y el nombre juntos se leen como tarjeta de producto, que es un patrón conocido. Si hace falta una señal visible, va en otra spec. |

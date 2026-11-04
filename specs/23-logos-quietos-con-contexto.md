# SPEC 23 — Logos de «Confían en nosotros» quietos y con contexto

> **Estado:** Aprobado
> **Depende de:** SPEC 09, SPEC 19
> **Fecha:** 2026-11-04
> **Objetivo:** Reemplazar el carrusel de logos de «Confían en nosotros» por una grilla quieta, con una bajada que diga quiénes son, y borrar el código del carrusel.

---

## Por qué esta spec

La franja de la home (`div.trusted__track`) mueve 18 logos en bucle: los 9 de `src/assets/logos/` dos veces seguidas. La cinta de logos que se mueve sola es el adorno más copiado de las landings genéricas, y hace que logos reales parezcan de relleno. Además, en pantallas táctiles no se puede pausar (riesgo ya anotado en la SPEC 09).

Los 9 logos son clientes reales de AUREO (lo confirmó el usuario): ESEADE, Legislatura de la Ciudad de Buenos Aires, Ministerio de Seguridad, Ministerio del Interior, Municipio de Pilar, Municipio de Tigre, Poder Judicial de Río Negro, Prefectura Naval Argentina y Provincia de Buenos Aires. Por eso se quedan, pero quietos y con una línea que explique qué tienen en común.

La versión quieta ya existe: es la prop `static` de `TrustedBy.astro`, que usa `/regalos-empresariales/` desde la SPEC 19. Esta spec la hace la única.

---

## Alcance

**Entra:**

- **`src/sections/TrustedBy.astro`:**
  - siempre renderiza la grilla quieta: un `<ul class="trusted__logos">` con un `<li>` por logo, cada logo una sola vez y con `alt` = nombre;
  - se borran la prop `static`, `MIN_TRACK_ITEMS`, la mitad duplicada, las repeticiones, `--trusted-duration`, los `aria-hidden` y las `<img alt="">` de las copias;
  - bajada nueva debajo del título: `<p class="trusted__lede">Instituciones públicas, municipios y universidades que nos encargaron placas y reconocimientos.</p>`;
  - prop nueva `corporateLink?: boolean` (por defecto `true`) que muestra el enlace «Pedidos para empresas», para reemplazar la condición `!isStatic`;
  - el comentario del componente se reescribe para describir la grilla quieta, sin carrusel.
- **`src/pages/regalos-empresariales/index.astro`:** `<TrustedBy static />` pasa a `<TrustedBy corporateLink={false} />`. La página se ve igual que hoy, más la bajada.
- **`src/styles/landing.css`** (bloque «Confían en nosotros»):
  - se borran `.trusted__marquee`, `.trusted__track`, `@keyframes trusted-scroll`, el bloque `@media (prefers-reduced-motion: reduce)` de la franja y el modificador `.trusted__logos--static`;
  - `.trusted__logos` toma lo que hoy tiene la versión quieta: `margin-top: var(--s2)`, `flex-wrap: wrap`, `justify-content: center`, `row-gap: var(--s2)` y sin `padding-right`;
  - estilo nuevo `.trusted__lede`: centrado, `font-size: var(--step--1)`, `color: var(--fg-muted)`, con un `max-width` en `ch` para que no ocupe todo el ancho.
- **`src/sections/Hero.astro`:** el comentario dice que el carrusel de logos es «el único movimiento automático de la página». Se corrige para que no lo nombre (la home ya no tiene movimiento automático).

**No entra:**

- Cambiar qué logos se muestran, su orden o su nombre accesible (`src/content/logos.ts` y `src/assets/logos/` no se tocan).
- Una línea por logo que diga qué se hizo para cada cliente.
- Enlazar los logos a sus trabajos de la galería (Tigre y ESEADE tienen; los otros 7, no).
- Cambiar el lugar de la sección (entre Hero y «Productos»), el título «Confían en nosotros», el tono claro, el gris con color al pasar el mouse, el `mix-blend-mode: multiply`, la altura de 56 / 44 px ni el enlace «Pedidos para empresas».
- Actualizar el README (no menciona el carrusel) o reescribir la SPEC 09 (queda como registro de lo que se hizo).
- Cualquier otra sección de la home o de `/regalos-empresariales/`.

---

## Modelo de datos

No hay datos nuevos. `TrustedLogo` y `TRUSTED_LOGOS` (`src/content/logos.ts`) quedan igual.

El único cambio de interfaz es la prop del componente:

```ts
// src/sections/TrustedBy.astro
interface Props {
  /** Muestra el enlace «Pedidos para empresas». false en la página de empresas, que ya es ese destino. */
  corporateLink?: boolean
}
```

---

## Plan de implementación

1. **Componente.** En `TrustedBy.astro`, borrar la rama del carrusel y la prop `static`; dejar la lista de logos única, sumar la bajada y la prop `corporateLink`. Reescribir el comentario. Cambiar la llamada de `/regalos-empresariales/` a `<TrustedBy corporateLink={false} />`.
2. **Estilos.** En `landing.css`, borrar las reglas del carrusel y del movimiento reducido, pasar los estilos de `.trusted__logos--static` a `.trusted__logos` y sumar `.trusted__lede`.
3. **Comentario del Hero.** Corregir la frase que nombra el carrusel.
4. **Verificación.** Capturas con el Chromium de Playwright por CDP de la franja en la home y en `/regalos-empresariales/`, a 1440 y a 375 px. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] En `dist/index.html`, la sección `#confian` tiene 9 `<img class="trusted__logo">`, cada una con su `alt` no vacío y sin repetidos.
- [ ] `dist/index.html` no contiene `trusted__track`, `trusted__marquee`, `--trusted-duration` ni `aria-hidden` dentro de `#confian`.
- [ ] `src/styles/landing.css` no contiene `trusted-scroll`, `trusted__track`, `trusted__marquee` ni `trusted__logos--static`.
- [ ] Al abrir la home y esperar 5 s, los logos están en el mismo lugar (no hay animación).
- [ ] Debajo de «Confían en nosotros» se lee «Instituciones públicas, municipios y universidades que nos encargaron placas y reconocimientos.», en la home y en `/regalos-empresariales/`.
- [ ] La home muestra el enlace «Pedidos para empresas» debajo de los logos; `/regalos-empresariales/` no lo muestra.
- [ ] Los logos se ven centrados y saltan de línea cuando no entran, a 1440 y a 375 px, sin scroll horizontal.
- [ ] Siguen igual: lugar entre el Hero y «Productos», título en `h2#confian-title`, `data-tone="light"`, gris con color al pasar el mouse sobre cada logo, 56 px de alto a 1440 px y 44 px a 375 px.
- [ ] Con `src/assets/logos/` vacía, la sección sigue sin renderizarse en ninguna de las dos páginas.
- [ ] El comentario de `Hero.astro` no menciona el carrusel.
- [ ] `TrustedBy.astro` sigue sin `<script>` y la home no suma chunks de JS.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** los logos se quedan. Los 9 son clientes reales, confirmado por el usuario. Con la regla «si son reales, quietos y con contexto; si no, afuera», corresponde mostrarlos quietos.
- **Sí:** el contexto es una bajada general, no una línea por logo. Describe a los 9 sin pedir datos nuevos al taller.
- **No:** qué se hizo para cada cliente. Sólo Tigre y ESEADE tienen trabajo en la galería; para los otros 7 habría que inventar o esperar el dato.
- **No:** enlazar Tigre y ESEADE a `?obra=`. Con 2 de 9 enlazados la grilla queda despareja y suma paradas de teclado que no se distinguen a simple vista.
- **Sí:** borrar el código del carrusel en lugar de dejarlo detrás de una prop. Ninguna página lo usaría y es código para mantener sin uso.
- **Sí:** prop `corporateLink` para el enlace a empresas. Antes dependía de `static`; una prop explícita dice para qué está.
- **No:** decidir el enlace comparando `Astro.url.pathname` con `CORPORATE_PATH`. Depende de la barra final de la URL y esconde la regla dentro del componente.
- **Sí:** todo lo demás de la franja queda igual (lugar, título, gris con hover, tamaños, enlace). Lo pidió el usuario: cambiar sólo el movimiento.
- **Sí:** la SPEC 09 no se edita. Queda como registro; esta spec la reemplaza en lo que toca al carrusel.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La bajada promete «placas y reconocimientos» y algún cliente encargó otra cosa (p. ej. regalos o termos). | Es una sola línea en `TrustedBy.astro`. Se valida con el taller y se cambia el texto sin tocar nada más. |
| Con 9 logos quietos, a 1440 px la grilla puede quedar en dos filas con la segunda corta. | Va centrada (`justify-content: center`), como ya se ve en `/regalos-empresariales/`. Se revisa en las capturas del paso 4. |
| La bajada, ahora también en `/regalos-empresariales/`, repite algo que la página ya dice. | Esa página habla de pedidos de empresas, no de quiénes ya encargaron. Si se ve redundante en la captura, se agrega una prop para ocultarla en otra spec. |

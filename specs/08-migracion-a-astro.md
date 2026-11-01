# SPEC 08 — Migración del sitio a Astro

> **Estado:** Implementado
> **Depende de:** SPEC 04, SPEC 07
> **Fecha:** 2026-10-27
> **Objetivo:** Pasar el sitio de Vite multi-página a Astro estático, con la home en componentes `.astro` sin React y el Custom Lab como única isla de React (`client:only`) dentro de una página Astro.

---

## Por qué esta spec

Hoy el sitio es Vite multi-página (SPEC 04): `index.html` → `src/main.tsx` → `App.tsx` y `custom-lab/index.html` → `src/lab-page/main.tsx` → `LabPage.tsx`. Las dos páginas se renderizan del todo en el navegador con React.

- **La home es casi toda estática.** Solo dos componentes tienen estado: `Header` (tono según la sección, sombra al scrollear, menú móvil con trampa de foco) y `Gallery` (filtros, lightbox, `?cat=` y `?obra=` en la URL). Todo lo demás es texto e imágenes que React arma en el cliente. La home descarga React para pintar HTML que podría venir hecho.
- **El Custom Lab necesita React de verdad:** three.js / React Three Fiber / drei, zustand y el editor por capas. No se reescribe. Queda como una isla de React montada solo en el cliente, porque three.js no se puede renderizar en el servidor.
- **Resultado esperado:** la home sale como HTML estático con dos scripts chicos de TS plano y 0 KB de React. El Lab mantiene su comportamiento, pero el header, el encabezado compacto y el footer de su página salen en HTML desde el build.

**Numeración:** la SPEC 07 y el `README.md` reservaban «SPEC 08» para el cuero. El usuario decidió que esta migración tome el 08 y que el cuero pase a la **SPEC 09**. El primer paso del plan corrige esas referencias.

---

## Alcance

**Entra:**

- **Astro en modo estático** (`output: 'static'`) con la integración `@astrojs/react`. Sin adaptador de servidor.
  - `astro.config.mjs` con `trailingSlash: 'always'` y `build.format: 'directory'`. Así `/custom-lab/` sigue siendo la URL del Lab.
  - Se conserva el chunk diferido de three.js (`chunkSizeWarningLimit: 1100` pasa a `vite.build` en `astro.config.mjs`).
- **Páginas:**
  - `src/pages/index.astro` (home, `/`).
  - `src/pages/custom-lab/index.astro` (Lab, `/custom-lab/`).
- **Layout común** `src/layouts/BaseLayout.astro`:
  - `lang="es-AR"`, `charset`, `viewport`, `theme-color`, favicon, `og:*` y `twitter:card`, igual que en los HTML actuales;
  - props `title`, `description`, `ogTitle`, `ogDescription` y `fontsHref` (la URL de Google Fonts de cada página);
  - importa `tokens.css`, `base.css` y `landing.css`;
  - incluye el skip-link «Saltar al contenido», el `Header`, un `<slot />` dentro de `<main id="contenido">`, el `Footer` y `DevConfigNotice`.
- **Fuentes:** la home carga solo Bodoni Moda y Hanken Grotesk. El Lab carga además las 19 tipografías del editor. Las URLs son las mismas de hoy.
- **Componentes estáticos que pasan a `.astro`** (mismo markup, mismas clases, `className` → `class`):
  - `src/components/brand/Logo.astro`
  - `src/components/Picture.astro` (mismo `srcset` 800w/1600w a mano)
  - `src/components/ContactLinks.astro` (el `fallback` pasa a ser un slot con nombre `fallback`)
  - `src/components/DevConfigNotice.astro` (sigue usando `import.meta.env.DEV`)
  - `src/components/layout/Footer.astro`
  - `src/sections/Hero.astro`, `Categories.astro`, `Process.astro`, `Differentials.astro`, `Faq.astro` y `ContactCta.astro`
- **Componentes interactivos que pasan a `.astro` + `<script>` en TS plano** (sin React):
  - `src/components/layout/Header.astro`:
    - prop `page: 'home' | 'lab'`, con el mismo comportamiento de hoy en el Lab (sin CTA y `aria-current="page"` en «Simulador 3D»);
    - el script replica el tono por `IntersectionObserver` sobre `[data-tone]` con `rootMargin: '0px 0px -96% 0px'` y la clase `is-scrolled` a partir de 24 px;
    - menú móvil: `aria-expanded`, `hidden`, clase `is-open`, `data-tone="dark"` mientras está abierto, Esc cierra y devuelve el foco al botón, trampa de foco con Tab / Shift+Tab, bloqueo de scroll (`body.style.overflow` y `overscrollBehavior`) y cierre al tocar un enlace.
  - `src/sections/Gallery.astro`:
    - el HTML trae todas las obras, cada `<li>` con `data-category`, y el `<dialog class="lightbox">` vacío;
    - el script aplica `?cat=` y `?obra=` al cargar, filtra con el atributo `hidden`, actualiza `aria-pressed` de los chips y el texto del `role="status"` («1 trabajo» / «N trabajos»);
    - el script abre y cierra el lightbox con `showModal()` y `close()`, lo llena con la obra activa, lo cierra al hacer clic en el fondo y escribe `cat` y `obra` con `history.replaceState`, como hoy.
- **Página del Lab:**
  - el shell (header, encabezado compacto «AUREO Custom Lab» / `h1` «Tu idea, antes de grabarla.», footer) es Astro;
  - `<CustomLab client:only="react">` con `<div slot="fallback" class="lab-placeholder" role="status">Cargando el Custom Lab…</div>`;
  - `src/lab/` no cambia por dentro.
- **Redirección de enlaces viejos:** un `<script is:inline>` en el `<head>` de `index.astro` repite la lógica de `legacyLabRedirect` (`?d=` o `?producto=` → `location.replace('/custom-lab/?…')`) y corre antes de pintar. `legacyLabRedirect` sigue en `src/lab/intent.ts` con su test, como fuente documentada de la regla.
- **Contenido:** `src/content/site.ts`, `works.ts`, `image-credits.json` y `src/config/business.ts` no cambian. Se importan desde el frontmatter de los `.astro`.
- **Herramientas:**
  - `package.json`: `dev` → `astro dev`, `build` → `astro check && astro build`, `preview` → `astro preview`, `typecheck` → `astro check`. `test` y `lint` siguen.
  - Dependencias nuevas: `astro`, `@astrojs/react`, `@astrojs/check` y `eslint-plugin-astro`. Sale `@vitejs/plugin-react`, porque lo trae la integración.
  - `vitest.config.ts` con `getViteConfig` de `astro/config`. Los tests actuales corren sin cambios.
  - `tsconfig.json` único que extiende `astro/tsconfigs/strict` y conserva `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` y `jsx: react-jsx` (`jsxImportSource: react`). Se borran `tsconfig.app.json` y `tsconfig.node.json`.
  - `eslint.config.js` suma `eslint-plugin-astro` para los `.astro`. Las reglas de React quedan solo para `**/*.tsx`.
  - `vercel.json`: `"framework": "astro"` y se mantiene `"trailingSlash": true`.
- **Se borran:** `index.html`, `custom-lab/index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/lab-page/` y los `.tsx` de `src/sections/` y `src/components/` reemplazados por `.astro`.
- **Documentación:**
  - el `README.md` describe el stack Astro, los comandos, dónde vive cada página (`src/pages/`) y que la URL de las 19 tipografías está en `src/pages/custom-lab/index.astro`;
  - la SPEC 07 y el `README.md` pasan sus referencias de «SPEC 08» (cuero) a «SPEC 09».

**Queda fuera (para otras specs):**

- **Reescribir el Custom Lab fuera de React** (en Astro, vanilla o en otro framework). Queda en React.
- **Imágenes con `astro:assets`** (`<Image>` / `<Picture>`, `sharp`, mover fotos a `src/assets/`). Las fotos de `public/img/placeholder/` son provisionales. El pipeline de imágenes se decide cuando lleguen las fotos propias.
- **Content Collections** para `src/content/`. Los datos siguen siendo módulos TS.
- **View Transitions** o navegación sin recarga entre la home y el Lab.
- **Server-side rendering, adaptador de Vercel o endpoints.** El sitio sigue 100 % estático.
- **Redirecciones del lado del servidor** (`vercel.json` con `has: query`) para los enlaces viejos.
- **Cambios de diseño, de textos o de contenido.** Esta spec busca paridad.
- **La API de fuentes de Astro** o el self-hosting de Google Fonts.
- **Grabar el cuero:** pasa a la SPEC 10.

---

## Modelo de datos

Esta spec no introduce estructuras de datos nuevas. Reusa `src/content/site.ts` (`NAV`, `CATEGORIES`, `FAQ`, `ImageAsset`), `src/content/works.ts` (`WORK_CATEGORIES`, `WORKS`), `src/config/business.ts`, `src/content/image-credits.json` y el modelo del Lab (`DesignState` v2) sin cambios.

Lo único nuevo son props y atributos de componentes:

```ts
// src/layouts/BaseLayout.astro
interface Props {
  page: 'home' | 'lab'      // se pasa al Header
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  fontsHref: string         // URL de Google Fonts de la página
}

// src/components/layout/Header.astro
interface Props { page: 'home' | 'lab' }
```

```html
<!-- Gallery.astro: datos que el script lee del DOM -->
<button class="chip" data-filter="todos" aria-pressed="true">…</button>
<li class="work" data-category="cuchillos" data-work-id="…">…</li>
```

Los textos del lightbox (título, material, detalle, imagen grande) viajan en atributos `data-*` del botón de cada obra, o en un `<script type="application/json">` con `WORKS`. Se elige en la implementación, siempre que el HTML no duplique las imágenes grandes.

---

## Plan de implementación

1. **Línea base y renumeración.**
   - Con la SPEC 07 mergeada en `master`, hacer las capturas de referencia de `/` y `/custom-lab/` a 375 px y 1440 px. Se usa Playwright sobre CDP, como en la memoria del proyecto. Se guardan fuera del repo y no se commitean.
   - Anotar el peso de JS de la home (`dist/assets/*` que carga `index.html`).
   - En la SPEC 07 y el `README.md`, cambiar las referencias del cuero de «SPEC 08» a «SPEC 09».
2. **Esqueleto Astro con las páginas actuales como islas.**
   - Instalar `astro`, `@astrojs/react` y `@astrojs/check`, y crear `astro.config.mjs`, `tsconfig.json` y `vitest.config.ts`.
   - Actualizar los scripts de `package.json` y `vercel.json`.
   - Crear `BaseLayout.astro` (solo `<head>`, sin header ni footer todavía).
   - Crear `src/pages/index.astro`, que monta `<App client:load />` y lleva la redirección inline, y `src/pages/custom-lab/index.astro`, que monta `<LabPage client:only="react" />`.
   - Borrar `index.html`, `custom-lab/index.html`, `vite.config.ts`, `src/main.tsx` y `src/lab-page/main.tsx`.
   - El sitio funciona igual, ya servido por Astro. Pasan `npm run test`, `npm run build` y `npm run lint`.
3. **Componentes estáticos a `.astro`.**
   - Crear `Logo`, `Picture`, `ContactLinks`, `DevConfigNotice`, `Footer` y las secciones estáticas (`Hero`, `Categories`, `Process`, `Differentials`, `Faq` y `ContactCta`) como `.astro`.
   - `index.astro` deja de usar `App` y compone las secciones. `Header` y `Gallery` siguen, por ahora, como islas React (`client:load`).
   - Borrar `App.tsx` y los `.tsx` reemplazados que ya nadie importa.
4. **Header en Astro y shell del Lab.**
   - Crear `Header.astro` con su script y moverlo, junto con el `Footer` y `DevConfigNotice`, al `BaseLayout`.
   - `custom-lab/index.astro` arma el shell en Astro y monta `<CustomLab client:only="react">` con el fallback «Cargando el Custom Lab…».
   - Borrar `Header.tsx` y `src/lab-page/`.
5. **Galería en Astro.** Crear `Gallery.astro` con su script y borrar `Gallery.tsx`. Desde este paso, la home no importa React.
6. **Lint y documentación.**
   - Sumar `eslint-plugin-astro` y limitar las reglas de React a `**/*.tsx`.
   - Quitar `@vitejs/plugin-react` de `devDependencies`.
   - Actualizar el `README.md` (stack, comandos, páginas en `src/pages/`, URL de las tipografías).

---

## Criterios de aceptación

**Build y herramientas**

- [ ] `npm run build` (`astro check && astro build`) termina sin errores y genera `dist/index.html` y `dist/custom-lab/index.html`.
- [ ] `npm run test` pasa con los mismos tests que antes de la migración, incluido `intent.test.ts`.
- [ ] `npm run lint` y `npm run typecheck` terminan sin errores.
- [ ] No quedan `index.html`, `custom-lab/index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx` ni `src/lab-page/`.
- [ ] Ningún archivo en `src/sections/` ni en `src/components/` es `.tsx`.

**Home sin React**

- [ ] `dist/index.html` trae en el HTML el texto del hero, las categorías, la galería, el proceso, los diferenciales, el FAQ y el footer, sin ejecutar JS.
- [ ] Ningún `<script>` ni `modulepreload` de `dist/index.html` apunta a un chunk que contenga `react-dom`.
- [ ] La home no descarga ningún chunk de three.js.

**Paridad visual**

- [ ] Las capturas de `/` y `/custom-lab/` a 375 px y 1440 px coinciden con las de referencia del paso 1, salvo diferencias de antialiasing.

**Header**

- [ ] Al scrollear la home, el header toma `data-tone="light"` sobre las secciones claras y vuelve a oscuro sobre las oscuras.
- [ ] Pasados 24 px de scroll, el header tiene la clase `is-scrolled`.
- [ ] En móvil, el botón abre el menú: `aria-expanded="true"`, el panel sin `hidden`, el foco en el primer enlace y la página sin scroll.
- [ ] Con el menú abierto, Tab y Shift+Tab no salen del panel, y Esc lo cierra y devuelve el foco al botón.
- [ ] En `/custom-lab/` no aparece el CTA «Personalizá tu producto» y «Simulador 3D» tiene `aria-current="page"`.

**Galería**

- [ ] Hacer clic en un chip filtra las obras, marca el chip con `aria-pressed="true"` y escribe `?cat=<id>` en la URL sin sumar una entrada al historial.
- [ ] Abrir `/?cat=<id>` carga la galería ya filtrada.
- [ ] Hacer clic en una obra abre el lightbox con su imagen grande y su texto, y escribe `?obra=<id>`.
- [ ] Abrir `/?obra=<id>` carga con el lightbox abierto.
- [ ] El lightbox se cierra con «Cerrar», con Esc y con clic en el fondo. Al cerrarse, `obra` sale de la URL.

**Custom Lab y enlaces**

- [ ] `/custom-lab/` muestra el header y el encabezado compacto en el HTML del build, «Cargando el Custom Lab…» mientras baja el Lab, y después el editor y el 3D como antes.
- [ ] `/custom-lab/?producto=<id>` abre el Lab con ese producto.
- [ ] Un enlace `/custom-lab/?d=…` generado antes de la migración abre el mismo diseño.
- [ ] `/?d=…` y `/?producto=<id>` redirigen a `/custom-lab/` con los mismos parámetros, sin pintar la home.
- [ ] `/custom-lab` (sin barra final) redirige a `/custom-lab/` en el deploy de Vercel.
- [ ] Las 19 tipografías del editor se cargan solo en `/custom-lab/`. La home pide a Google Fonts solo Bodoni Moda y Hanken Grotesk.
- [ ] En desarrollo, el aviso de `DevConfigNotice` aparece en las dos páginas. En el build de producción no aparece.

**Documentación**

- [ ] El `README.md` describe Astro, los comandos nuevos y dónde vive cada página.
- [ ] La SPEC 07 y el `README.md` nombran a la SPEC 09 (no la 08) para el cuero.

---

## Decisiones

- **Sí:** Astro estático, sin adaptador. El sitio no tiene datos dinámicos del lado del servidor.
- **Sí:** Header y Galería en `.astro` con `<script>` en TS plano. La home queda sin React.
- **No:** Header y Galería como islas React (`client:load`). Son menos trabajo, pero la home seguiría bajando React por dos componentes chicos.
- **Sí:** shell del Lab en Astro y solo `<CustomLab>` como isla `client:only="react"`. El header y el footer salen en HTML desde el build y comparten el mismo componente con la home.
- **No:** mover `LabPage.tsx` entero como isla. Obliga a mantener una versión React del header solo para el Lab.
- **No:** reescribir el Lab fuera de React. Es three.js + R3F + zustand + el editor, con alto costo y riesgo y sin beneficio para el usuario.
- **Sí:** redirección vieja con `<script is:inline>` en el `<head>`. Corre antes de pintar y funciona en `astro dev`, en `astro preview` y en Vercel.
- **No:** redirects de `vercel.json` con `has: query`. Solo funcionan en Vercel.
- **Sí:** el script inline repite la regla de `legacyLabRedirect`, y la función queda en `intent.ts` con su test. Un `<script is:inline>` no puede importar módulos. Son cuatro líneas y la regla está congelada.
- **Sí:** imágenes en `public/` con el `srcset` a mano. **No:** `astro:assets` ahora. Las fotos son provisionales y van a cambiar.
- **Sí:** contenido como módulos TS. **No:** Content Collections. Sería otra migración, sin ganancia hoy.
- **Sí:** migración incremental. La primera versión monta `App` y `LabPage` como islas, y los componentes se convierten de a uno. Cada paso queda funcionando y se puede commitear.
- **Sí:** el año del footer (`new Date().getFullYear()`) pasa a calcularse en el build. Se actualiza en cada deploy, que es suficiente para un © anual.
- **Sí:** la migración arranca después de mergear la SPEC 07 en `master`. Así no se mezclan los dos diffs.
- **Sí:** esta spec toma el número 08 y el cuero pasa a la SPEC 09. Lo decidió el usuario.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El script del header o de la galería se comporta distinto que el original (foco, tono, URL). | Criterios de aceptación uno a uno para cada comportamiento de hoy. La lógica se porta casi línea por línea desde los `.tsx`. |
| `client:only` cambia cuándo y cómo se monta el Lab (orden de CSS, `Suspense`, lectura de `?d=`). | El store ya lee la URL al cargar. Se verifica con enlaces `?d=` y `?producto=` reales antes y después. |
| `lab.css` o `landing.css` cambian de orden de carga y rompen la cascada. | Las capturas de paridad del paso 1 detectan diferencias. Los estilos globales se importan en el layout, en el mismo orden de hoy. |
| `astro check` es más estricto que `tsc -b` y marca errores nuevos en `src/lab/`. | Se corrigen en el paso 2, antes de convertir componentes. Si son muchos, `astro check` queda fuera de `build` hasta el paso 6. |
| La redirección inline se separa de `legacyLabRedirect`. | Un comentario en los dos lugares apunta al otro. Hay un criterio de aceptación manual para `/?d=` y `/?producto=`. |
| Vercel no detecta bien el framework o la barra final. | `vercel.json` declara `framework: astro` y `trailingSlash: true`. Se verifica `/custom-lab` → `/custom-lab/` en un preview deploy. |

---

## Qué **no** entra en esta spec

- Reescribir el Custom Lab fuera de React.
- `astro:assets` y el pipeline de imágenes.
- Content Collections.
- View Transitions o navegación sin recarga.
- SSR, adaptador o endpoints.
- Redirecciones del lado del servidor.
- Cambios de diseño o de contenido.
- Grabar el cuero (SPEC 10).

Cada uno, si llega, va en su propia spec.

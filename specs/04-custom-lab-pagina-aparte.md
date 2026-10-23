# SPEC 04 — Custom Lab en una página aparte

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-10-23
> **Objetivo:** Sacar el Custom Lab de la landing y servirlo en su propia página, `/custom-lab/`, con la edición y el 3D en dos mitades lado a lado, sin romper los enlaces de diseños ya compartidos.

---

## Por qué esta spec

Hoy el Lab es una sección más de la home (`#custom-lab`, en `src/sections/LabSection.tsx`).

- **La carga:** la sección descarga three.js cuando se acerca al viewport, así que casi cualquier visita a la home termina bajando el Lab.
- **Los enlaces:** todo apunta al ancla `#custom-lab` (header, hero, categorías, contacto, enlaces para compartir), y las categorías usan un puente por eventos (`src/lab/intent.ts`) para cambiar de producto sin recargar.
- **El tamaño:** el Lab vive dentro de `.wrap`. La columna izquierda (61,8 %) apila el lienzo del editor arriba y el 3D abajo, y el panel de pasos queda a la derecha con 340 px. El lienzo y el 3D se ven chicos.
- **La solución:** una segunda página HTML de Vite (multi-página). La home deja de tener código del Lab y el Lab tiene su propia URL, título y descripción. En esa página, el Lab ocupa toda la ventana y se divide en dos mitades verticales: todo lo de edición a la izquierda y el objeto 3D a la derecha.

---

## Alcance

**Entra:**

- Una página nueva, `custom-lab/index.html`, servida en `/custom-lab/`, con su propia entrada (`src/lab-page/main.tsx`) y su componente (`src/lab-page/LabPage.tsx`).
- La página usa el mismo `Header`, `Footer` y `DevConfigNotice` que la home.
- La página tiene un encabezado compacto de una línea, arriba del Lab: «AUREO Custom Lab» y el `h1` «Tu idea, antes de grabarla.». El texto de bajada no se muestra; pasa a la `meta description`.
- **Pantalla dividida (≥ 960 px):**
  - el Lab ocupa todo el ancho de la ventana (sin `.wrap`) y el alto que queda debajo del header y del encabezado compacto;
  - dos columnas iguales (50/50), separadas por una línea vertical;
  - **izquierda, «Edición»:** la barra de herramientas del editor (`EditorToolbar`) y el lienzo (`DesignCanvas`) fijos arriba, y debajo los pasos 1 a 4, que scrollean dentro de la columna;
  - **derecha, «3D»:** el visor 3D (o la vista plana de respaldo) ocupa toda la columna, con la barra de controles (Producto / Zona de grabado, Restablecer vista, Pantalla completa, Descargar imagen, Copiar enlace) y la ayuda abajo;
  - la página no scrollea mientras se usa el Lab; el footer queda debajo y se llega con el scroll de la página al salir del Lab.
- **Pantallas angostas (< 960 px):**
  - una sola columna con dos pestañas, «Editar» y «Ver en 3D»;
  - «Editar» muestra la barra de herramientas, el lienzo y los pasos 1 a 4;
  - «Ver en 3D» muestra el visor y su barra de controles, con el alto disponible de la ventana;
  - la pestaña por defecto es «Editar».
- «Pantalla completa» sigue mostrando sólo el 3D.
- La página tiene su propio `<title>`, `meta description` y `og:title` / `og:description`. Reutiliza `og-image.png`.
- El Lab se sigue cargando diferido (`lazy` + `Suspense`) dentro de la página, con el aviso «Cargando el Custom Lab…».
- La home deja de mostrar la sección del Lab. Se borran `src/sections/LabSection.tsx` y `src/components/LabProductLink.tsx`.
- Todos los accesos al Lab pasan a ser enlaces comunes a `/custom-lab/`:
  - el CTA «Personalizá tu producto» del header (escritorio y móvil);
  - el ítem «Simulador 3D» de `NAV`;
  - los botones del hero y de contacto;
  - las categorías, con `/custom-lab/?producto=<id>`.
- Los enlaces de `NAV`, del logo y del footer pasan a ser absolutos (`/#productos`, `/#inicio`, …), así funcionan desde las dos páginas.
- En `/custom-lab/`, el header oculta el CTA «Personalizá tu producto» y marca «Simulador 3D» con `aria-current="page"`.
- Los enlaces para compartir un diseño (`designUrl`) pasan a ser `/custom-lab/?d=…`, sin ancla.
- Redirección de enlaces viejos: si la home recibe `d` o `producto` en la URL, redirige con `location.replace` a `/custom-lab/` con los mismos parámetros.
- Se elimina el puente por eventos de `src/lab/intent.ts` (`requestLabProduct`, `onLabProductRequest`). El Lab lee el producto de la URL al cargar, como ya hace `store.ts`.
- Las 19 tipografías del editor se cargan sólo en `custom-lab/index.html`. La home carga sólo las suyas (Bodoni Moda y Hanken Grotesk).
- `vercel.json` suma `"trailingSlash": true`, para que `/custom-lab` redirija a `/custom-lab/`.
- El `README.md` se actualiza: dónde vive el Lab y que la URL de Google Fonts de las tipografías está en `custom-lab/index.html`.

**Queda fuera (para otras specs):**

- **Un bloque teaser del Lab en la home:** se decidió quitar la sección sin reemplazo.
- **Un router** (react-router u otro) o navegación sin recarga entre páginas.
- **Un layout sin header ni footer** para el Lab: se mantienen los del sitio.
- **Una división ajustable** (arrastrar la línea entre las dos mitades).
- **Cambios en el funcionamiento del Lab** (editor, visor, paneles, presupuesto): sólo cambia dónde se ubica cada parte.
- **Una imagen OG propia** para la página del Lab.
- **SEO adicional** (sitemap, canonical, datos estructurados).

---

## Modelo de datos

Esta spec no agrega estructuras de datos. `DesignState` y el formato de `?d=` no cambian.

Cambian las URLs que arma `src/lab/intent.ts`:

```ts
// src/lab/intent.ts
export const LAB_PATH = '/custom-lab/'
export const PRODUCT_PARAM = 'producto'

/** URL compartible que abre el Lab con el producto elegido. */
export function labProductHref(productId: string): string
// → '/custom-lab/?producto=thermos-handle'

/** Si la home recibe un enlace viejo (?d= o ?producto=), la URL nueva del Lab; si no, null. */
export function legacyLabRedirect(search: string): string | null
// '?d=abc' → '/custom-lab/?d=abc'
// '?producto=knife' → '/custom-lab/?producto=knife'
// '' o '?utm_source=x' → null
```

```ts
// src/lab/model/serialize.ts
designUrl(design, 'https://aureo.example/custom-lab/?producto=knife#x')
// → 'https://aureo.example/custom-lab/?d=…'  (sin ancla, siempre en LAB_PATH)
```

```ts
// src/components/layout/Header.tsx
export function Header({ page }: { page: 'home' | 'lab' })
```

Estructura nueva de `CustomLab.tsx` (sólo cambia dónde va cada parte; los componentes son los mismos):

```tsx
<div className="lab" data-tab={tab}>              {/* tab: 'edit' | '3d', sólo se usa < 960 px */}
  <div className="lab__tabs segmented">…</div>    {/* «Editar» / «Ver en 3D», sólo < 960 px */}
  <section className="lab__edit" aria-label="Edición">
    <div className="lab__editor"><EditorToolbar /><DesignCanvas /></div>  {/* fijo arriba */}
    <div className="lab__panel">{/* pasos 1 a 4, scroll propio */}</div>
  </section>
  <section className="lab__stage" aria-label="Vista 3D">
    {/* .lab__view3d: canvas, .lab__toolbar, .lab__hint, .lab__toast */}
  </section>
</div>
```

Los nombres `stageTab` (`'design' | '3d'`) pasan a `tab` (`'edit' | '3d'`).

```ts
// vite.config.ts — entradas de build
input: { main: 'index.html', lab: 'custom-lab/index.html' }
```

---

## Plan de implementación

1. **Crear la página del Lab.**
   - Crear `custom-lab/index.html` con `<title>`, `meta description`, `og:*` propios y la URL de Google Fonts completa (copiada de `index.html`).
   - Crear `src/lab-page/main.tsx` (importa `tokens.css`, `base.css` y `landing.css`) y `src/lab-page/LabPage.tsx`: `Header`, sección con el encabezado actual (`h1`), el Lab diferido con `Suspense`, `Footer` y `DevConfigNotice`.
   - Sumar las dos entradas de build en `vite.config.ts`.
   - La home no cambia todavía.
   - Prueba manual: `npm run dev`, abrir `/custom-lab/` y `/custom-lab/?producto=thermos-half`; el Lab abre con el termo media manija.
2. **Hacer que el header y el footer funcionen desde las dos páginas.**
   - Pasar a absolutos los `href` de `NAV` (`src/content/site.ts`), el logo del header y los enlaces del footer.
   - Agregar la prop `page` a `Header`. Con `page="lab"`, ocultar el CTA y poner `aria-current="page"` en «Simulador 3D».
   - Prueba manual: desde `/custom-lab/`, «Galería» lleva a la galería de la home; desde la home, los ítems siguen haciendo scroll sin recargar.
3. **Apuntar todos los accesos a la página nueva.**
   - `labProductHref` devuelve `/custom-lab/?producto=<id>`.
   - `Categories.tsx` usa un `<a>` común con `labProductHref`.
   - `NAV`, el CTA del header, `Hero.tsx` y `ContactCta.tsx` apuntan a `/custom-lab/`.
   - Prueba manual: cada uno de esos enlaces abre la página del Lab; la categoría «Termos y mates» abre con `thermos-handle`.
4. **Mover los enlaces para compartir.**
   - `designUrl` arma la URL sobre `LAB_PATH`, sin ancla.
   - Test en `src/lab/model/__tests__/serialize.test.ts`: con cualquier base, el resultado tiene path `/custom-lab/`, sólo el parámetro `d` y ningún hash; y decodifica al mismo diseño.
5. **Redirigir los enlaces viejos.**
   - Agregar `legacyLabRedirect` en `intent.ts`.
   - En `src/main.tsx`, antes de montar la home, si `legacyLabRedirect(location.search)` no es `null`, hacer `location.replace` y no montar.
   - Test en `src/lab/__tests__/intent.test.ts` con los cuatro casos del modelo de datos.
   - Prueba manual: `/?d=<un diseño>#custom-lab` abre `/custom-lab/?d=<el mismo>` con el diseño cargado.
6. **Quitar el Lab de la home.**
   - Sacar `<LabSection />` de `App.tsx` y borrar `LabSection.tsx` y `LabProductLink.tsx`.
   - Borrar `requestLabProduct` y `onLabProductRequest` de `intent.ts` y su uso en `CustomLab.tsx`.
   - Mover los estilos `.lab-section`, `.section-head--lab`, `.lab-section__name` y `.lab-placeholder` si hace falta, sin cambiar cómo se ven.
   - Dejar en `index.html` sólo Bodoni Moda y Hanken Grotesk en la URL de Google Fonts.
   - Prueba manual: la home no descarga ningún chunk de three.js (pestaña Red).
7. **Dividir la pantalla en escritorio.**
   - En `LabPage.tsx`, reemplazar el encabezado de sección por el encabezado compacto de una línea y sacar el Lab de `.wrap`.
   - En `CustomLab.tsx`, mover `EditorToolbar` y `DesignCanvas` a la columna `.lab__edit`, junto con los pasos. `.lab__stage` queda sólo con el 3D.
   - En `lab.css`, `.lab` pasa a dos columnas `1fr 1fr` con el alto de la ventana menos el header y el encabezado. `.lab__edit` es una columna con el editor fijo arriba y `.lab__panel` con `overflow-y: auto`.
   - Los resúmenes de los pasos quedan sticky en `top: 0` dentro de `.lab__panel`, en lugar de `top: var(--header-h)`.
   - Ajustar `--canvas-max-h` para que el lienzo no ocupe más del 45 % del alto de la columna.
   - Prueba manual a 1440 × 900: el 3D ocupa la mitad derecha; al scrollear el paso 3, el lienzo sigue visible y la página no se mueve.
8. **Pestañas en pantallas angostas.**
   - Por debajo de 960 px, `.lab` pasa a una columna; se muestran las pestañas «Editar» y «Ver en 3D» y se oculta la mitad que no corresponde.
   - Prueba manual a 390 × 844: «Editar» muestra lienzo y pasos con scroll de página; «Ver en 3D» muestra el termo con el alto de la ventana.
9. **Configurar el deploy y la documentación.**
   - Agregar `"trailingSlash": true` en `vercel.json`.
   - En el `README.md`, indicar que el Lab vive en `/custom-lab/` (`custom-lab/index.html` y `src/lab-page/`) y que la URL de tipografías está en `custom-lab/index.html`.

---

## Criterios de aceptación

- [ ] `/custom-lab/` muestra el header, el encabezado de una línea «AUREO Custom Lab» con el `h1` «Tu idea, antes de grabarla.», el Lab y el footer.
- [ ] A 1440 × 900, el Lab ocupa todo el ancho de la ventana, en dos mitades iguales: edición a la izquierda y 3D a la derecha.
- [ ] A 1440 × 900, el Lab entra entero en la ventana, debajo del header, sin scroll de página.
- [ ] La mitad izquierda tiene la barra de herramientas y el lienzo arriba, y los pasos 1 a 4 debajo.
- [ ] Al scrollear los pasos, la barra de herramientas y el lienzo siguen visibles y la mitad derecha no se mueve.
- [ ] La mitad derecha sólo tiene el 3D (o la vista plana de respaldo), con su barra de controles y la ayuda.
- [ ] Los resúmenes de los pasos quedan pegados arriba de la columna al scrollear, sin quedar tapados por el header.
- [ ] A 390 × 844, se ven las pestañas «Editar» y «Ver en 3D», y «Editar» está elegida al abrir.
- [ ] A 390 × 844, «Ver en 3D» muestra el objeto con el alto disponible de la ventana y oculta la edición; «Editar» hace lo contrario.
- [ ] «Pantalla completa» muestra sólo el 3D, en escritorio y en móvil.
- [ ] Editar el diseño en la mitad izquierda actualiza el 3D de la derecha, igual que antes.
- [ ] La pestaña del navegador en `/custom-lab/` muestra un título distinto al de la home.
- [ ] La home no tiene la sección `#custom-lab`.
- [ ] Al cargar la home y hacer scroll hasta el final, no se descarga ningún chunk de three.js ni del Lab.
- [ ] La home no pide a Google Fonts otras familias que Bodoni Moda y Hanken Grotesk.
- [ ] En `/custom-lab/`, las 19 tipografías del editor se ven con su fuente.
- [ ] El CTA del header, «Simulador 3D», el botón del hero y el de contacto llevan a `/custom-lab/`.
- [ ] Cada categoría de la home abre `/custom-lab/?producto=<id>` con ese producto elegido.
- [ ] En `/custom-lab/`, el CTA «Personalizá tu producto» no aparece y «Simulador 3D» tiene `aria-current="page"`.
- [ ] Desde `/custom-lab/`, los ítems del menú (escritorio y móvil), el logo y los enlaces del footer llevan a la sección correspondiente de la home.
- [ ] Desde la home, los ítems del menú hacen scroll a su sección sin recargar la página.
- [ ] «Copiar enlace» en el Lab copia una URL `/custom-lab/?d=…` sin `#`, y al abrirla reaparece el mismo diseño.
- [ ] Un enlace viejo `/?d=…#custom-lab` termina en `/custom-lab/?d=…` con el mismo diseño, y «Atrás» no vuelve a la URL vieja.
- [ ] Un enlace viejo `/?producto=knife#custom-lab` termina en `/custom-lab/?producto=knife` con el cuchillo elegido.
- [ ] `/?utm_source=x` abre la home sin redirigir.
- [ ] En el deploy de Vercel, `/custom-lab` redirige a `/custom-lab/`.
- [ ] `src/sections/LabSection.tsx` y `src/components/LabProductLink.tsx` no existen, y `requestLabProduct` / `onLabProductRequest` no aparecen en `src/`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores, y `dist/` tiene `index.html` y `custom-lab/index.html`.

---

## Decisiones

- **Sí:** Vite multi-página (`custom-lab/index.html`). Dos HTML estáticos, sin router ni rewrites, y la home no incluye código del Lab.
- **No:** ruta SPA leyendo `location.pathname` en `App.tsx`. Necesita rewrite en Vercel y mezcla las dos páginas en un mismo bundle de entrada.
- **No:** react-router. Una dependencia más para dos páginas.
- **Sí:** quitar la sección del Lab de la home, sin bloque teaser. Lo pidió el usuario; los accesos quedan en header, hero, categorías y contacto.
- **Sí:** la página del Lab usa el `Header` y el `Footer` del sitio. Mantiene la navegación y la marca.
- **No:** layout a pantalla completa con barra mínima.
- **Sí:** la URL `/custom-lab/`. Coincide con el ancla actual y con el nombre «AUREO Custom Lab».
- **No:** `/lab/` ni `/simulador/`.
- **Sí:** en la página del Lab, ocultar el CTA y marcar «Simulador 3D» como página actual. Un botón que lleva a la misma página confunde.
- **Sí:** un encabezado compacto de una línea con el `h1`. Deja casi todo el alto para el Lab.
- **No:** conservar el encabezado grande con el texto de bajada. Achica el Lab, que es lo que hoy se ve chico.
- **Sí:** pantalla dividida en dos mitades verticales, edición a la izquierda y 3D a la derecha. Hoy el lienzo y el 3D están apilados en una columna y se ven chicos.
- **Sí:** 50/50. Lo eligió el usuario.
- **No:** 3D a la izquierda, ni 40/60.
- **Sí:** el Lab a todo el ancho y alto de la ventana, con scroll interno en la columna de edición. El 3D queda siempre a la vista mientras se edita.
- **No:** scroll de página con el 3D sticky. Mantiene el encabezado grande y el 3D se mueve al llegar al footer.
- **Sí:** el lienzo y su barra fijos arriba de la columna de edición. Mientras se cambian propiedades en el paso 3, el lienzo sigue a la vista.
- **Sí:** pestañas «Editar» / «Ver en 3D» por debajo de 960 px. Dos columnas no entran en un celular.
- **No:** apilar el 3D arriba y la edición abajo en móvil.
- **No:** una división ajustable arrastrando la línea. Queda para otra spec si hace falta.
- **Sí:** el layout nuevo va en esta spec y no en una aparte. La página nueva y su layout se prueban juntos.
- **Sí:** enlaces comunes desde la home, con recarga. Se elimina el puente por eventos, que sólo servía porque el Lab y la home compartían documento.
- **No:** abrir el Lab en una pestaña nueva.
- **Sí:** redirigir `?d=` y `?producto=` de la home a `/custom-lab/` con `location.replace`. Ningún enlace compartido se rompe y no queda una entrada extra en el historial.
- **No:** dejar de soportar los enlaces viejos.
- **Sí:** `NAV` y los enlaces del footer con `href` absolutos (`/#productos`). En la home siguen siendo saltos dentro de la página; en el Lab vuelven a la home.
- **No:** dos listas de `NAV`, una por página. Se duplica el contenido.
- **Sí:** las 19 tipografías del editor sólo en la página del Lab. La home deja de pedir fuentes que no usa.
- **Sí:** el Lab sigue cargando diferido dentro de su página. El header y el encabezado se pintan antes que three.js.
- **Sí:** `"trailingSlash": true` en Vercel. Una sola URL canónica, `/custom-lab/`, y `/custom-lab` no da 404.
- **Sí:** reutilizar `og-image.png` en la página del Lab. Una imagen propia queda para otra spec.

---

## Riesgos

| Riesgo                                                                                       | Mitigación                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `trailingSlash: true` cambia otras URLs del sitio (imágenes, `favicon.svg`).                  | Vercel no agrega la barra a archivos con extensión. Se verifica en el deploy de preview que imágenes y favicon cargan.               |
| El header calcula su tono con las secciones `[data-tone]` y en el Lab hay una sola.           | La sección del Lab mantiene `data-tone="dark"`. Se verifica que el header se lea bien al hacer scroll en `/custom-lab/`.             |
| La redirección de la home hace un parpadeo antes de cambiar de página.                        | Se decide en `main.tsx` antes de montar React, así que la home no llega a pintarse.                                                  |
| Los estilos del Lab dependen de clases de `landing.css`.                                      | La página del Lab importa `landing.css` igual que la home. Se compara visualmente con la sección actual antes de borrarla.            |
| En ventanas bajas (laptops de 768 px de alto), el lienzo fijo deja poco lugar a los pasos.     | El lienzo se limita al 45 % del alto de la columna. El Lab tiene un alto mínimo de 560 px; por debajo, la página scrollea.             |
| El scroll interno de la columna de edición choca con el scroll de la página (scroll encadenado). | `.lab__panel` usa `overscroll-behavior: contain`.                                                                                    |
| Los pasos dependen de `top: var(--header-h)` para quedar sticky y del scroll de la página para llevar el foco a la vista. | Se pasa a `top: 0` dentro de `.lab__panel` y se verifica que el foco con Tab no quede escondido debajo de los resúmenes. |
| Un buscador ya indexó la home con `#custom-lab`.                                              | El ancla sin parámetros abre la home normalmente; no hay contenido perdido, sólo deja de existir la sección.                         |

---

## Lo que **no** entra en esta spec

- Un bloque teaser del Lab en la home.
- Un router o navegación sin recarga.
- Un layout sin header ni footer para el Lab.
- Una división ajustable entre las dos mitades.
- Cambios en el funcionamiento del Lab.
- Una imagen OG propia para el Lab.
- SEO adicional (sitemap, canonical, datos estructurados).

Cada uno de esos puntos, si se hace, va en su propia spec.

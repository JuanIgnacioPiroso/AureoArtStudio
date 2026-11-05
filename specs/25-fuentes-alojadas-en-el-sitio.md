# SPEC 25 — Fuentes alojadas en el sitio, sin Google Fonts

> **Estado:** Aprobado
> **Depende de:** SPEC 08
> **Fecha:** 2026-11-04
> **Objetivo:** Servir las 19 tipografías del sitio y del Custom Lab desde el propio dominio, con la API de fuentes de Astro y archivos recortados, y dejar de pedir nada a `fonts.googleapis.com`.

---

## Por qué esta spec

Todas las páginas cargan sus fuentes con un `<link>` a `fonts.googleapis.com`, más dos `preconnect` (`src/layouts/BaseLayout.astro`). Es una de las marcas más reconocibles de una web armada con plantilla: las marcas cuidadas sirven sus fuentes desde su dominio.

El problema no es la elección. Bodoni Moda y Hanken Grotesk ya están fuera del top 10 de Google Fonts (Roboto, Open Sans, Montserrat, Inter, Poppins…), son la tipografía del kit de marca (`brand/tipografia/`, con licencia OFL) y las usan el logo y la `og-image`. Por eso se quedan. Lo que cambia es de dónde salen.

El Custom Lab carga además 17 fuentes de grabado desde Google, entre ellas Montserrat, Oswald y Raleway, que sí están en el top 10. El usuario pidió alojarlas también, para que el sitio no haga ningún pedido a Google. Son opciones del producto, así que la lista no cambia: sólo cambia de dónde salen.

El sitio se tiene que ver igual que hoy.

---

## Alcance

**Entra:**

- **Archivos de fuentes** en `src/assets/fonts/`, en woff2 recortado, con el `OFL.txt` de cada familia al lado:
  - **Del sitio** (de `brand/tipografia/`, que está fuera de git, así que se copian al repo ya procesados):
    - `bodoni-moda.woff2`: variable con los ejes completos, como la sirve Google; el `@font-face` declara `wght` 400–700, lo que pide hoy la URL;
    - `hanken-grotesk.woff2`: variable con el eje completo; el `@font-face` declara `wght` 400–600 (también lo que pide hoy).
    - Los ejes no se recortan: `varLib.instancer` redondea los contornos de los pesos intermedios y las letras dejan de coincidir con las de Google.
    - Recorte: latín básico + español (ASCII, `¡¿«»ÁÉÍÓÚÜÑáéíóúüñ`, `‘’“”`, `–—`, `…`, `·`, `•`, `€`, `°`, `×`, `ª º`).
  - **De grabado del Lab** (del repo `google/fonts`, licencia OFL), cada una en el mismo peso que pide hoy la URL del Lab, como archivo estático o como variable fijada a ese peso. Playfair Display 500, Cormorant Garamond 600, EB Garamond 500, Libre Baskerville 400, Cinzel 500, Cinzel Decorative 400, Abril Fatface 400, Bebas Neue 400, Oswald 500, Montserrat 500, Josefin Sans 500, Raleway 500, Pinyon Script 400, Great Vibes 400, Dancing Script 500, Allura 400 y Space Mono 400.
    - Recorte: Latin-1 + Latin Extended-A (`U+0000-00FF, U+0100-017F`), más `‘’“”–—…•€`. Así cubre nombres en portugués, alemán, polaco, etc.
  - Nombres de archivo en kebab-case de la familia (`playfair-display.woff2`, `space-mono.woff2`…).
- **`scripts/subset-fonts.sh`**: regenera los 19 woff2 con `pyftsubset` (y `fonttools varLib.instancer` para fijar el peso de las de grabado). Lee los TTF de origen de una carpeta que se le pasa como argumento y escribe en `src/assets/fonts/`. No se corre en el build.
- **`astro.config.mjs`**: bloque `fonts` con el proveedor local (`fontProviders.local()`), una familia por fuente:
  - `--font-bodoni` (Bodoni Moda) con `fallbacks: ['Didot', 'Bodoni 72', 'Georgia', 'serif']`;
  - `--font-grotesk` (Hanken Grotesk) con `fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif']`;
  - una por fuente de grabado, con `cssVariable` igual a `--font-<FontId>` (`--font-playfair`, `--font-cinzel-deco`, `--font-great-vibes`, `--font-space-mono`…) y como fallback la genérica de `FontDef.fallback`;
  - `display: 'swap'` en todas, como hoy.
- **`src/layouts/BaseLayout.astro`**:
  - se borran los dos `preconnect` y el `<link rel="stylesheet" href={fontsHref}>`;
  - se borra la prop `fontsHref` y su comentario;
  - en todas las páginas: `<Font cssVariable="--font-bodoni" preload />` y `<Font cssVariable="--font-grotesk" preload />`;
  - sólo si `page === 'lab'`: un `<Font>` sin `preload` para cada una de las 17 de grabado (se descargan cuando el Lab las pide).
- **Páginas** (`src/pages/index.astro`, `custom-lab/index.astro`, `materiales/index.astro`, `regalos-empresariales/index.astro`, `[categoria]/index.astro`): se borra la prop `fontsHref`.
- **`src/styles/tokens.css`**: `--font-display: var(--font-bodoni);` y `--font-ui: var(--font-grotesk);`. Los fallbacks pasan a la config de Astro.
- **Lab, nombres de familia.** Astro nombra cada `@font-face` con un hash (`Bodoni Moda-3f2a…`), así que el nombre literal deja de servir:
  - `src/lab/model/catalog.ts`: `FontDef.family` se reemplaza por `cssVariable: \`--font-${id}\``, se corrige el comentario («cargada desde Google Fonts en index.html») y el helper `font()` deja de recibir `family`;
  - `src/lab/model/measure.ts`: función nueva `fontFamily(fontId)` que lee la variable con `getComputedStyle(document.documentElement).getPropertyValue(cssVariable)`, guarda el resultado en caché y, si la variable está vacía (tests, SSR), devuelve sólo `FontDef.fallback`. `fontCss` la usa, así que el canvas (`drawDesign.ts`), `document.fonts.check` y `document.fonts.load` reciben el nombre real;
  - `src/lab/editor/FontPicker.tsx`: la muestra usa `fontFamily: var(--font-<id>)`.
- **`README.md`**: la línea de «Tipografías» de «Datos pendientes del negocio» se actualiza. Para sumar una fuente: su id en `FONT_IDS`, su entrada en `FONTS`, su archivo en `src/assets/fonts/` (con el script) y su familia en `astro.config.mjs`. Se suma una línea que explique cómo correr `scripts/subset-fonts.sh`.

**No entra:**

- Cambiar las fuentes del sitio por otras, o elegir otra fundición. El kit de marca, el logo y la `og-image` quedan como están.
- Sumar, quitar o cambiar de peso las fuentes de grabado del Lab.
- Sumar los archivos itálicos. `landing.css` usa `font-style: italic` en dos lugares (líneas 226 y 461), y hoy el navegador lo sintetiza porque la URL de Google no pide itálica. Se mantiene así para que se vea igual.
- `brand/` (fuera de git): `brand/index.html` ya carga los TTF locales.
- Cambios de tamaños, interlineado, tracking o cualquier otro estilo tipográfico.
- Ajustar `vercel.json` (cabeceras de caché de las fuentes). Astro las sirve con hash en `/_astro/fonts/`, y eso alcanza por ahora.

---

## Modelo de datos

No hay datos nuevos de negocio. Cambia la definición de fuente del Lab:

```ts
// src/lab/model/catalog.ts
export interface FontDef {
  id: FontId
  name: string
  category: FontCategory
  /** Variable CSS que define la API de fuentes de Astro (astro.config.mjs): `--font-<id>`. */
  cssVariable: `--font-${FontId}`
  weight: number
  capRatio: number
  fallback: 'serif' | 'sans-serif' | 'cursive' | 'monospace'
}
```

```ts
// src/lab/model/measure.ts
/** Nombre real de la familia (con el hash de Astro) más el fallback, listo para `ctx.font` y `document.fonts`. */
export function fontFamily(fontId: FontId): string
```

Variables CSS nuevas (las genera Astro): `--font-bodoni`, `--font-grotesk` y `--font-<FontId>` para las 17 de grabado. `--font-display` y `--font-ui` siguen existiendo y apuntan a las dos primeras.

---

## Plan de implementación

1. **Archivos.** Escribir `scripts/subset-fonts.sh`. Bajar los TTF de las 17 de grabado desde `google/fonts`. Correr el script con `brand/tipografia/` y esa carpeta, y subir los 19 woff2 y sus `OFL.txt` a `src/assets/fonts/`. El sitio todavía no los usa.
2. **Sitio.** Sumar el bloque `fonts` de Bodoni y Hanken en `astro.config.mjs`. En `BaseLayout.astro`, poner los dos `<Font preload />` y apuntar `--font-display` y `--font-ui` de `tokens.css` a las variables nuevas. Por ahora, el `<link>` de Google se queda sólo en el Lab.
3. **Lab.** Sumar las 17 familias de grabado en `astro.config.mjs` y sus `<Font>` para `page === 'lab'`. Cambiar `FontDef.family` por `cssVariable`, sumar `fontFamily()` en `measure.ts`, y adaptar `fontCss` y `FontPicker.tsx`. Ajustar los tests del Lab que comparen `family`.
4. **Limpieza.** Borrar los `preconnect`, el `<link>` y la prop `fontsHref` de `BaseLayout.astro` y de las 5 páginas. Actualizar el README.
5. **Verificación.** Capturas con el Chromium de Playwright por CDP, antes (build de `master`) y después, de la home, `/materiales/`, `/regalos-empresariales/`, una página de categoría y `/custom-lab/` (con el selector de fuentes abierto y un texto grabado en cada categoría de fuente), a 1440 y a 375 px. Después, `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] Ningún archivo de `dist/` contiene `fonts.googleapis.com` ni `fonts.gstatic.com`.
- [ ] `src/` no contiene `fontsHref` ni `googleapis`.
- [ ] Al abrir la home, `/materiales/`, `/regalos-empresariales/`, una página de categoría y `/custom-lab/`, el panel Network no muestra ningún pedido a un dominio de Google.
- [ ] Todas las páginas tienen en el `<head>` un `<link rel="preload" as="font" type="font/woff2" crossorigin>` para Bodoni Moda y otro para Hanken Grotesk, y ninguno más.
- [ ] Fuera de `/custom-lab/`, el HTML no contiene `@font-face` de las 17 fuentes de grabado.
- [ ] En `/custom-lab/`, al elegir cada una de las 19 fuentes, la muestra del selector y el texto sobre el objeto 3D se ven con esa fuente y no con la de reserva (`document.fonts.check(fontCss(id, 40))` da `true` para las 19).
- [ ] En el Lab, el texto «São João Ærø Łódź» se ve con la fuente elegida en las 17 de grabado.
- [ ] Cada woff2 de `src/assets/fonts/` pesa menos que su TTF de origen, y la suma de `bodoni-moda.woff2` y `hanken-grotesk.woff2` es menor a 120 KB.
- [ ] Cada familia de `src/assets/fonts/` tiene su `OFL.txt`.
- [ ] Las capturas de antes y después se ven iguales a 1440 y a 375 px: mismas fuentes, mismos pesos, mismos saltos de línea y las mismas dos itálicas sintetizadas.
- [ ] `scripts/subset-fonts.sh` vuelve a generar los 19 woff2 desde los TTF de origen y queda documentado en el README.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** mantener Bodoni Moda y Hanken Grotesk. Ya están fuera del top 10, son la marca (logo, `og-image`, kit) y el usuario pidió cambiar sólo cómo se cargan. Lo que delataba la plantilla era el dominio de Google, no las fuentes.
- **No:** cambiar a fuentes de otra fundición. Cambia el aspecto del sitio, el logo y el kit de marca, y eso va contra el «sin tocar el resto».
- **Sí:** alojar también las 17 de grabado del Lab. El usuario quiere que no quede ningún pedido a Google en el sitio.
- **Sí:** la API de fuentes de Astro con proveedor local. Genera los `@font-face`, los fallbacks ajustados con métricas (menos salto al cargar) y los preload, sin escribirlos a mano.
- **No:** `@font-face` a mano en `public/fonts/`. Es más código para mantener y no ajusta los fallbacks.
- **No:** paquetes `@fontsource`. Suman 19 dependencias y no permiten el recorte que queremos.
- **No:** el proveedor `google` de Astro, que baja las fuentes en cada build. El build dependería de Google y los archivos no quedarían versionados en el repo.
- **Sí:** el Lab lee el nombre real desde la variable CSS. Así todo pasa por un solo mecanismo y el hash de Astro puede cambiar sin tocar el catálogo.
- **No:** `@font-face` a mano con nombres literales sólo para las fuentes de grabado. Serían dos mecanismos para lo mismo.
- **No:** recortar los ejes de Bodoni y Hanken. Ahorra unos 14 KB, pero `varLib.instancer` redondea los contornos de los pesos intermedios y en las capturas las letras dejaban de coincidir con las de Google. El rango de peso lo limita el `@font-face`.
- **Sí:** recorte latín básico + español para Bodoni y Hanken. El sitio está en español y sus textos los controlamos nosotros.
- **Sí:** recorte Latin-1 + Latin Extended-A para las de grabado. El cliente escribe lo que quiere (nombres con ç, ã, ß, ł), y una letra en la fuente de reserva arruinaría la vista previa del grabado.
- **Sí:** archivos en `src/assets/fonts/` más un script. Astro recomienda no ponerlos en `public/`, porque se duplicarían, y el script permite regenerarlos sin repetir los pasos a mano.
- **Sí:** preload sólo de Bodoni y Hanken. Las 17 de grabado se piden cuando el Lab las usa (`ensureFonts` en `measure.ts` ya las carga a demanda). Precargarlas sumaría unos cientos de KB a la primera carga del Lab.
- **Sí:** sin archivos itálicos. Hoy la itálica es sintetizada y el pedido es que el sitio se vea igual.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El fallback ajustado de Astro hace que el texto se vea distinto mientras carga la fuente. | Sólo afecta al instante antes de que llegue la fuente, y con preload ese instante es más corto que hoy. Se revisa en las capturas con red lenta. |
| `getComputedStyle` lee la variable antes de que esté el CSS de Astro, y el canvas usa la fuente de reserva. | El `<Font>` va en el `<head>`, antes de que se monte la isla (`client:only`). Si la lectura da vacío, no se guarda en caché y se vuelve a leer en la próxima medición. |
| Al recortar Bodoni, se pierde algún carácter que usan los textos del sitio (p. ej. `→` o `✓`). | Antes de fijar el recorte, el script junta los caracteres de `src/content/` y `src/sections/`. Si alguno queda afuera, el criterio de capturas iguales lo detecta. |
| Alguna fuente de grabado no tiene el peso que pide hoy la URL (p. ej. sólo existe como variable). | Se fija con `varLib.instancer` en el peso de `FontDef.weight`, que es el que usa el Lab. |
| Un diseño compartido viejo (`/custom-lab/?d=…`) guarda la familia por nombre. | Los diseños guardan `fontId`, no la familia (`legacy.ts` mapea ids), así que no cambian. |

---

## Lo que **no** entra en esta spec

- Reemplazar Bodoni Moda o Hanken Grotesk por otras fuentes.
- Cambiar la lista o los pesos de las fuentes de grabado del Lab.
- Archivos itálicos reales.
- Cambios en `brand/`, en el logo o en la `og-image`.
- Cabeceras de caché en `vercel.json`.

Si alguno de estos cambios se hace, va en su propia spec.

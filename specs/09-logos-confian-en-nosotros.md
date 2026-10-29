# SPEC 09 — Sección «Confían en nosotros» con carrusel de logos

> **Estado:** Aprobado
> **Depende de:** SPEC 08
> **Fecha:** 2026-10-28
> **Objetivo:** Sumar a la home, justo después del Hero, una sección clara «Confían en nosotros» con un carrusel continuo de logos que se arma solo a partir de los archivos de `src/assets/logos/`.

---

## Por qué esta spec

La home no tiene prueba social: `Differentials.astro` dice que reemplaza a los testimonios «mientras no haya reales». Los logos de empresas, personas y organismos que ya encargaron trabajos son la forma más rápida de mostrar confianza sin escribir testimonios.

El negocio todavía no tiene los logos. Por eso la sección se alimenta sola de una carpeta: alcanza con soltar un archivo y hacer deploy. Con la carpeta vacía, la sección no existe.

**Numeración:** la SPEC 07, la SPEC 08 y el `README.md` reservaban «SPEC 09» para el cuero. El usuario decidió que esta spec tome el 09 y que el cuero pase a la **SPEC 10**. El primer paso del plan corrige esas referencias.

---

## Alcance

**Entra:**

- **Carpeta de logos** `src/assets/logos/`, versionada con un `.gitkeep`.
  - Formatos aceptados: `.svg`, `.png`, `.webp`, `.jpg` y `.jpeg`. Cualquier otro archivo se ignora.
  - Los raster pasan por `astro:assets` (sharp ya viene con Astro). Los SVG salen tal cual.
- **Carga automática** en `src/content/logos.ts`:
  - `import.meta.glob('../assets/logos/*.{svg,png,webp,jpg,jpeg}', { eager: true, import: 'default' })`;
  - exporta `TRUSTED_LOGOS: TrustedLogo[]`, ordenado por nombre de archivo;
  - exporta la función pura `logoNameFromFile(path: string): string`, que arma el nombre accesible.
- **Nombre accesible desde el nombre del archivo** (`logoNameFromFile`):
  - se quita la carpeta y la extensión;
  - se quita un prefijo numérico opcional de orden (`01-`, `2_`, etc.);
  - `-` y `_` pasan a espacios y se colapsan los espacios repetidos;
  - se pone en mayúscula solo la primera letra; el resto queda como está escrito.
  - Ejemplos: `municipalidad-de-tandil.svg` → «Municipalidad de tandil»; `02-Municipalidad-de-Tandil.png` → «Municipalidad de Tandil»; `Café_Martínez.webp` → «Café Martínez».
- **Sección** `src/sections/TrustedBy.astro`:
  - `<section id="confian" class="section tone trusted" data-tone="light" aria-labelledby="confian-title">`;
  - título chico tipo eyebrow «Confían en nosotros» (`h2#confian-title`), sin bajada;
  - si `TRUSTED_LOGOS` está vacío, el componente no renderiza nada (ni el `<section>`);
  - se monta en `src/pages/index.astro` entre `<Hero />` y `<Categories />`.
- **Carrusel en CSS puro**, sin `<script>`:
  - una pista (`.trusted__track`) con el set de logos dos veces seguidas, animada con `translateX(0)` → `translateX(-50%)` en bucle infinito y lineal;
  - si hay pocos logos, el set se repite en el build hasta que cada mitad tenga al menos 8 ítems, para que la pista nunca muestre un hueco;
  - la duración escala con la cantidad de ítems de una mitad: `--trusted-duration` = ítems × 3 s, puesta en el `style` de la pista;
  - la primera mitad es un `<ul>` con un `<li>` por logo y `alt` = nombre; la segunda mitad (y las repeticiones) llevan `aria-hidden="true"` y `alt=""`, así un lector de pantalla lee cada logo una sola vez;
  - pasar el mouse sobre la franja pausa la animación (`animation-play-state: paused`).
- **Aspecto de los logos:**
  - altura fija de 40 px en escritorio y 32 px en móvil, ancho automático con `max-width: 160px` y `object-fit: contain`;
  - los raster se generan con `<Image>` de `astro:assets` con `height={40}` y `densities={[1, 2]}`, `loading="lazy"` y `decoding="async"`;
  - monocromos en reposo (`filter: grayscale(1)` y opacidad reducida) y con su color original al pasar el mouse sobre cada logo.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` no hay animación, las copias `aria-hidden` no se muestran y el set original queda quieto en una grilla centrada que salta de línea.
- **Comentario del Hero:** `Hero.astro` dice que la línea dorada es «el único movimiento automático de la página». Se corrige para nombrar también el carrusel.
- **README:** una entrada en «Datos pendientes del negocio» que explica cómo sumar un logo (carpeta, formatos, regla del nombre y prefijo de orden).
- **Test** `src/content/__tests__/logos.test.ts` para `logoNameFromFile`.
- **Renumeración del cuero** de «SPEC 09» a «SPEC 10» en el `README.md`, en la SPEC 07 y en las líneas de la SPEC 08 que lo mencionan como trabajo futuro («Alcance → No entra» y «Qué no entra»).

**No entra (para specs futuras):**

- Logos clickeables o con enlace al sitio de cada organización.
- Lista manual de logos en `site.ts` (nombre exacto, orden, URL).
- Botón visible de pausa / reanudar.
- Bordes difuminados en los costados de la franja.
- Testimonios escritos, citas o casos de cliente.
- Logos de ejemplo o placeholders mientras la carpeta esté vacía.
- Mostrar los logos en `/custom-lab/`.
- Grabar el cuero (SPEC 10).

---

## Modelo de datos

```ts
// src/content/logos.ts
import type { ImageMetadata } from 'astro'

export interface TrustedLogo {
  /** Nombre del archivo sin carpeta, p. ej. "02-Municipalidad-de-Tandil.png". Define el orden. */
  file: string
  /** Nombre accesible derivado del archivo: "Municipalidad de Tandil". */
  name: string
  /** Lo que devuelve el glob. En los SVG, Astro devuelve un componente que también trae `src`, `width` y `height`. */
  src: ImageMetadata
  /** true si es .svg: se pinta con <img src={src.src}> directo, sin pasar por <Image>. */
  isSvg: boolean
}

export const TRUSTED_LOGOS: TrustedLogo[]
export function logoNameFromFile(path: string): string
```

Convenciones:

- Orden: alfabético por `file` (`localeCompare` con `numeric: true`), así `2-…` va antes de `10-…`.
- Mínimo por mitad de la pista: `MIN_TRACK_ITEMS = 8`, constante en `TrustedBy.astro`.
- `--trusted-duration`: segundos, `ítems por mitad × 3`.

---

## Plan de implementación

1. **Renumerar el cuero.** Cambiar «SPEC 09» por «SPEC 10» donde se habla del cuero en el `README.md`, en la SPEC 07 y en las dos menciones a futuro de la SPEC 08. Sin cambios de código.
2. **Carpeta y carga de logos.**
   - Crear `src/assets/logos/.gitkeep`.
   - Crear `src/content/logos.ts` con `logoNameFromFile`, el glob y `TRUSTED_LOGOS`.
   - Crear `src/content/__tests__/logos.test.ts` con los ejemplos del Alcance, más: ruta con carpetas, prefijo numérico con `_`, guiones repetidos y extensión en mayúsculas.
   - `npm run test` pasa. Con la carpeta vacía, `TRUSTED_LOGOS` es `[]` y el build no cambia.
3. **Sección sin animación.**
   - Crear `src/sections/TrustedBy.astro` con el título y la lista de logos (SVG con `<img>`, raster con `<Image>`), monocromos, en una fila que salta de línea.
   - Montarla en `index.astro` entre `Hero` y `Categories`.
   - Estilos de `.trusted` en `src/styles/landing.css`, con los tokens existentes.
   - Prueba manual: copiar 3 logos de prueba a la carpeta, ver la sección en `npm run dev`, borrarlos y ver que la sección desaparece. Los logos de prueba no se commitean.
4. **Carrusel.**
   - Duplicar el set en la pista, repetirlo hasta `MIN_TRACK_ITEMS`, marcar las copias con `aria-hidden` y `alt=""`, y sumar `--trusted-duration`.
   - Agregar el `@keyframes`, la pausa al hover y el bloque `prefers-reduced-motion`.
   - Corregir el comentario de `Hero.astro`.
5. **Documentación.** Sumar en el `README.md` cómo se agrega un logo: carpeta, formatos, regla del nombre y prefijo de orden.

---

## Criterios de aceptación

**Carga**

- [ ] Con `src/assets/logos/` vacía (solo `.gitkeep`), `dist/index.html` no contiene `id="confian"` ni el texto «Confían en nosotros».
- [ ] Con un archivo `.svg`, uno `.png` y uno `.webp` en la carpeta, `npm run build` termina sin errores y la sección aparece con los tres logos.
- [ ] Un archivo con otra extensión (p. ej. `notas.txt`) en la carpeta no rompe el build y no aparece en la sección.
- [ ] Sumar o quitar un logo solo requiere agregar o borrar el archivo en la carpeta; no hay que tocar ningún `.ts` ni `.astro`.
- [ ] Los logos salen ordenados por nombre de archivo, con `2-…` antes de `10-…`.
- [ ] Los logos raster salen como archivos optimizados de `/_astro/` con `srcset` 1x y 2x. Los SVG salen sin convertir.

**Nombre accesible**

- [ ] `logoNameFromFile('src/assets/logos/02-Municipalidad-de-Tandil.png')` devuelve `'Municipalidad de Tandil'`.
- [ ] `logoNameFromFile('Café_Martínez.webp')` devuelve `'Café Martínez'`.
- [ ] `logoNameFromFile('municipalidad-de-tandil.svg')` devuelve `'Municipalidad de tandil'`.
- [ ] `npm run test`, `npm run lint` y `npm run typecheck` terminan sin errores.

**Sección y carrusel**

- [ ] La sección está entre el Hero y «Productos», con `data-tone="light"`, y el header toma el tono claro al pasar sobre ella.
- [ ] El título visible es «Confían en nosotros» y es un `h2` enlazado por `aria-labelledby`.
- [ ] Los logos se desplazan solos hacia la izquierda en un bucle sin saltos visibles ni huecos, también con 1 solo logo en la carpeta.
- [ ] Con el mouse sobre la franja, el desplazamiento se detiene y retoma al salir.
- [ ] En reposo los logos se ven en escala de grises; al pasar el mouse sobre uno, ese logo se ve con su color original.
- [ ] Los logos miden 40 px de alto a 1440 px de ancho y 32 px a 375 px, sin deformarse.
- [ ] A 375 px de ancho la página no tiene scroll horizontal.
- [ ] Un lector de pantalla encuentra una lista con un ítem por logo, cada uno con su nombre, sin repeticiones (las copias tienen `aria-hidden="true"`).
- [ ] Con `prefers-reduced-motion: reduce` activo, los logos están quietos, aparece cada logo una sola vez y la fila salta de línea si no entra.
- [ ] La home sigue sin descargar React: `TrustedBy.astro` no tiene `<script>` y no se agrega ningún chunk de JS a `dist/index.html`.

**Documentación y numeración**

- [ ] El `README.md` explica cómo agregar un logo.
- [ ] El `README.md` y la SPEC 07 nombran a la SPEC 10 (no la 09) para el cuero.

---

## Decisiones

- **Sí:** la sección va justo después del Hero. La prueba social funciona mejor apenas entra la persona.
- **No:** después de la Galería o antes del Contacto. Llega tarde para generar confianza.
- **Sí:** carga automática desde `src/assets/logos/` con `import.meta.glob`. Sumar un logo es soltar un archivo, y no hay una lista que mantener sincronizada.
- **No:** lista manual en `site.ts`. Da nombres exactos con tildes y orden explícito, pero agrega un paso por logo. El prefijo numérico y el nombre del archivo cubren esas dos necesidades.
- **No:** carpeta en `public/`. Se perdería la optimización de los raster, y los logos que manden los clientes suelen venir en PNG pesados.
- **Sí:** `astro:assets` solo para los logos. La SPEC 08 lo descartó para las fotos porque son provisionales; los logos son finales y llegan en tamaños arbitrarios, así que la optimización sí aporta.
- **Sí:** el nombre accesible sale del nombre del archivo y respeta mayúsculas y tildes tal como se escriben. Solo se capitaliza la primera letra; no se intenta adivinar el «Title Case» del español.
- **Sí:** sin logos, la sección no se renderiza. Una sección vacía o con placeholders resta confianza en lugar de sumarla.
- **No:** placeholders marcados ni un mínimo de N logos para mostrarla.
- **Sí:** tono claro. Corta el Hero oscuro, prepara «Productos» y la mayoría de los logos se ven bien sobre fondo claro.
- **Sí:** título «Confían en nosotros» sin bajada. Sirve para empresas, personas y organismos por igual.
- **Sí:** logos monocromos con color al hover. Unifica logos de colores muy distintos.
- **Sí:** carrusel en CSS puro, sin `<script>`. Mantiene la home sin JS extra, en línea con la SPEC 08.
- **Sí:** pausa al pasar el mouse y quietos con `prefers-reduced-motion`.
- **No:** botón visible de pausa ni bordes difuminados. Se descartaron para mantener la sección mínima.
- **Sí:** el set se repite hasta 8 ítems por mitad. Evita huecos en la pista cuando hay pocos logos, sin JS que mida el ancho.
- **No:** logos clickeables. Evita sacar a la persona de la landing, y con la carga automática no hay dónde guardar URLs.
- **Sí:** esta spec toma el número 09 y el cuero pasa a la SPEC 10. Lo decidió el usuario.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| En pantallas táctiles no hay hover, así que no se puede pausar el carrusel (WCAG 2.2.2). | Con `prefers-reduced-motion` queda quieto. Si hace falta, un botón de pausa va en otra spec (está en «No entra»). |
| Un logo blanco o muy claro desaparece sobre el fondo claro. | El README pide logos en versión oscura o a color sobre transparente. Se ve en la prueba del paso 3. |
| Un SVG sin `width`/`height` ni `viewBox` se dibuja con tamaño 0 o deformado. | Altura fija por CSS y `object-fit: contain`. El README pide SVG con `viewBox`. |
| Nombres de archivo con tildes o espacios se rompen en algún sistema de archivos o en el deploy. | El glob y Vite los manejan como UTF-8. Un criterio de aceptación prueba `Café_Martínez.webp` en el build. |
| Un logo muy ancho (p. ej. 10:1) domina la franja. | `max-width: 160px` con `object-fit: contain`. |
| Pocos logos repetidos muchas veces se ven como relleno. | Es el costo de no ocultar la sección con 1–3 logos. El usuario controla cuándo sumar más. |

---

## Qué **no** entra en esta spec

- Logos clickeables o con enlace.
- Lista manual de logos con nombre, orden o URL.
- Botón visible de pausa y bordes difuminados.
- Testimonios, citas o casos de cliente.
- Placeholders mientras no haya logos.
- La sección en `/custom-lab/`.
- Grabar el cuero (SPEC 10).

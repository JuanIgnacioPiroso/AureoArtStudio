# SPEC 24 — Sin pasos numerados en la home

> **Estado:** Aprobado
> **Depende de:** SPEC 19, SPEC 23
> **Fecha:** 2026-11-04
> **Objetivo:** Quitar de la home la sección «Cómo trabajamos» (5 pasos numerados) y su enlace del menú, y dejar la lista de pasos sólo en `/regalos-empresariales/`.

---

## Por qué esta spec

La home tiene una sección `#proceso` con 5 `li.process__step` numerados: «Elegís el producto», «Personalizás el diseño», «Revisamos tu idea», «Recibís el presupuesto», «Grabamos y entregamos». Una fila de pasos numerados aparece en casi todas las landings genéricas, y esta cuenta algo obvio: elegís, te pasamos presupuesto, grabamos.

Lo que sí distingue a AUREO ya está en la sección «Cada material pide su grabado» (`DIFFERENTIALS`): «Ves la idea antes de pedirla» (vista 3D) y «Te asesoramos antes de grabar» (revisión). La regla es que si el proceso importa, se muestra con el producto real (una captura o un video), y si es obvio, no se explica. En la home es obvio, así que la sección se quita.

En `/regalos-empresariales/` el proceso sí importa: logo y cantidad, propuesta, muestra para aprobar, tanda y factura. Ahí la lista queda como está.

---

## Alcance

**Entra:**

- **`src/pages/index.astro`:** se borran `<Process />` y el import de `Process`.
- **`src/content/site.ts`:**
  - se borra la entrada `{ href: "/#proceso", label: "Cómo trabajamos" }` de `NAV`; el menú del header (escritorio y móvil) y el footer quedan con un enlace menos;
  - se borra la constante `PROCESS`, que queda sin uso;
  - `ProcessStep` se queda, porque la usan `corporateSteps()` y `Process.astro`.
- **`src/sections/Process.astro`:**
  - `steps`, `title` y `lede` pasan a ser obligatorias, y se borran los valores por defecto que eran de la home (`PROCESS`, `'Cómo trabajamos'` y el lede de los cinco pasos);
  - se borra el import de `PROCESS`;
  - se corrige el comentario de `steps` («por defecto, los de la home»);
  - el marcado (`#proceso`, `ol.process__steps`, `li.process__step`, números) no cambia.
- **`src/styles/landing.css`:** regla nueva `.craft { border-top: 1px solid var(--rule); }`, para que la Galería y «Cada material pide su grabado» no queden pegadas, ya que las dos tienen fondo oscuro. Es la misma línea que separa los logos de «Productos».

**No entra:**

- La sección de pasos de `/regalos-empresariales/` («Cómo trabajamos con empresas»): `corporateSteps()`, sus textos, su número de pasos y su aspecto quedan igual.
- Los estilos `.process__*` de `landing.css`: los sigue usando la página de empresas.
- Mostrar el proceso con una captura del Custom Lab, fotos del taller o un video. Se descartó para la home (ver «Decisiones»).
- Cambiar textos de `DIFFERENTIALS` o de otra sección para «compensar» lo que se quita.
- Cambiar el orden de las demás secciones de la home o sus tonos.
- Editar specs anteriores (la 08 y la 19 nombran el proceso; quedan como registro).

---

## Modelo de datos

No hay datos nuevos. Se borra `PROCESS` de `src/content/site.ts` y `NAV` pasa de 7 a 6 entradas.

Cambia la interfaz de la sección:

```ts
// src/sections/Process.astro
interface Props {
  steps: readonly ProcessStep[]
  title: string
  lede: string
}
```

---

## Plan de implementación

1. **Home.** En `src/pages/index.astro`, borrar `<Process />` y su import. En `site.ts`, borrar la entrada `/#proceso` de `NAV`.
2. **Componente y datos.** En `Process.astro`, hacer obligatorias las props, borrar los valores por defecto y el import de `PROCESS`, y corregir el comentario. En `site.ts`, borrar `PROCESS`.
3. **Separación.** En `landing.css`, sumar `.craft { border-top: 1px solid var(--rule); }`. Conviene ponerla en el bloque «Oficio y diferenciales».
4. **Verificación.** Capturas con el Chromium de Playwright por CDP de la home (de la Galería a «Cada material pide su grabado») y de la sección de pasos de `/regalos-empresariales/`, a 1440 y a 375 px. Después, `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] `dist/index.html` no contiene `id="proceso"`, `process__step` ni `href="/#proceso"`.
- [ ] Ningún HTML de `dist/` contiene `href="/#proceso"`. El header (escritorio y móvil) y el footer no muestran «Cómo trabajamos».
- [ ] En la home, «Cada material pide su grabado» viene justo después de la Galería, separada por una línea de 1px, y después vienen «Preguntas» y «Contacto».
- [ ] `src/content/site.ts` no contiene `PROCESS` y sí `ProcessStep`.
- [ ] `src/sections/Process.astro` no importa `PROCESS` ni tiene valores por defecto para `steps`, `title` o `lede`.
- [ ] `dist/regalos-empresariales/index.html` sigue teniendo `#proceso` con el título «Cómo trabajamos con empresas», el mismo lede de antes y la misma cantidad de `li.process__step` que da `corporateSteps()`.
- [ ] La sección de pasos de `/regalos-empresariales/` se ve igual que antes a 1440 y a 375 px.
- [ ] La home no tiene scroll horizontal a 375 px.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** quitar la sección de la home en lugar de rediseñarla. El proceso de un grabado es obvio. Lo que lo distingue (la vista 3D y la revisión antes de grabar) ya está en «Cada material pide su grabado».
- **No:** cambiarla por fotos del taller (bronce en grabado 46, bandeja 45, copas 50). La 45 ya está en «Cada material pide su grabado» y la 50 en el hero, así que se repetirían imágenes para explicar algo obvio.
- **No:** cambiarla por una captura del Custom Lab. El hero, las tarjetas y el menú («Simulador 3D») ya llevan al Lab, y la SPEC 22 sacó la captura del hero para mostrar trabajos reales.
- **No:** usar un video corto. No hay video del taller en el repo.
- **Sí:** la página de empresas no se toca. Para una empresa, el proceso no es obvio (la muestra para aprobar y la factura cambian según `CORPORATE`), y el usuario pidió cambiar sólo la home.
- **Sí:** quitar «Cómo trabajamos» del menú. Sin la sección, `/#proceso` sería un ancla rota.
- **No:** apuntar el enlace a `/regalos-empresariales/#proceso`. Lleva a quien compra para sí a una página para empresas.
- **Sí:** borrar `PROCESS` y los valores por defecto de `Process.astro`. Sólo los usaba la home, y no conviene mantener código sin uso.
- **Sí:** una línea de 1px entre la Galería y «Cada material pide su grabado». Es el cambio más chico que marca el corte entre dos secciones oscuras, y usa la misma regla que «Confían en nosotros» (SPEC 23).
- **No:** dejarlas juntas sin nada. Se vería un solo bloque oscuro largo, con un espacio doble en el medio.
- **No:** pasar «Cada material pide su grabado» a fondo claro. Cambia cómo se ve esa sección y la deja pegada a «Preguntas», que también es clara.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Hay enlaces externos (redes, buscadores) a `/#proceso`. | El navegador abre la home arriba de todo, sin error. Es un ancla, no una página. |
| La línea sola no alcanza y la Galería y los diferenciales se siguen leyendo como un solo bloque. | Se revisa en las capturas del paso 4. Si hace falta más, va en otra spec. |
| El menú con 6 enlaces cambia el ancho del header en tamaños intermedios. | Hay menos texto, no más. Se revisa a 1440 px en las capturas. |

---

## Lo que **no** entra en esta spec

- La sección de pasos de `/regalos-empresariales/`.
- Una captura, fotos o un video del proceso.
- Cambios en otros textos, en el orden de las secciones o en sus tonos.

Si alguno de estos cambios se hace, va en su propia spec.

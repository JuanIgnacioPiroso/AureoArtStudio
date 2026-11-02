# SPEC 21 — Galerías de trabajos por categoría

> **Estado:** Implementado
> **Depende de:** SPEC 16, SPEC 18, SPEC 20
> **Fecha:** 2026-11-01
> **Objetivo:** Sumar 27 trabajos nuevos del taller repartidos en placas, termos y mates, copas y regalos, para que cada categoría muestre su propia galería, recorrible con flechas en el visor.

---

## Por qué esta spec

En los dos últimos commits entraron 29 fotos nuevas en `src/assets/works/` (de la 23 a la 51), y después se sumó la 52, sin commitear. A diferencia de las de la SPEC 20, no son sólo placas: hay un termo, un mate de acero, copas en el rotativo, una caja de MDF, chapitas para mascotas, un retrato en mármol y un perro grabado en piedra.

La infraestructura para «tocar una categoría y ver sólo sus fotos» ya existe a medias: la tarjeta de la home lleva a la página de la categoría (SPEC 18), que muestra sus trabajos con `WorkGrid`, y la galería de la home tiene filtros (SPEC 16). Hoy no se ve porque todos los trabajos son `placas`: las otras páginas ocultan la sección y la home oculta los filtros. Faltan tres cosas: los trabajos de cada categoría, un acceso visible a la galería desde la página de la categoría y una forma de recorrer las fotos sin cerrar el visor.

Tres fotos no se publican:

- **25 (caja MDF, lateral)**: es la misma caja que la 24 y la galería admite una foto por trabajo.
- **35 (placas recordatorias «¡Abu! ¡Mamá!»)**: placas funerarias de particulares. Misma regla que las fotos 08 y 12 de la SPEC 20.
- **43 (trofeo de esquí del Club Lacar)**: lleva el nombre de un menor.

---

## Alcance

**Entra:**

- **Borrar** `25-caja-mdf-tapa-lateral.webp`, `35-placas-recordatorias-abu-mama.webp` y `43-trofeo-vidrio-club-lacar.webp` de `src/assets/works/`. Ya están commiteadas: quedan en el historial de git (ver «Riesgos»).
- **`WORKS`** (`src/content/works.ts`): 45 trabajos en el orden de la tabla de «Modelo de datos». Son los 18 de la SPEC 20, reordenados, y 27 nuevos. Por categoría: 38 en `placas`, 4 en `regalos`, 2 en `termos` y 1 en `copas`.
- **Primeros 8 mezclados**: la home con «Todos» muestra 4 placas de la SPEC 20 (embajada, Armada, Hungría y Nalco) intercaladas con el termo, el perro en piedra, las copas y el mate. La chapita Advanta pasa al noveno lugar.
- **Textos de cada trabajo nuevo**: título, material, detalle, `alt` y `labProductId` según la tabla. Los materiales «a confirmar» los revisa el negocio antes de publicar.
- **Fotos en proceso** (45, 46 y 50): se publican como trabajos y el detalle aclara que la pieza está en la máquina.
- **Constante**: `HOME_WORKS_LIMIT` pasa a llamarse `WORKS_LIMIT` (sigue en 8), porque ya no es sólo de la home.
- **«Ver más» en todas las grillas**: la lógica de límite y «Ver más» pasa de `Gallery.astro` a `WorkGrid.astro`, con una prop `limit`:
  - cualquier grilla muestra los primeros `limit` trabajos visibles y el botón «Ver más trabajos (N)»;
  - en la home, el límite se aplica a «Todos» y también a cada filtro. Cada filtro recuerda si ya se tocó su «Ver más»;
  - en las páginas de categoría se aplica igual (Placas tiene 38);
  - al tocar el botón, el foco pasa a la primera tarjeta que estaba oculta;
  - `?obra=` abre el visor aunque la tarjeta esté oculta y expande la grilla (del filtro activo en la home);
  - sin JS se ven todos los trabajos y no hay botón;
  - el texto de estado (`role="status"`) dice cuántos trabajos se muestran.
- **Filtros de la home**: con cuatro categorías con trabajos, la barra vuelve a aparecer sola (`showFilters` ya existe): «Todos», «Termos y mates», «Copas y vasos», «Regalos personalizados» y «Placas y reconocimientos», en el orden de `CATEGORIES`. `?cat=` sigue funcionando.
- **Galería de la home y `WorkGrid`**: `Gallery.astro` le avisa a `WorkGrid` el filtro activo con un evento (`works:filter`, con el id en `detail`) sobre `[data-works]`. `WorkGrid` aplica filtro, límite y estado. `Gallery` sigue a cargo de los chips y de `?cat=`.
- **Visor con anterior y siguiente** (`WorkGrid.astro`):
  - botones «Anterior» y «Siguiente» y las teclas ← y → recorren los trabajos de la grilla: en la home, los del filtro activo; en una página de categoría, los de esa categoría;
  - el recorrido incluye los ocultos por «Ver más». Si se llega a uno, la grilla se expande;
  - no da la vuelta: en el primero «Anterior» queda deshabilitado y en el último «Siguiente»;
  - un contador «3 de 12» junto al título;
  - cada paso actualiza `?obra=`;
  - al cerrar, el foco vuelve a la tarjeta del último trabajo que se vio, no a la que abrió el visor;
  - con un solo trabajo (Copas) no hay botones ni contador.
- **Página de categoría** (`src/pages/[categoria]/index.astro`):
  - si la categoría tiene trabajos, el encabezado suma un segundo botón, «Ver trabajos (N)», que lleva a `#trabajos`. La sección «Trabajos» lleva ese `id`;
  - la sección «Trabajos» usa `WorkGrid` con `limit={WORKS_LIMIT}`.
- **Bajada de la galería de la home**: la tercera rama de la SPEC 20 pasa a «Placas, trofeos, mates, copas y regalos grabados en el taller para organismos, empresas y particulares.».
- **README**: suma los materiales nuevos «a confirmar», el permiso del retrato (39) y la regla de no publicar nombres de menores junto a la de placas funerarias.
- **Tests** (`src/content/__tests__/works.test.ts`): `WORKS` tiene 45 trabajos; los `id` son únicos; `termos`, `copas`, `regalos` y `placas` tienen al menos un trabajo; ningún trabajo está en una categoría sin página (`categoryPagePath` no es `null`); los primeros `WORKS_LIMIT` trabajos tienen al menos 3 categorías distintas; ningún `title`, `material`, `detail` ni `alt` está vacío; todo `labProductId` es un producto del Lab. Se mantienen los tests de las SPEC 16 y 20.

**No entra:**

- Abrir la galería en un modal desde la tarjeta de categoría de la home. La tarjeta sigue llevando a la página.
- Deslizar con el dedo en el visor para pasar de foto. En móvil se usan los botones.
- Varias fotos por trabajo (frente y lateral de la caja).
- Trabajos en `/regalos-empresariales/`. Los trabajos para empresas van en `placas`, como en la SPEC 20.
- Fotos de cuchillos, tablas o cuero. Esas páginas siguen sin sección de trabajos.
- Capturas del Custom Lab (`labPreview`) para los trabajos nuevos.
- Reescribir el historial de git para sacar la foto 35.
- Pedir permiso a los clientes. Lo hace el negocio.
- Retocar, recortar o difuminar las fotos.

---

## Modelo de datos

El modelo `Work` no cambia. Cambia el nombre de la constante:

```ts
// src/content/works.ts
/** Trabajos que muestra cada grilla (home, filtros y páginas de categoría) antes del botón «Ver más». */
export const WORKS_LIMIT = 8
```

`WorkGrid` recibe el límite:

```ts
interface Props {
  works: readonly Work[]
  /** Trabajos visibles antes de «Ver más». Sin límite si no se pasa. */
  limit?: number
}
```

### Trabajos, en el orden de `WORKS`

Las filas sin archivo son trabajos de la SPEC 20, sin cambios salvo el orden. «Termos» es `termos`, «Copas» es `copas` y «Regalos» es `regalos`.

| # | `id` | Archivo | Categoría | Título | Material | Detalle | `labProductId` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `w-embajada-argentina` | — | Placas | *(SPEC 20)* | | | |
| 2 | `w-termo-ypf-colapinto` | `52-termo-ypf-franco-colapinto.webp` | Termos | Termo con los logos de YPF y Franco Colapinto | Acero con pintura negra mate | Logos de YPF y del piloto grabados a metal en el frente. | `thermos-handle` |
| 3 | `w-armada-argentina` | — | Placas | *(SPEC 20)* | | | |
| 4 | `w-perro-en-piedra` | `42-grabado-perro-sobre-piedra.webp` | Regalos | Retrato de un cachorro en piedra | Piedra *(a confirmar: mármol o granito)* | Grabado a partir de una foto, con el detalle del pelaje. | — |
| 5 | `w-marmol-hungria` | — | Placas | *(SPEC 20)* | | | |
| 6 | `w-copas-en-el-rotativo` | `50-grabado-copas-de-cristal.webp` | Copas | Copas de cristal en el rotativo | Cristal | Copas de vino en la máquina, mientras se graban. | `glassware` |
| 7 | `w-trofeo-nalco` | — | Placas | *(SPEC 20)* | | | |
| 8 | `w-mate-navegar-en-paz` | `26-mate-acero-navegar-en-paz.webp` | Termos | Mate de acero «Navegar en paz» | Acero inoxidable | Frase y un barco grabados en el borde de la boca. | `mate-steel` |
| 9 | `w-chapita-advanta` | — | Placas | *(SPEC 20)* | | | |
| 10 | `w-bomberos-quilmes` | — | Placas | *(SPEC 20)* | | | |
| 11 | `w-granito-forestal` | — | Placas | *(SPEC 20)* | | | |
| 12 | `w-utn-fin-de-cursada` | — | Placas | *(SPEC 20)* | | | |
| 13 | `w-municipio-tigre` | — | Placas | *(SPEC 20)* | | | |
| 14 | `w-eseade-honoris-causa` | — | Placas | *(SPEC 20)* | | | |
| 15 | `w-bodega-iaccarini` | — | Placas | *(SPEC 20)* | | | |
| 16 | `w-arneg-jubilacion` | — | Placas | *(SPEC 20)* | | | |
| 17 | `w-ciudad-moto` | — | Placas | *(SPEC 20)* | | | |
| 18 | `w-homenaje-cgt` | — | Placas | *(SPEC 20)* | | | |
| 19 | `w-imaginario` | — | Placas | *(SPEC 20)* | | | |
| 20 | `w-bandeja-adicora` | — | Placas | *(SPEC 20)* | | | |
| 21 | `w-chapita-octavio` | — | Placas | *(SPEC 20)* | | | |
| 22 | `w-di-tella` | — | Placas | *(SPEC 20)* | | | |
| 23 | `w-panel-uba` | `27-panel-acero-uba.webp` | Placas | Inauguración en la Facultad de Filosofía y Letras (UBA) | Acero inoxidable | Logo de la UBA, texto de la inauguración del edificio anexo y la nómina de autoridades. | `plaque-wall` |
| 24 | `w-trofeo-aesa` | `23-trofeo-aesa-veolia.webp` | Placas | Trofeo de reconocimiento para AESA Buenos Aires | Acrílico bordó sobre base metálica *(a confirmar: vidrio o acrílico)* | Logos de AESA y Veolia y reconocimiento por asistencia perfecta. | `trophy` |
| 25 | `w-trofeo-linde` | `29-trofeo-acrilico-linde.webp` | Placas | Premio a la trayectoria de Linde | Acrílico transparente y chapa plateada sobre base de madera | Logo recortado en acrílico y chapa con la mención por 20 años de servicio. | `trophy` |
| 26 | `w-marmol-tigre` | `31-marmol-municipio-tigre.webp` | Placas | Cartel del Municipio de Tigre | Mármol blanco | Logo con el jaguar y el nombre del municipio en letras grandes. | `plaque-wall` |
| 27 | `w-marmol-ara-san-juan` | `36-marmol-ara-san-juan.webp` | Placas | Homenaje a los tripulantes del ARA San Juan | Mármol blanco | Escudos y texto por el quinto aniversario del naufragio. | `plaque-wall` |
| 28 | `w-marmol-malvinas` | `34-marmol-heroes-de-malvinas.webp` | Placas | Placa del Edificio Héroes de Malvinas | Mármol blanco | Nombre del edificio y el mapa de las islas pintado en celeste. | `plaque-wall` |
| 29 | `w-marmol-rimec6` | `40-marmol-rimec6-gral-viamonte.webp` | Placas | Homenaje a los veteranos del RIMec 6 «Gral. Viamonte» | Mármol blanco | Escudos, texto del bicentenario y la nómina de veteranos del regimiento. | `plaque-wall` |
| 30 | `w-acrilico-ep167` | `37-acrilico-ep167-50-anos.webp` | Placas | 50 años de la Escuela Primaria 167 de La Matanza | Acrílico blanco *(a confirmar)* | Logo del aniversario y la nómina del personal en columnas. | `plaque-wall` |
| 31 | `w-placa-amerisourcebergen` | `33-placa-amerisourcebergen.webp` | Placas | Aniversario de 10 años en AmerisourceBergen | Chapa dorada sobre base de madera *(a confirmar: bronce o aluminio)* | Saludo en letra manuscrita, dedicatoria y logo de la empresa. | `plaque-base` |
| 32 | `w-placa-logias` | `44-placa-bronce-estuche-logias.webp` | Placas | Placa de hermanamiento entre logias | Chapa dorada sobre madera, en estuche *(a confirmar: bronce)* | Texto del hermanamiento, dos emblemas y guarda perimetral. | `plaque-base` |
| 33 | `w-cuadros-salud` | `41-cuadros-direccion-general-salud.webp` | Placas | Reconocimiento de la Dirección General de Salud | Chapa negra en marco dorado | Logo por los 100 años de la dirección y reconocimiento a la trayectoria. | — |
| 34 | `w-acrilico-led-taval` | `49-acrilico-led-taval-dervos.webp` | Placas | Cartel con luz para Taval y Dervos | Acrílico sobre base de luz LED | Logos de las dos empresas y mensaje por 10 años de relación comercial. | — |
| 35 | `w-trofeo-arte-nuevo` | `51-trofeo-vidrio-arte-nuevo.webp` | Placas | Trofeo por los 40 años del Grupo Arte Nuevo | Acrílico bordó sobre base metálica *(a confirmar: vidrio o acrílico)* | Logo de la asociación y homenaje a su director. | `trophy` |
| 36 | `w-bandeja-cfj` | `47-bandeja-oval-cfj.webp` | Placas | Bandeja del Centro de Formación Judicial | Bandeja oval de metal con borde dorado *(a confirmar)* | Logo del centro y texto por los diez años del instituto. | — |
| 37 | `w-medallas-padel` | `48-medallas-asociacion-padel.webp` | Placas | Medallas de la Asociación de Pádel | Metal con cinta *(a confirmar)* | Escudo de la asociación en medallas con cinta celeste y blanca. | — |
| 38 | `w-portanombre-abogada` | `32-portanombre-abogada.webp` | Placas | Portanombre de escritorio | Chapa negra sobre base de madera | Nombre, profesión y la balanza de la justicia. | `plaque-base` |
| 39 | `w-granito-peron` | `30-granito-peron-pj-tigre.webp` | Placas | Placa del Día de la Lealtad del PJ de Tigre | Granito negro | Texto en conmemoración y logo del partido. | `plaque-wall` |
| 40 | `w-marmol-kirchner` | `38-marmol-homenaje-pj-pilar.webp` | Placas | Homenaje del PJ de Pilar | Mármol blanco en caja de acrílico | Logo, fecha y texto del homenaje a Néstor Kirchner. | `plaque-wall` |
| 41 | `w-bandeja-en-el-taller` | `45-bandeja-acero-en-grabado.webp` | Placas | Bandeja de acero en el taller | Acero inoxidable | Dedicatoria por 42 años de servicio, en la máquina mientras se graba. | — |
| 42 | `w-bronce-en-el-taller` | `46-grabado-bronce-en-proceso.webp` | Placas | Placa de bronce en el taller | Bronce | Reconocimiento a un docente, en la máquina mientras se graba. | `plaque-wall` |
| 43 | `w-caja-cumpleanos` | `24-caja-mdf-cumpleanos.webp` | Regalos | Caja de cumpleaños de MDF | MDF | Caja con encastres, «Happy Birthday» y Darth Vader en el frente. | — |
| 44 | `w-chapitas-mascotas` | `28-chapitas-hueso-mascotas.webp` | Regalos | Chapitas para mascotas | Acero inoxidable | Dos chapitas con forma de hueso, con el nombre y el dibujo de cada perro. | `dog-tag` |
| 45 | `w-retrato-marmol` | `39-retrato-grabado-en-marmol.webp` | Regalos | Retrato grabado en mármol | Mármol blanco | Retrato a partir de una foto, con toda la escala de grises. | `plaque-wall` |

En el código, `material` va sin la marca «a confirmar»: la lista de pendientes queda en el README.

Cada `alt` describe la pieza y el texto principal que se lee, como en la SPEC 20. Se escriben al implementar, a partir de la columna «Detalle». En la 45, la 46 y la 50 el `alt` dice que la pieza está en la máquina.

---

## Plan de implementación

1. **Limpiar la carpeta.** Borrar las fotos 25, 35 y 43.
2. **Datos.** Renombrar `HOME_WORKS_LIMIT` a `WORKS_LIMIT`, importar las 27 fotos y dejar `WORKS` en el orden de la tabla. Tests nuevos. Con este paso la home ya muestra los filtros y las páginas de Termos, Copas y Regalos ya muestran su sección «Trabajos» (sin límite todavía en las páginas).
3. **«Ver más» en `WorkGrid`.** Mover límite, botón, estado y expansión por `?obra=` de `Gallery.astro` a `WorkGrid.astro`, con la prop `limit` y el evento `works:filter`. Expansión recordada por filtro. `Gallery` pasa `limit={WORKS_LIMIT}` y despacha el evento en cada cambio de chip y al cargar.
4. **Página de categoría.** `id="trabajos"` en la sección, botón «Ver trabajos (N)» en el encabezado y `limit={WORKS_LIMIT}` en la grilla.
5. **Visor con anterior y siguiente.** Botones, teclas ← y →, contador, expansión al llegar a un oculto, `?obra=` en cada paso y foco al cerrar.
6. **Bajada de la home y README.**
7. **Verificación.** Capturas con el Chromium de Playwright por CDP, a 1440 y 375 px: home con «Todos» y con el filtro «Placas» antes y después de «Ver más»; visor con el contador y las flechas; `/mates-y-termos-grabados/`, `/copas-y-vasos-grabados/`, `/regalos-personalizados/` y `/placas-y-reconocimientos/`. Recorrer con → los 38 de Placas hasta el último. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] `src/assets/works/` no tiene las fotos 25, 35 ni 43.
- [ ] `WORKS` tiene 45 trabajos en el orden de la tabla: 38 en `placas`, 4 en `regalos`, 2 en `termos` y 1 en `copas`.
- [ ] La home con «Todos» muestra 8 trabajos, entre ellos el termo, el perro en piedra, las copas y el mate, y el botón «Ver más trabajos (37)».
- [ ] La home muestra la barra de filtros con «Todos», «Termos y mates», «Copas y vasos», «Regalos personalizados» y «Placas y reconocimientos».
- [ ] Con el filtro «Placas y reconocimientos» se ven 8 trabajos y «Ver más trabajos (30)». Al tocarlo se ven los 38 y el foco queda en la novena tarjeta.
- [ ] Al pasar de un filtro expandido a otro y volver, el primero sigue expandido.
- [ ] `/?cat=regalos` muestra sólo los 4 regalos, sin botón «Ver más».
- [ ] `/mates-y-termos-grabados/` muestra la sección «Trabajos» con el termo y el mate, y el botón «Ver trabajos (2)» en el encabezado, que baja a la sección. En el visor, las flechas pasan del termo al mate con el contador «1 de 2» y «2 de 2».
- [ ] `/copas-y-vasos-grabados/` y `/regalos-personalizados/` muestran su sección «Trabajos» con 1 y 4 trabajos.
- [ ] `/placas-y-reconocimientos/` muestra 8 trabajos, «Ver más trabajos (30)» y «Ver trabajos (38)» en el encabezado.
- [ ] `/cuchillos-grabados/`, `/tablas-personalizadas/` y `/cuero-grabado/` siguen sin sección «Trabajos».
- [ ] En el visor de Placas, «Siguiente» y → recorren los 38 en orden, el contador va de «1 de 38» a «38 de 38», y en el último «Siguiente» está deshabilitado. Al pasar al noveno, la grilla se expande.
- [ ] En el visor de la home con el filtro «Regalos», las flechas recorren sólo los 4 regalos.
- [ ] Cada paso del visor cambia `?obra=`, y al cerrar el foco queda en la tarjeta del último trabajo visto.
- [ ] El visor del trabajo de Copas no muestra flechas ni contador.
- [ ] `/placas-y-reconocimientos/?obra=w-retrato-marmol` no abre nada (es de Regalos) y `/?obra=w-bronce-en-el-taller` abre el visor con la grilla expandida.
- [ ] Sin JS, la home y las páginas de categoría muestran todos sus trabajos, sin botón «Ver más».
- [ ] La bajada de la galería de la home dice «Placas, trofeos, mates, copas y regalos grabados en el taller para organismos, empresas y particulares.».
- [ ] Cada trabajo con `labProductId` muestra «Diseñar algo parecido» en el visor; los que no tienen, no.
- [ ] En 375 px no hay scroll horizontal en la galería, el visor ni las páginas de categoría, y los botones del visor entran en pantalla.
- [ ] El README lista los materiales nuevos a confirmar, el permiso del retrato y la regla sobre nombres de menores.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** página de la categoría + flechas en el visor, en lugar de un modal desde la tarjeta de la home. Reusa lo que ya existe (SPEC 18), la galería tiene URL propia para compartir y para SEO, y las flechas dan la sensación de «galería» sin cambiar la navegación.
- **Sí:** botón «Ver trabajos (N)» en el encabezado de la página de categoría. La sección «Trabajos» queda al final, después de productos y materiales; sin el botón, quien llega buscando fotos no las encuentra.
- **Sí:** el visor recorre los trabajos del filtro activo o de la página. Es lo que el usuario está mirando: en Termos se ven termos, no placas.
- **No:** dar la vuelta del último al primero. Con un contador, llegar al final es información útil.
- **No:** deslizar con el dedo. Los botones alcanzan y no hay que resolver el conflicto con el scroll del visor.
- **Sí:** límite de 8 en todas las grillas, también en los filtros y en las páginas de categoría. Cambia la regla de la SPEC 20 (filtros sin límite) porque Placas pasa de 18 a 38 trabajos.
- **Sí:** cada filtro recuerda su propio «Ver más». Generaliza la regla de la SPEC 20 para «Todos».
- **Sí:** la lógica de «Ver más» vive en `WorkGrid`. Ahora la usan la home y las páginas de categoría; duplicarla en las dos sería repetir el bug dos veces.
- **Sí:** mezclar categorías en los 8 primeros. La home tiene que mostrar que el taller no hace sólo placas.
- **Sí:** el termo (52) en el segundo lugar. Es la categoría más buscada del sitio y la pieza más reconocible; la chapita Advanta baja al noveno para dejarle lugar.
- **Sí:** publicar las fotos en proceso (45, 46 y 50). Muestran que el grabado se hace en el taller y la 50 es la única foto de copas.
- **Sí:** la caja de cumpleaños, el perro, las chapitas para mascotas y el retrato en `regalos`. Son regalos para particulares y así `/regalos-personalizados/` tiene galería.
- **Sí:** la caja va con la foto 24, no la 25. La de «Happy Birthday» muestra la personalización.
- **No:** publicar la 35 (placas recordatorias). Misma regla que la SPEC 20 para placas funerarias.
- **No:** publicar la 43. Lleva el nombre de un menor. Regla nueva: no se publican nombres de menores.
- **Sí:** publicar el retrato (39), sujeto a que el negocio confirme que es una figura pública o que hay permiso.
- **Sí:** los trabajos para empresas siguen en `placas`. `empresas` no tiene página de categoría (SPEC 18), igual que en la SPEC 20.
- **Sí:** las piezas políticas nuevas (30 y 38) se publican, como en la SPEC 20, y quedan fuera de los 8 primeros de «Todos» y de «Placas».

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La foto 35 ya está commiteada: aunque se borre, queda en el historial de git. | El repo no publica el historial en el sitio. Si hace falta sacarla del historial, es otra tarea (reescribir historia y forzar el push). |
| La persona del retrato (39) no es una figura pública y no dio permiso. | El negocio lo confirma antes de publicar. Quitarlo es borrar su entrada y su foto. |
| La caja (24) muestra marcas registradas de Star Wars, y el termo (52), las de YPF y Franco Colapinto. | Son trabajos hechos por encargo y se muestran como tales, sin usar la marca para vender. Si el negocio prefiere no mostrarla, se quita sin tocar componentes. |
| Un cliente no quiere aparecer (Linde, AmerisourceBergen, la abogada del portanombre). | El negocio confirma con los clientes. Quitar un trabajo es borrar su entrada en `WORKS` y su foto. |
| Un material está mal nombrado (vidrio o acrílico, bronce o aluminio, mármol o granito). | Quedan marcados «a confirmar» en el README y se corrigen en `WORKS`. |
| Varias fotos nuevas miden menos de 1600 px (39, 40, 43, 46, 50, 51 entre 647 y 968 px de ancho). | `astro:assets` no agranda: el visor las muestra a su tamaño. Se ven más chicas, no pixeladas. |
| Copas tiene un solo trabajo y Termos dos: la galería es corta. | La página igual la muestra; se completa cuando haya más fotos. No hay flechas con un solo trabajo. |
| Mover «Ver más» a `WorkGrid` rompe el comportamiento de la SPEC 20 en la home. | Los criterios de aceptación de la SPEC 20 sobre «Ver más» y `?obra=` se vuelven a verificar en el paso 7. |

# SPEC 20 — Fotos de trabajos del taller en la galería

> **Estado:** Aprobado
> **Depende de:** SPEC 16, SPEC 18
> **Fecha:** 2026-10-31
> **Objetivo:** Reemplazar las 4 fotos ilustrativas de la galería por 18 trabajos reales del taller, de las fotos de `src/assets/works/`, y mostrar en la home los primeros 8 con un botón «Ver más».

---

## Por qué esta spec

La SPEC 16 preparó la galería para trabajos propios, pero `WORKS` todavía tiene sólo las 4 fotos de Wikimedia rotuladas «Imagen ilustrativa». Ahora hay 21 fotos del taller en `src/assets/works/`: placas de bronce, mármol, granito y acrílico, un trofeo de vidrio, una bandeja y chapitas de acero. Son trabajos para organismos (embajadas, Armada, bomberos, municipio, UTN) y empresas. Es la señal de experiencia que la auditoría SEO echaba en falta.

Tres fotos no se publican:

- **08 (placas Retamar)** y **12 (placa María Julia Orden)**: son placas funerarias de particulares, con nombres de difuntos y de sus familiares.
- **16 (chapa Advanta, frente)**: es la misma pieza que la 19 y la galería admite una foto por trabajo.

---

## Alcance

**Entra:**

- **Borrar** `08-placas-retamar.webp`, `12-placa-recordatoria.webp` y `16-chapa-advanta-frente.webp` de `src/assets/works/`. No están commiteadas, así que no quedan en el historial de git.
- **`WORKS`** (`src/content/works.ts`): se quitan las 4 entradas ilustrativas (`w-box`, `w-crest`, `w-knife`, `w-board`) y se suman los 18 trabajos de la tabla de «Modelo de datos», en ese orden, todos en la categoría `placas`. `IMAGES.box`, `IMAGES.laser`, `IMAGES.knife` e `IMAGES.board` se quedan porque las usan las tarjetas de `CATEGORIES` y `MATERIALS`.
- **Textos de cada trabajo**: título, material, detalle y `alt` según la tabla. Los materiales marcados «a confirmar» los revisa el negocio antes de publicar.
- **`labProductId`**: cada trabajo apunta al producto del Lab más parecido (tabla), para «Diseñar algo parecido». Los que no tienen equivalente (bandeja, cuadro) no llevan enlace.
- **Home: 8 trabajos y «Ver más»** (`src/sections/Gallery.astro`):
  - con el filtro «Todos», la grilla muestra los primeros 8 y debajo un botón «Ver más trabajos (N)», donde N es la cantidad oculta;
  - al tocarlo se muestran todos, el botón desaparece y el foco pasa a la primera tarjeta nueva;
  - con un filtro de categoría se ven todos los trabajos de ese filtro, sin límite. Al volver a «Todos» se respeta si ya se había tocado «Ver más»;
  - `?obra=` abre el visor aunque la tarjeta esté entre las ocultas, y en ese caso la grilla se expande;
  - sin JS se ven los 18: las tarjetas se ocultan desde el script, no desde el HTML;
  - el texto de estado (`data-gallery-count`) dice cuántos trabajos se muestran.
- **Constante** `HOME_WORKS_LIMIT = 8` en `src/content/works.ts`.
- **Filtros**: con una sola categoría con trabajos, la barra de filtros no se renderiza (sólo tendría «Todos» y «Placas y reconocimientos»). `?cat=` con un filtro inexistente ya se ignora.
- **Bajada de la sección**: sin fotos ilustrativas y sin `labPreview`, hoy la sección queda sin bajada. Se suma una tercera rama: «Placas, trofeos y chapitas grabados en el taller para organismos, empresas y particulares.».
- **Página `/placas-y-reconocimientos/`**: muestra los 18 trabajos con `WorkGrid`, sin límite. No hay cambios de código; se verifica.
- **README**: la entrada «Fotos» de «Datos pendientes del negocio» deja de decir que las fotos de la galería son provisionales. Suma la lista de materiales «a confirmar» y la regla de no publicar placas funerarias ni datos de particulares sin su permiso.
- **Tests** (`src/content/__tests__/works.test.ts`): ningún trabajo de `WORKS` es ilustrativo; los `id` son únicos; ningún `title`, `material`, `detail` ni `alt` está vacío. Se mantienen los tests de la SPEC 16.

**No entra:**

- Varias fotos por trabajo (frente y dorso de la chapita Advanta). Cambia el modelo y el visor: va en otra spec.
- Capturas del Custom Lab (`labPreview`) para estos trabajos. No hay diseños del Lab de estas piezas.
- Fotos de cuchillos, tablas, termos, copas, cuero o regalos. Esas páginas de categoría siguen sin sección de trabajos hasta que haya fotos (ya la ocultan cuando está vacía).
- Mostrar trabajos en `/regalos-empresariales/`.
- Pedir permiso a los clientes que aparecen en las fotos. Lo hace el negocio (ver «Riesgos»).
- Retocar, recortar o difuminar las fotos.
- Una página propia de galería con paginación.

---

## Modelo de datos

El modelo `Work` de la SPEC 16 no cambia. Se suma una constante:

```ts
// src/content/works.ts
/** Trabajos que la galería de la home muestra antes del botón «Ver más». */
export const HOME_WORKS_LIMIT = 8
```

Cada trabajo importa su foto:

```ts
import embajadaArgentina from '../assets/works/17-embajada-argentina.webp'

{
  id: 'w-embajada-argentina',
  title: 'Placa de la Embajada de la República Argentina',
  category: 'placas',
  material: 'Acero inoxidable',
  detail: 'Escudo nacional y nombre de la embajada en letras grandes.',
  photo: { src: embajadaArgentina, alt: 'Placa de pared con el escudo argentino y la leyenda «Embajada de la República Argentina».' },
  labProductId: 'plaque-wall',
}
```

### Trabajos, en el orden de `WORKS`

El orden pone en los primeros 8 (los que ve la home) piezas de organismos conocidos y materiales distintos: acero, chapa, mármol, vidrio, granito y la chapita.

| # | `id` | Archivo | Título | Material | Detalle | `labProductId` |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `w-embajada-argentina` | `17-embajada-argentina.webp` | Placa de la Embajada de la República Argentina | Acero inoxidable *(a confirmar)* | Escudo nacional y nombre de la embajada en letras grandes. | `plaque-wall` |
| 2 | `w-armada-argentina` | `18-armada-argentina.webp` | Reconocimiento de la Armada Argentina | Chapa negra sobre base de madera | Escudo del buque multipropósito Ciudad de Rosario con dedicatoria. | `plaque-base` |
| 3 | `w-bomberos-quilmes` | `03-bomberos-quilmes.webp` | 50 años de Bomberos Voluntarios de Quilmes | Chapa negra sobre base de madera | Escudo y la dotación completa del destacamento en dos columnas. | `plaque-base` |
| 4 | `w-marmol-hungria` | `07-marmol-embajada-hungria.webp` | Homenaje de la Embajada de Hungría | Mármol blanco | Escudo húngaro y texto por el centenario del Hogar Húngaro San Esteban. | `plaque-wall` |
| 5 | `w-trofeo-nalco` | `15-trofeo-vidrio-nalco.webp` | Trofeo de reconocimiento para Nalco Water | Vidrio | Logo de la empresa y nombre del premiado. | `trophy` |
| 6 | `w-chapita-advanta` | `19-chapa-advanta.webp` | Chapita identificatoria para Advanta | Acero inoxidable | Logo y nombre de la misión, con cadena de bolitas. | `dog-tag` |
| 7 | `w-granito-forestal` | `14-granito-compania-forestal.webp` | Placa histórica de la Compañía Forestal de Tierra del Fuego | Granito negro | Texto en recuerdo del fundador, con letras de molde. | `plaque-wall` |
| 8 | `w-utn-fin-de-cursada` | `05-utn-fin-de-cursada.webp` | Fin de cursada en la UTN | Chapa dorada sobre base de madera *(a confirmar: bronce o aluminio)* | Logo de la UTN, nombre del egresado, carrera y frase, con guardas en las esquinas. | `plaque-base` |
| 9 | `w-municipio-tigre` | `10-cuadro-municipio-tigre.webp` | Ciudadano ilustre del Municipio de Tigre | Chapa dorada en cuadro con marco *(a confirmar)* | Logo del municipio y texto del decreto, enmarcado con paspartú. | — |
| 10 | `w-eseade-honoris-causa` | `06-eseade-honoris-causa.webp` | Doctorado honoris causa de ESEADE | Chapa dorada sobre base de madera *(a confirmar: bronce o aluminio)* | Texto de la distinción con separadores metálicos en las esquinas. | `plaque-base` |
| 11 | `w-bodega-iaccarini` | `01-bodega-iaccarini.webp` | Reconocimiento de Bodega Iaccarini | Chapa dorada sobre base de madera *(a confirmar: bronce o aluminio)* | Logo de la bodega y agradecimiento por 11 años, con filete perimetral. | `plaque-base` |
| 12 | `w-arneg-jubilacion` | `02-arneg-jubilacion.webp` | Placa de jubilación para Arneg | Chapa dorada con separadores *(a confirmar: bronce o aluminio)* | Logo de la empresa, nombre en letra manuscrita y dedicatoria. | `plaque-wall` |
| 13 | `w-ciudad-moto` | `11-ciudad-moto.webp` | Reconocimiento de Ciudad Moto | Chapa plateada sobre base de madera | Agradecimiento por 17 años, con logo y firmas. | `plaque-base` |
| 14 | `w-homenaje-cgt` | `09-homenaje-cgt.webp` | Homenaje del Sindicato Portuario Zona Norte | Acero inoxidable *(a confirmar)* | Dos logos y texto de homenaje, con separadores en las esquinas. | `plaque-wall` |
| 15 | `w-imaginario` | `13-imaginario-galeria.webp` | Cartel de Imaginario Galería de Arte | Acrílico blanco | Logo de la galería con separadores dorados. | `plaque-wall` |
| 16 | `w-bandeja-adicora` | `04-bandeja-adicora.webp` | Bandeja de reconocimiento para ADICORA | Vidrio con borde dorado *(a confirmar)* | Texto de la Legislatura porteña grabado en el centro de una bandeja oval. | — |
| 17 | `w-chapita-octavio` | `20-chapa-octavio.webp` | Chapita con nombre | Acero inoxidable | Nombre y apellido en dos líneas. | `dog-tag` |
| 18 | `w-di-tella` | `21-placa-centro-estudiantes-di-tella.jpg` | Placa del Centro de Estudiantes Di Tella | Chapa dorada sobre base de madera *(a confirmar: bronce o aluminio)* | Consigna en letras grandes y firma del centro de estudiantes. | `plaque-base` |

En el código, `material` va sin la marca «a confirmar»: la lista de pendientes queda en el README.

Cada `alt` describe la pieza y el texto principal que se lee, como en el ejemplo de arriba. Se escriben al implementar, siguiendo la columna «Detalle».

---

## Plan de implementación

1. **Limpiar la carpeta.** Borrar las fotos 08, 12 y 16.
2. **Datos.** Quitar las 4 entradas ilustrativas, importar las 18 fotos y cargar los trabajos en el orden de la tabla. Sumar `HOME_WORKS_LIMIT`. Tests nuevos. Con este paso la home ya muestra los 18 trabajos.
3. **Filtros y bajada.** No renderizar la barra de filtros con una sola categoría y sumar la tercera rama de la bajada.
4. **«Ver más».** En el script de `Gallery.astro`: ocultar las tarjetas desde la novena con «Todos», el botón con N, la expansión con foco, el comportamiento con filtros y con `?obra=`, y el texto de estado.
5. **README.**
6. **Verificación.** Capturas de la galería de la home (antes y después de «Ver más»), del visor y de `/placas-y-reconocimientos/` a 1440 y 375 px, con el Chromium de Playwright por CDP. `?obra=w-di-tella` abre el visor y expande la grilla. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] `src/assets/works/` no tiene las fotos 08, 12 ni 16.
- [ ] `WORKS` tiene 18 trabajos, todos de la categoría `placas`, en el orden de la tabla, y ninguno ilustrativo.
- [ ] La galería de la home no muestra la bajada de imágenes ilustrativas ni ninguna foto de Wikimedia.
- [ ] Las tarjetas de categoría y de materiales siguen mostrando sus imágenes actuales.
- [ ] La home muestra 8 trabajos y el botón «Ver más trabajos (10)».
- [ ] Al tocar el botón aparecen los 18, el botón desaparece y el foco queda en la novena tarjeta.
- [ ] `/?obra=w-di-tella` abre el visor de ese trabajo con la grilla expandida.
- [ ] Sin JS, la home muestra los 18 trabajos y no muestra el botón.
- [ ] La barra de filtros no aparece.
- [ ] Cada trabajo con `labProductId` muestra «Diseñar algo parecido» en el visor y lleva al producto en el Lab. La bandeja y el cuadro no lo muestran.
- [ ] `/placas-y-reconocimientos/` muestra los 18 trabajos.
- [ ] Las fotos salen en `webp`, con 800 px en la tarjeta y hasta 1600 px en el visor.
- [ ] En 375 px no hay scroll horizontal en la galería ni en el visor.
- [ ] El README lista los materiales a confirmar y la regla sobre placas funerarias y datos de particulares.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** no publicar las placas funerarias (08 y 12). Muestran nombres de difuntos y de sus familias, que no son clientes que hayan pedido aparecer en una vidriera.
- **Sí:** publicar el resto como está, con los nombres. En un reconocimiento el nombre es parte del trabajo y la pieza se hizo para mostrarse.
- **Sí:** publicar las piezas con contenido político (06, 09 y 21). Son trabajos reales del taller, como los demás.
- **Sí:** todos en `placas`. La categoría ya incluye placas, chapitas y trofeos (SPEC 06), y así aparecen todos en `/placas-y-reconocimientos/`.
- **No:** separar los trabajos de empresas en la categoría `empresas`. `empresas` no tiene página de categoría (SPEC 18) y esas fotos no saldrían en la de placas.
- **Sí:** borrar las 4 ilustrativas aunque cuchillos, tablas y regalos se queden sin trabajos. Una galería sólo con trabajos propios es más creíble que una mezclada, y esas páginas ya ocultan la sección cuando está vacía. Esto cambia la regla de la SPEC 16, que las quitaba de a una por categoría.
- **Sí:** 8 en la home y «Ver más». 18 tarjetas hacen la sección muy larga en móvil. El límite vive en una constante y la expansión no cambia de página.
- **No:** enlazar a `/placas-y-reconocimientos/` en lugar de «Ver más». Recortaría la galería de la home y el filtro.
- **Sí:** ocultar las tarjetas desde el script. Sin JS se ven todas y nada queda inaccesible.
- **Sí:** una sola foto de la chapita Advanta (la 19). Se lee mejor en la tarjeta y evita repetir la pieza. Varias fotos por trabajo queda para otra spec.
- **Sí:** borrar los descartes del repo. No están commiteados y así ninguna foto privada entra al historial.
- **Sí:** textos redactados a partir de las fotos y revisados por el negocio. Los materiales que no se distinguen en la foto quedan «a confirmar» en el README.
- **Sí:** ocultar la barra de filtros con una sola categoría. Un filtro con una sola opción además de «Todos» no filtra nada.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Un cliente no quiere que su placa o su nombre aparezca en el sitio. | El negocio confirma con los clientes antes de publicar. Quitar un trabajo es borrar su entrada en `WORKS` y su foto. |
| Las piezas políticas (Milei, «Viva la libertad carajo», homenaje a Moyano) generan rechazo en parte del público. | Decisión tomada por el negocio. Si cambia, se quitan sin tocar componentes. Ninguna está entre las 8 primeras de la home. |
| Un material está mal nombrado (bronce o aluminio, vidrio o acrílico). | Quedan marcados «a confirmar» en el README y se corrigen en `WORKS` antes de publicar. |
| La foto 13 mide 954 px de ancho y la 21 1406 px, menos que los 1600 del visor. | `astro:assets` no agranda: el visor usa el tamaño original. Se ven más chicas pero no pixeladas. |
| 18 fotos pesan en la home. | Las tarjetas son `loading="lazy"` y piden la de 800 px. Las ocultas por «Ver más» no se descargan hasta que se muestran. |

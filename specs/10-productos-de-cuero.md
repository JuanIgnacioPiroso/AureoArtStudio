# SPEC 10 — Billetera, llavero y cinturón de cuero en el Custom Lab

> **Estado:** Aprobado
> **Depende de:** SPEC 06, SPEC 07
> **Fecha:** 2026-10-28
> **Objetivo:** Sumar al Custom Lab tres productos de cuero grabables con láser (billetera, llavero con forma elegible y cinturón) y una categoría «Cuero» en la home.

---

## Por qué esta spec

Es la tercera parte del pedido que se dividió en la SPEC 06: «copas de vidrio, mates, elementos de cuero». La SPEC 06 sumó placas, chapitas y el trofeo, y la SPEC 07, los mates y el vidrio. Esta suma el cuero.

Se apoya en lo que ya existe:

- **El cuero de la SPEC 07:** el tipo de material `leather`, la textura de grano fino y los materiales «Cuero negro» y «Cuero marrón». Hasta ahora son de aspecto y no tienen estilos de grabado.
- **El selector «Forma» (SPEC 06 y 07):** un producto con varias siluetas, cada una con sus zonas y su entrada en `SILHOUETTES`. El llavero lo reusa.
- **Frente y dorso (SPEC 06):** la chapita tiene dos zonas planas en caras opuestas. La billetera y el llavero las reusan.

**Numeración:** la SPEC 07, la SPEC 08, la SPEC 09 y el `README.md` reservaban «SPEC 10» para el cuero. Esta spec toma ese número.

---

## Alcance

**Entra:**

- **Material nuevo:** «Cuero suela» (`leather-tan`), tipo `leather`, con la textura `leather`. Es el cuero natural claro, donde el láser contrasta más.
- **Material fijo nuevo:** «Hilo» (`thread`), crudo, para las costuras. No se elige ni se graba.
- **Estilo de grabado nuevo:** «Grabado láser» (`leather-mark`), el único del cuero.
  - El láser oscurece y hunde apenas el cuero.
  - El tono de la marca depende del cuero: gris oscuro mate en el negro, casi negro en el marrón y marrón tostado en la suela.
  - En el 3D se ve con un relieve leve hacia adentro, como el bajorrelieve del mármol pero más suave.
- **En los tres productos:**
  - se elige el color del cuero: «Cuero negro», «Cuero marrón» o «Cuero suela»;
  - una costura de hilo crudo recorre el borde, a 4 mm del canto. Es parte de la malla y no se elige;
  - las zonas quedan adentro de la costura.
- **Billetera** (`leather-wallet`, modelo `leather-wallet-v1`):
  - plegable, cerrada, de 110 × 90 × 12 mm, con el lomo (el doblez) a la izquierda mirando el frente;
  - zonas «Frente» y «Dorso», de 80 × 60 mm cada una, en las tapas de afuera;
  - el dorso se lee derecho al girar la billetera, como la chapita.
- **Llavero** (`leather-keychain`, modelo `leather-keychain-v1`):
  - una tira de cuero de 4 mm de espesor, con un ojal arriba y una argolla de acero de Ø 25 mm (fija, no se graba);
  - selector «Forma» con tres siluetas, en este orden: «Rectángulo», «Redondo» y «Escudo»;
  - cada forma tiene zonas «Frente» y «Dorso», corridas hacia abajo para dejar libre el ojal.
- **Cinturón** (`leather-belt`, modelo `leather-belt-v1`):
  - se ve un tramo recto de 350 × 35 × 4 mm, con la hebilla de acero (fija, no se graba) en el extremo izquierdo y tres agujeros en el derecho;
  - una zona «Frente» de 200 × 25 mm, al lado de la hebilla.
- **Un diseño por defecto para cada producto**, con nombres inventados.
- **Las miniaturas SVG de los tres productos** en el menú de objeto.
- **En la home:** una categoría nueva, «Cuero», que abre `/custom-lab/?producto=leather-wallet`, con una foto placeholder de Wikimedia Commons y su crédito.
- **En el `README.md`:** las medidas y los materiales nuevos van a «Datos pendientes del negocio», como valores a confirmar con el taller. La nota de los mates deja de mencionar la SPEC 10.

**Queda fuera (para otras specs):**

- **Grabar el cuero de los mates imperial y camionero:** siguen grabándose sólo en la virola.
- **Otros productos de cuero:** agendas, portadocumentos, fundas de celular, correas, etc.
- **La billetera abierta** y el grabado del interior.
- **El cinturón entero** (enrollado o cerrado) y el grabado en la punta.
- **Más estilos en el cuero:** bajorrelieve sin color o estampado dorado (hot stamping).
- **Más colores de cuero** (bordó, verde, etc.).
- **Elegir el metal** de la hebilla o de la argolla.
- **Elegir el color del hilo**, o piezas sin costura.
- **Varios anchos** de cinturón o tamaños de billetera.
- **Una foto propia** para «Cuero»: queda el placeholder hasta que el negocio tenga una.
- **Modelos GLB:** las mallas son procedurales.

---

## Modelo de datos

Los cambios son aditivos. Un enlace `?d=` copiado antes de esta spec abre el mismo diseño.

```ts
// src/lab/model/types.ts
// STYLE_IDS (suma)
'leather-mark'

// ProductDef.modelId (suma)
| 'leather-wallet-v1' | 'leather-keychain-v1' | 'leather-belt-v1'

// MaterialDef (campo nuevo, opcional)
/** Color de la marca en este material, si el estilo depende del material (el cuero). */
engraveRgb?: readonly [number, number, number]
```

```ts
// src/lab/viewer/engravingTexture.ts
// ENGRAVING_LOOKS['leather-mark']: mate (roughness alto, metalness 0), relieve leve (depth menor
// que carve) y algo de variación de tono. Su rgb es el de respaldo; si el material tiene
// engraveRgb, se usa ése.
```

Materiales nuevos (`MATERIALS`):

| id            | Nombre          | `kind`    | `texture` | Se usa en                                |
| ------------- | --------------- | --------- | --------- | ---------------------------------------- |
| `leather-tan` | «Cuero suela»   | `leather` | `leather` | billetera, llavero y cinturón            |
| `thread`      | «Hilo»          | `coated`  | `matte`   | fijo: costuras de los tres productos     |

«Cuero negro» y «Cuero marrón» suman su `engraveRgb`. Los tres cueros quedan disponibles en los tres productos; los mates siguen ofreciendo sólo negro y marrón.

Estilo nuevo (`ENGRAVING_STYLES`):

| id             | Nombre           | Descripción                                      | `kind`    |
| -------------- | ---------------- | ------------------------------------------------ | --------- |
| `leather-mark` | «Grabado láser»  | «El láser oscurece y hunde apenas el cuero.»     | `leather` |

Productos nuevos (`PRODUCTS`):

| id                 | Nombre      | Partes (material)                                                         | Materiales                                    | Zonas (mm)                          |
| ------------------ | ----------- | ------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------- |
| `leather-wallet`   | «Billetera» | `body` «Cuero» (elegible), `stitch` «Costura» (`thread`)                  | `leather-black`, `leather-brown`, `leather-tan` | `front` 80 × 60 · `back` 80 × 60    |
| `leather-keychain` | «Llavero»   | `body` «Cuero» (elegible), `ring` «Argolla» (`steel`), `stitch` «Costura» (`thread`) | ídem                               | `front` y `back`, una por forma     |
| `leather-belt`     | «Cinturón»  | `body` «Cuero» (elegible), `buckle` «Hebilla» (`steel`), `stitch` «Costura» (`thread`) | ídem                             | `front` 200 × 25                    |

Formas de `leather-keychain` (`shapes`), en este orden:

| id       | Nombre        | Pieza (mm)  | Zonas «Frente» y «Dorso» |
| -------- | ------------- | ----------- | ------------------------ |
| `rect`   | «Rectángulo»  | 35 × 70     | 25 × 45                  |
| `round`  | «Redondo»     | Ø 50        | 32 × 32                  |
| `shield` | «Escudo»      | 45 × 55     | 30 × 30                  |

Las medidas de la pieza no incluyen el ojal.

Diseños por defecto:

| Producto           | Material, estilo y zona                         | Capas                     |
| ------------------ | ----------------------------------------------- | ------------------------- |
| `leather-wallet`   | `leather-brown`, `leather-mark`, `front`        | «Andrés» / «2026»         |
| `leather-keychain` | `leather-tan`, `leather-mark`, `rect`, `front`  | «Nico»                    |
| `leather-belt`     | `leather-black`, `leather-mark`, `front`        | «Ramiro Funes»            |

Archivos nuevos:

- `src/lab/viewer/meshes/LeatherWallet.tsx`, `LeatherKeychain.tsx` y `LeatherBelt.tsx`.
- `src/lab/viewer/meshes/keychainShapes.ts`: las tres siluetas del llavero. Las usan la malla y `SILHOUETTES`.
- `src/lab/viewer/meshes/stitch.ts`: arma la costura (una línea de puntadas) a una distancia fija del contorno de una pieza plana. La usan las tres mallas.

Categoría nueva (`src/content/site.ts`), después de «Copas y vasos»:

```ts
{ id: 'cuero', name: 'Cuero', description: …, image: IMAGES.leather, labProductId: 'leather-wallet', enabled: true }
```

---

## Plan de implementación

1. **Material, hilo y estilo del cuero.**
   - En `types.ts`, sumar `leather-mark` a `STYLE_IDS` y `MaterialDef.engraveRgb`.
   - En `catalog.ts`, sumar `leather-tan`, `thread` y el estilo «Grabado láser», y el `engraveRgb` de los tres cueros. Cambiar el comentario del cuero, que todavía dice «SPEC 08».
   - En `engravingTexture.ts`, sumar el look `leather-mark` y usar `engraveRgb` del material cuando exista.
   - Test en `constraints.test.ts`: `stylesForSurface` devuelve sólo `leather-mark` para los tres cueros.
   - Ningún producto los usa todavía. Los mates siguen ofreciendo «Marcado oscuro» y «Esmerilado» en la virola.
2. **Costura.**
   - Crear `stitch.ts`: puntadas a lo largo de un contorno 2D, a una distancia fija hacia adentro, sobre una cara plana.
   - Test: con un rectángulo de 100 × 50 mm y 4 mm de margen, todas las puntadas quedan a 4 mm (± 0,5) del borde.
3. **Billetera.**
   - Sumar `leather-wallet` en `PRODUCTS`, con «Frente» y «Dorso».
   - Crear `LeatherWallet.tsx`: dos tapas con el lomo redondeado a la izquierda, cantos apenas redondeados y costura en las dos caras. `registerPart` en `body` y `stitch`.
   - Registrarla en `MODELS` y sumar su miniatura.
   - Prueba manual: el grabado se ve en las dos tapas, adentro de la costura, y el dorso se lee derecho al girar.
4. **Llavero.**
   - Crear `keychainShapes.ts` con las tres siluetas y el ojal.
   - Sumar `leather-keychain` en `PRODUCTS` con sus tres formas, cada una con «Frente» y «Dorso», y su entrada en `SILHOUETTES`.
   - Crear `LeatherKeychain.tsx`: la pieza extruida de 4 mm, la costura sobre el contorno y la argolla de acero por el ojal.
   - Registrarlo en `MODELS` y sumar su miniatura.
   - Prueba manual: cada forma cambia la silueta en el 3D y en el lienzo, y el grabado no pisa el ojal.
5. **Cinturón.**
   - Sumar `leather-belt` en `PRODUCTS`, con «Frente».
   - Crear `LeatherBelt.tsx`: el tramo recto, la hebilla de acero a la izquierda (marco y pasador), tres agujeros a la derecha y la costura en los dos bordes largos.
   - Ajustar el `cameraOffset` de la zona para que se lea entera.
   - Registrarlo en `MODELS` y sumar su miniatura.
   - Prueba manual: la zona queda al lado de la hebilla, sin pisarla ni pisar la costura.
6. **Home y documentación.**
   - En `site.ts`, sumar la categoría «Cuero» con su foto placeholder (en `public/img/placeholder/`, 800 y 1600 px en WebP) y su crédito en `image-credits.json`.
   - En el `README.md`, sumar las medidas, los materiales y el estilo nuevos a «Datos pendientes del negocio», y cambiar la nota de los mates («queda para la SPEC 10») por «no se graba».

---

## Criterios de aceptación

- [ ] El menú de objeto lista dieciséis productos. «Billetera», «Llavero» y «Cinturón» tienen miniatura y nombre.
- [ ] Los tres productos muestran las muestras «Cuero negro», «Cuero marrón» y «Cuero suela». Cambiar el color cambia sólo el cuero; la costura, la argolla y la hebilla no cambian.
- [ ] En los tres productos, el único estilo es «Grabado láser».
- [ ] En las piezas fijas de «Grabado», la billetera dice «Costura: hilo»; el llavero, «Argolla: acero inoxidable · Costura: hilo»; y el cinturón, «Hebilla: acero inoxidable · Costura: hilo».
- [ ] El grabado se ve gris oscuro y mate en el cuero negro, casi negro en el marrón y marrón tostado en la suela, con un relieve leve al girar la pieza bajo la luz.
- [ ] La billetera ofrece «Frente» y «Dorso». El grabado del dorso se lee derecho al girarla.
- [ ] El llavero muestra «Forma» con tres muestras: «Rectángulo», «Redondo» y «Escudo», cada una con su silueta.
- [ ] Elegir otra forma de llavero cambia la silueta en el 3D y la zona en el lienzo, y conserva las capas.
- [ ] En las tres formas del llavero, la argolla pasa por el ojal y la zona no lo pisa.
- [ ] El cinturón muestra la hebilla a la izquierda, tres agujeros a la derecha y la zona «Frente» al lado de la hebilla.
- [ ] En los tres productos, la costura se ve a lo largo del borde y ninguna zona la pisa.
- [ ] Los mates imperial y camionero siguen ofreciendo sólo «Cuero negro» y «Cuero marrón», y sus estilos siguen siendo «Marcado oscuro» y «Esmerilado».
- [ ] El resumen y el pedido dicen el producto, el color del cuero y «Grabado láser».
- [ ] En la home se ve la categoría «Cuero», con foto y crédito, y abre `/custom-lab/?producto=leather-wallet`.
- [ ] `/custom-lab/?producto=leather-keychain` y `?producto=leather-belt` abren el Lab con ese producto.
- [ ] La vista plana de respaldo (sin WebGL) muestra los tres productos nuevos con su material.
- [ ] Ningún diseño por defecto usa nombres que aparecen en las fotos de `assets/examples/`.
- [ ] Un enlace `?d=` copiado antes de esta spec abre el mismo diseño.
- [ ] El `README.md` lista las medidas, los materiales y el estilo nuevos en «Datos pendientes del negocio», y ya no dice que el cuero de los mates queda para la SPEC 10.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** billetera, llavero y cinturón. Lo eligió el usuario.
- **No:** grabar el cuero de los mates en esta spec. El usuario no lo eligió; siguen grabándose en la virola.
- **Sí:** un solo estilo, «Grabado láser», que oscurece y hunde apenas el cuero. Es lo que hace un láser de CO2 en cualquier color de cuero. Lo eligió el usuario.
- **No:** bajorrelieve sin color ni estampado dorado. El dorado es otra máquina y no está confirmado que el taller lo haga.
- **Sí:** el tono de la marca depende del cuero (`MaterialDef.engraveRgb`). Un único color se perdería en el negro o se vería falso en la suela.
- **No:** un estilo por color de cuero. Multiplicaría los estilos para el mismo proceso.
- **Sí:** negro, marrón y suela. Reusa los dos cueros de la SPEC 07 y suma el natural claro. Lo eligió el usuario.
- **No:** más colores por ahora.
- **Sí:** el grabado se ve oscuro y con un relieve leve. Lo eligió el usuario; sin relieve se ve plano.
- **Sí:** la billetera cerrada, con «Frente» y «Dorso». Lo eligió el usuario. Reusa las dos caras de la chapita.
- **No:** la billetera abierta con el interior grabable. La malla es mucho más compleja.
- **Sí:** el llavero con el selector «Forma» (rectángulo, redondo y escudo). Lo eligió el usuario. Reusa las siluetas de la SPEC 07.
- **No:** un llavero de una sola forma, ni cuatro formas.
- **Sí:** el cinturón como un tramo recto de 350 mm con la hebilla, y la zona al lado de la hebilla. Lo eligió el usuario. La zona es plana y la cámara la encuadra entera.
- **No:** el cinturón entero enrollado, ni grabar sólo la punta.
- **Sí:** 35 mm de ancho y hebilla de acero fija. Lo eligió el usuario.
- **No:** elegir el metal de la hebilla. Obligaría a elegir dos materiales en un producto.
- **Sí:** costura visible de hilo crudo, como material fijo. Lo eligió el usuario. Sin costura las piezas se ven genéricas.
- **No:** elegir el color del hilo.
- **Sí:** una categoría nueva, «Cuero», que abre la billetera. Lo eligió el usuario.
- **No:** reusar «Regalos personalizados» ni dejar la home sin cambios.
- **Sí:** medidas estándar provisorias, que van al `README.md` para confirmarlas con el taller.
- **Sí:** mallas procedurales, como las del resto del Lab.
- **No:** modelos GLB.

---

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| El grabado sobre el cuero negro casi no se ve en el 3D. | El tono del negro es un gris oscuro más mate que el cuero, y el relieve marca el borde. Se ajusta `engraveRgb` en la prueba manual del paso 3 hasta que «Andrés» se lea desde la cámara por defecto. |
| El relieve del grabado se pelea con el grano del cuero y se ve sucio. | El look `leather-mark` usa menos `depth` que `carve`. Si se ve sucio, se baja y se anota en la spec. |
| La zona larga del cinturón (200 × 25 mm) queda chica en el 3D o con poca resolución. | `pixelsPerMm` ya limita por el ancho; a 200 mm da resolución de sobra. La zona tiene su `cameraOffset`, que se ajusta en el paso 5. |
| El decal de la billetera o del llavero se proyecta en las dos caras, porque la pieza es fina. | Como en la chapita: cada cara es una zona con su orientación y el decal tiene la profundidad justa. Se verifica girando la pieza. |
| La costura queda debajo de la zona y el diseño se dibuja encima. | Las zonas se definen a 4 mm o más del borde de la costura. El test de `stitch.ts` fija la distancia. |
| Muchas puntadas como mallas separadas hacen lenta la escena. | `stitch.ts` arma todas las puntadas de una pieza en una sola geometría (o una `InstancedMesh`). |
| No hay una foto de Wikimedia Commons de cuero grabado con licencia libre. | Se usa una foto de artículos de cuero sin grabar, con licencia CC, y se marca como ilustrativa. |

---

## Lo que **no** entra en esta spec

- Grabar el cuero de los mates.
- Otros productos de cuero.
- La billetera abierta y su interior.
- El cinturón entero o su punta.
- Bajorrelieve sin color o estampado dorado.
- Más colores de cuero o de hilo.
- Elegir el metal de la hebilla o de la argolla.
- Varios anchos o tamaños.
- Una foto propia para «Cuero».
- Modelos GLB.

Cada uno de esos puntos, si se hace, va en su propia spec.

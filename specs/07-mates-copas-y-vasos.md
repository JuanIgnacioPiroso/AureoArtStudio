# SPEC 07 — Mates, copas y vasos en el Custom Lab

> **Estado:** Aprobado
> **Depende de:** SPEC 03, SPEC 06
> **Fecha:** 2026-10-24
> **Objetivo:** Sumar al Custom Lab tres mates (madera, calabaza y acero) con frente y vuelta completa, y un producto «Copas y vasos» de vidrio con cuatro formas grabables en el frente.

---

## Por qué esta spec

Es la segunda parte del pedido que se dividió en la SPEC 06: «copas de vidrio, mates, elementos de cuero». La SPEC 06 sumó placas, chapitas y el trofeo. Esta suma los mates y el vidrio. El cuero pasa a la **SPEC 08**.

Se apoya en lo que ya existe:

- **La vuelta completa de los termos (SPEC 03):** una tira que rodea un cuerpo cilíndrico (`WrapDef`, `EngravingWrap`). Los mates la reusan.
- **El selector «Forma» (SPEC 06):** un producto con varias siluetas, cada una con su zona. Las copas y vasos lo reusan.
- **El vidrio (SPEC 06):** material `glass` transparente, estilo «Grabado esmerilado» y fondo claro del 3D. Las copas lo reusan con un material propio, «Vidrio transparente».

La spec es grande (siete piezas). El usuario eligió no dividirla.

---

## Alcance

**Entra:**

- **Materiales nuevos:**
  - «Calabaza» (`gourd`): tipo madera (`kind: 'wood'`), así que se graba con «Quemado láser». Textura nueva (`gourd`): tono ocre con manchas suaves, sin veta.
  - «Alpaca» (`alpaca`): metal plateado apenas cálido (`kind: 'steel'`), fijo para la virola de la calabaza.
  - «Vidrio transparente» (`glass-clear`): tipo `glass`, con la textura `clear` y el estilo «Grabado esmerilado». Se ve como el acrílico del trofeo, pero el resumen y el pedido dicen «vidrio».
- **Mate de madera** (`mate-wood`, modelo `mate-wood-v1`):
  - torneado de una pieza, Ø 75 × 95 mm, con la boca apenas abierta;
  - en «Madera clara» o «Madera oscura», con «Quemado láser»;
  - zonas «Frente», de 40 × 30 mm, y «Vuelta completa», una tira de 210 × 30 mm.
- **Mate de calabaza** (`mate-gourd`, modelo `mate-gourd-v1`):
  - calabaza de Ø 85 × 95 mm, con una virola de alpaca de 12 mm en la boca, fija;
  - sólo en «Calabaza», con «Quemado láser»;
  - zonas «Frente», de 40 × 30 mm, y «Vuelta completa», una franja de 230 × 30 mm en la parte más ancha;
  - en esa franja, la malla de la calabaza es recta (cilíndrica), para que la tira no flote ni se hunda.
- **Mate de acero** (`mate-steel`, modelo `mate-steel-v1`):
  - doble pared, Ø 85 × 100 mm;
  - en «Acero inoxidable» o «Negro mate», con los estilos de los termos;
  - zonas «Frente», de 40 × 30 mm, y «Vuelta completa», una tira de 230 × 30 mm.
- **En los tres mates:**
  - se muestran vacíos, sin yerba ni bombilla, y se ve el interior;
  - la vuelta completa se centra en el frente; la franja sin grabar queda atrás (25,6 mm en el de madera, 37 mm en los otros dos);
  - el frente y la vuelta se superponen, como en los termos: al cambiar de zona, el diseño sigue en el frente.
- **Copas y vasos** (`glassware`, modelo `glassware-v1`):
  - un solo producto, en «Vidrio transparente», con el selector «Forma»;
  - **cuatro formas:**
    - «Copa de vino»: 210 mm de alto, cáliz de Ø 85 mm, tallo y pie;
    - «Copa de champagne»: 230 mm de alto, cáliz angosto de Ø 70 mm;
    - «Vaso de whisky»: Ø 80 × 95 mm, de fondo grueso;
    - «Jarro de cerveza»: Ø 85 × 150 mm, con asa al costado (a 90° del frente);
  - una zona por forma, «Frente»: 50 × 40 mm en las copas, en la parte casi cilíndrica del cáliz; 60 × 50 mm en el vaso y el jarro;
  - el vidrio es hueco: se ve la pared de atrás a través de la de adelante;
  - el grabado se proyecta sólo sobre la cara de afuera de la pared de adelante.
- **Las siluetas de «Forma» salen del producto:** el selector deja de usar siempre las del trofeo. Cada producto con formas tiene sus siluetas.
- **Un diseño por defecto para cada producto**, con nombres inventados.
- **Las miniaturas SVG de los cuatro productos** en el menú de objeto.
- **En la home:**
  - una categoría nueva, «Copas y vasos», que abre `/custom-lab/?producto=glassware`, con una foto placeholder de Wikimedia Commons y su crédito;
  - la descripción de «Termos y mates» menciona los mates; sigue abriendo el termo con manija.
- **En el `README.md`:** las medidas y los materiales nuevos van a «Datos pendientes del negocio», como valores a confirmar con el taller.

**Queda fuera (para otras specs):**

- **Elementos de cuero:** van en la SPEC 08.
- **Mate de vidrio, mate imperial y otros mates:** sólo los tres de esta spec.
- **Yerba y bombilla en el 3D.**
- **Grabado alrededor de las copas y vasos:** sólo el frente. El cáliz se angosta y la tira cilíndrica no apoya bien.
- **Grabado en el pie de las copas** o en el fondo del vaso.
- **Una vuelta completa que siga la curva de la calabaza:** la franja es recta.
- **Más tamaños** de cada pieza.
- **Otros colores de vidrio** o vidrio esmerilado entero.
- **Una foto propia** para «Copas y vasos»: queda el placeholder hasta que el negocio tenga una.
- **Modelos GLB:** las mallas son procedurales.

---

## Modelo de datos

Los cambios son aditivos. Un enlace `?d=` copiado antes de esta spec abre el mismo diseño.

```ts
// src/lab/model/types.ts
// MaterialDef.texture
texture: 'wood-grain' | 'brushed' | 'matte' | 'marble' | 'clear' | 'gourd'

// ProductDef.modelId (suma)
| 'mate-wood-v1' | 'mate-gourd-v1' | 'mate-steel-v1' | 'glassware-v1'
```

Materiales nuevos (`MATERIALS`):

| id            | Nombre                | `kind`  | `texture` | Se usa en                      |
| ------------- | --------------------- | ------- | --------- | ------------------------------ |
| `gourd`       | «Calabaza»            | `wood`  | `gourd`   | mate de calabaza (única opción) |
| `alpaca`      | «Alpaca»              | `steel` | `brushed` | fijo: virola de la calabaza    |
| `glass-clear` | «Vidrio transparente» | `glass` | `clear`   | copas y vasos (única opción)   |

No hay estilos de grabado nuevos: la calabaza usa `burn` y el vidrio usa `etch`.

Productos nuevos (`PRODUCTS`):

| id           | Nombre             | Partes (material)                                    | Materiales                 | Zonas (mm)                                         |
| ------------ | ------------------ | ---------------------------------------------------- | -------------------------- | -------------------------------------------------- |
| `mate-wood`  | «Mate de madera»   | `body` (elegible)                                    | `wood-light`, `wood-dark`  | `front` 40 × 30 · `wrap` 210 × 30 (Ø 75)           |
| `mate-gourd` | «Mate de calabaza» | `body` (elegible), `rim` «Virola» (`alpaca`)         | `gourd`                    | `front` 40 × 30 · `wrap` 230 × 30 (Ø 85)           |
| `mate-steel` | «Mate de acero»    | `body` (elegible)                                    | `steel`, `black-matte`     | `front` 40 × 30 · `wrap` 230 × 30 (Ø 85)           |
| `glassware`  | «Copas y vasos»    | `glass` (elegible; el asa del jarro usa el mismo material) | `glass-clear`        | `front`, una por forma                              |

Vuelta completa de los mates (`WrapDef`): centrada en el frente.

```ts
// El frente está en -Y local (ángulo -π/2), como en los termos.
wrap: { radiusMm: 37.5 /* o 42.5 */, centerAngle: -Math.PI / 2, frontOffsetMm: 0 }
```

Formas de `glassware` (`shapes`), en este orden:

| id       | Nombre               | Zona «Frente» |
| -------- | -------------------- | ------------- |
| `wine`   | «Copa de vino»       | 50 × 40 mm    |
| `flute`  | «Copa de champagne»  | 50 × 40 mm    |
| `whisky` | «Vaso de whisky»     | 60 × 50 mm    |
| `mug`    | «Jarro de cerveza»   | 60 × 50 mm    |

Diseños por defecto:

| Producto     | Material, estilo y zona          | Capas                                    |
| ------------ | -------------------------------- | ---------------------------------------- |
| `mate-wood`  | `wood-light`, `burn`, `front`    | «Lucía»                                  |
| `mate-gourd` | `gourd`, `burn`, `front`         | «Joaquín»                                |
| `mate-steel` | `steel`, `mark-dark`, `front`    | «Pablo»                                  |
| `glassware`  | `glass-clear`, `etch`, `front`   | «Sofía & Martín» / «12 · 10 · 2026»      |

Siluetas de «Forma» (`src/lab/viewer/meshes/silhouettes.ts`, nuevo):

```ts
/** Silueta (contorno 2D, y hacia arriba) de cada forma, por modelo. La usa el selector «Forma». */
export const SILHOUETTES: Partial<Record<ProductDef['modelId'], (shapeId: string) => THREE.Vector2[]>>
// 'trophy-v1' → trophyShape(id).getPoints(…)
// 'glassware-v1' → el perfil de torno de la forma, espejado
```

Archivos nuevos:

- `src/lab/viewer/meshes/MateWood.tsx`, `MateGourd.tsx`, `MateSteel.tsx` y `Glassware.tsx`.
- `src/lab/viewer/meshes/glasswareProfiles.ts`: los perfiles de torno de las cuatro formas. Los usan la malla y las siluetas.
- `src/lab/viewer/meshes/silhouettes.ts`.

Categoría nueva (`src/content/site.ts`):

```ts
{ id: 'copas', name: 'Copas y vasos', description: …, image: IMAGES.glass, labProductId: 'glassware', enabled: true }
```

---

## Plan de implementación

1. **Agregar los materiales.**
   - En `types.ts`, sumar la textura `gourd`.
   - En `catalog.ts`, sumar `gourd`, `alpaca` y `glass-clear`.
   - En `surfaceTextures.ts`, agregar la textura `gourd`: tono ocre con manchas suaves, generada en un canvas.
   - En `PartMaterial.tsx`, dibujar `gourd` con su mapa de color; `glass-clear` usa la rama `clear` que ya existe.
   - Test en `constraints.test.ts`: `stylesForSurface` devuelve sólo `burn` para calabaza y sólo `etch` para vidrio.
   - Ningún producto los usa todavía.
2. **Mate de acero.**
   - Sumar `mate-steel` en `PRODUCTS`, con frente y vuelta completa.
   - Crear `MateSteel.tsx` con un perfil de torno (pared doble, borde redondeado en la boca) y `registerPart` en `body`. La banda de la vuelta es recta.
   - Registrarlo en `MODELS` y sumar su miniatura.
   - Prueba manual: cambiar entre «Frente» y «Vuelta completa»; el diseño sigue en el frente y la tira se ve pegada al cuerpo.
3. **Mate de madera.**
   - Sumar `mate-wood` y crear `MateWood.tsx`, con la boca apenas abierta y la banda de la vuelta recta.
   - Registrarlo y sumar su miniatura.
   - Prueba manual: la veta de la madera se ve sin costura en el frente.
4. **Mate de calabaza.**
   - Sumar `mate-gourd` y crear `MateGourd.tsx`: calabaza con la franja recta en la parte más ancha y la virola de alpaca en la boca.
   - Registrarlo y sumar su miniatura.
   - Prueba manual: la tira de la vuelta completa no flota ni se hunde en ningún borde.
5. **Siluetas por producto, sin cambio visible.**
   - Crear `silhouettes.ts` con la entrada del trofeo.
   - `ShapeSelector.tsx` toma la silueta de `SILHOUETTES[product.modelId]` en vez de `trophyShape`.
   - Prueba manual: las muestras del trofeo se ven igual que antes.
6. **Copas y vasos.**
   - Crear `glasswareProfiles.ts` con los cuatro perfiles y `Glassware.tsx`:
     - el vidrio hueco, con pared y fondo;
     - el asa del jarro, al costado;
     - la cara de afuera de la pared en una malla aparte, registrada como `glass`, para que el decal no se proyecte en la cara de adentro.
   - Sumar `glassware` en `PRODUCTS` con sus cuatro formas y una zona por forma, y su entrada en `SILHOUETTES`.
   - Registrarlo en `MODELS` y sumar su miniatura.
   - Test en `src/lab/viewer/__tests__/glassware.test.ts`: en cada forma, la zona queda dentro de la parte del perfil donde el radio varía menos de 3 mm.
   - Prueba manual: cada forma se ve transparente sobre el fondo claro, con el grabado blanco sólo en la cara de adelante.
7. **Home y documentación.**
   - En `site.ts`, sumar la categoría «Copas y vasos» con su foto placeholder (en `public/img/placeholder/`, 800 y 1600 px en WebP) y su crédito en `image-credits.json`.
   - Cambiar la descripción de «Termos y mates» para que mencione los mates.
   - En el `README.md`, sumar las medidas y los materiales a «Datos pendientes del negocio».

---

## Criterios de aceptación

- [ ] El menú de objeto lista doce productos. Los cuatro nuevos tienen miniatura y nombre.
- [ ] «Mate de madera» muestra las muestras «Madera clara» y «Madera oscura», y el estilo «Quemado láser».
- [ ] «Mate de calabaza» muestra una sola muestra, «Calabaza», y una virola plateada en la boca. Las piezas fijas en «Grabado» dicen «Virola: alpaca».
- [ ] «Mate de acero» muestra «Acero inoxidable» y «Negro mate». Con negro mate, el único estilo es «Grabado a metal».
- [ ] Los tres mates ofrecen las zonas «Frente» y «Vuelta completa».
- [ ] En cada mate, pasar de «Frente» a «Vuelta completa» deja el diseño en el frente, y la franja sin grabar queda atrás.
- [ ] En la calabaza, la tira de la vuelta completa queda pegada al cuerpo en toda su altura, sin hueco ni partes hundidas.
- [ ] Los mates se ven vacíos, sin yerba ni bombilla, y se ve el interior.
- [ ] «Copas y vasos» muestra «Forma» con cuatro muestras: «Copa de vino», «Copa de champagne», «Vaso de whisky» y «Jarro de cerveza», cada una con su silueta.
- [ ] Las muestras de «Forma» del trofeo se ven igual que antes de esta spec.
- [ ] Con «Copas y vasos», el fondo del 3D es claro, el vidrio se ve transparente y hueco, y el grabado se ve blanco.
- [ ] El grabado de las copas y vasos se ve sólo en la cara de adelante: no aparece repetido en la pared de adentro ni en la de atrás.
- [ ] En el jarro, el asa queda al costado y no tapa el frente.
- [ ] Elegir otra forma cambia la silueta en el 3D y la zona en el lienzo, y conserva las capas.
- [ ] El resumen y el pedido de las copas dicen «vidrio transparente».
- [ ] En la home se ve la categoría «Copas y vasos», con foto y crédito, y abre `/custom-lab/?producto=glassware`.
- [ ] La descripción de «Termos y mates» menciona los mates, y la categoría sigue abriendo el termo con manija.
- [ ] `/custom-lab/?producto=mate-wood`, `mate-gourd` y `mate-steel` abren el Lab con ese producto.
- [ ] La vista plana de respaldo (sin WebGL) muestra los cuatro productos nuevos con su material.
- [ ] Ningún diseño por defecto usa nombres que aparecen en las fotos de `assets/examples/`.
- [ ] Un enlace `?d=` copiado antes de esta spec abre el mismo diseño.
- [ ] El `README.md` lista las medidas y los materiales nuevos en «Datos pendientes del negocio».
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** mates y vidrio en una sola spec. Lo eligió el usuario.
- **No:** dividir en mates (07) y vidrio (08).
- **Sí:** el cuero pasa a la SPEC 08.
- **Sí:** tres mates: madera, calabaza y acero. Lo eligió el usuario.
- **No:** mate de vidrio ni mate imperial.
- **Sí:** cada mate es un producto. Tienen materiales y estilos distintos, y «Forma» sólo cambia la silueta.
- **No:** un «Mate» con formas. Obligaría a que cada forma tenga sus propios materiales.
- **Sí:** los mates tienen «Frente» y «Vuelta completa», como los termos. Reusa la tira de la SPEC 03.
- **Sí:** la vuelta completa se centra en el frente, con la franja sin grabar atrás. Los mates no tienen manija que marque el corte.
- **No:** una vuelta sin corte. El diseño podría quedar partido en la unión.
- **Sí:** en la calabaza, una franja de 30 mm en la parte más ancha, con la malla recta en esa franja. La tira es un cilindro y la calabaza es redonda: sin la franja recta, la tira flota o se hunde en los bordes.
- **No:** una vuelta alta en la calabaza, que se deformaría cerca de la boca y la base.
- **No:** una tira que siga la curva de la calabaza. Cambiaría `EngravingWrap` para un solo producto.
- **Sí:** «Calabaza» es de tipo madera, así que usa «Quemado láser». Así se graba en el taller.
- **Sí:** la virola es de «Alpaca», un material fijo nuevo. Es la terminación habitual del mate argentino.
- **No:** reusar el acero para la virola, ni dejar la calabaza sin virola.
- **Sí:** el mate de madera en madera clara u oscura y el de acero en acero o negro mate, como la tabla y los termos. No hacen falta materiales nuevos.
- **Sí:** los mates vacíos, sin yerba ni bombilla. La bombilla no se graba y taparía la vuelta completa al girar.
- **Sí:** las piezas de vidrio son un solo producto, «Copas y vasos», con el selector «Forma». Comparten material y estilo, y el menú de objeto no crece de a cuatro.
- **No:** un producto por pieza, ni dos productos («Copas» y «Vasos y jarros»).
- **Sí:** las copas y vasos se graban sólo en el frente. Es lo habitual (nombres, fechas de casamiento) y el cáliz se angosta.
- **No:** vuelta completa en las copas, ni grabado en el pie.
- **Sí:** un material propio, «Vidrio transparente», del mismo tipo que el acrílico. El resumen y el pedido tienen que decir «vidrio».
- **No:** reusar «Acrílico transparente» en las copas.
- **Sí:** las siluetas de «Forma» salen de cada producto (`SILHOUETTES`). Hasta ahora el selector usaba siempre las del trofeo.
- **Sí:** el decal de las copas se proyecta sólo sobre la cara de afuera de la pared de adelante, registrada como una malla aparte. Un vidrio hueco tiene cuatro caras en la caja del decal.
- **Sí:** una categoría nueva, «Copas y vasos», con foto placeholder. Lo eligió el usuario.
- **No:** reusar «Regalos personalizados» ni dejar la home sin cambios.
- **Sí:** «Termos y mates» sigue abriendo el termo con manija, y su descripción suma los mates.
- **Sí:** medidas estándar provisorias, que van al `README.md` para confirmarlas con el taller.
- **Sí:** mallas procedurales de torno, como las de los termos.
- **No:** modelos GLB.

---

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| La caja del decal de las copas toca la cara de adentro de la pared o la pared de atrás, y el grabado aparece repetido y espejado. | El decal se proyecta sólo sobre la malla de la cara de afuera (`registerPart('glass', …)`). La pared de adentro y el resto del vidrio son otras mallas. Se verifica girando la copa. |
| El vidrio hueco con transmisión se ve mal: la pared de atrás desaparece o se ve negra. | Cada pared tiene espesor real (2 mm) y la transmisión usa `thickness`. Si una forma se ve mal, se baja la transmisión para el vidrio y se anota en la spec. |
| Varias piezas transparentes (copa, asa del jarro) hacen lenta la escena en celulares. | Es una sola copa por escena. Si a 390 × 844 baja de 30 cuadros por segundo, se aplica la misma salida que en la SPEC 06 (material estándar con opacidad en pantallas angostas). |
| En la calabaza, la franja recta se nota como un corte en la silueta. | La franja se une al resto del perfil con curvas suaves. Se compara con una foto de referencia de mate de calabaza. |
| La vuelta completa centrada en el frente (`frontOffsetMm: 0`) se comporta distinto que en los termos al pasar entre zonas. | `transferElements` ya usa `frontOffsetMm`; con 0, no corre el diseño. Se prueba el paso de frente a vuelta y de vuelta a frente en los tres mates. |
| El texto de una zona de 40 × 30 mm queda muy chico en el 3D. | Cada zona tiene su `cameraOffset`, que se ajusta en la prueba manual de cada mate. |
| No hay una foto de Wikimedia Commons de copas grabadas con licencia libre. | Se usa una foto de copas sin grabar, con licencia CC, y se marca como ilustrativa. |

---

## Lo que **no** entra en esta spec

- Elementos de cuero (SPEC 08).
- Mate de vidrio, mate imperial y otros mates.
- Yerba y bombilla en el 3D.
- Grabado alrededor de las copas y vasos, o en su pie o fondo.
- Una vuelta completa que siga la curva de la calabaza.
- Más tamaños de cada pieza.
- Otros colores de vidrio.
- Una foto propia para «Copas y vasos».
- Modelos GLB.

Cada uno de esos puntos, si se hace, va en su propia spec.

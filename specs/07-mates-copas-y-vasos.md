# SPEC 07 — Mates, copas y vasos en el Custom Lab

> **Estado:** Implementado
> **Depende de:** SPEC 03, SPEC 06
> **Fecha:** 2026-10-24
> **Objetivo:** Sumar al Custom Lab cuatro mates (madera y acero, grabados en el cuerpo; imperial y camionero, grabados en la virola) y un producto «Copas y vasos» de vidrio con cuatro formas grabables en el frente.

---

## Por qué esta spec

Es la segunda parte del pedido que se dividió en la SPEC 06: «copas de vidrio, mates, elementos de cuero». La SPEC 06 sumó placas, chapitas y el trofeo. Esta suma los mates y el vidrio. El cuero pasa a la **SPEC 10**.

Se apoya en lo que ya existe:

- **La vuelta completa de los termos (SPEC 03):** una tira que rodea un cuerpo cilíndrico (`WrapDef`, `EngravingWrap`). Los mates la reusan.
- **El selector «Forma» (SPEC 06):** un producto con varias siluetas, cada una con su zona. Las copas y vasos lo reusan.
- **El vidrio (SPEC 06):** material `glass` transparente, estilo «Grabado esmerilado» y fondo claro del 3D. Las copas lo reusan con un material propio, «Vidrio transparente».

La spec es grande. El usuario eligió no dividirla.

**Cambio durante la implementación:** el usuario pidió reemplazar el mate de calabaza (ya implementado en el paso 4) por un mate imperial y un mate camionero, y dejó dos fotos de referencia en `assets/examples/` («Mate imperial.webp» y «mate camionero grabado.jpg»). En los dos, el cuerpo está forrado en cuero y lo que se graba es la **virola**: el anillo plano de arriba y la banda del costado. Eso trae un tipo de zona nueva (un anillo) y el cuero como material de aspecto, sin grabado. Los pasos 8 a 12 del plan hacen ese cambio.

---

## Alcance

**Entra:**

- **Materiales nuevos:**
  - «Calabaza» (`gourd`): tipo madera, con una textura nueva (`gourd`), ocre con manchas suaves. Queda fija para el interior del imperial y del camionero, que se ve por la boca.
  - «Alpaca» (`alpaca`): metal plateado apenas cálido (`kind: 'steel'`), fijo para las virolas. Se graba con «Marcado oscuro» o «Esmerilado».
  - «Cuero negro» (`leather-black`) y «Cuero marrón» (`leather-brown`): un tipo de material nuevo (`leather`) con una textura nueva de grano fino (`leather`). Son de aspecto: en esta spec el cuero no se graba.
  - «Vidrio transparente» (`glass-clear`): tipo `glass`, con la textura `clear` y el estilo «Grabado esmerilado». Se ve como el acrílico del trofeo, pero el resumen y el pedido dicen «vidrio».
- **Mate de madera** (`mate-wood`, modelo `mate-wood-v1`):
  - torneado de una pieza, Ø 75 × 95 mm, con la boca apenas abierta;
  - en «Madera clara» o «Madera oscura», con «Quemado láser»;
  - zonas «Frente», de 40 × 30 mm, y «Vuelta completa», una tira de 210 × 30 mm.
- **Mate camionero** (`mate-camionero`, modelo `mate-camionero-v1`), según «mate camionero grabado.jpg»:
  - cuerpo de cuero de Ø 90 × 105 mm, con la base fruncida;
  - virola de alpaca ancha: Ø 78 mm por fuera, boca de Ø 52 mm (un anillo de 13 mm) y 12 mm de alto;
  - el interior es de calabaza;
  - se elige el color del cuero: «Cuero negro» o «Cuero marrón»;
  - zonas sobre la virola: «Boca», el anillo plano de arriba (zona de 78 × 78 mm con guías de anillo), y «Virola», la banda del costado (vuelta completa de 220 × 8 mm).
- **Mate imperial** (`mate-imperial`, modelo `mate-imperial-v1`), según «Mate imperial.webp» y «Mate imperial 2.webp»:
  - cuerpo de cuero de Ø 85 mm con forma de huevo (la parte ancha arriba), levantado sobre tres patas de cuero que bajan pegadas a la panza y terminan en una pisada plana; 115 mm de alto en total;
  - virola de alpaca casi tan ancha como el cuerpo: una banda lisa de Ø 83 × 16 mm y arriba un labio que sobresale, con la cara plana de Ø 88 por fuera y boca de Ø 64 (un anillo de 12 mm);
  - el interior es de calabaza;
  - se elige el color del cuero, como en el camionero;
  - zonas sobre la virola: «Boca» (88 × 88 mm con guías de anillo) y «Virola» (vuelta completa de 230 × 12 mm).
  - Las medidas se cambiaron durante la implementación (antes: virola de Ø 68 / Ø 46 × 25 mm), según la segunda foto de referencia.
- **Zona anular «Boca»:**
  - es una zona plana y cuadrada, del diámetro de afuera de la virola, que mira hacia arriba; el texto se lee derecho mirando el mate de frente;
  - en el lienzo se ven el borde de afuera del anillo y la boca (el agujero, sombreado);
  - el texto se curva con el control de curva que ya existe;
  - en la pestaña «Capa», un aviso marca si parte del diseño cae en la boca o fuera del anillo: «Parte del diseño cae en la boca o fuera de la virola: eso no se graba». Se calcula con el dibujo real del grabado, así el texto curvo no da falsos avisos;
  - la plantilla «Sello», en una zona con anillo, pone los textos curvos sobre el anillo, con un círculo fino en cada borde, y no pone el monograma del centro;
  - al pasar de «Boca» a «Virola», los textos curvos se enderezan, se ponen en fila en el frente y se achican para entrar en el alto de la banda; al volver a «Boca» sin haber cambiado nada, vuelve el diseño curvo que había (decidido durante la implementación);
  - el diseño por defecto (un texto curvo arriba y el año curvo abajo) se arma con la tipografía ya cargada: mientras el usuario no lo cambie, se vuelve a armar cuando termina de cargar una fuente, así no se corre ni se sale del anillo (decidido durante la implementación).
- **Mate de acero** (`mate-steel`, modelo `mate-steel-v1`):
  - doble pared, Ø 85 × 100 mm;
  - en «Acero inoxidable» o «Negro mate», con los estilos de los termos;
  - zonas «Frente», de 40 × 30 mm, y «Vuelta completa», una tira de 230 × 30 mm.
- **En los cuatro mates:**
  - se muestran vacíos, sin yerba ni bombilla, y se ve el interior;
  - la vuelta completa (del cuerpo en el de madera y el de acero, de la virola en el imperial y el camionero) se centra en el frente y la franja sin grabar queda atrás;
  - el frente y la vuelta se superponen, como en los termos: al cambiar de zona, el diseño sigue en el frente;
  - en el lienzo, las guías de la vuelta completa dicen «Frente» en el centro, «Costado» a un cuarto de vuelta de cada lado y «Atrás» en los bordes, en lugar de «Manija» (agregado durante la implementación). Las guías de los termos no cambian.
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
- **Las miniaturas SVG de los cinco productos** en el menú de objeto.
- **En la home:**
  - una categoría nueva, «Copas y vasos», que abre `/custom-lab/?producto=glassware`, con una foto placeholder de Wikimedia Commons y su crédito;
  - la descripción de «Termos y mates» menciona los mates; sigue abriendo el termo con manija.
- **En el `README.md`:** las medidas y los materiales nuevos van a «Datos pendientes del negocio», como valores a confirmar con el taller.

**Queda fuera (para otras specs):**

- **Grabar el cuero** (del imperial, del camionero y otros elementos de cuero): va en la SPEC 10.
- **El mate de calabaza natural:** se reemplazó por el imperial y el camionero.
- **Mate de vidrio y otros mates.**
- **El cincelado de la virola del imperial** (la guarda de la foto): la virola es lisa.
- **Un editor polar** que muestre el anillo «desenrollado» como una tira.
- **Yerba y bombilla en el 3D.**
- **Grabado alrededor de las copas y vasos:** sólo el frente. El cáliz se angosta y la tira cilíndrica no apoya bien.
- **Grabado en el pie de las copas** o en el fondo del vaso.
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
texture: 'wood-grain' | 'brushed' | 'matte' | 'marble' | 'clear' | 'gourd' | 'leather'

// MaterialKind (suma)
| 'leather'

// ProductDef.modelId (suma)
| 'mate-wood-v1' | 'mate-imperial-v1' | 'mate-camionero-v1' | 'mate-steel-v1' | 'glassware-v1'

// SurfaceDef (campo nuevo, opcional)
/** Zona plana con forma de anillo (la boca de una virola): diámetros de afuera y de la boca, en mm. */
ring?: { outerMm: number; innerMm: number }
```

```ts
// src/lab/model/types.ts — ProductDef (campo nuevo, opcional)
/** Textos del diseño por defecto en una zona con anillo: se arman curvos al crear el diseño. */
ringTexts?: { top: string; bottom: string }

// src/lab/editor/presets.ts
/** Dos textos curvos centrados en el ancho del anillo: uno arriba y otro abajo. Los usan «Sello» y el diseño por defecto. */
export function ringTextElements(top: string, bottom: string, ring: RingDef, measure: MeasureText, ids?: [string, string]): TextElement[]

// src/lab/store.ts
// defaultDesign(productId) arma los textos curvos con measureTextMm si el producto tiene ringTexts.
// El store guarda el diseño por defecto mientras no se toca (pristine) y, en fontsLoaded(), si el
// diseño sigue igual, lo vuelve a armar con la medida real, sin sumar un paso al historial.
```

```ts
// src/lab/model/constraints.ts
/** De un anillo a una banda: endereza los textos, los pone en fila centrados en el frente y los achica para que entren. */
export function straightenForBand(elements: readonly DesignElement[], from: SurfaceDef, to: SurfaceDef, measure: MeasureText): DesignElement[]
// En el store, setSurface lo usa al pasar de una zona con anillo a otra sin anillo, y guarda las
// capas de antes: si se vuelve al anillo sin cambios, las restaura.

// src/lab/render/ringCheck.ts (nuevo)
/** ¿El punto (mm desde el centro de la zona) cae sobre el anillo? */
export function onRing(xMm: number, yMm: number, ring: { outerMm: number; innerMm: number }): boolean
/** ¿Parte del grabado cae en la boca o fuera del anillo? Mira los píxeles del dibujo (drawDesignMask). */
export function ringOverflow(design: DesignState, surface: SurfaceDef): boolean
```

Materiales nuevos (`MATERIALS`):

| id            | Nombre                | `kind`  | `texture` | Se usa en                      |
| ------------- | --------------------- | ------- | --------- | ------------------------------ |
| `gourd`         | «Calabaza»            | `wood`    | `gourd`   | fijo: interior del imperial y del camionero |
| `alpaca`        | «Alpaca»              | `steel`   | `brushed` | fijo: virolas (se graba)                    |
| `leather-black` | «Cuero negro»         | `leather` | `leather` | cuerpo del imperial y del camionero         |
| `leather-brown` | «Cuero marrón»        | `leather` | `leather` | cuerpo del imperial y del camionero         |
| `glass-clear`   | «Vidrio transparente» | `glass`   | `clear`   | copas y vasos (única opción)                |

No hay estilos de grabado nuevos: la virola usa los del acero, el vidrio usa `etch` y el cuero no tiene estilos todavía (la SPEC 10 los suma).

Productos nuevos (`PRODUCTS`):

| id           | Nombre             | Partes (material)                                    | Materiales                 | Zonas (mm)                                         |
| ------------ | ------------------ | ---------------------------------------------------- | -------------------------- | -------------------------------------------------- |
| `mate-wood`  | «Mate de madera»   | `body` (elegible)                                    | `wood-light`, `wood-dark`  | `front` 40 × 30 · `wrap` 210 × 30 (Ø 75)           |
| `mate-camionero` | «Mate camionero» | `body` «Cuero» (elegible), `rim` «Virola» (`alpaca`), `inside` «Interior» (`gourd`) | `leather-black`, `leather-brown` | `mouth` «Boca» 78 × 78 (anillo Ø 78 / Ø 52) · `wrap` «Virola» 220 × 8 (Ø 78) |
| `mate-imperial`  | «Mate imperial»  | `body` «Cuero» (elegible), `rim` «Virola» (`alpaca`), `inside` «Interior» (`gourd`) | `leather-black`, `leather-brown` | `mouth` «Boca» 88 × 88 (anillo Ø 88 / Ø 64) · `wrap` «Virola» 230 × 12 (Ø 83) |
| `mate-steel` | «Mate de acero»    | `body` (elegible)                                    | `steel`, `black-matte`     | `front` 40 × 30 · `wrap` 230 × 30 (Ø 85)           |
| `glassware`  | «Copas y vasos»    | `glass` (elegible; el asa del jarro usa el mismo material) | `glass-clear`        | `front`, una por forma                              |

Vuelta completa de los mates (`WrapDef`): centrada en el frente.

```ts
// El frente está en -Y local (ángulo -π/2), como en los termos.
wrap: { radiusMm: 37.5 /* o 42.5 */, centerAngle: -Math.PI / 2, frontOffsetMm: 0, edge: 'back' }

// src/lab/model/types.ts — WrapDef (campo nuevo, opcional)
/** Qué hay en los bordes de la tira: la manija (termos, por defecto) o la parte de atrás (mates). */
edge?: 'handle' | 'back'
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
| `mate-camionero` | `leather-black`, `mark-dark`, `mouth` | un texto curvo arriba del anillo («Mateando juntos») y el año curvo abajo («2026») |
| `mate-imperial`  | `leather-black`, `mark-dark`, `mouth` | un nombre curvo arriba del anillo («Familia Gómez») y el año curvo abajo («2026») |
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

- `src/lab/viewer/meshes/MateWood.tsx`, `MateSteel.tsx`, `MateCamionero.tsx`, `MateImperial.tsx` y `Glassware.tsx`.
- `src/lab/render/ringCheck.ts`.
- Se borra `src/lab/viewer/meshes/MateGourd.tsx` (paso 4, reemplazado).
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
4. **Mate de calabaza** (reemplazado en el paso 8).
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
8. **Quitar el mate de calabaza y sumar el cuero** (cambio durante la implementación).
   - Borrar el producto `mate-gourd`, `MateGourd.tsx`, su miniatura y su entrada en `MODELS`. El material «Calabaza» queda como interior fijo.
   - Sumar el tipo `leather`, la textura `leather` (grano fino en el relieve, mate) y los materiales «Cuero negro» y «Cuero marrón».
   - Ningún producto usa el cuero todavía.
9. **Zona anular «Boca».**
   - Agregar `SurfaceDef.ring` y `ringCheck.ts`.
   - En `DesignCanvas.tsx`, dibujar las guías del anillo: el borde de afuera y la boca sombreada. Son sólo del editor, como las de la vuelta completa.
   - En la pestaña «Capa», mostrar el aviso cuando `ringOverflow` da verdadero.
   - En `presets.ts`, adaptar «Sello» a las zonas con anillo.
   - Tests: `onRing` (adentro del anillo, en la boca y afuera); «Sello» en una zona con anillo no crea el monograma del centro y sus textos quedan sobre el anillo.
   - Ningún producto tiene anillo todavía.
10. **Mate camionero.**
    - Crear `MateCamionero.tsx`: cuerpo de cuero con la base fruncida, interior de calabaza y virola ancha con la cara de arriba plana. Se registran la virola (`rim`) y el cuerpo (`body`).
    - Sumar `mate-camionero` en `PRODUCTS`, con «Boca» y «Virola», registrarlo en `MODELS` y sumar su miniatura.
    - Sumar `ProductDef.ringTexts`, `ringTextElements` y el rearmado del diseño por defecto en el store.
    - Test en `store.test.ts`: con el diseño intacto, `fontsLoaded()` lo rearma sin sumar un paso al historial; con una capa cambiada, no lo toca.
    - Sumar `straightenForBand` y su uso en `setSurface`. Tests: los textos quedan rectos, en fila y dentro de la banda; volver al anillo sin cambios restaura las capas curvas.
    - Prueba manual: el diseño por defecto se ve sobre el anillo, legible desde el frente; poner un texto en el centro muestra el aviso.
11. **Mate imperial.**
    - Crear `MateImperial.tsx`: cuerpo de cuero sobre tres patas, interior de calabaza y virola alta y lisa.
    - Sumar `mate-imperial`, registrarlo y sumar su miniatura.
    - Prueba manual: «Virola» rodea la banda del costado sin flotar; «Boca» queda sobre el anillo de arriba.
12. **Home y documentación del cambio.**
    - La descripción de «Termos y mates» menciona el cuero en lugar de la calabaza.
    - En el `README.md`, reemplazar el mate de calabaza por el imperial y el camionero, con sus medidas, y sumar el cuero y la zona anular.

---

## Criterios de aceptación

- [ ] El menú de objeto lista trece productos. Los cinco nuevos tienen miniatura y nombre, y no aparece «Mate de calabaza».
- [ ] «Mate de madera» muestra las muestras «Madera clara» y «Madera oscura», y el estilo «Quemado láser».
- [ ] «Mate camionero» y «Mate imperial» muestran las muestras «Cuero negro» y «Cuero marrón». Cambiar el color cambia sólo el cuero; la virola sigue plateada y el interior, de calabaza.
- [ ] En el imperial y el camionero, las piezas fijas en «Grabado» dicen «Virola: alpaca · Interior: calabaza», y los estilos son «Marcado oscuro» y «Esmerilado».
- [ ] El imperial y el camionero ofrecen las zonas «Boca» y «Virola».
- [ ] Con «Boca», el lienzo muestra el anillo con la boca sombreada, y el grabado se ve en el 3D sobre la cara de arriba de la virola, legible mirando el mate de frente.
- [ ] Con «Boca», un texto en el centro (sobre la boca) o en una esquina (fuera del anillo) muestra el aviso «Parte del diseño cae en la boca o fuera de la virola». Un texto curvo que va entero sobre el anillo no lo muestra.
- [ ] Con «Boca», la plantilla «Sello» pone los textos curvos sobre el anillo y no pone nada en el centro.
- [ ] Con «Virola», la tira rodea la banda del costado de la virola sin flotar ni hundirse.
- [ ] Pasar de «Boca» a «Virola» con el diseño por defecto deja «Mateando juntos» y «2026» rectos, en fila y dentro de la banda. Volver a «Boca» sin tocar nada muestra otra vez los textos curvos.
- [ ] El camionero tiene la base fruncida y el imperial, cuerpo de huevo sobre tres patas de cuero y virola ancha con labio, como en las fotos de referencia.
- [ ] Mirando por la boca del imperial y del camionero sólo se ve el interior de calabaza: nada lo atraviesa.
- [ ] «Mate de acero» muestra «Acero inoxidable» y «Negro mate». Con negro mate, el único estilo es «Grabado a metal».
- [ ] El mate de madera y el de acero ofrecen las zonas «Frente» y «Vuelta completa».
- [ ] En el mate de madera y el de acero, pasar de «Frente» a «Vuelta completa» deja el diseño en el frente, y la franja sin grabar queda atrás.
- [ ] En el lienzo, la vuelta completa de un mate muestra «Frente» en el centro, «Costado» a cada lado y «Atrás» en los bordes; la de los termos sigue mostrando «Manija».
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
- [ ] `/custom-lab/?producto=mate-wood`, `mate-steel`, `mate-imperial` y `mate-camionero` abren el Lab con ese producto. `?producto=mate-gourd` abre el producto por defecto, sin errores.
- [ ] La vista plana de respaldo (sin WebGL) muestra los cinco productos nuevos con su material.
- [ ] Ningún diseño por defecto usa nombres que aparecen en las fotos de `assets/examples/`.
- [ ] Un enlace `?d=` copiado antes de esta spec abre el mismo diseño.
- [ ] El `README.md` lista las medidas y los materiales nuevos en «Datos pendientes del negocio».
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** mates y vidrio en una sola spec. Lo eligió el usuario.
- **No:** dividir en mates (07) y vidrio (08).
- **Sí:** el cuero pasa a la SPEC 10.
- **Sí:** tres mates: madera, calabaza y acero. Lo eligió el usuario. Cambiado durante la implementación (ver abajo).
- **No:** mate de vidrio.
- **Sí:** reemplazar el mate de calabaza por un mate imperial y un mate camionero. Lo pidió el usuario durante la implementación, con fotos de referencia.
- **No:** dejar el de calabaza además de los dos nuevos.
- **Sí:** en el imperial y el camionero se graba la virola: «Boca» (el anillo de arriba) y «Virola» (la banda del costado). Es lo que muestran las fotos.
- **No:** grabar el cuero en esta spec. Necesita un estilo propio y es el tema de la SPEC 10.
- **Sí:** «Boca» es una zona plana y cuadrada con guías de anillo, y el texto se curva con el control que ya existe. Reusa el decal plano y la curva del texto.
- **No:** un editor polar (el anillo desenrollado como tira). Suma un tipo de zona nuevo en el editor, el dibujo y el 3D.
- **Sí:** un aviso cuando parte del diseño cae en la boca o fuera del anillo, calculado con el dibujo real. Con las cajas de las capas, un texto curvo sobre el anillo daría un falso aviso.
- **Sí:** «Sello» se adapta al anillo (sin monograma en el centro). El monograma caería en la boca.
- **Sí:** al pasar del anillo a la banda, los textos curvos se enderezan y se acomodan en fila; al volver sin cambios, vuelve el diseño curvo. Lo eligió el usuario: reescalar un texto curvo del anillo a una banda de 8 mm lo deja ilegible y fuera de la zona.
- **No:** un diseño propio por zona que reemplace las capas, ni reescalar como en los demás productos.
- **Sí:** el diseño por defecto de la «Boca» son textos curvos, armados con la tipografía ya cargada y rearmados al cargar las fuentes mientras el usuario no los toque. Lo eligió el usuario. Un texto curvo calculado con un ancho aproximado se corre del anillo cuando carga la fuente real.
- **No:** textos rectos sobre el anillo, ni curvos en una tipografía monoespaciada.
- **Sí:** se elige el color del cuero (negro o marrón); la virola es siempre de alpaca y el interior, de calabaza.
- **No:** sólo cuero negro, ni elegir el metal de la virola.
- **Sí:** el cuero tiene su tipo (`leather`) y una textura de grano fino. Lo distingue del negro mate de los termos, y la SPEC 10 le suma estilos de grabado.
- **Sí:** la calabaza se reusa como interior fijo de los dos mates nuevos. Se ve por la boca, como en las fotos.
- **No:** el cincelado de la virola del imperial.
- **Sí:** el imperial sigue la segunda foto de referencia («Mate imperial 2.webp»): cuerpo de huevo, virola ancha con labio y patas que se juntan debajo de la panza. Lo pidió el usuario durante la implementación; cambia las medidas provisorias de la virola. Es una guarda de fábrica que no se personaliza.
- **Sí:** cada mate es un producto. Tienen materiales y estilos distintos, y «Forma» sólo cambia la silueta.
- **No:** un «Mate» con formas. Obligaría a que cada forma tenga sus propios materiales.
- **Sí:** los mates tienen «Frente» y «Vuelta completa», como los termos. Reusa la tira de la SPEC 03.
- **Sí:** la vuelta completa se centra en el frente, con la franja sin grabar atrás. Los mates no tienen manija que marque el corte.
- **No:** una vuelta sin corte. El diseño podría quedar partido en la unión.
- **Sí:** guías propias para la vuelta de los mates («Frente», «Costado», «Atrás»), con `WrapDef.edge`. Las de los termos dicen «Manija» y, con el frente en el centro, sus etiquetas se pisaban. Decidido durante la implementación.
- **No:** dejar sólo «Frente», ni quitar las guías.
- **Sí:** la virola es de «Alpaca», un material fijo nuevo. Es la terminación habitual del mate argentino.
- **No:** reusar el acero para la virola.
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
| En la «Boca», el texto se lee al revés o espejado desde el frente. | La zona mira hacia arriba con su Y hacia atrás del mate: lo de arriba del lienzo queda lejos de quien mira. Se verifica con una captura desde la cámara por defecto. |
| El aviso del anillo es lento, porque dibuja el grabado para revisarlo. | Se calcula a baja resolución (2 px/mm) y sólo en zonas con anillo, con el mismo debounce que el resto de los avisos. |
| La banda de 8 mm del camionero es muy angosta para grabar algo legible. | El rango de tamaño de esa zona arranca en 2,5 mm. Si no alcanza, se anota en el README como dato a confirmar con el taller. |
| Rearmar el diseño por defecto al cargar una fuente pisa un cambio del usuario. | Sólo se rearma si las capas son exactamente las del diseño por defecto que se armó; cualquier cambio lo deja como está. Test en `store.test.ts`. |
| Un enlace `?d=` de un mate de calabaza (copiado en esta rama) deja de abrir ese producto. | El producto nunca llegó a `master`; `normalizeDesign` lo cambia por el producto por defecto. |
| La vuelta completa centrada en el frente (`frontOffsetMm: 0`) se comporta distinto que en los termos al pasar entre zonas. | `transferElements` ya usa `frontOffsetMm`; con 0, no corre el diseño. Se prueba el paso de frente a vuelta y de vuelta a frente en los tres mates. |
| El texto de una zona de 40 × 30 mm queda muy chico en el 3D. | Cada zona tiene su `cameraOffset`, que se ajusta en la prueba manual de cada mate. |
| No hay una foto de Wikimedia Commons de copas grabadas con licencia libre. | Se usa una foto de copas sin grabar, con licencia CC, y se marca como ilustrativa. |

---

## Lo que **no** entra en esta spec

- Grabar el cuero (SPEC 10).
- El mate de calabaza natural.
- Mate de vidrio y otros mates.
- El cincelado de la virola del imperial.
- Un editor polar para el anillo.
- Yerba y bombilla en el 3D.
- Grabado alrededor de las copas y vasos, o en su pie o fondo.
- Más tamaños de cada pieza.
- Otros colores de vidrio.
- Una foto propia para «Copas y vasos».
- Modelos GLB.

Cada uno de esos puntos, si se hace, va en su propia spec.

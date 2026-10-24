# SPEC 06 — Placas, chapitas y trofeos en el Custom Lab

> **Estado:** Aprobado
> **Depende de:** SPEC 05
> **Fecha:** 2026-10-24
> **Objetivo:** Sumar al Custom Lab cuatro productos sacados de los trabajos reales del taller: la placa sobre base de madera, la placa de pared, la chapita identificatoria y el trofeo de acrílico con forma elegible.

---

## Por qué esta spec

El usuario dejó en `assets/examples/` 11 fotos de trabajos del taller y pidió sumar al Lab esos objetos, copas de vidrio, mates y elementos de cuero. Todo junto son unos 8 productos y al menos 5 materiales nuevos (dorado, mármol, acrílico, cuero y calabaza o madera de mate). Además, el vidrio necesita un render transparente que el visor no tiene. Por eso se divide:

- **SPEC 06 (esta):** los objetos de las fotos.
- **SPEC 07:** mates y copas de vidrio.
- **SPEC 08:** elementos de cuero.

Las fotos muestran:

- **Placas sobre base de madera:** chapa dorada o plateada sobre un taco de madera oscura con canto biselado.
- **Placas de pared:** acero cepillado con cuatro tornillos en las esquinas, y también mármol blanco con la letra hundida y oscura.
- **Un trofeo de acrílico:** placa octogonal transparente, grabada en blanco esmerilado.
- **Chapitas identificatorias:** acero, con cadena de bolitas.

Casi todas las placas repiten la misma estructura de texto: título, nombre destacado, dedicatoria y lugar y fecha.

Las fotos son sólo la referencia para modelar. No se publican en el sitio, porque muestran nombres reales de personas e instituciones.

---

## Alcance

**Entra:**

- **Materiales nuevos:**
  - «Dorado» (`gold`): un metal (`kind: 'steel'`) con textura cepillada. Usa los estilos del acero: «Marcado oscuro» y «Esmerilado».
  - «Mármol blanco» (`marble-white`): un tipo de material nuevo (`stone`) con una textura nueva de vetas (`marble`).
  - «Acrílico transparente» (`acrylic-clear`): un tipo de material nuevo (`glass`) con una textura nueva (`clear`), que se dibuja transparente.
  - «Acrílico negro» (`black-acrylic`): fijo, para la base del trofeo. No se elige ni se graba.
- **Estilos de grabado nuevos:**
  - «Bajorrelieve» (`carve`), sólo para piedra: letra hundida y gris oscuro.
  - «Grabado esmerilado» (`etch`), sólo para acrílico: marca blanca satinada.
- **Placa sobre base de madera** (`plaque-base`, modelo `plaque-base-v1`):
  - base de madera oscura (`wood-dark`, fija) de 200 × 150 mm, con canto biselado;
  - chapa de 170 × 120 mm, centrada, que deja ver un marco de madera alrededor;
  - la chapa se elige en «Dorado» o «Acero inoxidable»;
  - una zona, «Chapa», de 150 × 100 mm;
  - apoyada sobre la mesa, con la cara hacia arriba, como la tabla.
- **Placa de pared** (`plaque-wall`, modelo `plaque-wall-v1`):
  - placa de 400 × 300 mm, en «Acero inoxidable» o «Mármol blanco»;
  - cuatro tornillos de acero en las esquinas, siempre de acero;
  - una zona, «Frente», de 360 × 260 mm, que no pisa los tornillos;
  - apoyada sobre la mesa, con la cara hacia arriba.
- **Chapita identificatoria** (`dog-tag`, modelo `dog-tag-v1`):
  - chapita de 50 × 28 mm con las puntas redondeadas y un agujero para la cadena;
  - sólo en «Acero inoxidable»;
  - cadena de bolitas de acero, fija;
  - dos zonas, «Frente» y «Dorso», de 40 × 20 mm cada una;
  - parada, para que se vean las dos caras al girarla.
- **Trofeo de acrílico** (`trophy`, modelo `trophy-v1`):
  - placa de acrílico transparente de 10 mm de espesor, de unos 150 × 200 mm;
  - base negra baja, de acrílico negro, fija, igual para todas las formas;
  - **cuatro formas:** «Octógono», «Rectángulo», «Arco» (rectángulo con la parte de arriba en semicírculo) y «Gota» (silueta que termina en punta arriba);
  - cada forma tiene su propia zona «Frente», que entra entera en la silueta.
- **Selector «Forma»:**
  - va en la barra de objeto, después del material, y sólo aparece en los productos que tienen formas;
  - muestra una muestra por forma, con la silueta;
  - tiene el nombre en el tooltip y en el nombre accesible, y el nombre de la forma elegida a la vista;
  - al cambiar de forma, el diseño se conserva y se adapta a la zona nueva, como al cambiar de objeto;
  - se maneja con el teclado como las muestras de material.
- **La forma se guarda en el diseño**, en un campo opcional (`shapeId`), y viaja en el enlace `?d=`. Si un enlace no trae forma o trae una que no existe, se usa la primera («Octógono»).
- **Plantilla «Reconocimiento»** en la pestaña «Capas»:
  - cuatro líneas de texto: «En reconocimiento a», el nombre destacado (reusa el primer texto del diseño, como las otras plantillas), «Por su dedicación y compromiso» y la fecha de hoy;
  - sólo aparece en zonas de 80 mm de alto o más;
  - no lleva adornos.
- **Un diseño por defecto para cada producto**, con nombres inventados. Ninguno sale de las fotos.
- **Las miniaturas SVG de los cuatro productos** en el menú de objeto.
- **En la home**, la categoría «Placas y reconocimientos» se habilita y abre `/custom-lab/?producto=plaque-base`. Sigue con la foto placeholder actual.
- **En el `README.md`:**
  - las medidas nuevas y los materiales nuevos van a «Datos pendientes del negocio», como valores a confirmar con el taller;
  - «Custom Lab: cómo agregar un producto» explica las formas.

**Queda fuera (para otras specs):**

- **Mates y copas de vidrio:** van en la SPEC 07. Esa spec reutiliza el material transparente y el estilo `etch` de esta.
- **Elementos de cuero:** van en la SPEC 08.
- **Grabar las dos caras de la chapita en un mismo diseño:** como en el cuchillo y en los termos, el diseño es de una zona a la vez.
- **Otros tamaños de cada producto:** hay una medida por producto.
- **Formas para otros productos:** el mecanismo sirve para cualquiera, pero en esta spec sólo el trofeo tiene formas.
- **Elegir la madera de la base de la placa** o el color de la base del trofeo.
- **Dorado o mármol en otros productos:** la placa de pared es de acero o mármol, y la chapita, sólo de acero.
- **Separadores en las esquinas** de la placa (como la de ESEADE), ni placas sin base.
- **Adornos de esquina** u otros gráficos nuevos para las plantillas.
- **Publicar las fotos de `assets/examples/`** en la galería o en las categorías.
- **Una categoría propia para la chapita:** «Productos empresariales» no cambia.
- **Modelos GLB:** las mallas son procedurales, como las de los demás productos.

---

## Modelo de datos

Los cambios son aditivos. Un enlace `?d=` copiado antes de esta spec abre el mismo diseño.

```ts
// src/lab/model/types.ts
export const STYLE_IDS = ['burn', 'mark-dark', 'frost', 'reveal', 'carve', 'etch'] as const
export type MaterialKind = 'wood' | 'steel' | 'coated' | 'stone' | 'glass'

// MaterialDef.texture
texture: 'wood-grain' | 'brushed' | 'matte' | 'marble' | 'clear'

// ProductDef.modelId
modelId: 'knife-v1' | 'board-v1' | 'thermos-handle-v1' | 'thermos-half-v1'
       | 'plaque-base-v1' | 'plaque-wall-v1' | 'dog-tag-v1' | 'trophy-v1'

// DesignStateSchema: campo nuevo, opcional
shapeId: z.string().optional(),
```

```ts
// src/lab/model/types.ts
export interface ProductShapeDef {
  id: string            // 'octagon' | 'rectangle' | 'arch' | 'flame' en el trofeo
  name: string          // 'Octógono' | 'Rectángulo' | 'Arco' | 'Gota'
  /** Zonas de esta forma; reemplazan a ProductDef.surfaces. */
  surfaces: readonly SurfaceDef[]
}

export interface ProductDef {
  // …
  /** Formas elegibles. Sin formas, el producto usa `surfaces`. */
  shapes?: readonly ProductShapeDef[]
}
```

```ts
// src/lab/model/catalog.ts
/** Forma efectiva: la del diseño si existe en el producto; si no, la primera. Null si el producto no tiene formas. */
export function getShape(product: ProductDef, shapeId: string | undefined): ProductShapeDef | null

/** Zonas del producto para la forma elegida. */
export function surfacesOf(product: ProductDef, shapeId: string | undefined): readonly SurfaceDef[]

// getSurface pasa a recibir el diseño, o la forma, para buscar entre las zonas correctas.
```

En el trofeo, `ProductDef.surfaces` es igual a las zonas del octógono, así los usos que no conocen las formas siguen andando.

Materiales nuevos (`MATERIALS`):

| id              | Nombre                  | `kind`  | `texture` | Se elige en                         |
| --------------- | ----------------------- | ------- | --------- | ----------------------------------- |
| `gold`          | «Dorado»                | `steel` | `brushed` | placa sobre base                    |
| `marble-white`  | «Mármol blanco»         | `stone` | `marble`  | placa de pared                      |
| `acrylic-clear` | «Acrílico transparente» | `glass` | `clear`   | trofeo (única opción)               |
| `black-acrylic` | «Acrílico negro»        | `coated`| `matte`   | fijo: base del trofeo               |

Estilos nuevos (`ENGRAVING_STYLES` y `ENGRAVING_LOOKS`):

| id      | Nombre                 | `kind`  | Aspecto                                  |
| ------- | ---------------------- | ------- | ---------------------------------------- |
| `carve` | «Bajorrelieve»         | `stone` | gris oscuro, mate, con hundimiento marcado |
| `etch`  | «Grabado esmerilado»   | `glass` | blanco satinado, semitransparente        |

Productos nuevos (`PRODUCTS`):

| id            | Nombre                          | Partes (material)                                                   | Materiales            | Zonas (mm)                          | Diseño por defecto                         |
| ------------- | ------------------------------- | ------------------------------------------------------------------- | --------------------- | ----------------------------------- | ------------------------------------------ |
| `plaque-base` | «Placa sobre base de madera»    | `plate` (elegible), `base` (`wood-dark`)                             | `gold`, `steel`       | `plate` «Chapa» 150 × 100           | `gold`, `mark-dark`, «En reconocimiento a» / «Laura Méndez» / «Por su dedicación y compromiso» / «Buenos Aires · 2026» |
| `plaque-wall` | «Placa de pared»                | `plate` (elegible), `screws` (`steel`)                               | `steel`, `marble-white` | `front` «Frente» 360 × 260        | `steel`, `mark-dark`, «Biblioteca Popular» / «Inaugurada el 24 de octubre de 2026» |
| `dog-tag`     | «Chapita identificatoria»       | `tag` (elegible), `chain` (`steel`)                                  | `steel`               | `front` «Frente» y `back` «Dorso», 40 × 20 | `steel`, `mark-dark`, `front`, «Tomás Ruiz» |
| `trophy`      | «Trofeo de acrílico»            | `plate` (elegible), `base` (`black-acrylic`)                         | `acrylic-clear`       | `front` «Frente», una por forma     | `acrylic-clear`, `etch`, «Premio a la excelencia» / «Laura Méndez» / «2026» |

Rangos de tamaño de letra (`sizeRange`, mm): placa sobre base [3, 20], placa de pared [5, 40], chapita [2.5, 8], trofeo [3, 20].

Formas del trofeo (`trophy.shapes`), en este orden:

| id          | Nombre        | Silueta                                      |
| ----------- | ------------- | -------------------------------------------- |
| `octagon`   | «Octógono»    | octógono de 150 × 200 mm, como el de NALCO   |
| `rectangle` | «Rectángulo»  | 150 × 200 mm, con las esquinas apenas redondeadas |
| `arch`      | «Arco»        | 150 × 200 mm, con la parte de arriba en semicírculo |
| `flame`     | «Gota»        | 150 × 200 mm, ancha abajo y en punta arriba  |

La medida de cada zona «Frente» se define en la implementación para que entre entera en su silueta, con 10 mm de margen. Las medidas quedan anotadas en `catalog.ts` y en el `README.md`.

Store (`src/lab/store.ts`):

```ts
interface LabState {
  // …
  /** Cambia la forma; conserva el diseño y lo adapta a la zona nueva, como setProduct. */
  setShape: (shapeId: string) => void
}
```

- `setProduct` pone `shapeId` en la primera forma del producto nuevo, o lo saca si el producto no tiene formas.
- `setShape` no cambia `editTab`.

Archivos nuevos:

- `src/lab/viewer/meshes/PlaqueBase.tsx`, `PlaqueWall.tsx`, `DogTag.tsx` y `Trophy.tsx`.
- `src/lab/viewer/meshes/trophyShapes.ts`: las cuatro siluetas como `THREE.Shape`, en unidades de escena. Las usan la malla y las miniaturas.
- `src/lab/panels/ShapeSelector.tsx`: las muestras de forma de la barra de objeto.

Plantilla nueva (`src/lab/editor/presets.ts`):

```ts
{ id: 'recognition', name: 'Reconocimiento', available: (surface) => surface.heightMm >= 80, build: … }
```

Categoría (`src/content/site.ts`): `placas` pasa a `labProductId: 'plaque-base'` y `enabled: true`.

---

## Plan de implementación

1. **Agregar los materiales y los estilos.**
   - En `types.ts`, sumar los `kind`, las texturas y los estilos nuevos.
   - En `catalog.ts`, sumar los cuatro materiales y los dos estilos.
   - En `engravingTexture.ts`, sumar los aspectos de `carve` y `etch` en `ENGRAVING_LOOKS`.
   - En `surfaceTextures.ts`, agregar la textura `marble`: vetas grises suaves sobre blanco, generada en un canvas como la madera.
   - En `PartMaterial.tsx`, dibujar los materiales `glass` con un `MeshPhysicalMaterial` transparente (transmisión, índice de refracción del acrílico, rugosidad baja).
   - Test en `src/lab/model/__tests__/constraints.test.ts`: `stylesForSurface` devuelve sólo `carve` para piedra, sólo `etch` para acrílico, y `mark-dark` y `frost` para dorado.
   - Ningún producto los usa todavía.
2. **Placa sobre base de madera.**
   - Sumar `plaque-base` en `PRODUCTS`.
   - Crear `PlaqueBase.tsx`: la base biselada y la chapa, extruidas con `shapes.ts`, con `registerPart` en `plate`.
   - Registrarla en `MODELS` y sumar su miniatura en `THUMBS`.
   - Prueba manual: elegirla en el menú, cambiar entre dorado y acero y ver el grabado en el 3D.
3. **Placa de pared.**
   - Sumar `plaque-wall` en `PRODUCTS`.
   - Crear `PlaqueWall.tsx`: la placa y los cuatro tornillos.
   - Registrarla en `MODELS` y sumar su miniatura.
   - Prueba manual: en mármol, el único estilo es «Bajorrelieve»; en acero, «Marcado oscuro» y «Esmerilado».
4. **Chapita identificatoria.**
   - Sumar `dog-tag` en `PRODUCTS`, con las zonas `front` y `back`. `back` tiene la orientación girada 180° y la cámara del otro lado.
   - Crear `DogTag.tsx`: la chapita parada y la cadena de bolitas con `InstancedMesh`.
   - Registrarla en `MODELS` y sumar su miniatura.
   - Prueba manual: en «Grabado», cambiar a «Dorso» gira la vista a la cara de atrás y el grabado aparece ahí.
5. **Formas en el modelo, sin interfaz.**
   - Agregar `ProductShapeDef`, `ProductDef.shapes` y `shapeId` opcional en `DesignStateSchema`.
   - Agregar `getShape` y `surfacesOf`. Pasar los usos de `product.surfaces` y `getSurface` a la forma del diseño.
   - Agregar `setShape` en el store y el ajuste de `shapeId` en `setProduct`.
   - Tests:
     - en `serialize.test.ts`: un diseño con `shapeId` va y vuelve igual; un enlace viejo sin `shapeId` decodifica sin errores;
     - en `store.test.ts`: `setShape` conserva las capas y cambia la zona; `setProduct` a un producto sin formas deja `shapeId` sin valor; `setShape` no cambia `editTab`.
   - Ningún producto tiene formas todavía, así que el Lab se ve igual.
6. **Trofeo de acrílico.**
   - Crear `trophyShapes.ts` con las cuatro siluetas.
   - Crear `Trophy.tsx`: la placa extruida con la silueta de la forma del diseño, encastrada en la base negra.
   - Sumar `trophy` en `PRODUCTS`, con sus cuatro formas y una zona por forma.
   - Registrarlo en `MODELS` y sumar su miniatura.
   - Prueba manual: el trofeo se ve transparente, con el grabado blanco, y se ve el fondo a través.
7. **Selector «Forma».**
   - Crear `ShapeSelector.tsx`, con el mismo patrón de muestras y de teclado que `MaterialSelector`. Las siluetas salen de `trophyShapes.ts`.
   - Montarlo en `ObjectBar.tsx` después del material. No se renderiza si el producto no tiene formas.
   - Prueba manual a 1440 × 900 y a 390 × 844: la barra entra en el ancho y cambiar de forma cambia el 3D y el lienzo.
8. **Plantilla «Reconocimiento».**
   - Sumarla en `PRESETS`. Usa `stackedTextElements`, con el nombre como línea principal.
   - Prueba manual: aparece en la placa sobre base, la placa de pared y el trofeo; no aparece en la chapita.
9. **Home y documentación.**
   - En `site.ts`, habilitar `placas` con `labProductId: 'plaque-base'`.
   - En el `README.md`, sumar las medidas y los materiales a «Datos pendientes del negocio», y explicar las formas en «cómo agregar un producto».

---

## Criterios de aceptación

- [ ] El menú de objeto lista ocho productos. Los cuatro nuevos tienen miniatura y nombre.
- [ ] «Placa sobre base de madera» muestra una base de madera oscura biselada con una chapa encima y un marco de madera visible alrededor.
- [ ] En la placa sobre base, las muestras de material son «Dorado» y «Acero inoxidable». Las dos cambian sólo la chapa; la base sigue de madera.
- [ ] Con la chapa en «Dorado», los estilos disponibles son «Marcado oscuro» y «Esmerilado».
- [ ] «Placa de pared» muestra cuatro tornillos en las esquinas, y el área útil de la zona no se superpone con ninguno.
- [ ] En la placa de pared, las muestras son «Acero inoxidable» y «Mármol blanco».
- [ ] Con «Mármol blanco», la placa se ve blanca con vetas, el único estilo es «Bajorrelieve» y el grabado se ve oscuro y hundido.
- [ ] «Chapita identificatoria» muestra una sola muestra, «Acero inoxidable», y una cadena de bolitas.
- [ ] En la chapita, «Grabado» ofrece las zonas «Frente» y «Dorso». Elegir «Dorso» muestra el grabado en la cara de atrás y la vista 3D apunta a esa cara.
- [ ] «Trofeo de acrílico» se ve transparente sobre una base negra, con el grabado en blanco.
- [ ] Con el trofeo elegido, la barra de objeto muestra «Forma» con cuatro muestras: «Octógono», «Rectángulo», «Arco» y «Gota», y el nombre de la forma elegida.
- [ ] Con cualquier otro producto, la barra de objeto no muestra «Forma».
- [ ] Elegir otra forma cambia la silueta en el 3D y la zona en el lienzo, y conserva las capas.
- [ ] En cada una de las cuatro formas, el contorno de la zona queda entero dentro de la silueta del trofeo.
- [ ] Las muestras de forma se recorren con ← → y se eligen con Enter o Espacio, como las de material.
- [ ] «Copiar enlace» con el trofeo en «Arco» copia una URL que, al abrirla, muestra el trofeo en «Arco» con el mismo diseño.
- [ ] Un enlace `?d=` del trofeo sin `shapeId`, o con un `shapeId` que no existe, abre el trofeo en «Octógono» sin errores.
- [ ] Un enlace `?d=` copiado antes de esta spec abre el mismo diseño.
- [ ] En «Capas», la plantilla «Reconocimiento» aparece en la placa sobre base, la placa de pared y el trofeo, y no aparece en la chapita.
- [ ] Aplicar «Reconocimiento» crea cuatro capas de texto, con el primer texto del diseño como línea principal, y todas entran en la zona.
- [ ] Ningún diseño por defecto usa nombres que aparecen en las fotos de `assets/examples/`.
- [ ] En la home se ve la categoría «Placas y reconocimientos», y abre `/custom-lab/?producto=plaque-base` con la placa sobre base elegida.
- [ ] `/custom-lab/?producto=trophy` y `/custom-lab/?producto=dog-tag` abren el Lab con ese producto.
- [ ] La vista plana de respaldo (sin WebGL) muestra los cuatro productos nuevos con su material.
- [ ] El `README.md` lista las medidas y los materiales nuevos en «Datos pendientes del negocio» y explica cómo agregar formas a un producto.
- [ ] Ningún archivo de `assets/examples/` se importa desde `src/` ni se copia a `public/`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** dividir el pedido en tres specs (objetos de las fotos; mates y copas; cuero). Todo junto son unos 8 productos y varios materiales y estilos nuevos.
- **No:** una sola spec con todo.
- **Sí:** empezar por los objetos de las fotos. Es el pedido más concreto y habilita la categoría «Placas y reconocimientos», que ya existía deshabilitada.
- **No:** empezar por mates y cuero.
- **Sí:** las fotos son sólo la referencia para modelar. Muestran nombres reales de personas e instituciones.
- **No:** usarlas en la galería o en las categorías.
- **Sí:** en la placa sobre base, se elige la chapa (dorado o acero) y la base es fija, de madera oscura. Así son las placas de las fotos, y el Lab elige el material de una sola parte por producto.
- **No:** elegir también la madera de la base. Suma un segundo selector de material.
- **No:** placa sin base, con separadores.
- **Sí:** el mármol blanco entra como material de la placa de pared. Lo pidió el usuario y aparece en dos fotos.
- **Sí:** el dorado es un metal más (`kind: 'steel'`) con los estilos del acero. En las fotos el dorado se graba en negro, y no hacen falta estilos nuevos.
- **No:** un tipo `brass` con un estilo propio.
- **Sí:** el mármol tiene su propio tipo (`stone`) y su estilo «Bajorrelieve». Ningún estilo actual se ve como la letra hundida y oscura de las fotos.
- **Sí:** el acrílico tiene su propio tipo (`glass`), su estilo «Grabado esmerilado» y un render transparente. La SPEC 07 los reutiliza para las copas.
- **Sí:** la chapita tiene dos zonas, «Frente» y «Dorso». Las dos caras son planas, así que sale barato.
- **No:** grabar las dos caras en un mismo diseño. El diseño es de una zona a la vez en todo el Lab.
- **Sí:** la chapita, sólo en acero. Así son las de las fotos.
- **No:** chapita en negro mate o en dorado.
- **Sí:** el trofeo es un solo producto con un selector «Forma» en la barra de objeto. Lo pidió el usuario, y el menú de objeto no crece con cada forma.
- **No:** un producto por forma. Es lo que hizo la SPEC 02 con los termos, pero con cuatro formas el menú crece mucho.
- **Sí:** la forma va en un campo opcional, `shapeId`, del diseño, y viaja en el enlace. Los enlaces viejos no lo traen y siguen andando.
- **No:** subir la versión de `DesignState` a v3. El campo opcional no rompe nada.
- **Sí:** cada forma tiene su propia zona. Una zona igual para todas no entra en la «Gota» sin desperdiciar el ancho del rectángulo.
- **Sí:** el mecanismo de formas es genérico (`ProductDef.shapes`), pero en esta spec sólo lo usa el trofeo.
- **Sí:** el trofeo tiene una base negra fija, igual para todas las formas. Así queda parado y se lee bien en el 3D.
- **No:** el trofeo sin base, ni con base de madera.
- **Sí:** las dos placas van apoyadas sobre la mesa con la cara hacia arriba, como la tabla. Usan la misma cámara y la misma luz.
- **Sí:** la chapita va parada. Así se ven las dos caras al girarla.
- **Sí:** medidas estándar provisorias, que van al `README.md` para confirmarlas con el taller, como las de los termos.
- **Sí:** la plantilla «Reconocimiento», sin adornos. Es la estructura de casi todas las fotos.
- **No:** sumar un marco de línea o adornos de esquina. Los adornos son gráficos nuevos y quedan para otra spec.
- **Sí:** habilitar sólo la categoría «Placas y reconocimientos». Lo eligió el usuario.
- **No:** que «Productos empresariales» abra la chapita.
- **Sí:** mallas procedurales, como las de los productos actuales.
- **No:** modelos GLB.

---

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| El render transparente (`MeshPhysicalMaterial` con transmisión) es lento en celulares o se ve mal con la luz del estudio. | Si a 390 × 844 baja de 30 cuadros por segundo, se usa un `MeshStandardMaterial` con opacidad 0,35 en pantallas angostas, y se anota en la spec. |
| El decal del grabado sobre el acrílico se dibuja en mal orden con la placa transparente (se ve detrás o desaparece). | El decal ya usa `depthWrite: false` y `polygonOffset`. Se le da un `renderOrder` mayor que el de la placa y se verifica desde el frente y en ángulo. |
| Muchos lugares usan `product.surfaces` o `getSurface` sin conocer la forma. | En el trofeo, `surfaces` es la zona del octógono, así nada se rompe. El paso 5 pasa los usos a `surfacesOf` antes de que exista un producto con formas, y `grep "\.surfaces"` en `src/lab/` sólo debe quedar dentro de `catalog.ts`. |
| Una placa de 400 × 300 mm sobre la mesa queda chica en la vista, o los textos chicos de la chapita (50 × 28 mm) no se leen. | Cada producto tiene su `frameRadius` y el `cameraOffset` de cada zona. Se ajustan en la prueba manual de cada paso. |
| La cadena de bolitas suma muchos objetos a la escena. | Se dibuja con un solo `InstancedMesh`. |
| El dorado procedural se ve amarillo plástico en lugar de metal. | Usa `metalness: 1` y el cepillado del acero. Se compara con la foto de UTN antes de cerrar el paso 2. |
| La textura de mármol se repite o deja costuras en una placa de 400 mm. | Una sola imagen cubre la placa entera, como hace la madera en la tabla. |
| Las medidas provisorias no coinciden con las del taller. | Están en `catalog.ts` y anotadas en el `README.md`. Cambiarlas no afecta los enlaces, porque las capas se miden desde el centro de la zona. |

---

## Lo que **no** entra en esta spec

- Mates y copas de vidrio (SPEC 07).
- Elementos de cuero (SPEC 08).
- Grabar las dos caras de la chapita en un mismo diseño.
- Más de un tamaño por producto.
- Formas en otros productos.
- Elegir la madera de la base de la placa o el color de la base del trofeo.
- Dorado o mármol en otros productos.
- Placas con separadores o sin base.
- Adornos de esquina o marcos en las plantillas.
- Publicar las fotos de `assets/examples/`.
- Cambios en la categoría «Productos empresariales».
- Modelos GLB.

Cada uno de esos puntos, si se hace, va en su propia spec.

# SPEC 02 — Termos de mate en el Custom Lab

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-10-22
> **Objetivo:** Sumar al Custom Lab dos termos de mate (con manija y media manija), en acero inoxidable o negro mate, con una zona de grabado frontal y su categoría en la landing.

---

## Por qué esta spec

El pedido original incluía grabado 360° sobre el termo. Con el motor actual no se puede hacer.

- **El motor actual:** el grabado se proyecta con un `DecalGeometry` plano (`src/lab/viewer/EngravingDecal.tsx`).
- **El límite:** en un cilindro de Ø 90 mm, una zona de 60 mm de ancho se ve bien. Más ancha, se estira hacia los bordes, y una vuelta completa no se puede proyectar.

El grabado 360° necesita una proyección cilíndrica, un lienzo envolvente en el editor y cambios en `drawDesignMask`. Por eso va en la **SPEC 03**. Esta spec deja los termos funcionando con una zona frontal, que es la base sobre la que se va a construir el 360°.

---

## Alcance

**Entra:**

- Un acabado nuevo, «Negro mate» (`black-matte`), con un tipo de material nuevo (`coated`) y una textura nueva (`matte`).
- Un estilo de grabado nuevo, «Grabado a metal» (`reveal`), exclusivo del negro mate: el láser retira la pintura y deja ver el acero.
- Un producto «Termo 1 L con manija» (`thermos-handle`, modelo `thermos-handle-v1`):
  - forma tipo Stanley;
  - cuerpo cilíndrico, tapa con pico cebador y manija lateral completa.
- Un producto «Termo media manija» (`thermos-half`, modelo `thermos-half-v1`):
  - forma tipo Lumilagro;
  - cuerpo liso, tapa con pico cebador y un asa corta que sale del hombro y baja unos 100 mm.
- Los dos termos se ofrecen en acero (`steel`) y negro mate (`black-matte`), y todas sus partes toman el acabado elegido.
- Cada termo tiene una sola zona de grabado: el «Frente», de 60 × 120 mm, vertical, centrado en el cuerpo y opuesto a la manija.
- Las mallas son procedurales y se arman con three.js, igual que las del cuchillo y la tabla.
- Una categoría nueva en la landing, «Termos y mates», que abre el Lab con `thermos-handle`.
- Una foto placeholder de Wikimedia Commons para esa categoría, con su crédito.
- Las medidas de los termos se agregan a «Datos pendientes del negocio» del `README.md`, como valores a confirmar con el taller.

**Queda fuera (para otras specs):**

- **Grabado 360° o envolvente:** va en la SPEC 03.
- **Más zonas de grabado** (dorso, tapa).
- **Otros colores de pintura:** solo negro mate.
- **Mates, bombillas u otros accesorios:** la categoría se llama «Termos y mates», pero en el Lab solo hay termos.
- **Modelos GLB o una foto propia del termo:** la foto queda como placeholder hasta que el negocio tenga una.
- **Variantes dentro de un mismo producto:** son dos productos separados.

---

## Modelo de datos

Los cambios en los tipos son aditivos: no rompen los enlaces `?d=` ya compartidos.

```ts
// src/lab/model/types.ts
export const STYLE_IDS = ["burn", "mark-dark", "frost", "reveal"] as const;
export type MaterialKind = "wood" | "steel" | "coated";
// MaterialDef.texture
texture: "wood-grain" | "brushed" | "matte";
// ProductDef.modelId
modelId: "knife-v1" | "board-v1" | "thermos-handle-v1" | "thermos-half-v1";
```

```ts
// src/lab/model/catalog.ts — MATERIALS
'black-matte': {
  id: 'black-matte',
  name: 'Negro mate',
  kind: 'coated',
  color: '#1E1F21',
  roughness: 0.9,
  metalness: 0,
  texture: 'matte',
}

// ENGRAVING_STYLES
reveal: {
  id: 'reveal',
  name: 'Grabado a metal',
  description: 'El láser retira la pintura y deja ver el acero.',
  kind: 'coated',
}
```

```ts
// src/lab/viewer/engravingTexture.ts — ENGRAVING_LOOKS (acero claro, poco profundo)
reveal: { rgb: [200, 203, 207], alpha: 0.95, roughness: 0.35, metalness: 1, depth: 0.4, mottle: 0.08 }
```

Los dos productos tienen la misma estructura:

```ts
// src/lab/model/catalog.ts — PRODUCTS (forma, sin valores de cámara)
{
  id: 'thermos-handle',               // o 'thermos-half'
  name: 'Termo 1 L con manija',       // o 'Termo media manija'
  modelId: 'thermos-handle-v1',       // o 'thermos-half-v1'
  parts: [
    { id: 'body', name: 'Cuerpo', fixedMaterialId: null },
    { id: 'cap', name: 'Tapa', fixedMaterialId: null },
    { id: 'handle', name: 'Manija', fixedMaterialId: null },
  ],
  selectablePart: 'body',
  materialIds: ['steel', 'black-matte'],
  surfaces: [thermosFront],           // una por producto
  ...
}

// Zona frontal: 60 × 120 mm, curva
{ id: 'front', name: 'Frente', part: 'body', widthMm: 60, heightMm: 120, depthMm: 16, curved: true, sizeRange: [5, 20], ... }
```

**Medidas** (estándar, a confirmar con el taller; 1 unidad de escena = 100 mm):

| Producto         | Diámetro | Alto   |
| ---------------- | -------- | ------ |
| `thermos-handle` | 90 mm    | 330 mm |
| `thermos-half`   | 90 mm    | 300 mm |

**Diseño por defecto:** dos líneas centradas, «Lucas» y «Mateando desde 2026».

| Producto         | Material      | Estilo      |
| ---------------- | ------------- | ----------- |
| `thermos-handle` | `steel`       | `mark-dark` |
| `thermos-half`   | `black-matte` | `reveal`    |

**Landing** (`src/content/site.ts`):

```ts
// IMAGES
thermos: ph('thermos-mate', 1600, <alto>, '<alt descriptivo de la foto elegida>'),

// CATEGORIES (después de 'tablas')
{
  id: 'termos',
  name: 'Termos y mates',
  description: 'Termos de acero o negro mate con un nombre o una frase en el frente.',
  image: IMAGES.thermos,
  labProductId: 'thermos-handle',
  enabled: true,
}
```

Los archivos de la foto son `public/img/placeholder/thermos-mate-1600.webp` y `thermos-mate-800.webp`. Su crédito va en `src/content/image-credits.json` con `"status": "provisional: reemplazar por fotografía propia"`.

---

## Plan de implementación

1. **Agregar el acabado negro mate y el grabado a metal.**
   - Ampliar `STYLE_IDS`, `MaterialKind` y `texture` en `types.ts`.
   - Agregar `black-matte` a `MATERIALS` y `reveal` a `ENGRAVING_STYLES` en `catalog.ts`.
   - Agregar `reveal` a `ENGRAVING_LOOKS` en `engravingTexture.ts`.
   - Hacer que `surfaceMaps` (`surfaceTextures.ts`) y `PartMaterial.tsx` manejen la textura `matte`: pintura en polvo, rugosa, sin metalicidad ni anisotropía.
   - Agregar un test en `src/lab/model/__tests__/constraints.test.ts`: `stylesForSurface` con `black-matte` devuelve solo `reveal`, y con `steel` no lo incluye.
   - Ningún producto usa todavía el nuevo acabado, así que el Lab sigue igual.
2. **Crear la geometría compartida de los termos.**
   - Crear `src/lab/viewer/meshes/thermos.ts` con funciones para el cuerpo (lathe), la tapa con pico cebador y los parámetros de alto.
   - Todavía no se monta en el visor, así que no hay cambios visibles.
3. **Agregar el termo con manija.**
   - Crear `src/lab/viewer/meshes/ThermosHandle.tsx` con las partes `body`, `cap` y `handle`. Cada una llama a `registerPart`.
   - Sumar `'thermos-handle-v1'` a `modelId` y registrarlo en `MODELS` (`ProductViewer3D.tsx`).
   - Agregar `thermos-handle` a `PRODUCTS`, con su zona `front`, la cámara, `frameRadius` y el diseño por defecto.
   - Prueba manual:
     - el termo aparece en «Elegí el objeto», se ve parado y el grabado queda en el frente;
     - cambiar a «Negro mate» oscurece todas las partes y deja solo el estilo «Grabado a metal».
4. **Agregar el termo media manija.**
   - Crear `src/lab/viewer/meshes/ThermosHalf.tsx` reutilizando `thermos.ts`. El asa es corta y sale del hombro.
   - Registrar `'thermos-half-v1'` y agregar `thermos-half` a `PRODUCTS`.
   - Prueba manual: igual que en el paso 3.
5. **Agregar la categoría en la landing.**
   - Elegir en Wikimedia Commons una foto de termo o de mate con licencia CC BY, CC BY-SA o dominio público.
   - Convertirla a `thermos-mate-1600.webp` y `-800.webp` en `public/img/placeholder/`.
   - Agregar su crédito a `image-credits.json`, `IMAGES.thermos` y la categoría `termos` a `CATEGORIES`.
   - Prueba manual: la tarjeta «Termos y mates» aparece después de «Tablas y madera», abre el Lab con el termo con manija y el crédito figura en el footer.
6. **Actualizar la documentación.**
   - En «Datos pendientes del negocio» del `README.md`, agregar:
     - las medidas de los termos (330 mm y 300 mm de alto, Ø 90 mm, zona de 60 × 120 mm) a confirmar;
     - que el taller confirme el acabado negro mate y el grabado a metal.

---

## Criterios de aceptación

- [ ] «Elegí el objeto» muestra 4 productos: cuchillo, tabla, «Termo 1 L con manija» y «Termo media manija».
- [ ] Los dos termos se ven parados en el visor 3D, completos y dentro del encuadre de la vista de producto.
- [ ] El termo con manija tiene una manija lateral que va del hombro a la parte baja del cuerpo.
- [ ] El termo media manija tiene un asa corta que no llega a la mitad del alto.
- [ ] Los dos termos tienen tapa con pico cebador.
- [ ] En los dos termos, «Elegí el material» ofrece exactamente «Acero inoxidable» y «Negro mate».
- [ ] Con «Negro mate», el cuerpo, la tapa y la manija se ven negros y mate (sin reflejo metálico).
- [ ] Con «Acero inoxidable», los estilos disponibles son «Marcado oscuro» y «Esmerilado».
- [ ] Con «Negro mate», el único estilo disponible es «Grabado a metal» y el grabado se ve plateado.
- [ ] Al cambiar de acero a negro mate con «Marcado oscuro» elegido, el estilo pasa solo a «Grabado a metal».
- [ ] La zona «Frente» mide 60 × 120 mm, está opuesta a la manija y el editor dice «superficie curva».
- [ ] El grabado se proyecta sobre el frente sin quedar flotando ni cortado en los bordes de la zona.
- [ ] El termo con manija abre en acero con «Marcado oscuro» y el texto «Lucas» / «Mateando desde 2026».
- [ ] El termo media manija abre en negro mate con «Grabado a metal» y el mismo texto.
- [ ] Un enlace copiado con un termo y «Negro mate» reabre exactamente el mismo diseño.
- [ ] Un enlace viejo del cuchillo o de la tabla sigue abriendo igual que antes.
- [ ] La landing muestra la tarjeta «Termos y mates» con foto y la tarjeta abre el Lab con el termo con manija.
- [ ] El footer muestra el crédito de la foto nueva.
- [ ] El resumen y el mensaje de presupuesto nombran el termo, el material y el estilo elegidos.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** dividir el pedido en tres specs. Esta (termos con zona frontal), la 03 (grabado 360°) y una 04 reservada. El 360° necesita un motor de proyección nuevo, y separarlo evita que trabe la entrega de los termos.
- **No:** grabado 360° en esta spec. El decal plano no lo soporta.
- **Sí:** dos productos separados. Es lo que el catálogo ya soporta, sin agregar variantes a `ProductDef`.
- **No:** un producto «Termo» con un selector de variante. Obliga a cambiar el modelo de datos.
- **Sí:** un tipo de material nuevo, `coated`. Así `stylesForSurface` filtra solo y no se mezclan los estilos de acero con el de pintura.
- **Sí:** el grabado sobre negro mate se ve plateado. El láser retira la pintura epoxi y deja ver el acero.
- **Sí:** las dos versiones de termo se ofrecen en negro mate.
- **Sí:** todas las partes toman el acabado elegido. Un termo negro mate es negro entero.
- **Sí:** una zona frontal de 60 × 120 mm. Con ese ancho, la proyección plana sobre Ø 90 mm no deforma de forma visible.
- **Sí:** medidas estándar (Ø 90 mm; 330 mm y 300 mm de alto), anotadas en el README para confirmar con el taller.
- **Sí:** los ids `thermos-handle` y `thermos-half`. **No:** usar «Stanley» en los nombres, porque es una marca registrada.
- **Sí:** mallas procedurales. Siguen el patrón del cuchillo y la tabla, sin un loader ni descargas extra.
- **No:** modelos GLB.
- **Sí:** un placeholder de Wikimedia para la landing, con el mismo criterio que las demás fotos provisionales.
- **Sí:** «Termos y mates» abre `thermos-handle`, el modelo más conocido.
- **Sí (a confirmar al revisar la spec):** los termos se muestran **parados** sobre la mesa. Así es como se usan y como se ven en las fotos. El cuchillo y la tabla, en cambio, están acostados.
- **Sí:** la tipografía del diseño por defecto sale de las 19 fuentes existentes. No se agregan fuentes nuevas.
- **Sí:** esta spec depende de la SPEC 01. Se implementa sobre una rama que parte de `master` con la SPEC 01 ya mergeada.

---

## Riesgos

| Riesgo                                                                                                                                    | Mitigación                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| El decal plano estira el texto en los bordes laterales de la zona.                                                                        | La zona se limita a 60 mm de ancho. Si igual se nota, se baja a 50 mm y se anota en la spec.                                     |
| Parado, el termo es alto y angosto, y el encuadre o el «reposo» (`rest`) del visor pensados para objetos acostados no lo muestran entero. | Los criterios piden que se vea completo. `camera`, `frameRadius` y `rest` se ajustan por producto.                               |
| El cepillado del acero (anisotropía sobre el eje X) se ve horizontal en un termo parado, cuando en los termos reales es vertical.         | La geometría del termo genera UV con U a lo largo del alto, o `PartMaterial` rota la anisotropía para los termos.                |
| La foto de Wikimedia no tiene licencia compatible o no muestra un termo de mate.                                                          | Solo se aceptan CC BY, CC BY-SA o dominio público. Si no aparece nada adecuado, se usa una foto de un mate y se aclara en `alt`. |
| `ENGRAVING_LOOKS` y `ENGRAVING_STYLES` son `Record<StyleId, …>`, así que olvidar `reveal` rompe la compilación.                           | Es intencional: `typecheck` lo detecta en el paso 1.                                                                             |
| Se implementa antes de mergear la SPEC 01 y los cambios se mezclan.                                                                       | La rama `spec-02-termos-de-mate` se crea desde `master` después del merge de la SPEC 01.                                         |

---

## Lo que **no** entra en esta spec

- Grabado 360° o envolvente (SPEC 03).
- Zonas de grabado en el dorso o en la tapa.
- Colores de pintura además del negro mate.
- Mates, bombillas u otros accesorios en el Lab.
- Modelos GLB y fotos propias.
- Variantes dentro de un mismo producto.

Cada uno de esos puntos, si se hace, va en su propia spec.

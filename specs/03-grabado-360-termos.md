# SPEC 03 — Grabado 360° en los termos

> **Estado:** Aprobado
> **Depende de:** SPEC 02
> **Fecha:** 2026-10-22
> **Objetivo:** Sumar a los dos termos del Custom Lab una zona «Vuelta completa» de 250 × 120 mm que rodea el cuerpo, salvo la franja de la manija, con una proyección cilíndrica sin estiramiento.

---

## Por qué esta spec

La SPEC 02 dejó los termos con una sola zona frontal de 60 × 120 mm y postergó el 360° a esta spec.

- **El límite del motor actual:** el grabado se proyecta con un `DecalGeometry` plano (`src/lab/viewer/EngravingDecal.tsx`). Sobre un cilindro de Ø 90 mm, más allá de 60 mm de ancho el diseño se estira hacia los bordes, y una vuelta completa no se puede proyectar.
- **La solución:** una malla nueva, una «manga» cilíndrica apenas más grande que el cuerpo, con la textura del grabado mapeada por ángulo y alto. El texto mide lo mismo en milímetros en cualquier punto de la vuelta.
- **La manija:** está a 90° del frente. La franja que queda detrás de la manija no se graba, así que la tira se centra en el lado opuesto a la manija, no en el frente. Las capas se corren al cambiar de zona para seguir en el frente.

---

## Alcance

**Entra:**

- Una zona nueva, «Vuelta completa» (`wrap`), en `thermos-handle` y `thermos-half`, además del «Frente» (`front`), que no cambia.
- La zona mide 250 × 120 mm: la vuelta (≈ 282,7 mm) menos una franja de ≈ 32,7 mm detrás de la manija.
- La tira se centra en el lado opuesto a la manija. Sus dos bordes quedan detrás de la manija.
- La misma altura que el frente: 120 mm, con el mismo centro vertical.
- Una malla nueva, `EngravingWrap`, que dibuja el grabado sobre un sector de cilindro. El frente sigue con `EngravingDecal`.
- En el editor, la tira se ve desenrollada y entera, con guías verticales rotuladas: «Frente», «Dorso», «Costado» y «Manija» en los dos bordes.
- Al pasar de «Frente» a «Vuelta completa», las capas conservan tamaño y se corren para quedar en el frente de la tira. Al volver, se corren al revés. Lo que quede fuera de los 60 mm del frente lo avisa `checkDesign`; no se reescala ni se borra.
- En la vista de zona del 3D, la cámara gira alrededor del termo hasta la capa seleccionada. Sin selección, mira el frente. El usuario puede seguir orbitando.
- Las capas que cruzan los bordes de la tira se avisan con `checkDesign`, como hoy, y lo que queda afuera no se graba.
- La zona está disponible en los dos acabados y con los mismos estilos que el frente.
- El resumen y el mensaje de presupuesto describen la posición de cada capa respecto del frente del termo.
- El «arte para el taller» (PNG a 20 px/mm) sale como la tira entera de 250 × 120 mm.
- El `README.md` anota la zona nueva y sus medidas en «Datos pendientes del negocio», para confirmar con el taller.

**Queda fuera (para otras specs):**

- **Diseños que dan la vuelta** de un borde de la tira al otro (continuidad a través de la manija).
- **Grabado 360° en el cuchillo, la tabla u otros productos.**
- **Una zona más alta** que 120 mm o que cubra todo el cuerpo recto.
- **Zonas de dorso o de tapa** separadas.
- **Precio distinto** por zona: el presupuesto sigue siendo a pedido.
- **Giro automático** del termo en la vista de zona.
- **Cambiar la zona por defecto:** el termo sigue abriendo en «Frente».

---

## Modelo de datos

Los cambios son aditivos. `DesignState` no cambia: la zona nueva es otro `surfaceId`. Los enlaces `?d=` existentes siguen abriendo igual.

```ts
// src/lab/model/types.ts
/** Zona que rodea un cuerpo cilíndrico sobre el eje Z local del producto. */
export interface WrapDef {
  /** Radio del cuerpo donde se apoya la manga, en mm. */
  radiusMm: number
  /** Ángulo (radianes, en el plano XY local, 0 = +X) del centro de la tira. */
  centerAngle: number
  /** Posición del frente del termo dentro de la tira, en mm desde su centro (+ = derecha). */
  frontOffsetMm: number
}

export interface SurfaceDef {
  // ...campos actuales
  /** Si está, la zona es una tira cilíndrica y se dibuja con EngravingWrap en lugar de un decal. */
  wrap?: WrapDef
}
```

```ts
// src/lab/model/catalog.ts
function thermosWrap(centerZ: number, handleSide: 1 | -1): SurfaceDef {
  // handleSide: +1 = manija en +X (thermos-handle), −1 = manija en −X (thermos-half).
  return {
    id: 'wrap',
    name: 'Vuelta completa',
    part: 'body',
    position: [-handleSide * 0.45, 0, centerZ],   // centro de la tira, opuesto a la manija
    orientation: /* Z local hacia afuera, hacia −handleSide·X */,
    widthMm: 250,
    heightMm: 120,
    depthMm: 0,                                     // no se usa: no hay decal
    curved: true,
    sizeRange: [5, 20],
    cameraOffset: [0, 0.35, 2.3],
    wrap: {
      radiusMm: 45,
      centerAngle: handleSide === 1 ? Math.PI : 0,
      frontOffsetMm: handleSide * 70.7,             // un cuarto de vuelta: 282,74 / 4
    },
  }
}

// thermos-handle: surfaces: [thermosFront(1.3), thermosWrap(1.3, 1)]
// thermos-half:   surfaces: [thermosFront(1.27), thermosWrap(1.27, -1)]
```

**Geometría de la tira** (Ø 90 mm, vuelta de 282,74 mm):

| Dato                                   | Valor                       |
| -------------------------------------- | --------------------------- |
| Ancho de la tira                       | 250 mm (318,3°)             |
| Franja excluida detrás de la manija    | 32,74 mm (41,7°)            |
| Frente en `thermos-handle` (manija +X) | x = +70,7 mm                |
| Frente en `thermos-half` (manija −X)   | x = −70,7 mm                |
| Dorso                                  | x = −`frontOffsetMm`        |
| Costado opuesto a la manija            | x = 0 (centro de la tira)   |
| Bordes (detrás de la manija)           | x = ±125 mm                 |

**Funciones nuevas** (puras, con tests):

```ts
// src/lab/model/constraints.ts
/** Pasa las capas de una zona a otra. Entre `front` y `wrap` del mismo producto, corre x en ±frontOffsetMm sin reescalar; en el resto de los casos, delega en rescaleElements. */
export function transferElements(elements: readonly DesignElement[], from: SurfaceDef, to: SurfaceDef): DesignElement[]

// src/lab/viewer/surfaceFrame.ts
/** Ángulo (radianes, plano XY local) del punto de la tira que está en x mm desde su centro. */
export function wrapAngle(wrap: WrapDef, xMm: number): number
```

**Textura:** la tira usa un tope de textura propio de 4096 px en escritorio y 2048 px en móviles (≈ 16 y 8 px/mm). El frente sigue con 2048 y 1024.

---

## Plan de implementación

1. **Agregar el modelo de la tira.**
   - Agregar `WrapDef` y el campo opcional `wrap` a `SurfaceDef` en `types.ts`.
   - Agregar `transferElements` en `constraints.ts` y `wrapAngle` en `surfaceFrame.ts`.
   - Tests en `src/lab/model/__tests__/constraints.test.ts`:
     - `front` → `wrap` en `thermos-handle` suma 70,7 mm a x y no cambia tamaños;
     - `wrap` → `front` lo revierte;
     - entre zonas sin `wrap` (cuchillo: hoja → mango) el resultado es igual a `rescaleElements`.
   - Test de `wrapAngle`: x = `frontOffsetMm` da el ángulo del frente (−π/2) en los dos termos.
   - Ningún producto usa todavía `wrap`, así que el Lab sigue igual.
2. **Crear la manga del grabado.**
   - Crear `src/lab/viewer/EngravingWrap.tsx`: un sector de cilindro abierto (`CylinderGeometry` con `thetaStart`/`thetaLength`), de radio 45,2 mm y 120 mm de alto, con U a lo largo de la tira y V a lo alto.
   - Reutilizar `renderEngravingMaps` y `ENGRAVING_LOOKS`, con el mismo material y el mismo debounce que `EngravingDecal`.
   - En `ProductViewer3D.tsx`, montar `EngravingWrap` si la zona tiene `wrap` y `EngravingDecal` si no.
   - Usar el tope de textura de la tira (4096 / 2048) cuando la zona tiene `wrap`.
   - Sin zonas `wrap` en el catálogo, no hay cambios visibles.
3. **Sumar la vuelta completa al termo con manija.**
   - Agregar `thermosWrap` en `catalog.ts` y la zona a `thermos-handle`.
   - En `store.ts`, `setSurface` usa `transferElements` en lugar de `rescaleElements`.
   - Prueba manual:
     - aparece el selector de zona con «Frente» y «Vuelta completa»;
     - al elegir la vuelta completa, el diseño por defecto sigue en el frente y no se reescala;
     - una capa movida al dorso se ve en el dorso del termo, sin estirarse;
     - los bordes de la tira quedan detrás de la manija.
4. **Agregar las guías del editor.**
   - En `DesignCanvas.tsx`, si la zona tiene `wrap`, dibujar líneas verticales rotuladas «Frente», «Dorso» y «Costado», y marcar los dos bordes como «Manija».
   - Las guías no forman parte del diseño: no aparecen en el 3D, ni en la vista plana, ni en el arte para el taller.
   - Prueba manual: en el termo con manija, «Frente» queda a 70,7 mm a la derecha del centro.
5. **Girar la cámara a la capa elegida.**
   - En `ProductViewer3D.tsx`, en la vista de zona con `wrap`, calcular la cámara con `wrapAngle` sobre el centro de las capas seleccionadas, o sobre `frontOffsetMm` sin selección.
   - Usar la animación de cámara existente (`goal`) y respetar `prefersReducedMotion`.
   - Si el usuario orbita, la cámara no vuelve sola hasta que cambie la selección.
   - Prueba manual: seleccionar una capa en el dorso gira la vista hasta el dorso.
6. **Sumar la vuelta completa al termo media manija.**
   - Agregar `thermosWrap(1.27, -1)` a `thermos-half`.
   - Prueba manual: igual que en los pasos 3 a 5, con la manija del lado −X y el frente a x = −70,7 mm.
7. **Describir la posición respecto del frente en el presupuesto.**
   - En `quote.ts`, si la zona tiene `wrap`, `placement` mide x desde `frontOffsetMm` («centrado en el frente», «40 mm a la izquierda del frente»).
   - Test en `src/lab/services/__tests__/quote.test.ts`: una capa en x = `frontOffsetMm` se describe como centrada en el frente.
8. **Actualizar la documentación.**
   - En «Datos pendientes del negocio» del `README.md`, agregar la zona «Vuelta completa» de 250 × 120 mm, la franja de 32,7 mm detrás de la manija y que el taller confirme que su rotativo graba esa tira en los dos termos.

---

## Criterios de aceptación

- [ ] Los dos termos muestran el selector de zona con «Frente» y «Vuelta completa».
- [ ] Los dos termos siguen abriendo en «Frente», con el mismo diseño por defecto que en la SPEC 02.
- [ ] La zona «Vuelta completa» mide 250 × 120 mm y el editor dice «superficie curva».
- [ ] El lienzo del editor muestra la tira entera, con las guías «Frente», «Dorso», «Costado» y «Manija» en los dos bordes.
- [ ] En `thermos-handle` la guía «Frente» está en x = +70,7 mm; en `thermos-half`, en x = −70,7 mm.
- [ ] En el 3D, el grabado rodea el cuerpo y los dos bordes de la tira quedan detrás de la manija.
- [ ] Un texto de 10 mm de alto mide lo mismo en el frente, en el costado y en el dorso del termo (sin estirarse).
- [ ] El grabado de la tira no queda flotando ni tapado por el cuerpo en ningún ángulo.
- [ ] Pasar de «Frente» a «Vuelta completa» deja el diseño en el frente del termo, del mismo tamaño.
- [ ] Volver de «Vuelta completa» a «Frente» devuelve las capas a su lugar; si alguna quedó fuera de los 60 mm, aparece el aviso de `checkDesign`.
- [ ] Una capa que cruza un borde de la tira genera el aviso de que se sale de la zona.
- [ ] En la vista de zona, seleccionar una capa en el dorso gira la cámara hasta el dorso; sin selección, la cámara mira el frente.
- [ ] Con «Reducir movimiento» activado, la cámara salta sin animación.
- [ ] La vuelta completa funciona en acero (marcado oscuro, esmerilado) y en negro mate (grabado a metal).
- [ ] La vista plana y el arte para el taller muestran la tira entera, sin las guías.
- [ ] El resumen dice «Vuelta completa (…), 250 × 120 mm» y describe cada capa respecto del frente.
- [ ] Un enlace copiado con «Vuelta completa» reabre exactamente el mismo diseño y la misma zona.
- [ ] Los enlaces del frente de los termos, del cuchillo y de la tabla siguen abriendo igual que antes.
- [ ] Cambiar entre las zonas del cuchillo sigue reescalando las capas como antes.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** una zona nueva, «Vuelta completa» (`wrap`), al lado del «Frente». Los enlaces existentes siguen valiendo y el frente se mantiene para diseños chicos.
- **No:** reemplazar el frente por la vuelta completa. Obliga a migrar enlaces y pierde la vista simple del frente.
- **No:** tres zonas (frente, dorso y vuelta completa). Más decisiones sin un pedido concreto.
- **Sí:** excluir la franja detrás de la manija. El rotativo no puede grabar donde está la manija y la manija taparía el grabado.
- **No:** grabar la vuelta entera de 282,7 mm.
- **Sí:** 250 mm de ancho en los dos termos, a confirmar con el taller. Deja ≈ 33 mm para los enganches del Stanley (≈ 14 mm) y margen para el rotativo.
- **No:** un ancho distinto para el media manija. Su asa no toca el cuerpo, pero un mismo ancho simplifica el catálogo.
- **Sí:** 120 mm de alto, con el mismo centro que el frente. Mantiene el diseño por defecto y los rangos de tamaño de texto.
- **No:** una zona que cubra todo el cuerpo recto. Requiere confirmar el alto útil del rotativo.
- **Sí:** la tira se centra en el lado opuesto a la manija. Así sus bordes quedan detrás de la manija y alinear, centrar y el snap a la zona funcionan sin cambios.
- **No:** el origen en el frente con una tira asimétrica. Obliga a que `zoneBox`, alinear y el snap aprendan zonas no centradas.
- **No:** centrar la tira en el frente. La franja excluida quedaría en el dorso y la manija taparía parte del grabado.
- **Sí:** al cambiar entre «Frente» y «Vuelta completa», correr las capas `frontOffsetMm` sin reescalar. Con `rescaleElements`, volver al frente achicaría todo a un 24 %.
- **No:** reiniciar al diseño por defecto al cambiar de zona.
- **Sí:** una manga cilíndrica (`EngravingWrap`) para la tira. El mapeo por ángulo y alto no estira el diseño.
- **No:** varios decals planos alrededor. Se notan costuras y estiramiento en las uniones.
- **Sí:** el frente sigue con `EngravingDecal`. Funciona bien y no hay motivo para tocarlo.
- **Sí:** lo que cruza un borde de la tira se avisa y no se graba, como en las demás zonas.
- **No:** diseños que dan la vuelta a través de la manija. Chocan con excluir esa franja.
- **Sí:** el lienzo muestra la tira entera, desenrollada, con guías rotuladas. Se ve todo el diseño de una vez.
- **No:** un lienzo con ventana que se desplaza. Esconde partes del diseño.
- **Sí:** las guías son sólo del editor. No forman parte de `drawDesignMask`, así que no llegan al 3D ni al arte para el taller.
- **Sí:** la cámara gira a la capa elegida en la vista de zona. Así se ve el dorso sin orbitar a mano.
- **No:** giro automático continuo. Distrae mientras se edita.
- **Sí:** un tope de textura propio para la tira (4096 / 2048 px). Con el tope del frente, una tira de 250 mm quedaría en ≈ 4 px/mm en móviles y los textos chicos se verían borrosos.
- **Sí:** el presupuesto describe la posición respecto del frente. Para el taller, «a la izquierda del frente» es más claro que una distancia desde el costado.
- **Sí:** el termo sigue abriendo en «Frente». No cambia nada de la SPEC 02 ni de la tarjeta de la landing.
- **Sí:** la vuelta completa está en los dos acabados y con los mismos estilos que el frente, a confirmar con el taller.
- **Sí:** el nombre «Vuelta completa». **No:** «360°», porque no son 360° exactos por la franja de la manija.

---

## Riesgos

| Riesgo                                                                                                                       | Mitigación                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| La manga y el cuerpo se pisan (z-fighting) o la manga se ve flotando.                                                       | La manga va a 0,2 mm del cuerpo, con `polygonOffset` como el decal. Si se nota, se ajusta el radio y se anota en la spec.                           |
| El cuerpo del Stanley no es un cilindro recto en toda la zona (el hombro empieza cerca del borde superior).                   | La zona termina 120 mm arriba de su centro inferior; se verifica que quede debajo del hombro. Si no, se baja `centerZ` y se anota en la spec.       |
| La manija del Stanley pasa delante de la tira y tapa el grabado cerca de los bordes.                                         | Los bordes quedan a 16,4 mm de la manija. Las guías «Manija» del editor muestran dónde no conviene poner capas.                                    |
| Una textura de 4096 px no está soportada en algún equipo.                                                                    | Se usa `min(4096, renderer.capabilities.maxTextureSize)`.                                                                                          |
| El signo de `frontOffsetMm` o de `centerAngle` queda invertido y el diseño aparece en el dorso.                              | Los tests de `wrapAngle` fijan el ángulo del frente en los dos termos.                                                                             |
| El lienzo de 250 × 120 mm queda muy bajo en pantallas angostas y cuesta mover capas chicas.                                  | El lienzo usa el ancho del panel; si en móvil resulta incómodo, se agrega zoom en otra spec.                                                       |
| El rotativo del taller no puede grabar 250 mm ni sobre negro mate.                                                           | Las medidas quedan en el README como dato a confirmar; ajustar `widthMm` no requiere cambios de código.                                            |

---

## Lo que **no** entra en esta spec

- Diseños que dan la vuelta a través de la manija.
- Grabado 360° en otros productos.
- Una zona más alta que 120 mm.
- Zonas de dorso o de tapa separadas.
- Precio distinto por zona.
- Giro automático del termo.
- Cambiar la zona por defecto de los termos.

Cada uno de esos puntos, si se hace, va en su propia spec.

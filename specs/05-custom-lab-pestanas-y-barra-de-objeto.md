# SPEC 05 — Custom Lab más claro: barra de objeto y pestañas de edición

> **Estado:** Aprobado
> **Depende de:** SPEC 04
> **Fecha:** 2026-10-23
> **Objetivo:** Reemplazar los cuatro pasos apilados de la columna de edición por una barra compacta de objeto y material y cuatro pestañas («Capa», «Capas», «Grabado», «Pedir»), para que cada control esté a la vista sin scroll largo.

---

## Por qué esta spec

Después de la SPEC 04, la columna de edición tiene dos problemas. Medido a 1440 × 900 con el termo con manija:

- **El editor arriba ocupa mucho:** la barra de herramientas y el lienzo miden 447 px, y la barra ocupa dos filas.
- **Los pasos se ven por una ventana chica:** se ven 328 px, pero miden 1532 px (casi 5 pantallas de scroll).
- **El paso 1 es enorme:** las tarjetas de objeto ocupan 500 px.
- **Lo más usado queda al fondo:** «Capa seleccionada» (texto, fuente, tamaño) empieza a 1374 px del inicio del panel, debajo de objeto, material, zona, plantillas, estilo y la lista de capas.
- **La barra del editor no se entiende:** tiene 14 íconos sin texto. Alinear, distribuir, ordenar y duplicar están al mismo nivel que agregar un texto.

La solución:

- El objeto y el material pasan a una barra compacta.
- El resto se reparte en pestañas que se ven de a una.
- La pestaña de propiedades se abre sola al elegir una capa.

---

## Alcance

**Entra:**

- **Barra de objeto y material (`ObjectBar`):**
  - En escritorio va arriba de la barra de herramientas, dentro de la columna de edición.
  - En pantallas angostas va arriba de las pestañas «Editar» / «Ver en 3D», así se ve en las dos.
  - **El objeto se elige con un botón con menú desplegable.** El botón muestra la miniatura y el nombre del objeto actual, con «▾» («Termo 1 L con manija ▾»).
  - El menú lista los cuatro objetos con miniatura y nombre, y marca el actual con «✓».
  - Cambiar de objeto se comporta como hoy: si el diseño tiene cambios, se conserva y se adapta a la zona nueva.
  - **El material se elige con muestras de color redondas** de los materiales compatibles, con su nombre en el tooltip y en el nombre accesible.
  - Al lado de las muestras se ve el nombre del material elegido.
- **Pestañas de edición** debajo del lienzo, en este orden:
  - **«Capa»:** las propiedades de la capa seleccionada, que hoy están en `PropertiesPanel`.
  - **«Capas»:** las plantillas y la lista de capas (`LayersPanel`).
  - **«Grabado»:**
    - la zona de grabado, si el objeto tiene más de una;
    - el área útil;
    - el estilo de grabado;
    - las notas de piezas fijas que hoy muestra `MaterialSelector` (por ejemplo, «La base es de acero»).
  - **«Pedir»:** el resumen y el pedido de presupuesto (`QuoteRequest`).
  - Se ve una sola pestaña a la vez.
  - Si su contenido no entra, scrollea dentro de la pestaña; la fila de pestañas queda fija.
- **Cambio automático a «Capa»:** se abre sola cuando la selección pasa a tener alguna capa:
  - al tocar una capa en el lienzo o en la lista;
  - al agregar un texto, un logo o una forma;
  - al duplicar.
  - Ninguna otra acción cambia la pestaña.
- **Al abrir el Lab:** queda abierta «Capa», con la primera capa de texto del diseño seleccionada. Lo mismo pasa al cambiar de objeto.
- **«Capa» sin selección:** muestra «Elegí una capa en el lienzo o agregá una», con los botones «+ Texto», «+ Logo» y «+ Forma».
  - Con varias capas seleccionadas, muestra el aviso actual.
  - Los avisos de `checkDesign` se siguen mostrando como hoy.
- **Barra de herramientas del editor en una sola fila:**
  - quedan visibles «+ Texto», «+ Logo», «+ Forma», Deshacer, Rehacer, un menú «Organizar ▾» y Eliminar;
  - «Organizar» agrupa las 6 alineaciones, las 2 distribuciones, «Traer al frente», «Enviar al fondo» y «Duplicar», cada una con texto y con su atajo si tiene;
  - los íconos que siguen en la barra (Deshacer, Rehacer, Eliminar) tienen un tooltip visible al pasar el mouse y al enfocar con teclado, con el nombre y el atajo.
- **El lienzo** pasa a ocupar como máximo el 35 % del alto de la columna (hoy, 45 %).
- **Teclado y lectores de pantalla:**
  - las pestañas usan `role="tablist"`, `tab` y `tabpanel`;
  - se navega con ← → Inicio y Fin;
  - el menú de objeto y el de «Organizar» se abren con Enter o Espacio, se recorren con ↑ ↓, se cierran con Esc y devuelven el foco al botón;
  - todo lo que hoy se puede hacer con teclado se sigue pudiendo hacer.
- Se eliminan los pasos (`Step`, `<details className="step">`) y el código que los abría a mano para enfocar un campo (`closest('details')` en `QuoteRequest.tsx` y `DesignCanvas.tsx`).

**Queda fuera (para otras specs):**

- **Una auditoría de accesibilidad completa** del Lab (contraste, foco y lector de pantalla en todos los controles).
- **Un panel flotante de propiedades** junto al lienzo.
- **Un asistente paso a paso** con «Anterior / Siguiente».
- **Plegar u ocultar el lienzo.**
- **Cambios en el 3D**, en su barra de controles o en las pestañas «Editar» / «Ver en 3D» de móvil.
- **Cambios en qué hace cada control:** los campos de `PropertiesPanel`, `LayersPanel` y `QuoteRequest` son los mismos; sólo cambia dónde están.
- **Recordar la pestaña abierta** entre visitas o en el enlace compartido.

---

## Modelo de datos

`DesignState` y el formato de `?d=` no cambian. Lo nuevo es estado de la interfaz en el store, que no se guarda ni viaja en el enlace.

```ts
// src/lab/store.ts
export type EditTab = 'layer' | 'layers' | 'engraving' | 'quote'

interface LabState {
  // …
  /** Pestaña visible de la columna de edición. */
  editTab: EditTab            // inicial: 'layer'
  setEditTab: (tab: EditTab) => void
}
```

Reglas del store:

- `select`, `toggleSelect`, `addElement` y `duplicateElements` ponen `editTab: 'layer'` cuando la selección resultante no está vacía.
- Al crear el store y en `setProduct`, la selección pasa a la primera capa `kind === 'text'` del diseño, si existe.

Etiquetas de las pestañas:

| `EditTab`   | Pestaña   | Contenido                                                   |
| ----------- | --------- | ----------------------------------------------------------- |
| `layer`     | «Capa»    | `PropertiesPanel` (o el aviso con los botones para agregar) |
| `layers`    | «Capas»   | `TemplatesPanel` + `LayersPanel`                            |
| `engraving` | «Grabado» | `EngravingPanel`                                            |
| `quote`     | «Pedir»   | `QuoteRequest`                                              |

Archivos nuevos y cambios de componentes:

- `src/lab/panels/ObjectBar.tsx` (nuevo): arma la barra con `ProductPicker` y `MaterialSelector`.
- `src/lab/panels/ProductPicker.tsx`: pasa de tarjetas a botón con menú. Conserva las miniaturas SVG actuales.
- `src/lab/panels/MaterialSelector.tsx`: pasa a muestras redondas compactas. Las notas de piezas fijas pasan a `EngravingPanel`.
- `src/lab/panels/EditTabs.tsx` (nuevo): la fila de pestañas y los cuatro paneles.
- `src/lab/editor/EngravingPanel.tsx` (nuevo): zona, área útil, estilo y notas de piezas fijas.
- `src/lab/editor/TemplatesPanel.tsx` (nuevo): los botones de plantillas, con su aviso de «Deshacer».
- `src/lab/editor/DesignPanel.tsx`: se borra. Su contenido queda repartido en `EngravingPanel`, `TemplatesPanel` y la pestaña «Capa».

Estructura nueva de la columna de edición:

```tsx
<div className="lab" data-tab={tab}>
  <ObjectBar />                                   {/* < 960 px: arriba de las pestañas Editar / Ver en 3D */}
  <div className="lab__tabs segmented">…</div>    {/* Editar / Ver en 3D, sólo < 960 px */}
  <section className="lab__edit" aria-label="Edición">
    <div className="lab__editor"><EditorToolbar /><DesignCanvas /></div>
    <EditTabs />                                  {/* tablist fija + un tabpanel con scroll propio */}
  </section>
  <section className="lab__stage" aria-label="Vista 3D">…</section>
</div>
```

En escritorio, `ObjectBar` ocupa la fila superior de la primera columna de la grilla. `.lab__stage` ocupa las dos filas de la segunda columna.

---

## Plan de implementación

1. **Agregar la barra de objeto y material.**
   - Rehacer `ProductPicker.tsx` como botón con menú desplegable.
   - Rehacer `MaterialSelector.tsx` como muestras redondas.
   - Crear `ObjectBar.tsx` y montarlo arriba de `.lab__editor`, ubicado en la grilla como dice el modelo de datos.
   - Sacar los pasos 1 y 2 de `CustomLab.tsx`. Los pasos 3 y 4 siguen como hoy.
   - Mover las notas de piezas fijas al principio del paso 3 de forma provisoria. En el paso 3 del plan pasan a `EngravingPanel`.
   - Prueba manual: cambiar de objeto y de material desde la barra, con mouse y con teclado.
2. **Agregar la pestaña al store.**
   - Agregar `EditTab`, `editTab` y `setEditTab` en `store.ts`, con el cambio automático a `'layer'` y la selección inicial del primer texto.
   - Tests en `src/lab/__tests__/store.test.ts`:
     - el store arranca con `editTab === 'layer'` y el primer texto seleccionado;
     - con `editTab: 'quote'`, `select([id])` pasa a `'layer'`;
     - `select([])` no cambia la pestaña;
     - `addElement` pasa a `'layer'`;
     - `setProduct` selecciona el primer texto del objeto nuevo;
     - `setMaterial` no cambia la pestaña.
   - La interfaz todavía no usa `editTab`.
3. **Reemplazar los pasos por pestañas.**
   - Crear `EngravingPanel.tsx`, `TemplatesPanel.tsx` y `EditTabs.tsx`.
   - En `CustomLab.tsx`, reemplazar `.lab__panel` y los pasos por `<EditTabs />`. Borrar `Step` y `DesignPanel.tsx`.
   - En `lab.css`, borrar los estilos de `.step*`. La fila de pestañas queda fija y el panel de la pestaña tiene `overflow-y: auto` y `overscroll-behavior: contain`.
   - Quitar el `closest('details')` de `QuoteRequest.tsx` y `DesignCanvas.tsx`: con el cambio automático a «Capa», el campo ya está visible al enfocarlo.
   - Prueba manual: recorrer las cuatro pestañas con el mouse y con ← →.
4. **Estado vacío de «Capa».**
   - En `PropertiesPanel.tsx`, sin selección: el texto nuevo y los botones «+ Texto», «+ Logo» y «+ Forma», con las mismas acciones que la barra.
   - Con varias capas seleccionadas, queda el aviso actual, que ahora menciona el menú «Organizar».
5. **Barra del editor en una fila.**
   - En `EditorToolbar.tsx`, crear el menú «Organizar ▾» con alinear, distribuir, traer al frente, enviar al fondo y duplicar, cada uno con texto y atajo.
   - Reutilizar el patrón de menú de «+ Forma» y sumarle ↑ ↓.
   - Agregar el tooltip visible de `IconButton`, al pasar el mouse y al enfocar.
   - Prueba manual a 1440 × 900: la barra entra en una sola fila.
6. **Achicar el lienzo.**
   - En `lab.css`, `--canvas-max-h` pasa a `calc(var(--lab-h) * 0.35 - 2rem)` en escritorio.
   - En pantallas angostas se mantiene `34svh`.
7. **Ubicar la barra en pantallas angostas.**
   - En `lab.css`, por debajo de 960 px, `ObjectBar` queda arriba de las pestañas «Editar» / «Ver en 3D» y visible en las dos.
   - Ajustar el alto de la mitad 3D para restar el alto de la barra.
   - Prueba manual a 390 × 844: cambiar el material con «Ver en 3D» abierto cambia el termo sin salir de esa pestaña.

---

## Criterios de aceptación

- [ ] A 1440 × 900, la columna de edición muestra, de arriba abajo: la barra de objeto y material, la barra de herramientas en una sola fila, el lienzo, la fila de pestañas y el contenido de una pestaña.
- [ ] La columna de edición ya no tiene pasos numerados ni acordeones.
- [ ] El botón de objeto muestra la miniatura y el nombre del objeto actual. Su menú lista los cuatro objetos y marca el actual.
- [ ] Elegir otro objeto en el menú cambia el 3D y el lienzo. Si el diseño tenía cambios, se conservan como hoy.
- [ ] Las muestras de material muestran sólo los materiales compatibles con el objeto. Elegir una cambia el 3D.
- [ ] El nombre del material elegido se ve al lado de las muestras.
- [ ] Al abrir `/custom-lab/`, la pestaña «Capa» está abierta, con la primera capa de texto seleccionada y su campo de texto visible sin scroll.
- [ ] Con «Pedir» abierta, tocar una capa en el lienzo abre «Capa».
- [ ] Con «Grabado» abierta, cambiar el estilo o el material no cambia de pestaña.
- [ ] Agregar un texto, un logo o una forma abre «Capa» con la capa nueva seleccionada.
- [ ] Sin capa seleccionada, «Capa» muestra «Elegí una capa en el lienzo o agregá una» y los tres botones para agregar.
- [ ] «Capas» muestra las plantillas y la lista de capas. «Grabado» muestra la zona (en los objetos que tienen más de una), el área útil, el estilo y las notas de piezas fijas. «Pedir» muestra el resumen y el pedido de presupuesto.
- [ ] A 1440 × 900, con el diseño por defecto del termo con manija, el contenido de «Capas» y de «Grabado» entra sin scroll.
- [ ] Al scrollear dentro de una pestaña, la fila de pestañas, el lienzo y la barra siguen visibles.
- [ ] El lienzo no mide más del 35 % del alto de la columna de edición.
- [ ] La barra del editor muestra «+ Texto», «+ Logo», «+ Forma», Deshacer, Rehacer, «Organizar ▾» y Eliminar.
- [ ] «Organizar» contiene las 6 alineaciones, las 2 distribuciones, «Traer al frente», «Enviar al fondo» y «Duplicar», todas con texto. Las que hoy están deshabilitadas según la selección siguen deshabilitadas.
- [ ] Pasar el mouse o enfocar con Tab Deshacer, Rehacer o Eliminar muestra un tooltip con el nombre y el atajo.
- [ ] Con el foco en una pestaña, ← y → cambian de pestaña, e Inicio y Fin van a la primera y a la última.
- [ ] El menú de objeto y el de «Organizar» se abren con Enter, se recorren con ↑ ↓ y se cierran con Esc, y el foco vuelve al botón.
- [ ] Los atajos de teclado del editor (Deshacer, Rehacer, Duplicar, Eliminar) siguen funcionando.
- [ ] «Editar el texto principal» desde el resumen de «Pedir» abre «Capa» y enfoca el campo de texto.
- [ ] A 390 × 844, la barra de objeto y material se ve arriba de «Editar» / «Ver en 3D», en las dos pestañas.
- [ ] A 390 × 844, con «Ver en 3D» abierta, cambiar el material cambia el termo y no cambia de pestaña. La mitad 3D no se pasa del borde de la ventana.
- [ ] Un enlace `?d=` copiado antes de esta spec abre el mismo diseño.
- [ ] `src/lab/editor/DesignPanel.tsx` no existe, y `className="step"` y `closest('details')` no aparecen en `src/lab/`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** pestañas en la columna de edición. Se ve una cosa a la vez y se salta directo a lo que hace falta.
- **No:** asistente paso a paso con «Anterior / Siguiente». Obliga a recorrer etapas que el usuario ya no necesita.
- **No:** acordeón de a uno. Mantiene los títulos apilados y el scroll.
- **Sí:** objeto y material en una barra compacta, fuera de las pestañas. Se cambian poco, pero se quieren ver siempre.
- **No:** tarjetas de objeto más chicas. Siguen ocupando una etapa entera.
- **Sí:** el objeto en un botón con menú desplegable. Ocupa una línea y escala si se suman productos.
- **No:** una fila de miniaturas siempre visible. No escala a más productos y los nombres quedan sólo en tooltip.
- **Sí:** cuatro pestañas: «Capa», «Capas», «Grabado» y «Pedir». Cada una entra casi sin scroll.
- **No:** «Diseño · Pedir» con secciones plegables. Vuelve a apilar todo.
- **No:** «Diseño · Capas · Pedir». Mezcla las propiedades con la zona y el estilo, que se tocan poco.
- **Sí:** abrir «Capa» sola al elegir, agregar o duplicar una capa. Es lo que el usuario quiere editar en ese momento.
- **No:** que la pestaña nunca cambie sola. Obliga a buscar las propiedades después de cada clic en el lienzo.
- **Sí:** abrir el Lab en «Capa» con el primer texto seleccionado. Muestra enseguida dónde cambiar «Lucas».
- **No:** abrir en «Capas» sin selección.
- **Sí:** «Capa» sin selección muestra un aviso con botones para agregar. Nunca queda una pestaña vacía.
- **No:** saltar a «Capas» al deseleccionar. Un cambio de pestaña sin que el usuario lo pida desorienta.
- **Sí:** barra del editor en una fila con menú «Organizar». Deja a la vista lo frecuente y le pone texto a lo demás.
- **No:** sólo sumar tooltips. La barra sigue en dos filas con 14 íconos.
- **No:** texto en todos los botones. Ocupa dos filas.
- **Sí:** lienzo al 35 % de la columna. Deja lugar a las pestañas; el 3D muestra el resultado en grande.
- **No:** lienzo plegable. Agrega un estado más sin un pedido concreto.
- **Sí:** en móvil, la barra de objeto y material arriba de «Editar» / «Ver en 3D». Se puede cambiar el material mirando el 3D.
- **No:** la barra sólo dentro de «Editar».
- **Sí:** las notas de piezas fijas («La base es de acero») van en «Grabado». En la barra no entran, y en esa pestaña están cerca del estilo, con el que se relacionan.
- **Sí:** `editTab` vive en el store y no se guarda. Es estado de la interfaz, como `viewMode` y `tab`.
- **No:** recordar la pestaña en `localStorage` o en el enlace.
- **Sí:** mantener la accesibilidad actual y que lo nuevo sea navegable por teclado. Lo pedido es que las cosas se encuentren fácil, no una auditoría.
- **No:** una auditoría de accesibilidad completa en esta spec. Va en su propia spec si hace falta.

---

## Riesgos

| Riesgo                                                                                                         | Mitigación                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Con el lienzo al 35 %, un diseño chico (la hoja del cuchillo) se ve muy pequeño para arrastrar capas.           | El lienzo conserva su zoom (− 100 % +). Si cuesta, se ajusta el porcentaje y se anota en la spec.                                                             |
| La pestaña «Capa» de un texto (texto, fuente, tamaño, interletrado, curva, rotación) no entra sin scroll.       | El criterio exige sólo que el campo de texto se vea sin scroll; el resto scrollea dentro de la pestaña, con la fila de pestañas fija.                           |
| El cambio automático a «Capa» molesta cuando el usuario reordena capas desde la lista en «Capas».               | Reordenar no cambia la selección, así que no cambia la pestaña. Tocar una fila sí la cambia; si resulta molesto en «Capas», se excluye y se anota en la spec. |
| Los menús desplegables se cortan por el `overflow` de la columna de edición.                                    | Los menús se posicionan sobre la columna con `z-index` propio. Se verifica que el de objeto y el de «Organizar» se vean enteros a 1440 × 900 y a 390 × 844.   |
| Los tests de `store.test.ts` asumen que el store arranca sin selección.                                         | Se ajustan en el paso 2, que es donde cambia la selección inicial.                                                                                            |
| En móvil, la barra de objeto suma alto y la mitad 3D queda más baja.                                            | La barra es de una línea (≈ 52 px) y el alto del 3D la resta en el paso 7.                                                                                    |

---

## Lo que **no** entra en esta spec

- Una auditoría de accesibilidad completa.
- Un panel flotante de propiedades.
- Un asistente paso a paso.
- Plegar el lienzo.
- Cambios en el 3D o en las pestañas «Editar» / «Ver en 3D».
- Cambios en qué hace cada control.
- Recordar la pestaña abierta.

Cada uno de esos puntos, si se hace, va en su propia spec.

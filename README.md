# AUREO Art Studio

Landing de grabado personalizado con **AUREO Custom Lab**, un simulador 3D de grabados.

Stack: Vite + React 19 + TypeScript estricto, three.js / React Three Fiber / drei, zustand, zod.

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + build de producción
npm run lint
npm run test
```

## Datos pendientes del negocio

- **`src/config/business.ts`**: WhatsApp, email, Instagram, Facebook, ciudad, dirección, razón social y URL del sitio están en `null`. Mientras falten, se ocultan los botones que los usan (en desarrollo, un aviso los lista).
- **Categorías** (`src/content/site.ts`): validar cuáles trabaja el negocio (`enabled`).
- **Tipografías** (`FONTS` en `src/lab/model/catalog.ts` + URL de Google Fonts en `index.html`): 19 fuentes en 5 categorías. Para sumar una, agregá su id en `FONT_IDS` (`types.ts`), su entrada en `FONTS` y la familia en la URL.
- **Estilos de grabado** (`src/lab/model/catalog.ts`): quemado en madera, y marcado oscuro o esmerilado en acero. Confirmar que el taller los ofrece.
- **FAQ**: las preguntas con `a: null` (diseño propio, materiales, pagos y entregas, plazos) no se muestran hasta completarlas.
- **Fotos**: las imágenes de `public/img/placeholder/` son provisionales, de Wikimedia Commons (créditos en `src/content/image-credits.json` y en el footer). Reemplazalas por fotos propias y marcá `illustrative: false`.
- **Legales**: no hay páginas de privacidad ni términos, así que no se enlazan.

## Custom Lab: cómo agregar un producto

1. Sumá una entrada en `PRODUCTS` (`src/lab/model/catalog.ts`) con partes, materiales compatibles, superficies grabables (posición, medidas en mm, rangos de tamaño y rotación) y diseño por defecto.
2. Creá su malla en `src/lab/viewer/meshes/` (procedural o un GLB) y registrala en `MODELS` (`ProductViewer3D.tsx`). Cada parte grabable debe llamar a `registerPart`.

El editor, las restricciones, el resumen y el presupuesto se derivan del catálogo y no hace falta tocarlos.

## Custom Lab: editor por capas

- El diseño (`DesignState` v2, `src/lab/model/types.ts`) es una lista de capas: texto (multilínea, interletrado, curvo), logo e imagen, y formas (rectángulo, elipse, línea). Cada capa tiene posición en mm desde el centro de la zona, rotación, visibilidad y bloqueo.
- Los enlaces viejos (`?d=` v1) se migran solos a capas (`src/lab/model/legacy.ts`).
- Todo se dibuja con una sola función, `drawDesignMask` (`src/lab/render/drawDesign.ts`). La usan el 3D, la vista plana, el lienzo del editor y el «arte para el taller» (PNG a 20 px/mm).
- **Logos:** se guardan sólo en el navegador (IndexedDB). El enlace lleva el id, no el archivo, así que el cliente tiene que adjuntar el logo al pedir el presupuesto (el paso 5 lo avisa y ofrece descargarlo).
- `checkDesign` avisa, pero no corrige, cuando una capa se sale de la zona, cuando un texto queda muy chico o cuando un trazo es muy fino.

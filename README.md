# AUREO Art Studio

Landing de grabado personalizado con **AUREO Custom Lab**, un simulador 3D de grabados.

El sitio tiene dos páginas (Vite multi-página):

- **Home** (`/`): `index.html` → `src/main.tsx` → `src/App.tsx`. No incluye código del Lab.
- **Custom Lab** (`/custom-lab/`): `custom-lab/index.html` → `src/lab-page/main.tsx` → `src/lab-page/LabPage.tsx`. Los enlaces para compartir son `/custom-lab/?d=…` y las categorías abren `/custom-lab/?producto=<id>`. Los enlaces viejos de la home (`/?d=…`, `/?producto=…`) redirigen solos a esta página.

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
- **Tipografías** (`FONTS` en `src/lab/model/catalog.ts` + URL de Google Fonts en `custom-lab/index.html`; la home sólo carga Bodoni Moda y Hanken Grotesk): 19 fuentes en 5 categorías. Para sumar una, agregá su id en `FONT_IDS` (`types.ts`), su entrada en `FONTS` y la familia en la URL.
- **Estilos de grabado** (`src/lab/model/catalog.ts`): quemado en madera, marcado oscuro o esmerilado en acero y en dorado, grabado a metal (el láser retira la pintura y deja ver el acero) sobre negro mate, bajorrelieve (letra hundida y oscura) en mármol y grabado esmerilado en acrílico. Confirmar que el taller los ofrece.
- **Materiales de placas y trofeos** (`MATERIALS` en `src/lab/model/catalog.ts`): «Dorado» (se graba como el acero), «Mármol blanco», «Acrílico transparente» y «Acrílico negro» (base fija del trofeo). Confirmar que el taller trabaja cada uno y en qué productos.
- **Termos** (`thermos-handle` y `thermos-half` en `src/lab/model/catalog.ts`): las medidas son estándar y hay que confirmarlas con el stock del taller. Termo con manija: Ø 90 mm × 330 mm de alto. Termo media manija: Ø 90 mm × 300 mm. Zona de grabado frontal de 60 × 120 mm en los dos. Confirmar también que los dos modelos se ofrecen en acero y en negro mate. Las formas viven en `ThermosHandle.tsx` y `ThermosHalf.tsx` (perfiles en unidades de escena, 1 unidad = 100 mm), las piezas comunes en `meshes/thermos.ts` y la zona en `thermosFront`.
- **Vuelta completa de los termos** (`thermosWrap` en `src/lab/model/catalog.ts`): tira de 250 × 120 mm alrededor del cuerpo, centrada del lado opuesto a la manija. Queda sin grabar una franja de 32,7 mm detrás de la manija (la vuelta mide 282,7 mm). Confirmar con el taller que su rotativo graba esa tira en los dos termos, en acero y en negro mate. Si cambia el ancho, alcanza con ajustar `widthMm`.
- **Placas, chapita y trofeo** (`src/lab/model/catalog.ts`): las medidas son estándar y hay que confirmarlas con el taller. Las mallas están en `src/lab/viewer/meshes/`.
  - Placa sobre base de madera (`plaque-base`, `PlaqueBase.tsx`): base de madera oscura de 200 × 150 × 18 mm, chapa dorada o de acero de 170 × 120 mm y zona «Chapa» de 150 × 100 mm.
  - Placa de pared (`plaque-wall`, `PlaqueWall.tsx`): 400 × 300 × 6 mm, en acero o mármol blanco, con cuatro tornillos de acero a 12 mm de los bordes. Zona «Frente» de 360 × 260 mm.
  - Chapita identificatoria (`dog-tag`, `DogTag.tsx`): 50 × 28 × 1 mm, de acero, con cadena de bolitas. Zonas «Frente» y «Dorso» de 40 × 20 mm, corridas 3 mm hacia el lado opuesto al agujero.
  - Trofeo de acrílico (`trophy`, `Trophy.tsx` y `trophyShapes.ts`): placa de 150 × 200 × 10 mm sobre una base negra de 180 × 60 × 30 mm. Zona «Frente» según la forma: octógono 120 × 120 mm, rectángulo 130 × 170 mm, arco 120 × 130 mm y gota 90 × 90 mm (`trophyShapes` en `catalog.ts`).
- **FAQ**: las preguntas con `a: null` (diseño propio, materiales, pagos y entregas, plazos) no se muestran hasta completarlas.
- **Fotos**: las imágenes de `public/img/placeholder/` son provisionales, de Wikimedia Commons (créditos en `src/content/image-credits.json` y en el footer). Reemplazalas por fotos propias y marcá `illustrative: false`.
- **Legales**: no hay páginas de privacidad ni términos, así que no se enlazan.

## Custom Lab: cómo agregar un producto

1. Sumá una entrada en `PRODUCTS` (`src/lab/model/catalog.ts`) con partes, materiales compatibles, superficies grabables (posición, medidas en mm, rangos de tamaño y rotación) y diseño por defecto.
2. Creá su malla en `src/lab/viewer/meshes/` (procedural o un GLB) y registrala en `MODELS` (`ProductViewer3D.tsx`). Cada parte grabable debe llamar a `registerPart`.

El editor, las restricciones, el resumen y el presupuesto se derivan del catálogo y no hace falta tocarlos.

**Formas.** Si el producto se ofrece en varias siluetas (como el trofeo), sumá `shapes` a su entrada: cada forma tiene `id`, `name` y sus propias `surfaces`. Dejá en `surfaces` las de la primera forma. La forma elegida se guarda en `shapeId` del diseño y viaja en el enlace; si falta o no existe, se usa la primera. La malla la recibe en la prop `shapeId`, y el selector «Forma» de la barra aparece solo. Hoy las siluetas de las muestras salen de `trophyShape` (`meshes/trophyShapes.ts`): para otro producto con formas, sumá ahí sus siluetas.

## Custom Lab: editor por capas

- El diseño (`DesignState` v2, `src/lab/model/types.ts`) es una lista de capas: texto (multilínea, interletrado, curvo), logo e imagen, y formas (rectángulo, elipse, línea). Cada capa tiene posición en mm desde el centro de la zona, rotación, visibilidad y bloqueo.
- Los enlaces viejos (`?d=` v1) se migran solos a capas (`src/lab/model/legacy.ts`).
- Todo se dibuja con una sola función, `drawDesignMask` (`src/lab/render/drawDesign.ts`). La usan el 3D, la vista plana, el lienzo del editor y el «arte para el taller» (PNG a 20 px/mm).
- **Logos:** se guardan sólo en el navegador (IndexedDB). El enlace lleva el id, no el archivo, así que el cliente tiene que adjuntar el logo al pedir el presupuesto (el paso 5 lo avisa y ofrece descargarlo).
- `checkDesign` avisa, pero no corrige, cuando una capa se sale de la zona, cuando un texto queda muy chico o cuando un trazo es muy fino.

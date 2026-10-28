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
- **Estilos de grabado** (`src/lab/model/catalog.ts`): quemado en madera, marcado oscuro o esmerilado en acero, dorado y la alpaca de las virolas, grabado a metal (el láser retira la pintura y deja ver el acero) sobre negro mate, bajorrelieve (letra hundida y oscura) en mármol y grabado esmerilado en acrílico y vidrio. Confirmar que el taller los ofrece.
- **Materiales de placas y trofeos** (`MATERIALS` en `src/lab/model/catalog.ts`): «Dorado» (se graba como el acero), «Mármol blanco», «Acrílico transparente» y «Acrílico negro» (base fija del trofeo). Confirmar que el taller trabaja cada uno y en qué productos.
- **Termos** (`thermos-handle` y `thermos-half` en `src/lab/model/catalog.ts`): las medidas son estándar y hay que confirmarlas con el stock del taller. Termo con manija: Ø 90 mm × 330 mm de alto. Termo media manija: Ø 90 mm × 300 mm. Zona de grabado frontal de 60 × 120 mm en los dos. Confirmar también que los dos modelos se ofrecen en acero y en negro mate. Las formas viven en `ThermosHandle.tsx` y `ThermosHalf.tsx` (perfiles en unidades de escena, 1 unidad = 100 mm), las piezas comunes en `meshes/thermos.ts` y la zona en `thermosFront`.
- **Vuelta completa de los termos** (`thermosWrap` en `src/lab/model/catalog.ts`): tira de 250 × 120 mm alrededor del cuerpo, centrada del lado opuesto a la manija. Queda sin grabar una franja de 32,7 mm detrás de la manija (la vuelta mide 282,7 mm). Confirmar con el taller que su rotativo graba esa tira en los dos termos, en acero y en negro mate. Si cambia el ancho, alcanza con ajustar `widthMm`.
- **Placas, chapita y trofeo** (`src/lab/model/catalog.ts`): las medidas son estándar y hay que confirmarlas con el taller. Las mallas están en `src/lab/viewer/meshes/`.
  - Placa sobre base de madera (`plaque-base`, `PlaqueBase.tsx`): base de madera oscura de 200 × 150 × 18 mm, chapa dorada o de acero de 170 × 120 mm y zona «Chapa» de 150 × 100 mm.
  - Placa de pared (`plaque-wall`, `PlaqueWall.tsx`): 400 × 300 × 6 mm, en acero o mármol blanco, con cuatro tornillos de acero a 12 mm de los bordes. Zona «Frente» de 360 × 260 mm.
  - Chapita identificatoria (`dog-tag`, `DogTag.tsx`): 50 × 28 × 1 mm, de acero, con cadena de bolitas. Zonas «Frente» y «Dorso» de 40 × 20 mm, corridas 3 mm hacia el lado opuesto al agujero.
  - Trofeo de acrílico (`trophy`, `Trophy.tsx` y `trophyShapes.ts`): placa de 150 × 200 × 10 mm sobre una base negra de 180 × 60 × 30 mm. Zona «Frente» según la forma: octógono 120 × 120 mm, rectángulo 130 × 170 mm, arco 120 × 130 mm y gota 90 × 90 mm (`trophyShapes` en `catalog.ts`).
- **Mates** (`src/lab/model/catalog.ts`): las medidas son estándar y hay que confirmarlas con el taller. Las mallas están en `src/lab/viewer/meshes/` (`MateWood.tsx`, `MateSteel.tsx`, `MateCamionero.tsx` y `MateImperial.tsx`).
  - Mate de madera (`mate-wood`): Ø 75 × 95 mm, en madera clara u oscura.
  - Mate de acero (`mate-steel`): Ø 85 × 100 mm, de doble pared, en acero o negro mate.
  - En esos dos: «Frente» de 40 × 30 mm y «Vuelta completa» de 30 mm de alto (210 mm en el de madera, 230 mm en el de acero), centrada en el frente y con la franja sin grabar atrás (`mateFront` y `mateWrap`).
  - Mate camionero (`mate-camionero`): calabaza forrada en cuero, Ø 90 × 105 mm, con la base fruncida. Virola de alpaca de Ø 78 por fuera, boca de Ø 52 y 12 mm de alto.
  - Mate imperial (`mate-imperial`): calabaza forrada en cuero con forma de huevo, Ø 85 mm y 115 mm de alto en total, sobre tres patas de cuero. Virola de alpaca lisa: banda de Ø 83 × 16 mm y labio de Ø 88 por fuera con boca de Ø 64.
  - En esos dos se graba la virola: «Boca», el anillo plano de arriba (`rimMouth`), y «Virola», la banda del costado como vuelta completa (`rimBand`: 220 × 8 mm en el camionero, 230 × 12 mm en el imperial). El cuero se elige en negro o marrón y no se graba (queda para la SPEC 08).
  - Confirmar que el taller graba la virola de alpaca, arriba y alrededor, y que su rotativo graba la vuelta completa de los mates de madera y de acero. Confirmar los colores de cuero que ofrece.
- **Copas y vasos** (`glassware` en `src/lab/model/catalog.ts`, perfiles en `meshes/glasswareProfiles.ts`): en «Vidrio transparente», con cuatro formas. Copa de vino de 210 mm de alto (cáliz Ø 85), copa de champagne de 230 mm (cáliz Ø 70), vaso de whisky de Ø 80 × 95 mm y jarro de cerveza de Ø 85 × 150 mm. Zona «Frente» de 50 × 40 mm en las copas y de 60 × 50 mm en el vaso y el jarro (`glasswareShapes`). Si cambia un perfil, hay que ajustar su zona: `glassware.test.ts` comprueba que la zona quede sobre la parte casi cilíndrica.
- **FAQ**: las preguntas con `a: null` (diseño propio, materiales, pagos y entregas, plazos) no se muestran hasta completarlas.
- **Fotos**: las imágenes de `public/img/placeholder/` son provisionales, de Wikimedia Commons (créditos en `src/content/image-credits.json` y en el footer). Reemplazalas por fotos propias y marcá `illustrative: false`.
- **Legales**: no hay páginas de privacidad ni términos, así que no se enlazan.

## Custom Lab: cómo agregar un producto

1. Sumá una entrada en `PRODUCTS` (`src/lab/model/catalog.ts`) con partes, materiales compatibles, superficies grabables (posición, medidas en mm, rangos de tamaño y rotación) y diseño por defecto.
2. Creá su malla en `src/lab/viewer/meshes/` (procedural o un GLB) y registrala en `MODELS` (`ProductViewer3D.tsx`). Cada parte grabable debe llamar a `registerPart`.

El editor, las restricciones, el resumen y el presupuesto se derivan del catálogo y no hace falta tocarlos.

**Zonas con anillo.** Para grabar sobre un anillo plano (la boca de una virola), la zona es un cuadrado del diámetro de afuera con `ring: { outerMm, innerMm }`. El lienzo muestra el anillo con la boca sombreada, la pestaña «Capa» avisa si algo cae fuera del metal (`render/ringCheck.ts`) y «Sello» se adapta. Si el producto define `ringTexts`, el diseño por defecto son dos textos curvos que se arman con la tipografía ya cargada. Al pasar de un anillo a una banda, los textos se enderezan (`straightenForBand`).

**Formas.** Si el producto se ofrece en varias siluetas (como el trofeo), sumá `shapes` a su entrada: cada forma tiene `id`, `name` y sus propias `surfaces`. Dejá en `surfaces` las de la primera forma. La forma elegida se guarda en `shapeId` del diseño y viaja en el enlace; si falta o no existe, se usa la primera. La malla la recibe en la prop `shapeId`, y el selector «Forma» de la barra aparece solo. Las siluetas de las muestras salen de `SILHOUETTES` (`meshes/silhouettes.ts`): un producto con formas tiene que sumar ahí las suyas.

## Custom Lab: editor por capas

- El diseño (`DesignState` v2, `src/lab/model/types.ts`) es una lista de capas: texto (multilínea, interletrado, curvo), logo e imagen, y formas (rectángulo, elipse, línea). Cada capa tiene posición en mm desde el centro de la zona, rotación, visibilidad y bloqueo.
- Los enlaces viejos (`?d=` v1) se migran solos a capas (`src/lab/model/legacy.ts`).
- Todo se dibuja con una sola función, `drawDesignMask` (`src/lab/render/drawDesign.ts`). La usan el 3D, la vista plana, el lienzo del editor y el «arte para el taller» (PNG a 20 px/mm).
- **Logos:** se guardan sólo en el navegador (IndexedDB). El enlace lleva el id, no el archivo, así que el cliente tiene que adjuntar el logo al pedir el presupuesto (el paso 5 lo avisa y ofrece descargarlo).
- `checkDesign` avisa, pero no corrige, cuando una capa se sale de la zona, cuando un texto queda muy chico o cuando un trazo es muy fino.

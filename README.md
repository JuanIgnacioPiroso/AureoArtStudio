# AUREO Art Studio

Landing de grabado personalizado con **AUREO Custom Lab**, un simulador 3D de grabados.

El sitio es estático y está hecho con Astro. Tiene dos páginas, en `src/pages/`, y las dos usan el mismo layout (`src/layouts/BaseLayout.astro`: `<head>`, header, footer y aviso de desarrollo):

- **Home** (`/`): `src/pages/index.astro`. Las secciones (`src/sections/`) y los componentes (`src/components/`) son `.astro` y no usan React. Lo interactivo va en un `<script>` en TS plano dentro de cada componente: el header (tono según la sección, menú móvil) y la galería (filtros, visor y `?cat=` / `?obra=` en la URL). La home no descarga React ni código del Lab.
- **Custom Lab** (`/custom-lab/`): `src/pages/custom-lab/index.astro`. El header, el encabezado y el footer salen en el HTML, y el simulador (`src/lab/CustomLab.tsx`) es la única isla de React del sitio. Se monta sólo en el navegador (`client:only="react"`), porque three.js no se puede renderizar en el servidor. Los enlaces para compartir son `/custom-lab/?d=…` y las categorías abren `/custom-lab/?producto=<id>`.
- **Enlaces viejos** de la home (`/?d=…`, `/?producto=…`): un script inline en el `<head>` de `src/pages/index.astro` los manda a `/custom-lab/` antes de pintar. Repite la regla de `legacyLabRedirect` (`src/lab/intent.ts`): si cambia una, hay que cambiar la otra.

Stack: Astro (estático) + React 19 en el Custom Lab + TypeScript estricto, three.js / React Three Fiber / drei, zustand, zod. Hace falta Node ≥ 22.23.4.

## Comandos

```bash
npm install
npm run dev        # astro dev, en http://localhost:4321
npm run build      # astro check + build estático en dist/
npm run preview    # sirve dist/
npm run lint       # eslint, también sobre los .astro
npm run test       # vitest
npm run typecheck  # astro check
```

## Datos pendientes del negocio

- **`src/config/business.ts`**: WhatsApp, email, Instagram, Facebook, ciudad, dirección, razón social y URL del sitio están en `null`. Mientras falten, se ocultan los botones que los usan (en desarrollo, un aviso los lista).
  - Al completar `siteUrl` se activan la URL canónica y `og:url` de cada página, la imagen de Open Graph con URL absoluta, el `sitemap-index.xml`, la línea `Sitemap` de `robots.txt` y, en el JSON-LD de la home, `url`, `logo`, `image` y el bloque `WebSite`. Copiá la URL exacta con la que responde Vercel (con o sin `www`, siempre `https`).
  - Al completar `city` o `address`, el JSON-LD del negocio pasa de `Organization` a `LocalBusiness` con su dirección (`addressCountry: "AR"`).
- **Categorías** (`src/content/site.ts`): validar cuáles trabaja el negocio (`enabled`).
- **Tipografías** (`FONTS` en `src/lab/model/catalog.ts`; los archivos en `src/assets/fonts/` y las familias en el bloque `fonts` de `astro.config.mjs`): 19 fuentes en 5 categorías, alojadas en el sitio, sin pedidos a Google. Todas las páginas cargan Bodoni Moda y Hanken Grotesk con preload; las 17 de grabado se declaran sólo en el Lab y se descargan cuando se usan. Para sumar una, agregá su id en `FONT_IDS` (`types.ts`), su entrada en `FONTS`, su archivo en `src/assets/fonts/` (con el script de abajo) y su familia en `astro.config.mjs`, con `cssVariable: '--font-<id>'`.
  - Los woff2 se regeneran con `scripts/subset-fonts.sh brand/tipografia <copia-de-google-fonts>` (necesita `pip install fonttools brotli`). La segunda carpeta tiene las carpetas `ofl/<familia>/` de [google/fonts](https://github.com/google/fonts) con los TTF y su `OFL.txt`. El script fija los pesos, recorta los caracteres y copia la licencia como `<familia>.OFL.txt`. No corre en el build.
- **Estilos de grabado** (`src/lab/model/catalog.ts`): quemado en madera, marcado oscuro o esmerilado en acero, dorado y la alpaca de las virolas, grabado a metal (el láser retira la pintura y deja ver el acero) sobre negro mate, bajorrelieve (letra hundida y oscura) en mármol, grabado esmerilado en acrílico y vidrio, y grabado láser en cuero (oscurece y hunde apenas el cuero; el tono de la marca sale de `engraveRgb` de cada cuero). Confirmar que el taller los ofrece.
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
  - En esos dos se graba la virola: «Boca», el anillo plano de arriba (`rimMouth`), y «Virola», la banda del costado como vuelta completa (`rimBand`: 220 × 8 mm en el camionero, 230 × 12 mm en el imperial). El cuero se elige en negro o marrón y no se graba.
  - Confirmar que el taller graba la virola de alpaca, arriba y alrededor, y que su rotativo graba la vuelta completa de los mates de madera y de acero. Confirmar los colores de cuero que ofrece.
- **Copas y vasos** (`glassware` en `src/lab/model/catalog.ts`, perfiles en `meshes/glasswareProfiles.ts`): en «Vidrio transparente», con cuatro formas. Copa de vino de 210 mm de alto (cáliz Ø 85), copa de champagne de 230 mm (cáliz Ø 70), vaso de whisky de Ø 80 × 95 mm y jarro de cerveza de Ø 85 × 150 mm. Zona «Frente» de 50 × 40 mm en las copas y de 60 × 50 mm en el vaso y el jarro (`glasswareShapes`). Si cambia un perfil, hay que ajustar su zona: `glassware.test.ts` comprueba que la zona quede sobre la parte casi cilíndrica.
- **Productos de cuero** (`src/lab/model/catalog.ts`): las medidas son estándar y hay que confirmarlas con el taller. Las mallas están en `src/lab/viewer/meshes/` (`LeatherWallet.tsx`, `LeatherKeychain.tsx` y `LeatherBelt.tsx`).
  - Cueros: «Cuero negro», «Cuero marrón» y «Cuero suela» (`leather-tan`), con el estilo «Grabado láser». Confirmar los colores que ofrece el taller y que su láser graba los tres.
  - Costura de «Hilo» crudo (`thread`, fijo) a 4 mm del canto (`meshes/stitch.ts`). Las zonas quedan adentro de la costura.
  - Billetera (`leather-wallet`): plegable y cerrada, de 110 × 90 × 12 mm, con el lomo a la izquierda. Zonas «Frente» y «Dorso» de 80 × 60 mm.
  - Llavero (`leather-keychain`): pieza de 4 mm con ojal y argolla de acero de Ø 25 mm. Formas (`keychainShapes.ts`): rectángulo de 35 × 70 mm (zona de 25 × 45), redondo de Ø 50 mm (zona de 28 × 28) y escudo de 45 × 55 mm (zona de 30 × 30). Frente y dorso en cada una; `keychain.test.ts` comprueba que las zonas no pisen la costura.
  - Cinturón (`leather-belt`): tramo de 350 × 35 × 4 mm con hebilla de acero y tres agujeros (medidas en `beltLayout.ts`). Zona «Frente» de 200 × 25 mm al lado de la hebilla; `belt.test.ts` comprueba que no pise la hebilla, los agujeros ni la costura.
- **FAQ** (`FAQ` en `src/content/site.ts`): las preguntas con `a: null` no se muestran ni entran en el JSON-LD `FAQPage` de la home hasta completarlas. Faltan precio, plazos, envíos y zonas, medios de pago, pedidos por cantidad o para empresas, diseño propio y formato del logo, materiales, uso de las tablas con alimentos y cuidado de las piezas. Los borradores de respuesta para validar con el taller están en `specs/15-preguntas-frecuentes-de-compra.md`. Una respuesta puede llevar un enlace al final (`link`).
- **Preguntas de cada categoría** (`faq` de cada entrada de `CATEGORIES` en `src/content/site.ts`): las respondidas (hoja o mango, virola de alpaca, colores de cuero, logo en cuero y cuánto texto entra en una placa) repiten medidas y materiales del catálogo del Lab. Si cambia el catálogo o el taller corrige un dato de arriba, hay que actualizarlas a mano. Siguen en `null`: afilado de cuchillos, uso de la tabla para cortar, especie de la madera, mate o termo propio, lavavajillas, juegos para casamientos y trofeos por cantidad.
- **Pedidos para empresas** (`CORPORATE` y `CORPORATE_FAQ` en `src/content/corporate.ts`, página `/regalos-empresariales/`): todo está en `null`. Cada dato que se complete aparece en «Datos del pedido». Mientras estén todos en `null`, la sección no se muestra.
  - `minimumOrder`: pedido mínimo (p. ej. «10 unidades»).
  - `leadTime`: plazo de una tanda (p. ej. «15 días hábiles desde que se aprueba la muestra»).
  - `sample`: `true` si el taller graba una muestra para aprobar antes de la tanda. Sólo en ese caso aparece el paso «Grabamos una muestra» del proceso.
  - `invoicing`: facturación (p. ej. «Factura A y B»).
  - `delivery`: envíos y entregas (p. ej. «Envíos a todo el país; entregas en CABA y GBA»).
  - `CORPORATE_FAQ`: pedido mínimo, muestra, logo o nombre distinto por pieza, factura A y plazo de 50 o 100 unidades. Las preguntas con `a: null` no se muestran ni entran en el JSON-LD `FAQPage`.
  - Antes de publicar la página, confirmar que cada logo de `src/assets/logos/` es cliente de AUREO: la página los muestra a empresas como prueba. Un logo dudoso se saca de la carpeta.
- **Guía de materiales** (`MATERIAL_GUIDES` en `src/content/materials.ts`, página `/materiales/`): los textos de «Qué hace el láser» y «Cómo se ve» de cada material son borradores; validarlos con el taller (por ejemplo, si su láser marca el acero oxidándolo o lo graba en profundidad) antes de publicar. Si el taller todavía no confirmó la lista de materiales, se puede sacar el enlace de la home (`src/sections/Differentials.astro`) hasta entonces. Estilos y productos de cada sección salen del catálogo del Lab y no se escriben a mano.
  - Completar `minTextHeight` (tamaño mínimo de letra legible, p. ej. «2 mm de alto de mayúscula») y `care` (cómo cuidar la pieza) de cada material. Mientras estén en `null` no se muestran.
  - Al cambiar los textos, actualizar `DATE_MODIFIED` en `src/pages/materiales/index.astro` (es el `dateModified` del JSON-LD `Article`).
- **Logos de «Confían en nosotros»** (`src/assets/logos/`): la carpeta está vacía, así que la sección no aparece en la home. Para sumar un logo, copiá el archivo en la carpeta y hacé deploy; no hay que tocar código. Se carga en `src/content/logos.ts` y se muestra en `src/sections/TrustedBy.astro`.
  - Formatos: `.svg`, `.png`, `.webp`, `.jpg` y `.jpeg`, con la extensión en minúsculas (`Logo.PNG` no se toma). Los PNG, WebP y JPG se optimizan en el build; los SVG salen tal cual y necesitan `viewBox`.
  - Usá la versión oscura o a color sobre fondo transparente: la franja es clara y los logos se muestran en escala de grises (toman su color al pasar el mouse). Un logo blanco no se ve.
  - El nombre del archivo es el texto alternativo: `-` y `_` pasan a espacios y sólo se pone en mayúscula la primera letra, así que escribilo con sus mayúsculas y tildes (`Municipalidad-de-Tandil.svg` → «Municipalidad de Tandil»).
  - El orden es por nombre de archivo. Un prefijo numérico opcional lo fija y no se muestra: `01-Café_Martínez.webp` va antes de `2-Aceros.svg` y se lee «Café Martínez».
- **Fotos**: la galería muestra trabajos del taller (`src/assets/works/`), y el hero de la home es un collage fijo de cuatro de ellos. Las tarjetas de «Qué personalizamos», los encabezados de categoría, la guía de materiales y «Cada material pide su grabado» usan esas mismas fotos, desde `IMAGES` (`src/content/site.ts`). Las imágenes de `public/img/placeholder/` siguen siendo provisionales, de Wikimedia Commons (créditos en `src/content/image-credits.json` y en el footer), y quedan sólo en Cuchillos, Tablas y Cuero: tarjeta y encabezado de cada una y, en cuero, la guía de materiales. Cuando haya foto propia de alguna, alcanza con cambiar su clave en `IMAGES` y borrar su archivo y su crédito. Un trabajo nuevo se suma sin tocar `src/sections/Gallery.astro`:
  1. Copiá la foto en `src/assets/works/` en `.jpg`, `.png` o `.webp`, con la extensión en minúsculas. Si el celular saca `.heic`, exportala antes como `.jpg`. Usá un nombre corto y sin espacios (`tabla-asado-gomez.jpg`).
  2. Tamaño mínimo: 1600 px del lado largo. El build genera los `.webp` de 800 px (tarjeta) y de 1600 px (visor), así que no hay que achicarla a mano.
  3. Para que se vea pareja con el resto: luz natural, fondo liso y el grabado en foco.
  4. Si el diseño se armó en el Custom Lab, sacá la captura para mostrarla al lado de la foto. Abrí el diseño (con su enlace o rearmándolo), elegí «Zona de grabado» en «Encuadre», que es la vista que más se parece a una foto del grabado, y tocá «Descargar imagen». Guardá el PNG en la misma carpeta (`tabla-asado-gomez-lab.png`).
  5. Agregá el trabajo en `WORKS` (`src/content/works.ts`), importando las imágenes:
     ```ts
     import tablaGomez from '../assets/works/tabla-asado-gomez.jpg'
     import tablaGomezLab from '../assets/works/tabla-asado-gomez-lab.png'

     {
       id: 'w-tabla-gomez',
       title: 'Tabla de asado con apellido',
       category: 'tablas', // id de CATEGORIES en src/content/site.ts
       material: 'Algarrobo',
       detail: 'Apellido en Bodoni Moda, quemado en la cara principal.',
       photo: { src: tablaGomez, alt: 'Tabla de algarrobo con el apellido Gómez grabado en el centro' },
       labPreview: { src: tablaGomezLab, alt: 'Vista 3D del Custom Lab con el apellido Gómez sobre la tabla' }, // opcional
       labProductId: 'board', // opcional: suma «Diseñar algo parecido»
     },
     ```
  6. En `alt`, describí lo que se ve: el objeto, el material y qué dice o muestra el grabado. No repitas el título ni empieces con «Foto de». `npm run test` falla si un `alt` queda vacío, si la categoría no existe o si `labProductId` no es un producto del Lab.
  - Los trabajos se muestran en el orden de `WORKS`. Cada grilla (la home, cada filtro y cada página de categoría) muestra los primeros `WORKS_LIMIT` (8) y el resto detrás de «Ver más trabajos»: poné adelante los más representativos y mezclá categorías en los primeros 8 de la home.
  - La barra de filtros aparece cuando hay trabajos de al menos dos categorías. Con una sola, no filtraría nada.
  - No publicar placas funerarias ni datos de particulares (nombres de difuntos, de familiares o de clientes que no pidieron aparecer) sin su permiso. Antes de publicar un reconocimiento con nombre, confirmarlo con el cliente. Quitar un trabajo es borrar su entrada en `WORKS` y su foto; si la foto está en `IMAGES` (`photo: IMAGES.<clave>`), también se ve en una tarjeta, en la guía de materiales o en el hero, así que hay que cambiar esa clave por otra foto.
  - No publicar nombres de menores (por ejemplo, en trofeos deportivos o escolares).
  - `w-retrato-marmol`: confirmar que la persona del retrato es una figura pública o que dio permiso. Si no, quitarlo.
  - Materiales a confirmar con el taller (se ven en la tarjeta y en el visor; si alguno está mal, corregir `material` en `WORKS`):
    - `w-embajada-argentina` y `w-homenaje-cgt`: «Acero inoxidable».
    - `w-utn-fin-de-cursada`, `w-eseade-honoris-causa`, `w-bodega-iaccarini` y `w-di-tella`: «Chapa dorada sobre base de madera», ¿bronce o aluminio?
    - `w-arneg-jubilacion`: «Chapa dorada con separadores», ¿bronce o aluminio?
    - `w-municipio-tigre`: «Chapa dorada en cuadro con marco».
    - `w-bandeja-adicora`: «Vidrio con borde dorado». En la foto parece metal pulido.
    - `w-perro-en-piedra`: «Piedra», ¿mármol o granito?
    - `w-trofeo-aesa` y `w-trofeo-arte-nuevo`: «Acrílico bordó sobre base metálica», ¿vidrio o acrílico?
    - `w-acrilico-ep167`: «Acrílico blanco».
    - `w-placa-amerisourcebergen`: «Chapa dorada sobre base de madera», ¿bronce o aluminio?
    - `w-placa-logias`: «Chapa dorada sobre madera, en estuche», ¿bronce?
    - `w-bandeja-cfj`: «Bandeja oval de metal con borde dorado».
    - `w-medallas-padel`: «Metal con cinta».
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

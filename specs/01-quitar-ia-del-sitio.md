# SPEC 01 — Quitar la IA del sitio

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-10-22
> **Objetivo:** Eliminar por completo el botón «Generar imagen» y el asistente de diseño con IA, para que el sitio quede 100 % estático y sin dependencias de proveedores de IA.

---

## Por qué esta spec

El Custom Lab tiene dos funciones con IA:

- El botón «Generar imagen» (`PreviewGenerator`), que manda la vista 3D a Gemini u OpenAI mediante `/api/mockup`.
- El paso 4, «Pedile ideas a la IA» (`DesignAssistant`), que pide sugerencias a Claude mediante `/api/design-suggestions`.

Las dos se van. Sin ellas no queda ningún endpoint, así que también se borran el backend serverless y el plugin de desarrollo que lo emulaba.

---

## Alcance

**Entra:**

- El botón «Generar imagen» y su diálogo: `src/lab/panels/PreviewGenerator.tsx` y su uso en `src/lab/CustomLab.tsx`.
- El asistente: `src/lab/panels/DesignAssistant.tsx` y el paso 4 de `src/lab/CustomLab.tsx`.
- La renumeración de pasos: «Revisá y pedí tu presupuesto» pasa de `n={5}` a `n={4}`.
- Los endpoints `api/mockup.ts` y `api/design-suggestions.ts`, y con ellos la carpeta `api/`.
- El backend `server/`: `server/http.ts`, `server/imageProviders.ts` y `server/__tests__/imageProviders.test.ts`.
- Los servicios del cliente `src/lab/services/ai.ts`, `src/lab/services/aiContract.ts` y `src/lab/services/__tests__/aiContract.test.ts`.
- La constante `MAX_LINE_LENGTH` en `src/lab/model/types.ts`, que solo usa el contrato de IA.
- La variante `'assistant'` de `UndoOrigin` en `src/lab/store.ts`, que queda como `'preset'`.
- Los estilos de `src/lab/lab.css`:
  - el bloque «Imagen generada con IA» (`.mockup-dialog*`);
  - el bloque `.mockup__*`;
  - el bloque «Asistente».
- La configuración:
  - el plugin `devApi` / `aureo-dev-api` de `vite.config.ts`;
  - la clave `functions` de `vercel.json`;
  - `"api"` y `"server"` en el `include` de `tsconfig.node.json`.
- La dependencia `@anthropic-ai/sdk` de `package.json` y `package-lock.json`.
- Los textos:
  - la pregunta del FAQ «¿Para qué sirve el asistente de IA?» en `src/content/site.ts`;
  - las menciones a la IA y a las variables de entorno en `README.md`;
  - el archivo `.env.example`.
- Los comentarios que mencionan al asistente o a la IA en código que se conserva (`store.ts`, `types.ts`, `legacy.ts`, `Fallback2D.tsx`).

**Queda fuera (para otras specs):**

- Cualquier reemplazo de las funciones de IA, como presets nuevos o una galería de ideas.
- Agregar otro botón donde estaba «Generar imagen». La barra del visor se reacomoda sola.
- Borrar las variables `ANTHROPIC_API_KEY`, `AI_MODEL`, `IMAGE_PROVIDER`, `IMAGE_API_KEY` e `IMAGE_MODEL` del panel de Vercel. Es un paso manual, anotado abajo como recordatorio.
- Migrar el campo `source` del modelo de diseño.

---

## Modelo de datos

Esta spec no agrega estructuras nuevas. Los cambios en las que ya existen son estos:

```ts
// src/lab/store.ts — antes: 'preset' | 'assistant'
export type UndoOrigin = 'preset'

// src/lab/model/types.ts y src/lab/model/legacy.ts — NO cambia
source: z.enum(['manual', 'ai']),
```

- `source` conserva `'ai'` solo por compatibilidad: los enlaces `?d=` ya compartidos pueden traerlo y tienen que seguir abriendo. El código nuevo nunca escribe `'ai'`.
- `stackedTextElements` (`src/lab/model/legacy.ts`) se conserva porque lo usa la migración de enlaces v1. Solo se actualiza su comentario.
- `Fallback2D` se conserva porque es la vista sin WebGL. Solo se actualiza su comentario.

---

## Plan de implementación

1. **Quitar «Generar imagen» de la UI.**
   - Borrar el import y `<PreviewGenerator />` de `CustomLab.tsx`.
   - Borrar `src/lab/panels/PreviewGenerator.tsx`.
   - Borrar los bloques `.mockup-dialog*` y `.mockup__*` de `lab.css`.
   - Prueba manual: `npm run dev`. La barra del visor termina en «Copiar enlace» y se ve bien en escritorio y en móvil.
2. **Quitar el asistente de la UI.**
   - Borrar el import y el `<Step n={4} title="Pedile ideas a la IA">` de `CustomLab.tsx`.
   - Cambiar el paso del presupuesto a `n={4}`.
   - Borrar `src/lab/panels/DesignAssistant.tsx` y el bloque «Asistente» de `lab.css`.
   - Reducir `UndoOrigin` a `'preset'`.
   - Prueba manual: el Lab muestra los pasos 1 a 4 y deshacer un preset sigue funcionando.
3. **Quitar los servicios de IA del cliente y el backend.**
   - Borrar `src/lab/services/ai.ts`, `aiContract.ts` y `__tests__/aiContract.test.ts`.
   - Borrar `MAX_LINE_LENGTH` de `types.ts`.
   - Borrar `api/` y `server/`.
   - Quitar `devApi()` y sus imports sin uso de `vite.config.ts`.
   - Quitar `functions` de `vercel.json`.
   - Quitar `"api"` y `"server"` de `tsconfig.node.json`.
   - `npm run typecheck` y `npm run build` pasan.
   - Este paso junta los originales 3 y 4: `api/` y `server/` importan de `aiContract.ts` y `types.ts`, así que no se pueden borrar los servicios sin borrar el backend.
4. **Quitar la dependencia.**
   - Ejecutar `npm uninstall @anthropic-ai/sdk`.
   - `npm run build` y `npm run test` pasan.
5. **Actualizar textos y documentación.**
   - Borrar la pregunta del FAQ sobre el asistente en `src/content/site.ts`.
   - En `README.md`:
     - quitar «con asistente de IA» de la descripción;
     - borrar la sección «Variables de entorno»;
     - quitar «/api/\*» de la línea de `npm run dev`;
     - quitar la mención a «funciones serverless de Vercel en `api/`».
   - Borrar `.env.example`, que solo contenía variables de IA.
   - Quitar la fila «Origen del diseño» de `summaryRows` (`src/lab/services/quote.ts`). Con un enlace viejo (`source: 'ai'`) mostraba «Propuesta del asistente, revisada» en el resumen y en el mensaje del presupuesto. El test de `quote.test.ts` pasa a verificar que el mensaje no contiene «asistente».
   - Actualizar los comentarios de `store.ts`, `types.ts`, `legacy.ts` y `Fallback2D.tsx` que mencionan al asistente o a la IA.

---

## Criterios de aceptación

- [ ] El Custom Lab no muestra el botón «Generar imagen» ni en desarrollo ni en producción.
- [ ] El panel del Lab tiene exactamente 4 pasos y el último es «Revisá y pedí tu presupuesto».
- [ ] No existe ningún paso, botón ni texto que diga «IA» o «asistente» en la UI del sitio.
- [ ] El FAQ ya no incluye «¿Para qué sirve el asistente de IA?».
- [ ] Las carpetas `api/` y `server/` no existen.
- [ ] No existen `src/lab/services/ai.ts`, `src/lab/services/aiContract.ts`, `PreviewGenerator.tsx` ni `DesignAssistant.tsx`.
- [ ] `grep -rniE "anthropic|mockup|imageProvider|design-suggestions|IMAGE_PROVIDER" src vite.config.ts vercel.json package.json README.md` no devuelve resultados.
- [ ] `package.json` no lista `@anthropic-ai/sdk`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.
- [ ] Con `npm run dev`, la consola del navegador no muestra requests a `/api/*` al abrir el Lab.
- [ ] Un enlace compartido con `source: 'ai'` en el diseño sigue abriendo el Lab con ese diseño.
- [ ] Aplicar un preset y tocar «Deshacer» sigue restaurando las capas anteriores.
- [ ] «Descargar imagen», «Copiar enlace» y la descarga del PNG en el presupuesto siguen funcionando, porque usan `capture`.

---

## Decisiones

- **Sí:** eliminar la función completa y no solo ocultarla. No queda código muerto ni endpoints sin uso.
- **No:** ocultarla con un flag. Mantiene complejidad para una función que se decidió quitar.
- **Sí:** una sola spec para las dos funciones de IA. Fue decisión explícita, aunque se propuso dividirla en dos.
- **Sí:** mantener `'ai'` en el enum `source`. Los enlaces ya compartidos siguen validando sin migración.
- **No:** migrar `'ai'` a `'manual'`. Agrega superficie de cambio sin beneficio visible.
- **Sí:** borrar toda la infraestructura serverless: `api/`, `server/`, el plugin de desarrollo y `functions` en `vercel.json`. El sitio queda estático.
- **No:** dejar la infraestructura «por si vuelve un endpoint». Si vuelve, se agrega en su propia spec.
- **Sí:** renumerar los pasos del Lab. Un salto del 3 al 5 se vería roto.
- **Sí:** que la barra del visor se reacomode sola, sin agregar un reemplazo.
- **Sí:** conservar `capture` en el store, porque lo usan «Descargar imagen» y el presupuesto.
- **Sí:** borrar `.env.example`. Solo contenía variables de IA.
- **Sí:** quitar la fila «Origen del diseño» del presupuesto. Sin asistente, todo diseño es manual y la fila no aporta nada.
- **No:** mostrar siempre «Diseño manual» ni dejar el texto viejo como excepción para enlaces con `source: 'ai'`.
- **Sí:** las variables de Vercel solo se anotan como recordatorio. El código no toca la infraestructura.

---

## Riesgos

| Riesgo                                                                                                | Mitigación                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un enlace viejo con `source: 'ai'` deja de validar.                                                   | El enum no cambia. Hay un criterio de aceptación que lo verifica.                                                                                                       |
| Quitar `devApi` deja imports sin uso en `vite.config.ts` (`loadEnv`, `Plugin`, tipos de `node:http`). | Se limpian en el paso 3 y `npm run lint` lo verifica.                                                                                                                   |
| Las claves de IA siguen cargadas en Vercel aunque ya no se usen.                                      | Recordatorio: borrar a mano `ANTHROPIC_API_KEY`, `AI_MODEL`, `IMAGE_PROVIDER`, `IMAGE_API_KEY` e `IMAGE_MODEL` en el proyecto de Vercel y revocarlas en cada proveedor. |
| Algún texto de la landing fuera del Lab promete «IA».                                                 | El criterio de `grep` y la revisión de la UI lo detectan.                                                                                                               |

---

## Lo que **no** entra en esta spec

- Reemplazos de las funciones de IA (presets nuevos, galería de ideas).
- Un botón nuevo en la barra del visor.
- Cambios en el panel de Vercel: solo quedan como recordatorio.
- La migración del campo `source`.

Cada uno de esos puntos, si se hace, va en su propia spec.

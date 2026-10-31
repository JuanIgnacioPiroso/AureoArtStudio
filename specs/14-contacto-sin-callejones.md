# SPEC 14 — Contacto sin callejones: Regalos y Productos empresariales

> **Estado:** Borrador
> **Depende de:** SPEC 11, SPEC 13
> **Fecha:** 2026-10-30
> **Objetivo:** Que las categorías sin producto en el Custom Lab («Regalos personalizados» y «Productos empresariales») siempre lleven a un lugar donde se pueda hacer el pedido, haya o no datos de contacto cargados.

---

## Por qué esta spec

La auditoría SEO de la home (2026-10-29) encontró un callejón sin salida. Las tarjetas «Regalos personalizados» y «Productos empresariales» llevan a `#contacto`. Mientras `business.ts` no tenga WhatsApp ni email, esa sección sólo muestra «Diseñar mi grabado» y la nota «Diseñá tu pieza en el Custom Lab y, al final, copiá o descargá el resumen…». Quien buscaba regalos para su empresa hace clic en «consultar por este producto» y no encuentra a quién consultar.

Son además los dos pedidos que más valen: las empresas compran por cantidad.

Con datos de contacto, `#contacto` tampoco es ideal: obliga a un segundo clic y el mensaje no dice por qué categoría se consulta.

---

## Alcance

**Entra:**

- **Destino de cada categoría**, en una función pura `categoryHref(c: Category, b: BusinessConfig)` en `src/content/categories.ts`:
  1. si la categoría tiene `labProductId` → `labProductHref(labProductId)` (como hoy);
  2. si no, y hay WhatsApp → enlace a `wa.me` con un mensaje armado para la categoría;
  3. si no, y hay email → `mailto:` con un asunto armado para la categoría;
  4. si no hay ningún canal → `LAB_PATH` (el Lab sin producto elegido).
- La función devuelve también el tipo de destino (`'lab' | 'whatsapp' | 'email'`), para armar el texto accesible y decidir si el enlace se abre en otra pestaña.
- **Mensajes por categoría** en un campo nuevo `inquiry` de `Category` (ver «Modelo de datos»):
  - Regalos: «Quiero consultar por un regalo personalizado.»
  - Productos empresariales: «Quiero consultar por productos con el logo de mi empresa.»
  - `categoryHref` antepone el saludo con `business.name`, igual que `ContactCta.astro`: «Hola, AUREO Art Studio. Quiero consultar por…».
- **Tarjetas** (`src/sections/Categories.astro`): usan `categoryHref`. El `aria-label` del enlace (SPEC 13) pasa a ser:
  - `lab`: «<nombre>, diseñarlo en el Custom Lab»;
  - `whatsapp`: «<nombre>, consultar por WhatsApp (se abre en otra pestaña)»;
  - `email`: «<nombre>, consultar por email».
  - Con `whatsapp`, el enlace lleva `target="_blank"` y `rel="noopener noreferrer"`.
- **Footer**: los enlaces de «Categorías» usan el mismo `categoryHref`. Hoy Regalos y Empresariales llevan a `/#productos`.
- **Sección de cierre** (`ContactCta.astro`): sin canales de contacto, la nota de fallback suma una línea para quien no encuentra su producto en el Lab: «¿Buscás otro objeto o un pedido para tu empresa? Diseñá algo parecido en el Custom Lab y contanos la idea en el resumen.»
- **Tests** `src/content/__tests__/categories.test.ts` para los cuatro casos de `categoryHref`, con los mensajes codificados en la URL.

**No entra:**

- Un formulario de contacto. El sitio es estático y no tiene backend para recibirlo.
- Un modo «consulta libre» dentro del Custom Lab.
- La página para empresas (SPEC 19). Cuando exista, «Productos empresariales» llevará ahí y esta regla queda para el resto.
- Cambiar los canales de contacto del Lab (`QuoteRequest.tsx`).
- Completar los datos de `business.ts`: los carga el negocio.

---

## Modelo de datos

```ts
// src/content/site.ts
export interface Category {
  // … campos actuales
  /** Consulta para WhatsApp o asunto de email cuando la categoría no tiene producto en el Lab, sin el saludo. */
  inquiry: string | null
}
```

`inquiry` es obligatorio cuando `labProductId` es `null`. Un test recorre `CATEGORIES` y lo comprueba.

```ts
// src/content/categories.ts
export type CategoryDestination = { href: string; kind: 'lab' | 'whatsapp' | 'email' }
export function categoryHref(c: Category, b: BusinessConfig): CategoryDestination
```

---

## Plan de implementación

1. **Modelo y función.** Sumar `inquiry` a `Category` y a las dos categorías sin producto. Crear `categoryHref` y sus tests.
2. **Tarjetas y footer.** Usar `categoryHref` en `Categories.astro` y en el footer, con el `aria-label` y el `target` que correspondan.
3. **Cierre.** Sumar la línea a la nota de fallback de `ContactCta.astro`.
4. **Verificación.**
   - Sin datos de contacto: las dos tarjetas llevan a `/custom-lab/`.
   - Con un WhatsApp de prueba (sin commitear): llevan a `wa.me` con el mensaje de cada una.
   - Con sólo un email de prueba: llevan a `mailto:` con el asunto de cada una.
   - `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] Sin WhatsApp ni email, ninguna tarjeta ni enlace del footer lleva a `#contacto` o a `#productos`.
- [ ] Sin WhatsApp ni email, «Regalos personalizados» y «Productos empresariales» llevan a `/custom-lab/` y se anuncian como «…, diseñarlo en el Custom Lab».
- [ ] Con WhatsApp de prueba, las dos llevan a `https://wa.me/<número>?text=…` con su mensaje, se abren en otra pestaña y se anuncian como «…, consultar por WhatsApp (se abre en otra pestaña)».
- [ ] Con sólo email de prueba, las dos llevan a `mailto:<email>?subject=…` con su texto.
- [ ] Las categorías con producto en el Lab llevan al mismo destino que antes.
- [ ] Sin canales de contacto, la sección de cierre muestra la línea para quien busca otro objeto o un pedido para empresas.
- [ ] Un test falla si una categoría sin `labProductId` no tiene `inquiry`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** con WhatsApp cargado, la tarjeta abre WhatsApp directo con el mensaje de la categoría. Es un clic menos y el negocio sabe desde el primer mensaje qué se consulta.
- **Sí:** WhatsApp antes que email. En Argentina es el canal habitual para consultas a talleres.
- **Sí:** sin canales, el Lab sin producto elegido. Es el único lugar del sitio desde donde hoy se puede armar un pedido, y el resumen del paso 5 admite contar la idea.
- **No:** ocultar las dos categorías hasta tener datos de contacto. Se perdería la señal de que el estudio hace regalos y pedidos para empresas, que también sirve para SEO.
- **No:** mantener `#contacto` como destino. Es justamente el callejón.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Sin canales, quien quiere un pedido para empresas llega al Lab y no encuentra su producto. | La línea nueva de la sección de cierre lo explica. Se resuelve del todo con datos de contacto o con la SPEC 19. |
| El mensaje de WhatsApp queda desactualizado si cambia el nombre del negocio. | El mensaje se arma con `business.name`, no con el nombre escrito a mano. |
| Un enlace `mailto:` no hace nada en una computadora sin cliente de correo. | Es un límite conocido de `mailto:`. WhatsApp tiene prioridad cuando está cargado. |

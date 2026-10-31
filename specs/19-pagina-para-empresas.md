# SPEC 19 — Página para empresas: regalos y productos con logo

> **Estado:** Borrador
> **Depende de:** SPEC 09, SPEC 12, SPEC 14, SPEC 15, SPEC 18
> **Fecha:** 2026-10-30
> **Objetivo:** Publicar `/regalos-empresariales/`, una página para quien compra para una empresa o un organismo: qué productos se graban con logo, cómo es el proceso para un pedido por cantidad, qué datos hacen falta, qué clientes ya confiaron y cómo pedir el presupuesto.

---

## Por qué esta spec

La auditoría SEO de la home (2026-10-29) encontró que el pedido más valioso, el de empresas, es el peor atendido:

- «Productos empresariales» es una tarjeta con una línea («Tu marca en objetos para equipos, clientes y eventos.») y, sin datos de contacto, llevaba a un callejón (lo resuelve la SPEC 14).
- Quien compra para una empresa busca otras cosas que quien compra un regalo: pedido mínimo, plazos por tanda, si se puede mandar el logo en vector, si hay una prueba antes de producir y si se emite factura.
- Las búsquedas son distintas: «regalos empresariales personalizados», «regalos corporativos con logo», «merchandising grabado láser», «regalos de fin de año para empleados».
- La home ya muestra logos de organismos públicos en «Confían en nosotros» (SPEC 09). Es la mejor prueba para este público y hoy no está cerca de nada que hable de empresas.

---

## Alcance

**Entra:**

- **Página** `src/pages/regalos-empresariales/index.astro` → `/regalos-empresariales/`, con `BaseLayout` (`path="/regalos-empresariales/"`).
  - `title`: «Regalos empresariales con logo · grabado láser» (46 caracteres);
  - `description`: «Grabamos el logo de tu empresa en cuchillos, mates, termos, tablas, copas y placas. Pedidos por cantidad, con vista 3D antes de producir.» (≤ 155, con test);
  - H1: «Regalos empresariales con el logo de tu marca».
- **Estructura:**
  1. Migas de pan: «Inicio › Empresas».
  2. H1, entrada de 2 oraciones y botón principal con el destino de `categoryHref` para `empresas` (SPEC 14): WhatsApp o email con el mensaje de empresas, o el Lab si no hay canales.
  3. **Para qué**: ocasiones en tarjetas cortas: regalos de fin de año, bienvenida de empleados, clientes y proveedores, eventos y congresos, reconocimientos y aniversarios. Cada una sugiere productos del Lab.
  4. **Productos que más se piden con logo**: tarjetas de productos del Lab (termos, mates de acero, cuchillo, tabla, copas, billetera, placas), con zona de grabado en mm y «Probar con tu logo» a `labProductHref(id)`. Reutiliza la tarjeta de producto de la SPEC 18.
  5. **Cómo trabajamos con empresas**: proceso en 5 pasos, con el componente de `Process.astro`:
     1. Nos mandás el logo y la cantidad.
     2. Te proponemos productos y ubicación del logo, con la vista del Custom Lab.
     3. Grabamos una muestra para aprobar *(si el taller la ofrece)*.
     4. Producimos la tanda.
     5. Entregamos o enviamos, con factura *(si corresponde)*.
  6. **Datos del pedido**: lista de condiciones desde `CORPORATE` (ver «Modelo de datos»). Cada línea sólo aparece si su dato no es `null`.
  7. **Confían en nosotros**: los mismos logos de la SPEC 09 (`TrustedBy.astro`), en su versión quieta (sin carrusel).
  8. **Preguntas**: propias de empresas (en `null` hasta que las confirme el taller) y las generales de compra respondidas.
  9. Cierre con `ContactCta.astro`.
- **Formato del logo**: un bloque corto con lo que hace falta: vector (SVG, PDF, AI o EPS) o PNG transparente de al menos 1000 px de ancho, y que el láser graba un solo tono (sin degradés ni fotos).
- **Enlaces que llegan a la página:**
  - la tarjeta «Productos empresariales» de la home lleva acá (reemplaza el destino de la SPEC 14 y el de la SPEC 18);
  - el footer, en «Categorías»;
  - la sección «Confían en nosotros» de la home suma un enlace chico «Pedidos para empresas».
- **`TrustedBy.astro`**: prop nueva `static` que muestra los logos en grilla, sin animación ni copias (como hoy con movimiento reducido).
- **JSON-LD**: `BreadcrumbList`, `Service` (`serviceType: 'Grabado láser de regalos empresariales'`, `provider` → `@id` del negocio, `areaServed` desde `business.city` si existe) y `FAQPage` si hay preguntas respondidas.
- **README**: entrada en «Datos pendientes del negocio» con los campos de `CORPORATE`.
- **Tests**: longitudes de `title` y `description`; con todo `CORPORATE` en `null`, la sección «Datos del pedido» no se renderiza.

**No entra:**

- Precios por cantidad o tabla de descuentos.
- Un formulario para subir el logo. El Lab ya admite subirlo y el resumen del paso 5 lo incluye.
- Testimonios o casos de cliente escritos.
- Logos clickeables o con enlace al sitio de cada organización (sigue fuera de alcance, como en la SPEC 09).
- Verificar los logos de «Confían en nosotros»: lo hace el negocio antes de publicar esta página (ver «Riesgos»).

---

## Modelo de datos

```ts
// src/content/corporate.ts
/** Condiciones de los pedidos para empresas. null = pendiente; no se muestra. */
export const CORPORATE = {
  /** p. ej. "10 unidades" */
  minimumOrder: null as string | null,
  /** p. ej. "15 días hábiles desde que se aprueba la muestra" */
  leadTime: null as string | null,
  /** true si se graba una muestra para aprobar antes de la tanda. */
  sample: null as boolean | null,
  /** p. ej. "Factura A y B" */
  invoicing: null as string | null,
  /** p. ej. "Envíos a todo el país; entregas en CABA y GBA" */
  delivery: null as string | null,
}

export const CORPORATE_FAQ: Faq[] = [
  { q: '¿Cuál es el pedido mínimo?', a: null },
  { q: '¿Puedo ver una muestra antes de la tanda completa?', a: null },
  { q: '¿Se puede grabar un logo distinto en cada pieza, o un nombre por persona?', a: null },
  { q: '¿Emiten factura A?', a: null },
  { q: '¿Cuánto tarda un pedido de 50 o 100 unidades?', a: null },
]
```

---

## Plan de implementación

1. **Datos.** Crear `corporate.ts` y la entrada del README.
2. **Logos quietos.** Prop `static` en `TrustedBy.astro`.
3. **Página.** Crear `/regalos-empresariales/` con sus secciones, reutilizando la tarjeta de producto (SPEC 18), `Process.astro` y `ContactCta.astro`.
4. **Enlaces.** Tarjeta de la home, footer y enlace desde «Confían en nosotros».
5. **JSON-LD.** `BreadcrumbList`, `Service` y `FAQPage`.
6. **Verificación.** Capturas a 1440 y 375 px con el Chromium de Playwright por CDP, con `CORPORATE` vacío y con datos de prueba (sin commitear). Validador de schema.org. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] `/regalos-empresariales/` responde, tiene un solo `<h1>` y aparece en el sitemap.
- [ ] El botón principal sigue la regla de `categoryHref` para empresas: WhatsApp, email o Lab.
- [ ] Cada «Probar con tu logo» abre el producto correcto en el Lab.
- [ ] Con `CORPORATE` vacío, no hay sección «Datos del pedido» ni rótulos vacíos.
- [ ] Con datos de prueba, cada condición aparece en su línea.
- [ ] Los logos se ven en grilla, sin animación, y cada uno se lee una sola vez con lector de pantalla.
- [ ] Sin logos en `src/assets/logos/`, la sección «Confían en nosotros» no aparece.
- [ ] La tarjeta «Productos empresariales» de la home y el footer llevan a esta página.
- [ ] El validador de schema.org no muestra errores.
- [ ] En 375 px no hay scroll horizontal.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** página propia y no una más de la ruta de categorías. Quien compra para una empresa decide por condiciones (mínimo, plazos, factura) y no por producto.
- **Sí:** URL `/regalos-empresariales/`. Es como se busca en Argentina; «productos empresariales» casi no se busca.
- **Sí:** los logos de clientes en esta página. Para este público es la prueba más fuerte.
- **Sí:** la muestra para aprobar figura en el proceso con una marca de pendiente. Es lo que más baja el riesgo para una empresa, pero sólo se publica si el taller la ofrece.
- **No:** precios por cantidad. Dependen del producto y del logo, y un precio publicado se desactualiza rápido.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Algún logo de «Confían en nosotros» no es cliente de AUREO (por ejemplo, si fue cliente de otro taller). Mostrarlo en una página de ventas para empresas lo vuelve más visible. | **Antes de publicar**, el negocio confirma cada logo de `src/assets/logos/`. Un logo dudoso se saca de la carpeta. |
| La página se publica con todo `CORPORATE` en `null` y no responde lo que busca una empresa. | El aviso de desarrollo y el README listan los datos pendientes. La página igual sirve por productos, proceso y logos. |
| El paso «Grabamos una muestra» promete algo que el taller no hace. | El paso sólo se muestra si `CORPORATE.sample` es `true`. |
| Los logos de organismos públicos implican un aval que no existe. | El título «Confían en nosotros» describe una relación comercial y no un aval. No se usan sus nombres en textos de venta. |

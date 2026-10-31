# SPEC 15 — Preguntas frecuentes de compra y su JSON-LD

> **Estado:** Borrador
> **Depende de:** SPEC 12
> **Fecha:** 2026-10-30
> **Objetivo:** Que el FAQ de la home responda lo que pregunta alguien antes de comprar (precio, plazos, envíos, pedidos por cantidad, uso con alimentos, cuidado, formato del logo) y que las preguntas respondidas se publiquen también como datos estructurados `FAQPage`.

---

## Por qué esta spec

La auditoría SEO de la home (2026-10-29) encontró que el FAQ tiene 3 preguntas visibles y las tres son sobre el simulador. Las dudas de compra no aparecen:

- 4 preguntas ya están cargadas con `a: null` (diseño propio, materiales, pagos y entregas, plazos) y no se muestran.
- Faltan precio, envíos y zona, pedido mínimo y pedidos para empresas, si una tabla grabada se puede usar con alimentos, cómo cuidar una pieza grabada y en qué formato mandar un logo.

La página de tablas personalizadas de Vistaprint, la única competidora que se pudo leer completa en la auditoría, responde 7 preguntas de este tipo. Los resultados locales (directorios por ciudad) muestran envíos, zona y medios de pago.

Las respuestas dependen del taller. Esta spec arma las preguntas, propone borradores para que el negocio los valide y deja todo en `null` hasta entonces, igual que hoy.

---

## Alcance

**Entra:**

- **Preguntas** en `FAQ` de `src/content/site.ts`, en este orden (las 3 respondidas no cambian):
  1. ¿La vista 3D muestra exactamente cómo va a quedar? *(respondida)*
  2. ¿Cómo pido un presupuesto? *(respondida)*
  3. ¿Cuánto cuesta un grabado personalizado? *(nueva)*
  4. ¿Cuánto tarda un pedido? *(ya estaba)*
  5. ¿Hacen envíos? ¿A qué zonas? *(nueva; reemplaza «¿Cómo se coordinan los pagos y las entregas?»)*
  6. ¿Cómo se paga? *(nueva; la otra mitad de la pregunta reemplazada)*
  7. ¿Hacen pedidos por cantidad o para empresas? *(nueva)*
  8. ¿Puedo enviar mi propio diseño o logo? ¿En qué formato? *(ya estaba; se suma el formato)*
  9. ¿Qué materiales se pueden grabar? *(ya estaba)*
  10. ¿Las tablas grabadas se pueden usar con alimentos? *(nueva)*
  11. ¿Cómo cuido una pieza grabada? *(nueva)*
  12. ¿Puedo retomar un diseño más tarde? *(respondida; pasa al final)*
- Todas las nuevas entran con `a: null`. Las respuestas sugeridas de abajo **no** se cargan hasta que el negocio las confirme.
- **Respuestas con enlaces**: `Faq.a` admite un enlace opcional al final (ver «Modelo de datos»). Lo usa «¿Qué materiales se pueden grabar?» para llevar a la guía de materiales cuando exista (SPEC 17).
- **JSON-LD** en `Faq.astro`: un bloque `FAQPage` con las preguntas respondidas, armado por una función pura `faqSchema(items)` en `src/config/seo.ts`. Sin ninguna pregunta respondida, no hay bloque. Se imprime con `JsonLd.astro` (SPEC 12).
- **README**: la entrada «FAQ» de «Datos pendientes del negocio» se actualiza con la lista nueva y apunta a esta spec para los borradores.
- **Tests**: `faqSchema` (sin respondidas → `null`; las preguntas con `a: null` no aparecen; el texto del enlace se incluye en la respuesta).

**No entra:**

- Cargar respuestas sin la confirmación del negocio.
- Preguntas por categoría para las páginas de categoría (SPEC 18).
- Cambiar el diseño del acordeón (`<details>`).
- Un buscador o filtro de preguntas.

---

## Modelo de datos

```ts
// src/content/site.ts
export interface Faq {
  q: string
  a: string | null
  /** Enlace opcional al final de la respuesta. */
  link?: { href: string; label: string }
}
```

```ts
// src/config/seo.ts
export function faqSchema(items: readonly Faq[]): object | null
// { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } }] }
```

---

## Respuestas sugeridas (para validar con el taller)

Son borradores. Los datos entre corchetes los completa el negocio.

- **¿Cuánto cuesta un grabado personalizado?** Depende del objeto, del tamaño del grabado y de la cantidad. Un grabado de nombre en un objeto nuestro arranca en [precio desde]. Diseñalo en el Custom Lab y te pasamos el presupuesto exacto.
- **¿Cuánto tarda un pedido?** Una vez confirmado el diseño, [N] días hábiles para piezas sueltas. Los pedidos por cantidad se coordinan aparte.
- **¿Hacen envíos? ¿A qué zonas?** [Retiro en el taller en ZONA.] Enviamos a [todo el país / zonas] por [empresa de envíos]. El costo de envío se suma al presupuesto.
- **¿Cómo se paga?** [Transferencia, Mercado Pago…]. [Seña del N % para empezar el pedido y el resto al entregar.]
- **¿Hacen pedidos por cantidad o para empresas?** Sí. Grabamos tu logo en tandas de [mínimo] piezas o más, para equipos, clientes y eventos. [Emitimos factura A.]
- **¿Puedo enviar mi propio diseño o logo? ¿En qué formato?** Sí. Lo podés subir en el Custom Lab. Para logos, lo ideal es un archivo vectorial (SVG, PDF o AI). Un PNG con fondo transparente y buena resolución también sirve.
- **¿Qué materiales se pueden grabar?** Madera, acero, alpaca, vidrio, acrílico, mármol y cuero. Cada uno toma el grabado distinto. [Enlace a la guía de materiales.]
- **¿Las tablas grabadas se pueden usar con alimentos?** Sí. El láser quema la superficie de la madera y no agrega tintas ni pinturas. [Las terminamos con aceite apto para alimentos.] Recomendamos usar la cara sin grabar para cortar.
- **¿Cómo cuido una pieza grabada?** Madera: lavar a mano, secar enseguida y aceitar cada tanto con aceite apto para alimentos. Acero y vidrio: se pueden lavar como siempre; [evitar el lavavajillas en las piezas con marcado oscuro]. Cuero: mantener seco y usar crema para cuero.

---

## Plan de implementación

1. **Modelo.** Sumar `link` opcional a `Faq` y reordenar `FAQ` con las preguntas nuevas en `null`.
2. **Respuesta con enlace.** `Faq.astro` imprime el enlace después del texto cuando existe.
3. **JSON-LD.** Crear `faqSchema` y sus tests; usarlo en `Faq.astro`.
4. **README.** Actualizar la entrada «FAQ».
5. **Verificación.** Con las respuestas en `null`, la home se ve igual que antes. Con una respuesta de prueba cargada (sin commitear), aparece en el acordeón y en el JSON-LD. Pegar el JSON-LD en el validador de schema.org. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

- [ ] `FAQ` tiene las 12 preguntas en el orden de esta spec.
- [ ] Con las respuestas nuevas en `null`, la home muestra las mismas 3 preguntas que antes.
- [ ] La home tiene un JSON-LD `FAQPage` con exactamente las preguntas visibles, y con el mismo texto.
- [ ] Una pregunta con `a: null` no aparece ni en la página ni en el JSON-LD.
- [ ] Una respuesta con `link` muestra el enlace después del texto.
- [ ] El validador de schema.org no muestra errores.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** las respuestas quedan en `null` hasta que las confirme el negocio. Un plazo o un precio inventado en la web es una promesa.
- **Sí:** se publica `FAQPage` aunque Google ya no muestre el resultado enriquecido de FAQ para la mayoría de los sitios (lo limitó en 2023 a sitios de gobierno y de salud). Le da a Google y a los buscadores con IA las preguntas y respuestas separadas y sin ambigüedad, y no cuesta nada mantenerlo porque sale de los mismos datos.
- **Sí:** «pagos y entregas» se separa en dos preguntas. Son dos búsquedas distintas («hacen envíos», «cómo se paga») y la respuesta junta queda larga.
- **Sí:** la pregunta del simulador sobre retomar un diseño pasa al final. Es la menos urgente antes de comprar.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Las respuestas nunca se cargan y el FAQ queda igual que hoy. | El aviso de desarrollo (SPEC 12) y el README listan las preguntas pendientes. |
| Doce preguntas hacen larga la sección. | Son acordeones cerrados; cada pregunta ocupa una línea. |
| La respuesta sobre alimentos se lee como una garantía sanitaria. | El borrador describe el proceso y recomienda usar la cara sin grabar para cortar. El negocio la valida antes de publicarla. |
| El JSON-LD y el texto visible se desfasan. | Los dos salen de la misma lista `FAQ`, filtrada igual. |

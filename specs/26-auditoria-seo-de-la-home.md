# SPEC 26 — Auditoría SEO de la home

> **Estado:** Implementado
> **Depende de:** SPEC 19, SPEC 22, SPEC 23, SPEC 25
> **Fecha:** 2026-11-04
> **Objetivo:** Aplicar las mejoras rápidas y estratégicas de la auditoría SEO de la home: canonical con el host real, title y description con placas, respuestas concretas de plazos, envíos y pagos, schema local más completo, categorías ordenadas por lo que se puede mostrar, equipos del taller en la guía de materiales, casos institucionales con nombre y una galería sin 45 `<h3>`.

---

## Por qué esta spec

La auditoría de la home encontró que:

- **El canonical apunta a una redirección.** Producción responde en `https://www.aureoartstudio.com/`, y `https://aureoartstudio.com/` devuelve un 308 hacia www. Pero `business.siteUrl` es el dominio sin www, así que el canonical, el `og:url`, el sitemap y la línea `Sitemap:` de `robots.txt` apuntan a una URL que redirige.
- **La página promete lo que no puede mostrar.** El hero y la grilla abren con cuchillos, tablas y cuero, que tienen fotos ilustrativas de Wikimedia. Mientras tanto, la galería está hecha casi toda de placas y reconocimientos para embajadas, la Armada, municipios y universidades.
- **El FAQ no contesta lo que contesta la competencia.** Plazo, envíos y pagos dicen «consultanos». Los competidores publican medios de pago y zonas de envío.
- **Faltan términos del oficio:** *corte láser*, *láser de fibra* y *CO₂*, *rotativo*. El taller tiene los tres equipos.
- **El outline de la home son 45 `<h3>` de la galería.** Tapan las secciones reales.

Los datos nuevos los confirmó el negocio el 2026-11-04:
- plazo típico de 3 a 5 días hábiles con el diseño aprobado
- pago por transferencia, Mercado Pago o efectivo
- retiro en el taller, envío en CABA y GBA, y envío al interior
- equipos: láser de fibra, láser CO₂, corte láser y rotativo

---

## Alcance

**Entra:**

- **`src/config/business.ts`**
  - `siteUrl` pasa a `https://www.aureoartstudio.com/`, el host que responde en producción.
  - Campos nuevos:
    - `postalCode` y `openingHours`, en `null` mientras estén pendientes
    - `paymentAccepted`: medios de pago, en texto
    - `areaServed`: zonas de entrega
- **`src/config/seo.ts`:** `organizationSchema` suma `paymentAccepted`, `areaServed` (como `AdministrativeArea` o `Country`), `openingHours` y `postalCode` dentro de `address`. `compact` saca los que estén en `null`, como siempre.
- **`src/content/site.ts`**
  - `HOME_SEO.title` pasa a «Grabado láser en CABA: placas, mates y regalos · AUREO» (54 caracteres).
  - `HOME_SEO.description` abre con placas y trofeos, sin perder los cinco productos del Lab.
  - El orden de `CATEGORIES` pasa a ser: placas, empresas, termos y mates, copas, regalos, cuchillos, tablas, cuero. Primero van las que tienen foto propia; al final, las tres con foto ilustrativa. Ese orden se ve en la home, el footer y los filtros de la galería.
  - `PURCHASE_FAQ`: respuestas concretas de plazo (3 a 5 días hábiles; los pedidos por cantidad se cotizan aparte) y de envíos (retiro, CABA y GBA, interior).
  - FAQ «¿Cómo se paga?»: transferencia, Mercado Pago o efectivo.
- **`src/sections/Hero.astro`:** el H1 pasa a «Grabado láser personalizado en Buenos Aires.» (largo parecido al anterior, para no romper el techo de líneas de `.hero__title`), y la bajada suma placas y trofeos y a empresas e instituciones.
- **`src/sections/Differentials.astro`:** el párrafo de oficio nombra el láser de fibra y el CO₂, el rotativo y el corte láser.
- **`src/content/materials.ts` y `src/pages/materiales/index.astro`**
  - `MaterialGuide` suma `laser: 'fibra' | 'co2'`.
  - Columna «Equipo» en la comparativa y dato «Equipo» en cada ficha.
  - Sección nueva «Grabado y corte láser»: qué se corta (acrílico, MDF, madera), con el ejemplo del logo recortado de Linde, y qué es el rotativo.
- **`src/sections/TrustedBy.astro`:** bajo los logos, una lista de cuatro trabajos institucionales con nombre (Embajada Argentina, ARA San Juan, Facultad de Filosofía y Letras de la UBA, Armada Argentina). Cada uno abre su obra en la galería (`/?obra=<id>#galeria`). Suma el enlace «Placas y reconocimientos» junto a «Pedidos para empresas».
- **`src/components/WorkGrid.astro`:** el título de cada trabajo pasa de `<h3>` a `<p class="work__title">`. `.work__title` copia `line-height` y `text-wrap` de los headings, así que no cambia cómo se ve.
- **Tests:** `seo-copy.test.ts` también exige «placas» en la description, y `seo.test.ts` cubre los campos nuevos del schema.

**No entra:**

- **Reseñas.** No hay perfil de Google Business ni testimonios reales; no se inventan. Cuando existan, van junto al CTA final.
- **Años en el rubro y cantidad de piezas grabadas:** pendientes del negocio.
- **`geo`, código postal y horario:** quedan en `null` hasta tener los datos reales.
- **Fotos propias de cuchillos, tablas y cuero.** Es trabajo del SPEC 22: hoy sólo bajan en la grilla.
- **La redirección de Vercel:** se sigue usando www como host principal.

---

## Decisiones

- **www y no el dominio sin www.** Es el host que ya sirve Vercel. Cambiar `siteUrl` es una línea; invertir la redirección es tocar la configuración del dominio y esperar la propagación.
- **Fibra o CO₂ por material:** fibra para acero, alpaca, dorado y metal pintado; CO₂ para madera, vidrio, acrílico, mármol y cuero. Es la asignación habitual. **Validar con el taller el metal pintado**, que también puede hacerse con CO₂.
- **El orden de las categorías vale para todo el sitio.** No se arma un orden aparte para la home: una sola lista evita que el footer y la grilla cuenten cosas distintas.
- **La description sigue nombrando los cinco productos del Lab.** El test de `seo-copy.test.ts` lo pide y la keyword de cada categoría sigue en la home. Se agregan placas y trofeos al principio.

# SPEC 12 — SEO técnico base: canonical, Open Graph absoluto, sitemap, robots y datos estructurados

> **Estado:** Implementado
> **Depende de:** SPEC 08, SPEC 09
> **Fecha:** 2026-10-30
> **Objetivo:** Que cada página publique su URL canónica, una imagen de Open Graph con URL absoluta, un sitemap, un `robots.txt` y datos estructurados del negocio (JSON-LD), todo armado a partir de `src/config/business.ts` y sin mostrar datos que falten.

---

## Por qué esta spec

La auditoría SEO de la home (2026-10-29) le dio 3/10 a la dimensión técnica. Faltan las bases que Google y las redes sociales usan para entender el sitio:

- No hay `<link rel="canonical">`. `/custom-lab/?producto=knife`, `/custom-lab/?d=…` y `/custom-lab/` son URLs distintas con el mismo contenido.
- `og:image` es `/og-image.png`, una ruta relativa. WhatsApp, Facebook y LinkedIn necesitan una URL absoluta para mostrar la vista previa.
- No hay `og:url` ni `og:image:alt`.
- `robots.txt` y el sitemap dan 404.
- No hay ningún JSON-LD. Google no tiene una forma estructurada de saber que AUREO es un negocio, dónde trabaja ni cómo contactarlo.
- La copia `aria-hidden` del carrusel de logos (`TrustedBy.astro`) tiene `<img>` sin atributo `alt`. Los validadores lo marcan como error.

Casi todo depende de `business.siteUrl`, que hoy está en `null`. La spec deja todo armado para que, al completar ese dato, el sitio quede listo sin tocar código, igual que pasa hoy con los botones de contacto.

---

## Alcance

**Entra:**

- **URL del sitio en la config de Astro** (`astro.config.mjs`): `site` toma `business.siteUrl` (importado de `src/config/business.ts`). Con `null`, `site` queda sin definir.
- **Helper** `src/config/seo.ts` con funciones puras:
  - `absoluteUrl(path: string): string | null`: une `business.siteUrl` (sin barra final) con `path`. Con `siteUrl` en `null` devuelve `null`;
  - `organizationSchema(b: BusinessConfig): object`: arma el JSON-LD del negocio (ver «Modelo de datos»);
  - `websiteSchema(b: BusinessConfig): object | null`: `WebSite` con `name` y `url`; `null` sin `siteUrl`.
- **`BaseLayout.astro`**:
  - nueva prop obligatoria `path` (`'/'` o `'/custom-lab/'`): la ruta canónica de la página, sin query string;
  - `<link rel="canonical">` y `<meta property="og:url">` con `absoluteUrl(path)`, sólo si no es `null`;
  - `og:image` con `absoluteUrl('/og-image.png')`; sin `siteUrl` queda la ruta relativa de hoy;
  - `og:image:width` `1200`, `og:image:height` `630` y `og:image:alt` con un texto que describa la imagen;
  - `twitter:title` y `twitter:description` con los mismos valores que `og:title` y `og:description`;
  - nuevo slot `jsonld` para que cada página sume sus bloques.
- **Componente** `src/components/seo/JsonLd.astro`: recibe `data: object | null` y, si no es `null`, imprime `<script type="application/ld+json">` con `JSON.stringify` (con `<` escapado como `<`).
- **Home** (`src/pages/index.astro`): `path="/"` y, en el slot `jsonld`, `organizationSchema(business)` y `websiteSchema(business)`.
- **Custom Lab** (`src/pages/custom-lab/index.astro`): `path="/custom-lab/"`. Toda variante con `?producto=` o `?d=` declara como canónica `/custom-lab/`. Sin JSON-LD.
- **Sitemap**: la integración `@astrojs/sitemap`, que sólo se suma a `integrations` si `site` está definido. Genera `sitemap-index.xml` en el build.
- **`robots.txt`** como endpoint estático `src/pages/robots.txt.ts`:
  - siempre: `User-agent: *` y `Allow: /`;
  - con `siteUrl`: además `Sitemap: <siteUrl>/sitemap-index.xml`.
- **Logos duplicados** (`TrustedBy.astro`): todas las `<img>` de las copias `aria-hidden` llevan `alt=""` explícito, también las que pasan por `<Image>`.
- **Aviso de desarrollo** (`DevConfigNotice.astro`): si falta `siteUrl`, agrega una línea que explica que sin ese dato no hay canonical, sitemap ni Open Graph absoluto.
- **README**: en «Datos pendientes del negocio», sumar a la entrada de `business.ts` qué se activa al completar `siteUrl`, `city` y `address`.
- **Tests** `src/config/__tests__/seo.test.ts` para `absoluteUrl`, `organizationSchema` y `websiteSchema`.

**No entra:**

- Cambiar títulos, descripciones o el H1 (SPEC 13).
- JSON-LD de preguntas frecuentes (SPEC 15), de páginas de categoría o de migas de pan (SPEC 18).
- `hreflang`: el sitio tiene un solo idioma.
- Una imagen de Open Graph distinta por página.
- Registrar el sitio en Google Search Console o en Google Business Profile. Lo hace el negocio cuando publique.
- Redirecciones o un dominio canónico con o sin `www`: se resuelven en Vercel.

---

## Modelo de datos

No cambia `BusinessConfig`. Lo que arma `organizationSchema`:

```ts
// src/config/seo.ts
// Con city o address → LocalBusiness; sin ninguno → Organization.
{
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',            // u 'Organization'
  '@id': `${siteUrl}/#negocio`,        // sólo con siteUrl
  name: b.name,
  legalName: b.legalName,              // sólo si no es null
  url: siteUrl,                        // sólo con siteUrl
  logo: `${siteUrl}/favicon.svg`,      // sólo con siteUrl
  image: `${siteUrl}/og-image.png`,    // sólo con siteUrl
  description: 'Estudio de grabado láser personalizado…',
  telephone: `+${b.whatsapp}`,         // sólo con whatsapp
  email: b.email,                      // sólo con email
  sameAs: [b.instagram, b.facebook],   // sólo los que no son null; sin ninguno, no va
  address: {                           // sólo con city o address
    '@type': 'PostalAddress',
    streetAddress: b.address,          // sólo si no es null
    addressLocality: b.city,           // sólo si no es null
    addressCountry: 'AR',
  },
}
```

Regla general: una propiedad cuyo valor sería `null`, `undefined` o una lista vacía no se escribe.

---

## Plan de implementación

1. **Helper y tests.** Crear `src/config/seo.ts` y sus tests. `npm run test` pasa.
2. **Layout.** Sumar la prop `path`, canonical, `og:url`, `og:image` absoluta con medidas y alt, las etiquetas de Twitter y el slot `jsonld`. Pasar `path` desde las dos páginas. `npm run typecheck` pasa.
3. **JSON-LD.** Crear `JsonLd.astro` y usarlo en la home.
4. **Sitemap y robots.** Instalar `@astrojs/sitemap`, leer `siteUrl` en `astro.config.mjs` y crear `robots.txt.ts`.
5. **Logos.** `alt=""` en las copias del carrusel.
6. **Aviso y README.** Actualizar `DevConfigNotice.astro` y el README.
7. **Verificación.**
   - Build con `siteUrl: null`: no hay canonical ni `og:url`, no se genera sitemap y `robots.txt` no tiene línea `Sitemap`.
   - Build con un `siteUrl` de prueba (`https://example.com`, sin commitear): aparecen canonical, `og:url`, `og:image` absoluta y `sitemap-index.xml` con las dos páginas.
   - Pegar el JSON-LD de la home en el validador de schema.org.
   - `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

---

## Criterios de aceptación

**Sin `siteUrl` (estado actual)**

- [ ] El build termina sin errores ni avisos nuevos.
- [ ] La home no tiene `rel="canonical"` ni `og:url`.
- [ ] `og:image` sigue siendo `/og-image.png` y tiene `og:image:alt`, `og:image:width` y `og:image:height`.
- [ ] `/robots.txt` responde 200 con `User-agent: *` y `Allow: /`, sin línea `Sitemap`.
- [ ] La home tiene un JSON-LD `Organization` con `name` y `description`, sin propiedades vacías ni `null`.
- [ ] En desarrollo, el aviso lista qué se pierde sin `siteUrl`.

**Con `siteUrl` de prueba**

- [ ] La home tiene `<link rel="canonical" href="https://example.com/">`.
- [ ] `/custom-lab/?producto=knife` tiene `<link rel="canonical" href="https://example.com/custom-lab/">`.
- [ ] `og:image` es `https://example.com/og-image.png`.
- [ ] Se genera `sitemap-index.xml` y lista `/` y `/custom-lab/`.
- [ ] `robots.txt` termina en `Sitemap: https://example.com/sitemap-index.xml`.
- [ ] Con `city` de prueba, el JSON-LD es `LocalBusiness` con `address.addressLocality` y `addressCountry: "AR"`.
- [ ] El validador de schema.org no muestra errores.

**Código**

- [ ] Ninguna `<img>` de la home queda sin atributo `alt`.
- [ ] `BaseLayout` no tiene la ruta `/og-image.png` escrita a mano fuera de `seo.ts`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` terminan sin errores.

---

## Decisiones

- **Sí:** todo depende de `business.siteUrl`. Una URL canónica inventada o de prueba en producción haría más daño que no tenerla.
- **Sí:** `LocalBusiness` sólo cuando hay ciudad o dirección. Google trata la búsqueda de «grabado láser» como local (los resultados son directorios por ciudad), pero un `LocalBusiness` sin ubicación no aporta.
- **No:** un subtipo más específico de `LocalBusiness` (`Store`, `ProfessionalService`). Ninguno describe bien un taller de grabado y el genérico es válido.
- **Sí:** el canonical del Lab ignora los parámetros. Un diseño compartido (`?d=`) no es contenido nuevo.
- **Sí:** `robots.txt` como endpoint y no como archivo en `public/`. Así la línea `Sitemap` sale de la misma config.
- **No:** `noindex` en el Lab. Es la página que diferencia al sitio y tiene que poder posicionar por «simulador de grabado».

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `astro.config.mjs` no puede importar un `.ts` de `src/`. | Astro carga su config con Vite, que resuelve TypeScript. Si falla, `siteUrl` pasa a una variable de entorno `PUBLIC_SITE_URL` que lee `business.ts`, y se documenta en el README. |
| Se publica con un `siteUrl` mal escrito (con `www` o sin él, o con `http`). | `absoluteUrl` quita la barra final. El README pide copiar la URL exacta con la que responde Vercel. |
| El favicon SVG como `logo` no cumple las pautas de Google para logos (prefiere raster, mínimo 112 × 112 px). | Aceptado por ahora. Cuando haya un logo en PNG se cambia en `seo.ts`. |
| Un JSON-LD con datos del negocio que todavía no están validados. | Sólo se publican campos que no son `null`, y esos los completa el negocio. |

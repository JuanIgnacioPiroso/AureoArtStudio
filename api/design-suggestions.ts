import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { aiError, json } from '../server/http'
import { ENGRAVING_STYLES, FONT_CATEGORY_LABEL, FONTS, getProduct, getSurface, partMaterial, PRODUCTS, stylesForSurface } from '../src/lab/model/catalog'
import { MAX_LINE_LENGTH } from '../src/lab/model/types'
import { SuggestionRequestSchema, SuggestionsResponseSchema, type SuggestionsResponse } from '../src/lab/services/aiContract'

const SYSTEM = `Sos el asistente de diseño de AUREO Art Studio, un estudio de grabado láser personalizado en Argentina.
Ayudás a convertir una idea en propuestas de grabado concretas y realizables sobre una zona grabable con medidas fijas.

Reglas:
- Escribí en español rioplatense, con voseo, tono cálido y profesional.
- Devolvé exactamente 3 propuestas distintas entre sí (por ejemplo: clásica, sobria, emotiva).
- Cada línea de texto tiene como máximo ${MAX_LINE_LENGTH} caracteres. Si el usuario no dio un dato (nombre, fecha), no lo inventes: usá un marcador claro entre corchetes, como [Nombre] o [Fecha].
- Usá solo las tipografías, alineaciones y estilos de grabado permitidos que te paso. Variá las tipografías entre propuestas.
- Elegí un tamaño (sizeMm) dentro del rango indicado y que entre en la zona: estimá que cada carácter ocupa ~0,6 veces la altura.
- El motivo gráfico es solo una idea para conversar con el taller: describilo en pocas palabras, o dejalo vacío.
- No prometas precios, plazos ni resultados exactos.`

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return aiError('invalid_request', 'El pedido no es JSON válido.', 400)
  }
  const parsed = SuggestionRequestSchema.safeParse(body)
  if (!parsed.success || !PRODUCTS.some((p) => p.id === parsed.data.productId)) {
    return aiError('invalid_request', 'Revisá el texto: tiene que tener entre 3 y 600 caracteres.', 400)
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return aiError('ai_not_configured', 'El asistente de IA todavía no está configurado en este sitio.', 503)
  }

  const req = parsed.data
  const product = getProduct(req.productId)
  const surface = getSurface(product, req.surfaceId)
  const material = partMaterial(product, surface.part, req.materialId)
  const styles = stylesForSurface(product, surface, req.materialId)

  const context = [
    `Objeto: ${product.name}.`,
    `Zona grabable: ${surface.name}, ${surface.widthMm} × ${surface.heightMm} mm${surface.curved ? ', superficie curva' : ''}.`,
    `Material de la zona: ${material.name}.`,
    `Rango de tamaño de la línea principal: ${surface.sizeRange[0]}–${surface.sizeRange[1]} mm.`,
    `Tipografías (fontId): ${Object.values(FONTS).map((f) => `${f.id} = ${f.name} (${FONT_CATEGORY_LABEL[f.category].toLowerCase()})`).join('; ')}.`,
    `Estilos de grabado permitidos (styleId): ${styles.map((s) => `${s.id} = ${ENGRAVING_STYLES[s.id].name}`).join('; ')}.`,
  ].join('\n')

  const client = new Anthropic()
  try {
    const response = await client.messages.parse({
      model: process.env.AI_MODEL || 'claude-sonnet-5',
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low', format: zodOutputFormat(SuggestionsResponseSchema) },
      system: SYSTEM,
      messages: [{ role: 'user', content: `${context}\n\nIdea del cliente:\n${req.prompt}` }],
    })

    if (response.stop_reason === 'refusal') {
      return aiError('refused', 'No podemos generar ideas para ese pedido. Probá describirlo de otra forma.', 422)
    }
    const out = response.parsed_output
    if (!out || out.suggestions.length === 0) {
      return aiError('upstream_error', 'El asistente no devolvió propuestas. Probá de nuevo.', 502)
    }
    const allowed = new Set(styles.map((s) => s.id))
    const result: SuggestionsResponse = {
      suggestions: out.suggestions.slice(0, 3).map((s) => ({
        ...s,
        primary: s.primary.slice(0, MAX_LINE_LENGTH),
        secondary: s.secondary.slice(0, MAX_LINE_LENGTH),
        styleId: allowed.has(s.styleId) ? s.styleId : styles[0]!.id,
        sizeMm: Math.min(surface.sizeRange[1], Math.max(surface.sizeRange[0], s.sizeMm)),
      })),
    }
    return json(result)
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return aiError('rate_limited', 'Hay muchas consultas en este momento. Esperá unos segundos y probá de nuevo.', 429)
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('[design-suggestions] credenciales inválidas')
      return aiError('ai_not_configured', 'El asistente de IA no está disponible por un problema de configuración.', 503)
    }
    if (err instanceof Anthropic.APIError) {
      console.error('[design-suggestions]', err.status, err.message)
      return aiError('upstream_error', 'El asistente no respondió. Probá de nuevo en un momento.', 502)
    }
    console.error('[design-suggestions]', err)
    return aiError('upstream_error', 'No pudimos generar ideas. Probá de nuevo.', 500)
  }
}

/** Disponibilidad del asistente, para no intentar pedidos que van a fallar. */
export async function GET(): Promise<Response> {
  return json({ available: Boolean(process.env.ANTHROPIC_API_KEY) })
}

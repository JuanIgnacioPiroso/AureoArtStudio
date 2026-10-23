import { aiError, json } from '../server/http'
import { configuredProvider, generateMockup, ProviderError } from '../server/imageProviders'
import { PRODUCTS } from '../src/lab/model/catalog'
import { MockupRequestSchema, type MockupResponse } from '../src/lab/services/aiContract'

/**
 * Foto realista del diseño: la captura de la vista 3D se manda como referencia a un modelo
 * de imágenes (IMAGE_PROVIDER = gemini | openai). Sin proveedor responde 501 y el editor 3D
 * sigue funcionando igual.
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return aiError('invalid_request', 'El pedido no es JSON válido.', 400)
  }
  const parsed = MockupRequestSchema.safeParse(body)
  if (!parsed.success || !PRODUCTS.some((p) => p.id === parsed.data.design.productId)) {
    return aiError('invalid_request', 'Faltan datos del diseño o la imagen de referencia.', 400)
  }
  const provider = configuredProvider()
  if (!provider) {
    return aiError('ai_not_configured', 'La generación de imágenes todavía no está disponible.', 501)
  }

  try {
    const imageUrl = await generateMockup(provider, parsed.data.design, parsed.data.referencePng)
    const result: MockupResponse = { imageUrl, provider }
    return json(result)
  } catch (err) {
    if (err instanceof ProviderError) {
      console.error('[mockup]', provider, err.status, err.message)
      // Cuota agotada (o en 0, como en el plan gratuito de Google para imágenes): no se resuelve reintentando.
      if (err.status === 429 && /quota|billing/i.test(err.message)) {
        return aiError('ai_not_configured', 'La generación de imágenes no está disponible: se agotó la cuota del proveedor.', 503)
      }
      if (err.status === 429) {
        return aiError('rate_limited', 'Hay muchas imágenes en cola. Esperá un momento y probá de nuevo.', 429)
      }
      if (err.status === 401 || err.status === 403) {
        return aiError('ai_not_configured', 'La generación de imágenes no está disponible por un problema de configuración.', 503)
      }
      if (err.status === 422 || err.status === 400) {
        return aiError('refused', 'No pudimos generar una imagen para este diseño. Probá cambiar el texto o el encuadre.', 422)
      }
      return aiError('upstream_error', 'El generador de imágenes no respondió. Probá de nuevo en un momento.', 502)
    }
    console.error('[mockup]', err)
    return aiError('upstream_error', 'No pudimos generar la imagen. Probá de nuevo.', 500)
  }
}

/** Disponibilidad, para que la interfaz no ofrezca una acción que no puede completar. */
export async function GET(): Promise<Response> {
  return configuredProvider()
    ? json({ available: true, reason: '' })
    : json({ available: false, reason: 'Falta configurar IMAGE_PROVIDER (gemini u openai) e IMAGE_API_KEY.' })
}

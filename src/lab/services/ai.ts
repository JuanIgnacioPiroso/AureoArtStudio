import type { DesignState } from '../model/types'
import {
  AiErrorSchema,
  MockupResponseSchema,
  SuggestionsResponseSchema,
  type AiErrorCode,
  type MockupResponse,
  type Suggestion,
  type SuggestionRequest,
} from './aiContract'

export class AiServiceError extends Error {
  readonly code: AiErrorCode
  constructor(code: AiErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

async function post(path: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new AiServiceError('upstream_error', 'No hay conexión con el servidor. Revisá tu conexión y probá de nuevo.')
  }
  const data: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const parsed = AiErrorSchema.safeParse(data)
    if (parsed.success) throw new AiServiceError(parsed.data.code, parsed.data.message)
    // Sin backend (por ejemplo, un hosting estático): se trata como IA no configurada.
    if (res.status === 404) throw new AiServiceError('ai_not_configured', 'El asistente de IA no está disponible en este entorno.')
    throw new AiServiceError('upstream_error', 'El servidor respondió con un error. Probá de nuevo.')
  }
  return data
}

let suggestionsAvailable: Promise<boolean> | null = null

/** Consulta (una vez) si el asistente está configurado en el servidor. */
export function assistantAvailable(): Promise<boolean> {
  suggestionsAvailable ??= fetch('/api/design-suggestions')
    .then((r) => (r.ok ? r.json() : { available: false }))
    .then((d: { available?: unknown }) => d.available === true)
    .catch(() => false)
  return suggestionsAvailable
}

export async function requestSuggestions(req: SuggestionRequest, signal?: AbortSignal): Promise<Suggestion[]> {
  if (!(await assistantAvailable())) {
    throw new AiServiceError('ai_not_configured', 'El asistente de IA todavía no está configurado en este sitio.')
  }
  const data = await post('/api/design-suggestions', req, signal)
  const parsed = SuggestionsResponseSchema.safeParse(data)
  if (!parsed.success) throw new AiServiceError('upstream_error', 'La respuesta del asistente no tiene el formato esperado.')
  return parsed.data.suggestions
}

export async function mockupAvailability(): Promise<{ available: boolean; reason: string }> {
  try {
    const res = await fetch('/api/mockup')
    const data = (await res.json()) as { available?: unknown; reason?: unknown }
    return { available: data.available === true, reason: typeof data.reason === 'string' ? data.reason : '' }
  } catch {
    return { available: false, reason: 'El servicio de mockups no está disponible en este entorno.' }
  }
}

export async function requestMockup(design: DesignState, referencePng: string): Promise<MockupResponse> {
  const data = await post('/api/mockup', { design, referencePng })
  const parsed = MockupResponseSchema.safeParse(data)
  if (!parsed.success) throw new AiServiceError('upstream_error', 'La respuesta del generador no tiene el formato esperado.')
  return parsed.data
}

/**
 * Ejemplos de demostración. Se muestran SOLO cuando la IA no está configurada,
 * siempre bajo el rótulo "Modo demostración"; no son resultados generados.
 */
export function demoSuggestions(productId: string, styleIds: readonly DesignState['styleId'][]): Suggestion[] {
  const style = styleIds[0] ?? 'burn'
  const knife = productId === 'knife'
  return [
    {
      title: 'Clásica',
      rationale: 'Nombre protagonista con serif de alto contraste y la fecha chica debajo.',
      primary: '[Nombre]',
      secondary: '[Fecha]',
      fontId: 'bodoni',
      align: 'center',
      sizeMm: knife ? 8 : 26,
      styleId: style,
      motif: '',
    },
    {
      title: 'Lapidaria',
      rationale: 'Mayúsculas de inscripción, sobrias, que funcionan bien en piezas de uso diario.',
      primary: '[NOMBRE]',
      secondary: '',
      fontId: 'cinzel',
      align: 'center',
      sizeMm: knife ? 7 : 22,
      styleId: style,
      motif: 'Filete fino a cada lado del nombre',
    },
    {
      title: 'Dedicatoria',
      rationale: 'Caligráfica para una frase corta con tono de regalo.',
      primary: 'Para [Nombre]',
      secondary: 'con cariño, [Fecha]',
      fontId: 'script',
      align: 'center',
      sizeMm: knife ? 9 : 30,
      styleId: style,
      motif: '',
    },
  ]
}

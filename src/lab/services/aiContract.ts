import { z } from 'zod'
import { ALIGNS, DesignStateSchema, FONT_IDS, MAX_LINE_LENGTH, STYLE_IDS } from '../model/types'

/** Pedido de ideas al asistente. El servidor obtiene medidas y opciones del catálogo. */
export const SuggestionRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(600),
  productId: z.string(),
  surfaceId: z.string(),
  materialId: z.string(),
})
export type SuggestionRequest = z.infer<typeof SuggestionRequestSchema>

/** Propuesta estructurada: se aplica directamente al editor. */
export const SuggestionSchema = z.object({
  title: z.string().describe('Nombre corto de la propuesta, en español rioplatense.'),
  rationale: z.string().describe('Una o dos oraciones: por qué funciona para este objeto y esta ocasión.'),
  primary: z.string().describe(`Línea principal del grabado (máx. ${MAX_LINE_LENGTH} caracteres).`),
  secondary: z.string().describe('Línea secundaria opcional (fecha, frase corta). Vacía si no corresponde.'),
  fontId: z.enum(FONT_IDS),
  align: z.enum(ALIGNS),
  sizeMm: z.number().describe('Altura de la línea principal, en milímetros.'),
  styleId: z.enum(STYLE_IDS),
  motif: z.string().describe('Motivo gráfico opcional para conversar con el taller (no se dibuja). Vacío si no hace falta.'),
})
export type Suggestion = z.infer<typeof SuggestionSchema>

export const SuggestionsResponseSchema = z.object({ suggestions: z.array(SuggestionSchema) })
export type SuggestionsResponse = z.infer<typeof SuggestionsResponseSchema>

export const AI_ERROR_CODES = ['ai_not_configured', 'invalid_request', 'rate_limited', 'upstream_error', 'refused'] as const
export type AiErrorCode = (typeof AI_ERROR_CODES)[number]
export const AiErrorSchema = z.object({ code: z.enum(AI_ERROR_CODES), message: z.string() })

/** Mockup con IA: contrato definido, sin proveedor conectado todavía. */
export const MockupRequestSchema = z.object({
  design: DesignStateSchema,
  /** PNG de la vista 3D como referencia (data URL). */
  referencePng: z.string().startsWith('data:image/png;base64,').max(6_000_000),
})
export const MockupResponseSchema = z.object({ imageUrl: z.string().url(), provider: z.string() })
export type MockupResponse = z.infer<typeof MockupResponseSchema>

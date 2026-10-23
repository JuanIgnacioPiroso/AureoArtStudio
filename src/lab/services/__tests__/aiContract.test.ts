import { describe, expect, it } from 'vitest'
import { SuggestionRequestSchema, SuggestionsResponseSchema } from '../aiContract'
import { demoSuggestions } from '../ai'

describe('contrato de IA', () => {
  it('valida el pedido', () => {
    expect(SuggestionRequestSchema.safeParse({ prompt: 'ok', productId: 'knife', surfaceId: 'blade', materialId: 'x' }).success).toBe(false)
    expect(SuggestionRequestSchema.safeParse({ prompt: 'Un regalo', productId: 'knife', surfaceId: 'blade', materialId: 'x' }).success).toBe(true)
  })
  it('los ejemplos de demostración cumplen el mismo esquema que la IA', () => {
    expect(SuggestionsResponseSchema.safeParse({ suggestions: demoSuggestions('knife', ['mark-dark']) }).success).toBe(true)
  })
  it('rechaza estilos o tipografías fuera del catálogo', () => {
    const bad = { ...demoSuggestions('board', ['burn'])[0], fontId: 'comic' }
    expect(SuggestionsResponseSchema.safeParse({ suggestions: [bad] }).success).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { legacyLabRedirect } from '../intent'

describe('legacyLabRedirect', () => {
  it('manda un diseño compartido a la página del Lab', () => {
    expect(legacyLabRedirect('?d=abc')).toBe('/custom-lab/?d=abc')
  })

  it('manda un producto elegido a la página del Lab', () => {
    expect(legacyLabRedirect('?producto=knife')).toBe('/custom-lab/?producto=knife')
  })

  it('no redirige sin parámetros', () => {
    expect(legacyLabRedirect('')).toBeNull()
  })

  it('no redirige con otros parámetros', () => {
    expect(legacyLabRedirect('?utm_source=x')).toBeNull()
  })
})

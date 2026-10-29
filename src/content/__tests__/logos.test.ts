import { describe, expect, it } from 'vitest'
import { logoNameFromFile } from '../logos'

describe('logoNameFromFile', () => {
  it('quita la carpeta, la extensión y el prefijo de orden', () => {
    expect(logoNameFromFile('src/assets/logos/02-Municipalidad-de-Tandil.png')).toBe('Municipalidad de Tandil')
  })

  it('respeta tildes y mayúsculas, y pasa _ a espacio', () => {
    expect(logoNameFromFile('Café_Martínez.webp')).toBe('Café Martínez')
  })

  it('pone en mayúscula sólo la primera letra', () => {
    expect(logoNameFromFile('municipalidad-de-tandil.svg')).toBe('Municipalidad de tandil')
  })

  it('acepta el prefijo numérico con _', () => {
    expect(logoNameFromFile('2_Club-Atlético.svg')).toBe('Club Atlético')
  })

  it('colapsa guiones y espacios repetidos', () => {
    expect(logoNameFromFile('aceros--del  sur.png')).toBe('Aceros del sur')
  })

  it('quita extensiones en mayúsculas', () => {
    expect(logoNameFromFile('Bodega.PNG')).toBe('Bodega')
  })
})

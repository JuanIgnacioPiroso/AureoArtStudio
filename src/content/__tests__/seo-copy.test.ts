import { describe, expect, it } from 'vitest'
import { HOME_SEO, LAB_SEO } from '../site'

const MAX_TITLE = 60
const MAX_DESCRIPTION = 155
/** Ciudad de 25 caracteres: el peor caso razonable para la variante con ciudad. */
const LONG_CITY = 'San Fernando del Valle Ct'

describe('textos SEO', () => {
  it('la ciudad de prueba mide 25 caracteres', () => {
    expect(LONG_CITY).toHaveLength(25)
  })

  it.each([
    ['home', HOME_SEO.title],
    ['lab', LAB_SEO.title],
  ])('el title de %s mide 60 caracteres o menos', (_, title) => {
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE)
  })

  it.each([
    ['home sin ciudad', HOME_SEO.description(null)],
    ['home con ciudad', HOME_SEO.description(LONG_CITY)],
    ['lab', LAB_SEO.description],
  ])('la description de %s mide 155 caracteres o menos', (_, description) => {
    expect(description.length).toBeLessThanOrEqual(MAX_DESCRIPTION)
  })

  it('la description de la home nombra la ciudad cuando está cargada', () => {
    expect(HOME_SEO.description('Tandil')).toContain('Tandil')
  })

  it.each([null, 'Tandil'])('la description de la home nombra los cinco productos (ciudad: %s)', (city) => {
    const description = HOME_SEO.description(city)
    for (const product of ['cuchillos', 'tablas', 'mates', 'copas', 'cuero']) {
      expect(description).toContain(product)
    }
  })
})

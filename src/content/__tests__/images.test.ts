import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import credits from '../image-credits.json'
import { MATERIAL_GUIDES } from '../materials'
import { CATEGORIES, isIllustrative } from '../site'

const PUBLIC = fileURLToPath(new URL('../../../public', import.meta.url))

const illustrativeCategories = () => CATEGORIES.filter((c) => isIllustrative(c.image)).map((c) => c.id)

describe('imágenes de CATEGORIES', () => {
  it('termos, copas, regalos, placas y empresas tienen foto propia', () => {
    const ids = ['termos', 'copas', 'regalos', 'placas', 'empresas']
    expect(illustrativeCategories().filter((id) => ids.includes(id))).toEqual([])
  })

  it('sólo cuchillos, tablas y cuero siguen con imagen ilustrativa', () => {
    expect(illustrativeCategories().sort()).toEqual(['cuchillos', 'cuero', 'tablas'])
  })
})

describe('imágenes de MATERIAL_GUIDES', () => {
  it('sólo cuero es ilustrativa', () => {
    const ids = MATERIAL_GUIDES.filter((g) => g.image && isIllustrative(g.image)).map((g) => g.id)
    expect(ids).toEqual(['cuero'])
  })

  it('ninguna sección queda sin imagen', () => {
    expect(MATERIAL_GUIDES.filter((g) => g.image === null).map((g) => g.id)).toEqual([])
  })
})

describe('image-credits.json', () => {
  it('acredita sólo las ilustrativas que quedan', () => {
    expect(credits.map((c) => c.id).sort()).toEqual(['end-grain-board', 'knife-stone', 'leather-belts'])
  })

  it('cada archivo que lista existe en public/', () => {
    const missing = credits.flatMap((c) => c.files).filter((f) => !existsSync(`${PUBLIC}${f}`))
    expect(missing).toEqual([])
  })
})

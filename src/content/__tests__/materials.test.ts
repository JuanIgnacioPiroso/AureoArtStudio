import { describe, expect, it } from 'vitest'
import { ENGRAVING_STYLES, MATERIALS } from '../../lab/model/catalog'
import { MATERIAL_GUIDES, MATERIALS_SEO, productsFor, stylesFor } from '../materials'

describe('MATERIAL_GUIDES', () => {
  it('todo materialId existe en MATERIALS', () => {
    const missing = MATERIAL_GUIDES.flatMap((g) => g.materialIds.filter((id) => !MATERIALS[id]))
    expect(missing).toEqual([])
  })

  it('los ids no se repiten', () => {
    expect(new Set(MATERIAL_GUIDES.map((g) => g.id)).size).toBe(MATERIAL_GUIDES.length)
  })

  it('cada material tiene al menos un estilo y un producto calculados', () => {
    const empty = MATERIAL_GUIDES.filter((g) => stylesFor(g).length === 0 || productsFor(g).length === 0)
    expect(empty.map((g) => g.id)).toEqual([])
  })

  it('ningún estilo de ENGRAVING_STYLES queda sin material en la guía', () => {
    const covered = new Set(MATERIAL_GUIDES.flatMap((g) => stylesFor(g).map((s) => s.id)))
    expect(Object.keys(ENGRAVING_STYLES).filter((id) => !covered.has(id as keyof typeof ENGRAVING_STYLES))).toEqual([])
  })

  it('los mates de cuero van con el acero (se graba la virola de alpaca), no con el cuero', () => {
    const products = (id: string) => productsFor(MATERIAL_GUIDES.find((g) => g.id === id)!).map((p) => p.id)
    expect(products('acero')).toContain('mate-imperial')
    expect(products('cuero')).not.toContain('mate-imperial')
  })
})

describe('MATERIALS_SEO', () => {
  it('el title mide 60 caracteres o menos', () => {
    expect(MATERIALS_SEO.title.length).toBeLessThanOrEqual(60)
  })

  it('la description mide 155 caracteres o menos', () => {
    expect(MATERIALS_SEO.description.length).toBeLessThanOrEqual(155)
  })
})

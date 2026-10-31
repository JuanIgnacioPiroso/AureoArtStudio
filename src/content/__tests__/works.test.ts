import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../../lab/model/catalog'
import { CATEGORIES, IMAGES } from '../site'
import { orderedWorks, WORKS, workFilters } from '../works'

describe('WORKS', () => {
  it('toda categoría existe en CATEGORIES', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id))
    expect(WORKS.filter((w) => !ids.has(w.category)).map((w) => w.id)).toEqual([])
  })

  it('todo labProductId existe en PRODUCTS', () => {
    const ids = new Set(PRODUCTS.map((p) => p.id))
    expect(WORKS.filter((w) => w.labProductId && !ids.has(w.labProductId)).map((w) => w.id)).toEqual([])
  })

  it('ningún alt está vacío', () => {
    const missing = WORKS.filter((w) => !w.photo.alt.trim() || (w.labPreview && !w.labPreview.alt.trim()))
    expect(missing.map((w) => w.id)).toEqual([])
  })

  it('los ids no se repiten', () => {
    expect(new Set(WORKS.map((w) => w.id)).size).toBe(WORKS.length)
  })
})

describe('workFilters', () => {
  it('arranca con «Todos» y sólo suma categorías con trabajos, con su nombre de CATEGORIES', () => {
    const works = [{ ...WORKS[0]!, category: 'tablas' }]
    expect(workFilters(works)).toEqual([
      { id: 'todos', label: 'Todos' },
      { id: 'tablas', label: 'Tablas y madera' },
    ])
  })
})

describe('orderedWorks', () => {
  it('pone los trabajos propios antes que los ilustrativos, sin cambiar el orden dentro de cada grupo', () => {
    const base = WORKS[0]!
    const works = [
      { ...base, id: 'ilus-1' },
      { ...base, id: 'propio-1', photo: { ...IMAGES.box, illustrative: false } },
      { ...base, id: 'ilus-2' },
      { ...base, id: 'propio-2', photo: { ...IMAGES.board, illustrative: false } },
    ]
    expect(orderedWorks(works).map((w) => w.id)).toEqual(['propio-1', 'propio-2', 'ilus-1', 'ilus-2'])
  })
})

import { describe, expect, it } from 'vitest'
import { alignElements, distributeElements, reorderElement, snapMove } from '../arrange'
import { getProduct, getSurface } from '../catalog'
import { elementBounds } from '../constraints'
import { shapeElement } from '../elements'
import type { MeasureText } from '../types'

const measure: MeasureText = (t, _f, h) => t.length * h * 0.6
const board = getSurface(getProduct('board'), 'face')
const rect = (id: string, x: number, w = 10) => shapeElement('rect', { id, x, y: 0, widthMm: w, heightMm: 10 })

describe('alignElements', () => {
  it('con una capa alinea a la zona', () => {
    const [el] = alignElements([rect('a', 0)], ['a'], 'left', board, measure)
    expect(elementBounds(el!, measure).minX).toBeCloseTo(-board.widthMm / 2)
  })
  it('con varias alinea a la caja del grupo y respeta las bloqueadas', () => {
    const els = [rect('a', -50), rect('b', 20), { ...rect('c', 40), locked: true }]
    const out = alignElements(els, ['a', 'b', 'c'], 'right', board, measure)
    expect(out[0]!.x).toBeCloseTo(40)
    expect(out[1]!.x).toBeCloseTo(40)
    expect(out[2]!.x).toBe(40)
  })
})

describe('distributeElements', () => {
  it('deja el mismo espacio entre capas sin mover los extremos', () => {
    const els = [rect('a', -50), rect('b', -30, 20), rect('c', 50)]
    const out = distributeElements(els, ['a', 'b', 'c'], 'x', measure)
    const [a, b, c] = out.map((e) => elementBounds(e, measure))
    expect(out[0]!.x).toBe(-50)
    expect(out[2]!.x).toBe(50)
    expect(b!.minX - a!.maxX).toBeCloseTo(c!.minX - b!.maxX)
  })
})

describe('reorderElement', () => {
  const ids = (els: { id: string }[]) => els.map((e) => e.id).join('')
  const els = [rect('a', 0), rect('b', 0), rect('c', 0)]
  it('sube, baja, trae al frente y envía al fondo', () => {
    expect(ids(reorderElement(els, 'a', 'up'))).toBe('bac')
    expect(ids(reorderElement(els, 'c', 'down'))).toBe('acb')
    expect(ids(reorderElement(els, 'a', 'top'))).toBe('bca')
    expect(ids(reorderElement(els, 'c', 'bottom'))).toBe('cab')
  })
})

describe('snapMove', () => {
  const zone = { minX: -100, maxX: 100, minY: -50, maxY: 50 }
  it('se pega al centro de la zona dentro del umbral', () => {
    const s = snapMove({ minX: -5, maxX: 5, minY: -5, maxY: 5 }, 1.2, 30, [], zone, 2)
    expect(s.dx).toBeCloseTo(0)
    expect(s.guides.x).toEqual([0])
  })
  it('se pega al borde de otra capa', () => {
    const other = { minX: 20, maxX: 40, minY: -5, maxY: 5 }
    const s = snapMove({ minX: -5, maxX: 5, minY: 20, maxY: 30 }, 14, 0, [other], zone, 2)
    expect(s.dx).toBeCloseTo(15)
  })
  it('fuera del umbral no ajusta', () => {
    const s = snapMove({ minX: -5, maxX: 5, minY: 20, maxY: 30 }, 10, 0, [], zone, 2)
    expect(s.dx).toBe(10)
    expect(s.guides.x).toEqual([])
  })
})

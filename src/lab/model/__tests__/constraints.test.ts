import { describe, expect, it } from 'vitest'
import { getProduct, getSurface, stylesForSurface } from '../catalog'
import { checkDesign, elementBounds, fitTextWidth, layoutText, normalizeDesign, rescaleElements, transferElements } from '../constraints'
import { shapeElement, textElement } from '../elements'
import type { DesignElement, DesignState, MeasureText, SurfaceDef } from '../types'

/** Medidor determinista: cada carácter ocupa 0.6 × la altura. */
const measure: MeasureText = (text, _font, h) => text.length * h * 0.6

function knife(elements: DesignElement[], patch: Partial<DesignState> = {}): DesignState {
  const p = getProduct('knife')
  return { v: 2, productId: 'knife', notes: '', source: 'manual', ...structuredClone(p.defaultDesign), elements, ...patch }
}
const blade = getSurface(getProduct('knife'), 'blade')

describe('layoutText', () => {
  it('mide el bloque multilínea con interlineado y espacio entre letras', () => {
    const el = textElement({ text: 'Ana\nMaría', sizeMm: 10, lineHeight: 1.5, letterSpacing: 0.1 })
    const l = layoutText(el, measure)
    expect(l.lines).toHaveLength(2)
    // «María»: 5 letras × 6 mm + 4 espacios × 1 mm.
    expect(l.width).toBeCloseTo(34)
    expect(l.height).toBeCloseTo(25)
    expect(l.lines[0]!.baseline).toBeCloseTo(2.5)
    expect(l.lines[1]!.baseline).toBeCloseTo(-12.5)
  })

  it('centra cada línea o la alinea al borde del bloque', () => {
    const lines = (align: 'left' | 'center' | 'right') => layoutText(textElement({ text: 'A\nBBB', sizeMm: 10, align }), measure).lines
    expect(lines('center')[0]!.x).toBeCloseTo(-3)
    expect(lines('left')[0]!.x).toBeCloseTo(-9)
    expect(lines('right')[0]!.x).toBeCloseTo(3)
  })

  it('el texto en arco queda centrado y su círculo tiene el radio esperado', () => {
    const el = textElement({ text: 'SELLO', sizeMm: 5, arc: 180 })
    const l = layoutText(el, measure)
    expect(l.glyphs).toHaveLength(5)
    const total = 5 * 3
    const r = total / Math.PI
    // Cada letra está sobre el círculo de la línea base.
    for (const g of l.glyphs!) expect(Math.hypot(g.x - l.arcCenter!.x, g.y - l.arcCenter!.y)).toBeCloseTo(r, 5)
    // La letra del medio queda arriba (∩) y sin girar.
    expect(l.glyphs![2]!.angle).toBeCloseTo(0)
    expect(l.glyphs![2]!.y).toBeGreaterThan(l.glyphs![0]!.y)
    // Arco hacia abajo (∪): el centro del círculo queda arriba.
    const down = layoutText({ ...el, arc: -180 }, measure)
    expect(down.arcCenter!.y).toBeGreaterThan(0)
  })

  it('ignora textos vacíos', () => {
    expect(layoutText(textElement({ text: '  \n ' }), measure).width).toBe(0)
  })
})

describe('elementBounds', () => {
  it('rota la caja de la capa', () => {
    const el = shapeElement('rect', { widthMm: 20, heightMm: 10, x: 5, y: -2, rotation: 90 })
    const b = elementBounds(el, measure)
    expect(b.maxX - b.minX).toBeCloseTo(10)
    expect(b.maxY - b.minY).toBeCloseTo(20)
    expect((b.minX + b.maxX) / 2).toBeCloseTo(5)
  })
  it('una línea ocupa el grosor del trazo', () => {
    const b = elementBounds(shapeElement('line', { widthMm: 30, heightMm: 9, strokeMm: 1 }), measure)
    expect(b.maxY - b.minY).toBeCloseTo(1)
  })
})

describe('checkDesign', () => {
  it('avisa si el diseño está vacío', () => {
    expect(checkDesign(knife([textElement({ text: '' })]), blade, measure).map((w) => w.code)).toEqual(['empty'])
  })
  it('avisa si una capa se sale, si el texto es muy chico o el trazo muy fino', () => {
    const out = textElement({ id: 'out', text: 'Un texto bastante largo', sizeMm: 10 })
    const tiny = textElement({ id: 'tiny', text: 'ok', sizeMm: 1 })
    const thin = shapeElement('rect', { id: 'thin', widthMm: 10, heightMm: 5, strokeMm: 0.1 })
    const codes = checkDesign(knife([out, tiny, thin]), blade, measure).map((w) => `${w.elementId}:${w.code}`)
    expect(codes).toEqual(['out:outside', 'tiny:too-small', 'thin:thin-stroke'])
  })
  it('las capas ocultas no generan avisos', () => {
    expect(checkDesign(knife([textElement({ text: 'W'.repeat(80), hidden: true })]), blade, measure)[0]!.code).toBe('empty')
  })
})

describe('normalizeDesign', () => {
  it('no achica el texto que no entra (avisa, no corrige)', () => {
    const d = normalizeDesign(knife([textElement({ text: 'Un texto bastante largo', sizeMm: 12 })]))
    expect((d.elements[0] as { sizeMm: number }).sizeMm).toBe(12)
  })

  it('mantiene el centro de cada capa dentro de la zona y acota la rotación', () => {
    const d = normalizeDesign(knife([textElement({ x: 500, y: -500, rotation: 270 })]))
    expect(d.elements[0]!.x).toBe(60)
    expect(d.elements[0]!.y).toBe(-11)
    expect(d.elements[0]!.rotation).toBe(-90)
  })

  it('reemplaza material y estilo incompatibles', () => {
    const d = normalizeDesign(knife([], { materialId: 'steel', surfaceId: 'handle', styleId: 'frost' }))
    expect(d.materialId).toBe('wood-dark')
    expect(d.styleId).toBe('burn')
  })

  it('usa estilos de metal sobre la hoja, sin importar el material del mango', () => {
    expect(normalizeDesign(knife([], { surfaceId: 'blade', styleId: 'burn' })).styleId).toBe('mark-dark')
  })

  it('cae en la primera superficie si la pedida no existe', () => {
    expect(normalizeDesign(knife([], { surfaceId: 'nope' })).surfaceId).toBe('blade')
  })

  it('evita ids repetidos', () => {
    const d = normalizeDesign(knife([textElement({ id: 'a' }), textElement({ id: 'a' })]))
    expect(new Set(d.elements.map((e) => e.id)).size).toBe(2)
  })
})

describe('rescaleElements', () => {
  it('adapta la composición a una zona más chica', () => {
    const handle = getSurface(getProduct('knife'), 'handle')
    const [el] = rescaleElements([textElement({ sizeMm: 10, x: 30, y: 4 })], blade, handle)
    const k = Math.min(80 / 120, 15 / 22)
    expect(el!.x).toBeCloseTo(30 * k)
    expect((el as { sizeMm: number }).sizeMm).toBeCloseTo(10 * k)
  })
})

describe('transferElements', () => {
  const front = getSurface(getProduct('thermos-handle'), 'front')
  // Tira de prueba con la forma de la «Vuelta completa» del termo con manija (manija en +X).
  const wrap: SurfaceDef = { ...front, id: 'wrap', widthMm: 250, wrap: { radiusMm: 45, centerAngle: Math.PI, frontOffsetMm: 70.7 } }
  const layers = [textElement({ sizeMm: 16, x: 0, y: 10 }), shapeElement('rect', { widthMm: 20, heightMm: 8, x: -5, y: -9 })]

  it('del frente a la tira corre x hasta el frente sin cambiar tamaños', () => {
    const moved = transferElements(layers, front, wrap)
    expect(moved[0]!.x).toBeCloseTo(70.7)
    expect(moved[1]!.x).toBeCloseTo(65.7)
    expect(moved.map((e) => e.y)).toEqual([10, -9])
    expect((moved[0] as { sizeMm: number }).sizeMm).toBe(16)
    expect((moved[1] as { widthMm: number }).widthMm).toBe(20)
  })

  it('de la tira al frente lo revierte', () => {
    const back = transferElements(transferElements(layers, front, wrap), wrap, front)
    back.forEach((el, i) => {
      expect(el.x).toBeCloseTo(layers[i]!.x)
      expect(el).toEqual({ ...layers[i], x: el.x })
    })
  })

  it('entre zonas sin tira reescala igual que rescaleElements', () => {
    const handle = getSurface(getProduct('knife'), 'handle')
    const els = [textElement({ sizeMm: 10, x: 30, y: 4 })]
    expect(transferElements(els, blade, handle)).toEqual(rescaleElements(els, blade, handle))
  })
})

describe('stylesForSurface', () => {
  const handle = getSurface(getProduct('knife'), 'handle')
  const ids = (materialId: string) => stylesForSurface(getProduct('knife'), handle, materialId).map((s) => s.id)

  it('ofrece sólo el grabado a metal sobre negro mate', () => {
    expect(ids('black-matte')).toEqual(['reveal'])
  })

  it('no ofrece el grabado a metal sobre acero', () => {
    expect(ids('steel')).not.toContain('reveal')
  })

  it('ofrece sólo el bajorrelieve sobre mármol', () => {
    expect(ids('marble-white')).toEqual(['carve'])
  })

  it('ofrece sólo el grabado esmerilado sobre acrílico', () => {
    expect(ids('acrylic-clear')).toEqual(['etch'])
  })

  it('ofrece los estilos del acero sobre dorado', () => {
    expect(ids('gold')).toEqual(['mark-dark', 'frost'])
  })
})

describe('fitTextWidth', () => {
  const wide = textElement({ text: 'Un título muy largo para la hoja', sizeMm: 8 })

  it('achica el texto hasta que entra en el ancho de la zona', () => {
    const fitted = fitTextWidth(wide, blade, measure)
    expect(fitted.sizeMm).toBeLessThan(wide.sizeMm)
    const b = elementBounds(fitted, measure)
    expect(b.maxX).toBeLessThanOrEqual(blade.widthMm / 2)
    expect(b.minX).toBeGreaterThanOrEqual(-blade.widthMm / 2)
  })

  it('no baja del tamaño mínimo de la zona', () => {
    const huge = textElement({ text: 'x'.repeat(200), sizeMm: 8 })
    expect(fitTextWidth(huge, blade, measure).sizeMm).toBe(blade.sizeRange[0])
  })

  it('no toca un texto que ya entra', () => {
    const short = textElement({ text: 'Ana', sizeMm: 8 })
    expect(fitTextWidth(short, blade, measure)).toBe(short)
  })
})

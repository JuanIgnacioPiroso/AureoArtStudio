import { beforeEach, describe, expect, it } from 'vitest'
import { textElement } from '../model/elements'
import { defaultDesign, useLab } from '../store'

const s = () => useLab.getState()

beforeEach(() => {
  useLab.setState({ design: defaultDesign('knife'), past: [], future: [], selection: [], undo: null })
})

describe('historial del editor', () => {
  it('deshace y rehace cambios', () => {
    const before = s().design
    s().setStyle('frost')
    expect(s().design.styleId).toBe('frost')
    s().undoStep()
    expect(s().design).toEqual(before)
    s().redoStep()
    expect(s().design.styleId).toBe('frost')
  })

  it('un gesto (arrastre) es un solo paso', () => {
    const id = s().design.elements[0]!.id
    s().beginGesture()
    for (let i = 1; i <= 10; i++) s().updateElement(id, { x: i })
    s().endGesture()
    expect(s().past).toHaveLength(1)
    s().undoStep()
    expect(s().design.elements[0]!.x).toBe(0)
  })

  it('tipear seguido en el mismo campo se agrupa en un paso', () => {
    const id = s().design.elements[0]!.id
    for (const text of ['M', 'Ma', 'Mar']) s().updateElement(id, { text }, `text:${id}`)
    expect(s().past).toHaveLength(1)
  })

  it('un cambio nuevo descarta lo que se podía rehacer', () => {
    s().setStyle('frost')
    s().undoStep()
    s().setMaterial('wood-light')
    expect(s().future).toHaveLength(0)
  })

  it('deshacer no pierde las notas', () => {
    s().setStyle('frost')
    s().setNotes('urgente')
    s().undoStep()
    expect(s().design.notes).toBe('urgente')
  })
})

describe('capas', () => {
  it('agregar selecciona la capa nueva; borrar la saca de la selección', () => {
    const el = textElement({ text: 'Hola' })
    s().addElement(el)
    expect(s().selection).toEqual([el.id])
    s().removeElements([el.id])
    expect(s().selection).toEqual([])
  })

  it('duplicar crea copias desplazadas y las selecciona', () => {
    const id = s().design.elements[0]!.id
    s().duplicateElements([id])
    const copy = s().design.elements.at(-1)!
    expect(copy.id).not.toBe(id)
    expect(copy.x).toBe(2)
    expect(s().selection).toEqual([copy.id])
  })

  it('cambiar a un objeto sin tocar el diseño usa su diseño por defecto; si hay cambios, los adapta', () => {
    s().setProduct('board')
    expect(s().design.elements.map((e) => e.id)).toEqual(['board-name', 'board-since'])
    s().setProduct('knife')
    const id = s().design.elements[0]!.id
    s().updateElement(id, { text: 'Mío' })
    s().setProduct('board')
    expect(s().design.elements[0]).toMatchObject({ text: 'Mío' })
  })

  it('las plantillas ofrecen deshacer', () => {
    s().applyTemplate([textElement({ text: 'A' })], { source: 'manual', label: 'Iniciales', origin: 'preset' })
    expect(s().undo).toEqual({ label: 'Iniciales', origin: 'preset' })
    s().undoStep()
    expect(s().design.elements).toHaveLength(2)
    expect(s().undo).toBeNull()
  })
})

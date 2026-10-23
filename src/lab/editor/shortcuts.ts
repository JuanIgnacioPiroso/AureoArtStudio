import type { KeyboardEvent } from 'react'
import { useLab } from '../store'

/** Tecla modificadora para mostrar en los atajos. */
export const MOD = typeof navigator !== 'undefined' && /Mac|iP(hone|ad)/.test(navigator.userAgent) ? '⌘' : 'Ctrl'

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  if (el.isContentEditable) return true
  if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true
  return el.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'button', 'file'].includes((el as HTMLInputElement).type)
}

/**
 * Atajos del editor. Deshacer/rehacer funcionan en todo el Lab (salvo mientras se escribe, donde
 * manda el campo); mover, borrar y duplicar sólo con el foco en el lienzo o en la lista de capas.
 */
export function onEditorKey(e: KeyboardEvent<HTMLElement>) {
  if (isTyping(e.target)) return
  const s = useLab.getState()
  const mod = e.metaKey || e.ctrlKey
  const key = e.key.toLowerCase()

  if (mod && key === 'z') {
    e.preventDefault()
    if (e.shiftKey) s.redoStep()
    else s.undoStep()
    return
  }
  if (mod && key === 'y') {
    e.preventDefault()
    s.redoStep()
    return
  }

  const inEditor = (e.target as HTMLElement).closest?.('.design-canvas, .layers')
  if (!inEditor) return
  const sel = s.selection

  if (mod && key === 'd') {
    e.preventDefault()
    s.duplicateElements(sel)
  } else if (mod && key === 'a') {
    e.preventDefault()
    s.select(s.design.elements.filter((x) => !x.hidden).map((x) => x.id))
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && sel.length) {
    e.preventDefault()
    s.removeElements(sel)
  } else if (e.key === 'Escape' && sel.length) {
    e.preventDefault()
    s.select([])
  } else if (e.key.startsWith('Arrow') && sel.length && (e.target as HTMLElement).closest('.design-canvas')) {
    e.preventDefault()
    const step = e.shiftKey ? 5 : 0.5
    const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
    const dy = e.key === 'ArrowDown' ? -step : e.key === 'ArrowUp' ? step : 0
    const patches = Object.fromEntries(
      s.design.elements.filter((x) => sel.includes(x.id) && !x.locked).map((x) => [x.id, { x: x.x + dx, y: x.y + dy }]),
    )
    s.updateElements(patches, 'nudge')
  }
}

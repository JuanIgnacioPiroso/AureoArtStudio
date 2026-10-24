import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'

const ITEMS = '[role^="menuitem"]:not(:disabled)'

/**
 * Menú desplegable accesible. El botón lleva `aria-haspopup="menu"` y `aria-expanded={open}`; la lista, `role="menu"`.
 * El botón lo abre (Enter o Espacio, como cualquier botón), ↑ ↓ Inicio y Fin recorren las opciones,
 * Esc lo cierra y devuelve el foco al botón, y tocar afuera o salir con Tab lo cierran.
 */
export function useMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const close = useCallback((refocus = true) => {
    setOpen(false)
    if (refocus) buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    // Al abrir, el foco va a la opción marcada o a la primera.
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])
    ;(items.find((i) => i.getAttribute('aria-checked') === 'true') ?? items[0])?.focus()
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  function onListKey(e: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])
    const i = items.indexOf(document.activeElement as HTMLElement)
    const go = (n: number) => {
      e.preventDefault()
      items[(n + items.length) % items.length]?.focus()
    }
    if (e.key === 'ArrowDown') go(i + 1)
    else if (e.key === 'ArrowUp') go(i - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(items.length - 1)
    else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    } else if (e.key === 'Tab') close(false)
  }

  const toggle = () => setOpen((o) => !o)
  return { open, close, toggle, onListKey, rootRef, buttonRef, listRef }
}

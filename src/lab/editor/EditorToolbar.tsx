import { useState } from 'react'
import type { AlignEdge } from '../model/arrange'
import { MAX_ELEMENTS } from '../model/types'
import { useLab } from '../store'
import { AddButtons } from './AddButtons'
import { IconButton } from './icons'
import { useMenu } from './menu'
import { MOD } from './shortcuts'

const ALIGN: { edge: AlignEdge; label: string }[] = [
  { edge: 'left', label: 'Alinear a la izquierda' },
  { edge: 'hcenter', label: 'Centrar en horizontal' },
  { edge: 'right', label: 'Alinear a la derecha' },
  { edge: 'top', label: 'Alinear arriba' },
  { edge: 'vcenter', label: 'Centrar en vertical' },
  { edge: 'bottom', label: 'Alinear abajo' },
]

export function EditorToolbar() {
  const design = useLab((s) => s.design)
  const selection = useLab((s) => s.selection)
  const canUndo = useLab((s) => s.past.length > 0)
  const canRedo = useLab((s) => s.future.length > 0)
  const a = useLab.getState()
  const [error, setError] = useState('')
  const showError = (msg: string) => {
    setError('')
    window.setTimeout(() => setError(msg), 60)
  }

  const full = design.elements.length >= MAX_ELEMENTS
  const has = selection.length > 0

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Herramientas de diseño">
      <div className="editor-toolbar__group">
        <AddButtons onError={showError} onAdd={() => setError('')} />
      </div>

      <div className="editor-toolbar__group" role="group" aria-label="Historial">
        <IconButton icon="undo" label="Deshacer" shortcut={`${MOD}+Z`} onClick={a.undoStep} disabled={!canUndo} />
        <IconButton icon="redo" label="Rehacer" shortcut={`${MOD}+Shift+Z`} onClick={a.redoStep} disabled={!canRedo} />
      </div>

      <div className="editor-toolbar__group">
        <OrganizeMenu />
        <IconButton icon="trash" label="Eliminar" shortcut="Supr" onClick={() => a.removeElements(selection)} disabled={!has} />
      </div>

      <p className="editor-toolbar__status" role="status" aria-atomic="true">
        {error || (full ? `Llegaste al máximo de ${MAX_ELEMENTS} capas.` : '')}
      </p>
    </div>
  )
}

/** Una opción del menú «Organizar», con su atajo si tiene. */
function OrganizeItem({ label, shortcut, onClick, disabled }: { label: string; shortcut?: string; onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" role="menuitem" className="menu__item organize-menu__item" onClick={onClick} disabled={disabled} aria-keyshortcuts={shortcut?.replace('⌘', 'Meta').replace('Ctrl', 'Control')}>
      <span>{label}</span>
      {shortcut && <kbd className="organize-menu__key">{shortcut}</kbd>}
    </button>
  )
}

/** Alinear, distribuir, ordenar y duplicar: lo que se usa menos, agrupado y con texto. */
function OrganizeMenu() {
  const selection = useLab((s) => s.selection)
  const full = useLab((s) => s.design.elements.length >= MAX_ELEMENTS)
  const a = useLab.getState()
  const { open, close, toggle, onListKey, rootRef, buttonRef, listRef } = useMenu()
  const has = selection.length > 0
  const single = selection.length === 1 ? selection[0]! : null
  // Cada acción cierra el menú y devuelve el foco al botón.
  const run = (fn: () => void) => () => {
    fn()
    close()
  }

  return (
    <div className="menu" ref={rootRef}>
      <button ref={buttonRef} type="button" className="tool" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
        Organizar <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div ref={listRef} role="menu" className="menu__list organize-menu" aria-label="Organizar" onKeyDown={onListKey}>
          <div role="group" aria-label={selection.length > 1 ? 'Alinear entre sí' : 'Alinear a la zona'}>
            <p className="menu__label" aria-hidden="true">
              {selection.length > 1 ? 'Alinear entre sí' : 'Alinear a la zona'}
            </p>
            {ALIGN.map((x) => (
              <OrganizeItem key={x.edge} label={x.label} onClick={run(() => a.align(selection, x.edge))} disabled={!has} />
            ))}
          </div>
          <div role="group" aria-label="Distribuir">
            <p className="menu__label" aria-hidden="true">
              Distribuir
            </p>
            <OrganizeItem label="Distribuir en horizontal" onClick={run(() => a.distribute(selection, 'x'))} disabled={selection.length < 3} />
            <OrganizeItem label="Distribuir en vertical" onClick={run(() => a.distribute(selection, 'y'))} disabled={selection.length < 3} />
          </div>
          <div role="group" aria-label="Capa">
            <p className="menu__label" aria-hidden="true">
              Capa
            </p>
            <OrganizeItem label="Traer al frente" onClick={run(() => single && a.reorder(single, 'top'))} disabled={!single} />
            <OrganizeItem label="Enviar al fondo" onClick={run(() => single && a.reorder(single, 'bottom'))} disabled={!single} />
            <OrganizeItem label="Duplicar" shortcut={`${MOD}+D`} onClick={run(() => a.duplicateElements(selection))} disabled={!has || full} />
          </div>
        </div>
      )}
    </div>
  )
}

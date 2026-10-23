import { useEffect, useRef, useState } from 'react'
import type { AlignEdge } from '../model/arrange'
import { getProduct, getSurface } from '../model/catalog'
import { shapeElement, SHAPE_LABEL, textElement } from '../model/elements'
import { MAX_ELEMENTS, SHAPES, type ShapeKind, type SurfaceDef } from '../model/types'
import { useLab } from '../store'
import { IconButton, type IconName } from './icons'
import { useLogoPicker } from './logoPicker'
import { MOD } from './shortcuts'

const ALIGN: { edge: AlignEdge; icon: IconName; label: string }[] = [
  { edge: 'left', icon: 'align-left', label: 'Alinear a la izquierda' },
  { edge: 'hcenter', icon: 'align-hcenter', label: 'Centrar en horizontal' },
  { edge: 'right', icon: 'align-right', label: 'Alinear a la derecha' },
  { edge: 'top', icon: 'align-top', label: 'Alinear arriba' },
  { edge: 'vcenter', icon: 'align-vcenter', label: 'Centrar en vertical' },
  { edge: 'bottom', icon: 'align-bottom', label: 'Alinear abajo' },
]

/** Medidas iniciales de una forma nueva, proporcionales a la zona. */
function shapeFor(kind: ShapeKind, surface: SurfaceDef) {
  const w = surface.widthMm * 0.4
  const h = Math.min(surface.heightMm * 0.6, w * 0.6)
  const stroke = Math.max(0.4, Math.min(surface.widthMm, surface.heightMm) * 0.02)
  if (kind === 'line') return shapeElement('line', { widthMm: w, heightMm: stroke, strokeMm: stroke })
  if (kind === 'ellipse') return shapeElement('ellipse', { widthMm: Math.min(w, h), heightMm: Math.min(w, h), strokeMm: stroke })
  return shapeElement('rect', { widthMm: w, heightMm: h, strokeMm: stroke })
}

export function EditorToolbar() {
  const design = useLab((s) => s.design)
  const selection = useLab((s) => s.selection)
  const canUndo = useLab((s) => s.past.length > 0)
  const canRedo = useLab((s) => s.future.length > 0)
  const a = useLab.getState()
  const [error, setError] = useState('')
  const logo = useLogoPicker((msg) => {
    setError('')
    window.setTimeout(() => setError(msg), 60)
  })
  const [shapesOpen, setShapesOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // El menú de formas se cierra al tocar afuera.
  useEffect(() => {
    if (!shapesOpen) return
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setShapesOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [shapesOpen])

  const surface = getSurface(getProduct(design.productId), design.surfaceId)
  const full = design.elements.length >= MAX_ELEMENTS
  const has = selection.length > 0
  const single = selection.length === 1 ? selection[0]! : null

  function addText() {
    const size = Math.max(surface.sizeRange[0], Math.min(surface.sizeRange[1], surface.heightMm * 0.3))
    a.addElement(textElement({ text: 'Tu texto', sizeMm: Math.round(size * 2) / 2 }))
    setError('')
  }

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Herramientas de diseño">
      <div className="editor-toolbar__group">
        <button type="button" className="tool tool--add" onClick={addText} disabled={full}>
          + Texto
        </button>
        <button type="button" className="tool tool--add" onClick={() => logo.open()} disabled={full}>
          + Logo
        </button>
        <div className="menu" ref={menuRef}>
          <button
            type="button"
            className="tool tool--add"
            aria-expanded={shapesOpen}
            aria-haspopup="true"
            onClick={() => setShapesOpen((o) => !o)}
            disabled={full}
          >
            + Forma
          </button>
          {shapesOpen && (
            <div className="menu__list" role="group" aria-label="Formas" onKeyDown={(e) => e.key === 'Escape' && setShapesOpen(false)}>
              {SHAPES.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="menu__item"
                  onClick={() => {
                    a.addElement(shapeFor(k, surface))
                    setShapesOpen(false)
                  }}
                >
                  {SHAPE_LABEL[k]}
                </button>
              ))}
            </div>
          )}
        </div>
        {logo.element}
      </div>

      <div className="editor-toolbar__group" role="group" aria-label="Historial">
        <IconButton icon="undo" label="Deshacer" shortcut={`${MOD}+Z`} onClick={a.undoStep} disabled={!canUndo} />
        <IconButton icon="redo" label="Rehacer" shortcut={`${MOD}+Shift+Z`} onClick={a.redoStep} disabled={!canRedo} />
      </div>

      <div className="editor-toolbar__group" role="group" aria-label={selection.length > 1 ? 'Alinear entre sí' : 'Alinear a la zona'}>
        {ALIGN.map((x) => (
          <IconButton key={x.edge} icon={x.icon} label={x.label} onClick={() => a.align(selection, x.edge)} disabled={!has} />
        ))}
        <IconButton icon="dist-h" label="Distribuir en horizontal" onClick={() => a.distribute(selection, 'x')} disabled={selection.length < 3} />
        <IconButton icon="dist-v" label="Distribuir en vertical" onClick={() => a.distribute(selection, 'y')} disabled={selection.length < 3} />
      </div>

      <div className="editor-toolbar__group" role="group" aria-label="Capa seleccionada">
        <IconButton icon="front" label="Traer al frente" onClick={() => single && a.reorder(single, 'top')} disabled={!single} />
        <IconButton icon="back" label="Enviar al fondo" onClick={() => single && a.reorder(single, 'bottom')} disabled={!single} />
        <IconButton icon="duplicate" label="Duplicar" shortcut={`${MOD}+D`} onClick={() => a.duplicateElements(selection)} disabled={!has || full} />
        <IconButton icon="trash" label="Eliminar" shortcut="Supr" onClick={() => a.removeElements(selection)} disabled={!has} />
      </div>

      <p className="editor-toolbar__status" role="status" aria-atomic="true">
        {error || (full ? `Llegaste al máximo de ${MAX_ELEMENTS} capas.` : '')}
      </p>
    </div>
  )
}

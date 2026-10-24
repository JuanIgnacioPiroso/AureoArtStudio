import { getProduct, getSurface } from '../model/catalog'
import { shapeElement, SHAPE_LABEL, textElement } from '../model/elements'
import { MAX_ELEMENTS, SHAPES, type ShapeKind, type SurfaceDef } from '../model/types'
import { useLab } from '../store'
import { useLogoPicker } from './logoPicker'
import { useMenu } from './menu'

/** Medidas iniciales de una forma nueva, proporcionales a la zona. */
function shapeFor(kind: ShapeKind, surface: SurfaceDef) {
  const w = surface.widthMm * 0.4
  const h = Math.min(surface.heightMm * 0.6, w * 0.6)
  const stroke = Math.max(0.4, Math.min(surface.widthMm, surface.heightMm) * 0.02)
  if (kind === 'line') return shapeElement('line', { widthMm: w, heightMm: stroke, strokeMm: stroke })
  if (kind === 'ellipse') return shapeElement('ellipse', { widthMm: Math.min(w, h), heightMm: Math.min(w, h), strokeMm: stroke })
  return shapeElement('rect', { widthMm: w, heightMm: h, strokeMm: stroke })
}

/**
 * «+ Texto», «+ Logo» y «+ Forma». Los usan la barra del editor y la pestaña «Capa» sin selección.
 * `onError` recibe los errores al cargar un logo; `onAdd` se llama al agregar un texto o una forma.
 */
export function AddButtons({ onError, onAdd }: { onError: (msg: string) => void; onAdd?: () => void }) {
  const design = useLab((s) => s.design)
  const a = useLab.getState()
  const logo = useLogoPicker(onError)
  const { open, close, toggle, onListKey, rootRef, buttonRef, listRef } = useMenu()
  const surface = getSurface(getProduct(design.productId), design.surfaceId)
  const full = design.elements.length >= MAX_ELEMENTS

  function addText() {
    const size = Math.max(surface.sizeRange[0], Math.min(surface.sizeRange[1], surface.heightMm * 0.3))
    a.addElement(textElement({ text: 'Tu texto', sizeMm: Math.round(size * 2) / 2 }))
    onAdd?.()
  }

  return (
    <>
      <button type="button" className="tool tool--add" onClick={addText} disabled={full}>
        + Texto
      </button>
      <button type="button" className="tool tool--add" onClick={() => logo.open()} disabled={full}>
        + Logo
      </button>
      <div className="menu" ref={rootRef}>
        <button ref={buttonRef} type="button" className="tool tool--add" aria-haspopup="menu" aria-expanded={open} onClick={toggle} disabled={full}>
          + Forma
        </button>
        {open && (
          <div ref={listRef} role="menu" className="menu__list" aria-label="Formas" onKeyDown={onListKey}>
            {SHAPES.map((k) => (
              <button
                key={k}
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => {
                  a.addElement(shapeFor(k, surface))
                  onAdd?.()
                  close(false)
                }}
              >
                {SHAPE_LABEL[k]}
              </button>
            ))}
          </div>
        )}
      </div>
      {logo.element}
    </>
  )
}

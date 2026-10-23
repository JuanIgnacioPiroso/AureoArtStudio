import { elementLabel } from '../model/elements'
import type { DesignElement } from '../model/types'
import { useLab } from '../store'
import { IconButton } from './icons'

const KIND_LABEL: Record<DesignElement['kind'], string> = { text: 'Texto', image: 'Logo', shape: 'Forma' }

/** Lista de capas, de arriba (frente) hacia abajo (fondo). */
export function LayersPanel() {
  const elements = useLab((s) => s.design.elements)
  const selection = useLab((s) => s.selection)
  const a = useLab.getState()

  if (!elements.length) {
    return <p className="note">Todavía no hay capas. Agregá un texto, un logo o una forma desde la barra del lienzo.</p>
  }

  const ordered = [...elements].reverse()
  return (
    <ol className="layers" aria-label="Capas (la primera queda al frente)">
      {ordered.map((el, i) => {
        const name = elementLabel(el)
        const selected = selection.includes(el.id)
        return (
          <li key={el.id} className={`layer${selected ? ' is-selected' : ''}${el.hidden ? ' is-hidden' : ''}`}>
            <button
              type="button"
              className="layer__main"
              aria-pressed={selected}
              onClick={(e) => (e.shiftKey || e.metaKey || e.ctrlKey ? a.toggleSelect(el.id) : a.select([el.id]))}
            >
              <span className="layer__kind">{KIND_LABEL[el.kind]}</span>
              <span className="layer__name">{name}</span>
            </button>
            <span className="layer__actions">
              <IconButton
                icon={el.hidden ? 'eye-off' : 'eye'}
                label={el.hidden ? `Mostrar ${name}` : `Ocultar ${name}`}
                pressed={el.hidden}
                onClick={() => a.updateElement(el.id, { hidden: !el.hidden })}
              />
              <IconButton
                icon={el.locked ? 'lock' : 'unlock'}
                label={el.locked ? `Desbloquear ${name}` : `Bloquear ${name}`}
                pressed={el.locked}
                onClick={() => a.updateElement(el.id, { locked: !el.locked })}
              />
              <IconButton icon="up" label={`Subir ${name}`} onClick={() => a.reorder(el.id, 'up')} disabled={i === 0} />
              <IconButton icon="down" label={`Bajar ${name}`} onClick={() => a.reorder(el.id, 'down')} disabled={i === ordered.length - 1} />
            </span>
          </li>
        )
      })}
    </ol>
  )
}

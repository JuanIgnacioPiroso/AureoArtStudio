import { useId, useRef, type KeyboardEvent } from 'react'
import { EngravingPanel } from '../editor/EngravingPanel'
import { LayersPanel } from '../editor/LayersPanel'
import { PropertiesPanel } from '../editor/PropertiesPanel'
import { TemplatesPanel } from '../editor/TemplatesPanel'
import { useLab, type EditTab } from '../store'
import { QuoteRequest } from './QuoteRequest'

const TABS: { id: EditTab; label: string }[] = [
  { id: 'layer', label: 'Capa' },
  { id: 'layers', label: 'Capas' },
  { id: 'engraving', label: 'Grabado' },
  { id: 'quote', label: 'Pedir' },
]

function TabContent({ tab }: { tab: EditTab }) {
  switch (tab) {
    case 'layer':
      return <PropertiesPanel />
    case 'layers':
      return (
        <div className="stack-m">
          <TemplatesPanel />
          <section className="stack-s" aria-label="Lista de capas">
            <span className="field-label" aria-hidden="true">
              Capas
            </span>
            <LayersPanel />
          </section>
        </div>
      )
    case 'engraving':
      return <EngravingPanel />
    case 'quote':
      return <QuoteRequest />
  }
}

/**
 * Pestañas de la columna de edición. Los cuatro paneles quedan montados (sólo se oculta el que no
 * se ve), así no se pierde lo que el usuario escribió ni el scroll de cada uno.
 */
export function EditTabs() {
  const editTab = useLab((s) => s.editTab)
  const setEditTab = useLab((s) => s.setEditTab)
  const uid = useId()
  const listRef = useRef<HTMLDivElement>(null)

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const i = TABS.findIndex((t) => t.id === editTab)
    const next =
      e.key === 'ArrowRight' ? (i + 1) % TABS.length
      : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? TABS.length - 1
      : -1
    if (next < 0) return
    e.preventDefault()
    setEditTab(TABS[next]!.id)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div className="edit-tabs">
      <div ref={listRef} className="edit-tabs__list" role="tablist" aria-label="Edición" onKeyDown={onKey}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-controls={`${uid}-panel-${t.id}`}
            aria-selected={editTab === t.id}
            tabIndex={editTab === t.id ? 0 : -1}
            className="edit-tabs__tab"
            onClick={() => setEditTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          className="edit-tabs__panel"
          tabIndex={0}
          hidden={editTab !== t.id}
        >
          <TabContent tab={t.id} />
        </div>
      ))}
    </div>
  )
}

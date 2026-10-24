import { getProduct, getSurface } from '../model/catalog'
import { measureTextMm } from '../model/measure'
import { UndoNotice } from '../panels/controls'
import { useLab } from '../store'
import { PRESETS } from './presets'

/** Plantillas de la zona actual, con el aviso para deshacer la última aplicada. */
export function TemplatesPanel() {
  const design = useLab((s) => s.design)
  const a = useLab.getState()
  const surface = getSurface(getProduct(design.productId), design.surfaceId)
  const presets = PRESETS.filter((p) => p.available(surface))

  return (
    <div className="presets" role="group" aria-label="Plantillas">
      <span className="field-label">Plantillas</span>
      <div className="presets__row">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            className="chip"
            onClick={() => a.applyTemplate(p.build(design, surface, measureTextMm), { source: 'manual', label: p.name, origin: 'preset' })}
          >
            {p.name}
          </button>
        ))}
      </div>
      <UndoNotice origin="preset" hint="Reemplazó tus capas." />
    </div>
  )
}

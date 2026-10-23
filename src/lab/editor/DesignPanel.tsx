import { getProduct, getSurface, stylesForSurface } from '../model/catalog'
import { measureTextMm } from '../model/measure'
import { ChoiceGroup, UndoNotice } from '../panels/controls'
import { useLab } from '../store'
import { LayersPanel } from './LayersPanel'
import { PRESETS } from './presets'
import { PropertiesPanel } from './PropertiesPanel'

const NBSP = ' '

/** Paso 3: zona, estilo, plantillas, capas y propiedades de la capa elegida. */
export function DesignPanel() {
  const design = useLab((s) => s.design)
  const a = useLab.getState()
  const product = getProduct(design.productId)
  const surface = getSurface(product, design.surfaceId)
  const styles = stylesForSurface(product, surface, design.materialId)
  const presets = PRESETS.filter((p) => p.available(surface))

  return (
    <div className="stack-m">
      {product.surfaces.length > 1 && (
        <ChoiceGroup
          legend="Zona de grabado"
          variant="segmented"
          value={surface.id}
          options={product.surfaces.map((s) => ({ value: s.id, label: s.name }))}
          onChange={a.setSurface}
        />
      )}
      <p className="note">
        Área útil: {surface.widthMm}
        {NBSP}×{NBSP}
        {surface.heightMm}
        {NBSP}mm{surface.curved ? ', superficie curva' : ''}. Arrastrá las capas en el lienzo para ubicarlas donde quieras.
      </p>

      <div className="presets" role="group" aria-label="Plantillas">
        <span className="field-label">Plantillas</span>
        <div className="presets__row">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              className="chip"
              onClick={() =>
                a.applyTemplate(p.build(design, surface, measureTextMm), { source: 'manual', label: p.name, origin: 'preset' })
              }
            >
              {p.name}
            </button>
          ))}
        </div>
        <UndoNotice origin="preset" hint="Reemplazó tus capas." />
      </div>

      <ChoiceGroup
        legend="Estilo de grabado"
        value={design.styleId}
        options={styles.map((s) => ({ value: s.id, label: s.name, hint: s.description }))}
        onChange={a.setStyle}
      />

      <section className="stack-s" aria-labelledby="lab-layers-title">
        <h3 id="lab-layers-title" className="field-label">
          Capas
        </h3>
        <LayersPanel />
      </section>

      <section className="stack-s" aria-labelledby="lab-props-title">
        <h3 id="lab-props-title" className="field-label">
          Capa seleccionada
        </h3>
        <PropertiesPanel />
      </section>
    </div>
  )
}

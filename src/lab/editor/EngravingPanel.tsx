import { getProduct, getSurface, stylesForSurface, surfacesOf } from '../model/catalog'
import { ChoiceGroup } from '../panels/controls'
import { FixedPartNotes } from '../panels/MaterialSelector'
import { useLab } from '../store'

const NBSP = ' '

/** Pestaña «Grabado»: zona, área útil, estilo de grabado y piezas que no se eligen. */
export function EngravingPanel() {
  const design = useLab((s) => s.design)
  const a = useLab.getState()
  const product = getProduct(design.productId)
  const surface = getSurface(product, design.surfaceId, design.shapeId)
  const styles = stylesForSurface(product, surface, design.materialId)
  const surfaces = surfacesOf(product, design.shapeId)

  return (
    <div className="stack-m">
      {surfaces.length > 1 && (
        <ChoiceGroup
          legend="Zona de grabado"
          variant="segmented"
          value={surface.id}
          options={surfaces.map((s) => ({ value: s.id, label: s.name }))}
          onChange={a.setSurface}
        />
      )}
      <p className="note">
        Área útil: {surface.widthMm}
        {NBSP}×{NBSP}
        {surface.heightMm}
        {NBSP}mm{surface.curved ? ', superficie curva' : ''}. Arrastrá las capas en el lienzo para ubicarlas donde quieras.
      </p>

      <ChoiceGroup
        legend="Estilo de grabado"
        value={design.styleId}
        options={styles.map((s) => ({ value: s.id, label: s.name, hint: s.description }))}
        onChange={a.setStyle}
      />

      <FixedPartNotes />
    </div>
  )
}

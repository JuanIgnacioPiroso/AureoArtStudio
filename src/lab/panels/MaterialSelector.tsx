import { useId } from 'react'
import { getProduct, MATERIALS } from '../model/catalog'
import { useLab } from '../store'

/** Muestras redondas de los materiales compatibles, con el nombre del elegido al lado. */
export function MaterialSelector() {
  const design = useLab((s) => s.design)
  const setMaterial = useLab((s) => s.setMaterial)
  const product = getProduct(design.productId)
  const part = product.parts.find((p) => p.id === product.selectablePart)
  const name = useId()

  return (
    <fieldset className="material-swatches">
      <legend className="visually-hidden">{part ? `Material: ${part.name.toLowerCase()}` : 'Material'}</legend>
      {product.materialIds.map((id) => {
        const m = MATERIALS[id]!
        return (
          <label key={id} className="material-swatches__option" title={m.name}>
            <input
              type="radio"
              name={name}
              value={id}
              checked={design.materialId === id}
              aria-label={m.name}
              onChange={() => setMaterial(id)}
            />
            <span className="swatch__chip" style={{ background: m.color }} aria-hidden="true" />
          </label>
        )
      })}
      <span className="material-swatches__name" aria-hidden="true">
        {MATERIALS[design.materialId]?.name}
      </span>
    </fieldset>
  )
}

/** Piezas que no se eligen, en una sola línea (por ejemplo, «Base: acero inoxidable · Manija: plástico negro»). */
export function FixedPartNotes() {
  const product = getProduct(useLab((s) => s.design.productId))
  const fixed = product.parts.filter((p) => p.fixedMaterialId)
  if (!fixed.length) return null
  return <p className="note">{fixed.map((p) => `${p.name}: ${MATERIALS[p.fixedMaterialId!]!.name.toLowerCase()}`).join(' · ')}.</p>
}

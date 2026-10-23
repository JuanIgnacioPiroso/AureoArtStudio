import { useId } from 'react'
import { getProduct, MATERIALS } from '../model/catalog'
import { useLab } from '../store'

export function MaterialSelector() {
  const design = useLab((s) => s.design)
  const setMaterial = useLab((s) => s.setMaterial)
  const product = getProduct(design.productId)
  const part = product.parts.find((p) => p.id === product.selectablePart)
  const fixed = product.parts.filter((p) => p.fixedMaterialId)
  const name = useId()

  return (
    <div className="stack-s">
      <fieldset className="choice choice--swatches">
        <legend className="field-label">{part ? `${part.name}` : 'Material'}</legend>
        <div className="choice__options">
          {product.materialIds.map((id) => {
            const m = MATERIALS[id]!
            return (
              <label key={id} className="choice__option swatch">
                <input
                  type="radio"
                  name={name}
                  value={id}
                  checked={design.materialId === id}
                  onChange={() => setMaterial(id)}
                />
                <span className="choice__body">
                  <span className="swatch__chip" style={{ background: m.color }} aria-hidden="true" />
                  <span className="choice__label">{m.name}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      {fixed.map((p) => (
        <p key={p.id} className="note">
          {p.name}: {MATERIALS[p.fixedMaterialId!]!.name.toLowerCase()}.
        </p>
      ))}
    </div>
  )
}

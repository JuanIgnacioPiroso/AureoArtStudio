import { useId } from 'react'
import { PRODUCTS } from '../model/catalog'
import { useLab } from '../store'

function Thumb({ modelId }: { modelId: string }) {
  if (modelId === 'knife-v1') {
    return (
      <svg viewBox="0 0 120 40" aria-hidden="true" className="thumb">
        <path d="M44 14 H96 Q110 14 116 21 Q106 27 92 28 H44 Z" fill="currentColor" opacity=".55" />
        <rect x="40" y="12" width="5" height="18" rx="1" fill="currentColor" opacity=".7" />
        <path d="M6 15 Q22 12 40 14 V28 Q22 30 6 27 Q2 21 6 15 Z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 120 40" aria-hidden="true" className="thumb">
      <rect x="10" y="4" width="100" height="32" rx="5" fill="currentColor" />
      <rect x="16" y="13" width="4" height="14" rx="2" fill="var(--panel)" />
    </svg>
  )
}

export function ProductPicker() {
  const productId = useLab((s) => s.design.productId)
  const setProduct = useLab((s) => s.setProduct)
  const name = useId()
  return (
    <fieldset className="choice choice--tiles">
      <legend className="visually-hidden">Objeto a personalizar</legend>
      <div className="choice__options">
        {PRODUCTS.map((p) => (
          <label key={p.id} className="choice__option product-tile">
            <input
              type="radio"
              name={name}
              value={p.id}
              checked={productId === p.id}
              onChange={() => setProduct(p.id)}
            />
            <span className="choice__body">
              <Thumb modelId={p.modelId} />
              <span className="choice__label">{p.name}</span>
              <span className="choice__hint">{p.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

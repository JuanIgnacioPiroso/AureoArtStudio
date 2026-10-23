import { useId, useState } from 'react'

/** Campo numérico con unidad. Mientras se escribe acepta valores intermedios ("-", "1,"). */
export function NumberField({
  label,
  value,
  onChange,
  unit,
  step = 0.5,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  unit: string
  step?: number
  min?: number
  max?: number
}) {
  const id = useId()
  const shown = String(Math.round(value * 100) / 100)
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <div className="num-field">
      <label htmlFor={id} className="field-label">
        {label}
        <span className="visually-hidden"> ({unit})</span>
      </label>
      <div className="num-field__box">
        <input
          id={id}
          className="input input--num"
          type="text"
          inputMode="decimal"
          value={draft ?? shown}
          onChange={(e) => {
            setDraft(e.target.value)
            const n = Number(e.target.value.replace(',', '.'))
            if (e.target.value.trim() && Number.isFinite(n)) {
              onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)))
            }
          }}
          onBlur={() => setDraft(null)}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
            e.preventDefault()
            const k = (e.key === 'ArrowUp' ? 1 : -1) * step * (e.shiftKey ? 10 : 1)
            setDraft(null)
            onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value + k)))
          }}
          autoComplete="off"
        />
        <span className="num-field__unit" aria-hidden="true">
          {unit}
        </span>
      </div>
    </div>
  )
}

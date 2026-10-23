import { useId, type ReactNode } from 'react'
import { useLab, type UndoOrigin } from '../store'

interface Option<T extends string> {
  value: T
  label: ReactNode
  hint?: ReactNode
}

/** Grupo de opciones exclusivas con radios nativos (teclado y lectores de pantalla incluidos). */
export function ChoiceGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
  variant = 'list',
  name,
}: {
  legend: string
  value: T
  options: readonly Option<T>[]
  onChange: (v: T) => void
  variant?: 'list' | 'segmented' | 'tiles'
  name?: string
}) {
  const auto = useId()
  return (
    <fieldset className={`choice choice--${variant}`}>
      <legend className="field-label">{legend}</legend>
      <div className="choice__options">
        {options.map((o) => (
          <label key={o.value} className="choice__option">
            <input
              type="radio"
              name={name ?? auto}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span className="choice__body">
              <span className="choice__label">{o.label}</span>
              {o.hint && <span className="choice__hint">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  disabled,
  describedBy,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format: (v: number) => string
  disabled?: boolean
  describedBy?: string
}) {
  const id = useId()
  return (
    <div className="slider">
      <div className="slider__head">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        <output htmlFor={id} className="slider__value">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={format(value)}
        aria-describedby={describedBy}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

/** Confirma el último preset aplicado y ofrece volver al diseño anterior. */
export function UndoNotice({ origin, hint }: { origin: UndoOrigin; hint?: string }) {
  const undo = useLab((s) => s.undo)
  const undoStep = useLab((s) => s.undoStep)
  const visible = undo?.origin === origin
  return (
    <p className="note undo" aria-live="polite">
      {visible && (
        <>
          Aplicamos «{undo.label}».{hint ? ` ${hint}` : ''}{' '}
          <button type="button" className="link-button" onClick={undoStep}>
            Deshacer
          </button>
        </>
      )}
    </p>
  )
}

import { useId, useRef, useState } from 'react'
import { getProduct, getSurface, stylesForSurface } from '../model/catalog'
import { normalizeDesign } from '../model/constraints'
import { stackedTextElements } from '../model/legacy'
import { measureTextMm } from '../model/measure'
import type { DesignElement, DesignState, SurfaceDef } from '../model/types'
import { AiServiceError, demoSuggestions, requestSuggestions } from '../services/ai'
import type { Suggestion } from '../services/aiContract'
import { useLab } from '../store'
import { Fallback2D } from '../viewer/Fallback2D'
import { UndoNotice } from './controls'

const EXAMPLES = [
  'Quiero regalarle un cuchillo a mi papá con su nombre, la fecha y algo elegante.',
  'Una tabla para una pareja que se casa: nombres y año.',
  'Algo sobrio para un regalo empresarial, con iniciales.',
]

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; suggestions: Suggestion[]; demo: boolean }
  | { kind: 'error'; message: string; invalid?: boolean }

/** La propuesta es un bloque de una o dos líneas: se convierte en capas de texto centradas. */
function suggestionToElements(s: Suggestion, surface: SurfaceDef): DesignElement[] {
  const lines = [
    { text: s.primary, role: 'primary' as const },
    { text: s.secondary, role: 'secondary' as const },
  ]
  return stackedTextElements({ lines, fontId: s.fontId, align: s.align, size: s.sizeMm }, surface, measureTextMm)
}

function SuggestionCard({ s, base, demo, onApply }: { s: Suggestion; base: DesignState; demo: boolean; onApply: () => void }) {
  const product = getProduct(base.productId)
  const surface = getSurface(product, base.surfaceId)
  const preview = normalizeDesign({ ...base, elements: suggestionToElements(s, surface), styleId: s.styleId })
  return (
    <li className="proposal">
      <Fallback2D className="proposal__preview" product={product} surface={surface} design={preview} framed={false} resolution={420} />
      <div className="proposal__body">
        <h4 className="proposal__title">{s.title}</h4>
        <p className="proposal__text">{s.rationale}</p>
        {s.motif && <p className="note">Motivo para conversar con el taller: {s.motif}.</p>}
        <button type="button" className="button button--ghost" onClick={onApply}>
          Aplicar al diseño{demo ? ' (ejemplo)' : ''}
        </button>
      </div>
    </li>
  )
}

export function DesignAssistant() {
  const design = useLab((s) => s.design)
  const applyTemplate = useLab((s) => s.applyTemplate)
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [replaced, setReplaced] = useState<string | null>(null)
  const abort = useRef<AbortController | null>(null)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const promptId = useId()
  const hintId = useId()
  const errorId = useId()

  const product = getProduct(design.productId)
  const surface = getSurface(product, design.surfaceId)

  async function generate() {
    if (prompt.trim().length < 3) {
      setStatus({
        kind: 'error',
        invalid: true,
        message: 'Contanos un poco más de tu idea: para quién es, qué querés escribir, qué estilo te gusta.',
      })
      promptRef.current?.focus()
      return
    }
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setStatus({ kind: 'loading' })
    try {
      const suggestions = await requestSuggestions(
        { prompt, productId: design.productId, surfaceId: design.surfaceId, materialId: design.materialId },
        ctrl.signal,
      )
      setStatus({ kind: 'ready', suggestions, demo: false })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      if (err instanceof AiServiceError && err.code === 'ai_not_configured') {
        const styles = stylesForSurface(product, surface, design.materialId).map((s) => s.id)
        setStatus({ kind: 'ready', suggestions: demoSuggestions(design.productId, styles), demo: true })
        return
      }
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'No pudimos generar ideas. Revisá tu conexión y probá de nuevo.',
      })
    }
  }

  function cancel() {
    abort.current?.abort()
    setStatus({ kind: 'idle' })
  }

  function pickExample(ex: string) {
    setReplaced(prompt.trim() && prompt !== ex ? prompt : null)
    setPrompt(ex)
  }

  const invalid = status.kind === 'error' && status.invalid

  return (
    <div className="stack-m">
      <p className="lede-s">
        Describí la ocasión y el tono. El asistente propone composiciones que entran en {surface.name.toLowerCase()} (
        {surface.widthMm}&nbsp;×&nbsp;{surface.heightMm}&nbsp;mm) y podés editarlas después.
      </p>
      <div className="field">
        <label className="field-label" htmlFor={promptId}>
          Tu idea
        </label>
        <textarea
          ref={promptRef}
          id={promptId}
          name="idea"
          className="input input--area"
          rows={3}
          maxLength={600}
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value)
            setReplaced(null)
            if (invalid) setStatus({ kind: 'idle' })
          }}
          aria-describedby={invalid ? `${errorId} ${hintId}` : hintId}
          aria-invalid={invalid || undefined}
          placeholder="Ej.: es para mi papá, se llama Jorge, quiero algo elegante con la fecha de su cumpleaños…"
        />
        {invalid && (
          <p id={errorId} className="note note--warn" role="alert">
            {status.message}
          </p>
        )}
        <div id={hintId} className="examples" role="group" aria-label="Ejemplos de ideas">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip chip--quiet" onClick={() => pickExample(ex)}>
              {ex}
            </button>
          ))}
        </div>
        {replaced && (
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setPrompt(replaced)
              setReplaced(null)
            }}
          >
            Recuperar mi texto
          </button>
        )}
      </div>
      <div className="assistant-actions">
        <button type="button" className="button" onClick={generate} disabled={status.kind === 'loading'}>
          {status.kind === 'loading' ? 'Generando ideas…' : 'Generar ideas'}
        </button>
        {status.kind === 'loading' && (
          <button type="button" className="link-button" onClick={cancel}>
            Cancelar
          </button>
        )}
      </div>

      <div aria-live="polite" className="stack-s">
        {status.kind === 'loading' && <p className="note">Pensando composiciones para tu {product.name.toLowerCase()}…</p>}
        {status.kind === 'error' && !status.invalid && (
          <div className="alert" role="alert">
            <p>{status.message}</p>
            <button type="button" className="link-button" onClick={generate}>
              Reintentar
            </button>
          </div>
        )}
        {status.kind === 'ready' && (
          <>
            {status.demo && (
              <p className="demo-flag">
                <strong>Modo demostración.</strong> El asistente de IA no está configurado en este sitio: estas
                propuestas son ejemplos fijos, no generadas a partir de tu idea.
              </p>
            )}
            <ul className="proposals">
              {status.suggestions.map((s, i) => (
                <SuggestionCard
                  key={`${i}-${s.title}`}
                  s={s}
                  base={design}
                  demo={status.demo}
                  onApply={() =>
                    applyTemplate(suggestionToElements(s, surface), {
                      source: status.demo ? 'manual' : 'ai',
                      label: s.title,
                      origin: 'assistant',
                      styleId: s.styleId,
                    })
                  }
                />
              ))}
            </ul>
          </>
        )}
      </div>
      <UndoNotice origin="assistant" hint="Movela y ajustala en el lienzo o en el paso 3." />
    </div>
  )
}

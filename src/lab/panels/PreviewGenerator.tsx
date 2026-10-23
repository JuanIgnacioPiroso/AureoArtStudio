import { useEffect, useRef, useState } from 'react'
import { AiServiceError, mockupAvailability, requestMockup } from '../services/ai'
import type { MockupResponse } from '../services/aiContract'
import { downloadFile } from '../services/quote'
import { useLab } from '../store'

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; result: MockupResponse }
  | { kind: 'error'; message: string }

/** Lado mayor de la captura que se manda como referencia (mantiene el pedido chico). */
const MAX_REFERENCE_PX = 1280

/** Achica la captura del visor si hace falta; el modelo no necesita más resolución. */
function downscalePng(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_REFERENCE_PX / Math.max(img.width, img.height))
      if (scale === 1) return resolve(dataUrl)
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      const ctx = c.getContext('2d')
      if (!ctx) return resolve(dataUrl)
      ctx.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

/**
 * Botón de la barra del visor que genera una foto realista a partir de la vista 3D actual.
 * Es opcional: no reemplaza la vista 3D y nunca modifica el diseño. Si no hay proveedor
 * configurado, en producción no se muestra; en desarrollo se ve deshabilitado con el motivo.
 */
export function PreviewGenerator() {
  const design = useLab((s) => s.design)
  const capture = useLab((s) => s.capture)
  const [availability, setAvailability] = useState<{ available: boolean; reason: string } | null>(null)
  const [state, setState] = useState<State>({ kind: 'idle' })
  const dialogRef = useRef<HTMLDialogElement>(null)
  const request = useRef(0)

  useEffect(() => {
    let alive = true
    mockupAvailability().then((a) => {
      if (alive) setAvailability(a)
    })
    return () => {
      alive = false
    }
  }, [])

  async function generate() {
    const png = capture?.()
    dialogRef.current?.showModal()
    if (!png) {
      setState({ kind: 'error', message: 'No pudimos capturar la vista 3D para usarla de referencia.' })
      return
    }
    const id = ++request.current
    setState({ kind: 'loading' })
    try {
      const result = await requestMockup(design, await downscalePng(png))
      if (id === request.current) setState({ kind: 'done', result })
    } catch (err) {
      if (id !== request.current) return
      setState({ kind: 'error', message: err instanceof AiServiceError ? err.message : 'No pudimos generar la imagen.' })
    }
  }

  if (!availability) return null
  if (!availability.available) {
    if (!import.meta.env.DEV) return null
    return (
      <button type="button" className="tool" disabled title={`Desarrollo: ${availability.reason}`}>
        Generar imagen
      </button>
    )
  }

  return (
    <>
      <button type="button" className="tool tool--accent" onClick={generate} disabled={state.kind === 'loading'}>
        {state.kind === 'loading' ? 'Generando…' : 'Generar imagen'}
      </button>
      <dialog ref={dialogRef} className="mockup-dialog" aria-labelledby="mockup-title" onClose={() => request.current++}>
        <div className="mockup-dialog__head">
          <h3 id="mockup-title" className="mockup__title">
            Imagen realista de tu diseño
          </h3>
          <button type="button" className="tool" onClick={() => dialogRef.current?.close()}>
            Cerrar
          </button>
        </div>
        <div aria-live="polite" className="stack-s">
          {state.kind === 'loading' && (
            <div className="mockup-dialog__loading">
              <p className="note">Generando la imagen a partir de tu vista 3D. Puede tardar hasta un minuto…</p>
            </div>
          )}
          {state.kind === 'error' && (
            <>
              <p className="note note--warn">{state.message}</p>
              <button type="button" className="button button--ghost" onClick={generate}>
                Reintentar
              </button>
            </>
          )}
          {state.kind === 'done' && (
            <figure className="mockup__result">
              {/* Las dimensiones reservan espacio; la proporción real la corrige el CSS (height: auto). */}
              <img
                src={state.result.imageUrl}
                width={1536}
                height={1024}
                decoding="async"
                alt="Imagen generada con IA del producto personalizado"
              />
              <figcaption>
                Representación orientativa generada con IA a partir de tu vista 3D. Revisá el texto: la referencia
                exacta del grabado es la vista 3D, y el resultado real puede variar.
              </figcaption>
              <div className="mockup-dialog__actions">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => downloadFile('aureo-imagen.png', state.result.imageUrl)}
                >
                  Descargar imagen
                </button>
                <button type="button" className="link-button" onClick={generate}>
                  Generar otra
                </button>
              </div>
            </figure>
          )}
        </div>
      </dialog>
    </>
  )
}

import { lazy, Suspense, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { DesignCanvas } from './editor/DesignCanvas'
import { DesignPanel } from './editor/DesignPanel'
import { EditorToolbar } from './editor/EditorToolbar'
import { onEditorKey } from './editor/shortcuts'
import { FONTS, getProduct, getSurface, MATERIALS } from './model/catalog'
import { elementHasContent, elementLabel } from './model/elements'
import { designFonts, ensureFonts } from './model/measure'
import { designUrl } from './model/serialize'
import { MaterialSelector } from './panels/MaterialSelector'
import { ProductPicker } from './panels/ProductPicker'
import { QuoteRequest } from './panels/QuoteRequest'
import { downloadFile } from './services/quote'
import { onLabProductRequest } from './intent'
import { useLab } from './store'
import { Fallback2D } from './viewer/Fallback2D'
import { ViewerBoundary } from './viewer/ViewerBoundary'
import './lab.css'

const ProductViewer3D = lazy(() => import('./viewer/ProductViewer3D'))

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Teclas del visor: [giro horizontal, giro vertical, factor de zoom]. */
const ORBIT_KEYS: Record<string, [number, number, number]> = {
  ArrowLeft: [0.15, 0, 1],
  ArrowRight: [-0.15, 0, 1],
  ArrowUp: [0, -0.1, 1],
  ArrowDown: [0, 0.1, 1],
  '+': [0, 0, 0.9],
  '=': [0, 0, 0.9],
  '-': [0, 0, 1.1],
  _: [0, 0, 1.1],
}

function Step({ n, title, open, children }: { n: number; title: string; open?: boolean; children: ReactNode }) {
  return (
    <details className="step" open={open}>
      <summary className="step__summary">
        <span className="step__n" aria-hidden="true">
          {n}
        </span>
        <span className="step__title">{title}</span>
      </summary>
      <div className="step__body">{children}</div>
    </details>
  )
}

export default function CustomLab() {
  const design = useLab((s) => s.design)
  const viewMode = useLab((s) => s.viewMode)
  const capture = useLab((s) => s.capture)
  const stageTab = useLab((s) => s.stageTab)
  const { setViewMode, resetView, setStageTab } = useLab.getState()
  const [gl, setGl] = useState<'ok' | 'unsupported' | 'lost'>(() => (webglAvailable() ? 'ok' : 'unsupported'))
  const [toast, setToastText] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const hintId = useId()

  // Se vacía antes de escribir (para que un mensaje repetido se vuelva a anunciar) y se oculta solo.
  function setToast(text: string) {
    window.clearTimeout(toastTimer.current)
    setToastText('')
    toastTimer.current = window.setTimeout(() => {
      setToastText(text)
      toastTimer.current = window.setTimeout(() => setToastText(''), 4000)
    }, 60)
  }

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === stageRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => onLabProductRequest((id) => useLab.getState().setProduct(id)), [])

  // Las tipografías se cargan bajo demanda: al terminar, se mide y se dibuja de nuevo.
  const fontKey = designFonts(design).join(',')
  useEffect(() => {
    let alive = true
    void ensureFonts(fontKey ? (fontKey.split(',') as ReturnType<typeof designFonts>) : []).then((changed) => {
      if (alive && changed) useLab.getState().fontsLoaded()
    })
    return () => {
      alive = false
    }
  }, [fontKey])

  const product = getProduct(design.productId)
  const surface = getSurface(product, design.surfaceId)

  const items = design.elements.filter(elementHasContent).map((e) =>
    e.kind === 'text' ? `«${elementLabel(e)}» en ${FONTS[e.fontId].name}, ${e.sizeMm} mm de alto` : elementLabel(e).toLowerCase(),
  )
  const description = `${product.name} en ${MATERIALS[design.materialId]?.name.toLowerCase()}, grabado en ${surface.name.toLowerCase()}: ${
    items.length ? items.join('; ') : 'sin grabado'
  }.`

  function toggleFullscreen() {
    const el = stageRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.().catch(() => setToast('Tu navegador no permite pantalla completa.'))
  }

  function onCanvasKey(e: KeyboardEvent<HTMLDivElement>) {
    const move = ORBIT_KEYS[e.key]
    const orbit = useLab.getState().orbit
    if (!move || !orbit || e.altKey || e.ctrlKey || e.metaKey) return
    e.preventDefault()
    orbit(...move)
  }

  function downloadImage() {
    const png = capture?.()
    if (png) downloadFile('aureo-custom-lab.png', png)
    else setToast('La imagen 3D no está disponible en este dispositivo.')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(designUrl(design, window.location.href))
      setToast('Enlace copiado: abre este mismo diseño.')
    } catch {
      setToast('No pudimos copiar el enlace.')
    }
  }

  const fallback2d = <Fallback2D product={product} surface={surface} design={design} />

  return (
    <div className="lab" onKeyDown={onEditorKey}>
      <div className="lab__stage" ref={stageRef} data-tab={stageTab}>
        <div className="lab__tabs segmented" role="group" aria-label="Vista">
          <button type="button" aria-pressed={stageTab === 'design'} onClick={() => setStageTab('design')}>
            Diseñar
          </button>
          <button type="button" aria-pressed={stageTab === '3d'} onClick={() => setStageTab('3d')}>
            Ver en 3D
          </button>
        </div>

        <section className="lab__editor" aria-label="Editor del grabado">
          <EditorToolbar />
          <DesignCanvas />
        </section>

        <div className="lab__view3d">
          <div
            className="lab__canvas"
            tabIndex={gl === 'ok' ? 0 : undefined}
            role={gl === 'ok' ? 'group' : undefined}
            aria-label={gl === 'ok' ? 'Vista 3D' : undefined}
            aria-describedby={gl === 'ok' ? hintId : undefined}
            onKeyDown={gl === 'ok' ? onCanvasKey : undefined}
          >
            {gl === 'ok' ? (
              <ViewerBoundary
                fallback={
                  <div className="lab__fallback">
                    {fallback2d}
                    <p className="note">La vista 3D no pudo iniciarse. Mostramos una vista plana de la zona grabable, a escala.</p>
                  </div>
                }
              >
                <Suspense fallback={<div className="lab__loading">Cargando vista 3D…</div>}>
                  <ProductViewer3D design={design} onContextLost={() => setGl('lost')} label={description} />
                </Suspense>
              </ViewerBoundary>
            ) : (
              <div className="lab__fallback">
                {fallback2d}
                <p className="note">
                  {gl === 'lost'
                    ? 'La vista 3D se interrumpió. Mostramos una vista plana de la zona grabable.'
                    : 'Tu dispositivo no permite la vista 3D. Mostramos una vista plana de la zona grabable, a escala.'}
                </p>
                {gl === 'lost' && (
                  <button type="button" className="link-button" onClick={() => setGl('ok')}>
                    Reintentar vista 3D
                  </button>
                )}
              </div>
            )}
          </div>

          {gl === 'ok' && (
            <div className="lab__toolbar" role="toolbar" aria-label="Controles de la vista">
              <div className="segmented" role="group" aria-label="Encuadre">
                <button type="button" aria-pressed={viewMode === 'product'} onClick={() => setViewMode('product')}>
                  Producto
                </button>
                <button type="button" aria-pressed={viewMode === 'zone'} onClick={() => setViewMode('zone')}>
                  Zona de grabado
                </button>
              </div>
              <button type="button" className="tool" onClick={resetView}>
                Restablecer vista
              </button>
              <button type="button" className="tool" aria-pressed={fullscreen} onClick={toggleFullscreen}>
                {fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              </button>
              <button type="button" className="tool" onClick={downloadImage}>
                Descargar imagen
              </button>
              <button type="button" className="tool" onClick={copyLink}>
                Copiar enlace
              </button>
            </div>
          )}
          <p className="lab__hint" id={hintId}>
            {gl === 'ok'
              ? 'Arrastrá para girar el objeto; usá la rueda o pellizcá para acercarte. Con teclado: flechas para girar, + y − para el zoom.'
              : ''}
            <span className="visually-hidden">{description}</span>
          </p>
        </div>
        <p className="lab__toast" role="status" aria-atomic="true">
          {toast}
        </p>
      </div>

      <div className="lab__panel">
        <Step n={1} title="Elegí el objeto" open>
          <ProductPicker />
        </Step>
        <Step n={2} title="Elegí el material" open>
          <MaterialSelector />
        </Step>
        <Step n={3} title="Diseñá el grabado" open>
          <DesignPanel />
        </Step>
        <Step n={4} title="Revisá y pedí tu presupuesto">
          <QuoteRequest />
        </Step>
      </div>
    </div>
  )
}

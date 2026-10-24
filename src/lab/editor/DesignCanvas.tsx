import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { assetStatus } from '../assets/assetStore'
import { snapMove, zoneBox } from '../model/arrange'
import { getProduct, getSurface, partMaterial } from '../model/catalog'
import { elementBounds, elementSize, unionBounds, type Box } from '../model/constraints'
import { elementLabel } from '../model/elements'
import { measureTextMm } from '../model/measure'
import type { DesignElement, SurfaceDef } from '../model/types'
import { paintZone, useRenderRevision } from '../render/preview'
import { useLab, type ElementPatch } from '../store'
import { PRIMARY_TEXT_ID } from '../ids'
import { Icon } from './icons'

type Pt = { x: number; y: number }

type Drag =
  | { mode: 'move'; start: Pt; origin: Map<string, DesignElement>; moving: Box; started: boolean }
  | { mode: 'scale'; start: Pt; el: DesignElement; started: boolean }
  | { mode: 'rotate'; start: Pt; el: DesignElement; started: boolean }
  | { mode: 'marquee'; start: Pt; additive: boolean; started: boolean }

const ZOOMS = [1, 1.5, 2, 3, 4] as const
/** Distancia de arrastre (px) a partir de la cual un clic pasa a ser un gesto. */
const DRAG_PX = 3
const SNAP_PX = 6

const deg = (rad: number) => (rad * 180) / Math.PI
const rad = (d: number) => (d * Math.PI) / 180

/** Pasa un vector del marco de la zona al marco local (sin rotar) de la capa. */
function toLocal(v: Pt, rotationDeg: number): Pt {
  const r = rad(-rotationDeg)
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) }
}

function scalePatch(el: DesignElement, p: Pt, start: Pt, shift: boolean): ElementPatch {
  const c = { x: el.x, y: el.y }
  const k = Math.hypot(p.x - c.x, p.y - c.y) / Math.max(1e-6, Math.hypot(start.x - c.x, start.y - c.y))
  if (el.kind === 'text') return { sizeMm: el.sizeMm * k }
  // Escala desde el centro. Logos: proporcional salvo con Shift; formas: libre salvo con Shift.
  const uniform = el.kind === 'image' ? !shift : shift
  if (uniform) return { widthMm: el.widthMm * k, heightMm: el.heightMm * k }
  const local = toLocal({ x: p.x - c.x, y: p.y - c.y }, el.rotation)
  if (el.kind === 'shape' && el.shape === 'line') return { widthMm: Math.abs(local.x) * 2 }
  return { widthMm: Math.max(0.5, Math.abs(local.x) * 2), heightMm: Math.max(0.5, Math.abs(local.y) * 2) }
}

function rotation(el: DesignElement, p: Pt, start: Pt, shift: boolean): number {
  const a0 = deg(Math.atan2(start.y - el.y, start.x - el.x))
  const a1 = deg(Math.atan2(p.y - el.y, p.x - el.x))
  let r = el.rotation + (a1 - a0)
  r = ((((r + 180) % 360) + 360) % 360) - 180
  if (shift) return Math.round(r / 15) * 15
  // Imán suave a los ángulos rectos.
  const right = Math.round(r / 90) * 90
  return Math.abs(r - right) < 3 ? right : Math.round(r * 10) / 10
}

const intersects = (a: Box, b: Box) => a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY

interface HandlesProps {
  el: DesignElement
  mmPerPx: number
  onStart: (e: ReactPointerEvent, mode: 'scale' | 'rotate', start: Pt) => void
}

/** Esquinas para escalar y control de giro de la capa seleccionada. */
function SelectionHandles({ el, mmPerPx, onStart }: HandlesProps) {
  const { w, h } = elementSize(el, measureTextMm)
  const handleR = 5 * mmPerPx
  const hitR = 12 * mmPerPx
  const rotY = -h / 2 - 22 * mmPerPx
  const corners: Pt[] = [
    { x: -w / 2, y: -h / 2 },
    { x: w / 2, y: -h / 2 },
    { x: w / 2, y: h / 2 },
    { x: -w / 2, y: h / 2 },
  ]
  // Punto local (SVG, y hacia abajo) → mm de la zona (y hacia arriba).
  const toZone = (c: Pt): Pt => {
    const r = rad(el.rotation)
    const ly = -c.y
    return { x: el.x + c.x * Math.cos(r) - ly * Math.sin(r), y: el.y + c.x * Math.sin(r) + ly * Math.cos(r) }
  }
  return (
    <g transform={`translate(${el.x} ${-el.y}) rotate(${-el.rotation})`} className="design-canvas__handles">
      <line x1={0} y1={-h / 2} x2={0} y2={rotY} vectorEffect="non-scaling-stroke" />
      <g className="handle handle--rotate" onPointerDown={(e) => onStart(e, 'rotate', toZone({ x: 0, y: rotY }))}>
        <circle cx={0} cy={rotY} r={hitR} className="handle__hit" />
        <circle cx={0} cy={rotY} r={handleR} vectorEffect="non-scaling-stroke" />
      </g>
      {corners.map((c, i) => (
        <g
          key={i}
          className="handle handle--scale"
          style={{ cursor: i % 2 === 0 ? 'nwse-resize' : 'nesw-resize' }}
          onPointerDown={(e) => onStart(e, 'scale', toZone(c))}
        >
          <circle cx={c.x} cy={c.y} r={hitR} className="handle__hit" />
          <rect x={c.x - handleR} y={c.y - handleR} width={handleR * 2} height={handleR * 2} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </g>
  )
}

/**
 * Referencias de una tira cilíndrica: dónde caen el frente, el dorso y el costado opuesto a la
 * manija. Son sólo del editor: no forman parte del diseño ni del arte para el taller.
 */
function WrapGuides({ surface, labelMm, dark }: { surface: SurfaceDef; labelMm: number; dark: boolean }) {
  const wrap = surface.wrap
  if (!wrap) return null
  const W = surface.widthMm
  const H = surface.heightMm
  const lines = [
    { x: wrap.frontOffsetMm, label: 'Frente' },
    { x: -wrap.frontOffsetMm, label: 'Dorso' },
    { x: 0, label: 'Costado' },
  ]
  const top = -H / 2 - labelMm * 0.6
  return (
    <g className={`design-canvas__wrap${dark ? ' is-dark' : ''}`} aria-hidden="true">
      {lines.map((l) => (
        <g key={l.label}>
          <line x1={l.x} x2={l.x} y1={-H / 2} y2={H / 2} vectorEffect="non-scaling-stroke" />
          <text x={l.x} y={top} fontSize={labelMm} textAnchor="middle">
            {l.label}
          </text>
        </g>
      ))}
      {[-1, 1].map((side) => (
        <text
          key={side}
          className="design-canvas__wrap-handle"
          fontSize={labelMm}
          textAnchor="middle"
          transform={`translate(${side * (W / 2 + labelMm * 1.1)} 0) rotate(${side * 90})`}
        >
          Manija
        </text>
      ))}
    </g>
  )
}

/** Si el color de fondo (#RRGGBB) es oscuro: las guías pasan a claro para seguir leyéndose. */
function isDarkColor(hex: string): boolean {
  const n = parseInt(hex.slice(1, 7), 16)
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255) < 110
}

/**
 * Lienzo de la zona grabable a escala: el fondo es el mismo dibujo que se proyecta en 3D y
 * encima va una capa SVG (en mm) con la selección, los controles y las guías.
 */
export function DesignCanvas() {
  const design = useLab((s) => s.design)
  const selection = useLab((s) => s.selection)
  const revision = useRenderRevision()
  const product = getProduct(design.productId)
  const surface = getSurface(product, design.surfaceId)
  const W = surface.widthMm
  const H = surface.heightMm
  const pad = Math.max(W, H) * 0.08
  const vbW = W + pad * 2
  const vbH = H + pad * 2

  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drag = useRef<Drag | null>(null)
  const [widthPx, setWidthPx] = useState(0)
  const [zoom, setZoom] = useState<(typeof ZOOMS)[number]>(1)
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] })
  const [marquee, setMarquee] = useState<Box | null>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const ro = new ResizeObserver(() => setWidthPx(svg.clientWidth))
    ro.observe(svg)
    setWidthPx(svg.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !widthPx) return
    const ppm = (widthPx * Math.min(2, window.devicePixelRatio || 1)) / vbW
    paintZone(canvasRef.current, design, product, surface, { ppm, padMm: pad, ghostOutside: true })
  }, [design, product, surface, pad, vbW, widthPx, revision])

  const mmPerPx = widthPx ? vbW / widthPx : 0.2
  const selected = design.elements.filter((e) => selection.includes(e.id))
  const single = selected.length === 1 ? selected[0]! : null

  function toMm(e: { clientX: number; clientY: number }): Pt {
    const svg = svgRef.current!
    const m = svg.getScreenCTM()
    if (!m) return { x: 0, y: 0 }
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: p.x, y: -p.y }
  }

  function startDrag(e: ReactPointerEvent, d: Drag) {
    e.stopPropagation()
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    svgRef.current?.focus({ preventScroll: true })
    drag.current = d
  }

  function onElementDown(e: ReactPointerEvent, el: DesignElement) {
    if (e.button !== 0) return
    const s = useLab.getState()
    if (e.shiftKey) {
      s.toggleSelect(el.id)
      e.stopPropagation()
      return
    }
    const ids = s.selection.includes(el.id) ? s.selection : [el.id]
    if (ids !== s.selection) s.select(ids)
    const movable = s.design.elements.filter((x) => ids.includes(x.id) && !x.locked)
    if (!movable.length) {
      e.stopPropagation()
      return
    }
    startDrag(e, {
      mode: 'move',
      start: toMm(e),
      origin: new Map(movable.map((x) => [x.id, x])),
      moving: unionBounds(movable.map((x) => elementBounds(x, measureTextMm)))!,
      started: false,
    })
  }

  function onBackgroundDown(e: ReactPointerEvent) {
    if (e.button !== 0) return
    startDrag(e, { mode: 'marquee', start: toMm(e), additive: e.shiftKey, started: false })
  }

  function onMove(e: ReactPointerEvent) {
    const d = drag.current
    if (!d) return
    const p = toMm(e)
    if (!d.started) {
      if (Math.hypot(p.x - d.start.x, p.y - d.start.y) / mmPerPx < DRAG_PX) return
      d.started = true
      if (d.mode !== 'marquee') useLab.getState().beginGesture()
    }
    const s = useLab.getState()
    if (d.mode === 'marquee') {
      setMarquee({ minX: Math.min(d.start.x, p.x), maxX: Math.max(d.start.x, p.x), minY: Math.min(d.start.y, p.y), maxY: Math.max(d.start.y, p.y) })
      return
    }
    if (d.mode === 'move') {
      let dx = p.x - d.start.x
      let dy = p.y - d.start.y
      if (!e.altKey) {
        const others = s.design.elements.filter((x) => !d.origin.has(x.id) && !x.hidden).map((x) => elementBounds(x, measureTextMm))
        const snap = snapMove(d.moving, dx, dy, others, zoneBox(surface), SNAP_PX * mmPerPx)
        dx = snap.dx
        dy = snap.dy
        setGuides(snap.guides)
      } else {
        setGuides({ x: [], y: [] })
      }
      const patches: Record<string, ElementPatch> = {}
      d.origin.forEach((el, id) => (patches[id] = { x: el.x + dx, y: el.y + dy }))
      s.updateElements(patches)
      return
    }
    if (d.mode === 'scale') s.updateElement(d.el.id, scalePatch(d.el, p, d.start, e.shiftKey))
    else s.updateElement(d.el.id, { rotation: rotation(d.el, p, d.start, e.shiftKey) })
  }

  function onUp(e: ReactPointerEvent) {
    const d = drag.current
    drag.current = null
    setGuides({ x: [], y: [] })
    if (!d) return
    const s = useLab.getState()
    if (d.mode === 'marquee') {
      setMarquee(null)
      if (!d.started) {
        if (!d.additive) s.select([])
        return
      }
      const p = toMm(e)
      const box = { minX: Math.min(d.start.x, p.x), maxX: Math.max(d.start.x, p.x), minY: Math.min(d.start.y, p.y), maxY: Math.max(d.start.y, p.y) }
      const hit = s.design.elements.filter((x) => !x.hidden && intersects(elementBounds(x, measureTextMm), box)).map((x) => x.id)
      s.select(d.additive ? [...new Set([...s.selection, ...hit])] : hit)
      return
    }
    if (d.started) s.endGesture()
  }

  function focusText(el: DesignElement) {
    if (el.kind !== 'text') return
    // Si la pestaña «Capa» se acaba de abrir, el campo se puede enfocar cuando se vuelve a dibujar.
    window.setTimeout(() => document.getElementById(PRIMARY_TEXT_ID)?.focus(), 0)
  }

  const px = (n: number) => n * mmPerPx
  const zoomIndex = ZOOMS.indexOf(zoom)

  return (
    <div className="design-canvas">
      <div className="design-canvas__scroller">
        <div
          className="design-canvas__sheet"
          style={{ ['--aspect' as string]: String(vbW / vbH), width: `calc(${zoom} * min(100%, var(--canvas-max-h) * ${vbW / vbH}))` }}
        >
          <canvas ref={canvasRef} className="design-canvas__bitmap" aria-hidden="true" />
          <svg
            ref={svgRef}
            className="design-canvas__overlay"
            viewBox={`${-vbW / 2} ${-vbH / 2} ${vbW} ${vbH}`}
            tabIndex={0}
            role="application"
            aria-roledescription="lienzo de diseño"
            aria-label={`Lienzo de ${surface.name.toLowerCase()}, ${W} × ${H} mm. ${
              selected.length ? `Seleccionado: ${selected.map(elementLabel).join(', ')}.` : 'Nada seleccionado.'
            } Flechas para mover, Supr para borrar.`}
            onPointerDown={onBackgroundDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <rect
              x={-W / 2}
              y={-H / 2}
              width={W}
              height={H}
              className="design-canvas__zone"
              vectorEffect="non-scaling-stroke"
            />
            <WrapGuides surface={surface} labelMm={px(11)} dark={isDarkColor(partMaterial(product, surface.part, design.materialId).color)} />
            {design.elements.map((el) => {
              if (el.hidden) return null
              const { w, h } = elementSize(el, measureTextMm)
              // Las capas muy finas (líneas, textos vacíos) tienen un área de toque mínima.
              const hw = Math.max(w, px(14))
              const hh = Math.max(h, px(14))
              const missing = el.kind === 'image' && assetStatus(el.assetId) === 'missing'
              return (
                <g key={el.id} transform={`translate(${el.x} ${-el.y}) rotate(${-el.rotation})`}>
                  {missing && (
                    <g className="design-canvas__missing">
                      <rect x={-w / 2} y={-h / 2} width={w} height={h} vectorEffect="non-scaling-stroke" />
                      <text x={0} y={0} fontSize={px(11)} textAnchor="middle" dominantBaseline="middle">
                        Logo no disponible en este dispositivo
                      </text>
                    </g>
                  )}
                  <rect
                    x={-hw / 2}
                    y={-hh / 2}
                    width={hw}
                    height={hh}
                    className={`design-canvas__hit${el.locked ? ' is-locked' : ''}`}
                    onPointerDown={(e) => onElementDown(e, el)}
                    onDoubleClick={() => focusText(el)}
                  />
                  {selection.includes(el.id) && (
                    <rect x={-w / 2} y={-h / 2} width={w} height={h} className="design-canvas__sel" vectorEffect="non-scaling-stroke" />
                  )}
                </g>
              )
            })}

            {single && !single.locked && !single.hidden && (
              <SelectionHandles
                el={single}
                mmPerPx={mmPerPx}
                onStart={(e, mode, start) => startDrag(e, { mode, start, el: single, started: false })}
              />
            )}

            {guides.x.map((x) => (
              <line key={`gx${x}`} className="design-canvas__guide" x1={x} x2={x} y1={-vbH / 2} y2={vbH / 2} vectorEffect="non-scaling-stroke" />
            ))}
            {guides.y.map((y) => (
              <line key={`gy${y}`} className="design-canvas__guide" y1={-y} y2={-y} x1={-vbW / 2} x2={vbW / 2} vectorEffect="non-scaling-stroke" />
            ))}
            {marquee && (
              <rect
                className="design-canvas__marquee"
                x={marquee.minX}
                y={-marquee.maxY}
                width={marquee.maxX - marquee.minX}
                height={marquee.maxY - marquee.minY}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </div>
      </div>
      <div className="design-canvas__zoom" role="group" aria-label="Zoom del lienzo">
        <button type="button" className="icon-button" aria-label="Alejar" disabled={zoomIndex <= 0} onClick={() => setZoom(ZOOMS[zoomIndex - 1]!)}>
          <Icon name="minus" />
        </button>
        <output className="design-canvas__zoom-value" aria-live="polite">
          {Math.round(zoom * 100)}%
        </output>
        <button
          type="button"
          className="icon-button"
          aria-label="Acercar"
          disabled={zoomIndex >= ZOOMS.length - 1}
          onClick={() => setZoom(ZOOMS[zoomIndex + 1]!)}
        >
          <Icon name="plus" />
        </button>
        <button type="button" className="icon-button" aria-label="Ajustar a la zona" disabled={zoom === 1} onClick={() => setZoom(1)}>
          <Icon name="fit" />
        </button>
      </div>
    </div>
  )
}

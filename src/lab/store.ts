import { create } from 'zustand'
import { alignElements, distributeElements, reorderElement, type AlignEdge, type ReorderDir } from './model/arrange'
import { getProduct, getShape, getSurface, PRODUCTS } from './model/catalog'
import { clearLayoutCache, fitsWidth, fitTextWidth, normalizeDesign, rescaleElements, straightenForBand, transferElements } from './model/constraints'
import { newElementId } from './model/elements'
import { measureTextMm } from './model/measure'
import { decodeDesign } from './model/serialize'
import { ringTextElements } from './editor/presets'
import { PRODUCT_PARAM } from './intent'
import { MAX_ELEMENTS, type DesignElement, type DesignState, type ImageElement, type ShapeElement, type StyleId, type TextElement } from './model/types'

export type ViewMode = 'product' | 'zone'
export type LabTab = 'edit' | '3d'
/** Pestaña de la columna de edición: capa seleccionada, lista de capas, grabado y presupuesto. */
export type EditTab = 'layer' | 'layers' | 'engraving' | 'quote'

/** Origen de un cambio grande que se puede deshacer (presets). */
export type UndoOrigin = 'preset'

/** Giro de cámara pedido desde el teclado: radianes y factor de zoom. */
export type OrbitFn = (azimuth: number, polar: number, zoom: number) => void

/** Cambios sobre una capa: cualquier propiedad salvo el tipo y el id. */
export type ElementPatch = Partial<Omit<TextElement, 'kind' | 'id'>> &
  Partial<Omit<ImageElement, 'kind' | 'id'>> &
  Partial<Omit<ShapeElement, 'kind' | 'id'>>

export function defaultDesign(productId: string): DesignState {
  const p = getProduct(productId)
  const d: DesignState = { v: 2, productId: p.id, notes: '', source: 'manual', ...structuredClone(p.defaultDesign) }
  // En una zona con anillo, los textos curvos se arman con la medida de ahora (ver fontsLoaded).
  const ring = getSurface(p, d.surfaceId).ring
  if (p.ringTexts && ring) {
    d.elements = ringTextElements(p.ringTexts.top, p.ringTexts.bottom, ring, measureTextMm, [`${p.id}-top`, `${p.id}-bottom`])
  }
  return d
}

/** Capas del diseño por defecto de un producto, tal como quedan en el store. */
const defaultElementsKey = (productId: string) => JSON.stringify(normalizeDesign(defaultDesign(productId)).elements)

const HISTORY_LIMIT = 100
/** Cambios seguidos con la misma clave (tipear, mover un slider) dentro de este lapso cuentan como un solo paso. */
const COALESCE_MS = 1000

interface LabState {
  design: DesignState
  /** Capas seleccionadas en el editor (no forman parte del diseño). */
  selection: string[]
  past: DesignState[]
  future: DesignState[]
  /** Última plantilla aplicada, para ofrecer deshacerla. Se descarta con cualquier otro cambio. */
  undo: { label: string; origin: UndoOrigin } | null
  /** Se incrementa cuando termina de cargar una tipografía: obliga a medir y dibujar de nuevo. */
  fontsVersion: number
  viewMode: ViewMode
  /** Mitad visible del Lab en pantallas angostas: edición o 3D. */
  tab: LabTab
  /** Pestaña visible de la columna de edición. Pasa sola a «Capa» cuando se elige una capa. */
  editTab: EditTab
  /** Se incrementa para pedirle al visor que restablezca la cámara. */
  viewResetToken: number
  /** Función de captura registrada por el visor 3D (PNG en data URL). */
  capture: (() => string | null) | null
  /** Control de cámara registrado por el visor 3D, para manejarlo con el teclado. */
  orbit: OrbitFn | null

  setProduct: (productId: string) => void
  setMaterial: (materialId: string) => void
  setSurface: (surfaceId: string) => void
  /** Cambia la forma; conserva el diseño y lo adapta a la zona nueva, como setProduct. */
  setShape: (shapeId: string) => void
  setStyle: (styleId: StyleId) => void
  setNotes: (notes: string) => void

  addElement: (el: DesignElement) => void
  updateElement: (id: string, patch: ElementPatch, coalesce?: string) => void
  /** Cambia el texto de una capa; si antes entraba en el ancho y ahora no, la achica para que entre. */
  setText: (id: string, text: string) => void
  /** Varias capas a la vez (arrastre de una selección múltiple). */
  updateElements: (patches: Record<string, ElementPatch>, coalesce?: string) => void
  removeElements: (ids: readonly string[]) => void
  duplicateElements: (ids: readonly string[]) => void
  reorder: (id: string, dir: ReorderDir) => void
  align: (ids: readonly string[], edge: AlignEdge) => void
  distribute: (ids: readonly string[], axis: 'x' | 'y') => void
  /** Reemplaza todas las capas (presets) y ofrece deshacer. */
  applyTemplate: (
    elements: DesignElement[],
    opts: { source: DesignState['source']; label: string; origin: UndoOrigin; styleId?: StyleId },
  ) => void
  resetDesign: () => void

  undoStep: () => void
  redoStep: () => void
  /** Empieza un gesto (arrastre): todos los cambios hasta `endGesture` son un solo paso del historial. */
  beginGesture: () => void
  endGesture: () => void

  select: (ids: string[]) => void
  toggleSelect: (id: string) => void

  renormalize: () => void
  fontsLoaded: () => void
  setViewMode: (mode: ViewMode) => void
  setTab: (tab: LabTab) => void
  setEditTab: (tab: EditTab) => void
  resetView: () => void
  setCapture: (fn: (() => string | null) | null) => void
  setOrbit: (fn: OrbitFn | null) => void
}

function initialDesign(): DesignState {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('d')
    const decoded = encoded ? decodeDesign(encoded, measureTextMm) : null
    if (decoded) return normalizeDesign(decoded)
    // ?producto=<id>: enlaces de la landing que abren el Lab con un objeto elegido.
    const requested = params.get(PRODUCT_PARAM)
    if (requested && PRODUCTS.some((p) => p.id === requested)) return defaultDesign(requested)
  }
  return defaultDesign(PRODUCTS[0]!.id)
}

const surfaceOf = (d: DesignState) => getSurface(getProduct(d.productId), d.surfaceId, d.shapeId)

/** Al abrir el Lab o cambiar de objeto, queda elegida la primera capa de texto (si hay). */
const firstText = (d: DesignState): string[] => {
  const text = d.elements.find((e) => e.kind === 'text')
  return text ? [text.id] : []
}

/** Elegir una capa abre la pestaña «Capa»; deseleccionar no cambia la pestaña. */
const selectionChange = (selection: string[]) => (selection.length ? { selection, editTab: 'layer' as const } : { selection })

export const useLab = create<LabState>((set, get) => {
  let gesture = false
  let lastCoalesce: { key: string; at: number } | null = null

  /** Aplica un cambio al diseño y lo registra en el historial. */
  const commit = (next: DesignState, coalesce?: string) => {
    const s = get()
    const now = Date.now()
    const merge = gesture || (coalesce !== undefined && lastCoalesce?.key === coalesce && now - lastCoalesce.at < COALESCE_MS)
    lastCoalesce = coalesce !== undefined ? { key: coalesce, at: now } : null
    const design = normalizeDesign(next)
    set({
      design,
      past: merge ? s.past : [...s.past, s.design].slice(-HISTORY_LIMIT),
      future: [],
      undo: null,
      selection: s.selection.filter((id) => design.elements.some((e) => e.id === id)),
    })
  }
  const manual = (fn: (d: DesignState) => Partial<DesignState>, coalesce?: string) => {
    const d = get().design
    commit({ ...d, ...fn(d), source: 'manual' }, coalesce)
  }
  const mapElements = (fn: (el: DesignElement) => DesignElement, coalesce?: string) =>
    manual((d) => ({ elements: d.elements.map(fn) }), coalesce)

  const restore = (target: DesignState) => {
    const s = get()
    const design = { ...target, notes: s.design.notes }
    set({ design, undo: null, selection: s.selection.filter((id) => design.elements.some((e) => e.id === id)) })
  }

  // Normalizado, como todo lo que pasa por commit: así se puede comparar con el diseño por defecto.
  const design = normalizeDesign(initialDesign())
  /**
   * Capas del diseño por defecto mientras el usuario no las toca. Si una fuente termina de cargar
   * y el diseño sigue así, se vuelve a armar con la medida real (los textos curvos de un anillo
   * dependen del ancho de las letras).
   */
  let pristine: string | null = null
  const markPristine = () => {
    const d = get().design
    const key = JSON.stringify(d.elements)
    pristine = key === defaultElementsKey(d.productId) ? key : null
  }
  queueMicrotask(markPristine)
  /** Capas del anillo antes de pasar a la banda, y cómo quedaron en la banda (ver setSurface). */
  let ringMemo: { key: string; elements: DesignElement[] } | null = null
  return {
    design,
    selection: firstText(design),
    past: [],
    future: [],
    undo: null,
    fontsVersion: 0,
    viewMode: 'product',
    tab: 'edit',
    editTab: 'layer',
    viewResetToken: 0,
    capture: null,
    orbit: null,

    setProduct: (productId) => {
      const d = get().design
      if (productId === d.productId) return
      const untouched = JSON.stringify(d.elements) === defaultElementsKey(d.productId)
      const next = defaultDesign(productId)
      // Si el usuario ya diseñó algo, se conserva y se adapta a la zona del nuevo objeto.
      if (!untouched) next.elements = rescaleElements(d.elements, surfaceOf(d), surfaceOf(next))
      commit({ ...next, notes: d.notes })
      set({ viewMode: 'product', selection: firstText(get().design) })
      markPristine()
    },
    setMaterial: (materialId) => manual(() => ({ materialId })),
    setSurface: (surfaceId) => {
      const d = get().design
      const from = surfaceOf(d)
      const to = getSurface(getProduct(d.productId), surfaceId, d.shapeId)
      let elements: DesignElement[]
      if (from.ring && !to.ring) {
        // De la boca a la banda: los textos curvos se enderezan; se guardan las capas para volver.
        elements = normalizeDesign({ ...d, surfaceId: to.id, elements: straightenForBand(d.elements, from, to, measureTextMm) }).elements
        ringMemo = { key: JSON.stringify(elements), elements: d.elements }
      } else if (to.ring && ringMemo && JSON.stringify(d.elements) === ringMemo.key) {
        // Volver a la boca sin haber cambiado nada: vuelve el diseño curvo que había.
        elements = ringMemo.elements
      } else {
        elements = transferElements(d.elements, from, to)
      }
      manual(() => ({ surfaceId: to.id, elements }))
    },
    setShape: (shapeId) => {
      const d = get().design
      const product = getProduct(d.productId)
      const shape = getShape(product, shapeId)
      if (!shape || shape.id === d.shapeId) return
      const to = getSurface(product, d.surfaceId, shape.id)
      manual(() => ({ shapeId: shape.id, surfaceId: to.id, elements: rescaleElements(d.elements, surfaceOf(d), to) }))
    },
    setStyle: (styleId) => manual(() => ({ styleId })),
    setNotes: (notes) => set({ design: { ...get().design, notes: notes.slice(0, 500) } }),

    addElement: (el) => {
      if (get().design.elements.length >= MAX_ELEMENTS) return
      manual((d) => ({ elements: [...d.elements, el] }))
      set(selectionChange([el.id]))
    },
    updateElement: (id, patch, coalesce) =>
      mapElements((el) => (el.id === id ? ({ ...el, ...patch } as DesignElement) : el), coalesce),
    setText: (id, text) =>
      mapElements((el) => {
        if (el.id !== id || el.kind !== 'text') return el
        const next = { ...el, text }
        const surface = surfaceOf(get().design)
        // Si ya se salía (tamaño elegido a mano), se respeta y sólo se avisa.
        return fitsWidth(el, surface, measureTextMm) ? fitTextWidth(next, surface, measureTextMm) : next
      }, `text:${id}`),
    updateElements: (patches, coalesce) =>
      mapElements((el) => (patches[el.id] ? ({ ...el, ...patches[el.id] } as DesignElement) : el), coalesce),
    removeElements: (ids) => {
      if (!ids.length) return
      manual((d) => ({ elements: d.elements.filter((e) => !ids.includes(e.id)) }))
    },
    duplicateElements: (ids) => {
      const d = get().design
      const copies = d.elements
        .filter((e) => ids.includes(e.id))
        .slice(0, MAX_ELEMENTS - d.elements.length)
        .map((e) => ({ ...e, id: newElementId(), x: e.x + 2, y: e.y - 2, locked: false }))
      if (!copies.length) return
      manual(() => ({ elements: [...d.elements, ...copies] }))
      set(selectionChange(copies.map((c) => c.id)))
    },
    reorder: (id, dir) => manual((d) => ({ elements: reorderElement(d.elements, id, dir) })),
    align: (ids, edge) => manual((d) => ({ elements: alignElements(d.elements, ids, edge, surfaceOf(d), measureTextMm) })),
    distribute: (ids, axis) => manual((d) => ({ elements: distributeElements(d.elements, ids, axis, measureTextMm) })),
    applyTemplate: (elements, { source, label, origin, styleId }) => {
      const d = get().design
      commit({ ...d, elements, styleId: styleId ?? d.styleId, source })
      set({ undo: { label, origin }, selection: [] })
    },
    resetDesign: () => {
      const d = get().design
      commit({ ...defaultDesign(d.productId), materialId: d.materialId, notes: d.notes })
      set({ selection: [] })
    },

    undoStep: () => {
      const { past, future, design } = get()
      const prev = past[past.length - 1]
      if (!prev) return
      set({ past: past.slice(0, -1), future: [...future, design] })
      restore(prev)
      lastCoalesce = null
    },
    redoStep: () => {
      const { past, future, design } = get()
      const next = future[future.length - 1]
      if (!next) return
      set({ future: future.slice(0, -1), past: [...past, design] })
      restore(next)
      lastCoalesce = null
    },
    beginGesture: () => {
      if (gesture) return
      const s = get()
      set({ past: [...s.past, s.design].slice(-HISTORY_LIMIT), future: [] })
      gesture = true
    },
    endGesture: () => {
      gesture = false
      lastCoalesce = null
    },

    select: (ids) => set(selectionChange(ids)),
    toggleSelect: (id) => {
      const sel = get().selection
      set(selectionChange(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]))
    },

    renormalize: () => set({ design: normalizeDesign(get().design) }),
    fontsLoaded: () => {
      clearLayoutCache(measureTextMm)
      const d = get().design
      if (pristine !== null && JSON.stringify(d.elements) === pristine) {
        // Sin sumar un paso al historial: para el usuario es el mismo diseño, ahora bien medido.
        const elements = normalizeDesign({ ...d, elements: defaultDesign(d.productId).elements }).elements
        pristine = JSON.stringify(elements)
        set({ design: { ...d, elements } })
      }
      set((s) => ({ fontsVersion: s.fontsVersion + 1 }))
    },
    setViewMode: (viewMode) => set({ viewMode }),
    setTab: (tab) => set({ tab }),
    setEditTab: (editTab) => set({ editTab }),
    resetView: () => set((s) => ({ viewMode: 'product', viewResetToken: s.viewResetToken + 1 })),
    setCapture: (capture) => set({ capture }),
    setOrbit: (orbit) => set({ orbit }),
  }
})

import type { ReactNode } from 'react'
import { useMenu } from '../editor/menu'
import { getProduct, PRODUCTS } from '../model/catalog'
import type { ProductDef } from '../model/types'
import { useLab } from '../store'

/** Siluetas de cada modelo. Es un Record: un modelo nuevo sin ícono no compila. */
const THUMBS: Record<ProductDef['modelId'], ReactNode> = {
  'knife-v1': (
    <>
      <path d="M44 14 H96 Q110 14 116 21 Q106 27 92 28 H44 Z" fill="currentColor" opacity=".55" />
      <rect x="40" y="12" width="5" height="18" rx="1" fill="currentColor" opacity=".7" />
      <path d="M6 15 Q22 12 40 14 V28 Q22 30 6 27 Q2 21 6 15 Z" fill="currentColor" />
    </>
  ),
  'board-v1': (
    <>
      <rect x="10" y="4" width="100" height="32" rx="5" fill="currentColor" />
      <rect x="16" y="13" width="4" height="14" rx="2" fill="var(--panel)" />
    </>
  ),
  // Termo con tapa-vaso, hombro, base de acero y manija plana a la derecha.
  'thermos-handle-v1': (
    <>
      <rect x="55.5" y="2" width="9" height="8.5" rx="1.5" fill="currentColor" opacity=".55" />
      <path d="M54.5 13.5 Q54.5 10.5 57 10.5 H63 Q65.5 10.5 65.5 13.5 V34 H54.5 Z" fill="currentColor" />
      <rect x="54.5" y="34" width="11" height="4" rx="1" fill="currentColor" opacity=".55" />
      <path d="M65.5 15 H68 Q69.5 15 69.5 16.5 V28.5 Q69.5 30 68 30 H65.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  // Termo media manija: pico cebador, tapa y collar, cuerpo recto y asa en L a la izquierda.
  'thermos-half-v1': (
    <>
      <path d="M60 5 Q60 2.5 63 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
      <rect x="55.5" y="5" width="9" height="3" rx="1" fill="currentColor" opacity=".7" />
      <rect x="55" y="8" width="10" height="4" fill="currentColor" opacity=".7" />
      <rect x="54.5" y="12" width="11" height="22" fill="currentColor" />
      <rect x="54.5" y="34" width="11" height="4" rx="1" fill="currentColor" opacity=".55" />
      <path d="M55 10 H51.5 Q50.5 10 50.5 11 V22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  // Placa sobre base: base biselada con la chapa encima y líneas de texto.
  'plaque-base-v1': (
    <>
      <rect x="44" y="5" width="32" height="30" rx="2" fill="currentColor" opacity=".55" />
      <rect x="48" y="9" width="24" height="22" rx="1" fill="currentColor" />
      <rect x="53" y="14" width="14" height="2" rx="1" fill="var(--panel)" />
      <rect x="51" y="19" width="18" height="3" rx="1" fill="var(--panel)" />
      <rect x="54" y="25" width="12" height="2" rx="1" fill="var(--panel)" />
    </>
  ),
  // Placa de pared: rectángulo con un tornillo en cada esquina y líneas de texto.
  'plaque-wall-v1': (
    <>
      <rect x="40" y="6" width="40" height="28" rx="1.5" fill="currentColor" />
      {[
        [43.5, 9.5],
        [76.5, 9.5],
        [43.5, 30.5],
        [76.5, 30.5],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.3" fill="var(--panel)" />
      ))}
      <rect x="48" y="15" width="24" height="3.5" rx="1" fill="var(--panel)" />
      <rect x="51" y="22" width="18" height="2" rx="1" fill="var(--panel)" />
    </>
  ),
  // Chapita: rectángulo de puntas redondeadas con el agujero a la izquierda y un tramo de cadena.
  'dog-tag-v1': (
    <>
      <path d="M44 20 Q36 14 34 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="1.4 1" opacity=".7" />
      <rect x="40" y="10" width="40" height="22" rx="6" fill="currentColor" />
      <circle cx="45.5" cy="21" r="2" fill="var(--panel)" />
      <rect x="52" y="19" width="22" height="4" rx="1" fill="var(--panel)" />
    </>
  ),
  // Trofeo: placa octogonal transparente (contorno) sobre una base negra.
  'trophy-v1': (
    <>
      <path d="M54.5 3 H65.5 L70 7.5 V28 H50 V7.5 Z" fill="currentColor" opacity=".3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="54" y="12" width="12" height="2.5" rx="1" fill="currentColor" />
      <rect x="56" y="17.5" width="8" height="2" rx="1" fill="currentColor" />
      <rect x="46" y="28" width="28" height="7" rx="1.5" fill="currentColor" />
    </>
  ),
}

function Thumb({ modelId }: { modelId: ProductDef['modelId'] }) {
  return (
    <svg viewBox="0 0 120 40" aria-hidden="true" className="thumb">
      {THUMBS[modelId]}
    </svg>
  )
}

/** Botón con el objeto actual y un menú con todos los objetos. */
export function ProductPicker() {
  const productId = useLab((s) => s.design.productId)
  const setProduct = useLab((s) => s.setProduct)
  const { open, close, toggle, onListKey, rootRef, buttonRef, listRef } = useMenu()
  const current = getProduct(productId)
  return (
    <div className="menu product-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="product-menu__button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <Thumb modelId={current.modelId} />
        <span className="visually-hidden">Objeto: </span>
        <span className="product-menu__name">{current.name}</span>
        <span className="product-menu__caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div ref={listRef} role="menu" className="menu__list product-menu__list" aria-label="Objeto a personalizar" onKeyDown={onListKey}>
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitemradio"
              aria-checked={p.id === productId}
              className="menu__item product-menu__item"
              onClick={() => {
                setProduct(p.id)
                close()
              }}
            >
              <Thumb modelId={p.modelId} />
              <span>{p.name}</span>
              <span className="product-menu__check" aria-hidden="true">
                {p.id === productId ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

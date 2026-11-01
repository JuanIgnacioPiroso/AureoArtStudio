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
  // Copas y vasos: copa de vino en contorno, con tallo y pie.
  'glassware-v1': (
    <>
      <path d="M52 3 H68 Q69 13 66 18 Q63 22 60 22 Q57 22 54 18 Q51 13 52 3 Z" fill="currentColor" opacity=".3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="59.2" y="22" width="1.6" height="10" fill="currentColor" />
      <rect x="54" y="32" width="12" height="2.5" rx="1.2" fill="currentColor" />
      <rect x="55" y="10" width="10" height="2" rx="1" fill="currentColor" />
    </>
  ),
  // Mate de madera: fondo redondeado y boca apenas abierta.
  'mate-wood-v1': (
    <>
      <path d="M50.5 8 H69.5 Q68 12 68 16 V27 Q68 35 60 35 Q52 35 52 27 V16 Q52 12 50.5 8 Z" fill="currentColor" />
      <rect x="54" y="19" width="12" height="3" rx="1" fill="var(--panel)" />
    </>
  ),
  // Mate imperial: panza redonda sobre tres patas y virola alta.
  'mate-imperial-v1': (
    <>
      <path d="M53 15 Q47 19 47 25 Q47 31 53 33 H67 Q73 31 73 25 Q73 19 67 15 Z" fill="currentColor" />
      <path d="M56 32 L52 37 H55 L59 33 Z M64 32 L68 37 H65 L61 33 Z M58.5 33 L58 37 H62 L61.5 33 Z" fill="currentColor" />
      <rect x="52" y="5" width="16" height="10" rx="1.2" fill="currentColor" opacity=".55" />
    </>
  ),
  // Mate camionero: cuerpo de cuero que se ensancha abajo, base fruncida y virola ancha.
  'mate-camionero-v1': (
    <>
      <path d="M53 12 Q51 20 48 26 Q46 31 48 34 L51 36 L54 34 L57 36 L60 34 L63 36 L66 34 L69 36 L72 34 Q74 31 72 26 Q69 20 67 12 Z" fill="currentColor" />
      <rect x="50" y="6" width="20" height="6" rx="1.2" fill="currentColor" opacity=".55" />
    </>
  ),
  // Mate de acero: vaso bajo de paredes casi rectas, con la boca redondeada.
  'mate-steel-v1': (
    <>
      <path d="M50 9 H70 V31 Q70 35 66 35 H54 Q50 35 50 31 Z" fill="currentColor" />
      <rect x="49" y="7.5" width="22" height="3" rx="1.5" fill="currentColor" opacity=".6" />
      <rect x="52" y="19" width="16" height="3" rx="1" fill="var(--panel)" />
    </>
  ),
  // Billetera: tapa con el lomo redondeado a la izquierda, costura punteada y una línea de texto.
  'leather-wallet-v1': (
    <>
      <path d="M47 7 H76 Q78 7 78 9 V31 Q78 33 76 33 H47 Q42 33 42 28 V12 Q42 7 47 7 Z" fill="currentColor" />
      <path d="M47 10 H75 V30 H47" fill="none" stroke="var(--panel)" strokeWidth=".8" strokeDasharray="1.6 1.2" />
      <rect x="53" y="18.5" width="16" height="3" rx="1" fill="var(--panel)" />
    </>
  ),
  // Llavero: argolla arriba, ojal con su agujero y pieza rectangular con costura punteada.
  'leather-keychain-v1': (
    <>
      <circle cx="60" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity=".7" />
      <path d="M56 15 V12 A4 4 0 0 1 64 12 V15 H66 Q68 15 68 17 V35 Q68 37 66 37 H54 Q52 37 52 35 V17 Q52 15 54 15 Z" fill="currentColor" />
      <circle cx="60" cy="12" r="1.5" fill="var(--panel)" />
      <rect x="54.5" y="17.5" width="11" height="17" rx="1" fill="none" stroke="var(--panel)" strokeWidth=".7" strokeDasharray="1.4 1" />
    </>
  ),
  // Cinturón: hebilla a la izquierda, tira con costura, tres agujeros y punta redondeada.
  'leather-belt-v1': (
    <>
      <path d="M20 14 H96 A6 6 0 0 1 96 26 H20 Z" fill="currentColor" />
      <rect x="8" y="10" width="14" height="20" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7" />
      <path d="M15 20 H24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      <path d="M26 16.5 H95 M26 23.5 H95" stroke="var(--panel)" strokeWidth=".7" strokeDasharray="1.6 1.2" />
      {[80, 86, 92].map((cx) => (
        <circle key={cx} cx={cx} cy="20" r="1.1" fill="var(--panel)" />
      ))}
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

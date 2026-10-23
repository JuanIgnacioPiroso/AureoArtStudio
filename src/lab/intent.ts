/**
 * Puente liviano entre la landing y el Custom Lab (que se carga diferido):
 * la landing pide un producto sin importar el store ni el catálogo.
 */
const EVENT = 'aureo:select-product'
let pending: string | null = null

/** Parámetro de URL con el que un enlace abre el Lab con un producto elegido. */
export const PRODUCT_PARAM = 'producto'

/** URL compartible (y apta para Cmd/Ctrl+clic) que abre el Lab con el producto elegido. */
export function labProductHref(productId: string): string {
  return `?${PRODUCT_PARAM}=${encodeURIComponent(productId)}#custom-lab`
}

export function requestLabProduct(productId: string) {
  pending = productId
  window.dispatchEvent(new CustomEvent(EVENT, { detail: productId }))
}

/** El Lab consume el pedido pendiente al montarse y escucha los siguientes. */
export function onLabProductRequest(handler: (productId: string) => void): () => void {
  if (pending) {
    handler(pending)
    pending = null
  }
  const listener = (e: Event) => {
    pending = null
    handler((e as CustomEvent<string>).detail)
  }
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}

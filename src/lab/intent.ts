/**
 * URLs del Custom Lab, en un módulo liviano: la home las usa sin importar el store ni el catálogo.
 */

/** Ruta de la página del Custom Lab. */
export const LAB_PATH = '/custom-lab/'

/** Parámetro de URL con el que un enlace abre el Lab con un producto elegido. */
export const PRODUCT_PARAM = 'producto'

/** URL compartible que abre la página del Lab con el producto elegido. */
export function labProductHref(productId: string): string {
  return `${LAB_PATH}?${PRODUCT_PARAM}=${encodeURIComponent(productId)}`
}

/**
 * Enlaces viejos, de cuando el Lab era una sección de la home (`/?d=…#custom-lab`, `/?producto=…`):
 * devuelve la URL equivalente en la página del Lab, con los mismos parámetros, o null si no hace falta redirigir.
 * La home aplica esta misma regla con un script inline en `src/pages/index.astro`: si cambia acá, cambia allá.
 */
export function legacyLabRedirect(search: string): string | null {
  const params = new URLSearchParams(search)
  if (!params.has('d') && !params.has(PRODUCT_PARAM)) return null
  return `${LAB_PATH}?${params.toString()}`
}

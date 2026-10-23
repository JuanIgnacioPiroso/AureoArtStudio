import { saveAsset } from './assetStore'

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'] as const
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
/** Lado mayor con el que se guarda la imagen: alcanza para grabar a ~10 px/mm en 20 cm. */
const MAX_SIDE_PX = 2048

export class ImageImportError extends Error {}

export interface ImportedImage {
  assetId: string
  /** Proporción ancho / alto, ya recortados los márgenes vacíos. */
  aspect: number
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ImageImportError('No pudimos leer la imagen. Probá con otro archivo PNG, JPG o SVG.'))
    }
    img.src = url
  })
}

/** Recorta los bordes transparentes o casi blancos, para que la capa ocupe sólo el logo. */
function contentBox(data: Uint8ClampedArray, w: number, h: number) {
  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const a = data[i + 3]!
      const lum = (0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!) / 255
      if (a > 12 && lum < 0.94) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w, h }
  const pad = Math.round(Math.max(w, h) * 0.01)
  const x0 = Math.max(0, minX - pad)
  const y0 = Math.max(0, minY - pad)
  return { x: x0, y: y0, w: Math.min(w, maxX + pad + 1) - x0, h: Math.min(h, maxY + pad + 1) - y0 }
}

/** Valida, normaliza a PNG (con tope de tamaño y márgenes recortados) y guarda la imagen. */
export async function importImage(file: File): Promise<ImportedImage> {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new ImageImportError('Formato no admitido. Usá PNG, JPG, WebP o SVG.')
  }
  if (file.size > MAX_IMAGE_BYTES) throw new ImageImportError('La imagen pesa más de 5 MB. Probá con una versión más liviana.')

  const img = await loadImage(file)
  // Un SVG sin medidas declaradas puede reportar 0 × 0.
  const nw = img.naturalWidth || 1024
  const nh = img.naturalHeight || 1024
  // Los SVG se rasterizan al tamaño máximo; las imágenes de píxeles sólo se achican.
  const fit = MAX_SIDE_PX / Math.max(nw, nh)
  const scale = file.type === 'image/svg+xml' ? fit : Math.min(1, fit)
  const w = Math.max(1, Math.round(nw * scale))
  const h = Math.max(1, Math.round(nh * scale))

  const full = document.createElement('canvas')
  full.width = w
  full.height = h
  const fctx = full.getContext('2d', { willReadFrequently: true })
  if (!fctx) throw new ImageImportError('Tu navegador no permite procesar imágenes.')
  fctx.drawImage(img, 0, 0, w, h)
  const box = contentBox(fctx.getImageData(0, 0, w, h).data, w, h)

  const out = document.createElement('canvas')
  out.width = box.w
  out.height = box.h
  out.getContext('2d')!.drawImage(full, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h)
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'))
  if (!blob) throw new ImageImportError('No pudimos procesar la imagen.')
  return { assetId: await saveAsset(blob), aspect: box.w / box.h }
}

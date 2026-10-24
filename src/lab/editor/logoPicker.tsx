import { useRef } from 'react'
import { ACCEPTED_IMAGE_TYPES, ImageImportError, importImage } from '../assets/importImage'
import { getProduct, getSurface } from '../model/catalog'
import { imageElement } from '../model/elements'
import { useLab } from '../store'

/** Abre el selector de archivos y agrega el logo elegido como capa nueva. */
export function useLogoPicker(onError: (msg: string) => void) {
  const input = useRef<HTMLInputElement>(null)
  const replacing = useRef<string | null>(null)

  async function onFile(file: File | undefined) {
    if (!file) return
    const s = useLab.getState()
    const surface = getSurface(getProduct(s.design.productId), s.design.surfaceId, s.design.shapeId)
    try {
      const { assetId, aspect } = await importImage(file)
      const target = replacing.current ? s.design.elements.find((e) => e.id === replacing.current) : null
      if (target?.kind === 'image') {
        // Al reemplazar se conserva el ancho y la posición; el alto sigue la proporción del logo nuevo.
        s.updateElement(target.id, { assetId, heightMm: target.widthMm / aspect })
        return
      }
      let w = surface.widthMm * 0.5
      if (w / aspect > surface.heightMm * 0.8) w = surface.heightMm * 0.8 * aspect
      s.addElement(imageElement({ assetId, widthMm: w, heightMm: w / aspect }))
    } catch (err) {
      onError(err instanceof ImageImportError ? err.message : 'No pudimos cargar la imagen.')
    } finally {
      replacing.current = null
      if (input.current) input.current.value = ''
    }
  }

  const element = (
    <input
      ref={input}
      type="file"
      accept={ACCEPTED_IMAGE_TYPES.join(',')}
      className="visually-hidden"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => void onFile(e.target.files?.[0])}
    />
  )
  return {
    element,
    open: (replaceId?: string) => {
      replacing.current = replaceId ?? null
      input.current?.click()
    },
  }
}


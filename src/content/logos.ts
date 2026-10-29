import type { ImageMetadata } from 'astro'

/**
 * Logos de «Confían en nosotros». Se cargan solos desde src/assets/logos/: sumar un logo es soltar
 * el archivo en la carpeta. El nombre del archivo da el orden (prefijo numérico opcional) y el texto alternativo.
 */
export interface TrustedLogo {
  /** Nombre del archivo sin carpeta, p. ej. "02-Municipalidad-de-Tandil.png". Define el orden. */
  file: string
  /** Nombre accesible derivado del archivo: "Municipalidad de Tandil". */
  name: string
  /** Lo que devuelve el glob. En los SVG, Astro devuelve un componente que también trae `src`, `width` y `height`. */
  src: ImageMetadata
  /** true si es .svg: se pinta con <img src={src.src}> directo, sin pasar por <Image>. */
  isSvg: boolean
}

/** `src/assets/logos/02-Café_Martínez.webp` → «Café Martínez». */
export function logoNameFromFile(path: string): string {
  const base = path.split('/').pop() ?? ''
  const name = base
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_]/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const modules = import.meta.glob<ImageMetadata>('../assets/logos/*.{svg,png,webp,jpg,jpeg}', {
  eager: true,
  import: 'default',
})

export const TRUSTED_LOGOS: TrustedLogo[] = Object.entries(modules)
  .map(([path, src]) => {
    const file = path.split('/').pop() ?? path
    return { file, name: logoNameFromFile(file), src, isSvg: file.endsWith('.svg') }
  })
  .sort((a, b) => a.file.localeCompare(b.file, 'es', { numeric: true }))

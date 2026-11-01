import { LAB_PATH } from '../intent'
import { LegacyDesignV1Schema, migrateV1 } from './legacy'
import { DesignStateSchema, type DesignState, type MeasureText } from './types'

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

/** Medición aproximada para migrar enlaces viejos donde no hay navegador (tests, servidor). */
const approxMeasure: MeasureText = (text, _font, h) => text.length * h * 0.6

export function encodeDesign(design: DesignState): string {
  return toBase64Url(JSON.stringify(design))
}

/** Decodifica y valida un diseño de la URL (v2, o v1 migrado). Devuelve null si no es válido. */
export function decodeDesign(encoded: string, measure: MeasureText = approxMeasure): DesignState | null {
  try {
    const raw: unknown = JSON.parse(fromBase64Url(encoded))
    const v2 = DesignStateSchema.safeParse(raw)
    if (v2.success) return v2.data
    const v1 = LegacyDesignV1Schema.safeParse(raw)
    return v1.success ? migrateV1(v1.data, measure) : null
  } catch {
    return null
  }
}

/** Identificador corto y estable del diseño (FNV-1a sobre los campos que definen el grabado). */
export function designId(design: DesignState): string {
  const { notes: _notes, source: _source, ...rest } = design
  const s = JSON.stringify(rest)
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return `AU-${(h >>> 0).toString(36).toUpperCase().padStart(7, '0')}`
}

/** Enlace que reabre el diseño en la página del Lab; de `base` sólo se toma el origen. */
export function designUrl(design: DesignState, base: string): string {
  const url = new URL(LAB_PATH, base)
  url.searchParams.set('d', encodeDesign(design))
  return url.toString()
}

import { ENGRAVING_STYLES, FONTS, getProduct, getSurface, partMaterial } from '../src/lab/model/catalog'
import type { DesignElement, DesignState, FontCategory } from '../src/lab/model/types'

export const IMAGE_PROVIDERS = ['gemini', 'openai'] as const
export type ImageProvider = (typeof IMAGE_PROVIDERS)[number]

/** Modelos por defecto; se pueden cambiar con IMAGE_MODEL sin tocar código. */
const DEFAULT_MODEL: Record<ImageProvider, string> = {
  gemini: 'gemini-3.1-flash-image',
  openai: 'gpt-image-2',
}

/** Error del proveedor con el estado HTTP que devolvió (429 = límite de uso). */
export class ProviderError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function configuredProvider(): ImageProvider | null {
  const p = process.env.IMAGE_PROVIDER?.trim().toLowerCase()
  if (!process.env.IMAGE_API_KEY || !p) return null
  return (IMAGE_PROVIDERS as readonly string[]).includes(p) ? (p as ImageProvider) : null
}

const STYLE_LOOK: Record<DesignState['styleId'], string> = {
  burn: 'laser-burned into the wood: warm dark-brown toasted strokes, slightly recessed, following the wood grain',
  'mark-dark': 'laser-annealed dark mark on the steel: matte charcoal-black strokes, perfectly flat, no depth',
  frost: 'laser-frosted on the steel: pale satin-white strokes, subtle, catching the light',
}

const FONT_LOOK: Record<FontCategory, string> = {
  classic: 'classic high-contrast serif',
  display: 'engraved display capitals',
  modern: 'clean modern sans-serif',
  script: 'elegant calligraphic script',
  technical: 'monospaced typewriter-style',
}

function describe(el: DesignElement): string {
  if (el.kind === 'text') {
    const lines = el.text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((t) => `"${t}"`)
      .join(' / ')
    const arc = el.arc ? `, curved along a ${Math.abs(el.arc)}° arc (${el.arc > 0 ? 'arching upwards' : 'arching downwards'})` : ''
    return `the text ${lines} in a ${FONT_LOOK[FONTS[el.fontId].category]} typeface (${FONTS[el.fontId].name}), ${el.sizeMm} mm cap height${arc}`
  }
  if (el.kind === 'image') return `a customer logo (${el.widthMm} × ${el.heightMm} mm), exactly as shown in the render`
  if (el.shape === 'line') return `a straight engraved line ${el.widthMm} mm long`
  return `${el.fill ? 'a solid' : 'an outlined'} ${el.shape === 'ellipse' ? 'ellipse' : 'rectangle'} (${el.widthMm} × ${el.heightMm} mm)`
}

/** Instrucciones para convertir la captura 3D en una foto de producto sin cambiar el grabado. */
export function buildMockupPrompt(design: DesignState): string {
  const product = getProduct(design.productId)
  const surface = getSurface(product, design.surfaceId)
  const material = partMaterial(product, surface.part, design.materialId)
  const layers = design.elements.filter((e) => !e.hidden && (e.kind !== 'text' || e.text.trim()))
  const content = layers.length ? layers.map(describe).join('; ') : 'nothing'

  return [
    'Turn the attached 3D render into a photorealistic studio product photograph.',
    `Product: ${product.name} (${product.description}). Keep its exact shape, proportions, camera angle and framing from the render.`,
    `Material of the engraved part: ${material.name} (${material.kind === 'wood' ? 'natural wood with visible grain' : 'brushed stainless steel'}).`,
    `Engraving on the ${surface.name.toLowerCase()} (${surface.widthMm} × ${surface.heightMm} mm area), composed of: ${content}.`,
    `Engraving finish: ${STYLE_LOOK[design.styleId]} (${ENGRAVING_STYLES[design.styleId].name}).`,
    'The engraving must match the render exactly: same characters, spelling, accents, logos, shapes, positions, sizes and rotations. Do not add, remove or translate any text, logos or decorations.',
    'Setting: soft natural light on a neutral surface with a shallow depth of field, like a high-end artisan shop photo. No hands, no people, no watermark.',
  ].join('\n')
}

function splitDataUrl(dataUrl: string): { mime: string; base64: string } {
  const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl)
  if (!m) throw new ProviderError(400, 'Imagen de referencia inválida.')
  return { mime: m[1]!, base64: m[2]! }
}

async function failure(res: Response): Promise<never> {
  const detail = await res.text().catch(() => '')
  throw new ProviderError(res.status, detail.slice(0, 500))
}

async function gemini(prompt: string, png: string, key: string, model: string): Promise<string> {
  const { mime, base64 } = splitDataUrl(png)
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  })
  if (!res.ok) return failure(res)
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[]
  }
  const img = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData
  if (!img?.data) throw new ProviderError(422, 'Gemini no devolvió una imagen.')
  return `data:${img.mimeType ?? 'image/png'};base64,${img.data}`
}

async function openai(prompt: string, png: string, key: string, model: string): Promise<string> {
  const { mime, base64 } = splitDataUrl(png)
  const form = new FormData()
  form.set('model', model)
  form.set('prompt', prompt)
  form.set('n', '1')
  form.set('size', '1536x1024')
  form.set('image', new Blob([Buffer.from(base64, 'base64')], { type: mime }), 'render.png')
  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    body: form,
  })
  if (!res.ok) return failure(res)
  const data = (await res.json()) as { data?: { b64_json?: string }[] }
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new ProviderError(422, 'OpenAI no devolvió una imagen.')
  return `data:image/png;base64,${b64}`
}

/** Genera la foto con el proveedor configurado y la devuelve como data URL. */
export async function generateMockup(provider: ImageProvider, design: DesignState, referencePng: string): Promise<string> {
  const key = process.env.IMAGE_API_KEY!
  const model = process.env.IMAGE_MODEL?.trim() || DEFAULT_MODEL[provider]
  const prompt = buildMockupPrompt(design)
  return provider === 'gemini' ? gemini(prompt, referencePng, key, model) : openai(prompt, referencePng, key, model)
}

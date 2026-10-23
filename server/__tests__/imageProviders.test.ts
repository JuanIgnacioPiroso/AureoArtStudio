import { describe, expect, it } from 'vitest'
import { getProduct } from '../../src/lab/model/catalog'
import { imageElement, shapeElement, textElement } from '../../src/lab/model/elements'
import type { DesignState } from '../../src/lab/model/types'
import { buildMockupPrompt } from '../imageProviders'

describe('prompt de imagen', () => {
  it('incluye el texto exacto, las capas, el material y el acabado del diseño', () => {
    const design: DesignState = {
      v: 2,
      productId: 'board',
      notes: '',
      source: 'manual',
      ...structuredClone(getProduct('board').defaultDesign),
      elements: [
        textElement({ text: 'Familia Núñez', fontId: 'great-vibes', arc: 120 }),
        imageElement({ assetId: 'abc', widthMm: 40, heightMm: 20 }),
        shapeElement('rect'),
      ],
    }
    const prompt = buildMockupPrompt(design)
    expect(prompt).toContain('"Familia Núñez"')
    expect(prompt).toContain('calligraphic script')
    expect(prompt).toContain('120° arc')
    expect(prompt).toContain('customer logo')
    expect(prompt).toContain('rectangle')
    expect(prompt).toContain('Madera clara')
    expect(prompt).toContain('Quemado láser')
  })
})

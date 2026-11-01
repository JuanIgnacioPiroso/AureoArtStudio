import { describe, expect, it } from 'vitest'
import type { WrapDef } from '../../model/types'
import { wrapAngle } from '../surfaceFrame'

describe('wrapAngle', () => {
  // El frente de los termos mira hacia -Y.
  const FRONT = -Math.PI / 2
  const handleWrap: WrapDef = { radiusMm: 45, centerAngle: Math.PI, frontOffsetMm: 70.7 }
  const halfWrap: WrapDef = { radiusMm: 45, centerAngle: 0, frontOffsetMm: -70.7 }

  it('ubica el frente en -Y en el termo con manija (manija en +X)', () => {
    expect(wrapAngle(handleWrap, handleWrap.frontOffsetMm)).toBeCloseTo(FRONT, 3)
  })

  it('ubica el frente en -Y en el termo media manija (manija en -X)', () => {
    expect(wrapAngle(halfWrap, halfWrap.frontOffsetMm)).toBeCloseTo(FRONT, 3)
  })

  it('el centro de la tira queda opuesto a la manija', () => {
    expect(Math.abs(wrapAngle(handleWrap, 0))).toBeCloseTo(Math.PI)
    expect(wrapAngle(halfWrap, 0)).toBeCloseTo(0)
  })
})

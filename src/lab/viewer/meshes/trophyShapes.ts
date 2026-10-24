import * as THREE from 'three'
import { roundedRect } from './shapes'

export type TrophyShapeId = 'octagon' | 'rectangle' | 'arch' | 'flame'

/** Placa del trofeo: 150 × 200 mm. Las siluetas van con x centrada y la base de la placa en y = 0. */
export const TROPHY_PLATE = { width: 1.5, height: 2 }

const W = TROPHY_PLATE.width / 2
const H = TROPHY_PLATE.height

function octagon() {
  const c = 0.35
  const s = new THREE.Shape()
  s.moveTo(-W + c, 0)
  s.lineTo(W - c, 0)
  s.lineTo(W, c)
  s.lineTo(W, H - c)
  s.lineTo(W - c, H)
  s.lineTo(-W + c, H)
  s.lineTo(-W, H - c)
  s.lineTo(-W, c)
  s.closePath()
  return s
}

function rectangle() {
  return roundedRect(new THREE.Shape(), 0, H / 2, W * 2, H, 0.04) as THREE.Shape
}

/** Rectángulo con la parte de arriba en semicírculo (radio = medio ancho). */
function arch() {
  const s = new THREE.Shape()
  s.moveTo(-W, 0)
  s.lineTo(W, 0)
  s.lineTo(W, H - W)
  s.absarc(0, H - W, W, 0, Math.PI, false)
  s.lineTo(-W, 0)
  return s
}

/** Gota: ancha abajo, con la base plana para encastrar, y en punta arriba. */
function flame() {
  const s = new THREE.Shape()
  s.moveTo(0, H)
  s.bezierCurveTo(0.25, 1.55, W, 1.0, W, 0.55)
  s.quadraticCurveTo(W, 0, 0.6, 0)
  s.lineTo(-0.6, 0)
  s.quadraticCurveTo(-W, 0, -W, 0.55)
  s.bezierCurveTo(-W, 1.0, -0.25, 1.55, 0, H)
  return s
}

const BUILDERS: Record<TrophyShapeId, () => THREE.Shape> = { octagon, rectangle, arch, flame }

export function trophyShape(id: string | undefined): THREE.Shape {
  return (BUILDERS[id as TrophyShapeId] ?? octagon)()
}

import * as THREE from 'three'
import { MM } from '../../model/catalog'

export type KeychainShapeId = 'rect' | 'round' | 'shield'

/**
 * Llavero: pieza de cuero de 4 mm con un ojal arriba. Las siluetas van en mm, con el centro de
 * la pieza (sin el ojal) en el origen e y hacia arriba.
 */
export const KEYCHAIN = { thicknessMm: 4, tabHalfMm: 8, tabRiseMm: 4, holeRMm: 3 }

/** Mitad del alto de cada pieza, sin el ojal (mm). La pieza se para con su punto más bajo en z = 0. */
export const KEYCHAIN_HALF_HEIGHT_MM: Record<KeychainShapeId, number> = { rect: 35, round: 25, shield: 27.5 }

const ROUND_R = 25
/** Donde el ojal corta el círculo del redondo. */
const ROUND_TAB_Y = Math.sqrt(ROUND_R ** 2 - KEYCHAIN.tabHalfMm ** 2)

/** Punto más alto de cada pieza (mm): el agujero del ojal va `tabRiseMm` más arriba. */
const PIECE_TOP_MM: Record<KeychainShapeId, number> = { rect: 35, round: ROUND_R, shield: 27.5 }

/**
 * Ojal: sale de (tabHalf, desde) hacia arriba, cierra en semicírculo alrededor del agujero y baja
 * hasta (-tabHalf, desde). Con `tab` en falso, sigue derecho por el borde de arriba.
 */
function topEdge(s: THREE.Shape, fromY: number, holeY: number, tab: boolean) {
  const w = KEYCHAIN.tabHalfMm
  if (tab) {
    s.lineTo(w, holeY)
    s.absarc(0, holeY, w, 0, Math.PI, false)
  }
  s.lineTo(-w, fromY)
}

/** Rectángulo de 35 × 70 mm con esquinas de 5 mm. */
function rect(tab: boolean) {
  const [w, h, r] = [17.5, 35, 5]
  const s = new THREE.Shape()
  s.moveTo(-w + r, -h)
  s.lineTo(w - r, -h)
  s.quadraticCurveTo(w, -h, w, -h + r)
  s.lineTo(w, h - r)
  s.quadraticCurveTo(w, h, w - r, h)
  s.lineTo(KEYCHAIN.tabHalfMm, h)
  topEdge(s, h, h + KEYCHAIN.tabRiseMm, tab)
  s.lineTo(-w + r, h)
  s.quadraticCurveTo(-w, h, -w, h - r)
  s.lineTo(-w, -h + r)
  s.quadraticCurveTo(-w, -h, -w + r, -h)
  return s
}

/** Círculo de Ø 50 mm. */
function round(tab: boolean) {
  const s = new THREE.Shape()
  if (!tab) return s.absarc(0, 0, ROUND_R, 0, Math.PI * 2, false)
  const a = Math.atan2(ROUND_TAB_Y, KEYCHAIN.tabHalfMm)
  s.moveTo(-KEYCHAIN.tabHalfMm, ROUND_TAB_Y)
  s.absarc(0, 0, ROUND_R, Math.PI - a, Math.PI * 2 + a, false)
  topEdge(s, ROUND_TAB_Y, ROUND_R + KEYCHAIN.tabRiseMm, true)
  return s
}

/** Escudo de 45 × 55 mm: arriba recto, costados rectos y abajo en punta. Esquinas de 6 mm: con menos que la costura (4 mm), la costura se pliega. */
function shield(tab: boolean) {
  const [w, top, bottom, r] = [22.5, 27.5, -27.5, 6]
  const s = new THREE.Shape()
  s.moveTo(0, bottom)
  s.quadraticCurveTo(w, -20, w, -5)
  s.lineTo(w, top - r)
  s.quadraticCurveTo(w, top, w - r, top)
  s.lineTo(KEYCHAIN.tabHalfMm, top)
  topEdge(s, top, top + KEYCHAIN.tabRiseMm, tab)
  s.lineTo(-w + r, top)
  s.quadraticCurveTo(-w, top, -w, top - r)
  s.lineTo(-w, -5)
  s.quadraticCurveTo(-w, -20, 0, bottom)
  return s
}

const BUILDERS: Record<KeychainShapeId, (tab: boolean) => THREE.Shape> = { rect, round, shield }

function shapeId(id: string | undefined): KeychainShapeId {
  return id && id in BUILDERS ? (id as KeychainShapeId) : 'rect'
}

/** Centro del agujero del ojal (mm, desde el centro de la pieza). */
export function keychainHoleY(id: string | undefined): number {
  return PIECE_TOP_MM[shapeId(id)] + KEYCHAIN.tabRiseMm
}

/** Silueta en mm, con el ojal (y su agujero) o sólo la pieza. */
export function keychainShape(id: string | undefined, { tab = true } = {}): THREE.Shape {
  const s = BUILDERS[shapeId(id)](tab)
  if (tab) s.holes.push(new THREE.Path().absarc(0, keychainHoleY(id), KEYCHAIN.holeRMm, 0, Math.PI * 2, true))
  return s
}

/** Contorno en unidades de escena: con el ojal para el selector «Forma», sin él para la costura y los tests. */
export function keychainOutline(id: string | undefined, { tab = true, divisions = 24 } = {}): THREE.Vector2[] {
  return keychainShape(id, { tab })
    .getPoints(divisions)
    .map((p) => p.multiplyScalar(MM))
}

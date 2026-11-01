import * as THREE from 'three'
import type { SurfaceDef, WrapDef } from '../model/types'

/**
 * Ángulo (radianes, plano XY local, en (−π, π]) del punto de la tira que está a x mm de su centro.
 * Visto desde afuera, avanzar hacia la derecha en la tira es girar en sentido antihorario.
 */
export function wrapAngle(wrap: WrapDef, xMm: number): number {
  const a = wrap.centerAngle + xMm / wrap.radiusMm
  return a - 2 * Math.PI * Math.ceil((a - Math.PI) / (2 * Math.PI))
}

/**
 * Posición y orientación de la zona en el mundo. Las mallas de cada producto no tienen
 * transformación propia, así que su matrixWorld es la del producto completo.
 */
export function surfaceFrame(mesh: THREE.Object3D, surface: SurfaceDef, spin = 0) {
  const world = mesh.matrixWorld
  // En una tira, `spin` gira el marco de la zona sobre el eje del producto (Z local).
  const spinQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), spin)
  const position = new THREE.Vector3(...surface.position).applyQuaternion(spinQ).applyMatrix4(world)
  const parentQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(world))
  const localQ = spinQ.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...surface.orientation)))
  const quaternion = parentQ.multiply(localQ)
  return { position, quaternion }
}

/**
 * Cámara para la vista de zona: el offset está expresado en el marco local de la zona. En una
 * tira, la cámara gira alrededor del producto hasta el punto que está a `focusXMm` del centro.
 */
export function zoneCamera(mesh: THREE.Object3D, surface: SurfaceDef, focusXMm = 0) {
  const spin = surface.wrap ? wrapAngle(surface.wrap, focusXMm) - surface.wrap.centerAngle : 0
  const { position, quaternion } = surfaceFrame(mesh, surface, spin)
  const eye = new THREE.Vector3(...surface.cameraOffset).applyQuaternion(quaternion).add(position)
  return { eye, target: position }
}

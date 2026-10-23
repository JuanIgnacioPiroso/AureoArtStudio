import * as THREE from 'three'
import type { SurfaceDef } from '../model/types'

/**
 * Posición y orientación de la zona en el mundo. Las mallas de cada producto no tienen
 * transformación propia, así que su matrixWorld es la del producto completo.
 */
export function surfaceFrame(mesh: THREE.Object3D, surface: SurfaceDef) {
  const world = mesh.matrixWorld
  const position = new THREE.Vector3(...surface.position).applyMatrix4(world)
  const parentQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(world))
  const localQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(...surface.orientation))
  const quaternion = parentQ.multiply(localQ)
  return { position, quaternion }
}

/** Cámara para la vista de zona: el offset está expresado en el marco local de la zona. */
export function zoneCamera(mesh: THREE.Object3D, surface: SurfaceDef) {
  const { position, quaternion } = surfaceFrame(mesh, surface)
  const eye = new THREE.Vector3(...surface.cameraOffset).applyQuaternion(quaternion).add(position)
  return { eye, target: position }
}

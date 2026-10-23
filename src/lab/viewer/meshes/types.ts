import type * as THREE from 'three'
import type { MaterialDef } from '../../model/types'

export interface ProductMeshProps {
  materialFor: (partId: string) => MaterialDef
  /** Registra la malla de una parte para proyectar el grabado sobre ella. */
  registerPart: (partId: string, mesh: THREE.Mesh | null) => void
}

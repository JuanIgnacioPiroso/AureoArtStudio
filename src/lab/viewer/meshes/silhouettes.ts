import type * as THREE from 'three'
import type { ProductDef } from '../../model/types'
import { glasswareSilhouette } from './glasswareProfiles'
import { keychainOutline } from './keychainShapes'
import { trophyShape } from './trophyShapes'

/**
 * Silueta (contorno 2D en unidades de escena, y hacia arriba) de cada forma, por modelo. La usa
 * el selector «Forma». Un producto con formas tiene que sumar acá las suyas.
 */
export const SILHOUETTES: Partial<Record<ProductDef['modelId'], (shapeId: string) => THREE.Vector2[]>> = {
  'trophy-v1': (id) => trophyShape(id).getPoints(24),
  'glassware-v1': glasswareSilhouette,
  'leather-keychain-v1': (id) => keychainOutline(id),
}

import { useId } from 'react'
import type * as THREE from 'three'
import { getProduct, getShape } from '../model/catalog'
import { useLab } from '../store'
import { SILHOUETTES } from '../viewer/meshes/silhouettes'

const PAD = 0.08

/** Path SVG (y hacia abajo) y viewBox de una silueta, encuadrada con un margen. */
function silhouetteSvg(points: THREE.Vector2[]) {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const d = `${points.map((p, i) => `${i ? 'L' : 'M'}${(p.x - minX).toFixed(3)} ${(maxY - p.y).toFixed(3)}`).join(' ')} Z`
  return { d, viewBox: `${-PAD} ${-PAD} ${maxX - minX + PAD * 2} ${maxY - minY + PAD * 2}` }
}

/** Muestras con la silueta de cada forma, con el nombre de la elegida al lado. Sólo en productos con formas. */
export function ShapeSelector() {
  const design = useLab((s) => s.design)
  const setShape = useLab((s) => s.setShape)
  const product = getProduct(design.productId)
  const current = getShape(product, design.shapeId)
  const name = useId()
  const silhouette = SILHOUETTES[product.modelId]
  if (!product.shapes || !current || !silhouette) return null

  return (
    <fieldset className="material-swatches shape-swatches">
      <legend className="visually-hidden">Forma</legend>
      {product.shapes.map((shape) => {
        const svg = silhouetteSvg(silhouette(shape.id))
        return (
          <label key={shape.id} className="material-swatches__option shape-swatches__option" title={shape.name}>
            <input
              type="radio"
              name={name}
              value={shape.id}
              checked={current.id === shape.id}
              aria-label={shape.name}
              onChange={() => setShape(shape.id)}
            />
            <svg className="shape-swatches__chip" viewBox={svg.viewBox} aria-hidden="true">
              <path d={svg.d} />
            </svg>
          </label>
        )
      })}
      <span className="material-swatches__name" aria-hidden="true">
        {current.name}
      </span>
    </fieldset>
  )
}

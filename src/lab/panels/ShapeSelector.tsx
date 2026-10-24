import { useId } from 'react'
import { getProduct, getShape } from '../model/catalog'
import { useLab } from '../store'
import { TROPHY_PLATE, trophyShape } from '../viewer/meshes/trophyShapes'

/** Silueta de la forma como path SVG (y hacia abajo), en las unidades de la escena. */
function silhouettePath(shapeId: string): string {
  const pts = trophyShape(shapeId).getPoints(24)
  return `${pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(3)} ${(TROPHY_PLATE.height - p.y).toFixed(3)}`).join(' ')} Z`
}

/** Muestras con la silueta de cada forma, con el nombre de la elegida al lado. Sólo en productos con formas. */
export function ShapeSelector() {
  const design = useLab((s) => s.design)
  const setShape = useLab((s) => s.setShape)
  const product = getProduct(design.productId)
  const current = getShape(product, design.shapeId)
  const name = useId()
  if (!product.shapes || !current) return null

  const pad = 0.08
  const viewBox = `${-TROPHY_PLATE.width / 2 - pad} ${-pad} ${TROPHY_PLATE.width + pad * 2} ${TROPHY_PLATE.height + pad * 2}`
  return (
    <fieldset className="material-swatches shape-swatches">
      <legend className="visually-hidden">Forma</legend>
      {product.shapes.map((shape) => (
        <label key={shape.id} className="material-swatches__option shape-swatches__option" title={shape.name}>
          <input
            type="radio"
            name={name}
            value={shape.id}
            checked={current.id === shape.id}
            aria-label={shape.name}
            onChange={() => setShape(shape.id)}
          />
          <svg className="shape-swatches__chip" viewBox={viewBox} aria-hidden="true">
            <path d={silhouettePath(shape.id)} />
          </svg>
        </label>
      ))}
      <span className="material-swatches__name" aria-hidden="true">
        {current.name}
      </span>
    </fieldset>
  )
}

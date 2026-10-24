import { MaterialSelector } from './MaterialSelector'
import { ProductPicker } from './ProductPicker'
import { ShapeSelector } from './ShapeSelector'

/** Barra compacta con el objeto, el material y, si el objeto tiene formas, la forma; arriba del editor. */
export function ObjectBar() {
  return (
    <div className="object-bar" role="group" aria-label="Objeto y material">
      <ProductPicker />
      <MaterialSelector />
      <ShapeSelector />
    </div>
  )
}

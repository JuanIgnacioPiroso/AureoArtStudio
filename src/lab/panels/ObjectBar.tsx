import { MaterialSelector } from './MaterialSelector'
import { ProductPicker } from './ProductPicker'

/** Barra compacta con el objeto y el material, arriba del editor. */
export function ObjectBar() {
  return (
    <div className="object-bar" role="group" aria-label="Objeto y material">
      <ProductPicker />
      <MaterialSelector />
    </div>
  )
}

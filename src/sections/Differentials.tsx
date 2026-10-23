import { DIFFERENTIALS, IMAGES } from '../content/site'
import { Picture } from '../components/Picture'

/** Diferenciales y detalle de oficio (reemplaza a testimonios mientras no haya reales). */
export function Differentials() {
  return (
    <section className="section tone craft" data-tone="dark" aria-labelledby="craft-title">
      <div className="wrap craft__grid">
        <Picture image={IMAGES.grain} sizes="(min-width: 900px) 40vw, 100vw" className="craft__image" />
        <div className="craft__copy">
          <h2 id="craft-title" className="section-title">
            Cada material pide su grabado
          </h2>
          <p className="lede">
            En la madera, el láser tuesta la superficie y el texto toma un tono cálido que convive con la veta. En el
            acero, la marca es fina y de alto contraste. Por eso el simulador sólo ofrece los estilos que tienen sentido
            para cada zona.
          </p>
          <dl className="differentials">
            {DIFFERENTIALS.map((d) => (
              <div key={d.title} className="differentials__item">
                <dt className="display">{d.title}</dt>
                <dd>{d.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

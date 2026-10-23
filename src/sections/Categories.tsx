import { CATEGORIES } from '../content/site'
import { labProductHref } from '../lab/intent'
import { Picture } from '../components/Picture'

export function Categories() {
  const items = CATEGORIES.filter((c) => c.enabled)
  return (
    <section id="productos" className="section tone" data-tone="light" aria-labelledby="productos-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="productos-title" className="section-title">
            Qué personalizamos
          </h2>
          <p className="lede">Objetos para regalar, para usar todos los días o para representar a tu marca.</p>
        </div>
        <ul className="categories">
          {items.map((c, i) => (
            <li key={c.id} className={`category${i === 0 ? ' category--lead' : ''}`}>
              <Picture image={c.image} sizes={i === 0 ? '(min-width: 900px) 60vw, 100vw' : '(min-width: 900px) 30vw, 100vw'} />
              <div className="category__text">
                <h3 className="category__name display">{c.name}</h3>
                <p>{c.description}</p>
                {c.labProductId ? (
                  <a className="text-link" href={labProductHref(c.labProductId)}>
                    Diseñarlo en el <span translate="no">Custom Lab</span>
                  </a>
                ) : (
                  <a className="text-link" href="#contacto">
                    Consultar por este producto
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

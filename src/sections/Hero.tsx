/**
 * Hero: titular editorial y una vista real del Custom Lab. La línea dorada se "traza" una vez
 * sobre el grabado, como el paso del láser: es el único movimiento automático de la página.
 */
export function Hero() {
  return (
    <section id="inicio" className="hero tone" data-tone="dark" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title display">
            Objetos únicos.
            <br />
            Diseños que dejan huella.
          </h1>
          <p className="lede">
            Personalizamos tus objetos con precisión y diseño. Creá tu grabado y visualizá cómo podría quedar antes de
            pedir tu presupuesto.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#custom-lab">
              Crear mi grabado
            </a>
            <a className="button" href="#galeria">
              Explorar trabajos
            </a>
          </div>
        </div>
        <figure className="hero__figure">
          <div className="hero__media">
            <img
              src="/img/hero-lab.webp"
              width={1600}
              height={1000}
              alt="Cuchillo con mango de madera oscura y el nombre «Martín» grabado en la hoja, en la vista 3D del Custom Lab"
              fetchPriority="high"
            />
            <svg className="hero__trace" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <path className="hero__trace-line" d="M 990 530 L 1150 770 L 1480 770" />
              <circle className="hero__trace-dot" cx="990" cy="530" r="7" />
            </svg>
          </div>
          <figcaption className="hero__caption">
            <span className="hero__caption-text">«Martín», grabado en la hoja.</span>
            <span className="note">Vista del Custom Lab, el simulador 3D de esta página.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

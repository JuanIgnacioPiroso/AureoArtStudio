import { PROCESS } from '../content/site'

export function Process() {
  return (
    <section id="proceso" className="section tone" data-tone="light" aria-labelledby="proceso-title">
      <div className="wrap process">
        <div className="section-head">
          <h2 id="proceso-title" className="section-title">
            Cómo trabajamos
          </h2>
          <p className="lede">De la idea a la pieza grabada, en cinco pasos y con revisión antes de producir.</p>
        </div>
        <ol className="process__steps">
          {PROCESS.map((p, i) => (
            <li key={p.title} className="process__step">
              <span className="process__n display" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="process__title">{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

import { FAQ } from '../content/site'

export function Faq() {
  const answered = FAQ.filter((f) => f.a)
  return (
    <section id="preguntas" className="section tone" data-tone="light" aria-labelledby="faq-title">
      <div className="wrap faq">
        <h2 id="faq-title" className="section-title">
          Preguntas frecuentes
        </h2>
        <div className="faq__list">
          {answered.map((f) => (
            <details key={f.q} className="faq__item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

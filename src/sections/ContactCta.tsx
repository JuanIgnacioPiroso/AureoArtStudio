import { LAB_PATH } from '../lab/intent'
import { business } from '../config/business'
import { ContactLinks } from '../components/ContactLinks'

export function ContactCta() {
  const wa = business.whatsapp
    ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Hola, ${business.name}. Quiero hacer una consulta.`)}`
    : null
  return (
    <section id="contacto" className="section tone closing" data-tone="dark" aria-labelledby="contacto-title">
      <div className="wrap closing__grid">
        <h2 id="contacto-title" className="closing__title display">
          Tu próxima idea empieza acá.
        </h2>
        <div className="closing__side">
          <div className="closing__actions">
            <a className="button button--primary" href={LAB_PATH}>
              Diseñar mi grabado
            </a>
            {wa && (
              <a className="button" href={wa} target="_blank" rel="noopener noreferrer">
                Consultar por WhatsApp
                <span className="visually-hidden"> (se abre en otra pestaña)</span>
              </a>
            )}
          </div>
          <ContactLinks
            fallback={
              <p className="note">
                Diseñá tu pieza en el Custom Lab y, al final, copiá o descargá el resumen para pedir tu presupuesto.
              </p>
            }
          />
        </div>
      </div>
    </section>
  )
}

import manifest from '../../content/image-credits.json'
import { business } from '../../config/business'
import { CATEGORIES, NAV } from '../../content/site'
import { Logo } from '../brand/Logo'
import { ContactLinks } from '../ContactLinks'
import { LabProductLink } from '../LabProductLink'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer tone" data-tone="dark">
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <Logo />
          <p className="note">
            Estudio de grabado y personalización. Diseñamos cada pieza para una persona y una ocasión.
          </p>
        </div>
        <nav aria-label="Secciones">
          <h2 className="site-footer__h">Secciones</h2>
          <ul>
            {NAV.slice(1).map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Categorías">
          <h2 className="site-footer__h">Categorías</h2>
          <ul>
            {CATEGORIES.filter((c) => c.enabled).map((c) => (
              <li key={c.id}>
                {c.labProductId ? (
                  <LabProductLink productId={c.labProductId}>{c.name}</LabProductLink>
                ) : (
                  <a href="#productos">{c.name}</a>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="site-footer__h">Contacto</h2>
          <ContactLinks fallback={<p className="note">Escribinos desde el resumen de tu diseño en el Custom Lab.</p>} />
        </div>
      </div>
      <div className="wrap site-footer__legal">
        <p className="note">
          © {year} {business.legalName ?? business.name}
        </p>
        <details className="credits">
          <summary className="note">Créditos de imágenes</summary>
          <ul className="note">
            {manifest.map((m) => (
              <li key={m.id}>
                «{m.title}», de {m.author || 'autor desconocido'} (
                <a href={m.source} target="_blank" rel="noopener noreferrer">
                  Wikimedia Commons
                  <span className="visually-hidden"> (se abre en otra pestaña)</span>
                </a>
                ), licencia{' '}
                {m.licenseUrl ? (
                  <a href={m.licenseUrl} target="_blank" rel="noopener noreferrer">
                    {m.license}
                    <span className="visually-hidden"> (se abre en otra pestaña)</span>
                  </a>
                ) : (
                  m.license
                )}
                . Imagen ilustrativa.
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  )
}

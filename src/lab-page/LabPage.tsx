import { lazy, Suspense } from 'react'
import { DevConfigNotice } from '../components/DevConfigNotice'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'

const CustomLab = lazy(() => import('../lab/CustomLab'))

/** Página propia del Custom Lab (/custom-lab/). El simulador se carga diferido para pintar antes el header. */
export function LabPage() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header page="lab" />
      <main id="contenido" className="lab-page">
        <section id="custom-lab" className="lab-page__section tone" data-tone="dark" aria-labelledby="lab-title">
          <div className="lab-page__head">
            <p className="lab-section__name" translate="no">
              AUREO Custom Lab
            </p>
            <h1 id="lab-title" className="lab-page__title">
              Tu idea, antes de grabarla.
            </h1>
          </div>
          <Suspense
            fallback={
              <div className="lab-placeholder" role="status">
                Cargando el Custom Lab…
              </div>
            }
          >
            <CustomLab />
          </Suspense>
        </section>
      </main>
      <Footer />
      <DevConfigNotice />
    </>
  )
}

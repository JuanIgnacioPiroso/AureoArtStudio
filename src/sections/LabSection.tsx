import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { PRODUCT_PARAM } from '../lab/intent'

const CustomLab = lazy(() => import('../lab/CustomLab'))

/**
 * Sección protagonista. El simulador (three.js incluido) se descarga recién cuando la
 * sección se acerca al viewport, para no penalizar la carga de la landing.
 */
export function LabSection() {
  const ref = useRef<HTMLElement>(null)
  const [mount, setMount] = useState(() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.has('d') || params.has(PRODUCT_PARAM)
  })

  useEffect(() => {
    if (mount) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setMount(true), { rootMargin: '600px 0px' })
    io.observe(el)
    const onHash = () => location.hash === '#custom-lab' && setMount(true)
    window.addEventListener('hashchange', onHash)
    onHash()
    return () => {
      io.disconnect()
      window.removeEventListener('hashchange', onHash)
    }
  }, [mount])

  useEffect(() => {
    // scrollIntoView sin opciones respeta el scroll-behavior del CSS (y por lo tanto reduced-motion).
    if (mount && location.hash === '#custom-lab' && location.search) ref.current?.scrollIntoView()
  }, [mount])

  return (
    <section id="custom-lab" ref={ref} className="section lab-section tone" data-tone="dark" aria-labelledby="lab-title">
      <div className="wrap">
        <div className="section-head section-head--lab">
          <p className="lab-section__name" translate="no">
            AUREO Custom Lab
          </p>
          <h2 id="lab-title" className="section-title">
            Tu idea, antes de grabarla.
          </h2>
          <p className="lede">Elegí un objeto, diseñá tu grabado y explorá una vista previa interactiva de tu creación.</p>
        </div>
        {mount ? (
          <Suspense
            fallback={
              <div className="lab-placeholder" role="status">
                Cargando el Custom Lab…
              </div>
            }
          >
            <CustomLab />
          </Suspense>
        ) : (
          <div className="lab-placeholder" aria-hidden="true" />
        )}
      </div>
    </section>
  )
}

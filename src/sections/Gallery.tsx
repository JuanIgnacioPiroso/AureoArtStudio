import { useEffect, useId, useRef, useState } from 'react'
import { WORK_CATEGORIES, WORKS, type Work } from '../content/works'

type FilterId = (typeof WORK_CATEGORIES)[number]['id']

const CAT_PARAM = 'cat'
const WORK_PARAM = 'obra'

function readParam(name: string): string | null {
  return typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(name)
}

/** Refleja filtro y obra abierta en la URL (sin sumar entradas al historial ni tocar el hash). */
function writeParam(name: string, value: string | null) {
  const url = new URL(window.location.href)
  if (value) url.searchParams.set(name, value)
  else url.searchParams.delete(name)
  history.replaceState(history.state, '', url)
}

export function Gallery() {
  const [filter, setFilterState] = useState<FilterId>(() => {
    const cat = readParam(CAT_PARAM)
    return WORK_CATEGORIES.find((c) => c.id === cat)?.id ?? 'todos'
  })
  const [active, setActiveState] = useState<Work | null>(() => WORKS.find((w) => w.id === readParam(WORK_PARAM)) ?? null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const items = WORKS.filter((w) => filter === 'todos' || w.category === filter)
  const anyIllustrative = WORKS.some((w) => w.image.illustrative)

  function setFilter(id: FilterId) {
    setFilterState(id)
    writeParam(CAT_PARAM, id === 'todos' ? null : id)
  }

  function setActive(w: Work | null) {
    setActiveState(w)
    writeParam(WORK_PARAM, w?.id ?? null)
  }

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (active && !d.open) d.showModal()
    if (!active && d.open) d.close()
  }, [active])

  return (
    <section id="galeria" className="section tone" data-tone="dark" aria-labelledby="galeria-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="galeria-title" className="section-title">
            Trabajos y referencias
          </h2>
          {anyIllustrative && (
            <p className="lede">
              Estamos sumando fotos de trabajos propios. Mientras tanto, estas imágenes son ilustrativas: muestran el tipo
              de pieza y de grabado, no encargos realizados por el estudio.
            </p>
          )}
        </div>

        <div className="filters" role="group" aria-label="Filtrar por categoría">
          {WORK_CATEGORIES.filter((c) => c.id === 'todos' || WORKS.some((w) => w.category === c.id)).map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        <p className="visually-hidden" role="status">
          {items.length === 1 ? '1 trabajo' : `${items.length} trabajos`}
        </p>
        <ul className="works">
          {items.map((w) => (
            <li key={w.id} className="work">
              <button type="button" className="work__button" onClick={() => setActive(w)} aria-label={`Ver ${w.title} en grande`}>
                <img
                  src={w.image.srcSmall}
                  width={w.image.width}
                  height={w.image.height}
                  alt={w.image.alt}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <div className="work__meta">
                <h3 className="work__title">{w.title}</h3>
                <p className="note">
                  {w.material}. {w.detail}
                  {w.image.illustrative && ' Imagen ilustrativa.'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        className="lightbox"
        onClose={() => setActive(null)}
        // Clic en el fondo (fuera del contenido) cierra, como en cualquier visor de imágenes.
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        aria-labelledby={titleId}
      >
        {active && (
          <figure>
            <img
              src={active.image.src}
              width={active.image.width}
              height={active.image.height}
              alt={active.image.alt}
              decoding="async"
            />
            <figcaption>
              <strong id={titleId}>{active.title}</strong> {active.material}. {active.detail}
              {active.image.illustrative && ' Imagen ilustrativa.'}
            </figcaption>
          </figure>
        )}
        <form method="dialog">
          <button className="button lightbox__close" type="submit">
            Cerrar
          </button>
        </form>
      </dialog>
    </section>
  )
}

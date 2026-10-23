import { useEffect, useRef, useState } from 'react'
import { NAV } from '../../content/site'
import { Logo } from '../brand/Logo'

/**
 * Header fijo. Toma el tono (claro/oscuro) de la sección que tiene debajo,
 * para mantener el contraste en toda la página.
 */
export function Header() {
  const [tone, setTone] = useState<'dark' | 'light'>('dark')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-tone]'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setTone((e.target as HTMLElement).dataset.tone === 'light' ? 'light' : 'dark')
        }
      },
      { rootMargin: '0px 0px -96% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Menú móvil: Esc cierra, el foco queda dentro del panel y vuelve al botón al cerrar.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>('a, button') ?? [])
    focusables()[0]?.focus()
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
      if (e.key === 'Tab') {
        const els = [toggleRef.current!, ...focusables()]
        const first = els[0]!
        const last = els[els.length - 1]!
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      document.documentElement.style.overscrollBehavior = ''
    }
  }, [open])

  return (
    <header
      className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}
      data-tone={open ? 'dark' : tone === 'light' ? 'light' : undefined}
    >
      <div className="site-header__inner wrap">
        <a href="#inicio" className="site-header__brand" aria-label="AUREO Art Studio, ir al inicio">
          <Logo />
        </a>
        <nav className="site-nav" aria-label="Principal">
          <ul>
            {NAV.slice(1).map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#custom-lab" className="button button--primary site-header__cta">
          Personalizá tu producto
        </a>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="menu-toggle__bars" aria-hidden="true" />
          <span className="visually-hidden">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>
      </div>
      <div id="mobile-menu" ref={panelRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Principal (móvil)">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={() => setOpen(false)}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#custom-lab" className="button button--primary" onClick={() => setOpen(false)}>
          Personalizá tu producto
        </a>
      </div>
    </header>
  )
}

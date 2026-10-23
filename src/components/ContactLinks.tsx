import type { ReactNode } from 'react'
import { business } from '../config/business'

/** Sólo muestra los canales configurados en src/config/business.ts. */
export function ContactLinks({ fallback }: { fallback?: ReactNode }) {
  const items: { label: string; href: string | null; text: string }[] = [
    { label: 'WhatsApp', href: business.whatsapp ? `https://wa.me/${business.whatsapp}` : null, text: business.whatsapp ? `+${business.whatsapp}` : '' },
    { label: 'Email', href: business.email ? `mailto:${business.email}` : null, text: business.email ?? '' },
    { label: 'Instagram', href: business.instagram, text: business.instagram?.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '') ?? '' },
    { label: 'Facebook', href: business.facebook, text: 'Facebook' },
  ].filter((i) => i.href)

  if (!items.length && !business.address && !business.city) return <>{fallback}</>
  return (
    <ul className="contact-links">
      {items.map((i) => (
        <li key={i.label}>
          <span className="contact-links__label">{i.label}</span>
          <a href={i.href!} target={i.href!.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" translate="no">
            {i.text}
            {i.href!.startsWith('http') && <span className="visually-hidden"> (se abre en otra pestaña)</span>}
          </a>
        </li>
      ))}
      {(business.address || business.city) && (
        <li>
          <span className="contact-links__label">Taller</span>
          <span>{[business.address, business.city].filter(Boolean).join(', ')}</span>
        </li>
      )}
    </ul>
  )
}

import type { ReactNode } from 'react'
import { labProductHref, requestLabProduct } from '../lab/intent'

/**
 * Enlace que abre el Custom Lab con un producto elegido. El href lleva el producto en la URL
 * (sirve para Cmd/Ctrl+clic y para compartir); el clic simple lo aplica sin recargar la página.
 */
export function LabProductLink({ productId, className, children }: { productId: string; className?: string; children: ReactNode }) {
  const href = labProductHref(productId)
  return (
    <a
      className={className}
      href={href}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        history.pushState(null, '', href)
        requestLabProduct(productId)
        document.getElementById('custom-lab')?.scrollIntoView()
      }}
    >
      {children}
    </a>
  )
}

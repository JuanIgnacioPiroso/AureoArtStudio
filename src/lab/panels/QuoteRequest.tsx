import { useId, useState } from 'react'
import { business } from '../../config/business'
import { getAssetBlob } from '../assets/assetStore'
import { getProduct, getSurface } from '../model/catalog'
import { elementHasContent, textElement } from '../model/elements'
import { measureTextMm } from '../model/measure'
import { designId, designUrl } from '../model/serialize'
import { renderArtwork, useRenderRevision } from '../render/preview'
import { buildQuoteMessage, downloadFile, downloadText, hasLogos, mailtoLink, summaryRows, whatsappLink } from '../services/quote'
import { useLab } from '../store'
import { PRIMARY_TEXT_ID } from '../ids'

/** Abre el paso 3, elige (o crea) una capa de texto y lleva el foco a su contenido. */
function focusPrimaryText() {
  const s = useLab.getState()
  const text = s.design.elements.find((e) => e.kind === 'text')
  if (text) s.select([text.id])
  else s.addElement(textElement({ text: '' }))
  // Elegir la capa abre la pestaña «Capa»: el campo se puede enfocar cuando se vuelve a dibujar.
  window.setTimeout(() => document.getElementById(PRIMARY_TEXT_ID)?.focus(), 0)
}

/** Resumen del diseño + acciones para pedir presupuesto por los canales reales del negocio. */
export function QuoteRequest() {
  const design = useLab((s) => s.design)
  const setNotes = useLab((s) => s.setNotes)
  const capture = useLab((s) => s.capture)
  const [feedback, setFeedback] = useState('')
  const notesId = useId()

  const pageUrl = typeof window !== 'undefined' ? window.location.href : business.siteUrl ?? 'https://example.invalid'
  useRenderRevision()
  const rows = summaryRows(design, measureTextMm)
  const message = buildQuoteMessage(design, pageUrl, measureTextMm)
  const wa = whatsappLink(message)
  const mail = mailtoLink(message, design)
  const id = designId(design)
  const hasText = design.elements.some(elementHasContent)
  const logos = hasLogos(design)

  // Se vacía antes de escribir para que un mismo mensaje repetido vuelva a anunciarse.
  function announce(text: string) {
    setFeedback('')
    window.setTimeout(() => setFeedback(text), 60)
  }

  async function copy(text: string, done: string) {
    try {
      await navigator.clipboard.writeText(text)
      announce(done)
    } catch {
      announce('No pudimos copiar automáticamente. Usá «Descargar resumen e imagen» y adjuntá el archivo.')
    }
  }

  function downloadArtwork() {
    const surface = getSurface(getProduct(design.productId), design.surfaceId, design.shapeId)
    const png = renderArtwork(design, surface)
    if (!png) return announce('No pudimos generar el arte en este dispositivo.')
    downloadFile(`${id}-arte-${surface.widthMm}x${surface.heightMm}mm.png`, png)
    announce('Descargamos el arte del grabado, a escala real (20 px por mm).')
  }

  async function downloadLogos() {
    const ids = [...new Set(design.elements.flatMap((e) => (e.kind === 'image' ? [e.assetId] : [])))]
    let saved = 0
    for (const [i, assetId] of ids.entries()) {
      const blob = await getAssetBlob(assetId)
      if (!blob) continue
      const url = URL.createObjectURL(blob)
      downloadFile(`${id}-logo${ids.length > 1 ? `-${i + 1}` : ''}.png`, url)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      saved++
    }
    announce(
      saved === ids.length
        ? 'Descargamos el logo: adjuntalo en el mensaje.'
        : 'Algún logo no está en este dispositivo: subilo de nuevo en el paso 3.',
    )
  }

  function downloadAll() {
    downloadText(`${id}.txt`, message)
    const png = capture?.()
    if (png) downloadFile(`${id}.png`, png)
    announce(png ? 'Descargamos el resumen y la imagen del diseño.' : 'Descargamos el resumen. La imagen 3D no está disponible en este dispositivo.')
  }

  return (
    <div className="stack-m">
      <dl className="summary">
        {rows.map((r) => (
          <div key={r.label} className="summary__row">
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="field">
        <label className="field-label" htmlFor={notesId}>
          Notas para el taller (opcional)
        </label>
        <textarea
          id={notesId}
          name="notas"
          className="input input--area"
          rows={3}
          maxLength={500}
          value={design.notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Cantidad, fecha en la que lo necesitás, si es para regalo…"
        />
      </div>

      {!hasText && (
        <p className="note note--warn">
          Agregá algo para grabar (un texto, un logo o una forma) antes de pedir presupuesto.{' '}
          <button type="button" className="link-button" onClick={focusPrimaryText}>
            Escribir un texto
          </button>
        </p>
      )}

      {logos && (
        <p className="note note--warn">
          Tu diseño tiene un logo. El enlace y el mensaje no lo incluyen: descargalo y adjuntalo al enviar el pedido.
        </p>
      )}

      <div className="quote-actions">
        {/* Sin texto, los canales se muestran como botones deshabilitados: un <a> sin href no es enfocable ni anunciable. */}
        {wa &&
          (hasText ? (
            <a
              className="button button--primary"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => announce('Abrimos WhatsApp con tu pedido. Revisalo y envialo desde ahí.')}
            >
              Solicitar presupuesto por WhatsApp
              <span className="visually-hidden"> (se abre en otra pestaña)</span>
            </a>
          ) : (
            <button type="button" className="button button--primary" disabled>
              Solicitar presupuesto por WhatsApp
            </button>
          ))}
        {mail &&
          (hasText ? (
            <a className="button button--ghost" href={mail}>
              Solicitar presupuesto por email
            </a>
          ) : (
            <button type="button" className="button button--ghost" disabled>
              Solicitar presupuesto por email
            </button>
          ))}
        <button type="button" className={wa || mail ? 'button button--ghost' : 'button button--primary'} onClick={() => copy(message, 'Copiamos el resumen. Pegalo en tu mensaje.')} disabled={!hasText}>
          Copiar resumen
        </button>
        <button type="button" className="button button--ghost" onClick={downloadAll} disabled={!hasText}>
          Descargar resumen e imagen
        </button>
        {logos && (
          <button type="button" className="button button--ghost" onClick={() => void downloadLogos()}>
            Descargar logo
          </button>
        )}
        <button type="button" className="button button--ghost" onClick={downloadArtwork} disabled={!hasText}>
          Descargar arte para el taller
        </button>
        <button type="button" className="link-button" onClick={() => copy(designUrl(design, pageUrl), 'Copiamos el enlace: abre este mismo diseño.')}>
          Copiar enlace del diseño
        </button>
      </div>

      <p className="note">
        {wa || mail
          ? 'Si querés sumar la imagen, descargala y adjuntala en el mensaje. El presupuesto se confirma cuando el taller te responde.'
          : 'Copiá o descargá el resumen para enviarlo por el canal de contacto que prefieras.'}
      </p>
      <p className="note" role="status" aria-atomic="true">
        {feedback}
      </p>
    </div>
  )
}

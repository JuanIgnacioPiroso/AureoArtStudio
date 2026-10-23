import { useId, useMemo, useState } from 'react'
import { assetStatus } from '../assets/assetStore'
import { getProduct, getSurface } from '../model/catalog'
import { checkDesign, minDetailMm } from '../model/constraints'
import { elementLabel, SHAPE_LABEL } from '../model/elements'
import { measureTextMm } from '../model/measure'
import { ALIGNS, MAX_TEXT_LENGTH, SHAPES, type Align, type DesignElement, type ImageElement, type ShapeElement, type ShapeKind, type SurfaceDef, type TextElement } from '../model/types'
import { ChoiceGroup, Slider } from '../panels/controls'
import { useRenderRevision } from '../render/preview'
import { useLab, type ElementPatch } from '../store'
import { PRIMARY_TEXT_ID } from '../ids'
import { FontPicker } from './FontPicker'
import { NumberField } from './NumberField'
import { useLogoPicker } from './logoPicker'

const NBSP = ' '
const mm = (v: number) => `${v.toLocaleString('es-AR', { maximumFractionDigits: 1 })}${NBSP}mm`
const pct = (v: number) => `${Math.round(v * 100)}${NBSP}%`
const ALIGN_LABEL: Record<Align, string> = { left: 'Izquierda', center: 'Centro', right: 'Derecha' }

type Update = (patch: ElementPatch, coalesce?: string) => void

function TextProps({ el, surface, update }: { el: TextElement; surface: SurfaceDef; update: Update }) {
  const multiline = el.text.includes('\n')
  const minText = minDetailMm(surface)
  const maxSize = Math.max(surface.sizeRange[1] * 1.5, surface.heightMm)
  return (
    <>
      <div className="field">
        <label className="field-label" htmlFor={PRIMARY_TEXT_ID}>
          Texto
        </label>
        <textarea
          id={PRIMARY_TEXT_ID}
          name="texto"
          className="input input--area"
          rows={multiline ? 3 : 2}
          maxLength={MAX_TEXT_LENGTH}
          value={el.text}
          onChange={(e) => update({ text: e.target.value }, `text:${el.id}`)}
          placeholder="Ej.: Martín, M · A o Siempre juntos…"
          autoComplete="off"
        />
        <p className="note">Enter agrega otra línea.{el.arc ? ' En texto curvo las líneas se unen.' : ''}</p>
      </div>
      <FontPicker value={el.fontId} sample={el.text} onChange={(fontId) => update({ fontId })} />
      <div className="field">
        <Slider
          label="Tamaño (alto de mayúscula)"
          value={el.sizeMm}
          min={1}
          max={Math.max(maxSize, el.sizeMm)}
          step={0.5}
          onChange={(sizeMm) => update({ sizeMm }, `size:${el.id}`)}
          format={mm}
        />
        {el.sizeMm < minText && <p className="note note--warn">Por debajo de {mm(minText)} el grabado puede no leerse bien.</p>}
      </div>
      {multiline && !el.arc && (
        <ChoiceGroup<Align>
          legend="Alineación"
          variant="segmented"
          value={el.align}
          options={ALIGNS.map((al) => ({ value: al, label: ALIGN_LABEL[al] }))}
          onChange={(align) => update({ align })}
        />
      )}
      <Slider
        label="Espacio entre letras"
        value={el.letterSpacing}
        min={-0.2}
        max={1}
        step={0.01}
        onChange={(letterSpacing) => update({ letterSpacing }, `ls:${el.id}`)}
        format={pct}
      />
      {multiline && !el.arc && (
        <Slider
          label="Espacio entre líneas"
          value={el.lineHeight}
          min={1}
          max={3}
          step={0.05}
          onChange={(lineHeight) => update({ lineHeight }, `lh:${el.id}`)}
          format={(v) => `${v.toLocaleString('es-AR')}×`}
        />
      )}
      <Slider
        label="Curvatura"
        value={el.arc}
        min={-360}
        max={360}
        step={5}
        onChange={(arc) => update({ arc }, `arc:${el.id}`)}
        format={(v) => (v === 0 ? 'recto' : v > 0 ? `arco hacia arriba, ${v}°` : `arco hacia abajo, ${-v}°`)}
      />
    </>
  )
}

function ImageProps({ el, update, onReplace }: { el: ImageElement; update: Update; onReplace: () => void }) {
  const lockId = useId()
  const aspect = el.widthMm / el.heightMm
  const missing = assetStatus(el.assetId) === 'missing'
  return (
    <>
      {missing && (
        <p className="note note--warn">
          Este logo se subió en otro dispositivo o navegador y no está acá. Subilo de nuevo para verlo y grabarlo.
        </p>
      )}
      <button type="button" className="button button--ghost" onClick={onReplace}>
        {missing ? 'Subir el logo' : 'Reemplazar imagen'}
      </button>
      <Slider
        label="Umbral"
        value={el.threshold}
        min={0.05}
        max={0.95}
        step={0.01}
        onChange={(threshold) => update({ threshold }, `th:${el.id}`)}
        format={pct}
      />
      <p className="note">El grabado es de un solo tono: se marca lo que es más oscuro que el umbral.</p>
      <label className="check">
        <input type="checkbox" checked={el.invert} onChange={(e) => update({ invert: e.target.checked })} />
        Invertir (grabar las partes claras)
      </label>
      <div className="field-row">
        <NumberField label="Ancho" unit="mm" value={el.widthMm} min={1} onChange={(w) => update({ widthMm: w, heightMm: w / aspect }, `w:${el.id}`)} />
        <NumberField label="Alto" unit="mm" value={el.heightMm} min={1} onChange={(h) => update({ heightMm: h, widthMm: h * aspect }, `h:${el.id}`)} />
      </div>
      <p className="note" id={lockId}>
        Ancho y alto mantienen la proporción. En el lienzo, Shift + arrastrar una esquina la deforma.
      </p>
    </>
  )
}

function ShapeProps({ el, update }: { el: ShapeElement; update: Update }) {
  const line = el.shape === 'line'
  return (
    <>
      <ChoiceGroup<ShapeKind>
        legend="Forma"
        variant="segmented"
        value={el.shape}
        options={SHAPES.map((k) => ({ value: k, label: SHAPE_LABEL[k] }))}
        onChange={(shape) => update(shape === 'line' ? { shape, heightMm: el.strokeMm } : { shape })}
      />
      <div className="field-row">
        <NumberField label={line ? 'Largo' : 'Ancho'} unit="mm" value={el.widthMm} min={0.5} onChange={(widthMm) => update({ widthMm }, `w:${el.id}`)} />
        {!line && <NumberField label="Alto" unit="mm" value={el.heightMm} min={0.5} onChange={(heightMm) => update({ heightMm }, `h:${el.id}`)} />}
      </div>
      {!line && (
        <label className="check">
          <input type="checkbox" checked={el.fill} onChange={(e) => update({ fill: e.target.checked })} />
          Relleno
        </label>
      )}
      {(line || !el.fill) && (
        <Slider
          label={line ? 'Grosor' : 'Trazo'}
          value={el.strokeMm}
          min={0.2}
          max={Math.max(5, el.strokeMm)}
          step={0.1}
          onChange={(strokeMm) => update(line ? { strokeMm, heightMm: strokeMm } : { strokeMm }, `st:${el.id}`)}
          format={mm}
        />
      )}
      {el.shape === 'rect' && (
        <Slider
          label="Esquinas redondeadas"
          value={el.radiusMm}
          min={0}
          max={Math.max(0.5, Math.min(el.widthMm, el.heightMm) / 2)}
          step={0.5}
          onChange={(radiusMm) => update({ radiusMm }, `r:${el.id}`)}
          format={mm}
        />
      )}
    </>
  )
}

function CommonProps({ el, surface, update }: { el: DesignElement; surface: SurfaceDef; update: Update }) {
  const nameId = useId()
  return (
    <>
      <div className="field-row">
        <NumberField label="X" unit="mm" value={el.x} min={-surface.widthMm / 2} max={surface.widthMm / 2} onChange={(x) => update({ x }, `x:${el.id}`)} />
        <NumberField label="Y" unit="mm" value={el.y} min={-surface.heightMm / 2} max={surface.heightMm / 2} onChange={(y) => update({ y }, `y:${el.id}`)} />
      </div>
      <Slider
        label="Rotación"
        value={el.rotation}
        min={-180}
        max={180}
        step={1}
        onChange={(rotation) => update({ rotation }, `rot:${el.id}`)}
        format={(v) => `${v.toLocaleString('es-AR')}°`}
      />
      <div className="field">
        <label className="field-label" htmlFor={nameId}>
          Nombre de la capa (opcional)
        </label>
        <input
          id={nameId}
          className="input"
          type="text"
          maxLength={40}
          value={el.name}
          placeholder={elementLabel({ ...el, name: '' })}
          onChange={(e) => update({ name: e.target.value }, `name:${el.id}`)}
          autoComplete="off"
        />
      </div>
    </>
  )
}

/** Propiedades de la capa seleccionada. */
export function PropertiesPanel() {
  const design = useLab((s) => s.design)
  const selection = useLab((s) => s.selection)
  const revision = useRenderRevision()
  const a = useLab.getState()
  const [logoError, setLogoError] = useState('')
  const logo = useLogoPicker(setLogoError)
  const surface = getSurface(getProduct(design.productId), design.surfaceId)
  const warnings = useMemo(
    () => checkDesign(design, surface, measureTextMm),
    // revision: medir de nuevo cuando cargan las tipografías.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [design, surface, revision],
  )

  const selected = design.elements.filter((e) => selection.includes(e.id))
  const el = selected.length === 1 ? selected[0]! : null

  if (!el) {
    return (
      <div className="stack-s">
        <p className="note">
          {selected.length > 1
            ? `${selected.length} capas seleccionadas. Usá la barra del lienzo para alinearlas, distribuirlas o eliminarlas.`
            : 'Tocá una capa en el lienzo o en la lista para editarla. Shift + clic selecciona varias.'}
        </p>
        <ul className="warnings" aria-label="Avisos del diseño">
          {warnings.map((w, i) => (
            <li key={i} className="note note--warn">
              {w.message}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const update: Update = (patch, coalesce) => a.updateElement(el.id, patch, coalesce)
  const own = warnings.filter((w) => w.elementId === el.id && w.code !== 'too-small')

  return (
    <div className="stack-m properties" aria-label={`Propiedades de ${elementLabel(el)}`} role="group">
      {el.locked && (
        <p className="note">
          Capa bloqueada: no se mueve en el lienzo.{' '}
          <button type="button" className="link-button" onClick={() => update({ locked: false })}>
            Desbloquear
          </button>
        </p>
      )}
      {el.kind === 'text' && <TextProps el={el} surface={surface} update={update} />}
      {el.kind === 'image' && (
        <ImageProps
          el={el}
          update={update}
          onReplace={() => {
            setLogoError('')
            logo.open(el.id)
          }}
        />
      )}
      {logoError && (
        <p className="note note--warn" role="alert">
          {logoError}
        </p>
      )}
      {el.kind === 'shape' && <ShapeProps el={el} update={update} />}
      {logo.element}
      <CommonProps el={el} surface={surface} update={update} />
      {own.length > 0 && (
        <ul className="warnings" aria-label="Avisos de esta capa">
          {own.map((w, i) => (
            <li key={i} className="note note--warn">
              {w.message}
            </li>
          ))}
        </ul>
      )}
      <div className="properties__actions">
        <button type="button" className="link-button" onClick={() => a.duplicateElements([el.id])}>
          Duplicar
        </button>
        <button type="button" className="link-button" onClick={() => a.removeElements([el.id])}>
          Eliminar capa
        </button>
      </div>
    </div>
  )
}

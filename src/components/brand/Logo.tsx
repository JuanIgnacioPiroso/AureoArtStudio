/**
 * Isotipo: un rectángulo áureo (1 : 1,618) dibujado con líneas de barrido láser.
 * El cuadrado se raya en horizontal y el rectángulo menor en vertical, así la
 * subdivisión áurea se lee sin trazar la espiral. Monocromo (currentColor) y grabable.
 */
export function Isotype({ size = 28, title }: { size?: number; title?: string }) {
  const rows = [0, 3.07, 6.13, 9.2, 12.27, 15.33, 18.4]
  const cols = [21.2, 24.39, 27.57, 30.76]
  return (
    <svg
      width={size * 1.618}
      height={size}
      viewBox="0 0 32.36 20"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="currentColor"
    >
      {rows.map((y) => (
        <rect key={`h${y}`} x="0" y={y} width="20" height="1.6" />
      ))}
      {cols.map((x) => (
        <rect key={`v${x}`} x={x} y="0" width="1.6" height="20" />
      ))}
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`logo${compact ? ' logo--compact' : ''}`}>
      <Isotype size={compact ? 18 : 22} />
      <span className="logo__words" translate="no">
        <span className="logo__name">AUREO</span>
        <span className="logo__sub">Art Studio</span>
      </span>
    </span>
  )
}

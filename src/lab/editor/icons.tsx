/** Íconos de línea del editor (24 × 24, trazo de 1,6). Decorativos: el botón lleva su propio nombre. */
const PATHS = {
  text: 'M5 6V4.5h14V6M12 4.5v15M9 19.5h6',
  image: 'M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 18M15.5 9.5h.01',
  shape: 'M4 13h7v7H4zM17 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
  undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
  'eye-off': 'M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.1 6.1C3.4 7.9 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  unlock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 6.8-1.2',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Botón de ícono con nombre accesible y tooltip nativo. */
export function IconButton({
  icon,
  label,
  onClick,
  disabled,
  pressed,
  shortcut,
}: {
  icon: IconName
  label: string
  onClick: () => void
  disabled?: boolean
  pressed?: boolean
  shortcut?: string
}) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={label}
      aria-pressed={pressed}
      aria-keyshortcuts={shortcut?.replace('⌘', 'Meta').replace('Ctrl', 'Control').replace('Supr', 'Delete')}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={icon} />
      {/* Tooltip visible al pasar el mouse y al enfocar con teclado (el nombre accesible es aria-label). */}
      <span className="icon-button__tip" aria-hidden="true">
        {shortcut ? `${label} (${shortcut})` : label}
      </span>
    </button>
  )
}

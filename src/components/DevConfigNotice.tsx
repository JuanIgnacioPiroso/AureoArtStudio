import { business } from '../config/business'

/** Aviso visible sólo en desarrollo: datos comerciales que faltan completar. */
export function DevConfigNotice() {
  if (!import.meta.env.DEV) return null
  const missing = Object.entries(business)
    .filter(([, v]) => v === null)
    .map(([k]) => k)
  if (!missing.length) return null
  return (
    <aside className="dev-notice" role="note">
      Desarrollo: faltan datos en <code>src/config/business.ts</code>: {missing.join(', ')}. Los botones que los usan
      están ocultos.
    </aside>
  )
}

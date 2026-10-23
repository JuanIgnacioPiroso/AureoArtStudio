import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { legacyLabRedirect } from './lab/intent'
import './styles/tokens.css'
import './styles/base.css'
import './styles/landing.css'

// Los enlaces viejos del Lab (?d= o ?producto= en la home) se mandan a su página antes de pintar nada.
const redirect = legacyLabRedirect(location.search)
if (redirect) {
  location.replace(redirect)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

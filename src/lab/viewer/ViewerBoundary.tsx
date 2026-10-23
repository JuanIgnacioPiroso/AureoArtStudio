import { Component, type ReactNode } from 'react'

/** Si la escena 3D falla, muestra la alternativa en lugar de romper la página. */
export class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('[custom-lab] la vista 3D falló', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Escala la raíz (rem) en móvil según el ancho útil.
 * REF más alto → mismo ancho da raíz algo menor (más densidad sin pasar del mínimo 12px).
 */
const REF_WIDTH_CSS = 428
const BASE_PX = 16
const MIN_ROOT_PX = 12
const MAX_ROOT_PX = 16

export function applyAdaptiveRootFont() {
  const doc = document.documentElement
  if (!doc || typeof window === 'undefined') return
  const isMobile = window.matchMedia('(max-width: 767.98px)').matches
  if (!isMobile) {
    doc.style.removeProperty('font-size')
    return
  }
  const w = doc.clientWidth
  if (!w || w < 1) return
  const px = Math.min(MAX_ROOT_PX, Math.max(MIN_ROOT_PX, (BASE_PX * w) / REF_WIDTH_CSS))
  doc.style.fontSize = `${px}px`
}

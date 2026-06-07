/**
 * Reglas de confianza temporal de sesión para trabajo sin conexión.
 *
 * La app conserva la sesión local cuando no hay red o cuando una petición falla
 * antes de recibir una respuesta HTTP real. Solo el backend, con una respuesta
 * 401 explícita, debe expulsar al usuario por sesión revocada/requerida.
 */

const AUTH_KEYS = ['rol', 'adminId', 'vendedorId', 'codigoVinculacion', 'adminNombre', 'sessionToken', 'esSuperUsuario']

/** Hay datos suficientes para mantener una sesión operativa local. */
export function hasLocalSessionSnapshot() {
  try {
    return Boolean(localStorage.getItem('sessionToken') || localStorage.getItem('rol'))
  } catch {
    return false
  }
}

/** El navegador indica ausencia de conexión. */
export function isBrowserOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

/**
 * Permite seguir operando con la sesión local mientras no haya confirmación
 * real del backend. Útil para pagos offline y pantallas de campo.
 */
export function shouldTrustLocalSessionTemporarily() {
  return isBrowserOffline() && hasLocalSessionSnapshot()
}

/** Errores típicos de fetch cuando no hubo respuesta HTTP del backend. */
export function isNetworkOrOfflineError(error) {
  if (isBrowserOffline()) return true
  if (!error) return false
  const name = String(error.name || '')
  const message = String(error.message || '').toLowerCase()
  return (
    name === 'TypeError' ||
    name === 'NetworkError' ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('load failed') ||
    message.includes('fetch')
  )
}

/** Un 401 solo debe expulsar si ocurrió estando online o sin sesión local que conservar. */
export function shouldHonorAuthFailureResponse() {
  return !shouldTrustLocalSessionTemporarily()
}

/** Borra autenticación local de forma centralizada. */
export function clearAuthSnapshot() {
  for (const k of AUTH_KEYS) {
    try {
      localStorage.removeItem(k)
    } catch (_) {}
  }
}

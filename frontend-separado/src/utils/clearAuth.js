import { clearAuthSnapshot } from './offlineSession.js'

/** sessionStorage: aviso en pantalla de login tras expulsar sesión */
export const LOGIN_NOTICE_KEY = 'bpp_login_notice'

/** Valor: sesión cerrada porque hubo login en otro dispositivo */
export const LOGIN_NOTICE_REVOKED = 'revoked'

export function clearAllAuthLocalStorage() {
  clearAuthSnapshot()
}

/**
 * Sesión invalidada en servidor.
 * @param {'revoked' | 'required' | null} [notice] - revoked = mostrar mensaje "nueva sesión en otro dispositivo"
 */
export function clearAuthAndGoLogin(notice = null) {
  clearAllAuthLocalStorage()
  if (typeof window === 'undefined') return
  try {
    if (notice === 'revoked') {
      sessionStorage.setItem(LOGIN_NOTICE_KEY, LOGIN_NOTICE_REVOKED)
    } else {
      sessionStorage.removeItem(LOGIN_NOTICE_KEY)
    }
  } catch (_) {}
  window.location.hash = '#/'
  window.location.reload()
}

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/global.css'
import 'leaflet/dist/leaflet.css'
import { createPinia } from 'pinia'
import i18n from './i18n'
import API_BASE_URL from './config/api.js'
import { clearAuthAndGoLogin } from './utils/clearAuth.js'
import { hasLocalSessionSnapshot, shouldHonorAuthFailureResponse, shouldTrustLocalSessionTemporarily } from './utils/offlineSession.js'
import { startDeployVersionCheck } from './utils/deployVersionCheck.js'
import { applyAdaptiveRootFont } from './composables/applyAdaptiveRootFont.js'
import { syncAllPendingPagos } from './utils/syncOfflinePagos.js'
import { leerRutaActivaSnapshot } from './utils/rutaUtils.js'

import { installCrearClienteTotalsFallback } from './utils/crearClienteTotalsFallback.js'

/** Sincronizar pagos guardados offline cuando vuelva la red */
function setupOfflinePagoSync() {
  if (typeof window === 'undefined') return
  const run = () => {
    const current = router.currentRoute?.value
    if (
      navigator.onLine &&
      current?.meta?.requiresAuth === true &&
      hasLocalSessionSnapshot() &&
      localStorage.getItem('sessionToken')
    ) {
      void syncAllPendingPagos()
    }
  }
  window.addEventListener('online', run)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') run()
  })
  setTimeout(run, 2500)
}

/** URL completa del request (string, URL o Request) — necesario porque `new URL()` no tiene .url */
function fetchInputToUrlString(input) {
  if (typeof input === 'string') return input
  if (typeof URL !== 'undefined' && input instanceof URL) return input.href
  if (typeof Request !== 'undefined' && input instanceof Request) return input.url
  return String(input?.url ?? '')
}


function isRutaActualRequest(url) {
  return url.startsWith(API_BASE_URL) && /\/api\/rutas\/actual\//.test(url)
}

function vendedorIdFromRutaActualUrl(url) {
  const match = String(url || '').match(/\/api\/rutas\/actual\/([^/?#]+)/)
  return match ? decodeURIComponent(match[1]) : localStorage.getItem('vendedorId')
}

function rutaActivaTemporalResponse(url) {
  const vendedorId = vendedorIdFromRutaActualUrl(url)
  const rutaGuardada = leerRutaActivaSnapshot(vendedorId)
  const ruta = rutaGuardada || {
    _id: `offline-ruta-${vendedorId || 'local'}`,
    vendedor: vendedorId || localStorage.getItem('vendedorId') || null,
    abierta: true,
    offline: true,
    confianzaTemporal: true,
    fecha: new Date().toISOString()
  }
  return new Response(JSON.stringify(ruta), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

function shouldUseRutaTemporal(url) {
  return isRutaActualRequest(url) && hasLocalSessionSnapshot()
}

function isCurrentRoutePublic() {
  return router.currentRoute?.value?.meta?.requiresAuth !== true
}

/** Inyecta Bearer sessionToken en llamadas al backend y reacciona a sesión revocada */
const origFetch = window.fetch.bind(window)
window.fetch = async function patchedFetch(input, init) {
  const url = fetchInputToUrlString(input)
  const isOurBackend = url.startsWith(API_BASE_URL)
  const isLogin = url.includes('/api/login')
  let nextInit = init
  if (isOurBackend && !isLogin) {
    const token = localStorage.getItem('sessionToken')
    if (token) {
      const headers = new Headers(init?.headers ?? undefined)
      if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
      nextInit = { ...init, headers }
    }
  }
  try {
    if (shouldUseRutaTemporal(url) && typeof navigator !== 'undefined' && navigator.onLine === false) {
      window.dispatchEvent(new CustomEvent('offline-ruta-temporal-trusted'))
      return rutaActivaTemporalResponse(url)
    }

    const res = await origFetch(input, nextInit)
    if (res.status === 401 && isOurBackend && !isLogin && shouldHonorAuthFailureResponse()) {
      try {
        const body = await res.clone().json()
        const code = body?.code
        // SESSION_REVOKED: otro dispositivo inició sesión | SESSION_INVALID: compat. antigua
        if (code === 'SESSION_REVOKED' || code === 'SESSION_INVALID') {
          clearAuthAndGoLogin('revoked')
        } else if (code === 'SESSION_REQUIRED') {
          if (isCurrentRoutePublic()) {
            localStorage.removeItem('sessionToken')
          } else {
            clearAuthAndGoLogin(null)
          }
        }
      } catch (_) {
        /* cuerpo no JSON */
      }
    }
    return res
  } catch (error) {
    if (shouldUseRutaTemporal(url)) {
      window.dispatchEvent(new CustomEvent('offline-ruta-temporal-trusted'))
      return rutaActivaTemporalResponse(url)
    }
    if (isOurBackend && !isLogin && shouldTrustLocalSessionTemporarily()) {
      window.dispatchEvent(new CustomEvent('offline-session-trusted'))
    }
    throw error
  }
}

startDeployVersionCheck()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)

applyAdaptiveRootFont()
setupOfflinePagoSync()
installCrearClienteTotalsFallback(router)
app.mount('#app')

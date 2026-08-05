import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/global.css'
import 'leaflet/dist/leaflet.css'
import { createPinia } from 'pinia'
import i18n from './i18n'
import { registerSW } from 'virtual:pwa-register'
import API_BASE_URL from './config/api.js'
import { clearAuthAndGoLogin } from './utils/clearAuth.js'
import { hasLocalSessionSnapshot, shouldHonorAuthFailureResponse, shouldTrustLocalSessionTemporarily } from './utils/offlineSession.js'
import { startDeployVersionCheck } from './utils/deployVersionCheck.js'
import { applyAdaptiveRootFont } from './composables/applyAdaptiveRootFont.js'
import { syncAllPendingPagos } from './utils/syncOfflinePagos.js'
import { leerRutaActivaSnapshot } from './utils/rutaUtils.js'
import { startSyncEngine } from './utils/syncEngine.js'
import { cacheQueryResult, getCachedQueryResult, cacheEntity, invalidateQueryCache } from './utils/offlineCache.js'
import { enqueueMutation, getMutationCount } from './utils/offlineMutationQueue.js'
import { generateId, isLocalId } from './utils/idGenerator.js'

import { installCrearClienteTotalsFallback } from './utils/crearClienteTotalsFallback.js'

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('offline-ready'))
  }
})

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

/** Estado de ruta siempre debe ser en vivo: no se cachea ni se sirve de caché (evita falso "cerrada"). */
function isRouteStatusRequest(url) {
  return (
    isRutaActualRequest(url) ||
    /\/api\/rutas\/anterior\//.test(url) ||
    /\/api\/vendedores\/[^/]+\/panel/.test(url)
  )
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

function isMutationMethod(method) {
  const m = (method || 'GET').toUpperCase()
  return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE'
}

function methodFromInit(init) {
  if (!init) return 'GET'
  if (typeof init === 'object' && init.method) return init.method.toUpperCase()
  return 'GET'
}

function extractEntityType(url) {
  const match = url.match(/\/api\/(?:admin\/)?(?:super\/)?(\w+)/)
  if (!match) return 'unknown'
  let entity = match[1].replace(/s$/, '')
  if (entity === 'cliente') entity = 'clientes'
  return entity
}

async function handleOfflineMutation(url, method, init, body) {
  const entity = extractEntityType(url)
  const localId = method === 'POST' ? generateId(`offline_${entity}`) : null

  if (localId && body && !body._id) {
    body._id = localId
  }

  const mutation = await enqueueMutation({
    entity,
    action: method === 'POST' ? 'create' : method === 'DELETE' ? 'delete' : 'update',
    url,
    body,
    localId
  })

  let optimisticData = body
  if (localId) {
    optimisticData = { ...body, _id: localId, offline: true }
  }

  if (optimisticData) {
    await cacheEntity(entity, localId || body?._id || 'unknown', optimisticData)
  }
  await invalidateQueryCache(`/api/${entity}`)

  return new Response(JSON.stringify({ ok: true, _id: localId, offline: true, ...optimisticData }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  })
}

/** Inyecta Bearer sessionToken, cachea GETs, encola mutaciones offline */
const origFetch = window.fetch.bind(window)
window.fetch = async function patchedFetch(input, init) {
  const url = fetchInputToUrlString(input)
  const isOurBackend = url.startsWith(API_BASE_URL)
  const isLogin = url.includes('/api/login')
  const method = methodFromInit(init)
  let nextInit = init

  if (isOurBackend && !isLogin) {
    const token = localStorage.getItem('sessionToken')
    if (token) {
      const headers = new Headers(init?.headers ?? undefined)
      if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
      nextInit = { ...init, headers }
    }
  }

  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false

  if (isOurBackend && !isLogin && isOffline) {
    if (isMutationMethod(method)) {
      let body = null
      try {
        body = nextInit?.body ? JSON.parse(nextInit.body) : null
      } catch {}
      return handleOfflineMutation(url, method, nextInit, body)
    }

    if (method === 'GET' && shouldUseRutaTemporal(url)) {
      window.dispatchEvent(new CustomEvent('offline-ruta-temporal-trusted'))
      return rutaActivaTemporalResponse(url)
    }

    if (method === 'GET') {
      const cached = isRouteStatusRequest(url) ? null : await getCachedQueryResult(url)
      if (cached !== null) {
        if (shouldTrustLocalSessionTemporarily()) {
          window.dispatchEvent(new CustomEvent('offline-session-trusted'))
        }
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
        })
      }
      return new Response(JSON.stringify({ error: 'Sin conexión', offline: true }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  try {
    if (!isOffline && shouldUseRutaTemporal(url)) {
      const res = await origFetch(input, nextInit)
      if (res.ok) {
        try {
          const data = await res.clone().json()
          if (!isRouteStatusRequest(url)) await cacheQueryResult(url, data)
        } catch {}
      }
      return res
    }

    const res = await origFetch(input, nextInit)
    const isOk = res.ok

    if (isOk && isOurBackend && !isLogin) {
      if (method === 'GET') {
        try {
          const data = await res.clone().json()
          if (!isRouteStatusRequest(url)) await cacheQueryResult(url, data)
          if (Array.isArray(data)) {
            const entity = extractEntityType(url)
            for (const item of data) {
              if (item._id) await cacheEntity(entity, item._id, item)
            }
          } else if (data && data._id) {
            await cacheEntity(extractEntityType(url), data._id, data)
          }
        } catch {}
      }
      if (isMutationMethod(method)) {
        await invalidateQueryCache(url)
        if (/\/api\/rutas\/(?:abrir|cerrar|reabrir)/.test(url)) {
          await invalidateQueryCache('/api/rutas/actual')
          await invalidateQueryCache('/api/rutas/anterior')
        }
      }
    }

    if (res.status === 401 && isOurBackend && !isLogin && shouldHonorAuthFailureResponse()) {
      try {
        const body = await res.clone().json()
        const code = body?.code
        if (code === 'SESSION_REVOKED' || code === 'SESSION_INVALID') {
          clearAuthAndGoLogin('revoked')
        } else if (code === 'SESSION_REQUIRED') {
          if (isCurrentRoutePublic()) {
            localStorage.removeItem('sessionToken')
          } else {
            clearAuthAndGoLogin(null)
          }
        }
      } catch (_) {}
    }
    return res
  } catch (error) {
    if (isOurBackend && !isLogin && method === 'GET') {
      const cached = isRouteStatusRequest(url) ? null : await getCachedQueryResult(url)
      if (cached !== null) {
        if (shouldTrustLocalSessionTemporarily()) {
          window.dispatchEvent(new CustomEvent('offline-session-trusted'))
        }
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
        })
      }
    }

    if (shouldUseRutaTemporal(url)) {
      window.dispatchEvent(new CustomEvent('offline-ruta-temporal-trusted'))
      return rutaActivaTemporalResponse(url)
    }
    // Si falló la consulta de estado de ruta pero hay sesión activa, no bloquear
    if (isRouteStatusRequest(url) && localStorage.getItem('sessionToken')) {
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
startSyncEngine()
app.mount('#app')

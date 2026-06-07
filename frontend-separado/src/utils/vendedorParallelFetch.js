/**
 * Carga en paralelo pagos + clientes del asesor (dos peticiones simultáneas).
 * Usado por el dashboard del vendedor para reducir tiempo total de espera.
 */
import API_BASE_URL from '../config/api.js'
import { isNetworkOrOfflineError } from './offlineSession.js'

const CACHE_PREFIX = 'bpp_vendedor_snapshot:'

function cacheKey(vendorId) {
  return `${CACHE_PREFIX}${vendorId}`
}

function readSnapshot(vendorId) {
  try {
    const raw = localStorage.getItem(cacheKey(vendorId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      pagosList: Array.isArray(parsed?.pagosList) ? parsed.pagosList : [],
      todos: Array.isArray(parsed?.todos) ? parsed.todos : [],
      updatedAt: parsed?.updatedAt || null
    }
  } catch {
    return null
  }
}

function writeSnapshot(vendorId, snapshot) {
  try {
    localStorage.setItem(cacheKey(vendorId), JSON.stringify({
      pagosList: Array.isArray(snapshot.pagosList) ? snapshot.pagosList : [],
      todos: Array.isArray(snapshot.todos) ? snapshot.todos : [],
      updatedAt: new Date().toISOString()
    }))
  } catch {
    /* localStorage puede estar lleno o bloqueado */
  }
}

function offlineFallback(vendorId) {
  const cached = readSnapshot(vendorId)
  if (!cached) {
    return { pagosList: [], todos: [], pagosOk: false, clientesOk: false, offline: true, fromCache: false }
  }
  return {
    pagosList: cached.pagosList,
    todos: cached.todos,
    pagosOk: true,
    clientesOk: true,
    offline: true,
    fromCache: true,
    cachedAt: cached.updatedAt
  }
}

/**
 * @param {string} vendorId
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ pagosList: unknown[], todos: unknown[], pagosOk: boolean, clientesOk: boolean }>}
 */
export async function fetchPagosAndClientesForVendor(vendorId, signal) {
  if (!vendorId) {
    return { pagosList: [], todos: [], pagosOk: true, clientesOk: true }
  }
  const ts = Date.now()
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return offlineFallback(vendorId)
  }


  const base = { cache: 'no-store', signal }
  try {
    const [resP, resC] = await Promise.all([
      fetch(`${API_BASE_URL}/api/pagos/vendedor/${vendorId}?_t=${ts}`, base),
      fetch(`${API_BASE_URL}/api/clientes/vendedor/${vendorId}?_t=${ts}`, base)
    ])
    const pagosOk = resP.ok
    const clientesOk = resC.ok
    const [pagosList, todos] = await Promise.all([
      pagosOk ? resP.json() : Promise.resolve([]),
      clientesOk ? resC.json() : Promise.resolve([])
    ])
    const result = { pagosList, todos, pagosOk, clientesOk, offline: false, fromCache: false }
    if (pagosOk && clientesOk) writeSnapshot(vendorId, result)
    return result
  } catch (e) {
    if (e?.name === 'AbortError') throw e
    if (isNetworkOrOfflineError(e)) return offlineFallback(vendorId)
    return { pagosList: [], todos: [], pagosOk: false, clientesOk: false, offline: false, fromCache: false }
  }
}

import API_BASE_URL from '../config/api.js'
import { getPendingMutations, dequeueMutation, markMutationFailed, markMutationConflict, getMutationCount } from './offlineMutationQueue.js'
import { cacheEntity, replaceLocalId, invalidateQueryCache } from './offlineCache.js'
import { isLocalId } from './idGenerator.js'
import { hasLocalSessionSnapshot } from './offlineSession.js'
import { syncAllPendingPagos } from './syncOfflinePagos.js'

let syncing = false
let progressListeners = []

export function onSyncProgress(callback) {
  progressListeners.push(callback)
  return () => {
    progressListeners = progressListeners.filter(cb => cb !== callback)
  }
}

function notifyProgress(status) {
  for (const cb of progressListeners) {
    try { cb(status) } catch {}
  }
}

export function getSyncStatus() {
  return { syncing }
}

async function fetchWithAuth(url, options) {
  const token = localStorage.getItem('sessionToken')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers
  }
  return fetch(url, { ...options, headers })
}

async function processMutation(mutation) {
  const { id, entity, action, url, body, localId } = mutation

  let fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`

  let method = 'POST'
  if (action === 'update') method = 'PUT'
  else if (action === 'delete') method = 'DELETE'

  try {
    const res = await fetchWithAuth(fullUrl, {
      method,
      body: body ? JSON.stringify(body) : undefined
    })

    if (res.ok) {
      let responseData = null
      try { responseData = await res.json() } catch {}

      const serverId = responseData?._id || responseData?.id || null

      if (localId && serverId && isLocalId(localId) && !isLocalId(serverId)) {
        await replaceLocalId(entity, localId, serverId, responseData)
      } else if (responseData && responseData._id) {
        await cacheEntity(entity, responseData._id, responseData)
      }

      await invalidateQueryCache(`/api/${entity}`)
      await invalidateQueryCache(`/api/${entity}s`)
      await dequeueMutation(id)
      return { success: true, data: responseData }
    } else if (res.status === 409) {
      let errData = null
      try { errData = await res.json() } catch {}
      await markMutationConflict(id, errData)
      return { success: false, conflict: true, data: errData }
    } else if (res.status === 401) {
      return { success: false, fatal: true, reason: 'session_expired' }
    } else {
      await markMutationFailed(id)
      return { success: false, error: `HTTP ${res.status}` }
    }
  } catch (err) {
    await markMutationFailed(id)
    return { success: false, error: err.message, networkError: true }
  }
}

export async function syncAllMutations() {
  if (syncing) return { skipped: true }
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { skipped: true }

  const token = localStorage.getItem('sessionToken')
  if (!token || !hasLocalSessionSnapshot()) return { skipped: true }

  syncing = true

  try {
    const mutations = await getPendingMutations()
    if (mutations.length === 0) {
      syncing = false
      return { total: 0, completed: 0 }
    }

    notifyProgress({ syncing: true, total: mutations.length, completed: 0 })

    let completed = 0
    let failed = 0
    let conflicts = 0

    for (const mutation of mutations) {
      const result = await processMutation(mutation)

      if (result.fatal) {
        notifyProgress({ syncing: false, total: mutations.length, completed, failed, conflicts, fatal: true, reason: result.reason })
        syncing = false
        return { total: mutations.length, completed, failed, conflicts, fatal: true }
      }

      if (result.success) completed++
      else if (result.conflict) conflicts++
      else failed++

      notifyProgress({ syncing: true, total: mutations.length, completed, failed, conflicts })
    }

    await syncAllPendingPagos()

    notifyProgress({ syncing: false, total: mutations.length, completed, failed, conflicts })
    window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: { completed, failed, conflicts } }))

    return { total: mutations.length, completed, failed, conflicts }
  } catch (err) {
    console.error('[syncEngine] Error during sync:', err)
    notifyProgress({ syncing: false, error: err.message })
    return { error: err.message }
  } finally {
    syncing = false
  }
}

function delayedSync() {
  if (navigator.onLine && hasLocalSessionSnapshot() && localStorage.getItem('sessionToken')) {
    setTimeout(() => {
      syncAllMutations()
    }, 2000)
  }
}

export function startSyncEngine() {
  if (typeof window === 'undefined') return

  window.addEventListener('online', delayedSync)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') delayedSync()
  })

  setTimeout(delayedSync, 3000)
}

export function forceSync() {
  return syncAllMutations()
}

/**
 * Cola de pagos (POST /api/pagos) guardados sin conexión para sincronizar después.
 * IndexedDB con fallback a localStorage.
 */

const DB_NAME = 'propio-offline-v1'
const STORE = 'pagoPostQueue'
const DB_VERSION = 1
const LS_KEY = 'offlinePagoQueueFallback'

function generateOfflineId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `off-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** Serializa fechas para JSON/IndexedDB */
export function serializePagoBody(body) {
  const b = { ...body }
  if (b.fecha instanceof Date) b.fecha = b.fecha.toISOString()
  return b
}

export function deserializePagoBody(body) {
  const b = { ...body }
  if (b.fecha != null && typeof b.fecha === 'string') b.fecha = new Date(b.fecha)
  return b
}

function readLsFallback() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeLsFallback(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

function openIdb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        const st = db.createObjectStore(STORE, { keyPath: 'offlineId' })
        st.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

let idbPromise = null
async function getDb() {
  if (idbPromise === null) {
    idbPromise = openIdb().catch(() => null)
  }
  return idbPromise
}

/**
 * @param {object} pagoBody Cuerpo listo para POST /api/pagos (como en Pagos.vue)
 * @returns {Promise<string>} offlineId
 */
export async function enqueueOfflinePago(pagoBody) {
  const offlineId = generateOfflineId()
  const record = {
    offlineId,
    createdAt: Date.now(),
    body: serializePagoBody(pagoBody)
  }
  const db = await getDb()
  if (!db) {
    const list = readLsFallback()
    list.push(record)
    writeLsFallback(list)
    return offlineId
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve(offlineId)
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).add(record)
  })
}

export async function removeOfflinePago(offlineId) {
  const db = await getDb()
  if (!db) {
    const list = readLsFallback().filter((r) => r.offlineId !== offlineId)
    writeLsFallback(list)
    return
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).delete(offlineId)
  })
}

export async function clearOfflinePagosPending() {
  const db = await getDb()
  if (!db) {
    writeLsFallback([])
    return
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).clear()
  })
}

/** @returns {Promise<Array<{ offlineId: string, createdAt: number, body: object }>>} */
export async function listOfflinePagosPending() {
  const db = await getDb()
  if (!db) {
    return readLsFallback().sort((a, b) => a.createdAt - b.createdAt)
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const all = req.result || []
      all.sort((a, b) => a.createdAt - b.createdAt)
      resolve(all)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getOfflinePendingCount() {
  const list = await listOfflinePagosPending()
  return list.length
}

export function emitOfflinePagosChanged(count) {
  try {
    window.dispatchEvent(new CustomEvent('offline-pagos-changed', { detail: { count } }))
  } catch {
    /* ignore */
  }
}

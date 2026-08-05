import { openDB } from 'idb'
import { generateId } from './idGenerator.js'

const DB_NAME = 'propio-offline-v2'
const STORE_NAME = 'mutationQueue'

let DB_VERSION = 3
let dbPromise = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('queryCache')) {
          db.createObjectStore('queryCache', { keyPath: 'url' })
        }
        if (!db.objectStoreNames.contains('entities')) {
          const store = db.createObjectStore('entities', { keyPath: 'id' })
          store.createIndex('entityType', 'entityType', { unique: false })
        }
        if (db.objectStoreNames.contains('entities') && transaction) {
          const store = transaction.objectStore('entities')
          if (!store.indexNames.contains('entityType')) {
            store.createIndex('entityType', 'entityType', { unique: false })
          }
        }
      }
    })
  }
  return dbPromise
}

export async function ensureMutationStore() {
  const db = await getDb()
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    DB_VERSION++
    dbPromise = null
    return getDb()
  }
  return db
}

export async function enqueueMutation({ entity, action, url, body, localId, optimisticData }) {
  const mutation = {
    id: generateId('mut'),
    entity,
    action,
    url,
    body,
    localId: localId || null,
    optimisticData: optimisticData || null,
    createdAt: Date.now(),
    retries: 0,
    maxRetries: 3,
    status: 'pending'
  }
  try {
    const db = await getDb()
    await db.add(STORE_NAME, mutation)
    window.dispatchEvent(new CustomEvent('offline-mutations-changed'))
  } catch (e) {
    console.warn('[offlineMutationQueue] Error enqueueing:', e)
  }
  return mutation
}

export async function dequeueMutation(id) {
  try {
    const db = await getDb()
    await db.delete(STORE_NAME, id)
    window.dispatchEvent(new CustomEvent('offline-mutations-changed'))
  } catch (e) {
    console.warn('[offlineMutationQueue] Error dequeueing:', id, e)
  }
}

export async function getPendingMutations() {
  try {
    const db = await getDb()
    const all = await db.getAll(STORE_NAME)
    return all
      .filter(m => m.status === 'pending')
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
  } catch (e) {
    console.warn('[offlineMutationQueue] Error reading queue:', e)
    return []
  }
}

export async function getMutationCount() {
  try {
    const mutations = await getPendingMutations()
    return mutations.length
  } catch {
    return 0
  }
}

export async function markMutationFailed(id) {
  try {
    const db = await getDb()
    const mutation = await db.get(STORE_NAME, id)
    if (mutation) {
      mutation.retries = (mutation.retries || 0) + 1
      if (mutation.retries >= mutation.maxRetries) {
        mutation.status = 'failed'
      }
      await db.put(STORE_NAME, mutation)
    }
  } catch (e) {
    console.warn('[offlineMutationQueue] Error marking failed:', id, e)
  }
}

export async function markMutationConflict(id, serverResponse) {
  try {
    const db = await getDb()
    const mutation = await db.get(STORE_NAME, id)
    if (mutation) {
      mutation.status = 'conflict'
      mutation.serverResponse = serverResponse
      await db.put(STORE_NAME, mutation)
    }
  } catch (e) {
    console.warn('[offlineMutationQueue] Error marking conflict:', id, e)
  }
}

export async function getFailedMutations() {
  try {
    const db = await getDb()
    const all = await db.getAll(STORE_NAME)
    return all.filter(m => m.status === 'failed')
  } catch {
    return []
  }
}

export async function clearMutationQueue() {
  try {
    const db = await getDb()
    await db.clear(STORE_NAME)
    window.dispatchEvent(new CustomEvent('offline-mutations-changed'))
  } catch (e) {
    console.warn('[offlineMutationQueue] Error clearing queue:', e)
  }
}

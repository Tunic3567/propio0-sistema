import { openDB } from 'idb'

const DB_NAME = 'propio-offline-v2'
const DB_VERSION = 2

let dbPromise = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
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
        if (!db.objectStoreNames.contains('mutationQueue')) {
          db.createObjectStore('mutationQueue', { keyPath: 'id' })
        }
      }
    }).catch((e) => {
      dbPromise = null
      throw e
    })
  }
  return dbPromise
}

export async function cacheQueryResult(url, data) {
  try {
    const db = await getDb()
    await db.put('queryCache', { url, data, timestamp: Date.now() })
  } catch (e) {
    console.warn('[offlineCache] Error caching query:', url, e)
  }
}

export async function getCachedQueryResult(url) {
  try {
    const db = await getDb()
    const entry = await db.get('queryCache', url)
    if (!entry) return null
    const MAX_AGE = 24 * 60 * 60 * 1000
    if (Date.now() - entry.timestamp > MAX_AGE) {
      await db.delete('queryCache', url)
      return null
    }
    return entry.data
  } catch (e) {
    console.warn('[offlineCache] Error reading cache:', url, e)
    return null
  }
}

export async function invalidateQueryCache(pattern) {
  try {
    const db = await getDb()
    const all = await db.getAll('queryCache')
    for (const entry of all) {
      if (entry.url.includes(pattern)) {
        await db.delete('queryCache', entry.url)
      }
    }
  } catch (e) {
    console.warn('[offlineCache] Error invalidating cache:', pattern, e)
  }
}

export async function cacheEntity(entityType, id, data) {
  try {
    const db = await getDb()
    await db.put('entities', { id: `${entityType}_${id}`, entityType, entityId: id, data, timestamp: Date.now() })
  } catch (e) {
    console.warn('[offlineCache] Error caching entity:', entityType, id, e)
  }
}

export async function getCachedEntity(entityType, id) {
  try {
    const db = await getDb()
    const entry = await db.get('entities', `${entityType}_${id}`)
    return entry ? entry.data : null
  } catch (e) {
    console.warn('[offlineCache] Error reading entity:', entityType, id, e)
    return null
  }
}

export async function getAllCachedEntities(entityType) {
  try {
    const db = await getDb()
    const index = db.transaction('entities').store.index('entityType')
    const entries = await index.getAll(entityType)
    return entries.map(e => e.data)
  } catch (e) {
    console.warn('[offlineCache] Error listing entities:', entityType, e)
    return []
  }
}

export async function deleteCachedEntity(entityType, id) {
  try {
    const db = await getDb()
    await db.delete('entities', `${entityType}_${id}`)
  } catch (e) {
    console.warn('[offlineCache] Error deleting entity:', entityType, id, e)
  }
}

export async function replaceLocalId(entityType, localId, serverId, data) {
  try {
    const db = await getDb()
    await db.delete('entities', `${entityType}_${localId}`)
    await db.put('entities', { id: `${entityType}_${serverId}`, entityType, entityId: serverId, data, timestamp: Date.now() })
  } catch (e) {
    console.warn('[offlineCache] Error replacing local ID:', entityType, localId, serverId, e)
  }
}

export async function clearAllCache() {
  try {
    const db = await getDb()
    await db.clear('queryCache')
    await db.clear('entities')
  } catch (e) {
    console.warn('[offlineCache] Error clearing cache:', e)
  }
}

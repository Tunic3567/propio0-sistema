let counter = 0

export function generateId(prefix = 'offline') {
  counter++
  return `${prefix}_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 8)}`
}

export function isLocalId(id) {
  return typeof id === 'string' && /^offline_/.test(id)
}

export function resetCounter() {
  counter = 0
}

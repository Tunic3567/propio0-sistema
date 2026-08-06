const PREFIX = 'pendingLocal_'

function key(vendedorId, type) {
  return `${PREFIX}${type}_${vendedorId}`
}

export function addPendingLocal(vendedorId, type, item) {
  if (!vendedorId || !item) return
  try {
    const k = key(vendedorId, type)
    const raw = localStorage.getItem(k)
    const list = raw ? JSON.parse(raw) : []
    list.push(item)
    localStorage.setItem(k, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('pending-local-changed', { detail: { type, vendedorId } }))
  } catch {}
}

export function getPendingLocal(vendedorId, type) {
  if (!vendedorId) return []
  try {
    const raw = localStorage.getItem(key(vendedorId, type))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearPendingLocal(vendedorId, type) {
  if (!vendedorId) return
  try {
    localStorage.removeItem(key(vendedorId, type))
    window.dispatchEvent(new CustomEvent('pending-local-changed', { detail: { type, vendedorId } }))
  } catch {}
}

export function clearAllPendingLocal(vendedorId) {
  clearPendingLocal(vendedorId, 'pagos')
  clearPendingLocal(vendedorId, 'ingresos')
  clearPendingLocal(vendedorId, 'egresos')
}
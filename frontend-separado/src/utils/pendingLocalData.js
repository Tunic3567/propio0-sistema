const PREFIX = 'pendingLocal_'
const EDITS_PREFIX = 'pendingEdits_'

function key(vendedorId, type) {
  return `${PREFIX}${type}_${vendedorId}`
}

function editsKey(vendedorId, type) {
  return `${EDITS_PREFIX}${type}_${vendedorId}`
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

export function addPendingEdit(vendedorId, type, item) {
  if (!vendedorId || !item || !item._id) return
  try {
    const k = editsKey(vendedorId, type)
    const raw = localStorage.getItem(k)
    let list = raw ? JSON.parse(raw) : []
    list = list.filter(e => String(e._id) !== String(item._id))
    list.push(item)
    localStorage.setItem(k, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('pending-local-changed', { detail: { type, vendedorId } }))
  } catch {}
}

export function applyPendingEdits(list, vendedorId, type) {
  if (!vendedorId || !list || !list.length) return list
  try {
    const k = editsKey(vendedorId, type)
    const raw = localStorage.getItem(k)
    if (!raw) return list
    const edits = JSON.parse(raw)
    if (!edits.length) return list
    return list.map(item => {
      const edit = edits.find(e => String(e._id) === String(item._id))
      return edit ? { ...item, ...edit } : item
    })
  } catch {
    return list
  }
}

export function clearPendingEdits(vendedorId, type) {
  if (!vendedorId) return
  try {
    localStorage.removeItem(`pendingEdits_${type}_${vendedorId}`)
    window.dispatchEvent(new CustomEvent('pending-local-changed', { detail: { type, vendedorId } }))
  } catch {}
}
/**
 * Envía a la API los pagos en cola offline (POST /api/pagos).
 * Usa fetch global (inyecta Bearer en main.js).
 */
import API_BASE_URL from '../config/api.js'
import { shouldTrustLocalSessionTemporarily } from './offlineSession.js'
import {
  listOfflinePagosPending,
  removeOfflinePago,
  deserializePagoBody,
  emitOfflinePagosChanged,
  getOfflinePendingCount
} from './offlinePagoQueue.js'

let syncInFlight = false

/**
 * @returns {Promise<{ synced: number, skippedDuplicate: number, discardedInvalid: number, leftInQueue: number }>}
 */
export async function syncAllPendingPagos() {
  if (!localStorage.getItem('sessionToken')) {
    return { synced: 0, skippedDuplicate: 0, discardedInvalid: 0, leftInQueue: await getOfflinePendingCount() }
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { synced: 0, skippedDuplicate: 0, discardedInvalid: 0, leftInQueue: await getOfflinePendingCount() }
  }
  if (syncInFlight) {
    return { synced: 0, skippedDuplicate: 0, discardedInvalid: 0, leftInQueue: await getOfflinePendingCount() }
  }
  syncInFlight = true
  let synced = 0
  let skippedDuplicate = 0
  let discardedInvalid = 0
  try {
    const list = await listOfflinePagosPending()
    for (const item of list) {
      const body = deserializePagoBody(item.body)
      try {
        const res = await fetch(`${API_BASE_URL}/api/pagos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        if (res.status === 201) {
          await removeOfflinePago(item.offlineId)
          synced++
          continue
        }
        const err = await res.json().catch(() => ({}))
        if (res.status === 401 && shouldTrustLocalSessionTemporarily()) {
          break
        }
        if (res.status === 401 && ['SESSION_REVOKED', 'SESSION_INVALID', 'SESSION_REQUIRED'].includes(err?.code)) {
          break
        }
        if (err.codigo === 'PAGO_DUPLICADO' || err.codigo === 'PAGO_DUPLICADO_BD') {
          await removeOfflinePago(item.offlineId)
          skippedDuplicate++
          continue
        }
        if (isPermanentPagoSyncError(res.status, err)) {
          console.warn('Pago offline descartado porque el servidor lo rechazó de forma permanente:', {
            offlineId: item.offlineId,
            status: res.status,
            error: err?.error || err?.msg || err?.codigo || null
          })
          await removeOfflinePago(item.offlineId)
          discardedInvalid++
          continue
        }
      } catch {
        /* sin red: dejar en cola */
      }
    }
    const left = await getOfflinePendingCount()
    if (synced > 0 || skippedDuplicate > 0 || discardedInvalid > 0) {
      window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
      window.dispatchEvent(new CustomEvent('pago-registrado'))
    }
    emitOfflinePagosChanged(left)
    return { synced, skippedDuplicate, discardedInvalid, leftInQueue: left }
  } finally {
    syncInFlight = false
  }
}

function isPermanentPagoSyncError(status, err) {
  if ([400, 404, 422].includes(Number(status))) return true
  const text = String(err?.error || err?.msg || err?.detalles || '').toLowerCase()
  return (
    text.includes('ruta no encontrada') ||
    text.includes('cliente no encontrado') ||
    text.includes('no se puede registrar un pago sin especificar la ruta') ||
    text.includes('la ruta debe pertenecer') ||
    text.includes('el cliente y la ruta deben pertenecer')
  )
}

import API_BASE_URL from '../config/api.js'
import { isBrowserOffline, isNetworkOrOfflineError, hasLocalSessionSnapshot } from './offlineSession.js'

const RUTA_ACTIVA_SNAPSHOT_PREFIX = 'rutaActivaSnapshot:'

function getRutaSnapshotKey(vendedorId) {
  return `${RUTA_ACTIVA_SNAPSHOT_PREFIX}${vendedorId || 'local'}`
}

export function guardarRutaActivaSnapshot(vendedorId, ruta) {
  if (!ruta) return
  try {
    localStorage.setItem(getRutaSnapshotKey(vendedorId), JSON.stringify({ ruta, savedAt: Date.now() }))
  } catch (_) {}
}

export function leerRutaActivaSnapshot(vendedorId) {
  try {
    const raw = localStorage.getItem(getRutaSnapshotKey(vendedorId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.ruta || null
  } catch (_) {
    return null
  }
}

function estadoRutaConfiableOffline(vendedorId) {
  const rutaGuardada = leerRutaActivaSnapshot(vendedorId)
  const ruta = rutaGuardada || {
    _id: `offline-ruta-${vendedorId || 'local'}`,
    vendedor: vendedorId || null,
    abierta: true,
    offline: true,
    confianzaTemporal: true,
    fecha: new Date().toISOString()
  }
  return {
    abierta: true,
    cargando: false,
    ruta,
    offline: true,
    confianzaTemporal: true
  }
}

function debeConfiarRutaTemporalmente() {
  return hasLocalSessionSnapshot()
}

/** Zona horaria del usuario (navegador) para validar "una ruta por día" en su fecha local */
export function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}

export async function consultarEstadoRuta() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')

    if (!vendedorId) {
      if (debeConfiarRutaTemporalmente()) return estadoRutaConfiableOffline(vendedorId)
      return { abierta: false, cargando: false }
    }

    if (isBrowserOffline() && debeConfiarRutaTemporalmente()) {
      return estadoRutaConfiableOffline(vendedorId)
    }

    const url = `${API_BASE_URL}/api/rutas/actual/${vendedorId}`
    const res = await fetch(url)

    if (res.ok) {
      const ruta = await res.json()
      if (ruta?.abierta) guardarRutaActivaSnapshot(vendedorId, ruta)
      return {
        abierta: Boolean(ruta?.abierta),
        cargando: false,
        ruta
      }
    }

    if (debeConfiarRutaTemporalmente()) {
      console.warn('⚠️ consultarEstadoRuta - respuesta no válida; se conserva ruta temporal local')
      return estadoRutaConfiableOffline(vendedorId)
    }

    return { abierta: false, cargando: false }
  } catch (error) {
    if (isNetworkOrOfflineError(error) && debeConfiarRutaTemporalmente()) {
      console.warn('⚠️ consultarEstadoRuta - sin conexión; se confía temporalmente en la ruta local')
      const vendedorId = localStorage.getItem('vendedorId')
      return estadoRutaConfiableOffline(vendedorId)
    }

    console.error('❌ consultarEstadoRuta - Error:', error)
    return { abierta: false, cargando: false }
  }
}

export async function cerrarRuta() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return false

    const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vendedorId })
    })

    if (res.ok) {
      return true
    } else {
      console.error('Error cerrando ruta:', res.statusText)
      return false
    }
  } catch (error) {
    console.error('Error cerrando ruta:', error)
    return false
  }
}

export async function abrirRuta() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return false

    const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vendedorId, timezone: getUserTimezone() })
    })

    if (res.ok) {
      const ruta = await res.clone().json().catch(() => null)
      guardarRutaActivaSnapshot(vendedorId, ruta || { abierta: true, vendedor: vendedorId, fecha: new Date().toISOString() })
      return true
    } else {
      console.error('Error abriendo ruta:', res.statusText)
      return false
    }
  } catch (error) {
    console.error('Error abriendo ruta:', error)
    return false
  }
}

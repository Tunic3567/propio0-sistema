/**
 * Detecta nuevos despliegues comparando version.json (generado en cada build).
 * Si cambia, recarga la página para cargar el nuevo bundle sin limpiar caché a mano.
 */
const STORAGE_KEY = 'bpp_deploy_version'
const INTERVAL_MS = 4 * 60 * 1000

function buildVersionFetchUrl() {
  const u = new URL('version.json', window.location.href)
  u.searchParams.set('t', String(Date.now()))
  return u.toString()
}

export function startDeployVersionCheck() {
  if (import.meta.env.DEV) {
    return () => {}
  }

  let intervalId = null

  async function ping() {
    try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return

      const res = await fetch(buildVersionFetchUrl(), {
        cache: 'no-store',
        credentials: 'same-origin'
      })
      if (!res.ok) return
      const data = await res.json().catch(() => null)
      const v = data?.v
      if (v == null || v === '') return

      const prev = localStorage.getItem(STORAGE_KEY)
      if (prev == null || prev === '') {
        localStorage.setItem(STORAGE_KEY, String(v))
        return
      }
      if (String(prev) !== String(v)) {
        localStorage.setItem(STORAGE_KEY, String(v))
        window.location.reload()
      }
    } catch {
      /* sin red o despliegues sin version.json aún */
    }
  }

  ping()
  intervalId = window.setInterval(ping, INTERVAL_MS)

  const onVisible = () => {
    if (document.visibilityState === 'visible') ping()
  }
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    if (intervalId != null) window.clearInterval(intervalId)
    document.removeEventListener('visibilitychange', onVisible)
  }
}

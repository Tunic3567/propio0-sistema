import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * URL pública de la app sin hash, sin query ni ruta interna (solo origen + carpeta base).
 * Ej.: https://dominio.com/ en lugar de https://dominio.com/#/admin
 */
export function urlBaseAppSinRutas() {
  if (typeof window === 'undefined') return ''
  try {
    const u = new URL(window.location.href)
    u.hash = ''
    u.search = ''
    return new URL('.', u.href).href
  } catch (_) {
    return typeof window !== 'undefined' ? `${window.location.origin}/` : ''
  }
}

/**
 * Compartir o copiar la URL base de la app (Web Share API → portapapeles → fallback).
 */
export function useCompartirEnlace() {
  const { t } = useI18n()
  const mensajeCompartir = ref('')
  let mensajeCompartirTimer = null

  function limpiarTimer() {
    if (mensajeCompartirTimer) {
      clearTimeout(mensajeCompartirTimer)
      mensajeCompartirTimer = null
    }
  }

  async function compartirEnlacePrincipal() {
    const url = urlBaseAppSinRutas()
    if (!url) return

    limpiarTimer()
    mensajeCompartir.value = ''

    const mostrarExito = (msg) => {
      mensajeCompartir.value = msg
      mensajeCompartirTimer = window.setTimeout(() => {
        mensajeCompartir.value = ''
        mensajeCompartirTimer = null
      }, 4000)
    }

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: typeof document !== 'undefined' ? document.title : t('client.title'),
          text: t('vendorHome.shareText'),
          url
        })
        mostrarExito(t('vendorHome.shareDone'))
        return
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        mostrarExito(t('vendorHome.linkCopied'))
        return
      }
    } catch (_) {
      /* fallback */
    }

    try {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      mostrarExito(t('vendorHome.linkCopied'))
    } catch (_) {
      window.alert(`${t('vendorHome.shareError')}\n\n${url}`)
    }
  }

  onUnmounted(() => {
    limpiarTimer()
  })

  return { mensajeCompartir, compartirEnlacePrincipal }
}

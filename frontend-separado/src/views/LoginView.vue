<template>
  <!-- Una sola pantalla: sin scroll vertical; se adapta con 100dvh y contenido flexible -->
  <div
    class="h-dvh max-h-dvh min-h-0 w-full max-w-full min-w-0 overflow-x-clip overflow-y-hidden overscroll-none flex flex-col bg-neutral-50 dark:bg-slate-900 transition-theme"
  >
    <!-- Barra superior: los controles no se superponen al logo (flujo normal, no absolute sobre el contenido) -->
    <header
      class="shrink-0 flex justify-end items-center gap-1.5 sm:gap-2 px-3 sm:px-4 z-20 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2"
    >
      <LanguageSelector />
      <ShareAppLinkButton />
      <ThemeToggle />
    </header>

    <!-- Bloque central: el logo crece en el espacio libre; frase + formulario no se solapan -->
    <div
      class="flex-1 min-h-0 flex flex-col items-stretch px-4 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] w-full"
    >
      <div
        class="w-full max-w-md mx-auto flex flex-col flex-1 min-h-0 min-w-0 gap-2 sm:gap-3"
      >
        <!-- Logo: flex-1 + basis-0 reparte el espacio vacío; la imagen escala al máximo (object-contain) -->
        <div
          class="flex-1 min-h-0 basis-0 w-full flex items-center justify-center px-1 sm:px-2"
        >
          <img
            src="/logo.png"
            alt="B.P.P Logo"
            class="block w-auto h-auto max-h-full max-w-[min(28rem,94%)] object-contain object-center dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="B.P.P Logo"
            class="block w-auto h-auto max-h-full max-w-[min(28rem,94%)] object-contain object-center hidden dark:block"
          />
        </div>

        <!-- Frase motivacional -->
        <div
          class="shrink-0 min-h-0 flex items-center justify-center px-1 py-0.5"
          role="status"
          aria-live="polite"
        >
          <Transition name="login-quote" mode="out-in">
            <p
              :key="quoteTick"
              class="text-center text-xs sm:text-sm leading-snug sm:leading-relaxed font-medium text-neutral-700 dark:text-neutral-300 font-sans antialiased line-clamp-3"
            >
              {{ currentQuoteText }}
            </p>
          </Transition>
        </div>

        <!-- Aviso: sesión cerrada por login en otro dispositivo -->
        <div
          v-if="sessionRevokedNotice"
          class="shrink-0 rounded-lg border border-amber-200 dark:border-amber-800/80 bg-amber-50/95 dark:bg-amber-950/40 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm"
          role="alert"
        >
          <div class="flex gap-2 sm:gap-3">
            <div class="flex-shrink-0 pt-0.5">
              <svg class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {{ t('login.sessionReplacedTitle') }}
              </p>
              <p class="mt-1 text-xs sm:text-sm text-amber-800/95 dark:text-amber-200/90 leading-snug">
                {{ t('login.sessionReplacedBody') }}
              </p>
            </div>
            <button
              type="button"
              class="flex-shrink-0 rounded-md p-1 text-amber-700 hover:bg-amber-200/60 dark:text-amber-300 dark:hover:bg-amber-900/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              :aria-label="t('common.close')"
              @click="sessionRevokedNotice = false"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Formulario -->
        <div
          class="shrink-0 bg-white dark:bg-neutral-900 rounded-lg p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 transition-theme card-min shadow-exec min-h-0"
        >
        <form @submit.prevent="login" class="space-y-4 sm:space-y-5">
          <!-- Campo Usuario -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2" for="usuario">
              {{ t('login.username') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <input
                v-model="usuario"
                id="usuario"
                type="text"
                autocomplete="username"
                class="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 dark:focus:ring-neutral-500 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 transition-theme text-sm"
                :placeholder="t('login.username')"
                @focus="scrollInputIntoView"
                required
              />
            </div>
          </div>

          <!-- Campo Contraseña -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2" for="contrasena">
              {{ t('login.password') }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                v-model="contrasena"
                id="contrasena"
                :type="mostrarContrasena ? 'text' : 'password'"
                autocomplete="current-password"
                class="w-full pl-10 pr-12 py-2.5 sm:py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 dark:focus:ring-neutral-500 dark:focus:border-neutral-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 transition-theme text-sm"
                :placeholder="t('login.password')"
                @focus="scrollInputIntoView"
                required
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
                :aria-label="mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :title="mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="mostrarContrasena = !mostrarContrasena"
              >
                <svg
                  v-if="!mostrarContrasena"
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3l18 18"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.5 10.677A2 2 0 0012 14a2 2 0 001.323-.5"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7.362 7.561C5.68 8.743 4.278 10.29 3.458 12c1.274 4.057 5.064 7 8.542 7 1.664 0 3.23-.41 4.594-1.126"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.12 14.12A3 3 0 009.88 9.88"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.88 5.88A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.094"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="text-right">
            <router-link
              to="/olvide-contrasena"
              class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded"
            >
              {{ t('login.forgotPassword') }}
            </router-link>
          </div>

          <!-- Botón de Login -->
          <button
            type="submit"
            class="w-full bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-white py-2.5 sm:py-3 px-6 rounded-lg font-semibold text-sm border-2 border-neutral-900/40 dark:border-neutral-500/60 shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-theme"
          >
            {{ t('login.login') }}
          </button>

          <!-- Mensaje de error -->
          <div v-if="error" class="bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
              </div>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import ShareAppLinkButton from '@/components/ShareAppLinkButton.vue'
import API_BASE_URL from '../config/api.js'
import { LOGIN_NOTICE_KEY, LOGIN_NOTICE_REVOKED } from '../utils/clearAuth.js'

const { t, tm, locale } = useI18n()
const usuario = ref('')
const contrasena = ref('')
const mostrarContrasena = ref(false)
const error = ref('')
const router = useRouter()
/** Mostrar mensaje tras cerrar sesión por login en otro dispositivo */
const sessionRevokedNotice = ref(false)

/** Lista de frases desde i18n */
const quotesList = computed(() => {
  const raw = tm('login.motivationalQuotes')
  if (!Array.isArray(raw)) return []
  return raw.map((s) => String(s))
})

function randomQuoteIndex() {
  const n = quotesList.value.length
  return n ? Math.floor(Math.random() * n) : 0
}

const quoteIndex = ref(randomQuoteIndex())
const quoteTick = ref(1)

const currentQuoteText = computed(() => {
  const list = quotesList.value
  if (!list.length) return ''
  const idx = Math.min(quoteIndex.value, Math.max(0, list.length - 1))
  return list[idx] ?? ''
})

/** Frases motivacionales: ~1 minuto entre cambios (más lectura tranquila) */
const QUOTE_INTERVAL_MS = 65000

function pickNextQuoteIndex() {
  const list = quotesList.value
  const n = list.length
  if (n <= 1) return 0
  let next = Math.floor(Math.random() * n)
  let guard = 0
  while (next === quoteIndex.value && guard++ < 32) {
    next = Math.floor(Math.random() * n)
  }
  return next
}

function rotateQuote() {
  const list = quotesList.value
  if (!list.length) return
  quoteIndex.value = pickNextQuoteIndex()
  quoteTick.value += 1
}

let quoteIntervalId = null

onMounted(() => {
  try {
    if (sessionStorage.getItem(LOGIN_NOTICE_KEY) === LOGIN_NOTICE_REVOKED) {
      sessionRevokedNotice.value = true
      sessionStorage.removeItem(LOGIN_NOTICE_KEY)
    }
  } catch (_) {}
  quoteIntervalId = window.setInterval(rotateQuote, QUOTE_INTERVAL_MS)
})

onUnmounted(() => {
  if (quoteIntervalId != null) {
    clearInterval(quoteIntervalId)
    quoteIntervalId = null
  }
})

watch(locale, () => {
  quoteIndex.value = randomQuoteIndex()
  quoteTick.value += 1
})

watch(quotesList, (list) => {
  if (!list.length) {
    quoteIndex.value = 0
    quoteTick.value += 1
    return
  }
  if (quoteIndex.value >= list.length) quoteIndex.value = list.length - 1
  quoteTick.value += 1
})

/** En móvil: hacer scroll para que el campo quede visible por encima del teclado y la barra de autofill */
function scrollInputIntoView() {
  requestAnimationFrame(() => {
    const el = document.activeElement
    if (el && (el.id === 'usuario' || el.id === 'contrasena')) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

const login = async () => {
  error.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuario.value, contrasena: contrasena.value })
    })
    const data = await response.json()
    if (data.exito) {
      if (data.sessionToken) localStorage.setItem('sessionToken', data.sessionToken)
      localStorage.setItem('rol', data.rol)
      localStorage.setItem('codigoVinculacion', data.codigoVinculacion) // Guarda el código de vinculación
      if (data.esSuperUsuario) {
        localStorage.setItem('esSuperUsuario', '1')
      } else {
        localStorage.removeItem('esSuperUsuario')
      }
      if (data.rol === 'superusuario') {
        localStorage.setItem('adminId', data.id || '__SUPER__')
        localStorage.setItem('adminNombre', data.nombre != null ? String(data.nombre).trim() : 'Superusuario')
        router.push('/admin/repair-resumen')
      } else if (data.rol === 'administrador') {
        localStorage.setItem('adminId', data.id) // Guarda el ID del administrador
        if (data.nombre != null && String(data.nombre).trim() !== '') {
          localStorage.setItem('adminNombre', String(data.nombre).trim())
        } else {
          localStorage.removeItem('adminNombre')
        }
        router.push('/admin')
      } else {
        localStorage.setItem('vendedorId', data.id) // ID del asesor (clave localStorage sin cambiar por compatibilidad API)
        router.push('/vendedor')
      }
} else {
      error.value = data.mensaje || t('login.error')
    }
  } catch (e) {
    error.value = t('login.connectionError')
  }
}
</script>

<style scoped>
.login-quote-enter-active,
.login-quote-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.login-quote-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.login-quote-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

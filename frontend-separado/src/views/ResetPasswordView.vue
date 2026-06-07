<template>
  <div
    class="min-h-dvh w-full flex flex-col bg-neutral-50 dark:bg-slate-900 transition-theme px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
  >
    <header class="flex justify-end items-center gap-2 mb-4">
      <LanguageSelector />
      <ThemeToggle />
    </header>

    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      <h1 class="text-xl font-bold text-neutral-900 dark:text-slate-100 mb-1">{{ t('passwordRecover.resetTitle') }}</h1>
      <p class="text-sm text-neutral-600 dark:text-slate-400 mb-6">{{ t('passwordRecover.resetIntro') }}</p>

      <p v-if="!token" class="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-4">
        {{ t('passwordRecover.tokenMissing') }}
      </p>

      <form
        v-else
        class="space-y-4 bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-600 p-5 shadow-sm"
        @submit.prevent="guardar"
      >
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1.5" for="rp1">
            {{ t('passwordRecover.newPassword') }}
          </label>
          <input
            id="rp1"
            v-model="nueva"
            type="password"
            autocomplete="new-password"
            minlength="6"
            required
            class="w-full rounded-lg px-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1.5" for="rp2">
            {{ t('passwordRecover.repeatPassword') }}
          </label>
          <input
            id="rp2"
            v-model="repetir"
            type="password"
            autocomplete="new-password"
            minlength="6"
            required
            class="w-full rounded-lg px-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <p v-if="mensajeOk" class="text-sm text-green-600 dark:text-green-400">{{ mensajeOk }}</p>
        <p v-if="mensajeError" class="text-sm text-red-600 dark:text-red-400">{{ mensajeError }}</p>
        <button
          type="submit"
          :disabled="cargando"
          class="w-full py-2.5 rounded-lg text-sm font-semibold bg-neutral-800 hover:bg-neutral-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {{ cargando ? t('common.loading') : t('passwordRecover.resetSubmit') }}
        </button>
      </form>

      <router-link
        to="/"
        class="mt-6 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        {{ t('login.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import API_BASE_URL from '../config/api.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const token = ref(typeof route.query.token === 'string' ? route.query.token : '')
watch(
  () => route.query.token,
  (q) => {
    token.value = typeof q === 'string' ? q : ''
  }
)

const nueva = ref('')
const repetir = ref('')
const cargando = ref(false)
const mensajeOk = ref('')
const mensajeError = ref('')

const tokenOk = computed(() => Boolean(String(token.value || '').trim()))

async function guardar() {
  mensajeOk.value = ''
  mensajeError.value = ''
  if (!tokenOk.value) {
    mensajeError.value = t('passwordRecover.tokenMissing')
    return
  }
  const a = String(nueva.value || '').trim()
  const b = String(repetir.value || '').trim()
  if (a.length < 6) {
    mensajeError.value = t('passwordRecover.weakPassword')
    return
  }
  if (a !== b) {
    mensajeError.value = t('passwordRecover.mismatch')
    return
  }
  cargando.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/restablecer-contrasena`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: String(token.value).trim(), nuevaContrasena: a })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.exito) {
      mensajeError.value = data.mensaje || t('passwordRecover.error')
      return
    }
    mensajeOk.value = data.mensaje || t('passwordRecover.resetSuccess')
    setTimeout(() => router.replace('/'), 2000)
  } catch (e) {
    console.error(e)
    mensajeError.value = t('login.connectionError')
  } finally {
    cargando.value = false
  }
}
</script>

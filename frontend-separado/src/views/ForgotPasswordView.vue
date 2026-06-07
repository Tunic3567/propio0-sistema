<template>
  <div
    class="min-h-dvh w-full flex flex-col bg-neutral-50 dark:bg-slate-900 transition-theme px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
  >
    <header class="flex justify-end items-center gap-2 mb-4">
      <LanguageSelector />
      <ThemeToggle />
    </header>

    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      <h1 class="text-xl font-bold text-neutral-900 dark:text-slate-100 mb-1">{{ t('passwordRecover.requestTitle') }}</h1>
      <p class="text-sm text-neutral-600 dark:text-slate-400 mb-6">{{ t('passwordRecover.requestIntro') }}</p>

      <form class="space-y-4 bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-600 p-5 shadow-sm" @submit.prevent="enviar">
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1.5" for="fp-email">
            {{ t('passwordRecover.email') }}
          </label>
          <input
            id="fp-email"
            v-model="correo"
            type="email"
            autocomplete="email"
            required
            class="w-full rounded-lg px-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30"
            :placeholder="$t('passwordRecover.emailPlaceholder')"
          />
        </div>
        <p v-if="mensajeOk" class="text-sm text-green-600 dark:text-green-400">{{ mensajeOk }}</p>
        <p v-if="mensajeError" class="text-sm text-red-600 dark:text-red-400">{{ mensajeError }}</p>
        <button
          type="submit"
          :disabled="cargando"
          class="w-full py-2.5 rounded-lg text-sm font-semibold bg-neutral-800 hover:bg-neutral-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {{ cargando ? t('common.loading') : t('passwordRecover.submit') }}
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import API_BASE_URL from '../config/api.js'

const { t } = useI18n()
const correo = ref('')
const cargando = ref(false)
const mensajeOk = ref('')
const mensajeError = ref('')

async function enviar() {
  mensajeOk.value = ''
  mensajeError.value = ''
  const email = String(correo.value || '').trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mensajeError.value = t('passwordRecover.invalidEmailRequest')
    return
  }
  cargando.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/solicitar-recuperacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.exito) {
      mensajeError.value = data.mensaje || t('passwordRecover.error')
      return
    }
    mensajeOk.value = t('passwordRecover.requestSuccess')
    correo.value = ''
  } catch (e) {
    console.error(e)
    mensajeError.value = t('login.connectionError')
  } finally {
    cargando.value = false
  }
}
</script>

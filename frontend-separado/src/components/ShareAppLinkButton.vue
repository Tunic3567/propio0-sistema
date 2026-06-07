<template>
  <div class="relative inline-flex">
    <button
      type="button"
      class="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center shrink-0 rounded-lg transition-theme
             bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-700 dark:hover:bg-slate-600
             text-neutral-600 dark:text-slate-200
             border border-neutral-300 dark:border-slate-600
             focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-slate-500"
      :title="t('vendorHome.shareLinkAria')"
      :aria-label="t('vendorHome.shareLinkAria')"
      @click="compartirEnlacePrincipal"
    >
      <svg
        class="w-4 h-4 sm:w-5 sm:h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
    </button>
    <p
      v-if="mensajeCompartir"
      class="fixed bottom-4 left-1/2 z-[60] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg bg-neutral-900/90 dark:bg-slate-700/95 px-3 py-2 text-center text-xs font-medium text-white shadow-lg pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {{ mensajeCompartir }}
    </p>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useCompartirEnlace } from '@/composables/useCompartirEnlace.js'

const { t } = useI18n()
const { mensajeCompartir, compartirEnlacePrincipal } = useCompartirEnlace()
</script>

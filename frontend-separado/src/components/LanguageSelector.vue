<template>
  <div ref="menuContainer" class="relative">
    <!-- Botón del selector -->
    <button
      type="button"
      @click="toggleDropdown"
      class="flex items-center gap-1.5 sm:gap-2 h-9 min-h-9 sm:h-10 sm:min-h-10 px-2.5 sm:px-3 rounded-lg bg-neutral-100 dark:bg-slate-700 hover:bg-neutral-200 dark:hover:bg-slate-600 transition-theme border border-neutral-300 dark:border-slate-600"
      :class="{ 'bg-neutral-200 dark:bg-slate-600': isOpen }"
    >
      <span class="text-base sm:text-lg" :title="currentLanguageName">
        {{ currentLanguageFlag }}
      </span>
      <span class="hidden sm:inline text-base font-semibold text-neutral-700 dark:text-slate-200">
        {{ currentLanguageCode.toUpperCase() }}
      </span>
      <svg
        class="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Menú desplegable -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        role="menu"
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-exec border border-slate-200 dark:border-slate-600 z-50 overflow-hidden"
      >
        <div class="py-1">
          <button
            v-for="lang in languages"
            :key="lang.code"
            type="button"
            role="menuitem"
            @click="selectLanguage(lang.code)"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-theme"
            :class="{ 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 font-medium': currentLanguageCode === lang.code }"
          >
            <span class="text-xl">{{ lang.flag }}</span>
            <span class="flex-1 text-left">{{ lang.name }}</span>
            <svg
              v-if="currentLanguageCode === lang.code"
              class="w-4 h-4 text-neutral-600 dark:text-neutral-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const isOpen = ref(false)
const menuContainer = ref(null)

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

const currentLanguageCode = computed(() => locale.value)

const currentLanguage = computed(() => {
  return languages.find(lang => lang.code === locale.value) || languages[0]
})

const currentLanguageFlag = computed(() => currentLanguage.value.flag)
const currentLanguageName = computed(() => currentLanguage.value.name)

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => document.addEventListener('click', onClickFuera))
  } else {
    document.removeEventListener('click', onClickFuera)
  }
})

function onClickFuera(e) {
  if (menuContainer.value && !menuContainer.value.contains(e.target)) {
    isOpen.value = false
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectLanguage(langCode) {
  locale.value = langCode
  localStorage.setItem('app-locale', langCode)
  isOpen.value = false
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { locale: langCode } }))
}

</script>

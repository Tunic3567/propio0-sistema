<template>
  <div class="relative" ref="containerRef">
    <!-- Botón del selector -->
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
      :class="{ 'bg-gray-200 dark:bg-gray-700': isOpen }"
    >
      <!-- Bandera/Icono del idioma actual -->
      <span class="text-lg" :title="currentLanguageName">
        {{ currentLanguageFlag }}
      </span>
      <!-- Nombre del idioma (opcional, se puede ocultar en móviles) -->
      <span class="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ currentLanguageCode.toUpperCase() }}
      </span>
      <!-- Icono de flecha -->
      <svg 
        class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200"
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
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      >
        <div class="py-1">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="selectLanguage(lang.code)"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium': currentLanguageCode === lang.code }"
          >
            <span class="text-xl">{{ lang.flag }}</span>
            <span class="flex-1 text-left">{{ lang.name }}</span>
            <svg
              v-if="currentLanguageCode === lang.code"
              class="w-4 h-4 text-blue-600 dark:text-blue-400"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const isOpen = ref(false)
const containerRef = ref(null)

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

function toggleDropdown(event) {
  if (event) {
    event.stopPropagation()
  }
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function selectLanguage(langCode) {
  locale.value = langCode
  localStorage.setItem('app-locale', langCode)
  closeDropdown()
  
  // Disparar evento para que otros componentes se actualicen
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { locale: langCode } }))
}

// Cerrar al hacer clic fuera
function handleClickOutside(event) {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// Cerrar con ESC
function handleEscape(e) {
  if (e.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

onMounted(() => {
  // Usar setTimeout para evitar que se ejecute inmediatamente después del clic del botón
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>

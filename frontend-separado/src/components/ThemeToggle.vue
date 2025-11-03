<template>
  <button
    @click="toggleTheme"
    class="relative p-2 rounded-lg transition-all duration-300 ease-in-out
           bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
           text-gray-700 dark:text-gray-300
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
           shadow-sm hover:shadow-md"
    :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <!-- Icono de sol (modo claro) -->
    <svg
      v-if="!isDark"
      class="w-5 h-5 transition-all duration-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>

    <!-- Icono de luna (modo oscuro) -->
    <svg
      v-else
      class="w-5 h-5 transition-all duration-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>

    <!-- Indicador de animación -->
    <div
      class="absolute inset-0 rounded-lg transition-all duration-300
             bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0
             dark:opacity-20 dark:from-blue-400 dark:to-purple-500"
      :class="{ 'opacity-10': !isDark }"
    ></div>
  </button>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

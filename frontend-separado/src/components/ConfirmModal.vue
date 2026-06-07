<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <!-- Overlay con backdrop blur -->
      <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="cancel"></div>
      
      <!-- Modal con diseño mejorado -->
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 transform">
        <!-- Header con gradiente sutil -->
        <div class="flex items-center justify-between p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ title }}</h3>
          <button 
            @click="cancel"
            class="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Body con mejor espaciado -->
        <div class="p-6">
          <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ message }}</p>
        </div>
        
        <!-- Footer con botones estilizados -->
        <div class="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800 rounded-b-2xl">
          <button
            @click="cancel"
            class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            {{ cancelText }}
          </button>
          <button
            @click="confirm"
            class="px-5 py-2.5 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar acción'
  },
  message: {
    type: String,
    default: '¿Estás seguro?'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
}
</script>

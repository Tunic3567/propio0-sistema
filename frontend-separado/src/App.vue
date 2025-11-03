<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'

// Inicializar tema al cargar la aplicación
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>
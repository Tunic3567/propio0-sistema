<template>
  <div
    class="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden touch-pan-y bg-neutral-100 dark:bg-slate-900 text-neutral-800 dark:text-slate-100 transition-theme font-sans [overscroll-behavior-x:none]"
  >
    <div class="w-full min-w-0 max-w-full overflow-x-hidden">
      <router-view v-slot="{ Component, route: r }">
        <KeepAlive :include="keepAliveComponents">
          <component :is="Component" :key="r.name" />
        </KeepAlive>
      </router-view>
    </div>
    <ScrollToTopButton v-if="showScrollToTopFab" :target="appScrollRoot" />
    <ChatBot v-if="showScrollToTopFab" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from './composables/useTheme'
import { provideAppScrollRoot } from './composables/useAppScrollRoot'
import ScrollToTopButton from './components/ScrollToTopButton.vue'
import ChatBot from './components/ChatBot.vue'

const route = useRoute()
const appScrollRoot = ref(null)
provideAppScrollRoot(appScrollRoot)

/** Login / recuperación de contraseña: sin FAB */
const showScrollToTopFab = computed(() => route.meta.requiresAuth === true)

/** Componentes que se mantienen vivos al navegar fuera */
const keepAliveComponents = ['AdminDashboard', 'VendedorDashboard', 'ResumenAdmin']

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <button
    v-show="visible"
    type="button"
    class="fixed right-4 z-[9998] rounded-full border-2 border-neutral-300/90 dark:border-slate-600/80 bg-white/95 dark:bg-slate-800/95 text-neutral-800 dark:text-slate-100 shadow-lg backdrop-blur-md px-3 py-3 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    :style="{ bottom: `calc(1rem + env(safe-area-inset-bottom))` }"
    @click="scrollToTop"
    aria-label="Volver arriba"
    title="Volver arriba"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
    </svg>
  </button>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  /**
   * Contenedor con scroll interno (ref). Siempre se escucha también `window`
   * para páginas que desplazan el documento.
   */
  target: { type: Object, default: null },
  threshold: { type: Number, default: 320 }
})

const visible = ref(false)

function getWindowScroll() {
  return window.scrollY || document.documentElement.scrollTop || 0
}

function getScrollTop(el) {
  if (!el) return 0
  return el.scrollTop || 0
}

let raf = 0
let boundElement = null

function updateVisible() {
  const win = getWindowScroll()
  const inner = boundElement ? getScrollTop(boundElement) : 0
  visible.value = win > props.threshold || inner > props.threshold
}

function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    updateVisible()
  })
}

function bindElement(next) {
  if (boundElement) {
    boundElement.removeEventListener('scroll', onScroll)
  }
  boundElement = next || null
  if (boundElement) {
    boundElement.addEventListener('scroll', onScroll, { passive: true })
  }
  updateVisible()
}

const targetEl = computed(() => {
  const t = props.target
  if (t && typeof t === 'object' && 'value' in t) return t.value
  return t || null
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  bindElement(targetEl.value)
})

watch(targetEl, (next) => {
  bindElement(next)
})

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (boundElement) {
    try {
      boundElement.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      boundElement.scrollTop = 0
    }
  }
}

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('scroll', onScroll)
  if (boundElement) {
    boundElement.removeEventListener('scroll', onScroll)
    boundElement = null
  }
})
</script>

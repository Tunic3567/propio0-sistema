<template>
  <Transition name="scroll-fab">
    <button
      v-show="visibleTop"
      type="button"
      class="fixed right-6 z-[9998] rounded-full border-2 border-neutral-600/60 dark:border-slate-400/60 bg-neutral-900/95 dark:bg-neutral-800/95 text-white shadow-2xl hover:bg-black dark:hover:bg-neutral-700 hover:scale-110 hover:shadow-black/30 dark:hover:shadow-neutral-500/30 active:scale-95 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 w-12 h-12 flex items-center justify-center"
      :style="{ bottom: `calc(5.5rem + env(safe-area-inset-bottom))` }"
      @click="scrollToTop"
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  </Transition>
  <Transition name="scroll-fab">
    <button
      v-show="visibleBottom"
      type="button"
      class="fixed right-6 z-[9998] rounded-full border-2 border-neutral-600/60 dark:border-slate-400/60 bg-neutral-900/95 dark:bg-neutral-800/95 text-white shadow-2xl hover:bg-black dark:hover:bg-neutral-700 hover:scale-110 hover:shadow-black/30 dark:hover:shadow-neutral-500/30 active:scale-95 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 w-12 h-12 flex items-center justify-center"
      :style="{ bottom: `calc(1.5rem + env(safe-area-inset-bottom))` }"
      @click="scrollToBottom"
      aria-label="Ir abajo"
      title="Ir abajo"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </Transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  target: { type: Object, default: null },
  threshold: { type: Number, default: 320 }
})

const visibleTop = ref(false)
const visibleBottom = ref(false)

function getWindowScroll() {
  return window.scrollY || document.documentElement.scrollTop || 0
}

function getScrollTop(el) {
  if (!el) return 0
  return el.scrollTop || 0
}

function getScrollHeight(el) {
  if (!el) return 0
  return el.scrollHeight || 0
}

function getClientHeight(el) {
  if (!el) return 0
  return el.clientHeight || 0
}

let raf = 0
let boundElement = null

/** Retorna el elemento si realmente tiene overflow (scrollHeight > clientHeight). */
function getScrollableEl(el) {
  if (!el) return null
  return el.scrollHeight > el.clientHeight + 1 ? el : null
}

function updateVisible() {
  const win = getWindowScroll()
  const scrollEl = getScrollableEl(boundElement)
  const inner = scrollEl ? getScrollTop(scrollEl) : 0
  const scrollPos = Math.max(win, inner)
  visibleTop.value = scrollPos > props.threshold

  const el = scrollEl || document.documentElement
  const sh = getScrollHeight(el)
  const ch = getClientHeight(el)
  const maxScroll = sh - ch
  visibleBottom.value = maxScroll > 2 && scrollPos < maxScroll - 2
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

function scrollToBottom() {
  const scrollEl = getScrollableEl(boundElement)
  if (scrollEl) {
    const target = scrollEl.scrollHeight - scrollEl.clientHeight
    try {
      scrollEl.scrollTo({ top: target, behavior: 'smooth' })
    } catch {
      scrollEl.scrollTop = target
    }
  } else {
    const target = document.documentElement.scrollHeight - document.documentElement.clientHeight
    window.scrollTo({ top: target, behavior: 'smooth' })
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

<style scoped>
.scroll-fab-enter-active {
  transition: all 0.25s ease-out;
}
.scroll-fab-leave-active {
  transition: all 0.2s ease-in;
}
.scroll-fab-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.85);
}
.scroll-fab-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.9);
}
</style>

<template>
  <div ref="rootRef" class="relative shrink-0 md:hidden">
    <button
      type="button"
      class="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors text-neutral-600 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      title="Más opciones"
      aria-label="Más opciones"
      @click.stop="open = !open"
    >
      <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="5" cy="12" r="1.75"></circle>
        <circle cx="12" cy="12" r="1.75"></circle>
        <circle cx="19" cy="12" r="1.75"></circle>
      </svg>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-show="open"
        class="absolute right-0 top-full mt-1 z-[10101] min-w-[8rem] rounded-lg border-2 border-neutral-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl flex flex-col items-stretch"
        @click.stop
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const rootRef = ref(null)

function onDocClick(ev) {
  if (!open.value) return
  const root = rootRef.value
  if (root && root.contains(ev.target)) return
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

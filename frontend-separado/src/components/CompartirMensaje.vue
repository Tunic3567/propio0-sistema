<template>
  <div ref="rootRef" class="relative shrink-0">
    <button
      type="button"
      class="relative p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors text-neutral-600 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      title="Compartir mensaje"
      @click.stop="open = !open"
    >
      <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
        class="absolute right-0 top-full mt-1 z-[10101] min-w-[8rem] rounded-lg border-2 border-neutral-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl overflow-hidden"
        @click.stop
      >
        <button
          class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-800 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
          @click="enviar('es')"
        >
          <span class="text-base">🇪🇸</span> Español
        </button>
        <button
          class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-800 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
          @click="enviar('pt')"
        >
          <span class="text-base">🇧🇷</span> Português
        </button>
        <button
          class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-800 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
          @click="enviar('en')"
        >
          <span class="text-base">🇺🇸</span> English
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const rootRef = ref(null)

const mensajes = {
  es: 'Buen día, le recordamos que tiene un pago pendiente. Agradecemos su puntualidad para mantener su crédito al día. ¡Gracias!',
  pt: 'Bom dia, lembramos que você tem um pagamento pendente. Agradecemos sua pontualidade para manter seu crédito em dia. Obrigado!',
  en: 'Good morning, we remind you that you have a pending payment. We appreciate your punctuality to keep your credit up to date. Thank you!'
}

async function enviar(idioma) {
  open.value = false
  const msg = mensajes[idioma] || mensajes.es

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text: msg })
    } catch {
      // usuario canceló
    }
  } else {
    try {
      await navigator.clipboard.writeText(msg)
    } catch {
      // sin clipboard
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }
}

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

<template>
  <div
    v-if="visible"
    class="w-full transition-all duration-300"
    :class="barClass"
  >
      <div class="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-sm font-medium">
        <div class="flex items-center gap-2">
          <svg v-if="isOffline" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          </svg>
          <svg v-else-if="syncing" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ mensaje }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="pendientes > 0" class="text-xs opacity-80">
            {{ pendientes }} pendiente(s)
          </span>
          <button
            v-if="pendientes > 0 && !isOffline && !syncing"
            class="text-xs underline hover:no-underline opacity-80 hover:opacity-100"
            @click="$emit('sync')"
          >
            Sincronizar
          </button>
          <button
            class="text-lg leading-none opacity-60 hover:opacity-100 ml-2"
            @click="visible = false"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMutationCount } from '../utils/offlineMutationQueue.js'
import { getSyncStatus } from '../utils/syncEngine.js'

const emit = defineEmits(['sync'])

const isOffline = ref(typeof navigator !== 'undefined' && !navigator.onLine)
const syncing = ref(false)
const pendientes = ref(0)
const visible = ref(false)
const syncComplete = ref(false)

const barClass = computed(() => {
  if (syncing.value) return 'bg-blue-600 text-white'
  if (isOffline.value) return 'bg-amber-600 text-white'
  if (syncComplete.value) return 'bg-green-600 text-white'
  return 'bg-blue-600 text-white'
})

const mensaje = computed(() => {
  if (syncing.value) return 'Sincronizando...'
  if (isOffline.value) return 'Sin conexi\u00f3n'
  if (syncComplete.value) return 'Sincronizado'
  return 'Conectado'
})

let checkTimer = null

async function checkStatus() {
  const syncStatus = getSyncStatus()
  syncing.value = syncStatus.syncing
  try {
    pendientes.value = await getMutationCount()
  } catch {
    pendientes.value = 0
  }
  visible.value = isOffline.value || syncing.value || pendientes.value > 0
  if (!isOffline.value && !syncing.value && pendientes.value === 0) {
    if (syncComplete.value) {
      setTimeout(() => { syncComplete.value = false; visible.value = false }, 3000)
    } else {
      visible.value = false
    }
  }
}

function onOnline() {
  isOffline.value = false
  checkStatus()
}

function onOffline() {
  isOffline.value = true
  visible.value = true
  checkStatus()
}

function onSyncComplete() {
  syncComplete.value = true
  checkStatus()
}

function onMutationsChanged() {
  checkStatus()
}

onMounted(() => {
  checkStatus()
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  window.addEventListener('offline-sync-complete', onSyncComplete)
  window.addEventListener('offline-mutations-changed', onMutationsChanged)
  checkTimer = setInterval(checkStatus, 5000)
})

onUnmounted(() => {
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
  window.removeEventListener('offline-sync-complete', onSyncComplete)
  window.removeEventListener('offline-mutations-changed', onMutationsChanged)
  if (checkTimer) clearInterval(checkTimer)
})
</script>

<template>
  <div>
    <Teleport to="body">
      <div
        v-if="chatVisible"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="closeChat"></div>
        <div
          class="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-slate-600 flex flex-col overflow-hidden"
        >
          <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-slate-600 shrink-0">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-slate-100">{{ t('chatbot.title') }}</h3>
              <p class="text-xs text-neutral-500 dark:text-slate-400">{{ t('chatbot.subtitle') }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                v-if="mensajes.length > 0"
                @click="limpiarChat"
                class="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 text-neutral-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                :title="t('chatbot.clearChat')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                @click="closeChat"
                class="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 text-neutral-400 dark:text-slate-400 transition-colors"
                :title="t('chatbot.close') || t('common.close')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref="chatContainer"
            class="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[300px] max-h-[60vh] overscroll-contain"
          >
            <template v-if="mensajes.length === 0">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-slate-600 flex items-center justify-center text-lg shrink-0">
                  🤖
                </div>
                <div class="bg-neutral-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                  <p class="text-sm text-neutral-700 dark:text-slate-200">{{ t('chatbot.welcomeMessage') }}</p>
                </div>
              </div>
            </template>

            <div v-for="(msg, i) in mensajes" :key="i" class="flex items-start gap-3" :class="msg.rol === 'user' ? 'flex-row-reverse' : ''">
              <div
                v-if="msg.rol === 'bot'"
                class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-slate-600 flex items-center justify-center text-lg shrink-0"
              >
                🤖
              </div>
              <div
                class="rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed"
                :class="msg.rol === 'user'
                  ? 'bg-blue-500 text-white rounded-tr-sm'
                  : 'bg-neutral-100 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 rounded-tl-sm'"
              >
                {{ msg.texto }}
              </div>
            </div>

            <div v-if="loading" class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-slate-600 flex items-center justify-center text-lg shrink-0">
                🤖
              </div>
              <div class="bg-neutral-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div class="flex gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-neutral-400 dark:bg-slate-500 animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 rounded-full bg-neutral-400 dark:bg-slate-500 animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 rounded-full bg-neutral-400 dark:bg-slate-500 animate-bounce" style="animation-delay:300ms"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-neutral-200 dark:border-slate-600 px-4 py-3 shrink-0">
            <form @submit.prevent="enviar" class="flex gap-2">
              <input
                v-model="mensajeActual"
                type="text"
                :placeholder="t('chatbot.placeholder')"
                class="flex-1 px-4 py-2.5 border border-neutral-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm outline-none"
                :disabled="loading"
              />
              <button
                type="submit"
                :disabled="!mensajeActual.trim() || loading"
                class="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-300 dark:disabled:bg-slate-600 text-white disabled:text-neutral-500 dark:disabled:text-slate-400 transition-colors shrink-0"
              >
                <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { chatVisible, closeChat } from '../chatState.js'
import API_BASE_URL from '../config/api.js'

const { t } = useI18n()

const mensajes = ref(cargarHistorial())
const mensajeActual = ref('')
const loading = ref(false)
const chatContainer = ref(null)

watch(chatVisible, (val) => {
  if (val) nextTick(() => scrollToBottom())
})

function cargarHistorial() {
  try {
    return JSON.parse(localStorage.getItem('chatHistory')) || []
  } catch {
    return []
  }
}

function guardarHistorial() {
  localStorage.setItem('chatHistory', JSON.stringify(mensajes.value))
}

function limpiarChat() {
  mensajes.value = []
  localStorage.removeItem('chatHistory')
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function enviar() {
  const texto = mensajeActual.value.trim()
  if (!texto || loading.value) return
  mensajes.value.push({ rol: 'user', texto })
  mensajeActual.value = ''
  guardarHistorial()
  loading.value = true
  scrollToBottom()
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ mensaje: texto })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Error HTTP')
    }
    const data = await res.json()
    mensajes.value.push({ rol: 'bot', texto: data.respuesta })
  } catch (e) {
    mensajes.value.push({
      rol: 'bot',
      texto: t('chatbot.errorMessage')
    })
  }
  loading.value = false
  guardarHistorial()
  scrollToBottom()
}
</script>

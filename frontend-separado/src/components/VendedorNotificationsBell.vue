<template>
  <div ref="rootRef" class="relative shrink-0">
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirmText="confirmModal.confirmText"
      :cancelText="confirmModal.cancelText"
      @confirm="confirmModal.onConfirm?.()"
      @cancel="confirmModal.show = false"
    />
    <button
      type="button"
      class="relative p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors text-neutral-600 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      :aria-label="$t('admin.notifications.tooltip')"
      :title="$t('admin.notifications.tooltip')"
      @click.stop="toggleOpen"
    >
      <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white leading-none"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-show="open" class="fixed inset-0 z-[10100] pointer-events-none flex justify-end items-start pt-[calc(env(safe-area-inset-top,0px)+3.75rem)] pr-3 sm:pr-3">
          <div
            class="absolute inset-0 bg-black/40 sm:bg-transparent pointer-events-auto sm:pointer-events-none"
            aria-hidden="true"
            @click="open = false"
          ></div>
          <div
            ref="panelRef"
            class="relative z-10 w-[min(22rem,calc(100%-1.5rem))] max-w-[calc(100%-1.5rem)] max-h-[min(70dvh,28rem)] rounded-xl border-2 border-neutral-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl flex flex-col overflow-hidden pointer-events-auto"
            @click.stop
          >
        <div class="px-3 py-2 border-b border-neutral-200 dark:border-slate-600 shrink-0 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold text-neutral-900 dark:text-slate-100">{{ $t('admin.notifications.title') }}</span>
            <button
              type="button"
              class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40"
              :disabled="unreadCount === 0 || loading"
              @click.stop="marcarVisto"
            >
              {{ $t('admin.notifications.markRead') }}
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2 justify-between">
            <button
              type="button"
              class="text-xs font-medium rounded-md px-2 py-1 border border-neutral-300 dark:border-slate-600 text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700 disabled:opacity-40"
              :disabled="loading"
              @click.stop="toggleModoSeleccion"
            >
              {{ modoSeleccion ? $t('admin.notifications.doneSelecting') : $t('admin.notifications.select') }}
            </button>
            <div class="flex flex-wrap gap-1.5 justify-end">
              <button
                v-if="modoSeleccion"
                type="button"
                class="text-xs font-medium rounded-md px-2 py-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600"
                :disabled="seleccionados.length === 0 || deleting"
                @click.stop="eliminarSeleccionadas"
              >
                {{ $t('admin.notifications.deleteSelected', { n: seleccionados.length }) }}
              </button>
              <button
                type="button"
                class="text-xs font-medium rounded-md px-2 py-1 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40"
                :disabled="items.length === 0 || deleting"
                @click.stop="eliminarTodas"
              >
                {{ $t('admin.notifications.deleteAll') }}
              </button>
            </div>
          </div>
        </div>
        <div class="overflow-y-auto overscroll-contain flex-1 min-h-0 p-2 space-y-1.5">
          <p v-if="errorMsg" class="text-sm text-red-600 dark:text-red-400 px-2 py-2">
            {{ errorMsg }}
          </p>
          <p v-else-if="!loading && items.length === 0" class="text-sm text-neutral-500 dark:text-slate-400 px-2 py-6 text-center">
            {{ $t('admin.notifications.empty') }}
          </p>
          <template v-else>
            <div
              v-for="item in items"
              :key="item.id"
              role="button"
              tabindex="0"
              class="w-full text-left rounded-lg px-2 py-2 transition-colors hover:bg-neutral-100 dark:hover:bg-slate-700/80 border border-transparent hover:border-neutral-200 dark:hover:border-slate-600 cursor-pointer"
              :class="rowClass(item)"
              @click.stop="onRowClick(item)"
              @keydown.enter.prevent="onRowClick(item)"
            >
              <div class="flex gap-2 items-start">
                <input
                  v-if="modoSeleccion"
                  type="checkbox"
                  class="mt-0.5 rounded border-neutral-300 dark:border-slate-500 text-blue-600 focus:ring-blue-500 shrink-0"
                  :checked="estaSeleccionado(item.id)"
                  @click.stop
                  @change="toggleSeleccion(item)"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <span
                      class="text-xs font-semibold shrink-0"
                      :class="clientKindBadgeClass(item)"
                    >{{ kindLabel(item) }}</span>
                    <span class="text-[10px] text-neutral-400 dark:text-slate-500 tabular-nums whitespace-nowrap">{{ formatTime(item.at) }}</span>
                  </div>
                  <p class="text-xs text-neutral-600 dark:text-slate-300 mt-0.5 leading-snug">{{ detailLine(item) }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import API_BASE_URL from '../config/api.js'
import ConfirmModal from './ConfirmModal.vue'

const { t, locale } = useI18n()
const router = useRouter()

const open = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const items = ref([])
const notificacionesVistasHasta = ref(null)
const rootRef = ref(null)
const panelRef = ref(null)
const modoSeleccion = ref(false)
const seleccionados = ref([])
const deleting = ref(false)
const confirmModal = reactive({
  show: false,
  title: '',
  message: '',
  confirmText: 'Eliminar',
  cancelText: 'Cancelar',
  onConfirm: null
})

let pollTimer = null

function vendedorId() {
  return localStorage.getItem('vendedorId') || ''
}

const unreadCount = computed(() => {
  const hasta = notificacionesVistasHasta.value
  if (!hasta) return items.value.length
  const t0 = new Date(hasta).getTime()
  return items.value.filter((i) => new Date(i.at).getTime() > t0).length
})

function isUnread(item) {
  const hasta = notificacionesVistasHasta.value
  if (!hasta) return true
  return new Date(item.at).getTime() > new Date(hasta).getTime()
}

function rowClass(item) {
  const base = []
  if (isUnread(item)) {
    base.push('bg-blue-50/80 dark:bg-blue-950/30 ring-1 ring-blue-200/80 dark:ring-blue-900/50')
  }
  if (modoSeleccion.value && estaSeleccionado(item.id)) {
    base.push('ring-2 ring-blue-500 dark:ring-blue-400 border-blue-200 dark:border-blue-700')
  }
  return base.join(' ')
}

function estaSeleccionado(id) {
  return seleccionados.value.includes(id)
}

function toggleSeleccion(item) {
  const id = item.id
  const arr = seleccionados.value
  const ix = arr.indexOf(id)
  if (ix >= 0) arr.splice(ix, 1)
  else arr.push(id)
}

function toggleModoSeleccion() {
  modoSeleccion.value = !modoSeleccion.value
  if (!modoSeleccion.value) seleccionados.value = []
}

async function ocultarIds(ids) {
  const vid = vendedorId()
  if (!vid || !ids.length) return
  deleting.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendedor/notificaciones/ocultar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || t('admin.notifications.deleteError'))
      return
    }
    seleccionados.value = []
    modoSeleccion.value = false
    await cargar()
  } catch {
    alert(t('admin.notifications.deleteError'))
  } finally {
    deleting.value = false
  }
}

function mostrarConfirmacion(mensaje, onAceptar) {
  confirmModal.title = t('admin.notifications.confirmTitle') || 'Eliminar notificaciones'
  confirmModal.message = mensaje
  confirmModal.confirmText = t('common.delete') || 'Eliminar'
  confirmModal.cancelText = t('common.cancel') || 'Cancelar'
  confirmModal.onConfirm = () => {
    confirmModal.show = false
    onAceptar()
  }
  confirmModal.show = true
}

async function eliminarSeleccionadas() {
  if (seleccionados.value.length === 0) return
  mostrarConfirmacion(
    t('admin.notifications.confirmDeleteSelected', { n: seleccionados.value.length }),
    () => ocultarIds([...seleccionados.value])
  )
}

async function eliminarTodas() {
  if (items.value.length === 0) return
  mostrarConfirmacion(
    t('admin.notifications.confirmDeleteAll'),
    () => ocultarIds(items.value.map((i) => i.id))
  )
}

function formatMoney(n) {
  const x = Number(n) || 0
  const loc = (locale && locale.value) || 'es'
  const locNum = String(loc).startsWith('es') ? 'es-ES' : String(loc).startsWith('pt') ? 'pt-BR' : 'en-US'
  return x.toLocaleString(locNum, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(String(locale.value || 'es').startsWith('es') ? 'es-ES' : String(locale.value).startsWith('pt') ? 'pt-BR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  } catch {
    return ''
  }
}

function kindLabel(item) {
  if (item.tipo === 'edit' && item.kind === 'client') {
    const key = 'admin.notifications.kinds.clientEdit'
    const tr = t(key)
    return tr === key ? 'Modificación' : tr
  }
  const kind = item.kind
  if (kind === 'client') {
    const renewed = !!(item.payload && item.payload.renovado)
    const key = renewed ? 'admin.notifications.kinds.clientRenewed' : 'admin.notifications.kinds.clientNew'
    const tr = t(key)
    return tr === key ? (renewed ? 'Renovación' : 'Cliente nuevo') : tr
  }
  const key = `admin.notifications.kinds.${kind}`
  const tr = t(key)
  return tr === key ? kind : tr
}

function clientKindBadgeClass(item) {
  if (item.tipo === 'edit' && item.kind === 'client') return 'text-purple-700 dark:text-purple-300'
  if (item.kind !== 'client') return 'text-blue-700 dark:text-blue-300'
  return item.payload?.renovado
    ? 'text-amber-800 dark:text-amber-200'
    : 'text-blue-700 dark:text-blue-300'
}

function detailLine(item) {
  const p = item.payload || {}
  const editDesc = (p.editadoPorAdminDesc || '').trim()
  if (editDesc) {
    if (item.kind === 'client') {
      const nombre = `${String(p.nombres || '').trim()} ${String(p.apellidos || '').trim()}`.trim()
      const apodo = String(p.apodo || '').trim()
      const identidad = apodo ? `${nombre} (${apodo})` : nombre
      return `${identidad} · ${editDesc}`
    }
    return editDesc
  }
  if (item.kind === 'sale') {
    return t('admin.notifications.detailSale', {
      valor: formatMoney(p.valor),
      desc: p.descripcion ? ` · ${p.descripcion}` : ''
    })
  }
  if (item.kind === 'client') {
    const nombre = `${String(p.nombres || '').trim()} ${String(p.apellidos || '').trim()}`.trim()
    const apodo = String(p.apodo || '').trim()
    const key = p.renovado ? 'admin.notifications.detailClientRenewed' : 'admin.notifications.detailClientNew'
    return t(key, {
      name: nombre || '—',
      nick: apodo ? ` (${apodo})` : '',
      valor: formatMoney(p.valor)
    })
  }
  return ''
}

async function cargar() {
  const vid = vendedorId()
  if (!vid) return
  loading.value = true
  errorMsg.value = ''
  try {
    const u = `${API_BASE_URL}/api/vendedor/actividad-reciente?limit=45&days=14`
    const res = await fetch(u, { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      errorMsg.value = data.error || t('admin.notifications.error')
      items.value = []
      return
    }
    items.value = Array.isArray(data.items) ? data.items : []
    notificacionesVistasHasta.value = data.notificacionesVistasHasta || null
  } catch {
    errorMsg.value = t('admin.notifications.error')
    items.value = []
  } finally {
    loading.value = false
  }
}

async function marcarVisto() {
  const vid = vendedorId()
  if (!vid) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendedor/notificaciones/marcar-visto`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.notificacionesVistasHasta) {
      notificacionesVistasHasta.value = data.notificacionesVistasHasta
    } else if (res.ok) {
      notificacionesVistasHasta.value = new Date().toISOString()
    }
  } catch {
    /* silencioso */
  }
}

function toggleOpen() {
  open.value = !open.value
  if (open.value) cargar()
}

watch(open, (v) => {
  if (!v) {
    modoSeleccion.value = false
    seleccionados.value = []
  }
})

function onRowClick(item) {
  if (modoSeleccion.value) {
    toggleSeleccion(item)
    return
  }
  onItemClick(item)
}

function onItemClick(item) {
  open.value = false
  const p = item.payload || {}
  if (item.kind === 'sale') {
    router.push({
      path: '/vendedor/resumen',
      query: {
        vendedorId: p.vendedorId || undefined,
        rutaId: p.rutaId || undefined
      }
    })
    return
  }
  router.push({ path: '/vendedor' })
}

function onDocClick(ev) {
  if (!open.value) return
  const t = ev.target
  const root = rootRef.value
  const panel = panelRef.value
  if (root && root.contains(t)) return
  if (panel && panel.contains(t)) return
  open.value = false
}

onMounted(() => {
  cargar()
  pollTimer = window.setInterval(cargar, 90000)
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  document.removeEventListener('click', onDocClick)
})
</script>

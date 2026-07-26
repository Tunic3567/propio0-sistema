<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    <div class="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8 pb-16">
      <!-- Cabecera -->
      <header>
        <h1 class="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-slate-100 tracking-tight">
          {{ $t('admin.routesPageTitle') }}
        </h1>
      </header>

      <p v-if="errorMsg" class="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-800/80 rounded-xl px-4 py-3">
        {{ errorMsg }}
      </p>
      <p v-if="okMsg" class="text-sm text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-900/25 border border-green-200 dark:border-green-800/60 rounded-xl px-4 py-3">
        {{ okMsg }}
      </p>

      <!-- Ruta actual: solo asesores con recaudo abierto -->
        <section class="rounded-2xl border-2 border-neutral-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-md overflow-hidden">
          <div class="px-4 py-3 md:px-5 border-b border-neutral-200 dark:border-slate-600 bg-neutral-50/90 dark:bg-slate-800/90">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-slate-100">
              {{ $t('admin.currentRouteSection') }}
            </h2>
          </div>

          <div v-if="vendedores.length === 0" class="p-8 text-center text-neutral-500 dark:text-slate-400 border border-dashed border-neutral-200 dark:border-slate-600 rounded-xl mx-4 my-4 md:mx-5 md:my-5">
            {{ $t('admin.noVendors') }}
          </div>

          <div v-else-if="vendedoresConRutaAbierta.length === 0" class="p-8 text-center text-neutral-500 dark:text-slate-400 text-sm">
            {{ $t('admin.noOpenRouteNow') }}
          </div>

          <div v-else class="grid gap-4 md:gap-5 md:grid-cols-2 p-4 md:p-5">
            <article
              v-for="v in vendedoresConRutaAbierta"
              :key="v._id"
              :data-vendedor-id="v._id"
              class="rounded-2xl border-2 border-emerald-200/80 dark:border-emerald-800/50 bg-white dark:bg-slate-800 shadow-md overflow-hidden flex flex-col"
            >
              <div class="px-4 py-3 md:px-5 md:py-4 bg-gradient-to-r from-emerald-50/90 to-white dark:from-emerald-950/30 dark:to-slate-800/90 border-b border-neutral-200 dark:border-slate-600">
                <div class="font-semibold text-neutral-900 dark:text-slate-100 text-lg">{{ v.nombre }}</div>
                <div class="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                  {{ v.usuario }}
                  <span v-if="v.ciudad || v.pais" class="text-neutral-400 dark:text-slate-500"> · {{ [v.ciudad, v.pais].filter(Boolean).join(', ') }}</span>
                </div>
              </div>

              <div class="p-4 md:p-5 flex-1 flex flex-col gap-4">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200">
                    {{ $t('admin.routeStatusOpen') }}
                  </span>
                  <span class="text-xs text-neutral-500 dark:text-slate-400 flex items-center gap-1">
                    {{ formatFecha(rutaAbiertaPorVendedor(v._id).fechaApertura) }}
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      :title="$t('admin.editDates')"
                      @click.stop="abrirModalFechas(rutaAbiertaPorVendedor(v._id))"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </span>
                </div>
                <div class="mt-auto pt-2">
                  <button
                    type="button"
                    :disabled="accionando === v._id"
                    class="px-4 py-2.5 rounded-xl text-sm font-semibold bg-neutral-700 hover:bg-neutral-800 dark:bg-slate-600 dark:hover:bg-slate-500 disabled:opacity-50 text-white transition-colors w-full sm:w-auto"
                    @click="solicitarCerrarRuta(v._id)"
                  >
                    {{ accionando === v._id ? '…' : $t('route.close') }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Asesores sin ruta abierta: abrir / reabrir -->
        <section
          v-if="vendedores.length > 0 && vendedoresSinRutaAbierta.length > 0"
          class="rounded-2xl border-2 border-neutral-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-md overflow-hidden"
        >
          <div class="px-4 py-3 md:px-5 border-b border-neutral-200 dark:border-slate-600 bg-neutral-50/90 dark:bg-slate-800/90">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-slate-100">
              {{ $t('admin.advisorsNoOpenRoute') }}
            </h2>
          </div>

          <div class="grid gap-4 md:gap-5 md:grid-cols-2 p-4 md:p-5">
            <article
              v-for="v in vendedoresSinRutaAbierta"
              :key="v._id"
              :data-vendedor-id="v._id"
              class="rounded-2xl border-2 border-neutral-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-md overflow-hidden flex flex-col"
            >
              <div class="px-4 py-3 md:px-5 md:py-4 bg-gradient-to-r from-neutral-50 to-white dark:from-slate-800 dark:to-slate-800/90 border-b border-neutral-200 dark:border-slate-600">
                <div class="font-semibold text-neutral-900 dark:text-slate-100 text-lg">{{ v.nombre }}</div>
                <div class="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                  {{ v.usuario }}
                  <span v-if="v.ciudad || v.pais" class="text-neutral-400 dark:text-slate-500"> · {{ [v.ciudad, v.pais].filter(Boolean).join(', ') }}</span>
                </div>
              </div>

              <div class="p-4 md:p-5 flex-1 flex flex-col gap-4">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                    {{ $t('admin.routeStatusClosed') }}
                  </span>
                </div>

                <div v-if="ultimaRutaCerradaPorVendedor(v._id)" class="rounded-xl bg-neutral-50 dark:bg-slate-700/30 border border-neutral-200 dark:border-slate-600 px-3 py-2">
                  <div class="text-xs font-semibold text-neutral-600 dark:text-slate-300 uppercase tracking-wide mb-1">
                    {{ $t('admin.lastClosedRoute') }}
                  </div>
                  <div class="text-sm text-neutral-800 dark:text-slate-200 flex items-center gap-1">
                    {{ $t('admin.closedAt') }}: {{ formatFecha(ultimaRutaCerradaPorVendedor(v._id).fechaCierre) }}
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      :title="$t('admin.editDates')"
                      @click.stop="abrirModalFechas(ultimaRutaCerradaPorVendedor(v._id))"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p v-else class="text-sm text-neutral-500 dark:text-slate-400 italic">
                  {{ $t('admin.noClosedRouteToReopen') }}
                </p>

                <div class="flex flex-col sm:flex-row flex-wrap gap-2 mt-auto pt-1">
                  <button
                    type="button"
                    :disabled="accionando === v._id"
                    class="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-colors"
                    @click="abrirRuta(v._id)"
                  >
                    {{ accionando === v._id ? '…' : $t('admin.openNewRoute') }}
                  </button>
                  <button
                    type="button"
                    :disabled="accionando === v._id || !ultimaRutaCerradaPorVendedor(v._id)"
                    class="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-neutral-400 dark:border-slate-500 bg-white dark:bg-slate-700 text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-600 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                    @click="solicitarReabrirUltimaRuta(v._id)"
                  >
                    {{ accionando === v._id ? '…' : $t('admin.reopenLastRoute') }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
    </div>

    <ConfirmModal
      :show="!!(modalRuta && modalRuta.show)"
      :title="modalRutaTitle"
      :message="modalRutaMessage"
      :confirm-text="modalRutaConfirmText"
      :cancel-text="$t('common.cancel')"
      @confirm="confirmarModalRuta"
      @cancel="cerrarModalRuta"
    />

    <!-- Modal editar fechas -->
    <div
      v-if="modalFechas.show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="cerrarModalFechas"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <h3 class="text-lg font-bold text-neutral-900 dark:text-slate-100">{{ $t('admin.editRouteDatesTitle') }}</h3>
        <p class="text-sm text-neutral-500 dark:text-slate-400 mb-5">{{ modalFechas.vendedorNombre }}</p>

        <label class="block text-sm font-semibold text-neutral-700 dark:text-slate-300 mb-1">{{ $t('admin.openingDate') }}</label>
        <input
          type="datetime-local"
          v-model="modalFechas.fechaApertura"
          class="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <label class="block text-sm font-semibold text-neutral-700 dark:text-slate-300 mt-4 mb-1">{{ $t('admin.closingDate') }}</label>
        <input
          type="datetime-local"
          v-model="modalFechas.fechaCierre"
          class="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <p v-if="modalFechas.error" class="text-sm text-red-600 dark:text-red-400 mt-3">{{ modalFechas.error }}</p>

        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-neutral-400 dark:border-slate-500 bg-white dark:bg-slate-700 text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-600 transition-colors"
            @click="cerrarModalFechas"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="button"
            :disabled="guardandoFechas"
            class="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-colors"
            @click="guardarFechas"
          >
            {{ guardandoFechas ? '…' : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import API_BASE_URL from '../config/api.js'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const cargando = ref(true)
const rutas = ref([])
const vendedores = ref([])
const accionando = ref('')
const errorMsg = ref('')
const okMsg = ref('')
const modalRuta = reactive({
  show: false,
  action: '', // 'cerrar' | 'reabrir'
  vendedorId: ''
})

const modalFechas = reactive({
  show: false,
  rutaId: '',
  vendedorNombre: '',
  fechaApertura: '',
  fechaCierre: '',
  error: ''
})
const guardandoFechas = ref(false)

function dateToInput(d) {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function abrirModalFechas(ruta) {
  if (!ruta) return
  modalFechas.show = true
  modalFechas.rutaId = String(ruta._id)
  modalFechas.vendedorNombre = ruta.vendedor?.nombre || ''
  modalFechas.fechaApertura = dateToInput(ruta.fechaApertura)
  modalFechas.fechaCierre = dateToInput(ruta.fechaCierre)
  modalFechas.error = ''
}

function cerrarModalFechas() {
  modalFechas.show = false
  modalFechas.rutaId = ''
  modalFechas.vendedorNombre = ''
  modalFechas.fechaApertura = ''
  modalFechas.fechaCierre = ''
  modalFechas.error = ''
}

async function guardarFechas() {
  if (!modalFechas.rutaId || guardandoFechas.value) return
  if (!modalFechas.fechaApertura && !modalFechas.fechaCierre) {
    modalFechas.error = 'Debes ingresar al menos una fecha.'
    return
  }
  guardandoFechas.value = true
  modalFechas.error = ''
  try {
    const body = { codigoVinculacion: codigo() }
    if (modalFechas.fechaApertura) body.fechaApertura = new Date(modalFechas.fechaApertura).toISOString()
    if (modalFechas.fechaCierre) body.fechaCierre = new Date(modalFechas.fechaCierre).toISOString()
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas/${modalFechas.rutaId}/fechas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      modalFechas.error = data.error || t('admin.dateSaveError')
      return
    }
    cerrarModalFechas()
    okMsg.value = t('admin.routeDatesSaved') + '.'
    await cargar()
  } catch (e) {
    modalFechas.error = t('admin.dateSaveError')
  } finally {
    guardandoFechas.value = false
  }
}

const modalRutaTitle = computed(() => {
  if (modalRuta.action === 'reabrir') return t('admin.reopenLastRoute')
  if (modalRuta.action === 'cerrar') return t('route.close')
  return ''
})

const modalRutaMessage = computed(() => {
  if (modalRuta.action === 'reabrir') return '¿Reabrir la última ruta cerrada de este asesor?'
  if (modalRuta.action === 'cerrar') return '¿Cerrar la ruta actual de este asesor?'
  return ''
})

const modalRutaConfirmText = computed(() => {
  if (modalRuta.action === 'reabrir') return t('admin.reopenLastRoute')
  if (modalRuta.action === 'cerrar') return t('route.close')
  return t('common.confirm')
})
function codigo() {
  return localStorage.getItem('codigoVinculacion') || ''
}

function formatFecha(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
}

function rutaAbiertaPorVendedor(vendedorId) {
  return rutas.value.find(r => r.abierta && String(r.vendedor?._id || r.vendedor) === String(vendedorId))
}

const vendedoresConRutaAbierta = computed(() =>
  vendedores.value.filter((v) => !!rutaAbiertaPorVendedor(v._id))
)

const vendedoresSinRutaAbierta = computed(() =>
  vendedores.value.filter((v) => !rutaAbiertaPorVendedor(v._id))
)

/** Última ruta cerrada (por fecha de cierre) por asesor */
function ultimaRutaCerradaPorVendedor(vendedorId) {
  const list = rutas.value.filter(
    r =>
      !r.abierta &&
      r.fechaCierre &&
      String(r.vendedor?._id || r.vendedor) === String(vendedorId)
  )
  if (list.length === 0) return null
  return [...list].sort((a, b) => new Date(b.fechaCierre) - new Date(a.fechaCierre))[0]
}

function notificarVistasActualizadas() {
  try {
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
    window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
  } catch {}
}

async function cargar() {
  errorMsg.value = ''
  const c = codigo()
  if (!c) {
    rutas.value = []
    vendedores.value = []
    cargando.value = false
    return
  }
  try {
    const [rRes, vRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/rutas?codigoVinculacion=${encodeURIComponent(c)}`, { cache: 'no-store' }),
      fetch(`${API_BASE_URL}/api/admin/vendedores?codigoVinculacion=${encodeURIComponent(c)}`, { cache: 'no-store' })
    ])
    rutas.value = rRes.ok ? await rRes.json() : []
    vendedores.value = vRes.ok ? await vRes.json() : []
  } catch (e) {
    console.error(e)
    errorMsg.value = t('common.loadDataFailed')
  } finally {
    cargando.value = false
  }
}

async function abrirRuta(vendedorId) {
  okMsg.value = ''
  errorMsg.value = ''
  accionando.value = vendedorId
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas/abrir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoVinculacion: codigo(),
        vendedorId,
        timezone
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      errorMsg.value = data.msg || data.error || 'No se pudo abrir la ruta.'
      return
    }
    okMsg.value = t('route.opened') + '.'
    notificarVistasActualizadas()
    await cargar()
  } catch (e) {
    errorMsg.value = 'Error de red al abrir la ruta.'
  } finally {
    accionando.value = ''
  }
}

async function ejecutarReabrirUltimaRuta(vendedorId) {
  if (!ultimaRutaCerradaPorVendedor(vendedorId)) return
  okMsg.value = ''
  errorMsg.value = ''
  accionando.value = vendedorId
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas/reabrir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoVinculacion: codigo(),
        vendedorId
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      errorMsg.value = data.msg || data.error || 'No se pudo reabrir la ruta.'
      return
    }
    okMsg.value = t('admin.routeStatusOpen') + '.'
    notificarVistasActualizadas()
    await cargar()
  } catch (e) {
    errorMsg.value = 'Error de red al reabrir la ruta.'
  } finally {
    accionando.value = ''
  }
}

async function ejecutarCerrarRuta(vendedorId) {
  okMsg.value = ''
  errorMsg.value = ''
  accionando.value = vendedorId
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas/cerrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoVinculacion: codigo(), vendedorId })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      errorMsg.value = data.msg || data.error || 'No se pudo cerrar la ruta.'
      if (data.pendientes?.length) {
        errorMsg.value += ` (${data.pendientes.length} cliente(s) sin pago en la ruta).`
      }
      return
    }
    okMsg.value = t('route.closed') + '.'
    notificarVistasActualizadas()
    await cargar()
  } catch (e) {
    errorMsg.value = 'Error de red al cerrar la ruta.'
  } finally {
    accionando.value = ''
  }
}

function solicitarCerrarRuta(vendedorId) {
  modalRuta.action = 'cerrar'
  modalRuta.vendedorId = String(vendedorId || '')
  modalRuta.show = true
}

function solicitarReabrirUltimaRuta(vendedorId) {
  if (!ultimaRutaCerradaPorVendedor(vendedorId)) return
  modalRuta.action = 'reabrir'
  modalRuta.vendedorId = String(vendedorId || '')
  modalRuta.show = true
}

async function confirmarModalRuta() {
  const vid = modalRuta.vendedorId
  const action = modalRuta.action
  cerrarModalRuta()
  if (!vid) return
  if (action === 'reabrir') {
    await ejecutarReabrirUltimaRuta(vid)
    return
  }
  if (action === 'cerrar') {
    await ejecutarCerrarRuta(vid)
  }
}

function cerrarModalRuta() {
  modalRuta.show = false
  modalRuta.action = ''
  modalRuta.vendedorId = ''
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
  } catch {}
  router.replace('/')
}

/** Desde notificación u otra vista: resaltar la tarjeta del asesor dueño de la ruta. */
function scrollAVendedorPorRutaId(rutaId) {
  if (!rutaId) return
  nextTick(() => {
    const r = rutas.value.find((x) => String(x._id) === String(rutaId))
    const vid = r?.vendedor?._id || r?.vendedor
    if (!vid) return
    const el = document.querySelector(`article[data-vendedor-id="${String(vid)}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-neutral-100', 'dark:ring-offset-slate-900')
    window.setTimeout(() => {
      el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-neutral-100', 'dark:ring-offset-slate-900')
    }, 4000)
  })
}

onMounted(async () => {
  await cargar()
  const rid = route.query.rutaId
  if (rid) scrollAVendedorPorRutaId(String(rid))
})

watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (!oldPath || newPath === oldPath || route.path !== '/admin/rutas') return
    if (!String(oldPath).includes('/admin/rutas')) return
    await cargar()
    const rid = route.query.rutaId
    if (rid) scrollAVendedorPorRutaId(String(rid))
  }
)
</script>

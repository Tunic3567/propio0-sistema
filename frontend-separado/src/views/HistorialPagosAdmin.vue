<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    <div class="p-4 md:p-8">
      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-neutral-300 dark:border-gray-600 p-4 mb-4 transition-colors duration-300">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('admin.filterByRoute') }}</label>
            <select
              v-model="rutaFiltro"
              @change="onCambioRutaFiltro"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">{{ $t('admin.allRoutes') || 'Todas las rutas' }}</option>
              <option v-for="r in rutasListaFiltrada" :key="r._id" :value="r._id">{{ etiquetaRuta(r) }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('admin.filterPaymentsByAdvisor') }}</label>
            <select
              v-model="vendedorFiltro"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">{{ $t('admin.allVendors') }}</option>
              <option v-for="v in vendedores" :key="v._id" :value="v._id">{{ v.nombre }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de pagos -->
      <div>
        <div v-if="pagosFiltrados.length === 0" class="text-center py-8">
          <ReceiptRefundIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 text-lg">No se encontraron pagos</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm">Intenta ajustar los filtros</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="pago in pagosFiltrados"
            :key="pago._id"
            :data-pago-id="pago._id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-neutral-300 dark:border-gray-600 hover:shadow-md transition-all duration-300"
          >
            <div class="p-4">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <UserIcon class="w-5 h-5 text-gray-400 dark:text-gray-300" />
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      <template v-if="pago.cliente && (pago.cliente.nombres || pago.cliente.apellidos)">
                        {{ pago.cliente.nombres }} {{ pago.cliente.apellidos }}
                        <span v-if="pago.cliente.apodo" class="text-gray-500 dark:text-gray-300 font-normal">({{ pago.cliente.apodo }})</span>
                      </template>
                      <template v-else-if="pago.cliente && pago.cliente.apodo">{{ pago.cliente.apodo }}</template>
                      <template v-else>Cliente no encontrado</template>
                    </h3>
                  </div>
                  <div v-if="pago.ruta?.vendedor?.nombre" class="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <span class="font-medium text-gray-600 dark:text-gray-300">{{ $t('admin.vendors') }}:</span>
                    {{ pago.ruta.vendedor.nombre }}
                  </div>
                  <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <div v-if="pago.cliente?.celular" class="flex items-center gap-1">
                      <span>📱</span>
                      <a :href="`tel:${pago.cliente.celular}`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">{{ pago.cliente.celular }}</a>
                    </div>
                    <div v-if="pago.cliente?.direccion_residencial" class="flex items-center gap-1">
                      <span>🏠</span>
                      <span class="dark:text-gray-200">{{ resumirDireccion(pago.cliente.direccion_residencial) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col md:items-end gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getTipoPagoClass(pago.tipo)">{{ pago.tipo }}</span>
                    <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">${{ (pago.valor || 0).toFixed(2) }}</span>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex items-center gap-1">
                      <CalendarDaysIcon class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span>{{ formatFecha(pago.fecha) }}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn-primary-min mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm w-full sm:w-auto min-w-[10rem] shadow-sm"
                    @click="abrirEditarPago(pago)"
                  >
                    <PencilSquareIcon class="w-4 h-4 flex-shrink-0" />
                    {{ $t('client.editPayment') }}
                  </button>
                </div>
              </div>
              <div v-if="pago.observaciones" class="mt-3 pt-3 border-t border-[#1E293B]/15 dark:border-[#1E293B]/50">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <div class="flex-1">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Comentario:</span>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">{{ pago.observaciones }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal editar pago (misma lógica/UX que Pagos del vendedor: parcelas, abono, saldos) -->
      <div
        v-if="pagoEdit"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
        @click.self="pagoEdit = null"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl border-2 border-neutral-300 dark:border-gray-600 shadow-xl max-w-md w-full p-6 space-y-4 max-h-[min(90dvh,100%)] overflow-y-auto">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ $t('client.editPayment') }}</h3>
          <AdminPagoEditorForm :key="pagoEdit._id" ref="editorPagoRef" :pago="pagoEdit" />
          <p v-if="editError" class="text-sm text-red-600 dark:text-red-400">{{ editError }}</p>
          <div class="flex flex-wrap justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-slate-600">
            <button type="button" class="btn-outline-visible px-4 py-2.5 text-sm" @click="pagoEdit = null">{{ $t('common.cancel') }}</button>
            <button
              type="button"
              :disabled="guardandoEdit"
              class="btn-primary-min px-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              @click="guardarEdicionPago"
            >
              {{ guardandoEdit ? $t('payment.saving') : $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import AdminPagoEditorForm from '../components/AdminPagoEditorForm.vue'
import API_BASE_URL from '../config/api.js'
import {
  ReceiptRefundIcon,
  UserIcon,
  CalendarDaysIcon,
  PencilSquareIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const pagos = ref([])
const vendedores = ref([])
const vendedorFiltro = ref('')
const rutaFiltro = ref('')
const rutasLista = ref([])
const pagoEdit = ref(null)
const editorPagoRef = ref(null)
const editError = ref('')
const guardandoEdit = ref(false)

function idVendedorDePago(p) {
  return String(p.ruta?.vendedor?._id || p.ruta?.vendedor || '')
}

const rutasListaFiltrada = computed(() => {
  if (!vendedorFiltro.value) return rutasLista.value
  return rutasLista.value.filter((r) => String(r.vendedor?._id || r.vendedor) === String(vendedorFiltro.value))
})

const pagosFiltrados = computed(() => {
  let filtrados = [...pagos.value]
  if (vendedorFiltro.value) {
    const vid = String(vendedorFiltro.value)
    filtrados = filtrados.filter((p) => idVendedorDePago(p) === vid)
  }
  return filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

function etiquetaRuta(r) {
  const d = r.fechaApertura ? new Date(r.fechaApertura).toLocaleDateString('es-ES', { dateStyle: 'short' }) : ''
  const n = r.vendedor?.nombre || ''
  const est = r.abierta ? ' (abierta)' : ''
  return `${d} — ${n}${est}`
}

function getTipoPagoClass(tipo) {
  switch (tipo) {
    case 'Parcela': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Abono': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'No pago': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'No aplica': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function resumirDireccion(direccionCompleta) {
  if (!direccionCompleta) return ''
  const partes = direccionCompleta.split(',').map(p => p.trim())
  if (partes.length <= 3) return direccionCompleta
  if (partes[0].length > 50) return partes.slice(0, 2).join(', ')
  return partes.slice(0, 3).join(', ')
}

watch(vendedorFiltro, async () => {
  if (!rutaFiltro.value) return
  const ok = rutasListaFiltrada.value.some((r) => String(r._id) === String(rutaFiltro.value))
  if (!ok) {
    rutaFiltro.value = ''
    loading.value = true
    try {
      await cargarPagos()
    } finally {
      loading.value = false
    }
  }
})

async function cargarRutasLista() {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    if (!codigoVinculacion) {
      rutasLista.value = []
      return
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`, { cache: 'no-store' })
    rutasLista.value = res.ok ? await res.json() : []
  } catch (e) {
    rutasLista.value = []
  }
}

async function cargarPagosPorRuta(rutaId) {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    if (!codigoVinculacion || !rutaId) {
      pagos.value = []
      return
    }
    const res = await fetch(
      `${API_BASE_URL}/api/admin/rutas/${encodeURIComponent(rutaId)}/pagos?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`,
      { cache: 'no-store' }
    )
    pagos.value = res.ok ? await res.json() : []
  } catch (e) {
    console.error(e)
    pagos.value = []
  }
}

async function onCambioRutaFiltro() {
  loading.value = true
  try {
    if (rutaFiltro.value) await cargarPagosPorRuta(rutaFiltro.value)
    else await cargarPagos()
  } finally {
    loading.value = false
  }
}

function abrirEditarPago(pago) {
  editError.value = ''
  pagoEdit.value = pago
}

async function guardarEdicionPago() {
  if (!pagoEdit.value) return
  editError.value = ''
  const built = editorPagoRef.value?.construirBody?.()
  if (built?.error) {
    editError.value = built.error
    return
  }
  if (!built?.body) {
    editError.value = 'No se pudo preparar el pago.'
    return
  }
  const codigoVinculacion = localStorage.getItem('codigoVinculacion')
  if (!codigoVinculacion) {
    editError.value = 'Sesión sin código de vinculación.'
    return
  }
  guardandoEdit.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/pagos/${pagoEdit.value._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoVinculacion,
        ...built.body
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      editError.value = data.error || data.msg || 'No se pudo guardar.'
      return
    }
    try {
      window.dispatchEvent(new CustomEvent('pago-editado'))
      window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
      window.dispatchEvent(new CustomEvent('admin-resumen-actualizar'))
    } catch (_) {}
    pagoEdit.value = null
    if (rutaFiltro.value) await cargarPagosPorRuta(rutaFiltro.value)
    else await cargarPagos()
  } catch (e) {
    editError.value = 'Error de red.'
  } finally {
    guardandoEdit.value = false
  }
}

let adminListaPagosPromise = null

async function ejecutarCargaListaPagosAdmin() {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    if (!codigoVinculacion) {
      pagos.value = []
      return
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/pagos?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`, {
      cache: 'no-store'
    })
    pagos.value = res.ok ? await res.json() : []
  } catch (e) {
    console.error('Error al cargar pagos (admin):', e)
    pagos.value = []
  }
}

function cargarPagos() {
  if (!adminListaPagosPromise) {
    adminListaPagosPromise = ejecutarCargaListaPagosAdmin().finally(() => {
      adminListaPagosPromise = null
    })
  }
  return adminListaPagosPromise
}

async function cargarVendedores() {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    if (!codigoVinculacion) {
      vendedores.value = []
      return
    }
    const res = await fetch(`${API_BASE_URL}/api/vendedores?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`, { cache: 'no-store' })
    vendedores.value = res.ok ? await res.json() : []
  } catch (e) {
    console.error('Error al cargar asesores (admin pagos):', e)
    vendedores.value = []
  }
}

function scrollToPagoDestacado(pagoId) {
  if (!pagoId) return
  nextTick(() => {
    const el = document.querySelector(`[data-pago-id="${pagoId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-slate-900', 'rounded-lg')
    window.setTimeout(() => {
      el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-slate-900', 'rounded-lg')
    }, 4500)
  })
}

/** Refresco en segundo plano: cambios del vendedor en otro dispositivo no disparan CustomEvent aquí. */
const ADMIN_PAGOS_POLL_MS = 30000
let adminPagosPollTimer = null
async function refrescarPagosAdminSilencioso() {
  if (route.path !== '/admin/pagos') return
  try {
    if (rutaFiltro.value) await cargarPagosPorRuta(rutaFiltro.value)
    else await cargarPagos()
  } catch (_) {}
}
function onAdminPagosVisibility() {
  if (document.visibilityState === 'visible' && route.path === '/admin/pagos') {
    void refrescarPagosAdminSilencioso()
  }
}

async function aplicarQueryDesdeRuta() {
  if (route.path !== '/admin/pagos') return
  loading.value = true
  try {
    await Promise.all([cargarRutasLista(), cargarVendedores()])
    const rutaIdFromQuery = route.query.rutaId
    const clienteIdFromQuery = route.query.clienteId
    const pagoIdFromQuery = route.query.pagoId
    vendedorFiltro.value = ''
    if (rutaIdFromQuery) {
      rutaFiltro.value = String(rutaIdFromQuery)
      await cargarPagosPorRuta(rutaFiltro.value)
    } else {
      rutaFiltro.value = ''
      await cargarPagos()
    }
    if (clienteIdFromQuery) {
      const idc = String(clienteIdFromQuery)
      const p = pagos.value.find((x) => String(x.cliente?._id || x.cliente) === idc)
      const vid = p ? idVendedorDePago(p) : ''
      if (vid) vendedorFiltro.value = vid
    }
    if (pagoIdFromQuery) scrollToPagoDestacado(String(pagoIdFromQuery))
  } finally {
    loading.value = false
  }
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
  } catch {}
  try { router.replace('/') } catch { location.href = '/' }
}

onMounted(() => {
  void aplicarQueryDesdeRuta()
  adminPagosPollTimer = window.setInterval(() => {
    if (document.hidden || route.path !== '/admin/pagos') return
    void refrescarPagosAdminSilencioso()
  }, ADMIN_PAGOS_POLL_MS)
  document.addEventListener('visibilitychange', onAdminPagosVisibility)
})

onUnmounted(() => {
  if (adminPagosPollTimer) {
    clearInterval(adminPagosPollTimer)
    adminPagosPollTimer = null
  }
  document.removeEventListener('visibilitychange', onAdminPagosVisibility)
})

watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (!oldPath || newPath === oldPath || route.path !== '/admin/pagos') return
    if (!String(oldPath).includes('/admin/pagos')) return
    aplicarQueryDesdeRuta()
  }
)
</script>

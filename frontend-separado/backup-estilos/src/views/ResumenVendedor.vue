<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :actualizandoDatos="loading" :tituloSeccion="$t('nav.summary')" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 md:p-8">
      <div class="flex items-center justify-between mb-4" v-if="rutaAbierta || cargandoRuta">
        <!-- Título movido al header -->
      </div>
      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center mb-6 transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">{{ $t('route.closed') }}</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">{{ $t('common.mustOpenRoute') }}</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">{{ $t('route.open') }}</button>
      </div>

      <div v-if="rutaAbierta || cargandoRuta">
        <!-- Selector de ruta/historial -->
        <div class="mb-4 flex flex-wrap items-center gap-3" v-if="panel && panel?.rutasDisponibles?.length">
          <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ $t('history.routes') || 'Historial de rutas' }}:</label>
          <select
            v-model="rutaSeleccionadaId"
            @change="cargarPorRuta"
            class="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-2 border-blue-400 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-if="hayRutaAbierta" :value="''">{{ $t('route.current') || 'Ruta actual' }}</option>
            <option v-for="r in rutasOpciones" :key="r._id" :value="r._id" class="font-mono">
              {{ new Date(r.fechaApertura).toLocaleDateString('es-ES') }}{{ r.fechaCierre ? ' - ' + new Date(r.fechaCierre).toLocaleDateString('es-ES') : '' }}
            </option>
          </select>
        </div>
        <div v-if="loading" class="text-gray-500 dark:text-gray-400">{{ $t('common.loading') }}</div>
        <div v-else-if="!panel" class="text-gray-400 dark:text-gray-500">{{ $t('history.noData') }}</div>
      <div v-else class="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Debug: panel={{ !!panel }}, ruta={{ !!panel?.ruta }}, clientes={{ panel?.clientes?.length || 0 }}
      </div>
      <div v-else class="space-y-2">
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('route.openingDate') }}:</span>
          <span class="text-gray-700 dark:text-gray-300 text-base">
            <span v-if="panel.ruta?.fechaApertura" class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded font-mono">
              {{ new Date(panel.ruta.fechaApertura).toLocaleString('es-ES') }}
            </span>
            <span v-else>-</span>
          </span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <CalendarDaysIcon class="w-6 h-6 text-red-600" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('route.closingDate') }}:</span>
          <span class="text-gray-700 dark:text-gray-300 text-base">
            <span v-if="panel.ruta?.fechaCierre" class="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded font-mono">
              {{ new Date(panel.ruta.fechaCierre).toLocaleString('es-ES') }}
            </span>
            <span v-else class="italic">{{ $t('route.notClosed') }}</span>
          </span>
        </div>
        <div class="border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <div class="flex items-center gap-2 mb-2">
            <UsersIcon class="w-6 h-6 text-green-500" />
            <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.totalClients') }}:</span>
            <span class="text-gray-900 dark:text-gray-100 text-base font-bold">{{ panel.resumen?.total ?? 0 }}</span>
            <span class="text-gray-600 dark:text-gray-400 text-sm font-normal">
              ({{ panel.resumen?.clientesConPagosRegistrados ?? 0 }} {{ $t('summary.registered') }})
            </span>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-500 text-white dark:bg-green-600">
              {{ $t('summary.newClients') }}: {{ panel.resumen?.nuevos ?? 0 }}
            </span>
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-500 text-white dark:bg-blue-600">
              {{ $t('summary.renewedClients') }}: {{ panel.resumen?.renovados ?? 0 }}
            </span>
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white dark:bg-red-600">
              {{ $t('summary.cancelledClients') }}: {{ panel.resumen?.cancelados ?? 0 }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <WalletIcon class="w-6 h-6 text-indigo-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Cartera inicial:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ carteraInicialCalculada }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <BanknotesIcon class="w-6 h-6 text-yellow-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.initialCash') }}:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ cajaInicialCalculada }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <ChartBarIcon class="w-6 h-6 text-blue-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.expectedCollected') }}:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.recaudadoPretendido || 0).toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recaudo actual:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.recaudado || 0).toFixed(2) }}</span>
          <span class="ml-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono text-sm font-semibold">{{ porcentajeRecaudo }}%</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <ArrowTrendingUpIcon class="w-6 h-6 text-red-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.income') }}:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.ingresos || 0).toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <ShoppingCartIcon class="w-6 h-6 text-blue-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ventas:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.ventas || 0).toFixed(2) }}</span>
          <span v-if="interesesTotalesRuta > 0" class="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono text-sm font-semibold">
            {{ $t('summary.interests') }}: ${{ interesesTotalesRuta.toFixed(2) }}
          </span>
        </div>
        <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
          <ReceiptRefundIcon class="w-6 h-6 text-red-400" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.expenses') }}:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.egresos || 0).toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
          <ArrowTrendingDownIcon class="w-6 h-6 text-green-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.withdrawals') }}:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.retiros || 0).toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
          <BanknotesIcon class="w-6 h-6 text-green-700" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Caja final:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.cajaFinal || 0).toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
          <WalletIcon class="w-6 h-6 text-indigo-700" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Cartera final:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.carteraFinal || 0).toFixed(2) }}</span>
        </div>
      </div>
      </div>
    </div>
    
    <!-- Modal de confirmación para cerrar ruta -->
    <ConfirmModal
      :show="mostrarModalCerrarRuta"
      title="Cerrar ruta"
      message="¿Estás seguro de que deseas cerrar la ruta? Esta acción no se puede deshacer."
      confirmText="Cerrar ruta"
      cancelText="Cancelar"
      @confirm="confirmarCerrarRuta"
      @cancel="cancelarCerrarRuta"
    />
    
    <!-- Modal de advertencia: clientes pendientes -->
    <Teleport to="body">
      <div v-if="mostrarModalPendientes" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalPendientes = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200/50 dark:border-red-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold text-red-600 dark:text-red-400">{{ t('route.negativeCash') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{{ t('route.pendingClients') }}</p>
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 max-h-64 overflow-y-auto shadow-inner">
              <ul class="list-disc list-inside text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li v-for="(p, idx) in pendientesClientes" :key="p.id || idx" class="font-medium">{{ p.nombres }} {{ p.apellidos }}</li>
              </ul>
            </div>
            <div class="mt-6 flex justify-center">
              <button @click="mostrarModalPendientes = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">Entendido</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Modal de advertencia: caja final negativa -->
    <Teleport to="body">
      <div v-if="mostrarModalCajaNegativa" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalCajaNegativa = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200/50 dark:border-red-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold text-red-600 dark:text-red-400">{{ t('route.negativeCash') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{{ mensajeCajaNegativa }}</p>
            <div v-if="detallesCajaNegativa" class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 mb-4 shadow-inner">
              <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">{{ t('modal.details') }}:</p>
              <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.initialCash') }}:</span> <span class="font-bold">${{ detallesCajaNegativa.cajaInicial?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.income') }}:</span> <span class="font-bold text-red-600">${{ detallesCajaNegativa.ingresos?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.collected') }}:</span> <span class="font-bold text-green-600">${{ detallesCajaNegativa.recaudado?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.sales') }}:</span> <span class="font-bold text-blue-600">${{ detallesCajaNegativa.ventas?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.expenses') }}:</span> <span class="font-bold text-red-600">${{ detallesCajaNegativa.egresos?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.withdrawals') }}:</span> <span class="font-bold text-green-600">${{ detallesCajaNegativa.retiros?.toLocaleString() || '0.00' }}</span></li>
              </ul>
            </div>
            <div class="mt-6 flex justify-center">
              <button @click="mostrarModalCajaNegativa = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ t('common.understood') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Modal de confirmación para abrir ruta -->
    <ConfirmModal
      :show="mostrarModalAbrirRuta"
      title="Abrir ruta"
      message="¿Estás seguro de que deseas abrir la ruta? Esta acción no se puede deshacer."
      confirmText="Abrir ruta"
      cancelText="Cancelar"
      @confirm="confirmarAbrirRuta"
      @cancel="cancelarAbrirRuta"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import API_BASE_URL from '../config/api.js'

const { t } = useI18n()
import { 
  CalendarDaysIcon, 
  UsersIcon, 
  BanknotesIcon, 
  WalletIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ReceiptRefundIcon 
} from '@heroicons/vue/24/outline'

const router = useRouter()
const loading = ref(true)
const panel = ref(null)
const rutaSeleccionadaId = ref('')
const hayRutaAbierta = computed(() => !!panel.value?.ruta && panel.value?.ruta?.abierta)
const rutasOpciones = computed(() => {
  // Si hay ruta abierta, filtrar la que no tiene fechaCierre para evitar duplicado de "Ruta actual"
  const rutas = panel.value?.rutasDisponibles || []
  if (!rutas.length) return []
  if (hayRutaAbierta.value) {
    return rutas.filter(r => !!r.fechaCierre)
  }
  return rutas
})
const rutaAbierta = ref(true)
const mostrarModalCerrarRuta = ref(false)
const mostrarModalAbrirRuta = ref(false)
const mostrarModalPendientes = ref(false)
const pendientesClientes = ref([])
const mostrarModalCajaNegativa = ref(false)
const mensajeCajaNegativa = ref('')
const detallesCajaNegativa = ref(null)
let pollingInterval = null
// Intereses de ventas realizadas durante la ruta actual (entre fechaApertura y fechaCierre/ahora)
const interesesTotalesRuta = computed(() => {
  const ruta = panel.value?.ruta
  const clientes = panel.value?.clientes || []
  if (!ruta || !ruta.fechaApertura) return 0
  const inicio = new Date(ruta.fechaApertura).getTime()
  const fin = ruta.fechaCierre ? new Date(ruta.fechaCierre).getTime() : Date.now()
  const suma = clientes.reduce((acc, c) => {
    const created = c?.createdAt ? new Date(c.createdAt).getTime() : 0
    if (created >= inicio && created <= fin) {
      return acc + (Number(c.intereses) || 0)
    }
    return acc
  }, 0)
  return Math.round(suma * 100) / 100
})

// Cartera inicial ahora viene del backend (cartera final del día anterior)
const carteraInicialCalculada = computed(() => {
  const ruta = panel.value?.ruta || {}
  return (Number(ruta.carteraInicial) || 0).toFixed(2)
})

// Caja inicial ahora viene del backend (caja final del día anterior)
const cajaInicialCalculada = computed(() => {
  const ruta = panel.value?.ruta || {}
  return (Number(ruta.cajaInicial) || 0).toFixed(2)
})

const porcentajeRecaudo = computed(() => {
  const recaudado = Number(panel.value?.ruta?.recaudado) || 0
  const pretendido = Number(panel.value?.ruta?.recaudadoPretendido) || 0
  if (pretendido <= 0) return 0
  return Math.min(999, Math.round((recaudado / pretendido) * 100))
})

const clasePorcentajeRecaudo = computed(() => {
  const p = Number(porcentajeRecaudo.value) || 0
  if (p >= 100) return 'bg-green-100 text-green-700'
  if (p >= 80) return 'bg-emerald-100 text-emerald-700'
  if (p >= 50) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
})

function getValorClase(valor) {
  const n = Number(valor) || 0
  return n >= 0 ? 'text-green-700' : 'text-red-700'
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
  } catch {}
  try { router.replace('/') } catch { location.href = '/' }
}

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true
}

async function confirmarCerrarRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendedorId }) })
  if (res.ok) { 
    rutaAbierta.value = false
    mostrarModalCerrarRuta.value = false
    router.push('/vendedor') 
  } else {
    const errorData = await res.json().catch(() => null)
    mostrarModalCerrarRuta.value = false
    if (errorData?.error === 'RUTA_CON_CLIENTES_PENDIENTES') {
      pendientesClientes.value = (errorData.pendientes || [])
      mostrarModalPendientes.value = true
    } else if (errorData?.error === 'CAJA_FINAL_NEGATIVA') {
      mensajeCajaNegativa.value = errorData.msg || 'La caja final está en negativo.'
      detallesCajaNegativa.value = errorData.detalles || null
      mostrarModalCajaNegativa.value = true
    } else {
      alert(errorData?.msg || errorData?.error || 'No se pudo cerrar la ruta')
    }
  }
}

function cancelarCerrarRuta() {
  mostrarModalCerrarRuta.value = false
}

function abrirRuta() {
  mostrarModalAbrirRuta.value = true
}

async function confirmarAbrirRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendedorId }) })
  if (res.ok) { 
    rutaAbierta.value = true
    mostrarModalAbrirRuta.value = false
    // Limpiar la selección de ruta para que cargue la nueva ruta abierta
    rutaSeleccionadaId.value = ''
    // Disparar evento para actualizar el resumen
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
    // Recargar el panel inmediatamente
    await cargarPanel(vendedorId)
    router.push('/vendedor') 
  } else { 
    alert('No se pudo abrir la ruta') 
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false
}

onMounted(async () => {
  loading.value = true
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) { router.push('/'); return }
  
  // Cargar datos iniciales
  await cargarPanel(vendedorId)
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('cliente-creado', actualizarResumen)
  window.addEventListener('cliente-eliminado', actualizarResumen)
  window.addEventListener('pago-registrado', actualizarResumen)
  window.addEventListener('pago-editado', actualizarResumen)
  window.addEventListener('ingreso-registrado', actualizarResumen)
  window.addEventListener('egreso-registrado', actualizarResumen)
  window.addEventListener('ruta-cerrada', actualizarResumen)
  window.addEventListener('ruta-abierta', actualizarResumen)
  
  loading.value = false
})

// Función para cargar el panel
async function cargarPanel(vendedorId) {
  try {
    const url = new URL(`${API_BASE_URL}/api/vendedores/${vendedorId}/panel`)
    if (rutaSeleccionadaId.value) {
      url.searchParams.set('rutaId', rutaSeleccionadaId.value)
    }
    const res = await fetch(url)
    if (res.ok) {
      panel.value = await res.json()
      } else {
      console.error('Error en la respuesta:', res.statusText)
      panel.value = null
    }
  } catch (error) {
    console.error('Error al cargar panel:', error)
    panel.value = null
  }
}

function cargarPorRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) return
  cargarPanel(vendedorId)
}

function navegarRuta(delta) {
  const rutas = panel.value?.rutasDisponibles || []
  if (!rutas.length) return
  const currentIndex = rutas.findIndex(r => r._id === rutaSeleccionadaId.value)
  let nextIndex = currentIndex + delta
  if (currentIndex === -1) nextIndex = delta < 0 ? rutas.length - 1 : 0
  if (nextIndex < 0) nextIndex = rutas.length - 1
  if (nextIndex >= rutas.length) nextIndex = 0
  rutaSeleccionadaId.value = rutas[nextIndex]?._id || ''
  cargarPorRuta()
}

// Función para actualizar resumen cuando sea necesario
function actualizarResumen() {
  const vendedorId = localStorage.getItem('vendedorId')
  if (vendedorId) {
    cargarPanel(vendedorId)
  }
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('cliente-creado', actualizarResumen)
  window.removeEventListener('cliente-eliminado', actualizarResumen)
  window.removeEventListener('pago-registrado', actualizarResumen)
  window.removeEventListener('pago-editado', actualizarResumen)
  window.removeEventListener('ingreso-registrado', actualizarResumen)
  window.removeEventListener('egreso-registrado', actualizarResumen)
  window.removeEventListener('ruta-cerrada', actualizarResumen)
  window.removeEventListener('ruta-abierta', actualizarResumen)
})

</script>

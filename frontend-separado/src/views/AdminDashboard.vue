<template>
  <div class="min-h-screen bg-gray-100">
    <NavbarAdmin @logout="logout" />
    <div class="flex flex-col md:flex-row h-[calc(100vh-64px)]"> <!-- 64px es la altura de la navbar -->
      <!-- Menú lateral izquierdo -->
      <div class="w-full md:w-64 bg-white h-auto md:h-full flex flex-col justify-between flex-shrink-0 md:border-r border-gray-200 overflow-y-auto">
        <div class="px-4 md:pl-6 pt-4 md:pt-6 flex flex-col gap-4">
          <!-- Menú desplegable de rutas con iconos -->
          <div class="flex flex-col gap-3">
            <button @click="mostrarPais = !mostrarPais" class="flex items-center text-lg font-semibold focus:outline-none gap-2">
              <GlobeAltIcon class="w-6 h-6 text-blue-500" />
              País
              <ChevronDownIcon :class="{'transform rotate-180': mostrarPais}" class="w-4 h-4 ml-2 transition-transform" />
            </button>
            <div v-if="mostrarPais" class="ml-6 mt-1 flex flex-col gap-2">
              <button @click="mostrarCiudad = !mostrarCiudad" class="flex items-center text-base font-medium focus:outline-none gap-2">
                <BuildingOffice2Icon class="w-6 h-6 text-green-500" />
                Ciudad
                <ChevronDownIcon :class="{'transform rotate-180': mostrarCiudad}" class="w-4 h-4 ml-2 transition-transform" />
              </button>
              <div v-if="mostrarCiudad" class="ml-8 mt-1 flex flex-col gap-2">
                <div v-if="vendedores.length > 0">
                  <div v-for="(v, idx) in vendedores" :key="idx" class="py-1 cursor-pointer hover:underline flex items-center gap-2 pr-2" @click="seleccionarVendedor(v)">
                    <UserIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span class="truncate">{{ v.nombre }}</span>
                  </div>
                </div>
                <div v-else class="text-gray-500 italic">No hay vendedores registrados.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Panel lateral derecho de información del vendedor -->
      <div class="flex-1 bg-gray-100 h-full p-4 md:p-8 md:border-l border-gray-200 overflow-y-auto">
        <transition name="fade">
          <div v-if="vendedorSeleccionado">
            <div class="flex justify-end gap-2">
              <button @click="actualizarPanel" class="text-gray-400 hover:text-blue-500" title="Actualizar">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.974 7.974 0 0112 4c2.042 0 3.899.767 5.318 2.018M18.418 15A7.974 7.974 0 0112 20a7.974 7.974 0 01-5.318-2.018" />
                </svg>
              </button>
              <button @click="vendedorSeleccionado = null" class="text-gray-400 hover:text-red-500">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
            <h2 class="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
              <UserIcon class="w-6 h-6 text-blue-500" />
              {{ resumenPanel?.vendedor?.nombre || vendedorSeleccionado.nombre }}
            </h2>
            <!-- Selector de historial de rutas por vendedor -->
            <div v-if="resumenPanel && (resumenPanel?.rutasDisponibles?.length || 0) > 0" class="mb-3 flex flex-wrap items-center gap-3">
              <label class="text-sm font-semibold text-gray-800">Historial de rutas:</label>
              <select v-model="rutaSeleccionadaId" @change="cargarPorRuta" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option :value="''">Ruta actual</option>
                <option v-for="r in resumenPanel.rutasDisponibles" :key="r._id" :value="r._id" class="font-mono">
                  {{ new Date(r.fechaApertura).toLocaleDateString('es-ES') }}{{ r.fechaCierre ? ' - ' + new Date(r.fechaCierre).toLocaleDateString('es-ES') : '' }}
                </option>
              </select>
              <button @click="navegarRuta(-1)" class="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100">◀</button>
              <button @click="navegarRuta(1)" class="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100">▶</button>
            </div>

            <div v-if="resumenPanel" class="space-y-2">
              <!-- Fecha apertura -->
              <div class="flex items-center gap-2 border-b-2 border-gray-300 pb-2 mb-2">
                <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
                <span class="font-semibold text-gray-900 text-sm">Fecha apertura recaudo:</span>
                <span class="text-gray-800 text-sm font-medium">
                  <span v-if="resumenPanel.ruta?.fechaApertura" class="bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono">
                    {{ new Date(resumenPanel.ruta.fechaApertura).toLocaleString('es-ES') }}
                  </span>
                  <span v-else>-</span>
                </span>
              </div>
              <!-- Fecha cierre -->
              <div class="flex items-center gap-2 border-b-2 border-gray-300 pb-2 mb-2">
                <CalendarDaysIcon class="w-6 h-6 text-red-600" />
                <span class="font-semibold text-gray-900 text-sm">Fecha cierre:</span>
                <span class="text-gray-800 text-sm font-medium">
                  <span v-if="resumenPanel.ruta?.fechaCierre" class="bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono">
                    {{ new Date(resumenPanel.ruta.fechaCierre).toLocaleString('es-ES') }}
                  </span>
                  <span v-else class="italic">No se ha cerrado</span>
                </span>
              </div>
              <!-- Clientes totales -->
              <div class="border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
                <div class="flex items-center gap-2 mb-2">
                  <UsersIcon class="w-6 h-6 text-green-500" />
                  <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Total Clientes:</span>
                  <span class="text-gray-900 dark:text-gray-100 text-base font-bold">{{ resumenPanel.clientes?.length ?? 0 }}</span>
                </div>
                <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-500 text-white dark:bg-green-600">
                    Nuevos: {{ resumenPanel.resumen?.nuevos ?? 0 }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-500 text-white dark:bg-blue-600">
                    Renovados: {{ resumenPanel.resumen?.renovados ?? 0 }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white dark:bg-red-600">
                    Cancelados: {{ resumenPanel.resumen?.cancelados ?? 0 }}
                  </span>
                </div>
              </div>
              <!-- Cartera inicial -->
              <div class="flex items-center gap-2 border-b-2 border-gray-300 pb-2 mb-2">
                <WalletIcon class="w-6 h-6 text-indigo-500" />
                <span class="font-semibold text-gray-900 text-sm">Cartera inicial:</span>
                <span class="text-gray-900 text-base font-bold">${{ carteraInicialCalculada }}</span>
              </div>
              <!-- Caja inicial -->
              <div class="flex items-center gap-2 border-b-2 border-gray-300 pb-2 mb-2">
                <BanknotesIcon class="w-6 h-6 text-yellow-500" />
                <span class="font-semibold text-gray-900 text-sm">Caja inicial:</span>
                <span class="text-gray-900 text-base font-bold">${{ cajaInicialCalculada }}</span>
              </div>
              <!-- Recaudo pretendido -->
              <div class="flex items-center gap-2 border-b-2 border-gray-300 pb-2 mb-2">
                <ChartBarIcon class="w-6 h-6 text-blue-500" />
                <span class="font-semibold text-gray-900 text-sm">Recaudo pretendido del día:</span>
                <span class="text-gray-900 text-base font-bold">${{ (resumenPanel.ruta?.recaudadoPretendido || 0).toFixed(2) }}</span>
              </div>
              <!-- Recaudo actual (+ %) -->
              <div class="flex items-center gap-2 border-b-2 border-gray-300 pb-2 mb-2">
                <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
                <span class="font-semibold text-gray-900 text-sm">Recaudo actual:</span>
                <span class="text-gray-900 text-base font-bold">${{ (resumenPanel.ruta?.recaudado || 0).toFixed(2) }}</span>
                <span class="ml-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono text-sm font-semibold">{{ porcentajeRecaudo }}%</span>
              </div>
              <!-- Ingresos -->
              <div class="flex items-center gap-2 border-b-2 border-gray-300 pb-2 mb-2">
                <ArrowTrendingUpIcon class="w-6 h-6 text-green-500" />
                <span class="font-semibold text-gray-900 text-sm">Ingresos:</span>
                <span class="text-gray-900 text-base font-bold">${{ (resumenPanel.ruta?.ingresos || 0).toFixed(2) }}</span>
              </div>
              <!-- Ventas + Intereses -->
              <div class="flex items-center gap-2 border-b border-gray-200 pb-2 mb-2">
                <ShoppingCartIcon class="w-6 h-6 text-blue-500" />
                <span class="font-semibold text-gray-900 text-sm">Ventas:</span>
                <span class="text-gray-900 text-base font-bold">${{ (resumenPanel.ruta?.ventas || 0).toFixed(2) }}</span>
                <span v-if="interesesTotalesRuta > 0" class="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono text-sm font-semibold">
                  Intereses: ${{ interesesTotalesRuta.toFixed(2) }}
                </span>
              </div>
              <!-- Egresos -->
              <div class="flex items-center gap-2 border-b border-gray-200 pb-2 mb-2">
                <ReceiptRefundIcon class="w-6 h-6 text-red-400" />
                <span class="font-semibold text-gray-900 text-sm">Egresos:</span>
                <span class="text-gray-900 text-base font-bold">${{ (resumenPanel.ruta?.egresos || 0).toFixed(2) }}</span>
              </div>
              <!-- Retiros -->
              <div class="flex items-center gap-2">
                <ArrowTrendingDownIcon class="w-6 h-6 text-red-500" />
                <span class="font-semibold text-gray-900 text-sm">Retiros:</span>
                <span class="text-gray-900 text-base font-bold">${{ (resumenPanel.ruta?.retiros || 0).toFixed(2) }}</span>
              </div>
              <!-- Caja final -->
              <div class="flex items-center gap-2">
                <BanknotesIcon class="w-6 h-6 text-green-700" />
                <span class="font-semibold text-gray-900 text-sm">Caja final:</span>
                <span class="text-gray-900 text-base font-bold">${{ (resumenPanel.ruta?.cajaFinal || 0).toFixed(2) }}</span>
              </div>
              <!-- Cartera final -->
              <div class="flex items-center gap-2">
                <WalletIcon class="w-6 h-6 text-indigo-700" />
                <span class="font-semibold text-gray-900 text-sm">Cartera final:</span>
                <span class="text-gray-900 text-base font-bold">${{ (resumenPanel.ruta?.carteraFinal || 0).toFixed(2) }}</span>
              </div>
            </div>
            <div v-else class="text-gray-400">Cargando información...</div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import API_BASE_URL from '../config/api.js'
import { 
  GlobeAltIcon, 
  BuildingOffice2Icon, 
  UserIcon, 
  ArrowLeftOnRectangleIcon, 
  ChevronDownIcon, 
  XMarkIcon, 
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
import NavbarAdmin from '../components/NavbarAdmin.vue'

const router = useRouter()
const mostrarPais = ref(false)
const mostrarCiudad = ref(false)
const vendedores = ref([])
const vendedorSeleccionado = ref(null)
const resumenPanel = ref(null)
const rutaSeleccionadaId = ref('')
// Intereses SOLO de ventas creadas dentro del rango de la ruta del panel seleccionado
const interesesTotalesRuta = computed(() => {
  const ruta = resumenPanel.value?.ruta
  const clientes = resumenPanel.value?.clientes || []
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
  const ruta = resumenPanel.value?.ruta || {}
  return (Number(ruta.carteraInicial) || 0).toFixed(2)
})

// Caja inicial ahora viene del backend (caja final del día anterior)
const cajaInicialCalculada = computed(() => {
  const ruta = resumenPanel.value?.ruta || {}
  return (Number(ruta.cajaInicial) || 0).toFixed(2)
})

// Porcentaje de recaudo respecto al pretendido del día
const porcentajeRecaudo = computed(() => {
  const recaudado = Number(resumenPanel.value?.ruta?.recaudado) || 0
  const pretendido = Number(resumenPanel.value?.ruta?.recaudadoPretendido) || 0
  if (pretendido <= 0) return 0
  return Math.min(999, Math.round((recaudado / pretendido) * 100))
})

// Badge de color para el porcentaje
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

// Cargar vendedores al montar
onMounted(async () => {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    if (!codigoVinculacion) {
      console.error('No se encontró código de vinculación')
      return
    }
    const resVend = await fetch(`${API_BASE_URL}/api/vendedores?codigoVinculacion=${codigoVinculacion}`)
    vendedores.value = resVend.ok ? await resVend.json() : []
  } catch (e) {
    console.error('Error al cargar vendedores:', e)
    vendedores.value = []
  }
})

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
  } catch (e) {
    console.warn('No se pudo limpiar storage:', e)
  }
  try {
    router.replace('/')
    setTimeout(() => {
      if (location.hash && !location.hash.endsWith('#/')) {
        location.href = '/'
      }
    }, 150)
  } catch (e) {
    location.href = '/'
  }
}

async function seleccionarVendedor(v) {
  vendedorSeleccionado.value = { ...v }
  resumenPanel.value = null
  try {
    console.log('Cargando panel para vendedor:', v._id)
    const url = new URL(`${API_BASE_URL}/api/vendedores/${v._id}/panel`)
    if (rutaSeleccionadaId.value) url.searchParams.set('rutaId', rutaSeleccionadaId.value)
    const res = await fetch(url)
    console.log('Respuesta del servidor:', res.status, res.ok)
    if (res.ok) {
      resumenPanel.value = await res.json()
      console.log('Datos del panel cargados:', resumenPanel.value)
    } else {
      console.error('Error en la respuesta:', res.statusText)
      resumenPanel.value = null
    }
  } catch (e) {
    console.error('Error al cargar panel:', e)
    resumenPanel.value = null
  }
}

async function actualizarPanel() {
  if (!vendedorSeleccionado.value) return;
  resumenPanel.value = null;
  try {
    const url = new URL(`${API_BASE_URL}/api/vendedores/${vendedorSeleccionado.value._id}/panel`)
    if (rutaSeleccionadaId.value) url.searchParams.set('rutaId', rutaSeleccionadaId.value)
    const res = await fetch(url)
    resumenPanel.value = await res.json()
  } catch (e) {
    resumenPanel.value = null
  }
}

function cargarPorRuta() {
  if (!vendedorSeleccionado.value) return
  actualizarPanel()
}

function navegarRuta(delta) {
  const rutas = resumenPanel.value?.rutasDisponibles || []
  if (!rutas.length) return
  const currentIndex = rutas.findIndex(r => r._id === rutaSeleccionadaId.value)
  let nextIndex = currentIndex + delta
  if (currentIndex === -1) nextIndex = delta < 0 ? rutas.length - 1 : 0
  if (nextIndex < 0) nextIndex = rutas.length - 1
  if (nextIndex >= rutas.length) nextIndex = 0
  rutaSeleccionadaId.value = rutas[nextIndex]?._id || ''
  actualizarPanel()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :actualizandoDatos="loading" tituloSeccion="Resumen" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 md:p-8">
      <div class="flex items-center justify-between mb-4" v-if="rutaAbierta || cargandoRuta">
        <!-- Título movido al header -->
      </div>
      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center mb-6 transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">Ruta cerrada</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">Para continuar, debes abrir una ruta.</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">Abrir ruta</button>
      </div>

      <div v-if="rutaAbierta || cargandoRuta">
        <!-- Selector de ruta/historial -->
        <div class="mb-4 flex flex-wrap items-center gap-3" v-if="panel && panel?.rutasDisponibles?.length">
          <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Historial de rutas:</label>
          <select
            v-model="rutaSeleccionadaId"
            @change="cargarPorRuta"
            class="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-2 border-blue-400 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-if="hayRutaAbierta" :value="''">Ruta actual</option>
            <option v-for="r in rutasOpciones" :key="r._id" :value="r._id" class="font-mono">
              {{ new Date(r.fechaApertura).toLocaleDateString('es-ES') }}{{ r.fechaCierre ? ' - ' + new Date(r.fechaCierre).toLocaleDateString('es-ES') : '' }}
            </option>
          </select>
        </div>
        <div v-if="loading" class="text-gray-500 dark:text-gray-400">Cargando...</div>
        <div v-else-if="!panel" class="text-gray-400 dark:text-gray-500">Sin datos disponibles.</div>
      <div v-else class="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Debug: panel={{ !!panel }}, ruta={{ !!panel?.ruta }}, clientes={{ panel?.clientes?.length || 0 }}
      </div>
      <div v-else class="space-y-2">
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Fecha apertura recaudo:</span>
          <span class="text-gray-700 dark:text-gray-300 text-base">
            <span v-if="panel.ruta?.fechaApertura" class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded font-mono">
              {{ new Date(panel.ruta.fechaApertura).toLocaleString('es-ES') }}
            </span>
            <span v-else>-</span>
          </span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <CalendarDaysIcon class="w-6 h-6 text-red-600" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Fecha cierre:</span>
          <span class="text-gray-700 dark:text-gray-300 text-base">
            <span v-if="panel.ruta?.fechaCierre" class="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded font-mono">
              {{ new Date(panel.ruta.fechaCierre).toLocaleString('es-ES') }}
            </span>
            <span v-else class="italic">No se ha cerrado</span>
          </span>
        </div>
        <div class="border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <div class="flex items-center gap-2 mb-2">
            <UsersIcon class="w-6 h-6 text-green-500" />
            <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Total Clientes:</span>
            <span class="text-gray-900 dark:text-gray-100 text-base font-bold">{{ panel.resumen?.total ?? 0 }}</span>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-500 text-white dark:bg-green-600">
              Nuevos: {{ panel.resumen?.nuevos ?? 0 }}
            </span>
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-500 text-white dark:bg-blue-600">
              Renovados: {{ panel.resumen?.renovados ?? 0 }}
            </span>
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white dark:bg-red-600">
              Cancelados: {{ panel.resumen?.cancelados ?? 0 }}
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
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Caja inicial:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ cajaInicialCalculada }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <ChartBarIcon class="w-6 h-6 text-blue-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recaudo pretendido del día:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.recaudadoPretendido || 0).toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recaudo actual:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.recaudado || 0).toFixed(2) }}</span>
          <span class="ml-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono text-sm font-semibold">{{ porcentajeRecaudo }}%</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <ArrowTrendingUpIcon class="w-6 h-6 text-green-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ingresos:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.ingresos || 0).toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-2">
          <ShoppingCartIcon class="w-6 h-6 text-blue-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ventas:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.ventas || 0).toFixed(2) }}</span>
          <span v-if="interesesTotalesRuta > 0" class="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono text-sm font-semibold">
            Intereses: ${{ interesesTotalesRuta.toFixed(2) }}
          </span>
        </div>
        <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
          <ReceiptRefundIcon class="w-6 h-6 text-red-400" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Egresos:</span>
          <span class="text-gray-900 dark:text-gray-100 text-base font-bold">${{ (panel.ruta?.egresos || 0).toFixed(2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
          <ArrowTrendingDownIcon class="w-6 h-6 text-red-500" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Retiros:</span>
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
import NavbarVendedor from '../components/NavbarVendedor.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import API_BASE_URL from '../config/api.js'
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
    alert('No se pudo cerrar la ruta') 
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
    console.log('Cargando panel para vendedor:', vendedorId)
    const url = new URL(`${API_BASE_URL}/api/vendedores/${vendedorId}/panel`)
    if (rutaSeleccionadaId.value) {
      url.searchParams.set('rutaId', rutaSeleccionadaId.value)
    }
    const res = await fetch(url)
    console.log('Respuesta del servidor:', res.status, res.ok)
    if (res.ok) {
      panel.value = await res.json()
      console.log('Datos del panel cargados:', panel.value)
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
  console.log('🔄 Actualizando resumen por evento...')
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

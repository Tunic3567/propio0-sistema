<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :actualizandoDatos="loading" :cargandoRuta="cargandoRuta" tituloSeccion="Historial de Pagos" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 md:p-8">
      <div class="mb-6" v-if="rutaAbierta || cargandoRuta">
        <div class="flex items-center justify-between">
          <!-- Título movido al header -->
        </div>
        
        <!-- Filtros -->
        <div v-if="rutaAbierta || cargandoRuta" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 mb-4 transition-colors duration-300">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por cliente:</label>
              <select v-model="clienteFiltro" @change="filtrarPagos" class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Todos los clientes</option>
                <option v-for="cliente in clientes" :key="cliente._id" :value="cliente._id">
                  {{ cliente.nombres }} {{ cliente.apellidos }}
                  <span v-if="cliente.apodo">({{ cliente.apodo }})</span>
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por tipo:</label>
              <select v-model="tipoFiltro" @change="filtrarPagos" class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Todos los tipos</option>
                <option value="Parcela">Parcela</option>
                <option value="Abono">Abono</option>
                <option value="No pago">No pago</option>
                <option value="No aplica">No aplica</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">Ruta cerrada</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">Para continuar, debes abrir una ruta.</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">Abrir ruta</button>
      </div>

      <!-- Estadísticas -->
      <div v-if="rutaAbierta || cargandoRuta" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 transition-colors duration-300">
          <div class="flex items-center gap-2">
            <CurrencyDollarIcon class="w-5 h-5 text-green-500" />
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Pagos</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ pagosFiltrados.length }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 transition-colors duration-300">
          <div class="flex items-center gap-2">
            <BanknotesIcon class="w-5 h-5 text-blue-500" />
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Monto Total Pago</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">${{ totalMonto.toFixed(2) }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 transition-colors duration-300">
          <div class="flex items-center gap-2">
            <ShoppingCartIcon class="w-5 h-5 text-purple-500" />
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Parcelas</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ pagosParcelas }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 transition-colors duration-300">
          <div class="flex items-center gap-2">
            <ArrowTrendingUpIcon class="w-5 h-5 text-orange-500" />
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Abonos</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ pagosAbonos }}</div>
        </div>
      </div>

      <!-- Lista de pagos -->
      <div v-if="rutaAbierta || cargandoRuta">
        <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Cargando pagos...</p>
        </div>
        
        <div v-else-if="pagosFiltrados.length === 0" class="text-center py-8">
          <ReceiptRefundIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 text-lg">No se encontraron pagos</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm">Intenta ajustar los filtros o registra algunos pagos</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="pago in pagosFiltrados" :key="pago._id" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300">
            <div class="p-4">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <!-- Información del cliente -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <UserIcon class="w-5 h-5 text-gray-400 dark:text-gray-300" />
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      <template v-if="pago.cliente && (pago.cliente.nombres || pago.cliente.apellidos)">
                        {{ pago.cliente.nombres }} {{ pago.cliente.apellidos }}
                        <span v-if="pago.cliente.apodo" class="text-gray-500 dark:text-gray-300 font-normal">({{ pago.cliente.apodo }})</span>
                      </template>
                      <template v-else-if="pago.cliente && pago.cliente.apodo">
                        {{ pago.cliente.apodo }}
                      </template>
                      <template v-else>
                        Cliente no encontrado
                      </template>
                    </h3>
                  </div>
                  
                  <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <div v-if="pago.cliente?.celular" class="flex items-center gap-1">
                      <span>📱</span>
                      <a :href="`tel:${pago.cliente.celular}`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">{{ pago.cliente.celular }}</a>
                    </div>
                    <div v-if="pago.cliente?.direccion_residencial" class="flex items-center gap-1">
                      <span>🏠</span>
                      <span class="dark:text-gray-200">{{ pago.cliente.direccion_residencial }}</span>
                    </div>
                  </div>
                </div>

                <!-- Información del pago -->
                <div class="flex flex-col md:items-end gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded-full text-xs font-medium" :class="getTipoPagoClass(pago.tipo)">
                      {{ pago.tipo }}
                    </span>
                    <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">${{ pago.valor.toFixed(2) }}</span>
                  </div>
                  
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      <div class="flex items-center gap-1">
                        <CalendarDaysIcon class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>{{ formatFecha(pago.fecha) }}</span>
                      </div>
                    </div>
                </div>
              </div>
            </div>
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
import { consultarEstadoRuta, cerrarRuta as cerrarRutaUtil } from '../utils/rutaUtils.js'
import { 
  ReceiptRefundIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CalendarDaysIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const loading = ref(true)
const pagos = ref([])
const clientes = ref([])
const clienteFiltro = ref('')
const tipoFiltro = ref('')
const rutaAbierta = ref(false)
const cargandoRuta = ref(true)
const mostrarModalCerrarRuta = ref(false)
const mostrarModalAbrirRuta = ref(false)
let pollingInterval = null

// Computed properties
const pagosFiltrados = computed(() => {
  let filtrados = pagos.value

  if (clienteFiltro.value) {
    filtrados = filtrados.filter(pago => pago.cliente?._id === clienteFiltro.value)
  }

  if (tipoFiltro.value) {
    filtrados = filtrados.filter(pago => pago.tipo === tipoFiltro.value)
  }

  return filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const totalMonto = computed(() => {
  return pagosFiltrados.value.reduce((sum, pago) => sum + (pago.valor || 0), 0)
})

const pagosParcelas = computed(() => {
  return pagosFiltrados.value.filter(pago => pago.tipo === 'Parcela').length
})

const pagosAbonos = computed(() => {
  return pagosFiltrados.value.filter(pago => pago.tipo === 'Abono').length
})

// Funciones
function getTipoPagoClass(tipo) {
  switch (tipo) {
    case 'Parcela':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Abono':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'No pago':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'No aplica':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function filtrarPagos() {
  // Los filtros se aplican automáticamente por los computed properties
}

async function cargarPagos() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) {
      router.push('/')
      return
    }

    console.log('📋 Cargando historial de pagos desde la base de datos...')
    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/pagos/vendedor/${vendedorId}?_t=${timestamp}`, {
      cache: 'no-store'
    })
    if (res.ok) {
      pagos.value = await res.json()
      console.log(`✅ Historial de pagos cargado: ${pagos.value.length} pagos`)
    } else {
      console.error('Error al cargar pagos:', res.statusText)
      pagos.value = []
    }
  } catch (error) {
    console.error('Error al cargar pagos:', error)
    pagos.value = []
  }
}

async function cargarClientes() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return

    console.log('📋 Cargando clientes desde la base de datos...')
    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/clientes/vendedor/${vendedorId}?_t=${timestamp}`, {
      cache: 'no-store'
    })
    if (res.ok) {
      // El backend ya filtra clientes en modo historial
      clientes.value = await res.json()
      console.log(`📋 Clientes cargados para filtros: ${clientes.value.length} (ya filtrados por backend)`)
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  }
}

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true
}

async function confirmarCerrarRuta() {
  const exito = await cerrarRutaUtil()
  if (exito) {
    mostrarModalCerrarRuta.value = false
    // Recargar estado de ruta y datos desde la base de datos
    const estadoRuta = await consultarEstadoRuta()
    rutaAbierta.value = estadoRuta.abierta
    cargandoRuta.value = estadoRuta.cargando
    await Promise.all([cargarPagos(), cargarClientes()])
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-cerrada'))
    alert('Ruta cerrada exitosamente')
  } else {
    alert('Error al cerrar la ruta')
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
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  })
  if (res.ok) {
    mostrarModalAbrirRuta.value = false
    // Recargar estado de ruta y datos desde la base de datos
    const estadoRuta = await consultarEstadoRuta()
    rutaAbierta.value = estadoRuta.abierta
    cargandoRuta.value = estadoRuta.cargando
    await Promise.all([cargarPagos(), cargarClientes()])
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
    alert('Ruta abierta exitosamente')
  } else {
    alert('No se pudo abrir la ruta')
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
  } catch {}
  try { 
    router.replace('/') 
  } catch { 
    location.href = '/' 
  }
}

onMounted(async () => {
  console.log('🚀 HistorialPagosVendedor - onMounted iniciado')
  console.log('🔗 URL actual:', window.location.href)
  console.log('🔗 Hash:', window.location.hash)
  
  loading.value = true
  cargandoRuta.value = true
  
  // Consultar estado de la ruta
  const estadoRuta = await consultarEstadoRuta()
  rutaAbierta.value = estadoRuta.abierta
  cargandoRuta.value = estadoRuta.cargando
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('pago-registrado', actualizarHistorialPagos)
  window.addEventListener('pago-editado', actualizarHistorialPagos)
  window.addEventListener('pago-eliminado', actualizarHistorialPagos)
  window.addEventListener('ruta-cerrada', actualizarHistorialPagos)
  window.addEventListener('ruta-abierta', actualizarHistorialPagos)
  
  console.log('🛣️ Estado de ruta:', estadoRuta)
  console.log('🔴 rutaAbierta.value:', rutaAbierta.value)
  console.log('🟡 cargandoRuta.value:', cargandoRuta.value)
  console.log('🔵 Props que se pasan a NavbarVendedor:')
  console.log('  - rutaAbierta:', rutaAbierta.value)
  console.log('  - cargandoRuta:', cargandoRuta.value)
  console.log('  - actualizandoDatos:', loading.value)
  
  await Promise.all([cargarPagos(), cargarClientes()])
  
  console.log('📊 Datos cargados - Clientes:', clientes.value.length, 'Pagos:', pagos.value.length)
  
  // Detectar parámetro de consulta 'cliente' y aplicar filtro automáticamente
  // En Vue Router con hash mode, los parámetros están en el hash
  const hash = window.location.hash
  const urlParams = new URLSearchParams(hash.split('?')[1] || '')
  const clienteParam = urlParams.get('cliente')
  
  console.log('🔍 Parámetro cliente de URL:', clienteParam)
  
  if (clienteParam) {
    console.log(`🔍 Buscando cliente con parámetro: "${clienteParam}"`)
    console.log(`📋 Clientes disponibles:`, clientes.value.map(c => `${c.nombres} ${c.apellidos}`))
    
    // Buscar el cliente por nombre completo (más flexible)
    const clienteEncontrado = clientes.value.find(cliente => {
      const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.toLowerCase()
      const parametroLimpio = clienteParam.toLowerCase().trim()
      
      // Buscar coincidencia exacta o que el parámetro esté contenido en el nombre
      const coincidenciaExacta = nombreCompleto === parametroLimpio
      const coincidenciaParcial = nombreCompleto.includes(parametroLimpio)
      
      console.log(`🔍 Comparando: "${nombreCompleto}" con "${parametroLimpio}" - Exacta: ${coincidenciaExacta}, Parcial: ${coincidenciaParcial}`)
      
      return coincidenciaExacta || coincidenciaParcial
    })
    
    if (clienteEncontrado) {
      clienteFiltro.value = clienteEncontrado._id
      console.log(`✅ Filtro automático aplicado para cliente: ${clienteEncontrado.nombres} ${clienteEncontrado.apellidos} (ID: ${clienteEncontrado._id})`)
    } else {
      console.log(`❌ Cliente no encontrado: ${clienteParam}`)
      console.log(`📋 Clientes disponibles:`, clientes.value.map(c => `${c.nombres} ${c.apellidos}`))
    }
  } else {
    console.log('ℹ️ No hay parámetro de cliente en la URL')
  }
  
  loading.value = false
  console.log('✅ HistorialPagosVendedor - onMounted completado')
})

// Función para actualizar historial de pagos cuando sea necesario
function actualizarHistorialPagos() {
  console.log('🔄 Actualizando historial de pagos por evento...')
  cargarPagos()
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('pago-registrado', actualizarHistorialPagos)
  window.removeEventListener('pago-editado', actualizarHistorialPagos)
  window.removeEventListener('pago-eliminado', actualizarHistorialPagos)
  window.removeEventListener('ruta-cerrada', actualizarHistorialPagos)
  window.removeEventListener('ruta-abierta', actualizarHistorialPagos)
})
</script>

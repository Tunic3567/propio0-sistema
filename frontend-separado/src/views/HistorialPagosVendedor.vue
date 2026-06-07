<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :cargandoRuta="cargandoRuta" :tituloSeccion="$t('nav.paymentHistory')" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 md:p-8">
      <div class="mb-6" v-if="rutaAbierta || cargandoRuta">
        <div class="flex items-center justify-between">
          <!-- Título movido al header -->
        </div>
        
        <!-- Filtros -->
        <div v-if="rutaAbierta || cargandoRuta" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-neutral-300 dark:border-gray-600 p-4 mb-4 transition-colors duration-300">
          <div class="max-w-xl">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtrar por cliente:</label>
            <select v-model="clienteFiltro" @change="filtrarPagos" class="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="">{{ $t('history.allClients') || 'Todos los clientes' }}</option>
              <option v-for="cliente in clientes" :key="cliente._id" :value="cliente._id">
                {{ cliente.nombres }} {{ cliente.apellidos }}
                <span v-if="cliente.apodo">({{ cliente.apodo }})</span>
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">{{ $t('route.closed') }}</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">{{ $t('common.mustOpenRoute') }}</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">{{ $t('route.open') }}</button>
      </div>

      <!-- Lista de pagos -->
      <div v-if="rutaAbierta || cargandoRuta">
        <div v-if="!loading && pagosFiltrados.length === 0" class="text-center py-8">
          <ReceiptRefundIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 text-lg">No se encontraron pagos</p>
          <p class="text-gray-400 dark:text-gray-500 text-sm">Intenta ajustar los filtros o registra algunos pagos</p>
        </div>
        
        <div v-else-if="pagosFiltrados.length > 0" class="space-y-4">
          <div v-for="pago in pagosFiltrados" :key="pago._id" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-neutral-300 dark:border-gray-600 hover:shadow-md transition-all duration-300">
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
                      <span class="dark:text-gray-200">{{ resumirDireccion(pago.cliente.direccion_residencial) }}</span>
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
              
              <!-- Comentarios/Observaciones -->
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
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold text-red-600 dark:text-red-400">No se puede cerrar la ruta</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">Hay cliente(s) sin registro de pago en la ruta actual.</p>
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
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold text-red-600 dark:text-red-400">No se puede cerrar la ruta</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{{ mensajeCajaNegativa }}</p>
            <div v-if="detallesCajaNegativa" class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 mb-4 shadow-inner">
              <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">{{ t('modal.details') }}:</p>
              <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li class="flex justify-between"><span class="font-medium">{{ t('summary.initialCash') }}:</span> <span class="font-bold">${{ detallesCajaNegativa.cajaInicial?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ t('summary.income') }}:</span> <span class="font-bold text-red-600">${{ detallesCajaNegativa.ingresos?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ t('summary.collected') }}:</span> <span class="font-bold text-green-600">${{ detallesCajaNegativa.recaudado?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ t('summary.sales') }}:</span> <span class="font-bold text-blue-600">${{ detallesCajaNegativa.ventas?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ t('summary.expenses') }}:</span> <span class="font-bold text-red-600">${{ detallesCajaNegativa.egresos?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ t('summary.withdrawals') }}:</span> <span class="font-bold text-green-600">${{ detallesCajaNegativa.retiros?.toLocaleString() || '0.00' }}</span></li>
              </ul>
            </div>
            <div class="mt-6 flex justify-center">
              <button @click="mostrarModalCajaNegativa = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">Entendido</button>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import API_BASE_URL from '../config/api.js'
import { consultarEstadoRuta, cerrarRuta as cerrarRutaUtil, getUserTimezone } from '../utils/rutaUtils.js'

const { t } = useI18n()
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
const rutaAbierta = ref(false)
const cargandoRuta = ref(true)
const mostrarModalCerrarRuta = ref(false)
const mostrarModalAbrirRuta = ref(false)
const mostrarModalPendientes = ref(false)
const pendientesClientes = ref([])
const mostrarModalCajaNegativa = ref(false)
const mensajeCajaNegativa = ref('')
const detallesCajaNegativa = ref(null)
// Pagos cargados por ID de cliente (para mostrar todos los pagos del cliente al filtrar)
const pagosPorCliente = ref([])
let pollingInterval = null
/** Una sola petición /pagos/vendedor en vuelo (varios eventos seguidos). */
let cargarPagosVentPromise = null

// Computed properties
const pagosFiltrados = computed(() => {
  // Si hay filtro por cliente: usar lista por ID de cliente (todos los pagos) o filtrar con comparación segura por ID
  let filtrados
  if (clienteFiltro.value) {
    filtrados = pagosPorCliente.value.length
      ? pagosPorCliente.value
      : pagos.value.filter(pago => String(pago.cliente?._id || pago.cliente) === String(clienteFiltro.value))
  } else {
    filtrados = [...pagos.value]
  }

  return filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
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

// Función para resumir una dirección (mostrar solo calle, barrio, ciudad)
function resumirDireccion(direccionCompleta) {
  if (!direccionCompleta) return '';
  
  // Dividir por comas
  const partes = direccionCompleta.split(',').map(p => p.trim());
  
  // Si tiene menos de 3 partes, devolver todo
  if (partes.length <= 3) {
    return direccionCompleta;
  }
  
  // Tomar las primeras 3 partes (generalmente: calle, barrio, ciudad)
  // O las primeras 2 si la primera es muy larga
  if (partes[0].length > 50) {
    // Si la primera parte es muy larga, tomar solo las primeras 2
    return partes.slice(0, 2).join(', ');
  }
  
  // Normalmente: calle, barrio, ciudad
  return partes.slice(0, 3).join(', ');
}

function filtrarPagos() {
  // Los filtros se aplican automáticamente por los computed properties
}

// Al cambiar el filtro por cliente, cargar todos los pagos de ese cliente por ID (muestra todos sin depender de ruta)
watch(clienteFiltro, (nuevoId) => {
  cargarPagosPorCliente(nuevoId || '')
})

async function ejecutarCargarPagosHistorialVent() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) {
      router.push('/')
      return
    }

    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/pagos/vendedor/${vendedorId}?_t=${timestamp}`, {
      cache: 'no-store'
    })
    if (res.ok) {
      pagos.value = await res.json()
    } else {
      console.error('Error al cargar pagos:', res.statusText)
      pagos.value = []
    }
  } catch (error) {
    console.error('Error al cargar pagos:', error)
    pagos.value = []
  }
}

function cargarPagos() {
  if (!cargarPagosVentPromise) {
    cargarPagosVentPromise = ejecutarCargarPagosHistorialVent().finally(() => {
      cargarPagosVentPromise = null
    })
  }
  return cargarPagosVentPromise
}

async function cargarClientes() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return

    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/clientes/vendedor/${vendedorId}?_t=${timestamp}`, {
      cache: 'no-store'
    })
    if (res.ok) {
      // El backend ya filtra clientes en modo historial
      clientes.value = await res.json()
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  }
}

// Cargar todos los pagos del cliente por ID (para historial al filtrar por cliente)
async function cargarPagosPorCliente(clienteId) {
  if (!clienteId) {
    pagosPorCliente.value = []
    return
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/pagos/cliente/${clienteId}`, { cache: 'no-store' })
    if (res.ok) {
      pagosPorCliente.value = await res.json()
    } else {
      pagosPorCliente.value = []
    }
  } catch (error) {
    console.error('Error al cargar pagos del cliente:', error)
    pagosPorCliente.value = []
  }
}

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true
}

async function confirmarCerrarRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) return
  
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  })
  
  if (res.ok) {
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
      alert(errorData?.msg || errorData?.error || 'Error al cerrar la ruta')
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
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId, timezone: getUserTimezone() })
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
    localStorage.removeItem('sessionToken')
  } catch {}
  try { 
    router.replace('/') 
  } catch { 
    location.href = '/' 
  }
}

onMounted(async () => {
  loading.value = true
  cargandoRuta.value = true

  window.addEventListener('pago-registrado', actualizarHistorialPagos)
  window.addEventListener('pago-editado', actualizarHistorialPagos)
  window.addEventListener('pago-eliminado', actualizarHistorialPagos)
  window.addEventListener('ruta-cerrada', actualizarHistorialPagos)
  window.addEventListener('ruta-abierta', actualizarHistorialPagos)

  await Promise.all([
    consultarEstadoRuta().then((estadoRuta) => {
      rutaAbierta.value = estadoRuta.abierta
      cargandoRuta.value = estadoRuta.cargando
    }),
    cargarPagos(),
    cargarClientes()
  ])
  
  // Detectar parámetro de consulta y aplicar filtro automáticamente
  // En Vue Router con hash mode, los parámetros están en el hash
  const hash = window.location.hash
  const urlParams = new URLSearchParams(hash.split('?')[1] || '')
  const clienteIdParam = urlParams.get('clienteId')
  const clienteParam = urlParams.get('cliente')
  
  if (clienteIdParam) {
    const idLimpio = String(clienteIdParam).trim()
    const existe = clientes.value.find(c => String(c?._id || '') === idLimpio)
    if (existe) {
      clienteFiltro.value = idLimpio
      await cargarPagosPorCliente(idLimpio)
    }
  } else if (clienteParam) {
    // Buscar el cliente por nombre completo (más flexible)
    const clienteEncontrado = clientes.value.find(cliente => {
      const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.toLowerCase()
      const parametroLimpio = clienteParam.toLowerCase().trim()
      
      // Buscar coincidencia exacta o que el parámetro esté contenido en el nombre
      const coincidenciaExacta = nombreCompleto === parametroLimpio
      const coincidenciaParcial = nombreCompleto.includes(parametroLimpio)
      
      return coincidenciaExacta || coincidenciaParcial
    })
    
    if (clienteEncontrado) {
      clienteFiltro.value = clienteEncontrado._id
      await cargarPagosPorCliente(clienteEncontrado._id)
    }
  }
  
  loading.value = false
})

// Función para actualizar historial de pagos cuando sea necesario
function actualizarHistorialPagos() {
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

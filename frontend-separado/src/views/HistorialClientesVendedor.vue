<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :actualizandoDatos="cargando" :cargandoRuta="cargandoRuta" tituloSeccion="Historial de Clientes" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 md:p-8">
      <div class="mb-6" v-if="rutaAbierta || cargandoRuta">
        <div class="flex items-center justify-between">
          <!-- Título movido al header -->
        </div>
        
        <!-- Filtros -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 mb-4 transition-colors duration-300">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-64">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar cliente</label>
              <div class="relative">
                <input
                  v-model="filtroBusqueda"
                  type="text"
                  placeholder="Nombre, apellido, cédula o apodo..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  @keyup.enter="buscarClientes"
                />
                <button
                  @click="buscarClientes"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <p v-if="filtroBusqueda && historialesFiltrados.length > 0" class="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {{ historialesFiltrados.length }} resultado(s) encontrado(s)
              </p>
              <p v-else-if="filtroBusqueda && historialesFiltrados.length === 0" class="text-sm text-red-600 dark:text-red-400 mt-2">
                No se encontraron resultados
              </p>
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
      <div v-if="rutaAbierta || cargandoRuta" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 transition-colors duration-300">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Clientes</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ historialesMostrados.length }}</div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 transition-colors duration-300">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Renovaciones Totales</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ totalRenovaciones }}</div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 transition-colors duration-300">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Última Renovación</span>
          </div>
          <div class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ ultimaRenovacion }}</div>
        </div>
      </div>

      <!-- Lista de clientes -->
      <div v-if="rutaAbierta || cargandoRuta">
      <div v-if="cargando" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 text-center transition-colors duration-300">
        <div class="inline-flex items-center text-gray-900 dark:text-gray-100">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando historial...
        </div>
      </div>

      <div v-else-if="historialesMostrados.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="mt-2">No hay clientes en el historial</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="historial in historialesMostrados"
          :key="historial._id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-all duration-300"
        >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {{ historial.cliente?.nombres }} {{ historial.cliente?.apellidos }}
                    </h4>
                    <div class="flex flex-wrap gap-4 mt-1 text-sm text-gray-700 dark:text-gray-300">
                      <span v-if="historial.cliente?.apodo" class="flex items-center font-medium">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {{ historial.cliente?.apodo }}
                      </span>
                      <span class="flex items-center font-medium">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        C.C. {{ historial.cc }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Detalles de la última venta -->
                <div v-if="historial.cliente" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 w-full transition-colors duration-300">
                  <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Última Venta
                  </h5>
                  <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span class="text-gray-700 dark:text-gray-300 font-semibold">Venta:</span>
                      <p class="font-bold text-black dark:text-white text-lg">${{ historial.cliente.valor?.toLocaleString() }}</p>
                    </div>
                    <div>
                      <span class="text-gray-700 dark:text-gray-300 font-semibold">Total con intereses:</span>
                      <p class="font-bold text-black dark:text-white text-lg">${{ historial.cliente.saldo_inicial?.toLocaleString() || 'N/A' }}</p>
                    </div>
                    <div>
                      <span class="text-gray-700 dark:text-gray-300 font-semibold">Parcela:</span>
                      <p class="font-bold text-black dark:text-white text-lg">${{ historial.cliente.parcela?.toLocaleString() }}</p>
                    </div>
                    <div>
                      <span class="text-gray-700 dark:text-gray-300 font-semibold">Días:</span>
                      <p class="font-bold text-black dark:text-white text-lg">{{ historial.cliente.dias }} días</p>
                    </div>
                    <div>
                      <span class="text-gray-700 dark:text-gray-300 font-semibold">Estado:</span>
                      <p class="font-bold text-lg" :class="getEstadoColor(historial)">
                        {{ getEstadoCliente(historial) }}
                      </p>
                    </div>
                  </div>
                  <div class="mt-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Creado: {{ formatearFecha(historial.cliente.createdAt) }}
                  </div>
                </div>

                <!-- Información de renovaciones -->
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center space-x-4">
                    <span class="text-gray-800 dark:text-gray-200 font-semibold">
                      <strong class="text-black dark:text-white">{{ historial.renovacionesCount }}</strong> renovación(es)
                    </span>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">
                      Última: {{ formatearFecha(historial.lastRenovacionAt) }}
                    </span>
                    <span class="text-gray-700 dark:text-gray-300 font-medium">
                      {{ formatearTiempoRelativo(historial.lastRenovacionAt) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Botón de renovación -->
              <div class="sm:ml-4 sm:flex-shrink-0 mt-3 sm:mt-0 self-end sm:self-auto">
                <button
                  @click="renovarCliente(historial.cliente)"
                  :disabled="getEstadoCliente(historial) !== 'Finalizado'"
                  :class="[
                    'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                    getEstadoCliente(historial) === 'Finalizado'
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 cursor-pointer'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  ]"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Renovar
                </button>
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import NavbarVendedor from '../components/NavbarVendedor.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { consultarEstadoRuta, cerrarRuta as cerrarRutaUtil } from '../utils/rutaUtils.js';
import API_BASE_URL from '../config/api.js';

const rutaAbierta = ref(false);
const cargandoRuta = ref(true);
const mostrarModalCerrarRuta = ref(false);
const mostrarModalAbrirRuta = ref(false);
let pollingInterval = null;

const emit = defineEmits(['logout']);

const historiales = ref([]);
const cargando = ref(true);
const filtroBusqueda = ref('');
const mostrarResultados = ref(false);
const pagosClientes = ref({}); // Cache de pagos por cliente

const historialesFiltrados = computed(() => {
  if (!filtroBusqueda.value) return historiales.value;
  
  const busqueda = filtroBusqueda.value.toLowerCase();
  return historiales.value.filter(historial => {
    const cliente = historial.cliente;
    return (
      cliente?.nombres?.toLowerCase().includes(busqueda) ||
      cliente?.apellidos?.toLowerCase().includes(busqueda) ||
      cliente?.apodo?.toLowerCase().includes(busqueda) ||
      historial.cc?.toLowerCase().includes(busqueda)
    );
  });
});

const historialesMostrados = computed(() => {
  return mostrarResultados.value ? historialesFiltrados.value : historiales.value;
});

const totalRenovaciones = computed(() => {
  return historiales.value.reduce((sum, h) => sum + (h.renovacionesCount || 0), 0);
});

const ultimaRenovacion = computed(() => {
  if (historiales.value.length === 0) return 'N/A';
  const masReciente = historiales.value.reduce((latest, h) => {
    return new Date(h.lastRenovacionAt) > new Date(latest.lastRenovacionAt) ? h : latest;
  });
  return formatearFecha(masReciente.lastRenovacionAt);
});

function buscarClientes() {
  mostrarResultados.value = true;
  // Ocultar teclado virtual en móviles
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }
}

function getEstadoCliente(historial) {
  const cliente = historial.cliente;
  if (!cliente) return 'N/A';
  
  // Usar el estado que viene del backend
  if (cliente.estado === 'finalizado') {
    return 'Finalizado';
  } else {
    return 'Activo';
  }
}

function getEstadoColor(historial) {
  const estado = getEstadoCliente(historial);
  
  if (estado === 'Activo') {
    return 'text-yellow-600';
  } else if (estado === 'Finalizado') {
    return 'text-green-600';
  }
  
  return 'text-gray-600';
}

async function cargarPagosCliente(clienteId) {
  if (pagosClientes.value[clienteId]) return; // Ya está en cache
  
  try {
    const baseUrl = location.origin.includes('vercel.app') 
      ? 'https://sistema-cobranza-backend.onrender.com' 
      : '';
    
    const response = await fetch(`${baseUrl}/api/pagos/cliente/${clienteId}`);
    if (response.ok) {
      const pagos = await response.json();
      pagosClientes.value[clienteId] = pagos;
    }
  } catch (error) {
    console.warn('No se pudieron cargar los pagos del cliente:', error);
    pagosClientes.value[clienteId] = [];
  }
}

function renovarCliente(cliente) {
  if (!cliente) return;
  
  // Redirigir a la vista de crear cliente con datos prellenados
  const queryParams = new URLSearchParams({
    renovar: 'true',
    clienteId: cliente._id,
    nombres: cliente.nombres || '',
    apellidos: cliente.apellidos || '',
    apodo: cliente.apodo || '',
    cc: cliente.cc || '',
    celular: cliente.celular || '',
    direccion: cliente.direccion || '',
    direccion_residencial: cliente.direccion_residencial || '',
    valor: cliente.valor || '',
    dias: cliente.dias || '',
    frecuencia: cliente.frecuencia || ''
  });
  
  window.location.href = `/#/crear-cliente?${queryParams.toString()}`;
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatearTiempoRelativo(fecha) {
  if (!fecha) return 'N/A';
  const ahora = new Date();
  const fechaObj = new Date(fecha);
  const diffMs = ahora - fechaObj;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 7) return `Hace ${diffDias} días`;
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semana(s)`;
  if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} mes(es)`;
  return `Hace ${Math.floor(diffDias / 365)} año(s)`;
}

async function cargarHistorial() {
  try {
    cargando.value = true;
    const vendedorId = localStorage.getItem('vendedorId');
    if (!vendedorId) {
      console.error('No se encontró ID del vendedor');
      return;
    }

    const baseUrl = location.origin.includes('vercel.app') 
      ? 'https://sistema-cobranza-backend.onrender.com' 
      : '';
    
    console.log('🔍 HISTORIAL FRONTEND - Cargando historial...');
    console.log(`🔍 HISTORIAL FRONTEND - Base URL: ${baseUrl}`);
    console.log(`🔍 HISTORIAL FRONTEND - Vendedor ID: ${vendedorId}`);
    console.log(`🔍 HISTORIAL FRONTEND - URL completa: ${baseUrl}/api/historial-clientes/vendedor/${vendedorId}`);
    
    const response = await fetch(`${baseUrl}/api/historial-clientes/vendedor/${vendedorId}`);
    console.log(`🔍 HISTORIAL FRONTEND - Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`❌ HISTORIAL FRONTEND - Error: ${response.status} ${response.statusText}`);
      throw new Error('Error al cargar historial de clientes');
    }
    
    const data = await response.json();
    console.log(`🔍 HISTORIAL FRONTEND - Data recibida:`, data);
    historiales.value = data.historiales || data;
    
    // Los pagos ya vienen incluidos del backend, no necesitamos cargarlos por separado
  } catch (error) {
    console.error('Error cargando historial de clientes:', error);
    alert('Error al cargar el historial de clientes');
  } finally {
    cargando.value = false;
  }
}

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true
}

async function confirmarCerrarRuta() {
  const exito = await cerrarRutaUtil()
  if (exito) {
    rutaAbierta.value = false
    mostrarModalCerrarRuta.value = false
    alert('Ruta cerrada exitosamente')
    // Recargar la página para actualizar el estado
    window.location.reload()
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
    rutaAbierta.value = true
    mostrarModalAbrirRuta.value = false
    alert('Ruta abierta exitosamente')
    window.location.reload()
  } else {
    alert('No se pudo abrir la ruta')
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false
}

function logout() {
  emit('logout');
}

onMounted(async () => {
  console.log('🚀 HistorialClientesVendedor - onMounted iniciado')
  
  // Consultar estado de la ruta
  const estadoRuta = await consultarEstadoRuta()
  rutaAbierta.value = estadoRuta.abierta
  cargandoRuta.value = estadoRuta.cargando
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('cliente-creado', actualizarHistorialClientes)
  window.addEventListener('cliente-eliminado', actualizarHistorialClientes)
  window.addEventListener('cliente-finalizado', actualizarHistorialClientes)
  window.addEventListener('ruta-cerrada', actualizarHistorialClientes)
  window.addEventListener('ruta-abierta', actualizarHistorialClientes)
  
  console.log('🛣️ Estado de ruta:', estadoRuta)
  console.log('🔴 rutaAbierta.value:', rutaAbierta.value)
  console.log('🟡 cargandoRuta.value:', cargandoRuta.value)
  console.log('🔵 Props que se pasan a NavbarVendedor:')
  console.log('  - rutaAbierta:', rutaAbierta.value)
  console.log('  - cargandoRuta:', cargandoRuta.value)
  console.log('  - actualizandoDatos:', cargando.value)
  
  cargarHistorial();
});

// Función para actualizar historial de clientes cuando sea necesario
function actualizarHistorialClientes() {
  console.log('🔄 Actualizando historial de clientes por evento...')
  cargarHistorial()
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('cliente-creado', actualizarHistorialClientes)
  window.removeEventListener('cliente-eliminado', actualizarHistorialClientes)
  window.removeEventListener('cliente-finalizado', actualizarHistorialClientes)
  window.removeEventListener('ruta-cerrada', actualizarHistorialClientes)
  window.removeEventListener('ruta-abierta', actualizarHistorialClientes)
})
</script>

<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :cargandoRuta="cargandoRuta" :tituloSeccion="$t('nav.clientHistory')" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 md:p-8">
      <div class="mb-6" v-if="rutaAbierta || cargandoRuta">
        <div class="flex items-center justify-between">
          <!-- Título movido al header -->
        </div>
        
        <!-- Filtros -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-neutral-300 dark:border-gray-600 p-4 mb-4 transition-colors duration-300">
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-0 w-full">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('common.searchClient') }}</label>
              <div class="relative">
                <input
                  v-model="filtroBusqueda"
                  type="text"
                  :placeholder="$t('history.searchPlaceholder') || 'Nombre, apellido, Id o apodo...'"
                  class="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                <button
                  v-if="filtroBusqueda"
                  type="button"
                  @click.stop="filtroBusqueda = ''"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p v-if="filtroBusqueda && historialesFiltrados.length > 0" class="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {{ historialesFiltrados.length }} resultado(s) encontrado(s)
              </p>
              <p v-else-if="filtroBusqueda && historialesFiltrados.length === 0" class="text-sm text-red-600 dark:text-red-400 mt-2">
                {{ $t('history.noResults') }}
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

      <!-- Lista de clientes -->
      <div v-if="rutaAbierta || cargandoRuta">
      <div v-if="!cargando && historialesMostrados.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-neutral-300 dark:border-gray-600 p-6 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="mt-2">No hay clientes en el historial</p>
      </div>

      <div v-else-if="historialesMostrados.length > 0" class="space-y-4">
        <div
          v-for="historial in historialesMostrados"
          :key="historial._id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-neutral-300 dark:border-gray-600 p-6 hover:shadow-md transition-all duration-300"
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
                        {{ t('client.id') }} {{ historial.cc }}
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

                <!-- Historial de ventas anteriores: pagos, atrasos, etc. -->
                <div class="flex flex-wrap items-center gap-3 mt-1">
                  <button
                    type="button"
                    @click="abrirModalVentasHistorial(historial)"
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-2 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  >
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    {{ $t('history.viewSalesHistory') }}
                    <span class="text-xs font-bold opacity-90 px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-800/80 text-blue-900 dark:text-blue-100">{{ historial.renovacionesCount }}</span>
                  </button>
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    {{ formatearFecha(historial.lastRenovacionAt) }} · {{ formatearTiempoRelativo(historial.lastRenovacionAt) }}
                  </span>
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
    
    <HistorialVentasClienteModal
      :show="!!modalVentasHistorial"
      :historial="modalVentasHistorial"
      :refreshing="modalVentasHistorialRefreshing"
      @close="cerrarModalVentasHistorial"
    />

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
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalPendientes = false"></div>
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
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalCajaNegativa = false"></div>
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import NavbarVendedor from '../components/NavbarVendedor.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import HistorialVentasClienteModal from '../components/HistorialVentasClienteModal.vue';
import { consultarEstadoRuta, cerrarRuta as cerrarRutaUtil, getUserTimezone } from '../utils/rutaUtils.js';
import API_BASE_URL from '../config/api.js';

const { t } = useI18n();
const router = useRouter();

const rutaAbierta = ref(false);
const cargandoRuta = ref(true);
const mostrarModalCerrarRuta = ref(false);
const mostrarModalPendientes = ref(false);
const pendientesClientes = ref([]);
const mostrarModalCajaNegativa = ref(false);
const mensajeCajaNegativa = ref('');
const detallesCajaNegativa = ref(null);
const mostrarModalAbrirRuta = ref(false);
let pollingInterval = null;

const historiales = ref([]);
const cargando = ref(true);
const filtroBusqueda = ref('');

/** Modal historial de ventas (todos los ciclos del cliente) */
const modalVentasHistorial = ref(null)
/** Refresco desde API al abrir el modal o al sincronizar pagos */
const modalVentasHistorialRefreshing = ref(false)

let debounceHistorialTimer = null
async function abrirModalVentasHistorial(historial) {
  modalVentasHistorial.value = historial
  modalVentasHistorialRefreshing.value = true
  try {
    const list = await fetchHistorialListRaw()
    historiales.value = list
    syncModalHistorialSiAbierto(list)
  } catch (e) {
    console.error('Error al sincronizar historial de ventas:', e)
  } finally {
    modalVentasHistorialRefreshing.value = false
  }
}

function cerrarModalVentasHistorial() {
  modalVentasHistorial.value = null
}

const historialesFiltrados = computed(() => {
  const busqueda = String(filtroBusqueda.value || '').trim().toLowerCase()
  if (!busqueda) return historiales.value

  return historiales.value.filter(historial => {
    const cliente = historial.cliente;
    const nombres = String(cliente?.nombres || '').toLowerCase()
    const apellidos = String(cliente?.apellidos || '').toLowerCase()
    const apodo = String(cliente?.apodo || '').toLowerCase()
    const cc = String(historial?.cc ?? cliente?.cc ?? '').toLowerCase()
    const nombreCompleto = `${nombres} ${apellidos}`.trim()
    return (
      nombres.includes(busqueda) ||
      apellidos.includes(busqueda) ||
      nombreCompleto.includes(busqueda) ||
      apodo.includes(busqueda) ||
      cc.includes(busqueda)
    );
  });
});

const historialesMostrados = computed(() => {
  return historialesFiltrados.value
});

function buscarClientes() {
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

/** Lista cruda del endpoint (siempre datos actuales de BD) */
async function fetchHistorialListRaw() {
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) throw new Error('No hay sesión de asesor')
  const response = await fetch(
    `${API_BASE_URL}/api/historial-clientes/vendedor/${vendedorId}?_t=${Date.now()}`,
    { cache: 'no-store' }
  )
  if (!response.ok) {
    throw new Error(`Error ${response.status} al cargar historial`)
  }
  const data = await response.json()
  return data.historiales || data
}

/** Si el modal está abierto, sustituir por el registro fresco del mismo cliente */
function syncModalHistorialSiAbierto(list) {
  const m = modalVentasHistorial.value
  if (!m || !Array.isArray(list)) return
  const cid = String(m.cliente?._id ?? '')
  const hid = m._id
  const found = list.find(
    (h) =>
      (cid && String(h.cliente?._id) === cid) ||
      (hid && h._id === hid)
  )
  if (found) modalVentasHistorial.value = found
}

function renovarCliente(cliente) {
  if (!cliente) return;
  
  // Redirigir a la vista de crear cliente con datos prellenados
  const queryParams = new URLSearchParams({
    renovado: 'true', // Cambiar de 'renovar' a 'renovado' para que coincida con CrearCliente.vue
    idAnterior: cliente._id, // ID del cliente anterior para marcarlo como cancelado (NO eliminar)
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

async function cargarHistorial(options = {}) {
  const silent = options.silent === true
  try {
    if (!silent) cargando.value = true
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) {
      console.error('No se encontró ID del asesor')
      return
    }
    const list = await fetchHistorialListRaw()
    historiales.value = list
    syncModalHistorialSiAbierto(list)
  } catch (error) {
    console.error('Error cargando historial de clientes:', error)
    if (!silent) alert('Error al cargar el historial de clientes')
  } finally {
    if (!silent) cargando.value = false
  }
}

function scheduleHistorialRecargaSilenciosa() {
  clearTimeout(debounceHistorialTimer)
  debounceHistorialTimer = setTimeout(() => {
    cargarHistorial({ silent: true }).catch(() => {})
  }, 450)
}

async function recargarHistorialTrasPago() {
  clearTimeout(debounceHistorialTimer)
  await cargarHistorial({ silent: true })
}

function onVisibilidadVentanaHistorial() {
  if (document.visibilityState !== 'visible') return
  scheduleHistorialRecargaSilenciosa()
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
    rutaAbierta.value = false
    mostrarModalCerrarRuta.value = false
    alert('Ruta cerrada exitosamente')
    // Recargar la página para actualizar el estado
    window.location.reload()
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
    rutaAbierta.value = true
    mostrarModalAbrirRuta.value = false
    alert('Ruta abierta exitosamente')
    window.location.reload()
  } else {
    const data = await res.json().catch(() => ({}))
    alert(data.msg || data.error || 'No se pudo abrir la ruta')
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
  } catch (_) {}
  try {
    router.replace('/')
    setTimeout(() => {
      if (location.hash && !location.hash.endsWith('#/')) {
        location.href = '/'
      }
    }, 150)
  } catch (_) {
    location.href = '/'
  }
}

onMounted(async () => {
  
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
  window.addEventListener('pago-registrado', recargarHistorialTrasPago)
  window.addEventListener('pago-editado', recargarHistorialTrasPago)
  window.addEventListener('pago-eliminado', recargarHistorialTrasPago)
  window.addEventListener('actualizar-dashboard', scheduleHistorialRecargaSilenciosa)
  document.addEventListener('visibilitychange', onVisibilidadVentanaHistorial)

  await cargarHistorial()

  // Si viene un clienteId, abrir automáticamente el modal "Ventas y pagos" de ese cliente
  try {
    const hash = window.location.hash
    const urlParams = new URLSearchParams(hash.split('?')[1] || '')
    const clienteIdParam = urlParams.get('clienteId')
    if (clienteIdParam) {
      const idStr = String(clienteIdParam).trim()
      const historial = historiales.value.find((h) => String(h?.cliente?._id || '') === idStr)
      if (historial) {
        // opcional: mostrar el cliente arriba si el usuario empieza a escribir
        const nombre = `${historial.cliente?.nombres || ''} ${historial.cliente?.apellidos || ''}`.trim()
        if (nombre) {
          filtroBusqueda.value = nombre
        }
        await abrirModalVentasHistorial(historial)
      }
    }
  } catch (_) {}
})

// Función para actualizar historial de clientes cuando sea necesario
function actualizarHistorialClientes() {
  cargarHistorial()
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  clearTimeout(debounceHistorialTimer)
  window.removeEventListener('cliente-creado', actualizarHistorialClientes)
  window.removeEventListener('cliente-eliminado', actualizarHistorialClientes)
  window.removeEventListener('cliente-finalizado', actualizarHistorialClientes)
  window.removeEventListener('ruta-cerrada', actualizarHistorialClientes)
  window.removeEventListener('ruta-abierta', actualizarHistorialClientes)
  window.removeEventListener('pago-registrado', recargarHistorialTrasPago)
  window.removeEventListener('pago-editado', recargarHistorialTrasPago)
  window.removeEventListener('pago-eliminado', recargarHistorialTrasPago)
  window.removeEventListener('actualizar-dashboard', scheduleHistorialRecargaSilenciosa)
  document.removeEventListener('visibilitychange', onVisibilidadVentanaHistorial)
})
</script>

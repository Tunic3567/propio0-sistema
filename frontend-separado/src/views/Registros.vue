<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :cargandoRuta="cargandoRuta" :tituloSeccion="$t('nav.records')" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4">
      <div class="flex items-center justify-between mb-6" v-if="rutaAbierta || cargandoRuta">
        <!-- Título movido al header -->
      </div>
      
      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center mb-6 transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">{{ $t('route.closed') }}</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">{{ $t('common.mustOpenRoute') }}</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">{{ $t('route.open') }}</button>
      </div>

      <!-- Mismo valor que Resumen: recaudado de Parcela + Abono en la ruta (GET /api/vendedores/:id/panel) -->
      <div
        v-if="rutaAbierta && !cargandoRuta"
        class="mb-5 rounded-xl border-2 border-emerald-300/70 dark:border-emerald-700/55 bg-gradient-to-r from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-800 px-4 py-3 shadow-sm transition-colors duration-300"
        role="status"
        aria-live="polite"
      >
        <div class="flex flex-wrap items-center gap-3 min-w-0">
          <div class="rounded-lg bg-emerald-600/15 dark:bg-emerald-500/15 p-2 shrink-0" aria-hidden="true">
            <svg class="w-7 h-7 text-emerald-700 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">{{ $t('summary.currentCollected') }}</p>
            <p v-if="cargandoRecaudoPanel" class="text-xl font-bold tabular-nums text-neutral-400 dark:text-neutral-500 mt-0.5">{{ $t('common.loading') }}</p>
            <p v-else class="text-2xl sm:text-3xl font-bold tabular-nums text-emerald-900 dark:text-emerald-50 mt-0.5">${{ formatoRecaudoActual }}</p>
          </div>
        </div>
      </div>

      <div v-if="rutaAbierta || cargandoRuta">
        <div v-if="!loading && pagos.length === 0" class="text-center text-gray-500 dark:text-gray-400">{{ $t('records.noRecords') }}</div>
        <div v-else-if="pagos.length > 0" class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm transition-colors duration-300">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('records.filterByClient') }}</label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ $t('records.clientSearchHint') }}</p>
            <div class="relative">
              <input
                v-model="filtroBusquedaCliente"
                type="search"
                autocomplete="off"
                :placeholder="$t('common.searchClientPlaceholder')"
                :aria-label="$t('records.filterByClient')"
                class="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <button
                v-if="filtroBusquedaCliente"
                type="button"
                @click.stop="filtroBusquedaCliente = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p v-if="filtroBusquedaCliente.trim() && pagosFiltrados.length > 0" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {{ pagosFiltrados.length }} / {{ pagos.length }}
            </p>
          </div>
          <div v-if="pagosFiltrados.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/40">
            {{ $t('records.noFilterResults') }}
          </div>
          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="pago in pagosFiltrados" :key="pago._id" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-1 transition-colors duration-300">
            <div>
              <span class="font-bold text-base text-gray-800 dark:text-gray-100">
                <template v-if="pago.cliente && (pago.cliente.nombres || pago.cliente.apellidos)">
                  {{ pago.cliente.nombres }} {{ pago.cliente.apellidos }}
                  <span v-if="pago.cliente.apodo" class="text-gray-500 dark:text-gray-400 font-normal">({{ pago.cliente.apodo }})</span>
                </template>
                <template v-else-if="pago.cliente && pago.cliente.apodo">
                  {{ pago.cliente.apodo }}
                </template>
              </span>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="pago.cliente?.celular">📱 {{ pago.cliente.celular }}</span>
                <span v-if="pago.cliente?.direccion_residencial">| 🏠 {{ resumirDireccion(pago.cliente.direccion_residencial) }}</span>
              </div>
            </div>
            <div class="text-gray-700 dark:text-gray-300 text-sm">{{ $t('payment.type') }}: <span class="font-medium">{{ pago.tipo }}</span></div>
            <div class="text-gray-700 dark:text-gray-300 text-sm">{{ $t('payment.amount') }}: <span class="font-bold text-lg">${{ pago.valor }}</span></div>
            <div class="flex items-center justify-between mt-1">
              <span class="text-gray-500 dark:text-gray-400 text-xs">{{ $t('payment.date') }}: {{ formatFecha(pago.fecha) }}</span>
              <button 
                v-if="rutaAbierta" 
                @click="!tieneClienteActivoConMismaCedula(pago.cliente) && editarPago(pago)" 
                :disabled="pago.cliente && tieneClienteActivoConMismaCedula(pago.cliente)"
                :class="[
                  'px-3 py-1 rounded ml-2 text-white transition-colors',
                  pago.cliente && tieneClienteActivoConMismaCedula(pago.cliente)
                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-yellow-400 hover:bg-yellow-500'
                ]"
              >
                {{ $t('common.edit') }}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de edición -->
    <Teleport to="body">
        <div v-if="modalEditar" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="modalEditar = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-blue-200/50 dark:border-blue-700/50 transition-all duration-300 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl sticky top-0 z-10">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <svg class="w-8 h-8 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Editar Pago</h2>
                </div>
                <button @click="modalEditar = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="p-6">
          <form @submit.prevent="guardarEdicion">
            <!-- Tipo de pago: 2 columnas en móvil para que el texto no se desborde -->
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">{{ $t('payment.type') }}</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label v-for="op in opciones" :key="op" class="flex flex-col min-w-0 cursor-pointer">
                  <input
                    type="radio"
                    class="hidden peer"
                    v-model="pagoEdit.tipo"
                    :value="op"
                  />
                  <div
                    :class="[
                      'flex items-center justify-center min-h-[2.75rem] py-2 px-1 rounded text-center font-semibold transition text-sm break-words',
                      pagoEdit.tipo === op
                        ? op === 'Parcela'
                          ? 'bg-blue-500 text-white'
                          : op === 'Abono'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    ]"
                  >
                    {{ op }}
                  </div>
                </label>
              </div>
            </div>

            <!-- Campos condicionales -->
            <div v-if="pagoEdit.tipo !== 'No pago'">
              <!-- Valor -->
              <div class="mb-4">
                <label class="block text-gray-700 dark:text-gray-300 mb-1">{{ $t('payment.amount') }}</label>
                <input
                  v-if="pagoEdit.tipo === 'Abono'"
                  v-model="pagoEdit.valorManual"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  step="0.01"
                  required
                />
                <input
                  v-else
                  :value="valorTotalParcelas"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                  readonly
                />
              </div>

              <!-- Número de parcelas (solo para tipo Parcela) -->
              <div v-if="pagoEdit.tipo === 'Parcela'" class="mb-4">
                <label class="block text-gray-700 dark:text-gray-300 mb-1">{{ $t('payment.installmentCount') }}</label>
                <select v-model.number="pagoEdit.numParcelas" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option v-for="n in maxParcelas" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>

            <!-- Información del saldo -->
            <div v-if="pagoEdit.tipo !== 'No pago'" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div class="text-sm text-gray-600 dark:text-gray-300">
                <div>{{ $t('payment.currentBalance') }}: ${{ saldoActual }}</div>
                <div>{{ $t('payment.newBalance') }}: ${{ nuevoSaldo }}</div>
              </div>
            </div>

              <div class="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-[#1E293B]/15 dark:border-[#1E293B]/50">
                <button type="button" @click="modalEditar = false" class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm">{{ $t('common.cancel') }}</button>
                <button type="submit" class="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ $t('common.save') }}</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </Teleport>
    
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
              <button @click="mostrarModalPendientes = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ t('common.understood') }}</button>
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
              <h2 class="text-xl font-bold text-red-600 dark:text-red-400">{{ t('route.negativeCash') }}</h2>
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
import API_BASE_URL from '../config/api.js'

import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavbarVendedor from '../components/NavbarVendedor.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { consultarEstadoRuta, getUserTimezone } from '../utils/rutaUtils.js';

const { t, locale } = useI18n();

const pagos = ref([]);
/** Filtro local por cliente (Id, nombre, apodo) en los registros de la ruta */
const filtroBusquedaCliente = ref('');
const loading = ref(true);
const rutaAbierta = ref(false);
const cargandoRuta = ref(true);
const modalEditar = ref(false);
const mostrarModalCerrarRuta = ref(false);
const mostrarModalPendientes = ref(false);
const pendientesClientes = ref([]);
const mostrarModalCajaNegativa = ref(false);
const mensajeCajaNegativa = ref('');
const detallesCajaNegativa = ref(null);
const mostrarModalAbrirRuta = ref(false);
let pollingInterval = null;
/** Recaudo actual (Parcela + Abono en la ruta), mismo criterio que Resumen (`panel.ruta.recaudado`) */
const recaudadoActualPanel = ref(null);
const cargandoRecaudoPanel = ref(false);
const pagoEdit = ref({});
const router = useRouter();
const clientes = ref([]); // Lista de clientes para verificar duplicados
/** Evita cargar clientes + registros dos veces seguidas (p. ej. evento `pago-editado` + `guardarEdicion`). */
let regListaReloadPromise = null

const pagosFiltrados = computed(() => {
  const q = (filtroBusquedaCliente.value || '').trim().toLowerCase();
  if (!q) return pagos.value;
  return pagos.value.filter((p) => {
    const c = p.cliente;
    if (!c) return false;
    const cc = String(c.cc ?? '').toLowerCase();
    const nombres = String(c.nombres ?? '').toLowerCase();
    const apellidos = String(c.apellidos ?? '').toLowerCase();
    const apodo = String(c.apodo ?? '').toLowerCase();
    const nombreCompleto = `${nombres} ${apellidos}`.trim();
    return (
      cc.includes(q) ||
      nombres.includes(q) ||
      apellidos.includes(q) ||
      apodo.includes(q) ||
      nombreCompleto.includes(q)
    );
  });
});

// Opciones de tipo de pago
const opciones = ['Parcela', 'Abono', 'No pago'];

// Datos del cliente para cálculos
const clienteData = ref({});

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

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString();
}

function formatoMontoDosDecimales(valor) {
  const n = Number(valor) || 0
  const lang = locale.value === 'pt' ? 'pt-BR' : locale.value === 'en' ? 'en-US' : 'es-ES'
  return n.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatoRecaudoActual = computed(() =>
  formatoMontoDosDecimales(recaudadoActualPanel.value != null ? recaudadoActualPanel.value : 0)
)

async function cargarRecaudoDesdePanel() {
  if (!rutaAbierta.value) {
    recaudadoActualPanel.value = null
    return
  }
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) {
    recaudadoActualPanel.value = null
    return
  }
  cargandoRecaudoPanel.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendedores/${vendedorId}/panel?_t=${Date.now()}`, {
      cache: 'no-store'
    })
    if (!res.ok) {
      recaudadoActualPanel.value = null
      return
    }
    const data = await res.json().catch(() => null)
    recaudadoActualPanel.value = Number(data?.ruta?.recaudado)
    if (Number.isNaN(recaudadoActualPanel.value)) recaudadoActualPanel.value = 0
  } catch (_) {
    recaudadoActualPanel.value = null
  } finally {
    cargandoRecaudoPanel.value = false
  }
}

// Propiedades computadas para cálculos
const dias = computed(() => {
  const valor = Number(clienteData.value.dias) || 0;
  return valor;
});
const valorParcela = computed(() => {
  const valor = Number(clienteData.value.parcela) || 0;
  return valor;
});
// Saldo justo ANTES del pago seleccionado: saldo restante actual + valor del pago seleccionado + pagos posteriores del mismo cliente
const saldoActual = computed(() => {
  const saldoRestanteActual = Number(clienteData.value.total) || 0;
  if (!pagoEdit.value || !pagoEdit.value._id) {
    return saldoRestanteActual;
  }

  const fechaPagoSeleccionado = new Date(pagoEdit.value.fecha || 0).getTime();

  const obtenerValorPago = (p) => {
    if (!p) return 0;
    if (p.tipo === 'No pago' || p.tipo === 'No aplica') return 0;
    // El backend guarda en pago.valor el monto final pagado (ya sea abono o parcelas)
    return Number(p.valor) || 0;
  };

  // Sumar pagos posteriores del mismo cliente (fecha mayor al pago seleccionado)
  const sumaPagosPosteriores = pagos.value
    .filter((p) => {
      const mismoCliente = (pagoEdit.value.cliente && p.cliente) && (
        (typeof pagoEdit.value.cliente === 'object' ? pagoEdit.value.cliente._id : pagoEdit.value.cliente) ===
        (typeof p.cliente === 'object' ? p.cliente._id : p.cliente)
      );
      const esPosterior = new Date(p.fecha || 0).getTime() > fechaPagoSeleccionado;
      return p._id !== pagoEdit.value._id && mismoCliente && esPosterior;
    })
    .reduce((acc, p) => acc + obtenerValorPago(p), 0);

  const valorPagoSeleccionado = obtenerValorPago(pagoEdit.value);

  const saldoPrevio = saldoRestanteActual + valorPagoSeleccionado + sumaPagosPosteriores;
  
  // Aplicar redondeo para evitar problemas de precisión (igual que el backend)
  const saldoRedondeado = Math.round(saldoPrevio * 100) / 100;
  return saldoRedondeado;
});

const maxParcelas = computed(() => {
  const diasNum = Number(dias.value) || 1;
  const valorParcelaNum = Number(valorParcela.value) || 1;
  const saldoNum = Number(saldoActual.value) || 0;
  const porSaldo = Math.floor(saldoNum / valorParcelaNum);
  return Math.max(1, Math.min(diasNum, porSaldo));
});

const valorTotalParcelas = computed(() => {
  if (pagoEdit.value.tipo === 'Parcela') {
    return (valorParcela.value * (pagoEdit.value.numParcelas || 1)).toFixed(2);
  }
  return '0.00';
});

const nuevoSaldo = computed(() => {
  // Partimos del saldo PREVIO al pago seleccionado
  const saldoPrevio = Number(saldoActual.value) || 0;
  let nuevoSaldoCalculado = 0;
  
  if (pagoEdit.value.tipo === 'Parcela') {
    const cuotas = Math.min(pagoEdit.value.numParcelas || 1, maxParcelas.value);
    nuevoSaldoCalculado = saldoPrevio - valorParcela.value * cuotas;
  } else if (pagoEdit.value.tipo === 'Abono') {
    const vm = parseFloat(pagoEdit.value.valorManual)
    nuevoSaldoCalculado = saldoPrevio - (Number.isNaN(vm) ? 0 : vm);
  } else {
    nuevoSaldoCalculado = saldoPrevio;
  }
  
  // Aplicar redondeo para evitar problemas de precisión (igual que el backend)
  const saldoRedondeado = Math.round(Math.max(0, nuevoSaldoCalculado) * 100) / 100;
  return saldoRedondeado.toFixed(2);
});

// Watcher para ajustar número de parcelas
watch([() => pagoEdit.value.numParcelas, saldoActual, valorParcela], () => {
  if (pagoEdit.value.numParcelas > maxParcelas.value) {
    pagoEdit.value.numParcelas = maxParcelas.value;
  }
});

// Al pasar a Abono, vaciar monto si solo había 0 (misma UX que Pagos / admin)
watch(
  () => pagoEdit.value?.tipo,
  (newT, oldT) => {
    if (newT !== 'Abono' || !oldT || oldT === 'Abono') return
    const v = pagoEdit.value.valorManual
    const s = String(v ?? '').trim()
    const n = parseFloat(s)
    if (s === '' || s === '0' || (!Number.isNaN(n) && n === 0)) {
      pagoEdit.value.valorManual = ''
    }
  }
);

function logout() {
  try {
    localStorage.removeItem('rol');
    localStorage.removeItem('adminId');
    localStorage.removeItem('vendedorId');
    localStorage.removeItem('codigoVinculacion');
    localStorage.removeItem('sessionToken');
  } catch (e) {
  }
  try {
    router.replace('/');
    setTimeout(() => {
      if (location.hash && !location.hash.endsWith('#/')) {
        location.href = '/';
      }
    }, 150);
  } catch (e) {
    location.href = '/';
  }
}

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true;
}

async function confirmarCerrarRuta() {
  const vendedorId = localStorage.getItem('vendedorId');
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  });
  if (res.ok) {
    mostrarModalCerrarRuta.value = false;
    // Recargar estado de ruta y datos desde la base de datos
    const estadoRuta = await consultarEstadoRuta()
    rutaAbierta.value = estadoRuta.abierta
    cargandoRuta.value = estadoRuta.cargando
    await fetchPagos()
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-cerrada'))
    alert('Ruta cerrada exitosamente');
    router.push('/vendedor');
  } else {
    const errorData = await res.json().catch(() => null);
    mostrarModalCerrarRuta.value = false;
    if (errorData?.error === 'RUTA_CON_CLIENTES_PENDIENTES') {
      pendientesClientes.value = (errorData.pendientes || []);
      mostrarModalPendientes.value = true;
    } else if (errorData?.error === 'CAJA_FINAL_NEGATIVA') {
      mensajeCajaNegativa.value = errorData.msg || 'La caja final está en negativo.';
      detallesCajaNegativa.value = errorData.detalles || null;
      mostrarModalCajaNegativa.value = true;
    } else {
      alert(errorData?.msg || errorData?.error || 'No se pudo cerrar la ruta');
    }
  }
}

function cancelarCerrarRuta() {
  mostrarModalCerrarRuta.value = false;
}

function abrirRuta() {
  mostrarModalAbrirRuta.value = true;
}

async function confirmarAbrirRuta() {
  const vendedorId = localStorage.getItem('vendedorId');
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId, timezone: getUserTimezone() })
  });
  if (res.ok) {
    mostrarModalAbrirRuta.value = false;
    // Recargar estado de ruta y datos desde la base de datos
    const estadoRuta = await consultarEstadoRuta()
    rutaAbierta.value = estadoRuta.abierta
    cargandoRuta.value = estadoRuta.cargando
    await fetchPagos()
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
    alert('Ruta abierta exitosamente');
  } else {
    const data = await res.json().catch(() => ({}));
    alert(data.msg || data.error || 'No se pudo abrir la ruta');
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false;
}

// Función para verificar si un cliente tiene otro cliente activo con el mismo Id
function tieneClienteActivoConMismaCedula(cliente) {
  // Si el cliente no tiene los campos necesarios, no se puede verificar
  if (!cliente || !cliente.cc) {
    return false;
  }
  
  // Obtener el ID del cliente (puede ser string o objeto)
  const clienteId = typeof cliente._id === 'object' ? cliente._id.toString() : (cliente._id || cliente.toString());
  
  // Buscar otro cliente con el mismo Id que esté activo (no cancelado y no finalizado pendiente)
  // Esto incluye clientes renovados en la misma ruta
  const clienteActivo = clientes.value.find(c => {
    const cId = typeof c._id === 'object' ? c._id.toString() : (c._id || c.toString());
    return (
      cId !== clienteId && // Diferente cliente
      c.cc === cliente.cc && // Mismo Id
      !c.cancelado && // No cancelado
      !c.finalizadoPendiente // No finalizado pendiente
    );
  });
  
  return !!clienteActivo; // Retorna true si existe un cliente activo con el mismo Id
}

async function editarPago(pago) {
  // Validar si hay otro cliente activo con el mismo Id (el botón ya está deshabilitado, pero por seguridad)
  if (pago.cliente && tieneClienteActivoConMismaCedula(pago.cliente)) {
    return; // No hacer nada si el botón está deshabilitado
  }
  
  // Obtener el ID del cliente correctamente
  const clienteId = typeof pago.cliente === 'object' ? pago.cliente._id : pago.cliente;
  
  // Cargar datos del cliente para los cálculos
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${clienteId}`);
    if (res.ok) {
      clienteData.value = await res.json();
      
      // Validación adicional después de cargar los datos completos del cliente
      if (tieneClienteActivoConMismaCedula(clienteData.value)) {
        return; // No abrir el modal si hay un cliente activo con el mismo Id
      }
      
      // Inicializar el objeto de edición después de cargar los datos del cliente
      const pvAbono = pago.tipo === 'Abono' && pago.valor != null ? Number(pago.valor) : NaN
      pagoEdit.value = {
        ...pago,
        numParcelas: pago.numParcelas || 1,
        valorManual:
          pago.tipo === 'Abono' && !Number.isNaN(pvAbono) && pvAbono > 0 ? String(pvAbono) : ''
      };
      
      // Abrir el modal solo después de cargar los datos
      modalEditar.value = true;
    } else {
      console.error('Error al cargar cliente:', res.status);
      alert('Error al cargar los datos del cliente');
    }
  } catch (e) {
    console.error('Error al cargar datos del cliente:', e);
    alert('Error al cargar los datos del cliente');
  }
}

async function cargarClientes() {
  try {
    const vendedorId = localStorage.getItem('vendedorId');
    if (!vendedorId) {
      clientes.value = [];
      return;
    }
    // CRÍTICO: cargar solo clientes del asesor actual (nunca de otros asesores)
    const timestamp = new Date().getTime();
    const res = await fetch(`${API_BASE_URL}/api/clientes/vendedor/${vendedorId}?_t=${timestamp}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const todos = await res.json();
      // Filtrar clientes: incluir no cancelados, finalizadosPendiente, y cancelados
      const clientesFiltrados = todos.filter(c => {
        const noCancelado = !c.cancelado;
        const esFinalizadoPendiente = c.finalizadoPendiente === true;
        return noCancelado || esFinalizadoPendiente || c.cancelado; // Incluir todos para verificar duplicados
      });
      clientes.value = clientesFiltrados;
    }
  } catch (e) {
    console.error('Error al cargar clientes:', e);
    clientes.value = [];
  }
}

async function fetchPagos() {
  loading.value = true;
  const vendedorId = localStorage.getItem('vendedorId');
  try {
    if (!vendedorId) {
      pagos.value = [];
      return;
    }
    const timestamp = Date.now();
    const [estadoRuta, resReg] = await Promise.all([
      consultarEstadoRuta(),
      fetch(`${API_BASE_URL}/api/vendedor/${vendedorId}/registros?_t=${timestamp}`, {
        cache: 'no-store'
      })
    ]);
    rutaAbierta.value = estadoRuta.abierta;
    cargandoRuta.value = estadoRuta.cargando;
    const ruta = estadoRuta.ruta;
    const data =
      (!ruta || !ruta._id) ? [] : resReg.ok ? await resReg.json() : [];
    pagos.value = data;
  } catch (e) {
    pagos.value = [];
    console.error('Error al obtener registros:', e);
  } finally {
    loading.value = false;
    await cargarRecaudoDesdePanel();
  }
}

async function guardarEdicion() {
  try {
    // Calcular el valor correcto según el tipo de pago
    let valorFinal = 0;
    if (pagoEdit.value.tipo === 'Parcela') {
      valorFinal = valorParcela.value * (pagoEdit.value.numParcelas || 1);
    } else if (pagoEdit.value.tipo === 'Abono') {
      const valorNumerico = parseFloat(pagoEdit.value.valorManual);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        alert('El valor del abono debe ser un número mayor que 0');
        return;
      }
      valorFinal = valorNumerico;
    }
    // 'No pago' y 'No aplica' tienen valor 0

    const res = await fetch(`${API_BASE_URL}/api/pagos/${pagoEdit.value._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tipo: pagoEdit.value.tipo, 
        valor: valorFinal,
        numParcelas: pagoEdit.value.tipo === 'Parcela' ? pagoEdit.value.numParcelas : undefined
      })
    });
    if (res.ok) {
      modalEditar.value = false;
      
      // CRÍTICO: Disparar eventos para actualizar el dashboard y otras vistas
      // Esto asegura que el estado del cliente se actualice en todas las vistas
      window.dispatchEvent(new CustomEvent('pago-editado'));
      window.dispatchEvent(new CustomEvent('actualizar-dashboard'));
      // Una sola recarga: el listener también llama a actualizarRegistros (fusionado por promise compartido).
      await actualizarRegistros();
      
      // Si el nuevo saldo es 0, el backend ya habrá actualizado el estado del cliente
      // a través de actualizarEstadoCliente, pero necesitamos actualizar las vistas
      if (parseFloat(nuevoSaldo.value) <= 0.01) {
        // El cliente puede haber finalizado, actualizar dashboard
        window.dispatchEvent(new CustomEvent('cliente-actualizado'));
      }
    } else {
      const errorData = await res.json().catch(() => null);
      alert(errorData?.error || 'Error al guardar los cambios');
    }
  } catch (e) {
    alert('Error al guardar los cambios');
  }
}

onMounted(async () => {
  // fetchPagos() ya consulta el estado de ruta en paralelo con /registros; clientes va en paralelo.
  await Promise.all([cargarClientes(), fetchPagos()])

  // Si viene filtro por cliente en la URL (desde tarjetas), aplicarlo
  try {
    const hash = window.location.hash
    const urlParams = new URLSearchParams(hash.split('?')[1] || '')
    const clienteParam = urlParams.get('cliente')
    if (clienteParam) {
      filtroBusquedaCliente.value = String(clienteParam)
    }
  } catch (_) {}
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('pago-registrado', actualizarRegistros)
  window.addEventListener('pago-editado', actualizarRegistros)
  window.addEventListener('pago-eliminado', actualizarRegistros)
  window.addEventListener('ruta-cerrada', actualizarRegistros)
  window.addEventListener('ruta-abierta', actualizarRegistros)
  window.addEventListener('cliente-actualizado', cargarClientes) // Recargar clientes cuando se actualice uno
  window.addEventListener('actualizar-dashboard', actualizarRecaudoPanel)
});

// Función para actualizar registros cuando sea necesario
async function actualizarRegistros() {
  if (!regListaReloadPromise) {
    regListaReloadPromise = (async () => {
      await cargarClientes()
      await fetchPagos()
    })().finally(() => {
      regListaReloadPromise = null
    })
  }
  return regListaReloadPromise
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('pago-registrado', actualizarRegistros)
  window.removeEventListener('pago-editado', actualizarRegistros)
  window.removeEventListener('pago-eliminado', actualizarRegistros)
  window.removeEventListener('ruta-cerrada', actualizarRegistros)
  window.removeEventListener('ruta-abierta', actualizarRegistros)
  window.removeEventListener('actualizar-dashboard', actualizarRecaudoPanel)
})

/** Recarga solo recaudo (el panel es ligero vs volver a listar registros) */
function actualizarRecaudoPanel() {
  if (rutaAbierta.value) cargarRecaudoDesdePanel()
}
</script>

<style scoped>
</style> 
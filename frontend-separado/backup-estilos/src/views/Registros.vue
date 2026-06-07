<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :actualizandoDatos="loading" :cargandoRuta="cargandoRuta" :tituloSeccion="$t('nav.records')" @logout="logout" @cerrar-ruta="cerrarRuta" />
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

      <div v-if="rutaAbierta || cargandoRuta">
        <div v-if="loading" class="text-center text-gray-700 dark:text-gray-300">{{ $t('common.loading') }}</div>
        <div v-else-if="pagos.length === 0" class="text-center text-gray-500 dark:text-gray-400">{{ $t('records.noRecords') }}</div>
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="pago in pagos" :key="pago._id" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-600 p-4 flex flex-col gap-1 transition-colors duration-300">
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
            <div v-if="pago.observaciones" class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div class="flex items-start gap-2">
                <svg class="w-3 h-3 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <div class="flex-1">
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{{ $t('payment.comment') }}:</span>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{{ pago.observaciones }}</p>
                </div>
              </div>
            </div>
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
    
    <!-- Modal de edición -->
    <Teleport to="body">
        <div v-if="modalEditar" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="modalEditar = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-blue-200/50 dark:border-blue-700/50 transition-all duration-300 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl sticky top-0 z-10">
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
            <!-- Tipo de pago -->
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">{{ $t('payment.type') }}</label>
              <div class="flex justify-between">
                <label v-for="op in opciones" :key="op" class="flex-1 mx-1">
                  <input
                    type="radio"
                    class="hidden peer"
                    v-model="pagoEdit.tipo"
                    :value="op"
                  />
                  <div
                    :class="[
                      'py-2 rounded text-center cursor-pointer font-semibold transition text-sm',
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
            <div v-if="pagoEdit.tipo !== 'No pago' && pagoEdit.tipo !== 'No aplica'">
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
            <div v-if="pagoEdit.tipo !== 'No pago' && pagoEdit.tipo !== 'No aplica'" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div class="text-sm text-gray-600 dark:text-gray-300">
                <div>{{ $t('payment.currentBalance') }}: ${{ saldoActual }}</div>
                <div>{{ $t('payment.newBalance') }}: ${{ nuevoSaldo }}</div>
              </div>
            </div>

              <div class="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
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
              <button @click="mostrarModalPendientes = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ t('common.understood') }}</button>
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
import { consultarEstadoRuta } from '../utils/rutaUtils.js';

const { t } = useI18n();

const pagos = ref([]);
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
const pagoEdit = ref({});
const router = useRouter();
const clientes = ref([]); // Lista de clientes para verificar duplicados

// Opciones de tipo de pago
const opciones = ['Parcela', 'Abono', 'No pago', 'No aplica'];

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
    nuevoSaldoCalculado = saldoPrevio - (pagoEdit.value.valorManual || 0);
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

function logout() {
  try {
    localStorage.removeItem('rol');
    localStorage.removeItem('adminId');
    localStorage.removeItem('vendedorId');
    localStorage.removeItem('codigoVinculacion');
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
    body: JSON.stringify({ vendedorId })
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
    alert('No se pudo abrir la ruta');
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
      pagoEdit.value = {
        ...pago,
        numParcelas: pago.numParcelas || 1,
        valorManual: pago.tipo === 'Abono' ? pago.valor : 0
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
    const timestamp = new Date().getTime();
    const res = await fetch(`${API_BASE_URL}/api/clientes?_t=${timestamp}`, {
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
  if (!vendedorId) {
    pagos.value = [];
    loading.value = false;
    return;
  }
  try {
    const estadoRuta = await consultarEstadoRuta();
    rutaAbierta.value = estadoRuta.abierta;
    cargandoRuta.value = estadoRuta.cargando;
    const ruta = estadoRuta.ruta;
    if (!ruta || !ruta._id) {
      pagos.value = [];
      loading.value = false;
      return;
    }

    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/vendedor/${vendedorId}/registros?_t=${timestamp}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    pagos.value = data;
  } catch (e) {
    pagos.value = [];
    console.error('Error al obtener registros:', e);
  }
  loading.value = false;
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
      
      // Recargar los pagos en esta vista
      await fetchPagos();
      
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
  // Consultar estado de la ruta
  const estadoRuta = await consultarEstadoRuta()
  rutaAbierta.value = estadoRuta.abierta
  cargandoRuta.value = estadoRuta.cargando
  
  // Cargar datos iniciales
  await cargarClientes() // Cargar clientes primero para verificar duplicados
  await fetchPagos()
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('pago-registrado', actualizarRegistros)
  window.addEventListener('pago-editado', actualizarRegistros)
  window.addEventListener('pago-eliminado', actualizarRegistros)
  window.addEventListener('ruta-cerrada', actualizarRegistros)
  window.addEventListener('ruta-abierta', actualizarRegistros)
  window.addEventListener('cliente-actualizado', cargarClientes) // Recargar clientes cuando se actualice uno
});

// Función para actualizar registros cuando sea necesario
async function actualizarRegistros() {
  await cargarClientes() // Recargar clientes para verificar duplicados
  await fetchPagos()
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('pago-registrado', actualizarRegistros)
  window.removeEventListener('pago-editado', actualizarRegistros)
  window.removeEventListener('pago-eliminado', actualizarRegistros)
  window.removeEventListener('ruta-cerrada', actualizarRegistros)
  window.removeEventListener('ruta-abierta', actualizarRegistros)
})
</script>

<style scoped>
</style> 
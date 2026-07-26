<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :cargandoRuta="cargandoRuta" :tituloSeccion="$t('nav.expenses')" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 max-w-lg mx-auto">
      <div class="flex items-center justify-between mb-6" v-if="rutaAbierta || cargandoRuta">
        <!-- Título movido al header -->
      </div>
      
      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center mb-6 transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">{{ $t('route.closed') }}</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">{{ $t('common.mustOpenRoute') }}</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">{{ $t('route.open') }}</button>
      </div>

      <form v-if="rutaAbierta || cargandoRuta" @submit.prevent="registrarEgreso" class="bg-white dark:bg-gray-800 rounded-lg border-2 border-neutral-300 dark:border-gray-600 shadow-md p-6 mb-8 transition-colors duration-300">
        <div class="mb-4">
          <label class="block font-semibold mb-1 text-gray-900 dark:text-gray-100">{{ $t('expense.type') }}</label>
          <select v-model="tipo" class="w-full border-2 border-neutral-400 dark:border-gray-600 rounded-lg px-3 py-2 bg-neutral-50 dark:bg-gray-700 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition text-gray-900 dark:text-gray-100">
            <option value="Retiro de caja" :disabled="yaExiste('Retiro de caja')">Retiro de caja</option>
            <option value="Comisiones" :disabled="yaExiste('Comisiones')">Comisiones</option>
            <option value="Gasolina" :disabled="yaExiste('Gasolina')">Gasolina</option>
            <option value="Repuestos" :disabled="yaExiste('Repuestos')">Repuestos</option>
            <option value="Salario" :disabled="yaExiste('Salario')">Salario</option>
            <option value="Gastos varios" :disabled="yaExiste('Gastos varios')">Gastos varios</option>
          </select>
          <p v-if="!puedeCrear" class="text-sm text-red-600 dark:text-red-400 mt-1">Ya registraste todos los tipos de egreso en esta ruta.</p>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Valor</label>
          <input v-model.number="valor" type="number" min="1" class="no-spinner w-full border-2 border-neutral-400 dark:border-gray-600 rounded-lg px-3 py-2 bg-neutral-50 dark:bg-gray-700 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition text-gray-900 dark:text-gray-100" required />
        </div>
        <div class="mb-4" v-if="tipo === 'Gastos varios'">
          <label class="block font-semibold mb-1 text-gray-900 dark:text-gray-100">{{ $t('expense.description') }}</label>
          <input v-model="descripcion" type="text" class="w-full border-2 border-neutral-400 dark:border-gray-600 rounded-lg px-3 py-2 bg-neutral-50 dark:bg-gray-700 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition text-gray-900 dark:text-gray-100" placeholder="¿En qué se gastó?" required />
        </div>
        <button type="submit" :disabled="!puedeCrear || registrando" class="w-full bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
          <span v-if="registrando" class="inline-flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ t('payment.saving') }}
          </span>
          <span v-else>{{ $t('expense.register') }}</span>
        </button>
      </form>
      <div v-if="rutaAbierta || cargandoRuta" class="bg-white dark:bg-gray-800 rounded-lg border-2 border-neutral-300 dark:border-gray-600 shadow-md p-6 transition-colors duration-300">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{{ $t('expense.registered') }}</h2>
        <div v-if="!loading && egresos.length === 0" class="text-center text-gray-500 dark:text-gray-400">{{ $t('expense.noMovements') || 'No hay movimientos registrados en esta ruta.' }}</div>
        <div v-else-if="egresos.length > 0" class="space-y-3">
          <!-- Resumen de movimientos -->
          <div class="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-4 transition-colors duration-300">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-600 dark:text-gray-400">Retiros:</span>
                <span class="ml-2 font-semibold text-gray-900 dark:text-gray-100">${{ calcularTotalRetiros() }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-600 dark:text-gray-400">{{ $t('summary.expenses') }}:</span>
                <span class="ml-2 font-semibold text-gray-900 dark:text-gray-100">${{ calcularTotalEgresos() }}</span>
              </div>
            </div>
          </div>
          
          <!-- Lista de movimientos -->
          <div v-for="e in egresos" :key="e._id" 
               class="border border-gray-200 dark:border-gray-600 rounded-lg p-3 flex flex-col gap-1 transition-colors duration-300 bg-gray-50 dark:bg-gray-700/80"
               :class="{
                 'border-l-4 border-emerald-500 dark:border-emerald-500/70': e.tipo === 'Retiro de caja',
                 'border-l-4 border-sky-500 dark:border-sky-500/70': e.tipo === 'Comisiones',
                 'border-l-4 border-amber-500 dark:border-amber-500/70': e.tipo === 'Gasolina',
                 'border-l-4 border-orange-500 dark:border-orange-500/70': e.tipo === 'Repuestos',
                 'border-l-4 border-purple-500 dark:border-purple-500/70': e.tipo === 'Salario',
                 'border-l-4 border-gray-400 dark:border-gray-500': e.tipo === 'Gastos varios'
               }">
            <div class="flex items-center gap-2">
              <span v-if="e.tipo === 'Retiro de caja'" class="text-emerald-700 dark:text-emerald-400 font-semibold">{{ e.tipo }}</span>
              <span v-else-if="e.tipo === 'Comisiones'" class="text-sky-700 dark:text-sky-400 font-semibold">{{ e.tipo }}</span>
              <span v-else-if="e.tipo === 'Gasolina'" class="text-amber-700 dark:text-amber-400 font-semibold">{{ e.tipo }}</span>
              <span v-else-if="e.tipo === 'Repuestos'" class="text-orange-700 dark:text-orange-400 font-semibold">{{ e.tipo }}</span>
              <span v-else-if="e.tipo === 'Salario'" class="text-purple-700 dark:text-purple-400 font-semibold">{{ e.tipo }}</span>
              <span v-else class="text-gray-700 dark:text-gray-300 font-semibold">{{ e.tipo }}</span>
              <span v-if="e.descripcion" class="text-gray-500 dark:text-gray-400 text-sm">- {{ e.descripcion }}</span>
            </div>
            <div class="text-gray-700 dark:text-gray-300">Valor: <span class="font-bold">${{ e.valor }}</span></div>
            <div class="text-gray-500 dark:text-gray-400 text-xs">Fecha: {{ formatFecha(e.fecha) }}</div>
            <div class="flex gap-2 mt-2">
              <button @click="editarEgreso(e)" class="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm">Editar</button>
              <button @click="eliminarEgreso(e)" class="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm">Eliminar</button>
            </div>
          </div>

          <!-- Modal edición -->
          <div v-if="modal.visible" class="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{{ $t('expense.edit') || 'Editar egreso' }}</h3>
              <div class="mb-3">
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                <input v-model.number="modal.valor" type="number" min="1" class="no-spinner w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div class="mb-4">
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <input v-model="modal.descripcion" type="text" class="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div class="flex justify-end gap-2">
                <button @click="modal.visible=false" class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                <button @click="guardarEdicion" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Guardar</button>
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

    <!-- Modal de confirmación para eliminar egreso -->
    <ConfirmModal
      :show="mostrarModalEliminarEgreso"
      :title="t('expense.deleteConfirmTitle')"
      :message="t('expense.deleteConfirmMessage')"
      :confirmText="t('common.delete')"
      :cancelText="t('common.cancel')"
      @confirm="confirmarEliminarEgreso"
      @cancel="cancelarEliminarEgreso"
    />
    
    <!-- Modal de advertencia: clientes pendientes -->
    <Teleport to="body">
      <div v-if="mostrarModalPendientes" class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-[9999]" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 transition-colors duration-300" style="position: relative; z-index: 10000;">
          <h2 class="text-lg font-bold mb-2 text-center text-red-600 dark:text-red-400">{{ t('route.negativeCash') }}</h2>
          <p class="text-gray-700 dark:text-gray-300 text-center mb-4">{{ t('route.pendingClients') }}</p>
          <div class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-56 overflow-auto">
            <ul class="list-disc list-inside text-sm text-gray-800 dark:text-gray-200 space-y-1">
              <li v-for="(p, idx) in pendientesClientes" :key="p.id || idx">{{ p.nombres }} {{ p.apellidos }}</li>
            </ul>
          </div>
          <div class="mt-5 flex justify-center">
            <button @click="mostrarModalPendientes = false" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">{{ t('common.understood') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Modal de advertencia: caja final negativa -->
    <Teleport to="body">
      <div v-if="mostrarModalCajaNegativa" class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-[9999]" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 transition-colors duration-300" style="position: relative; z-index: 10000;">
          <h2 class="text-lg font-bold mb-2 text-center text-red-600 dark:text-red-400">{{ t('route.negativeCash') }}</h2>
          <p class="text-gray-700 dark:text-gray-300 text-center mb-4">{{ mensajeCajaNegativa }}</p>
          <div v-if="detallesCajaNegativa" class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 mb-4">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{{ t('modal.details') }}:</p>
            <ul class="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              <li>{{ t('summary.initialCash') }}: ${{ detallesCajaNegativa.cajaInicial?.toLocaleString() || '0.00' }}</li>
              <li>{{ t('summary.income') }}: <span class="text-red-600 font-bold">${{ detallesCajaNegativa.ingresos?.toLocaleString() || '0.00' }}</span></li>
              <li>{{ t('summary.collected') }}: ${{ detallesCajaNegativa.recaudado?.toLocaleString() || '0.00' }}</li>
              <li>{{ t('summary.sales') }}: ${{ detallesCajaNegativa.ventas?.toLocaleString() || '0.00' }}</li>
              <li>{{ t('summary.expenses') }}: ${{ detallesCajaNegativa.egresos?.toLocaleString() || '0.00' }}</li>
              <li>{{ t('summary.withdrawals') }}: <span class="text-green-600 font-bold">${{ detallesCajaNegativa.retiros?.toLocaleString() || '0.00' }}</span></li>
            </ul>
          </div>
          <div class="mt-5 flex justify-center">
            <button @click="mostrarModalCajaNegativa = false" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">{{ t('common.understood') }}</button>
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

    <!-- Modal de éxito (egreso registrado/actualizado/eliminado) -->
    <Teleport to="body">
      <div v-if="mostrarModalExitoEgreso" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="cerrarModalExitoEgreso"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-green-200/50 dark:border-green-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-10 h-10 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ tituloModalExitoEgreso }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-6 text-center leading-relaxed">{{ mensajeExitoEgreso }}</p>
            <div class="flex justify-center">
              <button @click="cerrarModalExitoEgreso" class="px-6 py-2.5 text-white bg-green-700 hover:bg-green-800 border-2 border-green-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md">
                {{ t('common.accept') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Banner reingreso solicitud llave -->
    <Teleport to="body">
      <div v-if="solicitudExitosa && !mostrarModalLlave" class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4">
        <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-3 shadow-lg cursor-pointer" @click="reabrirModalLlaveEgreso">
          <p class="text-sm font-medium text-amber-800 dark:text-amber-200 text-center">Solicitud de llave enviada — Haz clic para ver el estado</p>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Llave necesaria (egreso) -->
    <Teleport to="body">
      <div v-if="mostrarModalLlave" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalLlave = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-amber-300/50 dark:border-amber-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-amber-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-10 h-10 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Llave requerida</h2>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <template v-if="estadoLlave === 'pendiente'">
              <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                Este egreso de <strong>${{ formatNumLlave(datosLlave.venta, 0) }}</strong> excede el tope de <strong>${{ formatNumLlave(datosLlave.tope, 0) }}</strong> configurado por tu administrador.
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Solicita una llave para continuar con el registro del egreso.</p>
              <button
                type="button"
                :disabled="solicitandoLlave"
                class="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                @click="solicitarLlaveEgreso"
              >
                {{ solicitandoLlave ? 'Solicitando…' : 'Solicitar llave al administrador' }}
              </button>
              <p v-if="solicitudExitosa" class="text-sm text-green-600 dark:text-green-400 text-center">Solicitud enviada. Espera el código de tu administrador.</p>
            </template>
            <template v-else-if="estadoLlave === 'esperando'">
              <p class="text-sm text-green-600 dark:text-green-400 text-center font-medium">Solicitud enviada correctamente</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 text-center">Espera el código de tu administrador e ingrésalo aquí:</p>
              <input
                v-model="codigoLlaveInput"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full text-center text-2xl font-mono tracking-widest px-3 py-2.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-amber-400"
              />
              <button
                type="button"
                :disabled="!codigoLlaveInput.trim() || validandoLlave"
                class="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                @click="usarLlaveEgreso"
              >
                {{ validandoLlave ? 'Validando…' : 'Validar y registrar' }}
              </button>
              <p v-if="errorLlave" class="text-sm text-red-600 dark:text-red-400 text-center">{{ errorLlave }}</p>
            </template>
            <template v-else-if="estadoLlave === 'aprobada'">
              <p class="text-sm text-green-600 dark:text-green-400 text-center font-medium">Llave validada correctamente</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 text-center">Procesando...</p>
            </template>
            <div class="flex justify-center pt-2">
              <button type="button"
                class="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                @click="cancelarLlaveEgreso">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import API_BASE_URL from '../config/api.js'

import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import NavbarVendedor from '../components/NavbarVendedor.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { consultarEstadoRuta, getUserTimezone } from '../utils/rutaUtils.js';

const { t } = useI18n();

const tipo = ref('Retiro de caja');
const valor = ref(0);
const descripcion = ref('');
const egresos = ref([]);
const loading = ref(true);
const mostrarModalCerrarRuta = ref(false);
const mostrarModalPendientes = ref(false);
const pendientesClientes = ref([]);
const mostrarModalCajaNegativa = ref(false);
const mensajeCajaNegativa = ref('');
const detallesCajaNegativa = ref(null);
const mostrarModalAbrirRuta = ref(false);
const rutaIdActual = ref(null);
const mostrarModalExitoEgreso = ref(false);
const tituloModalExitoEgreso = ref('');
const mensajeExitoEgreso = ref('');
const mostrarModalEliminarEgreso = ref(false);
const egresoAEliminar = ref(null);
const registrando = ref(false);
const router = useRouter();
const rutaAbierta = ref(false);
const cargandoRuta = ref(true);
const modal = ref({ visible: false, egreso: null, valor: 0, descripcion: '' })
const puedeCrear = ref(true)
let pollingInterval = null

// ===== Llaves para Egresos =====
const mostrarModalLlave = ref(false)
const estadoLlave = ref('pendiente')
const datosLlave = ref({ venta: 0, tope: 0 })
const solicitandoLlave = ref(false)
const solicitudExitosa = ref(false)
const codigoLlaveInput = ref('')
const validandoLlave = ref(false)
const errorLlave = ref('')
const solicitudLlaveId = ref(null)
const datosEgresoParaLlave = ref(null)
const edicionPendienteLlave = ref(null)

function formatNumLlave(n, dec = 0) {
  const num = Number(n)
  if (!isFinite(num)) return '0'
  return num.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

async function solicitarLlaveEgreso() {
  if (solicitandoLlave.value) return
  solicitandoLlave.value = true
  errorLlave.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/vendedores/solicitar-llave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        valor: datosLlave.value.venta,
        tope: datosLlave.value.tope,
        tipo: 'egreso',
        datos: datosEgresoParaLlave.value
      })
    })
    if (res.ok) {
      const data = await res.json()
      solicitudLlaveId.value = data.solicitudId
      solicitudExitosa.value = true
      estadoLlave.value = 'esperando'
    } else {
      const err = await res.json().catch(() => ({}))
      errorLlave.value = err.error || 'Error al solicitar llave'
    }
  } catch (e) {
    errorLlave.value = 'Error de conexión'
  } finally {
    solicitandoLlave.value = false
  }
}

async function usarLlaveEgreso() {
  if (validandoLlave.value) return
  validandoLlave.value = true
  errorLlave.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/vendedores/usar-llave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ codigoLlave: codigoLlaveInput.value.trim() })
    })
    if (res.ok) {
      estadoLlave.value = 'aprobada'
      if (edicionPendienteLlave.value) {
        const e = edicionPendienteLlave.value
        const fetchRes = await fetch(`${API_BASE_URL}/api/egresos/${e._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ valor: Number(e.nuevoValor), descripcion: e.nuevaDescripcion })
        })
        if (fetchRes.ok) {
          modal.value.visible = false
          tituloModalExitoEgreso.value = t('expense.updatedSuccessTitle')
          mensajeExitoEgreso.value = t('expense.updatedSuccessMessage')
          mostrarModalExitoEgreso.value = true
          fetchEgresos()
        } else {
          alert('Error al actualizar egreso')
        }
        edicionPendienteLlave.value = null
      } else if (datosEgresoParaLlave.value) {
        const fetchRes = await fetch(`${API_BASE_URL}/api/egresos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosEgresoParaLlave.value)
        })
        if (fetchRes.ok) {
          window.dispatchEvent(new CustomEvent('egreso-registrado'))
          valor.value = 0
          descripcion.value = ''
          tipo.value = 'Retiro de caja'
          tituloModalExitoEgreso.value = t('expense.registeredSuccessTitle')
          mensajeExitoEgreso.value = t('expense.registeredSuccessMessage')
          mostrarModalExitoEgreso.value = true
          fetchEgresos()
        } else {
          alert('Error al registrar egreso')
        }
        datosEgresoParaLlave.value = null
      }
      mostrarModalLlave.value = false
      estadoLlave.value = 'pendiente'
      codigoLlaveInput.value = ''
      solicitudExitosa.value = false
    } else {
      const err = await res.json()
      errorLlave.value = err.error || 'Código inválido'
    }
  } catch (e) {
    errorLlave.value = 'Error de conexión'
  } finally {
    validandoLlave.value = false
  }
}

function cancelarLlaveEgreso() {
  mostrarModalLlave.value = false
  codigoLlaveInput.value = ''
  errorLlave.value = ''
  edicionPendienteLlave.value = null
}

function reabrirModalLlaveEgreso() {
  mostrarModalLlave.value = true
}

function cerrarModalExitoEgreso() {
  mostrarModalExitoEgreso.value = false;
}

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
    const estadoRuta = await consultarEstadoRuta();
    rutaAbierta.value = estadoRuta.abierta;
    cargandoRuta.value = estadoRuta.cargando;
    await fetchEgresos();
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-cerrada'));
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
    const estadoRuta = await consultarEstadoRuta();
    rutaAbierta.value = estadoRuta.abierta;
    cargandoRuta.value = estadoRuta.cargando;
    await fetchEgresos();
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-abierta'));
    alert('Ruta abierta exitosamente');
  } else {
    const data = await res.json().catch(() => ({}));
    alert(data.msg || data.error || 'No se pudo abrir la ruta');
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false;
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString();
}

function calcularTotalRetiros() {
  return egresos.value
    .filter(e => e.tipo === 'Retiro de caja')
    .reduce((sum, e) => sum + (e.valor || 0), 0)
    .toFixed(2);
}

function calcularTotalEgresos() {
  return egresos.value
    .filter(e => e.tipo !== 'Retiro de caja')
    .reduce((sum, e) => sum + (e.valor || 0), 0)
    .toFixed(2);
}

async function fetchEgresos() {
  loading.value = true;
  const vendedorId = localStorage.getItem('vendedorId');
  // Obtener la ruta activa
  const estadoRuta = await consultarEstadoRuta();
  rutaAbierta.value = estadoRuta.abierta;
  cargandoRuta.value = estadoRuta.cargando;
  const ruta = estadoRuta.ruta;
  if (!ruta || !ruta._id) {
    egresos.value = [];
    rutaIdActual.value = null;
    loading.value = false;
    return;
  }
  rutaIdActual.value = ruta._id;
  // Forzar recarga desde la base de datos, evitando caché con timestamp
  const timestamp = new Date().getTime()
  const res = await fetch(`${API_BASE_URL}/api/egresos?vendedor=${vendedorId}&ruta=${ruta._id}&_t=${timestamp}`, {
    cache: 'no-store'
  });
  egresos.value = await res.json();
  const TIPOS_EGRESO = ['Retiro de caja', 'Comisiones', 'Gasolina', 'Repuestos', 'Salario', 'Gastos varios'];
  puedeCrear.value = TIPOS_EGRESO.some(t => !yaExiste(t));
  loading.value = false;
}

onMounted(async () => {
  await fetchEgresos();
});

async function registrarEgreso() {
  const vendedorId = localStorage.getItem('vendedorId');
  let rutaId = rutaIdActual.value;
  if (!rutaId) {
    const rutaRes = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`);
    const ruta = await rutaRes.json();
    if (!ruta || !ruta._id) {
      alert('No hay ruta activa. Debes abrir una ruta para registrar egresos.');
      return;
    }
    rutaId = ruta._id;
    rutaIdActual.value = rutaId;
  }
  if (!valor.value || valor.value <= 0) {
    alert('El valor debe ser mayor a 0');
    return;
  }
  if (tipo.value === 'Gastos varios' && !descripcion.value.trim()) {
    alert('Debes ingresar una descripción para gastos varios');
    return;
  }

  const egreso = {
    vendedor: vendedorId,
    ruta: rutaId,
    tipo: tipo.value,
    valor: valor.value,
    descripcion: tipo.value === 'Gastos varios' ? descripcion.value : ''
  };

  // Validar tope de egresos
  try {
    const token = localStorage.getItem('sessionToken')
    const resVal = await fetch(`${API_BASE_URL}/api/vendedores/validar-egreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ valor: valor.value })
    })
    if (resVal.ok) {
      const data = await resVal.json()
      if (data.necesitaLlave) {
        datosLlave.value = { venta: valor.value, tope: data.tope }
        datosEgresoParaLlave.value = egreso
        estadoLlave.value = 'pendiente'
        codigoLlaveInput.value = ''
        errorLlave.value = ''
        solicitudExitosa.value = false
        mostrarModalLlave.value = true
        return
      }
    }
  } catch (_) {}

  registrando.value = true;
  try {
    const res = await fetch(`${API_BASE_URL}/api/egresos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(egreso)
    });
    if (res.ok) {
      window.dispatchEvent(new CustomEvent('egreso-registrado'))
      valor.value = 0;
      descripcion.value = '';
      tipo.value = 'Retiro de caja';
      tituloModalExitoEgreso.value = t('expense.registeredSuccessTitle');
      mensajeExitoEgreso.value = t('expense.registeredSuccessMessage');
      mostrarModalExitoEgreso.value = true;
      fetchEgresos();
    } else if (res.status === 409) {
      const data = await res.json();
      alert(data.error || 'Ya existe un egreso de este tipo en esta ruta');
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.detalles ? `${data.error || 'Error al registrar egreso'}: ${data.detalles}` : (data.error || 'Error al registrar egreso'));
    }
  } finally {
    registrando.value = false;
  }
}

function yaExiste(nombreTipo) {
  if (nombreTipo === 'Gastos varios') return false;
  return egresos.value.some(e => e.tipo === nombreTipo);
}

function editarEgreso(e) {
  modal.value = { visible: true, egreso: e, valor: e.valor, descripcion: e.descripcion || '' };
}

async function guardarEdicion() {
  const e = modal.value.egreso;
  if (!e) return;
  const nuevoValor = Number(modal.value.valor)

  // Validar tope de egresos
  try {
    const token = localStorage.getItem('sessionToken')
    const resVal = await fetch(`${API_BASE_URL}/api/vendedores/validar-egreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ valor: nuevoValor })
    })
    if (resVal.ok) {
      const data = await resVal.json()
      if (data.necesitaLlave) {
        modal.value.visible = false
        datosLlave.value = { venta: nuevoValor, tope: data.tope }
        edicionPendienteLlave.value = { _id: e._id, nuevoValor, nuevaDescripcion: modal.value.descripcion }
        estadoLlave.value = 'pendiente'
        codigoLlaveInput.value = ''
        errorLlave.value = ''
        solicitudExitosa.value = false
        mostrarModalLlave.value = true
        return
      }
    }
  } catch (_) {}

  const res = await fetch(`${API_BASE_URL}/api/egresos/${e._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valor: nuevoValor, descripcion: modal.value.descripcion })
  });
  if (res.ok) {
    modal.value.visible = false;
    tituloModalExitoEgreso.value = t('expense.updatedSuccessTitle');
    mensajeExitoEgreso.value = t('expense.updatedSuccessMessage');
    mostrarModalExitoEgreso.value = true;
    fetchEgresos();
  } else {
    alert('Error al actualizar egreso');
  }
}

function eliminarEgreso(e) {
  egresoAEliminar.value = e;
  mostrarModalEliminarEgreso.value = true;
}

async function confirmarEliminarEgreso() {
  const e = egresoAEliminar.value;
  mostrarModalEliminarEgreso.value = false;
  egresoAEliminar.value = null;
  if (!e?._id) return;
  const res = await fetch(`${API_BASE_URL}/api/egresos/${e._id}`, { method: 'DELETE' });
  if (res.ok) {
    tituloModalExitoEgreso.value = t('expense.deletedSuccessTitle');
    mensajeExitoEgreso.value = t('expense.deletedSuccessMessage');
    mostrarModalExitoEgreso.value = true;
    fetchEgresos();
  } else {
    alert('Error al eliminar egreso');
  }
}

function cancelarEliminarEgreso() {
  mostrarModalEliminarEgreso.value = false;
  egresoAEliminar.value = null;
}

onMounted(async () => {
  // Consultar estado de la ruta
  const estadoRuta = await consultarEstadoRuta()
  rutaAbierta.value = estadoRuta.abierta
  cargandoRuta.value = estadoRuta.cargando
  
  // Cargar datos iniciales
  await fetchEgresos()
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('egreso-registrado', actualizarEgresos)
  window.addEventListener('egreso-editado', actualizarEgresos)
  window.addEventListener('egreso-eliminado', actualizarEgresos)
  window.addEventListener('ruta-cerrada', actualizarEgresos)
  window.addEventListener('ruta-abierta', actualizarEgresos)
});

// Función para actualizar egresos cuando sea necesario
function actualizarEgresos() {
  fetchEgresos()
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('egreso-registrado', actualizarEgresos)
  window.removeEventListener('egreso-editado', actualizarEgresos)
  window.removeEventListener('egreso-eliminado', actualizarEgresos)
  window.removeEventListener('ruta-cerrada', actualizarEgresos)
  window.removeEventListener('ruta-abierta', actualizarEgresos)
})
</script>

<style scoped>
/* Ocultar flechas del input number en todos los navegadores */
input[type="number"].no-spinner::-webkit-inner-spin-button,
input[type="number"].no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"].no-spinner {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style> 
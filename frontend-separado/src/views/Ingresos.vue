<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarVendedor 
      :ruta-abierta="rutaAbierta"
      :cargando-ruta="cargandoRuta"
      :actualizando-datos="false"
      :titulo-seccion="$t('nav.income')"
      @logout="logout" 
      @cerrar-ruta="cerrarRuta"
    />
    
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-neutral-300 dark:border-gray-600 p-6 transition-colors duration-300">
        <div class="flex items-center justify-between mb-6" v-if="rutaAbierta || cargandoRuta">
          <!-- Título movido al header -->
        </div>
        
        <!-- Formulario para registrar ingreso -->
        <div v-if="cargandoRuta" class="bg-white/60 dark:bg-gray-800/60 border border-neutral-200 dark:border-gray-700 rounded-lg p-4 mb-6 transition-colors duration-300">
          <div class="text-center">
            <p class="text-gray-700 dark:text-gray-200 font-medium">{{ $t('common.loading') }}</p>
          </div>
        </div>

        <div v-else-if="!rutaAbierta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6 transition-colors duration-300">
          <div class="text-center">
            <p class="text-yellow-800 dark:text-yellow-200 font-medium">{{ $t('route.closed') }}</p>
            <p class="text-yellow-600 dark:text-yellow-300 text-sm mt-1">{{ $t('common.mustOpenRoute') }}</p>
          </div>
        </div>
        
        <div v-else-if="ingresos.length === 0" class="bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-600 rounded-lg p-4 mb-6 transition-colors duration-300">
          <h2 class="text-lg font-semibold text-green-800 dark:text-gray-100 mb-4">{{ $t('income.register') || 'Registrar Nuevo Ingreso' }}</h2>
          
          <form @submit.prevent="registrarIngreso" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('income.type') || 'Tipo de Ingreso' }}</label>
                <select 
                  v-model="nuevoIngreso.tipo" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="Base">Base</option>
                  <option value="Otros ingresos">Otros ingresos</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('payment.amount') }}</label>
                <input 
                  type="text" 
                  v-model="nuevoIngreso.valor" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="0.00"
                  required
                  @input="validarValor"
                />
              </div>
            </div>
            
            <div v-if="nuevoIngreso.tipo === 'Otros ingresos'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
              <textarea 
                v-model="nuevoIngreso.descripcion" 
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Descripción del ingreso..."
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              :disabled="registrando"
            >
              <span v-if="registrando">{{ $t('payment.saving') }}</span>
              <span v-else>{{ $t('income.register') || 'Registrar Ingreso' }}</span>
            </button>
          </form>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ $t('income.alreadyExists') }}. {{ $t('income.editBelow') }}</p>
        
        <!-- Lista de ingresos registrados -->
        <div class="bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-600 rounded-lg p-4 transition-colors duration-300">
          <h2 class="text-lg font-semibold text-green-800 dark:text-gray-100 mb-4">{{ $t('income.registered') || 'Ingresos Registrados' }}</h2>
          
          <div v-if="ingresos.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay ingresos registrados en esta ruta
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="ingreso in ingresos" 
              :key="ingreso._id"
              class="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-600 rounded-lg p-4 transition-colors duration-300"
            >
              <div class="flex justify-between items-center">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ ingreso.tipo }}</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">{{ new Date(ingreso.fecha).toLocaleString('es-ES') }}</span>
                  </div>
                  <div v-if="ingreso.descripcion" class="text-sm text-gray-600 dark:text-gray-300">
                    {{ ingreso.descripcion }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-600 dark:text-green-400">
                    ${{ ingreso.valor.toFixed(2) }}
                  </div>
                  <button
                    class="mt-2 px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    @click="empezarEdicion(ingreso)"
                  >Editar</button>
                  <button
                    class="mt-2 ml-2 px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                    @click="eliminarIngreso(ingreso)"
                  >Eliminar</button>
                </div>
              </div>

              <!-- Formulario de edición inline -->
              <div v-if="ingresoEnEdicionId === ingreso._id" class="mt-4 border-t pt-4">
                <form @submit.prevent="guardarEdicionIngreso">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('income.type') || 'Tipo de Ingreso' }}</label>
                      <select 
                        v-model="ingresoEdit.tipo" 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      >
                        <option value="Base">Base</option>
                        <option value="Otros ingresos">Otros ingresos</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('payment.amount') }}</label>
                      <input 
                        type="text" 
                        v-model="ingresoEdit.valor" 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('income.description') || 'Descripción' }} ({{ $t('common.optional') }})</label>
                      <input 
                        v-model="ingresoEdit.descripcion" 
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div class="mt-3 flex gap-2">
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" :disabled="guardandoEdicion">
                      <span v-if="guardandoEdicion">Guardando...</span>
                      <span v-else>Guardar cambios</span>
                    </button>
                    <button type="button" class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition" @click="cancelarEdicion">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación para eliminar ingreso -->
    <ConfirmModal
      :show="mostrarModalEliminar"
      title="Eliminar ingreso"
      message="¿Estás seguro de que deseas eliminar este ingreso? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      cancelText="Cancelar"
      @confirm="confirmarEliminarIngreso"
      @cancel="cancelarEliminarIngreso"
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

    <!-- Modal de éxito (ingreso registrado/actualizado/eliminado) -->
    <Teleport to="body">
      <div v-if="mostrarModalExitoIngreso" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="cerrarModalExitoIngreso"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-green-200/50 dark:border-green-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-10 h-10 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ tituloModalExitoIngreso }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-6 text-center leading-relaxed">{{ mensajeExitoIngreso }}</p>
            <div class="flex justify-center">
              <button @click="cerrarModalExitoIngreso" class="px-6 py-2.5 text-white bg-green-700 hover:bg-green-800 border-2 border-green-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md">
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
        <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-3 shadow-lg cursor-pointer" @click="reabrirModalLlaveIngreso">
          <p class="text-sm font-medium text-amber-800 dark:text-amber-200 text-center">Solicitud de llave enviada — Haz clic para ver el estado</p>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Llave necesaria (ingreso) -->
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
                Este ingreso de <strong>${{ formatNumLlave(datosLlave.venta, 0) }}</strong> excede el tope de <strong>${{ formatNumLlave(datosLlave.tope, 0) }}</strong> configurado por tu administrador.
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Solicita una llave para continuar con el registro del ingreso.</p>
              <button
                type="button"
                :disabled="solicitandoLlave"
                class="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                @click="solicitarLlaveIngreso"
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
                @click="usarLlaveIngreso"
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
                @click="cancelarLlaveIngreso">
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
import { consultarEstadoRuta, getUserTimezone } from '../utils/rutaUtils.js'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const { t } = useI18n()

const router = useRouter()
const ingresos = ref([])
const registrando = ref(false)
const rutaAbierta = ref(false)
const cargandoRuta = ref(true)
const mostrarModalEliminar = ref(false)
const ingresoAEliminar = ref(null)
const mostrarModalCerrarRuta = ref(false)
const mostrarModalAbrirRuta = ref(false)
const mostrarModalPendientes = ref(false)
const pendientesClientes = ref([])
const mostrarModalCajaNegativa = ref(false)
const mensajeCajaNegativa = ref('')
const detallesCajaNegativa = ref(null)
const rutaIdActual = ref(null)
const mostrarModalExitoIngreso = ref(false)
const tituloModalExitoIngreso = ref('')
const mensajeExitoIngreso = ref('')
let pollingInterval = null
const ingresoEnEdicionId = ref(null)
const guardandoEdicion = ref(false)
const ingresoEdit = ref({ tipo: 'Base', valor: '', descripcion: '' })
const nuevoIngreso = ref({
  tipo: 'Base',
  valor: '',
  descripcion: ''
 })

// ===== Llaves para Ingresos =====
const mostrarModalLlave = ref(false)
const estadoLlave = ref('pendiente')
const datosLlave = ref({ venta: 0, tope: 0 })
const solicitandoLlave = ref(false)
const solicitudExitosa = ref(false)
const codigoLlaveInput = ref('')
const validandoLlave = ref(false)
const errorLlave = ref('')
const solicitudLlaveId = ref(null)
const datosIngresoParaLlave = ref(null)
const edicionPendienteLlave = ref(null) // stores { resRuta, valorNum, ingresoEdit } for edit-after-key

// Cargar ingresos al montar
onMounted(async () => {
  await cargarIngresos()
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('ingreso-registrado', actualizarIngresos)
  window.addEventListener('ingreso-editado', actualizarIngresos)
  window.addEventListener('ingreso-eliminado', actualizarIngresos)
  window.addEventListener('ruta-cerrada', actualizarIngresos)
  window.addEventListener('ruta-abierta', actualizarIngresos)
})

// Función para actualizar ingresos cuando sea necesario
function actualizarIngresos() {
  cargarIngresos()
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('ingreso-registrado', actualizarIngresos)
  window.removeEventListener('ingreso-editado', actualizarIngresos)
  window.removeEventListener('ingreso-eliminado', actualizarIngresos)
  window.removeEventListener('ruta-cerrada', actualizarIngresos)
  window.removeEventListener('ruta-abierta', actualizarIngresos)
})

async function cargarIngresos() {
  cargandoRuta.value = true
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) {
      ingresos.value = []
      rutaAbierta.value = false
      rutaIdActual.value = null
      return
    }

    const estado = await consultarEstadoRuta()
    const ruta = estado?.ruta || null
    rutaAbierta.value = !!estado?.abierta

    if (!ruta || !ruta._id || !rutaAbierta.value) {
      ingresos.value = []
      rutaIdActual.value = null
      return
    }

    rutaIdActual.value = ruta._id

    // Obtener ingresos de la ruta - forzar recarga desde la base de datos
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/ingresos?ruta=${ruta._id}&_t=${timestamp}`, {
      cache: 'no-store'
    })
    if (res.ok) {
      ingresos.value = await res.json()
      }
  } catch (error) {
    console.error('Error al cargar ingresos:', error)
    ingresos.value = []
    rutaAbierta.value = false
    rutaIdActual.value = null
  } finally {
    cargandoRuta.value = false
  }
}

function validarValor(event) {
  // Solo permitir números y punto decimal
  const valor = event.target.value
  const regex = /^[0-9]*\.?[0-9]*$/
  
  if (!regex.test(valor)) {
    // Si no es válido, revertir al último valor válido
    event.target.value = valor.replace(/[^0-9.]/g, '')
  }
  
  // Evitar múltiples puntos decimales
  const puntos = valor.split('.').length - 1
  if (puntos > 1) {
    event.target.value = valor.replace(/\.+$/, '')
  }
}

function cerrarModalExitoIngreso() {
  mostrarModalExitoIngreso.value = false
}

// ===== Funciones de Llave =====
function formatNumLlave(n, dec = 0) {
  const num = Number(n)
  if (!isFinite(num)) return '0'
  return num.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

async function solicitarLlaveIngreso() {
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
        tipo: 'ingreso',
        datos: datosIngresoParaLlave.value
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

async function usarLlaveIngreso() {
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
      // Si es una edición pendiente, ejecutarla
      if (edicionPendienteLlave.value) {
        await ejecutarGuardarEdicion(edicionPendienteLlave.value)
        edicionPendienteLlave.value = null
      } else if (datosIngresoParaLlave.value) {
        await ejecutarRegistroIngreso(datosIngresoParaLlave.value)
        datosIngresoParaLlave.value = null
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

function cancelarLlaveIngreso() {
  mostrarModalLlave.value = false
  codigoLlaveInput.value = ''
  errorLlave.value = ''
  edicionPendienteLlave.value = null
}

function reabrirModalLlaveIngreso() {
  mostrarModalLlave.value = true
}

async function ejecutarRegistroIngreso(ingresoData) {
  registrando.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/ingresos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingresoData)
    })
    if (res.ok) {
      window.dispatchEvent(new CustomEvent('ingreso-registrado'))
      nuevoIngreso.value = { tipo: 'Base', valor: '', descripcion: '' }
      tituloModalExitoIngreso.value = t('income.registeredSuccessTitle')
      mensajeExitoIngreso.value = t('income.registeredSuccessMessage')
      mostrarModalExitoIngreso.value = true
      cargarIngresos()
      return
    }
    const error = await res.json()
    alert(`Error al registrar ingreso: ${error.error}`)
  } catch (error) {
    console.error('Error al registrar ingreso:', error)
    alert('Error al registrar ingreso')
  } finally {
    registrando.value = false
  }
}

async function registrarIngreso() {
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) {
    alert(t('common.couldNotIdentifyAdvisor'))
    return
  }

  let rutaId = rutaIdActual.value
  if (!rutaId) {
    const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
    const ruta = await resRuta.json()
    if (!ruta) {
      alert('No hay una ruta activa. Debes abrir una ruta primero.')
      return
    }
    rutaId = ruta._id
    rutaIdActual.value = rutaId
  }

  const valorNum = Number(nuevoIngreso.value.valor)
  if (!isFinite(valorNum) || valorNum <= 0) {
    alert('El valor debe ser mayor a 0')
    return
  }

  const ingresoData = {
    vendedor: vendedorId,
    ruta: rutaId,
    tipo: nuevoIngreso.value.tipo,
    valor: valorNum,
    descripcion: nuevoIngreso.value.descripcion || undefined
  }

  // Validar tope de ingresos
  try {
    const token = localStorage.getItem('sessionToken')
    const resVal = await fetch(`${API_BASE_URL}/api/vendedores/validar-ingreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ valor: valorNum })
    })
    if (resVal.ok) {
      const data = await resVal.json()
      if (data.necesitaLlave) {
        datosLlave.value = { venta: valorNum, tope: data.tope }
        datosIngresoParaLlave.value = ingresoData
        estadoLlave.value = 'pendiente'
        codigoLlaveInput.value = ''
        errorLlave.value = ''
        solicitudExitosa.value = false
        mostrarModalLlave.value = true
        return
      }
    }
  } catch (_) {}
  // Si no necesita llave o falla validación, proceder normal
  await ejecutarRegistroIngreso(ingresoData)
}

function empezarEdicion(ingreso) {
  ingresoEnEdicionId.value = ingreso._id
  ingresoEdit.value = {
    tipo: ingreso.tipo,
    valor: String(ingreso.valor ?? ''),
    descripcion: ingreso.descripcion || ''
  }
}

function cancelarEdicion() {
  ingresoEnEdicionId.value = null
  ingresoEdit.value = { tipo: 'Base', valor: '', descripcion: '' }
}

async function ejecutarGuardarEdicion(opts) {
  const { ruta, valorNum, ingresoEditData } = opts
  guardandoEdicion.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/ingresos/ruta/${ruta._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingresoEditData)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err?.error || 'Error al actualizar ingreso')
    }
    cancelarEdicion()
    tituloModalExitoIngreso.value = t('income.updatedSuccessTitle')
    mensajeExitoIngreso.value = t('income.updatedSuccessMessage')
    mostrarModalExitoIngreso.value = true
    cargarIngresos()
  } catch (e) {
    console.error('guardarEdicionIngreso error:', e)
    alert('Error al actualizar ingreso')
  } finally {
    guardandoEdicion.value = false
  }
}

async function guardarEdicionIngreso() {
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) return alert(t('common.couldNotIdentifyAdvisor'))
  const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
  const ruta = await resRuta.json()
  if (!ruta) return alert('No hay ruta activa')

  const valorNum = Number(ingresoEdit.value.valor)
  if (!isFinite(valorNum) || valorNum < 0) return alert('Valor inválido')

  const ingresoEditData = {
    tipo: ingresoEdit.value.tipo,
    valor: valorNum,
    descripcion: ingresoEdit.value.descripcion || undefined
  }

  // Validar tope de ingresos
  try {
    const token = localStorage.getItem('sessionToken')
    const resVal = await fetch(`${API_BASE_URL}/api/vendedores/validar-ingreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ valor: valorNum })
    })
    if (resVal.ok) {
      const data = await resVal.json()
      if (data.necesitaLlave) {
        datosLlave.value = { venta: valorNum, tope: data.tope }
        edicionPendienteLlave.value = { ruta, valorNum, ingresoEditData }
        estadoLlave.value = 'pendiente'
        codigoLlaveInput.value = ''
        errorLlave.value = ''
        solicitudExitosa.value = false
        mostrarModalLlave.value = true
        return
      }
    }
  } catch (_) {}
  await ejecutarGuardarEdicion({ ruta, valorNum, ingresoEditData })
}

function eliminarIngreso(ingreso) {
  ingresoAEliminar.value = ingreso
  mostrarModalEliminar.value = true
}

async function confirmarEliminarIngreso() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
    const ruta = await resRuta.json()
    if (!ruta) return alert('No hay ruta activa')
    const r = await fetch(`${API_BASE_URL}/api/ingresos/ruta/${ruta._id}`, { method: 'DELETE' })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return alert(err?.error || 'Error al eliminar ingreso')
    }
    mostrarModalEliminar.value = false
    ingresoAEliminar.value = null
    tituloModalExitoIngreso.value = t('income.deletedSuccessTitle')
    mensajeExitoIngreso.value = t('income.deletedSuccessMessage')
    mostrarModalExitoIngreso.value = true
    cargarIngresos()
  } catch (e) {
    console.error('eliminarIngreso error:', e)
    alert('Error al eliminar ingreso')
  }
}

function cancelarEliminarIngreso() {
  mostrarModalEliminar.value = false
  ingresoAEliminar.value = null
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
  } catch (e) {
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

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true
}

async function confirmarCerrarRuta() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return

    const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vendedorId })
    })

    if (res.ok) {
      mostrarModalCerrarRuta.value = false
      // Recargar estado de ruta y datos desde la base de datos
      await cargarIngresos()
      // Disparar evento para que otras vistas se actualicen
      window.dispatchEvent(new CustomEvent('ruta-cerrada'))
      alert('Ruta cerrada exitosamente')
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
        alert(errorData?.msg || errorData?.error || 'Error al cerrar la ruta')
      }
    }
  } catch (error) {
    console.error('Error al cerrar ruta:', error)
    alert('Error al cerrar ruta')
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
    await cargarIngresos()
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
    alert('Ruta abierta exitosamente')
  } else {
    const data = await res.json().catch(() => ({}))
    alert(data.msg || data.error || 'No se pudo abrir la ruta')
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false
}
</script> 
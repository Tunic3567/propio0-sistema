  <template>
<div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme flex flex-col items-center justify-center px-3 sm:px-4 box-border">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-neutral-300 dark:border-gray-700 p-6 w-full max-w-md min-w-0 transition-colors duration-300">
        <button
          @click="volver"
          class="mb-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center"
          type="button"
        >
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h2 class="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">{{ t('payment.register') }}</h2>
        <!-- Selección de tipo de pago: en pantallas pequeñas 2 columnas para que el texto no se desborde -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <label v-for="op in opciones" :key="op.value" class="flex flex-col min-w-0 cursor-pointer">
            <input
              type="radio"
              class="hidden peer"
              v-model="tipo"
              :value="op.value"
            />
            <div
              :class="[
                'flex items-center justify-center min-h-[2.75rem] py-2 px-1 rounded text-center font-semibold transition border-2 shadow-sm break-words',
                tipo === op.value
                  ? op.value === 'Parcela'
                    ? 'bg-blue-600 border-blue-700 text-white'
                    : op.value === 'Abono'
                    ? 'bg-green-600 border-green-700 text-white'
                    : 'bg-red-600 border-red-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 border-neutral-300 dark:border-gray-600 text-gray-800 dark:text-gray-100'
              ]"
            >
              <span class="leading-tight text-sm sm:text-base">{{ op.label }}</span>
            </div>
          </label>
        </div>

        <!-- Formulario -->
        <form class="space-y-4">
          <!-- Solo mostrar campos si NO es 'No pago' -->
          <div v-if="tipo !== 'No pago'">
            <!-- Valor -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ t('payment.amount') }}</label>
              <input
                v-if="tipo === 'Abono'"
                v-model="valorAbono"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              <input
                v-else
                :value="valorTotalParcelas"
                type="number"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                readonly
                tabindex="-1"
              />
            </div>

            <!-- Número de parcelas -->
            <div v-if="tipo === 'Parcela'">
              <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ t('payment.installmentCount') || 'Número de parcelas' }}</label>
              <select v-model.number="numParcelas" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option v-for="n in maxParcelas" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
          </div>

          <!-- Observaciones siempre visible -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ t('payment.comment') }} ({{ t('common.optional') || 'opcional' }})</label>
            <textarea v-model="observaciones" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows="2"></textarea>
          </div>

          <!-- Saldos siempre visible -->
          <div class="mt-4 text-base">
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 mb-2">
              <span class="font-semibold text-gray-700 dark:text-gray-200">{{ t('client.remainingBalance') }}</span>
              <span class="font-semibold tabular-nums text-red-600 dark:text-red-300">${{ saldoBaseParaCalculo.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-600 rounded-md px-3 py-2">
              <span class="font-semibold text-gray-700 dark:text-gray-200">{{ t('payment.newBalance') }}</span>
              <span class="font-semibold text-green-700">${{ nuevoSaldo }}</span>
            </div>
          </div>

          <!-- Botón Guardar -->
          <button
            @click="guardarPago"
            type="button"
            :disabled="guardando"
            class="w-full mt-4 bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg border-2 border-green-800/60 shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="guardando" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('payment.saving') }}
            </span>
            <span v-else>{{ t('common.save') }}</span>
          </button>
        </form>
      </div>

      <!-- Modal de renovación -->
      <Teleport to="body">
        <div v-if="mostrarModalRenovar" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalRenovar = false"></div>
          <div class="relative z-10 max-h-[min(90dvh,100%)] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-blue-200/50 dark:border-blue-700/50 transition-all duration-300" @click.stop>
            <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-10 h-10 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ t('payment.renewClient') }}</h2>
              </div>
            </div>
            <div class="p-6">
              <p class="text-base text-gray-700 dark:text-gray-300 mb-6 text-center leading-relaxed">{{ t('payment.clientFinished') }}</p>
              <div class="flex justify-center gap-3">
                <button type="button" @click.stop="finalizarCliente" class="px-5 py-2.5 text-neutral-800 dark:text-slate-200 bg-white dark:bg-gray-700 border-2 border-neutral-400 dark:border-slate-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-600 font-semibold transition-all duration-200 shadow-sm">{{ t('payment.finalize') }}</button>
                <button type="button" @click.stop="renovarCliente" class="px-5 py-2.5 text-white bg-blue-700 hover:bg-blue-800 border-2 border-blue-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md">{{ t('payment.renew') }}</button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Modal de éxito (pago registrado/actualizado) -->
      <Teleport to="body">
        <div v-if="mostrarModalExito" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="cerrarModalExito"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-green-200/50 dark:border-green-700/50 transition-all duration-300">
            <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-10 h-10 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ tituloModalExito || t('payment.registeredSuccess') }}</h2>
              </div>
            </div>
            <div class="p-6">
              <p class="text-base text-gray-700 dark:text-gray-300 mb-6 text-center leading-relaxed">{{ mensajeExito }}</p>
              <div class="flex justify-center">
                <button @click="cerrarModalExito" class="px-6 py-2.5 text-white bg-green-700 hover:bg-green-800 border-2 border-green-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md">
                  {{ t('common.accept') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Modal de pago duplicado -->
      <Teleport to="body">
        <div v-if="mostrarModalPagoDuplicado" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="cancelarSobrescribir"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-orange-200/50 dark:border-orange-700/50 transition-all duration-300">
            <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-orange-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-10 h-10 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ t('payment.alreadyRegistered') }}</h2>
              </div>
            </div>
            <div class="p-6">
              <p class="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {{ t('payment.paymentExists') }}
              </p>
              <div v-if="pagoExistente" class="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-inner">
                <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">{{ t('payment.existingPayment') }}:</p>
                <div class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <div class="flex justify-between"><span class="font-medium">{{ t('payment.type') }}:</span> <span class="font-bold">{{ pagoExistente.tipo }}</span></div>
                  <div class="flex justify-between"><span class="font-medium">{{ t('payment.amount') }}:</span> <span class="font-bold text-green-600">${{ pagoExistente.valor }}</span></div>
                  <div v-if="pagoExistente.numParcelas" class="flex justify-between"><span class="font-medium">{{ t('client.installment') }}:</span> <span class="font-bold">{{ pagoExistente.numParcelas }}</span></div>
                  <div v-if="pagoExistente.observaciones" class="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span class="font-medium">{{ t('payment.observations') }}:</span>
                    <p class="text-gray-600 dark:text-gray-400 mt-1">{{ pagoExistente.observaciones }}</p>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                    {{ t('payment.date') }}: {{ pagoExistente.fecha ? new Date(pagoExistente.fecha).toLocaleString(dateLocale.value) : '-' }}
                  </div>
                </div>
              </div>
              <p class="mb-6 text-base text-gray-700 dark:text-gray-300 font-medium">
                {{ t('payment.overwriteQuestion') }}
              </p>
              <div class="flex justify-end gap-3">
                <button @click="cancelarSobrescribir" class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm">
                  {{ t('common.cancel') }}
                </button>
                <button @click="confirmarSobrescribir" class="px-5 py-2.5 text-white bg-orange-700 hover:bg-orange-800 border-2 border-orange-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md">
                  {{ t('payment.overwrite') }}
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
import { enqueueOfflinePago, emitOfflinePagosChanged, getOfflinePendingCount } from '../utils/offlinePagoQueue.js'
import { consultarEstadoRuta } from '../utils/rutaUtils.js'

  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useClienteStore } from '../stores/useClienteStore'
  
  const { t, locale } = useI18n()

  const route = useRoute()
  const router = useRouter()
  
  const dateLocale = computed(() => {
    const localeMap = {
      'es': 'es-ES',
      'pt': 'pt-BR',
      'en': 'en-US'
    }
    return localeMap[locale.value] || 'es-ES'
  })
  
  const opciones = computed(() => [
    { value: 'Parcela', label: t('payment.types.installment') },
    { value: 'Abono', label: t('payment.types.payment') },
    { value: 'No pago', label: t('payment.types.noPayment') }
  ])
  const tipo = ref('Parcela')
  /** Texto libre para Abono (vacío al elegir Abono, sin “0” por defecto) */
  const valorAbono = ref('')
  const numParcelas = ref(1)
  const observaciones = ref('')

  const clienteStore = useClienteStore()
  const cliente = computed(() => clienteStore.clienteSeleccionado)
  const cargando = ref(true)
  const mostrarModalRenovar = ref(false)
  // Snapshot para que "Renovar" funcione aunque el store se desincronice momentáneamente
  const clienteRenovarSnapshot = ref(null)
  const mostrarModalPagoDuplicado = ref(false)
  const mostrarModalExito = ref(false)
  const mensajeExito = ref('')
  const tituloModalExito = ref('')
  const pagoExistente = ref(null) // Pago existente del cliente en la ruta actual (si lo hay)
  const rutaIdActual = ref(null)
  const datosPagoPendiente = ref(null)
  const guardando = ref(false)

  onMounted(async () => {
    // Si el store viene vacío (algunos navegadores/dispositivos), reintentar desde localStorage
    if (!cliente.value) {
      try {
        const raw = localStorage.getItem('clienteSeleccionado')
        const parsed = raw ? JSON.parse(raw) : null
        if (parsed && parsed._id) {
          clienteStore.setCliente(parsed)
        }
      } catch (_) {}
      if (!cliente.value) {
        router.push('/vendedor')
        return
      }
    }

    // Detectar si ya existe un pago para este cliente en la ruta ACTUAL
    try {
      const vendedorId = localStorage.getItem('vendedorId')
      const estadoRuta = await consultarEstadoRuta()
      const rutaData = estadoRuta?.ruta
      if (rutaData && rutaData._id) {
        rutaIdActual.value = rutaData._id
        // Cargar pagos del vendedor y filtrar por cliente + ruta actual
        const resPagos = await fetch(`${API_BASE_URL}/api/pagos/vendedor/${vendedorId}`)
        if (resPagos.ok) {
          const pagosVendedor = await resPagos.json()
          const existente = pagosVendedor.find(p => String(p.cliente?._id || p.cliente) === String(cliente.value._id) && String(p.ruta?._id || p.ruta) === String(rutaIdActual.value))
          if (existente) {
            pagoExistente.value = existente
          }
        }
      }
    } catch (e) {
      // No bloquear la UI si falla; simplemente no habrá pre-carga de pago existente
    }
  })

  // Asegurarse de que los campos sean números válidos
  const dias = computed(() => Number(cliente.value.dias) || 0)
  const valorParcela = computed(() => Number(cliente.value.parcela) || 0)
  const saldoActual = computed(() => Number(cliente.value.total) || 0)
  // Si hay pago existente en la ruta actual, usar su saldo_antes para permitir seleccionar todas las parcelas (incluida la ya pagada)
  const saldoBaseParaCalculo = computed(() => {
    if (pagoExistente.value && (pagoExistente.value.saldo_antes !== undefined && pagoExistente.value.saldo_antes !== null)) {
      return Number(pagoExistente.value.saldo_antes) || saldoActual.value
    }
    // Si no viene saldo_antes (por compatibilidad), aproximar sumando el valor del pago existente
    if (pagoExistente.value && (pagoExistente.value.valor !== undefined)) {
      return Number(saldoActual.value) + Number(pagoExistente.value.valor || 0)
    }
    return saldoActual.value
  })
  const maxParcelas = computed(() => {
    const diasNum = Number(dias.value) || 1;
    const valorParcelaNum = Number(valorParcela.value) || 1;
    const saldoNum = Number(saldoBaseParaCalculo.value) || 0;
    const porSaldo = Math.floor(saldoNum / valorParcelaNum);
    // Siempre al menos 1
    return Math.max(1, Math.min(diasNum, porSaldo));
  })

  watch([numParcelas, saldoActual, valorParcela], () => {
    // Si el usuario selecciona más cuotas de las permitidas, ajusta automáticamente
    if (numParcelas.value > maxParcelas.value) {
      numParcelas.value = maxParcelas.value
    }
  })

  // Al pasar a Abono, vaciar monto si solo había 0 (mejor UX al escribir el valor)
  watch(tipo, (t, prev) => {
    if (t !== 'Abono' || prev === undefined || prev === 'Abono') return
    const s = String(valorAbono.value ?? '').trim()
    const n = parseFloat(s)
    if (s === '' || s === '0' || (!Number.isNaN(n) && n === 0)) {
      valorAbono.value = ''
    }
  })

  const valorTotalParcelas = computed(() => {
    if (tipo.value === 'Parcela') {
      return (valorParcela.value * numParcelas.value).toFixed(2);
    }
    return '0.00'; // Para 'No pago'
  });

  const nuevoSaldo = computed(() => {
    let cuotas = numParcelas.value
    if (tipo.value === 'Parcela') {
      cuotas = Math.min(numParcelas.value, maxParcelas.value)
      return Math.max(0, saldoBaseParaCalculo.value - valorParcela.value * cuotas).toFixed(2)
    }
    if (tipo.value === 'Abono') {
      const v = parseFloat(valorAbono.value)
      const abono = Number.isNaN(v) ? 0 : v
      return Math.max(0, saldoBaseParaCalculo.value - abono).toFixed(2)
    }
    return saldoBaseParaCalculo.value.toFixed(2)
  })

  function volver() {
    // Emitir evento personalizado para actualizar el dashboard
    window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
    router.push('/vendedor')
  }

  function aplicarSaldoLocalOptimista(nuevoSaldo) {
    if (!cliente.value?._id) return
    const c = { ...cliente.value, total: Number(nuevoSaldo) }
    clienteStore.setCliente(c)
    try {
      localStorage.setItem('clienteSeleccionado', JSON.stringify(c))
    } catch (_) {}
  }

  async function encolarPagoOffline(pago, nuevoSaldoCalc) {
    await enqueueOfflinePago(pago)
    aplicarSaldoLocalOptimista(nuevoSaldoCalc)
    const n = await getOfflinePendingCount()
    emitOfflinePagosChanged(n)
    window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
    if (nuevoSaldoCalc === 0) {
      clienteRenovarSnapshot.value = cliente.value ? { ...cliente.value, total: 0 } : null
      mostrarModalRenovar.value = true
      return
    }
    tituloModalExito.value = t('payment.offlineQueuedTitle')
    mensajeExito.value = t('payment.offlineQueued')
    mostrarModalExito.value = true
  }

  // Actualizar el pago en la base de datos usando la API
  async function guardarPago() {
    if (!cliente.value._id) {
      alert('Cliente no encontrado');
      return;
    }

    // Usar ruta en caché (onMounted) para evitar esperar un GET extra; solo consultar si no la tenemos
    const vendedorId = localStorage.getItem('vendedorId');
    let rutaId = rutaIdActual.value;
    if (!rutaId) {
      try {
        const estadoRuta = await consultarEstadoRuta();
        const rutaData = estadoRuta?.ruta;
        if (!rutaData || !rutaData._id) {
          alert('No hay ruta activa. Debes abrir una ruta antes de registrar pagos.');
          return;
        }
        rutaId = rutaData._id;
        rutaIdActual.value = rutaId;
      } catch (e) {
        alert('Error al consultar la ruta activa');
        return;
      }
    }

    // Validaciones
    if (tipo.value === 'Abono') {
      const valorNumerico = parseFloat(valorAbono.value);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        alert('El valor del abono debe ser un número mayor que 0');
        return;
      }
      // Comparar con saldoBaseParaCalculo (mismo que "Saldo restante" en pantalla), no con el total del cliente:
      // al editar un pago en la ruta actual, el cliente ya tiene saldo reducido pero el abono debe limitarse al saldo antes de este pago.
      if (valorNumerico > saldoBaseParaCalculo.value) {
        alert('El valor del abono no puede ser mayor al saldo restante de este pago');
        return;
      }
    }

    // Calcular el nuevo saldo usando el saldo base (antes del posible pago existente)
    let nuevoSaldoCalc = saldoBaseParaCalculo.value;
    if (tipo.value === 'Parcela') {
      nuevoSaldoCalc = saldoBaseParaCalculo.value - valorParcela.value * numParcelas.value;
    } else if (tipo.value === 'Abono') {
      const v = parseFloat(valorAbono.value)
      nuevoSaldoCalc = saldoBaseParaCalculo.value - (Number.isNaN(v) ? 0 : v);
    }
    // 'No pago' no afecta el saldo
    nuevoSaldoCalc = Math.max(0, Number(nuevoSaldoCalc.toFixed(2)))

    // 1. Guardar el pago en la base de datos
    const pago = {
      cliente: cliente.value._id,
      tipo: tipo.value,
      valor: tipo.value === 'Parcela' ? valorParcela.value * numParcelas.value : (tipo.value === 'Abono' ? parseFloat(valorAbono.value) : 0),
      numParcelas: tipo.value === 'Parcela' ? numParcelas.value : undefined,
      observaciones: observaciones.value,
      saldo_antes: saldoBaseParaCalculo.value,
      saldo_despues: nuevoSaldoCalc,
      fecha: new Date(),
      ruta: rutaId
    };

    const sinRed =
      typeof navigator !== 'undefined' && navigator.onLine === false
    if (sinRed) {
      guardando.value = true
      try {
        await encolarPagoOffline(pago, nuevoSaldoCalc)
      } catch (err) {
        console.error(err)
        alert(t('payment.offlineEnqueueFailed'))
      } finally {
        guardando.value = false
      }
      return
    }

    guardando.value = true;
    try {
      const resPago = await fetch(`${API_BASE_URL}/api/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pago)
      });

      if (!resPago.ok) {
        const errorData = await resPago.json();
        if (errorData.codigo === 'PAGO_DUPLICADO' || errorData.codigo === 'PAGO_DUPLICADO_BD') {
          pagoExistente.value = errorData.pagoExistente || null;
          datosPagoPendiente.value = pago;
          mostrarModalPagoDuplicado.value = true;
          return;
        } else {
          alert(`Error al registrar el pago: ${errorData.error || 'Error desconocido'}`);
        }
        return;
      }

      tituloModalExito.value = ''
      window.dispatchEvent(new CustomEvent('actualizar-dashboard'));
      window.dispatchEvent(new CustomEvent('pago-registrado'));

      if (nuevoSaldoCalc === 0) {
        // Guardar snapshot del cliente para que el botón "Renovar" sea robusto
        clienteRenovarSnapshot.value = cliente.value ? { ...cliente.value } : null
        mostrarModalRenovar.value = true;
        return;
      }

      mensajeExito.value = t('payment.registeredOk');
      mostrarModalExito.value = true;
    } catch (e) {
      try {
        await encolarPagoOffline(pago, nuevoSaldoCalc)
      } catch (e2) {
        console.error(e, e2)
        alert(t('payment.offlineEnqueueFailed'))
      }
    } finally {
      guardando.value = false;
    }
  }

  function cerrarModalExito() {
    tituloModalExito.value = ''
    mostrarModalExito.value = false;
    router.push('/vendedor');
  }

  async function renovarCliente() {
    // Usar snapshot (o store/localStorage) para evitar fallos intermitentes en algunos dispositivos
    let c = clienteRenovarSnapshot.value || cliente.value || clienteStore.clienteSeleccionado
    if (!c || !c._id) {
      try {
        const raw = localStorage.getItem('clienteSeleccionado')
        const parsed = raw ? JSON.parse(raw) : null
        if (parsed && parsed._id) c = parsed
      } catch (_) {}
    }
    if (!c || !c._id) {
      // No sacar al usuario de la pantalla: solo mostrar error (evita “me mandó al dashboard”)
      alert(t('payment.renewNoClientData'))
      return
    }
    const idStr = String(c._id)
    const query = {
      renovado: 'true',
      idAnterior: idStr,
      nombres: c.nombres != null ? String(c.nombres) : '',
      apellidos: c.apellidos != null ? String(c.apellidos) : '',
      cc: c.cc != null ? String(c.cc) : '',
      apodo: c.apodo != null ? String(c.apodo) : '',
      celular: c.celular != null ? String(c.celular) : '',
      direccion: c.direccion != null ? String(c.direccion) : '',
      direccion_residencial: c.direccion_residencial != null ? String(c.direccion_residencial) : ''
    }
    if (c.valor != null && c.valor !== '') query.valor = String(c.valor)
    if (c.dias != null && c.dias !== '') query.parcelas = String(c.dias)
    if (c.frecuencia) query.frecuencia = String(c.frecuencia)

    mostrarModalRenovar.value = false
    clienteRenovarSnapshot.value = null
    try {
      await router.push({ path: '/crear-cliente', query })
    } catch (e) {
      console.error('Renovar → crear-cliente:', e)
      alert(t('payment.renewNavigateError'))
    }
  }

  async function finalizarCliente() {
    mostrarModalRenovar.value = false;
    // Marcar el cliente como cancelado en la base de datos
    try {
      if (!cliente.value?._id) {
        router.push('/vendedor')
        return
      }
      await fetch(`${API_BASE_URL}/api/clientes/${cliente.value._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelado: true })
      });
    } catch (e) {}
    // Emitir evento para que el dashboard lo oculte (no eliminar de la base)
    window.dispatchEvent(new CustomEvent('ocultar-cliente', { detail: cliente.value._id }))
    router.push('/vendedor')
  }

  function cancelarSobrescribir() {
    mostrarModalPagoDuplicado.value = false;
    pagoExistente.value = null;
    datosPagoPendiente.value = null;
  }

  async function confirmarSobrescribir() {
    if (!pagoExistente.value || !datosPagoPendiente.value) {
      mostrarModalPagoDuplicado.value = false;
      return;
    }

    try {
      // Actualizar el pago existente
      const resPago = await fetch(`${API_BASE_URL}/api/pagos/${pagoExistente.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: datosPagoPendiente.value.tipo,
          valor: datosPagoPendiente.value.valor,
          numParcelas: datosPagoPendiente.value.numParcelas,
          observaciones: datosPagoPendiente.value.observaciones,
          saldo_antes: datosPagoPendiente.value.saldo_antes,
          saldo_despues: datosPagoPendiente.value.saldo_despues
        })
      });

      if (!resPago.ok) {
        const errorData = await resPago.json();
        alert(`Error al actualizar el pago: ${errorData.error || 'Error desconocido'}`);
        return;
      }

      // El backend ya actualiza el saldo del cliente al editar el pago (actualizarEstadoCliente)
      const nuevoSaldoCalc = datosPagoPendiente.value.saldo_despues;
      mostrarModalPagoDuplicado.value = false;
      pagoExistente.value = null;
      datosPagoPendiente.value = null;
      window.dispatchEvent(new CustomEvent('actualizar-dashboard'));
      window.dispatchEvent(new CustomEvent('pago-editado'));

      if (nuevoSaldoCalc === 0) {
        mostrarModalRenovar.value = true;
        return;
      }

      mensajeExito.value = t('payment.updatedOk');
      mostrarModalExito.value = true;
    } catch (e) {
      alert('Error de conexión con el servidor');
      console.error('Error al sobrescribir pago:', e);
    }
  }

  // Logout robusto por si se usa navbar aquí también
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
  </script>

  <style>
  </style>

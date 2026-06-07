  <template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex flex-col items-center justify-center">
      <div class="bg-white dark:bg-gray-800 rounded shadow p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
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
        <!-- Selección de tipo de pago -->
        <div class="flex justify-between mb-4">
          <label v-for="op in opciones" :key="op.value" class="flex-1 mx-1">
            <input
              type="radio"
              class="hidden peer"
              v-model="tipo"
              :value="op.value"
            />
            <div
              :class="[
                'py-2 rounded text-center cursor-pointer font-semibold transition',
                tipo === op.value
                  ? op.value === 'Parcela'
                    ? 'bg-blue-600 text-white'
                    : op.value === 'Abono'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100'
              ]"
            >
              {{ op.label }}
            </div>
          </label>
        </div>

        <!-- Formulario -->
        <form class="space-y-4">
          <!-- Solo mostrar campos si NO es 'No pago' ni 'No aplica' -->
          <div v-if="tipo !== 'No pago' && tipo !== 'No aplica'">
            <!-- Valor -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ t('payment.amount') }}</label>
              <input
                v-if="tipo === 'Abono'"
                v-model="valor"
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
              <span class="font-semibold text-red-700">${{ saldoBaseParaCalculo.toFixed(2) }}</span>
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
            class="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            {{ t('common.save') }}
          </button>
        </form>
      </div>

      <!-- Modal de renovación -->
      <Teleport to="body">
        <div v-if="mostrarModalRenovar" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalRenovar = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-blue-200/50 dark:border-blue-700/50 transition-all duration-300">
            <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
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
                <button @click="finalizarCliente" class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm">{{ t('payment.finalize') }}</button>
                <button @click="renovarCliente" class="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ t('payment.renew') }}</button>
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
            <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
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
                <button @click="confirmarSobrescribir" class="px-5 py-2.5 text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg hover:from-orange-700 hover:to-orange-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
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
    { value: 'No pago', label: t('payment.types.noPayment') },
    { value: 'No aplica', label: t('payment.types.notApplicable') }
  ])
  const tipo = ref('Parcela')
  const valor = ref(0)
  const numParcelas = ref(1)
  const observaciones = ref('')

  const clienteStore = useClienteStore()
  const cliente = computed(() => clienteStore.clienteSeleccionado)
  const cargando = ref(true)
  const mostrarModalRenovar = ref(false)
  const mostrarModalPagoDuplicado = ref(false)
  const pagoExistente = ref(null) // Pago existente del cliente en la ruta actual (si lo hay)
  const rutaIdActual = ref(null)
  const datosPagoPendiente = ref(null)

  onMounted(async () => {
    if (!cliente.value) {
      router.push('/vendedor')
      return
    }

    // Detectar si ya existe un pago para este cliente en la ruta ACTUAL
    try {
      const vendedorId = localStorage.getItem('vendedorId')
      const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
      const rutaData = await resRuta.json()
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

  const valorTotalParcelas = computed(() => {
    if (tipo.value === 'Parcela') {
      return (valorParcela.value * numParcelas.value).toFixed(2);
    }
    return '0.00'; // Para 'No pago' y 'No aplica'
  });

  const nuevoSaldo = computed(() => {
    let cuotas = numParcelas.value
    if (tipo.value === 'Parcela') {
      cuotas = Math.min(numParcelas.value, maxParcelas.value)
      return Math.max(0, saldoBaseParaCalculo.value - valorParcela.value * cuotas).toFixed(2)
    }
    if (tipo.value === 'Abono') {
      return Math.max(0, saldoBaseParaCalculo.value - valor.value).toFixed(2)
    }
    return saldoBaseParaCalculo.value.toFixed(2)
  })

  function volver() {
    // Emitir evento personalizado para actualizar el dashboard
    window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
    router.push('/vendedor')
  }

  // Actualizar el pago en la base de datos usando la API
  async function guardarPago() {
    if (!cliente.value._id) {
      alert('Cliente no encontrado');
      return;
    }

    // Obtener la ruta activa del vendedor
    const vendedorId = localStorage.getItem('vendedorId');
    let rutaId = null;
    try {
      const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`);
      const rutaData = await resRuta.json();
      if (!rutaData || !rutaData._id) {
        alert('No hay ruta activa. Debes abrir una ruta antes de registrar pagos.');
        return;
      }
      rutaId = rutaData._id;
    } catch (e) {
      alert('Error al consultar la ruta activa');
      return;
    }

    // Validaciones
    if (tipo.value === 'Abono') {
      const valorNumerico = parseFloat(valor.value);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        alert('El valor del abono debe ser un número mayor que 0');
        return;
      }
      if (valorNumerico > saldoActual.value) {
        alert('El valor del abono no puede ser mayor al saldo actual');
        return;
      }
      // Actualizar el valor con el número convertido
      valor.value = valorNumerico;
    }

    // Calcular el nuevo saldo usando el saldo base (antes del posible pago existente)
    let nuevoSaldoCalc = saldoBaseParaCalculo.value;
    if (tipo.value === 'Parcela') {
      nuevoSaldoCalc = saldoBaseParaCalculo.value - valorParcela.value * numParcelas.value;
    } else if (tipo.value === 'Abono') {
      nuevoSaldoCalc = saldoBaseParaCalculo.value - valor.value;
    }
    // 'No pago' y 'No aplica' no afectan el saldo
    nuevoSaldoCalc = Math.max(0, Number(nuevoSaldoCalc.toFixed(2)))

    // 1. Guardar el pago en la base de datos
    const pago = {
      cliente: cliente.value._id,
      tipo: tipo.value,
      valor: tipo.value === 'Parcela' ? valorParcela.value * numParcelas.value : (tipo.value === 'Abono' ? valor.value : 0),
      numParcelas: tipo.value === 'Parcela' ? numParcelas.value : undefined,
      observaciones: observaciones.value,
      saldo_antes: saldoBaseParaCalculo.value,
      saldo_despues: nuevoSaldoCalc,
      fecha: new Date(),
      ruta: rutaId
    };

    try {
      const resPago = await fetch(`${API_BASE_URL}/api/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pago)
      });

      if (!resPago.ok) {
        const errorData = await resPago.json();
        if (errorData.codigo === 'PAGO_DUPLICADO' || errorData.codigo === 'PAGO_DUPLICADO_BD') {
          // Mostrar modal de confirmación para sobrescribir
          pagoExistente.value = errorData.pagoExistente || null;
          datosPagoPendiente.value = pago;
          mostrarModalPagoDuplicado.value = true;
          return;
        } else {
          alert(`Error al registrar el pago: ${errorData.error || 'Error desconocido'}`);
        }
        return;
      }

      // 2. Actualizar el saldo del cliente
      const resCliente = await fetch(`${API_BASE_URL}/api/clientes/${cliente.value._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: nuevoSaldoCalc })
      });

      if (!resCliente.ok) {
        alert('Pago registrado, pero error al actualizar el saldo del cliente');
        return;
      }

      if (nuevoSaldoCalc === 0) {
        mostrarModalRenovar.value = true;
        return;
      }

      alert('Pago registrado correctamente');
      window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
      router.push('/vendedor');
    } catch (e) {
      alert('Error de conexión con el servidor');
    }
  }

  async function renovarCliente() {
    mostrarModalRenovar.value = false;
    // NO marcar el cliente anterior como cancelado aquí - dejar que CrearCliente.vue lo maneje
    // Esto permite que ambos clientes aparezcan (el anterior y el renovado) hasta que se cree el nuevo
    // Redirigir a crear cliente con datos actuales y flag renovado
    router.push({
      path: '/crear-cliente',
      query: {
        nombres: cliente.value.nombres,
        apellidos: cliente.value.apellidos,
        cc: cliente.value.cc,
        apodo: cliente.value.apodo,
        celular: cliente.value.celular,
        direccion: cliente.value.direccion,
        direccion_residencial: cliente.value.direccion_residencial,
        renovado: 'true',
        idAnterior: cliente.value._id
      }
    })
  }

  async function finalizarCliente() {
    mostrarModalRenovar.value = false;
    // Marcar el cliente como cancelado en la base de datos
    try {
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

      // Actualizar el saldo del cliente
      const nuevoSaldoCalc = datosPagoPendiente.value.saldo_despues;
      const resCliente = await fetch(`${API_BASE_URL}/api/clientes/${cliente.value._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: nuevoSaldoCalc })
      });

      if (!resCliente.ok) {
        alert('Pago actualizado, pero error al actualizar el saldo del cliente');
        return;
      }

      mostrarModalPagoDuplicado.value = false;
      pagoExistente.value = null;
      datosPagoPendiente.value = null;

      if (nuevoSaldoCalc === 0) {
        mostrarModalRenovar.value = true;
        return;
      }

      alert('Pago actualizado correctamente');
      window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
      router.push('/vendedor');
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
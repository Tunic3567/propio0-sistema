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
        <h2 class="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Registrar Pago</h2>
        <!-- Selección de tipo de pago -->
        <div class="flex justify-between mb-4">
          <label v-for="op in opciones" :key="op" class="flex-1 mx-1">
            <input
              type="radio"
              class="hidden peer"
              v-model="tipo"
              :value="op"
            />
            <div
              :class="[
                'py-2 rounded text-center cursor-pointer font-semibold transition',
                tipo === op
                  ? op === 'Parcela'
                    ? 'bg-blue-600 text-white'
                    : op === 'Abono'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100'
              ]"
            >
              {{ op }}
            </div>
          </label>
        </div>

        <!-- Formulario -->
        <form class="space-y-4">
          <!-- Solo mostrar campos si NO es 'No pago' ni 'No aplica' -->
          <div v-if="tipo !== 'No pago' && tipo !== 'No aplica'">
            <!-- Valor -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Valor</label>
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
              <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Número de parcelas</label>
              <select v-model.number="numParcelas" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option v-for="n in maxParcelas" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
          </div>

          <!-- Observaciones siempre visible -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Observaciones (opcional)</label>
            <textarea v-model="observaciones" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows="2"></textarea>
          </div>

          <!-- Saldos siempre visible -->
          <div class="mt-4 text-base">
            <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 mb-2">
              <span class="font-semibold text-gray-700 dark:text-gray-200">Saldo actual</span>
              <span class="font-semibold text-red-700">${{ saldoActual }}</span>
            </div>
            <div class="flex items-center justify-between bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-600 rounded-md px-3 py-2">
              <span class="font-semibold text-gray-700 dark:text-gray-200">Nuevo saldo</span>
              <span class="font-semibold text-green-700">${{ parseInt(nuevoSaldo) }}</span>
            </div>
          </div>

          <!-- Botón Guardar -->
          <button
            @click="guardarPago"
            type="button"
            class="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Guardar
          </button>
        </form>
      </div>

      <!-- Modal de renovación -->
      <div v-if="mostrarModalRenovar" class="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">¿Desea renovar este cliente?</h2>
          <p class="mb-6 text-center text-gray-700 dark:text-gray-300">El cliente ha finalizado el pago.</p>
          <div class="flex justify-center gap-4">
            <button @click="renovarCliente" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Renovar</button>
            <button @click="finalizarCliente" class="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">No, finalizar</button>
          </div>
        </div>
      </div>

      <!-- Modal de pago duplicado -->
      <div v-if="mostrarModalPagoDuplicado" class="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Pago ya registrado</h2>
          <p class="mb-4 text-gray-700 dark:text-gray-300">
            Ya existe un pago registrado para este cliente en esta ruta.
          </p>
          <div v-if="pagoExistente" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Pago existente:</p>
            <div class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <div><span class="font-medium">Tipo:</span> {{ pagoExistente.tipo }}</div>
              <div><span class="font-medium">Valor:</span> ${{ pagoExistente.valor }}</div>
              <div v-if="pagoExistente.numParcelas"><span class="font-medium">Parcelas:</span> {{ pagoExistente.numParcelas }}</div>
              <div v-if="pagoExistente.observaciones"><span class="font-medium">Observaciones:</span> {{ pagoExistente.observaciones }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Fecha: {{ pagoExistente.fecha ? new Date(pagoExistente.fecha).toLocaleString('es-ES') : '-' }}
              </div>
            </div>
          </div>
          <p class="mb-6 text-gray-700 dark:text-gray-300">
            ¿Desea sobrescribir este pago con los nuevos datos?
          </p>
          <div class="flex justify-end gap-3">
            <button @click="cancelarSobrescribir" class="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition">
              Cancelar
            </button>
            <button @click="confirmarSobrescribir" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
              Sobrescribir pago
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import API_BASE_URL from '../config/api.js'

  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useClienteStore } from '../stores/useClienteStore'

  const route = useRoute()
  const router = useRouter()
  const opciones = ['Parcela', 'Abono', 'No pago', 'No aplica']
  const tipo = ref('Parcela')
  const valor = ref(0)
  const numParcelas = ref(1)
  const observaciones = ref('')

  const clienteStore = useClienteStore()
  const cliente = computed(() => clienteStore.clienteSeleccionado)
  const cargando = ref(true)
  const mostrarModalRenovar = ref(false)
  const mostrarModalPagoDuplicado = ref(false)
  const pagoExistente = ref(null)
  const datosPagoPendiente = ref(null)

  onMounted(() => {
    if (!cliente.value) {
      router.push('/vendedor')
      return
    }
    // El resto de la lógica de inicialización si es necesario
  })

  // Asegurarse de que los campos sean números válidos
  const dias = computed(() => Number(cliente.value.dias) || 0)
  const valorParcela = computed(() => Number(cliente.value.parcela) || 0)
  const saldoActual = computed(() => Number(cliente.value.total) || 0)
  const maxParcelas = computed(() => {
    const diasNum = Number(dias.value) || 1;
    const valorParcelaNum = Number(valorParcela.value) || 1;
    const saldoNum = Number(saldoActual.value) || 0;
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
      return Math.max(0, saldoActual.value - valorParcela.value * cuotas).toFixed(2)
    }
    if (tipo.value === 'Abono') {
      return Math.max(0, saldoActual.value - valor.value).toFixed(2)
    }
    return saldoActual.value.toFixed(2)
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

    // Calcular el nuevo saldo
    let nuevoSaldoCalc = saldoActual.value;
    if (tipo.value === 'Parcela') {
      nuevoSaldoCalc = saldoActual.value - valorParcela.value * numParcelas.value;
    } else if (tipo.value === 'Abono') {
      nuevoSaldoCalc = saldoActual.value - valor.value;
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
      saldo_antes: saldoActual.value,
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
    // Marcar el cliente anterior como cancelado en la base de datos
    try {
      await fetch(`${API_BASE_URL}/api/clientes/${cliente.value._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelado: true })
      });
    } catch (e) {}
    // Emitir evento para ocultar la tarjeta
    window.dispatchEvent(new CustomEvent('ocultar-cliente', { detail: cliente.value._id }))
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
      console.warn('No se pudo limpiar storage:', e)
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
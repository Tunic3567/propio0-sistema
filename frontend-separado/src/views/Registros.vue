<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :actualizandoDatos="loading" :cargandoRuta="cargandoRuta" tituloSeccion="Registros" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4">
      <div class="flex items-center justify-between mb-6" v-if="rutaAbierta || cargandoRuta">
        <!-- Título movido al header -->
      </div>
      
      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center mb-6 transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">Ruta cerrada</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">Para continuar, debes abrir una ruta.</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">Abrir ruta</button>
      </div>

      <div v-if="rutaAbierta || cargandoRuta">
        <div v-if="loading" class="text-center text-gray-700 dark:text-gray-300">Cargando...</div>
        <div v-else-if="pagos.length === 0" class="text-center text-gray-500 dark:text-gray-400">No hay pagos registrados en la ruta activa.</div>
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
                <span v-if="pago.cliente?.direccion_residencial">| 🏠 {{ pago.cliente.direccion_residencial }}</span>
              </div>
            </div>
            <div class="text-gray-700 dark:text-gray-300 text-sm">Tipo: <span class="font-medium">{{ pago.tipo }}</span></div>
            <div class="text-gray-700 dark:text-gray-300 text-sm">Monto: <span class="font-bold text-lg">${{ pago.valor }}</span></div>
            <div class="flex items-center justify-between mt-1">
              <span class="text-gray-500 dark:text-gray-400 text-xs">Fecha: {{ formatFecha(pago.fecha) }}</span>
              <button v-if="rutaAbierta" @click="editarPago(pago)" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded ml-2">Editar</button>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal de edición -->
      <div v-if="modalEditar" class="fixed inset-0 bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md transition-colors duration-300">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Editar Pago</h2>
          <form @submit.prevent="guardarEdicion">
            <!-- Tipo de pago -->
            <div class="mb-4">
              <label class="block text-gray-700 dark:text-gray-300 mb-2">Tipo de pago</label>
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
                <label class="block text-gray-700 dark:text-gray-300 mb-1">Valor</label>
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
                <label class="block text-gray-700 dark:text-gray-300 mb-1">Número de parcelas</label>
                <select v-model.number="pagoEdit.numParcelas" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option v-for="n in maxParcelas" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>

            <!-- Información del saldo -->
            <div v-if="pagoEdit.tipo !== 'No pago' && pagoEdit.tipo !== 'No aplica'" class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div class="text-sm text-gray-600 dark:text-gray-300">
                <div>Saldo actual: ${{ saldoActual }}</div>
                <div>Nuevo saldo: ${{ nuevoSaldo }}</div>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              <button type="button" @click="modalEditar = false" class="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">Cancelar</button>
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Guardar</button>
            </div>
          </form>
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
  </div>
</template>

<script setup>
import API_BASE_URL from '../config/api.js'

import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import NavbarVendedor from '../components/NavbarVendedor.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { consultarEstadoRuta } from '../utils/rutaUtils.js';

const pagos = ref([]);
const loading = ref(true);
const rutaAbierta = ref(false);
const cargandoRuta = ref(true);
const modalEditar = ref(false);
const mostrarModalCerrarRuta = ref(false);
const mostrarModalAbrirRuta = ref(false);
let pollingInterval = null;
const pagoEdit = ref({});
const router = useRouter();

// Opciones de tipo de pago
const opciones = ['Parcela', 'Abono', 'No pago', 'No aplica'];

// Datos del cliente para cálculos
const clienteData = ref({});

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString();
}

// Propiedades computadas para cálculos
const dias = computed(() => {
  const valor = Number(clienteData.value.dias) || 0;
  console.log('Días calculados:', valor, 'de clienteData:', clienteData.value.dias);
  return valor;
});
const valorParcela = computed(() => {
  const valor = Number(clienteData.value.parcela) || 0;
  console.log('Valor parcela calculado:', valor, 'de clienteData:', clienteData.value.parcela);
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
  console.log('Cálculo saldo previo => restante:', saldoRestanteActual, ' + pago sel:', valorPagoSeleccionado, ' + posteriores:', sumaPagosPosteriores, ' = ', saldoPrevio);
  
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
    console.warn('No se pudo limpiar storage:', e);
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
    alert('No se pudo cerrar la ruta');
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

async function editarPago(pago) {
  console.log('Pago recibido:', pago);
  console.log('Tipo de pago.cliente:', typeof pago.cliente);
  console.log('Valor de pago.cliente:', pago.cliente);
  
  // Obtener el ID del cliente correctamente
  const clienteId = typeof pago.cliente === 'object' ? pago.cliente._id : pago.cliente;
  console.log('Cliente ID extraído:', clienteId);
  
  // Cargar datos del cliente para los cálculos
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${clienteId}`);
    if (res.ok) {
      clienteData.value = await res.json();
      console.log('Datos del cliente cargados:', clienteData.value);
      
      // Inicializar el objeto de edición después de cargar los datos del cliente
      pagoEdit.value = {
        ...pago,
        numParcelas: pago.numParcelas || 1,
        valorManual: pago.tipo === 'Abono' ? pago.valor : 0
      };
      
      console.log('Pago edit inicializado:', pagoEdit.value);
      console.log('Cliente data:', clienteData.value);
      
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

    console.log('📋 Cargando registros desde la base de datos...');
    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/vendedor/${vendedorId}/registros?_t=${timestamp}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    console.log('Respuesta de registros:', data);
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
      await fetchPagos();
    } else {
      alert('Error al guardar los cambios');
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
  await fetchPagos()
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('pago-registrado', actualizarRegistros)
  window.addEventListener('pago-editado', actualizarRegistros)
  window.addEventListener('pago-eliminado', actualizarRegistros)
  window.addEventListener('ruta-cerrada', actualizarRegistros)
  window.addEventListener('ruta-abierta', actualizarRegistros)
});

// Función para actualizar registros cuando sea necesario
function actualizarRegistros() {
  console.log('🔄 Actualizando registros por evento...')
  fetchPagos()
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
<template>
  <div class="min-h-screen bg-gray-100">
    <NavbarVendedor
      :rutaAbierta="rutaAbierta"
      :cargandoRuta="cargandoRuta"
      :actualizandoDatos="actualizandoDatos"
      @cerrar-ruta="cerrarRuta"
      @logout="logout"
    />

    <!-- Modal de confirmación para abrir ruta -->
    <div v-if="mostrarModalApertura" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
        <h2 class="text-xl font-bold mb-4 text-center">Abrir ruta</h2>
        <p class="mb-6 text-center">¿Estás seguro de que deseas abrir la ruta? Esta acción no se puede deshacer.</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmarAperturaRuta" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Confirmar</button>
          <button @click="mostrarModalApertura = false" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para cerrar ruta -->
    <div v-if="mostrarModalCierre" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
        <h2 class="text-xl font-bold mb-4 text-center">Cerrar ruta</h2>
        <p class="mb-6 text-center">¿Estás seguro de que deseas cerrar la ruta? Esta acción no se puede deshacer.</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmarCierreRuta" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Confirmar</button>
          <button @click="mostrarModalCierre = false" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Contenido de clientes -->
    <div class="p-4">
      <div v-if="!rutaAbierta && !cargandoRuta" class="flex flex-col items-center justify-center min-h-[300px]">
        <button
          v-if="!rutaAbierta && !cargandoRuta"
          @click="solicitarAperturaRuta"
          class="bg-green-600 text-white px-6 py-3 rounded font-bold"
        >
          Abrir ruta
        </button>
        <button v-if="rutaAbierta && !cargandoRuta" @click="cerrarRuta" class="bg-red-600 text-white px-6 py-3 rounded font-bold">Cerrar ruta</button>
        <div v-if="cargandoRuta" class="text-gray-500">Cargando estado de ruta...</div>
        <div v-if="!rutaAbierta && !cargandoRuta" class="mt-4 text-gray-500">Debes abrir la ruta para comenzar.</div>
      </div>
      <div v-else>
      <div class="flex justify-between items-center mb-6">
        <button
          @click="irACrearCliente"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          + Nuevo Cliente
        </button>
      </div>

      <!-- Lista de clientes (por ahora vacía) -->
      <div class="bg-white rounded shadow p-4">
          <div v-if="clientes.length === 0" class="text-gray-500">No hay clientes registrados.</div>
          <div v-else class="space-y-3">
            <div
              v-for="(c, i) in clientes"
              :key="i"
              :class="[
                'flex items-start rounded-lg border border-gray-300 border-l-4 p-4',
                i % 2 === 0 ? 'bg-white' : 'bg-gray-200',
                calcularParcelasAtrasadas(c) >= 5
                  ? 'border-l-red-600'
                  : calcularParcelasAtrasadas(c) >= 3
                  ? 'border-l-yellow-400'
                  : 'border-l-green-600'
              ]"
            >
              <!-- Icono persona -->
              <div class="flex-shrink-0 cursor-pointer" @click.stop="toggleDesplegar(i)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                  :class="[
                    'w-16 h-16',
                    calcularParcelasAtrasadas(c) >= 5
                      ? 'text-red-600'
                      : calcularParcelasAtrasadas(c) >= 3
                      ? 'text-yellow-400'
                      : 'text-green-600'
                  ]"
                >
                  <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                </svg>
              </div>
              
              <!-- Info cliente -->
              <div class="ml-4 flex-1 cursor-pointer" @click="irAPagos(c)">
                <div class="font-bold text-lg text-gray-800">
                  {{ c.nombres }} {{ c.apellidos }}
                  <span v-if="c.apodo" class="text-gray-500 font-normal">({{ c.apodo }})</span>
                </div>
                <div class="mt-1 text-sm text-gray-600">
                  <div>
                    <span class="font-semibold">Parcela:</span>
                    ${{ c.parcela }} <span class="text-xs text-gray-400">({{ c.total }}/{{ c.dias }} días)</span>
                  </div>
                  <div>
                    <span class="font-semibold">Saldo:</span>
                    ${{ c.total }}
                  </div>
                  <div>
                    <span class="font-semibold">Saldo inicial:</span>
                    ${{ c.saldo_inicial }}
                  </div>
                </div>
                <!-- Info extra desplegable -->
                <div v-if="desplegados[i]" class="mt-2 border-t pt-2 text-sm text-gray-700 space-y-1">
                  <div><span class="font-semibold">Celular:</span> <a :href="`tel:${c.celular}`" class="text-blue-600 underline hover:text-blue-800" @click.stop>{{ c.celular }}</a></div>
                  <div><span class="font-semibold">CC:</span> {{ c.cc }}</div>
                  <div><span class="font-semibold">Parcelas pendientes:</span> {{ calcularParcelasPendientes(c) }}</div>
                  <div><span class="font-semibold">Parcelas atrasadas:</span> {{ calcularParcelasAtrasadas(c) }}</div>
                  <div><span class="font-semibold">Dirección residencial:</span> {{ c.direccion_residencial }}</div>
                  <div><span class="font-semibold">Dirección Comercial:</span> {{ c.direccion }}</div>
                  <div><span class="font-semibold">Fecha:</span> {{ c.fecha }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import API_BASE_URL from '../config/api.js'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import { useClienteStore } from '../stores/useClienteStore'

const router = useRouter()
const route = useRoute()
const clientes = ref([])
const desplegados = ref([])
const pagos = ref([])
const clienteStore = useClienteStore()

const vendedorId = localStorage.getItem('vendedorId')
const rutaAbierta = ref(false)
const cargandoRuta = ref(true)
const mostrarModalApertura = ref(false)
const mostrarModalCierre = ref(false)
const actualizandoDatos = ref(false)

// Función para actualizar datos del dashboard
async function actualizarDashboard() {
  actualizandoDatos.value = true
  await Promise.all([cargarClientes(), cargarPagos()])
  actualizandoDatos.value = false
}

async function consultarRuta() {
  cargandoRuta.value = true
  const res = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
  const data = await res.json()
  rutaAbierta.value = !!data
  cargandoRuta.value = false
}

function solicitarAperturaRuta() {
  mostrarModalApertura.value = true
}

async function abrirRuta() {
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  });
  if (res.ok) {
    rutaAbierta.value = true;
    mostrarModalApertura.value = false
  } else {
    alert('No se pudo abrir la ruta');
  }
}

function cerrarRuta() {
  mostrarModalCierre.value = true
}

async function confirmarCierreRuta() {
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  });
  if (res.ok) {
    rutaAbierta.value = false;
    mostrarModalCierre.value = false
  } else {
    alert('No se pudo cerrar la ruta');
  }
}

async function cargarClientes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes`);
    if (res.ok) {
      // Filtrar solo los clientes no cancelados
      const todos = await res.json();
      clientes.value = todos.filter(c => !c.cancelado);
      desplegados.value = clientes.value.map(() => false);
    } else {
      clientes.value = [];
      desplegados.value = [];
    }
  } catch (e) {
    clientes.value = [];
    desplegados.value = [];
  }
}

async function cargarPagos() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pagos`);
    if (res.ok) {
      pagos.value = await res.json();
    } else {
      pagos.value = [];
    }
  } catch (e) {
    pagos.value = [];
  }
}

onMounted(() => {
  consultarRuta()
  cargarClientes()
  cargarPagos()
  
  // Escuchar evento personalizado para actualizar datos
  window.addEventListener('actualizar-dashboard', actualizarDashboard)
  // Escuchar evento para ocultar cliente finalizado
  window.addEventListener('ocultar-cliente', (e) => {
    const id = e.detail
    clientes.value = clientes.value.filter(c => c._id !== id)
  })
})

// Recargar clientes cada vez que la ruta cambia a este dashboard
watch(
  () => route.fullPath,
  () => {
    cargarClientes()
    consultarRuta()
    cargarPagos()
  }
)

// También actualizar cuando cambian los parámetros de la ruta
watch(
  () => route.params,
  () => {
    cargarClientes()
    cargarPagos()
  },
  { deep: true }
)

function toggleDesplegar(idx) {
  desplegados.value[idx] = !desplegados.value[idx]
}

function irAPagos(cliente) {
  clienteStore.setCliente(cliente)
  router.push('/pagos')
}

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

function irACrearCliente() {
  router.push('/crear-cliente')
}

function calcularTotal(cliente) {
  const valor = parseFloat(cliente.valor) || 0
  const dias = cliente.dias
  const porcentajePorDias = { 11: 0.10, 15: 0.20, 20: 0.20, 24: 0.20, 30: 0.20 }
  const porcentaje = porcentajePorDias[dias] || 0
  return (valor + valor * porcentaje).toFixed(2)
}

function calcularParcela(cliente) {
  const total = parseFloat(calcularTotal(cliente))
  const dias = parseInt(cliente.dias)
  return dias ? (total / dias).toFixed(2) : '0.00'
}

function calcularParcelasPendientes(cliente) {
  const saldo = parseFloat(cliente.total) || 0;
  const parcela = parseFloat(cliente.parcela) || 1;
  return parcela > 0 ? Math.round(saldo / parcela) : 0;
}

function calcularParcelasAtrasadas(cliente) {
  const pagosCliente = pagos.value
    .filter(p => p.cliente === cliente._id)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  let atrasos = 0;
  let dias = 0; // Días en los que se debió pagar (No pago o Parcela)
  const valorParcela = parseFloat(cliente.parcela) || 1;

  pagosCliente.forEach(p => {
    if (p.tipo === 'No pago') {
      atrasos += 1;
      dias += 1;
    } else if (p.tipo === 'Parcela') {
      dias += 1;
      // Si pagó más de una cuota, el resto cubre atrasos
      const pagadas = p.numParcelas || 1;
      if (pagadas > 1) {
        atrasos = Math.max(0, atrasos - (pagadas - 1));
      }
    } else if (p.tipo === 'Abono') {
      // Un abono cubre cuotas, pero solo el excedente cubre atrasos
      const cuotasPagadas = Math.floor((p.valor || 0) / valorParcela);
      if (cuotasPagadas > 0) {
        // El primer abono cubre el día, el resto cubre atrasos
        if (dias === 0) {
          // Si no hay días, todo va a atrasos
          atrasos = Math.max(0, atrasos - cuotasPagadas);
        } else {
          atrasos = Math.max(0, atrasos - (cuotasPagadas - 1));
        }
        dias += 1;
      }
    }
  });

  return atrasos;
}

function confirmarAperturaRuta() {
  abrirRuta()
}

onUnmounted(() => {
  window.removeEventListener('actualizar-dashboard', actualizarDashboard)
})
</script>
<template>
  <div class="min-h-screen bg-gray-100">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :actualizandoDatos="loading" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4">
      <div v-if="loading" class="text-center">Cargando...</div>
      <div v-else-if="pagos.length === 0" class="text-center text-gray-500">No hay pagos registrados en la ruta activa.</div>
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="pago in pagos" :key="pago._id" class="bg-white shadow-sm rounded-lg border p-4 flex flex-col gap-1">
          <div>
            <span class="font-bold text-base text-gray-800">
              <template v-if="pago.cliente && (pago.cliente.nombres || pago.cliente.apellidos)">
                {{ pago.cliente.nombres }} {{ pago.cliente.apellidos }}
                <span v-if="pago.cliente.apodo" class="text-gray-500 font-normal">({{ pago.cliente.apodo }})</span>
              </template>
              <template v-else-if="pago.cliente && pago.cliente.apodo">
                {{ pago.cliente.apodo }}
              </template>
            </span>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span v-if="pago.cliente?.celular">📱 {{ pago.cliente.celular }}</span>
              <span v-if="pago.cliente?.direccion_residencial">| 🏠 {{ pago.cliente.direccion_residencial }}</span>
            </div>
          </div>
          <div class="text-gray-700 text-sm">Tipo: <span class="font-medium">{{ pago.tipo }}</span></div>
          <div class="text-gray-700 text-sm">Monto: <span class="font-bold text-lg">${{ pago.valor }}</span></div>
          <div class="flex items-center justify-between mt-1">
            <span class="text-gray-500 text-xs">Fecha: {{ formatFecha(pago.fecha) }}</span>
            <button v-if="rutaAbierta" @click="editarPago(pago)" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded ml-2">Editar</button>
          </div>
        </div>
      </div>
      <!-- Modal de edición -->
      <div v-if="modalEditar" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Editar Pago</h2>
          <form @submit.prevent="guardarEdicion">
            <div class="mb-2">
              <label class="block text-gray-700">Tipo de pago</label>
              <select v-model="pagoEdit.tipo" class="w-full border rounded px-2 py-1">
                <option value="Parcela">Parcela</option>
                <option value="Abono">Abono</option>
                <option value="No pago">No pago</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="block text-gray-700">Monto</label>
              <input v-model.number="pagoEdit.valor" type="number" class="w-full border rounded px-2 py-1" min="0" required />
            </div>
            <div class="flex justify-end gap-2 mt-4">
              <button type="button" @click="modalEditar = false" class="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import API_BASE_URL from '../config/api.js'

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavbarVendedor from '../components/NavbarVendedor.vue';

const pagos = ref([]);
const loading = ref(true);
const rutaAbierta = ref(true);
const modalEditar = ref(false);
const pagoEdit = ref({});
const router = useRouter();

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString();
}

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

async function cerrarRuta() {
  const vendedorId = localStorage.getItem('vendedorId');
  const confirmado = confirm('¿Seguro que deseas cerrar la ruta?');
  if (!confirmado) return;
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  });
  if (res.ok) {
    rutaAbierta.value = false;
    router.push('/vendedor');
  } else {
    alert('No se pudo cerrar la ruta');
  }
}

function editarPago(pago) {
  pagoEdit.value = { ...pago };
  modalEditar.value = true;
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
    const res = await fetch(`${API_BASE_URL}/api/vendedor/${vendedorId}/registros`);
    const data = await res.json();
    console.log('Respuesta de registros:', data);
    pagos.value = data;
    // Consultar si la ruta está abierta
    const rutaRes = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`);
    const rutaData = await rutaRes.json();
    rutaAbierta.value = !!rutaData;
  } catch (e) {
    pagos.value = [];
    console.error('Error al obtener registros:', e);
  }
  loading.value = false;
}

async function guardarEdicion() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pagos/${pagoEdit.value._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: pagoEdit.value.tipo, valor: pagoEdit.value.valor })
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
  const vendedorId = localStorage.getItem('vendedorId');
  const rutaRes = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`);
  const ruta = await rutaRes.json();
  if (!ruta || !ruta._id) {
    alert('Debes abrir la ruta para acceder a esta opción.');
    router.push('/vendedor');
    return;
  }
  await fetchPagos();
});
</script>

<style scoped>
</style> 
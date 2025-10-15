<template>
  <div class="min-h-screen bg-gray-100">
    <NavbarVendedor :rutaAbierta="true" :actualizandoDatos="loading" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 max-w-lg mx-auto">
      <form @submit.prevent="registrarEgreso" class="bg-white rounded shadow p-6 mb-8">
        <div class="mb-4">
          <label class="block font-semibold mb-1">Tipo de movimiento</label>
          <select v-model="tipo" class="w-full border rounded px-2 py-1">
            <option value="Retiro de caja" :disabled="yaExiste('Retiro de caja')">💰 Retiro de caja</option>
            <option value="Comisiones" :disabled="yaExiste('Comisiones')">💼 Comisiones</option>
            <option value="Gastos varios" :disabled="yaExiste('Gastos varios')">🛒 Gastos varios</option>
          </select>
          <p v-if="!puedeCrear" class="text-sm text-red-600 mt-1">Ya registraste los tres tipos de egreso en esta ruta.</p>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1">Valor</label>
          <input v-model.number="valor" type="number" min="1" class="w-full border rounded px-2 py-1" required />
        </div>
        <div class="mb-4" v-if="tipo === 'Gastos varios'">
          <label class="block font-semibold mb-1">Descripción</label>
          <input v-model="descripcion" type="text" class="w-full border rounded px-2 py-1" placeholder="¿En qué se gastó?" required />
        </div>
        <button type="submit" :disabled="!puedeCrear" class="w-full bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded font-bold hover:bg-green-700 transition">Registrar egreso</button>
      </form>
      <div class="bg-white rounded shadow p-6">
        <h2 class="text-lg font-bold mb-4">Movimientos de la ruta activa</h2>
        <div v-if="loading" class="text-center">Cargando movimientos...</div>
        <div v-else-if="egresos.length === 0" class="text-center text-gray-500">No hay movimientos registrados en esta ruta.</div>
        <div v-else class="space-y-3">
          <!-- Resumen de movimientos -->
          <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-semibold text-red-600">💰 Retiros:</span>
                <span class="ml-2 font-bold">${{ calcularTotalRetiros() }}</span>
              </div>
              <div>
                <span class="font-semibold text-gray-600">🛒 Egresos:</span>
                <span class="ml-2 font-bold">${{ calcularTotalEgresos() }}</span>
              </div>
            </div>
          </div>
          
          <!-- Lista de movimientos -->
          <div v-for="e in egresos" :key="e._id" 
               :class="[
                 'border rounded p-3 flex flex-col gap-1',
                 e.tipo === 'Retiro de caja' ? 'bg-red-50 border-red-200' : 'bg-gray-50'
               ]">
            <div class="flex items-center gap-2">
              <span v-if="e.tipo === 'Retiro de caja'" class="text-red-600 font-bold">💰 {{ e.tipo }}</span>
              <span v-else-if="e.tipo === 'Comisiones'" class="text-blue-600 font-semibold">💼 {{ e.tipo }}</span>
              <span v-else class="text-gray-600 font-semibold">🛒 {{ e.tipo }}</span>
              <span v-if="e.descripcion" class="text-gray-500 text-sm">- {{ e.descripcion }}</span>
            </div>
            <div class="text-gray-700">Valor: <span class="font-bold">${{ e.valor }}</span></div>
            <div class="text-gray-500 text-xs">Fecha: {{ formatFecha(e.fecha) }}</div>
            <div class="flex gap-2 mt-2">
              <button @click="editarEgreso(e)" class="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm">Editar</button>
              <button @click="eliminarEgreso(e)" class="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm">Eliminar</button>
            </div>
          </div>
          <!-- Modal edición -->
          <div v-if="modal.visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 class="text-lg font-bold mb-4">Editar egreso</h3>
              <div class="mb-3">
                <label class="block text-sm text-gray-600 mb-1">Valor</label>
                <input v-model.number="modal.valor" type="number" min="1" class="w-full border rounded px-3 py-2" />
              </div>
              <div class="mb-4">
                <label class="block text-sm text-gray-600 mb-1">Descripción</label>
                <input v-model="modal.descripcion" type="text" class="w-full border rounded px-3 py-2" />
              </div>
              <div class="flex justify-end gap-2">
                <button @click="modal.visible=false" class="px-4 py-2 rounded bg-gray-200 text-gray-700">Cancelar</button>
                <button @click="guardarEdicion" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Guardar</button>
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

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavbarVendedor from '../components/NavbarVendedor.vue';

const tipo = ref('Retiro de caja');
const valor = ref(0);
const descripcion = ref('');
const egresos = ref([]);
const loading = ref(true);
const router = useRouter();
const modal = ref({ visible: false, egreso: null, valor: 0, descripcion: '' })
const puedeCrear = ref(true)

function logout() {
  localStorage.clear();
  router.push('/');
}

async function cerrarRuta() {
  const vendedorId = localStorage.getItem('vendedorId');
  const confirmado = confirm('¿Seguro que deseas cerrar la ruta?');
  if (!confirmado) return;
  const res = await fetch('${API_BASE_URL}/api/rutas/cerrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  });
  if (res.ok) {
    router.push('/vendedor');
  } else {
    alert('No se pudo cerrar la ruta');
  }
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
  const rutaRes = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`);
  const ruta = await rutaRes.json();
  if (!ruta || !ruta._id) {
    egresos.value = [];
    loading.value = false;
    return;
  }
  const res = await fetch(`${API_BASE_URL}/api/egresos?vendedor=${vendedorId}&ruta=${ruta._id}`);
  egresos.value = await res.json();
  // Deshabilitar tipos ya creados en la ruta
  puedeCrear.value = egresos.value.length < 3
  loading.value = false;
}

async function registrarEgreso() {
  const vendedorId = localStorage.getItem('vendedorId');
  const rutaRes = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`);
  const ruta = await rutaRes.json();
  if (!ruta || !ruta._id) {
    alert('No hay ruta activa. Debes abrir una ruta para registrar egresos.');
    return;
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
    ruta: ruta._id,
    tipo: tipo.value,
    valor: valor.value,
    descripcion: tipo.value === 'Gastos varios' ? descripcion.value : ''
  };
  const res = await fetch(`${API_BASE_URL}/api/egresos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(egreso)
  });
  if (res.ok) {
    valor.value = 0;
    descripcion.value = '';
    tipo.value = 'Retiro de caja';
    await fetchEgresos();
    alert('Egreso registrado correctamente');
  } else if (res.status === 409) {
    const data = await res.json();
    alert(data.error || 'Ya existe un egreso de este tipo en esta ruta');
  } else {
    alert('Error al registrar egreso');
  }
}

function yaExiste(tipoNombre) {
  return egresos.value.some(e => e.tipo === tipoNombre)
}

function editarEgreso(e) {
  modal.value = { visible: true, egreso: e, valor: e.valor, descripcion: e.descripcion || '' }
}

async function guardarEdicion() {
  const e = modal.value.egreso
  if (!e) return
  const res = await fetch(`${API_BASE_URL}/api/egresos/${e._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valor: Number(modal.value.valor), descripcion: modal.value.descripcion })
  })
  if (res.ok) {
    modal.value.visible = false
    await fetchEgresos()
  } else {
    alert('Error al actualizar egreso')
  }
}

async function eliminarEgreso(e) {
  if (!confirm('¿Eliminar este egreso?')) return
  const res = await fetch(`${API_BASE_URL}/api/egresos/${e._id}`, { method: 'DELETE' })
  if (res.ok) {
    await fetchEgresos()
  } else {
    alert('Error al eliminar egreso')
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
  await fetchEgresos();
});
</script>

<style scoped>
</style> 
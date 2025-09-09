<template>
  <div class="min-h-screen bg-gray-100">
    <NavbarAdmin @logout="logout" />
    <div class="p-4 max-w-5xl mx-auto">
      <div class="flex flex-wrap gap-4 mb-6">
        <div>
          <label class="block font-semibold mb-1">Filtrar por vendedor:</label>
          <select v-model="vendedorSeleccionado" class="border rounded px-2 py-1">
            <option value="">Todos</option>
            <option v-for="v in vendedores" :key="v._id" :value="v._id">{{ v.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold mb-1">Filtrar por ruta:</label>
          <select v-model="rutaSeleccionada" class="border rounded px-2 py-1">
            <option v-for="r in rutasFiltradas" :key="r._id" :value="r._id">
              {{ r.vendedor?.nombre }} | {{ formatFecha(r.fechaApertura) }}
            </option>
          </select>
        </div>
      </div>
      <div class="bg-white rounded shadow p-6">
        <h2 class="text-lg font-bold mb-4">Todos los egresos</h2>
        <div v-if="loading" class="text-center">Cargando egresos...</div>
        <div v-else-if="egresos.length === 0" class="text-center text-gray-500">No hay egresos registrados.</div>
        <div v-else class="space-y-3">
          <div v-for="e in egresos" :key="e._id" class="border rounded p-3 flex flex-col gap-1 bg-gray-50">
            <div class="flex items-center gap-2">
              <span class="font-semibold">{{ e.tipo }}</span>
              <span v-if="e.descripcion" class="text-gray-500 text-sm">- {{ e.descripcion }}</span>
            </div>
            <div class="text-gray-700">Valor: <span class="font-bold">${{ e.valor }}</span></div>
            <div class="text-gray-500 text-xs">Fecha: {{ formatFecha(e.fecha) }}</div>
            <div class="text-gray-500 text-xs">Vendedor: {{ e.vendedor?.nombre || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import API_BASE_URL from '../config/api.js'

import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import NavbarAdmin from '../components/NavbarAdmin.vue';

const egresos = ref([]);
const loading = ref(true);
const vendedores = ref([]);
const rutas = ref([]);
const vendedorSeleccionado = ref('');
const rutaSeleccionada = ref('');
const router = useRouter();

function volver() {
  router.push('/admin');
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString();
}

const rutasFiltradas = computed(() => {
  if (!vendedorSeleccionado.value) return rutas.value;
  return rutas.value.filter(r => r.vendedor?._id === vendedorSeleccionado.value);
});

async function fetchVendedores() {
  const res = await fetch('${API_BASE_URL}/api/vendedores');
  vendedores.value = await res.json();
}

async function fetchRutas() {
  const res = await fetch('${API_BASE_URL}/api/admin/rutas');
  rutas.value = await res.json();
}

async function fetchEgresos() {
  loading.value = true;
  let url = '${API_BASE_URL}/api/egresos?';
  if (vendedorSeleccionado.value) url += `vendedor=${vendedorSeleccionado.value}&`;
  if (rutaSeleccionada.value) url += `ruta=${rutaSeleccionada.value}`;
  const res = await fetch(url);
  egresos.value = await res.json();
  loading.value = false;
}

onMounted(async () => {
  await fetchVendedores();
  await fetchRutas();
  await fetchEgresos();
  if (rutas.value.length > 0) {
    rutas.value.sort((a, b) => new Date(b.fechaApertura) - new Date(a.fechaApertura));
    rutaSeleccionada.value = rutas.value[0]._id;
  }
});

watch([vendedorSeleccionado, rutaSeleccionada], fetchEgresos);
</script>

<style scoped>
</style> 
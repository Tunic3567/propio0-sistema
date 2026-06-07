<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-50 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    <div class="p-4 max-w-5xl mx-auto">
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="w-full sm:w-auto min-w-0">
          <label class="block font-semibold mb-1 text-neutral-800 dark:text-slate-200">{{ $t('admin.filterPaymentsByAdvisor') }}</label>
          <select
            v-model="vendedorSeleccionado"
            class="w-full sm:w-auto sm:min-w-[180px] max-w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-theme"
          >
            <option value="">Todos</option>
            <option v-for="v in vendedores" :key="v._id" :value="v._id">{{ v.nombre }}</option>
          </select>
        </div>
        <div class="w-full sm:w-auto min-w-0">
          <label class="block font-semibold mb-1 text-neutral-800 dark:text-slate-200">{{ $t('admin.filterByRoute') || 'Filtrar por ruta' }}:</label>
          <select
            v-model="rutaSeleccionada"
            class="w-full sm:w-auto sm:min-w-[220px] max-w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-theme"
          >
            <option v-for="r in rutasFiltradas" :key="r._id" :value="r._id">
              {{ r.vendedor?.nombre }} | {{ formatFecha(r.fechaApertura) }}
            </option>
          </select>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-neutral-200 dark:border-slate-600 p-6 transition-theme">
        <h2 class="text-lg font-bold mb-4 text-neutral-900 dark:text-slate-100">{{ $t('expense.registered') }}</h2>
        <div v-if="!loading && egresos.length === 0" class="text-center text-neutral-600 dark:text-slate-400 py-8 font-medium">
          {{ $t('expense.noMovements') }}
        </div>
        <div v-else-if="egresos.length > 0" class="space-y-3">
          <div v-for="e in egresos" :key="e._id" class="border-2 border-neutral-200 dark:border-slate-600 rounded-lg p-3 flex flex-col gap-1 bg-neutral-50 dark:bg-slate-700/50 transition-theme">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ e.tipo }}</span>
              <span v-if="e.descripcion" class="text-neutral-600 dark:text-slate-300 text-sm">- {{ e.descripcion }}</span>
            </div>
            <div class="text-neutral-700 dark:text-slate-200">Valor: <span class="font-bold text-neutral-900 dark:text-slate-100">${{ e.valor }}</span></div>
            <div class="text-neutral-600 dark:text-slate-400 text-xs">Fecha: {{ formatFecha(e.fecha) }}</div>
            <div class="text-neutral-600 dark:text-slate-400 text-xs">{{ $t('admin.vendors') }}: {{ e.vendedor?.nombre || '-' }}</div>
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
import { useI18n } from 'vue-i18n';
import NavbarAdmin from '../components/NavbarAdmin.vue';

const { t } = useI18n();

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

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString();
}

const rutasFiltradas = computed(() => {
  if (!vendedorSeleccionado.value) return rutas.value;
  return rutas.value.filter(r => r.vendedor?._id === vendedorSeleccionado.value);
});

async function fetchVendedores() {
  const codigoVinculacion = localStorage.getItem('codigoVinculacion');
  const url = codigoVinculacion
    ? `${API_BASE_URL}/api/vendedores?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
    : `${API_BASE_URL}/api/vendedores`;
  const res = await fetch(url);
  vendedores.value = res.ok ? await res.json() : [];
}

async function fetchRutas() {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion');
    const url = codigoVinculacion
      ? `${API_BASE_URL}/api/admin/rutas?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
      : `${API_BASE_URL}/api/admin/rutas`;
    const res = await fetch(url);
    if (res.ok) {
      rutas.value = await res.json();
    } else {
      const txt = await res.text();
      console.error('Error al obtener rutas (admin egresos):', res.status, txt);
      rutas.value = [];
    }
  } catch (e) {
    console.error('Excepción al obtener rutas (admin egresos):', e);
    rutas.value = [];
  }
}

async function fetchEgresos() {
  loading.value = true;
  const params = new URLSearchParams();
  const codigo = localStorage.getItem('codigoVinculacion');
  if (codigo) params.append('codigoVinculacion', codigo);
  if (vendedorSeleccionado.value) params.append('vendedor', vendedorSeleccionado.value);
  if (rutaSeleccionada.value) params.append('ruta', rutaSeleccionada.value);
  const url = `${API_BASE_URL}/api/egresos?${params.toString()}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      egresos.value = await res.json();
    } else {
      const txt = await res.text();
      console.error('Error al obtener egresos (admin):', res.status, txt);
      egresos.value = [];
    }
  } catch (e) {
    console.error('Excepción al obtener egresos (admin):', e);
    egresos.value = [];
  }
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
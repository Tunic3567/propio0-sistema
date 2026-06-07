<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-50 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    <div class="p-4">
        <div class="mb-6">
          <label class="block mb-2 font-semibold text-neutral-800 dark:text-slate-200">{{ $t('admin.filterPaymentsByAdvisor') }}</label>
          <select
            v-model="vendedorSeleccionado"
            class="border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-theme"
          >
            <option value="">{{ $t('admin.all') || 'Todos' }}</option>
            <option v-for="v in vendedoresUnicos" :key="v.id" :value="v.id">
              {{ v.nombre }}
            </option>
          </select>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="ruta in rutasFiltradas"
            :key="ruta._id"
            class="rounded-xl p-4 cursor-pointer transition-theme border-2 shadow-md hover:shadow-lg bg-white border-neutral-300 dark:bg-slate-800 dark:border-slate-600 hover:bg-neutral-50 dark:hover:bg-slate-700"
            @click="verPagosRuta(ruta)"
          >
            <div class="font-bold text-lg text-neutral-900 dark:text-slate-100 mb-1">{{ ruta.vendedor?.nombre }}</div>
            <div class="text-sm text-neutral-600 dark:text-slate-300 mb-1">Apertura: {{ formatFecha(ruta.fechaApertura) }}</div>
            <div class="text-sm text-neutral-600 dark:text-slate-300 mb-1">Cierre: {{ ruta.fechaCierre ? formatFecha(ruta.fechaCierre) : 'Abierta' }}</div>
          </div>
        </div>

      <!-- Modal de pagos de la ruta -->
      <div v-if="mostrarPagos" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl border-2 border-neutral-200 dark:border-slate-600 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-theme">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-neutral-900 dark:text-slate-100">{{ $t('admin.routePayments') || 'Pagos de la ruta' }}</h2>
            <button @click="cerrarPagos" class="bg-neutral-200 dark:bg-slate-600 hover:bg-neutral-300 dark:hover:bg-slate-500 text-neutral-800 dark:text-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors">{{ $t('common.close') }}</button>
          </div>
          <div v-if="pagosRuta.length === 0" class="text-center text-neutral-500 dark:text-slate-400">{{ $t('records.noRecords') }}</div>
          <div v-else class="grid gap-4">
            <div v-for="pago in pagosRuta" :key="pago._id" class="bg-neutral-50 dark:bg-slate-700/50 border border-neutral-200 dark:border-slate-600 rounded-lg p-3 flex flex-col gap-1 transition-theme">
              <span class="font-bold text-base text-neutral-900 dark:text-slate-100">
                <template v-if="pago.cliente && (pago.cliente.nombres || pago.cliente.apellidos)">
                  {{ pago.cliente.nombres }} {{ pago.cliente.apellidos }}
                  <span v-if="pago.cliente.apodo" class="text-neutral-500 dark:text-slate-400 font-normal">({{ pago.cliente.apodo }})</span>
                </template>
                <template v-else-if="pago.cliente && pago.cliente.apodo">
                  {{ pago.cliente.apodo }}
                </template>
              </span>
              <div class="flex items-center gap-2 text-sm text-neutral-600 dark:text-slate-300">
                <span v-if="pago.cliente?.celular">📱 {{ pago.cliente.celular }}</span>
                <span v-if="pago.cliente?.direccion_residencial">| 🏠 {{ resumirDireccion(pago.cliente.direccion_residencial) }}</span>
              </div>
              <div class="text-neutral-700 dark:text-slate-200 text-sm">{{ $t('payment.type') }}: <span class="font-medium">{{ pago.tipo }}</span></div>
              <div class="text-neutral-700 dark:text-slate-200 text-sm">{{ $t('payment.amount') }}: <span class="font-bold text-lg text-neutral-900 dark:text-slate-100">${{ pago.valor }}</span></div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-neutral-500 dark:text-slate-400 text-xs">Fecha: {{ formatFecha(pago.fecha) }}</span>
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

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavbarAdmin from '../components/NavbarAdmin.vue';

const rutas = ref([]);
const loading = ref(true);
const vendedorSeleccionado = ref('');
const mostrarPagos = ref(false);
const pagosRuta = ref([]);
const loadingPagos = ref(false);
const router = useRouter();

// Función para resumir una dirección (mostrar solo calle, barrio, ciudad)
function resumirDireccion(direccionCompleta) {
  if (!direccionCompleta) return '';
  
  // Dividir por comas
  const partes = direccionCompleta.split(',').map(p => p.trim());
  
  // Si tiene menos de 3 partes, devolver todo
  if (partes.length <= 3) {
    return direccionCompleta;
  }
  
  // Tomar las primeras 3 partes (generalmente: calle, barrio, ciudad)
  // O las primeras 2 si la primera es muy larga
  if (partes[0].length > 50) {
    // Si la primera parte es muy larga, tomar solo las primeras 2
    return partes.slice(0, 2).join(', ');
  }
  
  // Normalmente: calle, barrio, ciudad
  return partes.slice(0, 3).join(', ');
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString();
}

const vendedoresUnicos = computed(() => {
  const map = {};
  rutas.value.forEach(r => {
    if (r.vendedor && !map[r.vendedor._id]) {
      map[r.vendedor._id] = { id: r.vendedor._id, nombre: r.vendedor.nombre };
    }
  });
  return Object.values(map);
});

const rutasFiltradas = computed(() => {
  if (!vendedorSeleccionado.value) return rutas.value;
  return rutas.value.filter(r => r.vendedor?._id === vendedorSeleccionado.value);
});

async function fetchRutas() {
  try {
    loading.value = true;
    const codigoVinculacion = localStorage.getItem('codigoVinculacion');
    const url = codigoVinculacion
      ? `${API_BASE_URL}/api/admin/rutas?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
      : `${API_BASE_URL}/api/admin/rutas`;
    const res = await fetch(url);
    if (res.ok) {
      rutas.value = await res.json();
    } else {
      const txt = await res.text();
      console.error('Error al cargar rutas (admin):', res.status, txt);
      rutas.value = [];
    }
  } catch (e) {
    console.error('Excepción al cargar rutas (admin):', e);
    rutas.value = [];
  } finally {
    loading.value = false;
  }
}

async function verPagosRuta(ruta) {
  try {
    mostrarPagos.value = true;
    loadingPagos.value = true;
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas/${ruta._id}/pagos`);
    if (res.ok) {
      pagosRuta.value = await res.json();
    } else {
      const txt = await res.text();
      console.error('Error al cargar pagos de la ruta (admin):', res.status, txt);
      pagosRuta.value = [];
    }
  } catch (e) {
    console.error('Excepción al cargar pagos de la ruta (admin):', e);
    pagosRuta.value = [];
  } finally {
    loadingPagos.value = false;
  }
}

function cerrarPagos() {
  mostrarPagos.value = false;
  pagosRuta.value = [];
}

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
  } catch (_) {}
  try {
    router.replace('/');
    setTimeout(() => {
      if (location.hash && !location.hash.endsWith('#/')) {
        location.href = '/';
      }
    }, 150);
  } catch (_) {
    location.href = '/';
  }
}

onMounted(fetchRutas);
</script>

<style scoped>
</style> 
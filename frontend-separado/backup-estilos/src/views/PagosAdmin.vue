<template>
  <div class="min-h-screen bg-gray-100">
    <NavbarAdmin @logout="logout" />
    <div class="p-4">
        <div v-if="loading" class="text-center">{{ $t('common.loading') }}</div>
      <div v-else>
        <div class="mb-6">
          <label class="block mb-2 font-semibold">Filtrar por vendedor:</label>
          <select v-model="vendedorSeleccionado" class="border rounded px-2 py-1">
            <option value="">{{ $t('admin.all') || 'Todos' }}</option>
            <option v-for="v in vendedoresUnicos" :key="v.id" :value="v.id">
              {{ v.nombre }}
            </option>
          </select>
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="ruta in rutasFiltradas" :key="ruta._id" class="bg-white shadow-sm rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition" @click="verPagosRuta(ruta)">
            <div class="font-bold text-lg text-gray-800 mb-1">{{ ruta.vendedor?.nombre }}</div>
            <div class="text-sm text-gray-600 mb-1">Apertura: {{ formatFecha(ruta.fechaApertura) }}</div>
            <div class="text-sm text-gray-600 mb-1">Cierre: {{ ruta.fechaCierre ? formatFecha(ruta.fechaCierre) : 'Abierta' }}</div>
          </div>
        </div>
      </div>

      <!-- Modal de pagos de la ruta -->
      <div v-if="mostrarPagos" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">{{ $t('admin.routePayments') || 'Pagos de la ruta' }}</h2>
            <button @click="cerrarPagos" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded">{{ $t('common.close') }}</button>
          </div>
          <div v-if="loadingPagos" class="text-center">{{ $t('common.loading') }}</div>
          <div v-else-if="pagosRuta.length === 0" class="text-center text-gray-500">{{ $t('records.noRecords') }}</div>
          <div v-else class="grid gap-4">
            <div v-for="pago in pagosRuta" :key="pago._id" class="bg-gray-50 border rounded p-3 flex flex-col gap-1">
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
                <span v-if="pago.cliente?.direccion_residencial">| 🏠 {{ resumirDireccion(pago.cliente.direccion_residencial) }}</span>
              </div>
              <div class="text-gray-700 text-sm">{{ $t('payment.type') }}: <span class="font-medium">{{ pago.tipo }}</span></div>
              <div class="text-gray-700 text-sm">{{ $t('payment.amount') }}: <span class="font-bold text-lg">${{ pago.valor }}</span></div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-gray-500 text-xs">Fecha: {{ formatFecha(pago.fecha) }}</span>
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
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas`);
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

onMounted(fetchRutas);
</script>

<style scoped>
</style> 
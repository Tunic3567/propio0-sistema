<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :actualizandoDatos="loading" :cargandoRuta="cargandoRuta" tituloSeccion="Egresos" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 max-w-lg mx-auto">
      <div class="flex items-center justify-between mb-6" v-if="rutaAbierta || cargandoRuta">
        <!-- Título movido al header -->
      </div>
      
      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center mb-6 transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">Ruta cerrada</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">Para continuar, debes abrir una ruta.</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">Abrir ruta</button>
      </div>

      <form v-if="rutaAbierta || cargandoRuta" @submit.prevent="registrarEgreso" class="bg-white dark:bg-gray-800 rounded shadow p-6 mb-8 transition-colors duration-300">
        <div class="mb-4">
          <label class="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Tipo de movimiento</label>
          <select v-model="tipo" class="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition text-gray-900 dark:text-gray-100">
            <option value="Retiro de caja" :disabled="yaExiste('Retiro de caja')">💰 Retiro de caja</option>
            <option value="Comisiones" :disabled="yaExiste('Comisiones')">💼 Comisiones</option>
            <option value="Gastos varios" :disabled="yaExiste('Gastos varios')">🛒 Gastos varios</option>
          </select>
          <p v-if="!puedeCrear" class="text-sm text-red-600 dark:text-red-400 mt-1">Ya registraste los tres tipos de egreso en esta ruta.</p>
        </div>
        <div class="mb-4">
          <label class="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Valor</label>
          <input v-model.number="valor" type="number" min="1" class="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition text-gray-900 dark:text-gray-100" required />
        </div>
        <div class="mb-4" v-if="tipo === 'Gastos varios'">
          <label class="block font-semibold mb-1 text-gray-900 dark:text-gray-100">Descripción</label>
          <input v-model="descripcion" type="text" class="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition text-gray-900 dark:text-gray-100" placeholder="¿En qué se gastó?" required />
        </div>
        <button type="submit" :disabled="!puedeCrear" class="w-full bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded font-bold hover:bg-green-700 transition">Registrar egreso</button>
      </form>
      <div v-if="rutaAbierta || cargandoRuta" class="bg-white dark:bg-gray-800 rounded shadow p-6 transition-colors duration-300">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Movimientos de la ruta activa</h2>
        <div v-if="loading" class="text-center text-gray-700 dark:text-gray-300">Cargando movimientos...</div>
        <div v-else-if="egresos.length === 0" class="text-center text-gray-500 dark:text-gray-400">No hay movimientos registrados en esta ruta.</div>
        <div v-else class="space-y-3">
          <!-- Resumen de movimientos -->
          <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4 transition-colors duration-300">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-semibold text-green-600 dark:text-green-400">💰 Retiros:</span>
                <span class="ml-2 font-bold text-green-700 dark:text-green-300">${{ calcularTotalRetiros() }}</span>
              </div>
              <div>
                <span class="font-semibold text-red-600 dark:text-red-400">🛒 Egresos:</span>
                <span class="ml-2 font-bold text-red-700 dark:text-red-300">${{ calcularTotalEgresos() }}</span>
              </div>
            </div>
          </div>
          
          <!-- Lista de movimientos -->
          <div v-for="e in egresos" :key="e._id" 
               :class="[
                 'border rounded p-3 flex flex-col gap-1 transition-colors duration-300',
                 e.tipo === 'Retiro de caja' ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
               ]">
            <div class="flex items-center gap-2">
              <span v-if="e.tipo === 'Retiro de caja'" class="text-red-600 dark:text-red-400 font-bold">💰 {{ e.tipo }}</span>
              <span v-else-if="e.tipo === 'Comisiones'" class="text-blue-600 dark:text-blue-400 font-semibold">💼 {{ e.tipo }}</span>
              <span v-else class="text-gray-600 dark:text-gray-300 font-semibold">🛒 {{ e.tipo }}</span>
              <span v-if="e.descripcion" class="text-gray-500 dark:text-gray-400 text-sm">- {{ e.descripcion }}</span>
            </div>
            <div class="text-gray-700 dark:text-gray-300">Valor: <span class="font-bold">${{ e.valor }}</span></div>
            <div class="text-gray-500 dark:text-gray-400 text-xs">Fecha: {{ formatFecha(e.fecha) }}</div>
            <div class="flex gap-2 mt-2">
              <button @click="editarEgreso(e)" class="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm">Editar</button>
              <button @click="eliminarEgreso(e)" class="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm">Eliminar</button>
            </div>
          </div>

          <!-- Modal edición -->
          <div v-if="modal.visible" class="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Editar egreso</h3>
              <div class="mb-3">
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                <input v-model.number="modal.valor" type="number" min="1" class="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div class="mb-4">
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <input v-model="modal.descripcion" type="text" class="w-full border-2 border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div class="flex justify-end gap-2">
                <button @click="modal.visible=false" class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
                <button @click="guardarEdicion" class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Guardar</button>
              </div>
            </div>
          </div>
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

import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import NavbarVendedor from '../components/NavbarVendedor.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { consultarEstadoRuta } from '../utils/rutaUtils.js';

const tipo = ref('Retiro de caja');
const valor = ref(0);
const descripcion = ref('');
const egresos = ref([]);
const loading = ref(true);
const mostrarModalCerrarRuta = ref(false);
const mostrarModalAbrirRuta = ref(false);
const router = useRouter();
const rutaAbierta = ref(false);
const cargandoRuta = ref(true);
const modal = ref({ visible: false, egreso: null, valor: 0, descripcion: '' })
const puedeCrear = ref(true)
let pollingInterval = null

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
    const estadoRuta = await consultarEstadoRuta();
    rutaAbierta.value = estadoRuta.abierta;
    cargandoRuta.value = estadoRuta.cargando;
    await fetchEgresos();
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-cerrada'));
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
    const estadoRuta = await consultarEstadoRuta();
    rutaAbierta.value = estadoRuta.abierta;
    cargandoRuta.value = estadoRuta.cargando;
    await fetchEgresos();
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-abierta'));
    alert('Ruta abierta exitosamente');
  } else {
    alert('No se pudo abrir la ruta');
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false;
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
  const estadoRuta = await consultarEstadoRuta();
  rutaAbierta.value = estadoRuta.abierta;
  cargandoRuta.value = estadoRuta.cargando;
  const ruta = estadoRuta.ruta;
  if (!ruta || !ruta._id) {
    egresos.value = [];
    loading.value = false;
    return;
  }
  console.log('📋 Cargando egresos desde la base de datos...');
  // Forzar recarga desde la base de datos, evitando caché con timestamp
  const timestamp = new Date().getTime()
  const res = await fetch(`${API_BASE_URL}/api/egresos?vendedor=${vendedorId}&ruta=${ruta._id}&_t=${timestamp}`, {
    cache: 'no-store'
  });
  egresos.value = await res.json();
  console.log(`✅ Egresos cargados: ${egresos.value.length}`);
  puedeCrear.value = egresos.value.length < 3;
  loading.value = false;
}

onMounted(async () => {
  await fetchEgresos();
});

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

function yaExiste(nombreTipo) {
  return egresos.value.some(e => e.tipo === nombreTipo);
}

function editarEgreso(e) {
  modal.value = { visible: true, egreso: e, valor: e.valor, descripcion: e.descripcion || '' };
}

async function guardarEdicion() {
  const e = modal.value.egreso;
  if (!e) return;
  const res = await fetch(`${API_BASE_URL}/api/egresos/${e._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valor: Number(modal.value.valor), descripcion: modal.value.descripcion })
  });
  if (res.ok) {
    modal.value.visible = false;
    await fetchEgresos();
  } else {
    alert('Error al actualizar egreso');
  }
}

async function eliminarEgreso(e) {
  if (!confirm('¿Eliminar este egreso?')) return;
  const res = await fetch(`${API_BASE_URL}/api/egresos/${e._id}`, { method: 'DELETE' });
  if (res.ok) {
    await fetchEgresos();
  } else {
    alert('Error al eliminar egreso');
  }
}

onMounted(async () => {
  // Consultar estado de la ruta
  const estadoRuta = await consultarEstadoRuta()
  rutaAbierta.value = estadoRuta.abierta
  cargandoRuta.value = estadoRuta.cargando
  
  // Cargar datos iniciales
  await fetchEgresos()
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('egreso-registrado', actualizarEgresos)
  window.addEventListener('egreso-editado', actualizarEgresos)
  window.addEventListener('egreso-eliminado', actualizarEgresos)
  window.addEventListener('ruta-cerrada', actualizarEgresos)
  window.addEventListener('ruta-abierta', actualizarEgresos)
});

// Función para actualizar egresos cuando sea necesario
function actualizarEgresos() {
  console.log('🔄 Actualizando egresos por evento...')
  fetchEgresos()
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('egreso-registrado', actualizarEgresos)
  window.removeEventListener('egreso-editado', actualizarEgresos)
  window.removeEventListener('egreso-eliminado', actualizarEgresos)
  window.removeEventListener('ruta-cerrada', actualizarEgresos)
  window.removeEventListener('ruta-abierta', actualizarEgresos)
})
</script>

<style scoped>
</style> 
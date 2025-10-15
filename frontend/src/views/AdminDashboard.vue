<template>
  <div class="min-h-screen bg-gray-100">
    <NavbarAdmin @logout="logout" />
    <div class="flex h-[calc(100vh-64px)]"> <!-- 64px es la altura de la navbar -->
      <!-- Menú lateral izquierdo -->
      <div class="w-80 md:w-64 sm:w-40 bg-white h-full flex flex-col justify-between flex-shrink-0 border-r border-gray-200">
        <div class="pl-6 pt-6 flex flex-col gap-4">
          <!-- Menú desplegable de rutas con iconos -->
          <div class="flex flex-col gap-3">
            <button @click="mostrarPais = !mostrarPais" class="flex items-center text-lg font-semibold focus:outline-none gap-2">
              <GlobeAltIcon class="w-5 h-5 text-blue-500" />
              País
              <ChevronDownIcon :class="{'transform rotate-180': mostrarPais}" class="w-4 h-4 ml-2 transition-transform" />
            </button>
            <div v-if="mostrarPais" class="ml-6 mt-1 flex flex-col gap-2">
              <button @click="mostrarCiudad = !mostrarCiudad" class="flex items-center text-base font-medium focus:outline-none gap-2">
                <BuildingOffice2Icon class="w-5 h-5 text-green-500" />
                Ciudad
                <ChevronDownIcon :class="{'transform rotate-180': mostrarCiudad}" class="w-4 h-4 ml-2 transition-transform" />
              </button>
              <div v-if="mostrarCiudad" class="ml-8 mt-1 flex flex-col gap-2">
                <div v-if="vendedores.length > 0">
                  <div v-for="(v, idx) in vendedores" :key="idx" class="py-1 cursor-pointer hover:underline flex items-center gap-2 pr-2" @click="seleccionarVendedor(v)">
                    <UserIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span class="truncate">{{ v.nombre }}</span>
                  </div>
                </div>
                <div v-else class="text-gray-500 italic">No hay vendedores registrados.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Panel lateral derecho de información del vendedor -->
      <div class="flex-1 bg-gray-100 h-full p-8 border-l border-gray-200">
        <transition name="fade">
          <div v-if="vendedorSeleccionado">
            <div class="flex justify-end gap-2">
              <button @click="actualizarPanel" class="text-gray-400 hover:text-blue-500" title="Actualizar">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.974 7.974 0 0112 4c2.042 0 3.899.767 5.318 2.018M18.418 15A7.974 7.974 0 0112 20a7.974 7.974 0 01-5.318-2.018" />
                </svg>
              </button>
              <button 
                v-if="!editandoValores" 
                @click="iniciarEdicion" 
                class="text-gray-400 hover:text-green-500" 
                title="Editar valores"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                v-if="editandoValores" 
                @click="guardarValores" 
                class="text-gray-400 hover:text-green-500" 
                title="Guardar cambios"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button 
                v-if="editandoValores" 
                @click="cancelarEdicion" 
                class="text-gray-400 hover:text-red-500" 
                title="Cancelar edición"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button @click="vendedorSeleccionado = null" class="text-gray-400 hover:text-red-500">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
            <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
              <UserIcon class="w-7 h-7 text-blue-500" />
              {{ resumenPanel?.vendedor?.nombre || vendedorSeleccionado.nombre }}
            </h2>
            <div v-if="resumenPanel" class="space-y-2">
              <div class="flex items-center gap-2">
                <CalendarDaysIcon class="w-5 h-5 text-gray-400" />
                <span class="font-semibold">Fecha apertura recaudo:</span>
                <span class="text-gray-500">
                  <span v-if="resumenPanel.ruta?.fechaApertura" class="bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono">
                    {{ new Date(resumenPanel.ruta.fechaApertura).toLocaleString('es-ES') }}
                  </span>
                  <span v-else>-</span>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <CalendarDaysIcon class="w-5 h-5 text-gray-400" />
                <span class="font-semibold">Fecha cierre:</span>
                <span class="text-gray-500">
                  <span v-if="resumenPanel.ruta?.fechaCierre" class="bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono">
                    {{ new Date(resumenPanel.ruta.fechaCierre).toLocaleString('es-ES') }}
                  </span>
                  <span v-else class="italic">No se ha cerrado</span>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <UsersIcon class="w-5 h-5 text-green-500" />
                <span class="font-semibold">Clientes:</span>
                <span class="text-gray-500">{{ resumenPanel.clientes?.length ?? 0 }}</span>
              </div>
              <div class="ml-8 text-sm text-gray-600">
                <div>Nuevos: {{ resumenPanel.resumen?.nuevos ?? 0 }}</div>
                <div>Renovados: {{ resumenPanel.resumen?.renovados ?? 0 }}</div>
                <div>Cancelados: {{ resumenPanel.resumen?.cancelados ?? 0 }}</div>
              </div>
              <div class="flex items-center gap-2">
                <CurrencyDollarIcon class="w-5 h-5 text-green-600" />
                <span class="font-semibold">Recaudo actual:</span>
                <span class="text-gray-500">${{ (resumenPanel.ruta?.recaudado || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-yellow-500" />
                <span class="font-semibold">Caja inicial:</span>
                <input 
                  v-if="editandoValores" 
                  v-model.number="valoresEditables.cajaInicial" 
                  type="number" 
                  step="0.01" 
                  class="w-24 px-2 py-1 border rounded text-sm"
                />
                <span v-else class="text-gray-500">${{ (resumenPanel.ruta?.cajaInicial || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <WalletIcon class="w-5 h-5 text-indigo-500" />
                <span class="font-semibold">Cartera inicial:</span>
                <input 
                  v-if="editandoValores" 
                  v-model.number="valoresEditables.carteraInicial" 
                  type="number" 
                  step="0.01" 
                  class="w-24 px-2 py-1 border rounded text-sm"
                />
                <span v-else class="text-gray-500">${{ (resumenPanel.ruta?.carteraInicial || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <ChartBarIcon class="w-5 h-5 text-blue-500" />
                <span class="font-semibold">Recaudo pretendido del día:</span>
                <span class="text-gray-500">${{ (resumenPanel.ruta?.recaudadoPretendido || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <ArrowTrendingUpIcon class="w-5 h-5 text-green-500" />
                <span class="font-semibold">Ingresos:</span>
                <span class="text-gray-500">${{ (resumenPanel.ruta?.ingresos || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <ShoppingCartIcon class="w-5 h-5 text-blue-500" />
                <span class="font-semibold">Ventas:</span>
                <span class="text-gray-500">${{ (resumenPanel.ruta?.ventas || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <ArrowTrendingDownIcon class="w-5 h-5 text-red-500" />
                <span class="font-semibold">Retiros:</span>
                <span class="text-gray-500">${{ (resumenPanel.ruta?.retiros || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <ReceiptRefundIcon class="w-5 h-5 text-red-400" />
                <span class="font-semibold">Egresos:</span>
                <span class="text-gray-500">${{ (resumenPanel.ruta?.egresos || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-green-700" />
                <span class="font-semibold">Caja final:</span>
                <span class="text-gray-500">${{ (resumenPanel.ruta?.cajaFinal || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <WalletIcon class="w-5 h-5 text-indigo-700" />
                <span class="font-semibold">Cartera final:</span>
                <span class="text-gray-500">${{ (resumenPanel.ruta?.carteraFinal || 0).toFixed(2) }}</span>
              </div>
            </div>
            <div v-else class="text-gray-400">Cargando información...</div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import API_BASE_URL from '../config/api.js'
import { 
  GlobeAltIcon, 
  BuildingOffice2Icon, 
  UserIcon, 
  ArrowLeftOnRectangleIcon, 
  ChevronDownIcon, 
  XMarkIcon, 
  CalendarDaysIcon, 
  UsersIcon, 
  BanknotesIcon, 
  WalletIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ReceiptRefundIcon 
} from '@heroicons/vue/24/outline'
import NavbarAdmin from '../components/NavbarAdmin.vue'

const router = useRouter()
const mostrarPais = ref(false)
const mostrarCiudad = ref(false)
const vendedores = ref([])
const vendedorSeleccionado = ref(null)
const resumenPanel = ref(null)
const editandoValores = ref(false)
const valoresEditables = ref({
  cajaInicial: 0,
  carteraInicial: 0
})

// Cargar vendedores al montar
onMounted(async () => {
  try {
    // Obtener código de vinculación desde localStorage
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    if (!codigoVinculacion) {
      console.error('No se encontró código de vinculación')
      return
    }
    
    const resVend = await fetch(`${API_BASE_URL}/api/vendedores?codigoVinculacion=${codigoVinculacion}`)
    vendedores.value = resVend.ok ? await resVend.json() : []
  } catch (e) {
    console.error('Error al cargar vendedores:', e)
    vendedores.value = []
  }
})

function logout() {
  localStorage.removeItem('rol')
  localStorage.removeItem('adminId')
  localStorage.removeItem('codigoVinculacion')
  router.push('/')
}

async function seleccionarVendedor(v) {
  vendedorSeleccionado.value = { ...v }
  resumenPanel.value = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendedores/${v._id}/panel`)
    resumenPanel.value = await res.json()
  } catch (e) {
    resumenPanel.value = null
  }
}

async function actualizarPanel() {
  if (!vendedorSeleccionado.value) return;
  resumenPanel.value = null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendedores/${vendedorSeleccionado.value._id}/panel`)
    resumenPanel.value = await res.json()
  } catch (e) {
    resumenPanel.value = null
  }
}

function iniciarEdicion() {
  if (resumenPanel.value?.ruta) {
    valoresEditables.value = {
      cajaInicial: resumenPanel.value.ruta.cajaInicial || 0,
      carteraInicial: resumenPanel.value.ruta.carteraInicial || 0
    }
  }
  editandoValores.value = true
}

function cancelarEdicion() {
  editandoValores.value = false
}

async function guardarValores() {
  if (!vendedorSeleccionado.value) return
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendedores/${vendedorSeleccionado.value._id}/ruta`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(valoresEditables.value)
    })
    
    if (res.ok) {
      editandoValores.value = false
      await actualizarPanel() // Actualizar el panel con los nuevos valores
    } else {
      alert('Error al guardar los valores')
    }
  } catch (e) {
    alert('Error al guardar los valores')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
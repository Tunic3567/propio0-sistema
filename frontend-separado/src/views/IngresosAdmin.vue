<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-50 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    
    <div class="max-w-6xl mx-auto p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-neutral-200 dark:border-slate-600 p-6 transition-theme">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-slate-100 mb-6">{{ $t('nav.income') }} - {{ $t('admin.title') }}</h1>
        
        <!-- Filtros -->
        <div class="bg-blue-50 dark:bg-slate-700/50 border-2 border-blue-200 dark:border-slate-600 rounded-xl p-4 mb-6 transition-theme">
          <h2 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">Filtros</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">{{ $t('admin.vendors') }}</label>
              <select
                v-model="filtros.vendedor"
                class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-theme"
                @change="aplicarFiltros"
              >
                <option value="">{{ $t('admin.allVendors') }}</option>
                <option v-for="vendedor in vendedores" :key="vendedor._id" :value="vendedor._id">
                  {{ vendedor.nombre }} ({{ vendedor.ciudad }})
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">{{ $t('admin.routes') }}</label>
              <select
                v-model="filtros.ruta"
                class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-theme"
                @change="aplicarFiltros"
              >
                <option value="">{{ $t('admin.allRoutes') || 'Todas las rutas' }}</option>
                <option v-for="ruta in rutas" :key="ruta._id" :value="ruta._id">
                  {{ new Date(ruta.fechaApertura).toLocaleDateString('es-ES') }} - {{ ruta.abierta ? 'Abierta' : 'Cerrada' }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">{{ $t('payment.type') }}</label>
              <select
                v-model="filtros.tipo"
                class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-theme"
                @change="aplicarFiltros"
              >
                <option value="">{{ $t('history.allTypes') }}</option>
                <option value="Base">Base</option>
                <option value="Otros ingresos">Otros ingresos</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Lista de ingresos -->
        <div class="bg-green-50 dark:bg-slate-700/30 border-2 border-green-200 dark:border-slate-600 rounded-xl p-4 transition-theme">
          <h2 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">Ingresos Registrados</h2>
          
          <div v-if="ingresos.length === 0" class="text-neutral-500 dark:text-slate-400 text-center py-8">
            {{ $t('income.noMatch') || 'No hay ingresos que coincidan con los filtros' }}
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="ingreso in ingresos"
              :key="ingreso._id"
              class="bg-white dark:bg-slate-700/50 border-2 border-green-200 dark:border-slate-600 rounded-xl p-4 transition-theme"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-neutral-700 dark:text-slate-200">{{ ingreso.tipo }}</span>
                    <span class="text-xs text-neutral-500 dark:text-slate-400">{{ new Date(ingreso.fecha).toLocaleString('es-ES') }}</span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="font-medium text-neutral-800 dark:text-slate-200">{{ $t('admin.vendors') }}:</span>
                      <span class="text-neutral-700 dark:text-slate-300 ml-2">{{ ingreso.vendedor?.nombre || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="font-medium text-neutral-800 dark:text-slate-200">{{ $t('admin.city') }}:</span>
                      <span class="text-neutral-700 dark:text-slate-300 ml-2">{{ ingreso.vendedor?.ciudad || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="font-medium text-neutral-800 dark:text-slate-200">Ruta:</span>
                      <span class="text-neutral-700 dark:text-slate-300 ml-2">
                        {{ ingreso.ruta ? new Date(ingreso.ruta.fechaApertura).toLocaleDateString('es-ES') : 'N/A' }}
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="ingreso.descripcion" class="mt-2 text-sm text-neutral-600 dark:text-slate-300">
                    <span class="font-medium">{{ $t('income.description') }}:</span> {{ ingreso.descripcion }}
                  </div>
                </div>
                
                <div class="text-right ml-4">
                  <div class="text-xl font-bold text-green-700 dark:text-green-400">
                    ${{ ingreso.valor.toFixed(2) }}
                  </div>
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

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavbarAdmin from '../components/NavbarAdmin.vue'

const router = useRouter()
const ingresos = ref([])
const vendedores = ref([])
const rutas = ref([])
const filtros = ref({
  vendedor: '',
  ruta: '',
  tipo: ''
})

// Cargar datos al montar
onMounted(async () => {
  await Promise.all([
    cargarVendedores(),
    cargarRutas(),
    cargarIngresos()
  ])
})

async function cargarVendedores() {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    const url = codigoVinculacion
      ? `${API_BASE_URL}/api/vendedores?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
      : `${API_BASE_URL}/api/vendedores`
    const res = await fetch(url)
    if (res.ok) {
      vendedores.value = await res.json()
    }
  } catch (error) {
    console.error('Error al cargar asesores:', error)
  }
}

async function cargarRutas() {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    const url = codigoVinculacion
      ? `${API_BASE_URL}/api/admin/rutas?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
      : `${API_BASE_URL}/api/rutas`
    const res = await fetch(url)
    if (res.ok) {
      rutas.value = await res.json()
    }
  } catch (error) {
    console.error('Error al cargar rutas:', error)
  }
}

async function cargarIngresos() {
  try {
    const params = new URLSearchParams()
    const codigo = localStorage.getItem('codigoVinculacion')
    if (codigo) params.append('codigoVinculacion', codigo)
    if (filtros.value.vendedor) params.append('vendedor', filtros.value.vendedor)
    if (filtros.value.ruta) params.append('ruta', filtros.value.ruta)
    if (filtros.value.tipo) params.append('tipo', filtros.value.tipo)

    const res = await fetch(`${API_BASE_URL}/api/ingresos?${params.toString()}`)
    if (res.ok) {
      ingresos.value = await res.json()
    }
  } catch (error) {
    console.error('Error al cargar ingresos:', error)
    ingresos.value = []
  }
}

async function aplicarFiltros() {
  await cargarIngresos()
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
  } catch (e) {
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
</script> 
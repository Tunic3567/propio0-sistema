<template>
  <div class="min-h-screen bg-gray-50">
    <NavbarAdmin @logout="logout" />
    
    <div class="max-w-6xl mx-auto p-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Ingresos - Panel Administrativo</h1>
        
        <!-- Filtros -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-blue-800 mb-4">Filtros</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
              <select 
                v-model="filtros.vendedor" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="aplicarFiltros"
              >
                <option value="">Todos los vendedores</option>
                <option v-for="vendedor in vendedores" :key="vendedor._id" :value="vendedor._id">
                  {{ vendedor.nombre }} ({{ vendedor.ciudad }})
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ruta</label>
              <select 
                v-model="filtros.ruta" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="aplicarFiltros"
              >
                <option value="">Todas las rutas</option>
                <option v-for="ruta in rutas" :key="ruta._id" :value="ruta._id">
                  {{ new Date(ruta.fechaApertura).toLocaleDateString('es-ES') }} - {{ ruta.abierta ? 'Abierta' : 'Cerrada' }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select 
                v-model="filtros.tipo" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="aplicarFiltros"
              >
                <option value="">Todos los tipos</option>
                <option value="Base">Base</option>
                <option value="Otros ingresos">Otros ingresos</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Lista de ingresos -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 class="text-lg font-semibold text-green-800 mb-4">Ingresos Registrados</h2>
          
          <div v-if="ingresos.length === 0" class="text-gray-500 text-center py-8">
            No hay ingresos que coincidan con los filtros
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="ingreso in ingresos" 
              :key="ingreso._id"
              class="bg-white border border-green-200 rounded-lg p-4"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-gray-600">{{ ingreso.tipo }}</span>
                    <span class="text-xs text-gray-400">{{ new Date(ingreso.fecha).toLocaleString('es-ES') }}</span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span class="font-medium text-gray-700">Vendedor:</span>
                      <span class="text-gray-600 ml-2">{{ ingreso.vendedor?.nombre || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700">Ciudad:</span>
                      <span class="text-gray-600 ml-2">{{ ingreso.vendedor?.ciudad || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700">Ruta:</span>
                      <span class="text-gray-600 ml-2">
                        {{ ingreso.ruta ? new Date(ingreso.ruta.fechaApertura).toLocaleDateString('es-ES') : 'N/A' }}
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="ingreso.descripcion" class="mt-2 text-sm text-gray-600">
                    <span class="font-medium">Descripción:</span> {{ ingreso.descripcion }}
                  </div>
                </div>
                
                <div class="text-right ml-4">
                  <div class="text-xl font-bold text-green-600">
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
    const res = await fetch(`${API_BASE_URL}/api/vendedores`)
    if (res.ok) {
      vendedores.value = await res.json()
    }
  } catch (error) {
    console.error('Error al cargar vendedores:', error)
  }
}

async function cargarRutas() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rutas`)
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
</script> 